/**
 * 妖精的尾巴家族招募 - Cloudflare Worker 实时数据接口
 *
 * 作用：浏览器 → Worker → 飞书多维表格（解决 CORS + 隐藏凭证）
 * 缓存：内存缓存 45 秒，避免频繁调用飞书接口触发限流
 *
 * 部署步骤（本机装 Node 后）：
 *   1. npm install -g wrangler
 *   2. wrangler login
 *   3. 在 worker/ 目录执行：
 *      wrangler secret put FEISHU_APP_ID
 *      wrangler secret put FEISHU_APP_SECRET
 *      wrangler secret put BITABLE_APP_TOKEN
 *      wrangler secret put BITABLE_TABLE_ID
 *   4. wrangler deploy
 *   5. 把返回的访问地址（https://<name>.<子域>.workers.dev/api/data）
 *      填到 src/data/config.ts 的 DATA_API_URL
 */

const CACHE_TTL_MS = 45 * 1000; // 45秒内存缓存（30-60秒区间内）

// 与 sync/fetch-data.mjs 保持一致的字段映射（改成你表里的实际列名）
const FIELDS = {
  name: "游戏ID",
  class: "职业",
  level: "等级",
  onlineTime: "日均在线时长",
  styles: "游戏风格",
  needs: "家族需求",
  gift: "入族好礼",
};

const SITE = {
  guildName: "妖精的尾巴",
  gameName: "冒险岛手游",
  slogan: "五大职业齐聚 · 冒险永不独行",
  totalSeats: 50,
  groupInfo: "YY / 微信群",
  giftCatalog: ["皇家美发卡", "皇家整容卷", "58万游戏币"],
  classOrder: ["战士", "飞侠", "魔法师", "弓箭手", "海盗"],
};

let cache = { at: 0, body: null };

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }
    const url = new URL(request.url);
    if (url.pathname !== "/api/data") {
      return new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // 命中缓存直接返回
    if (cache.body && Date.now() - cache.at < CACHE_TTL_MS) {
      return new Response(cache.body, {
        headers: { ...CORS, "Content-Type": "application/json", "X-Cache": "HIT" },
      });
    }

    try {
      const data = await buildPayload(env);
      cache = { at: Date.now(), body: JSON.stringify(data) };
      return new Response(cache.body, {
        headers: { ...CORS, "Content-Type": "application/json", "X-Cache": "MISS" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err && err.message) }), {
        status: 502,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }
  },
};

/* ================= 飞书调用 ================= */
async function getTenantAccessToken(appId, appSecret) {
  const res = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(`获取token失败: ${data.code} ${data.msg}`);
  return data.tenant_access_token;
}

async function fetchAllRecords(token, appToken, tableId) {
  const fieldNames = [...new Set(Object.values(FIELDS))];
  const records = [];
  let pageToken = "";
  do {
    const res = await fetch(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/search?page_size=500${pageToken ? `&page_token=${pageToken}` : ""}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ field_names: fieldNames }),
      }
    );
    const data = await res.json();
    if (data.code !== 0) throw new Error(`拉取记录失败: ${data.code} ${data.msg}`);
    records.push(...(data.data?.items || []));
    pageToken = data.data?.page_token || "";
    if (!data.data?.has_more) break;
  } while (pageToken);
  return records;
}

function norm(v) {
  if (v == null) return "";
  if (Array.isArray(v)) return v.map(norm).filter(Boolean).join("、");
  if (typeof v === "object") {
    if (typeof v.text === "string") return v.text;
    if (typeof v.name === "string") return v.name;
    if (typeof v.value === "string" || typeof v.value === "number") return v.value;
    if ("timestamp" in v) {
      const ts = +v.timestamp;
      return ts > 0 ? new Date(ts).toISOString().slice(0, 10) : "";
    }
    return "";
  }
  return v;
}

function toList(v) {
  if (!v) return [];
  const arr = Array.isArray(v) ? v : [v];
  return arr.map((x) => String(typeof x === "object" && x?.text ? x.text : x).trim()).filter(Boolean);
}

async function buildPayload(env) {
  const appId = env.FEISHU_APP_ID;
  const appSecret = env.FEISHU_APP_SECRET;
  const appToken = env.BITABLE_APP_TOKEN;
  const tableId = env.BITABLE_TABLE_ID;
  if (!appId || !appSecret || !appToken || !tableId) {
    throw new Error("Worker 缺少环境变量（FEISHU_APP_ID/SECRET/BITABLE_APP_TOKEN/TABLE_ID）");
  }

  const token = await getTenantAccessToken(appId, appSecret);
  const records = await fetchAllRecords(token, appToken, tableId);

  const members = records
    .map((item) => {
      const f = item.fields || {};
      const name = norm(f[FIELDS.name]);
      if (!name) return null;
      const level = Number(norm(f[FIELDS.level]));
      return {
        name: String(name),
        class: String(norm(f[FIELDS.class]) || "未分职业"),
        level: Number.isFinite(level) && level > 0 ? Math.round(level) : 0,
        onlineTime: String(norm(f[FIELDS.onlineTime]) || "未知"),
        styles: toList(f[FIELDS.styles]),
        needs: toList(f[FIELDS.needs]),
        gift: String(norm(f[FIELDS.gift]) || ""),
      };
    })
    .filter(Boolean);

  return {
    updatedAt: new Date().toISOString(),
    source: "worker",
    config: {
      guildName: SITE.guildName,
      gameName: SITE.gameName,
      slogan: SITE.slogan,
      totalSeats: SITE.totalSeats,
      qrImage: env.QR_IMAGE || "",
      groupInfo: SITE.groupInfo,
      classOrder: SITE.classOrder,
      giftCatalog: SITE.giftCatalog,
    },
    members,
  };
}
