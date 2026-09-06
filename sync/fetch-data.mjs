/**
 * 飞书多维表格 → data/data.json 同步脚本（零依赖，Node 18+）
 *
 * 用法：
 *   FEISHU_APP_ID=xxx FEISHU_APP_SECRET=xxx BITABLE_URL="https://xxx.feishu.cn/base/xxxx?table=tblxxxx" node sync/fetch-data.mjs
 * 也可以用 BITABLE_APP_TOKEN 和 BITABLE_TABLE_ID 代替 BITABLE_URL。
 *
 * 若未配置凭证：打印提示并以 0 退出（保留现有 data.json，部署流程不受影响）。
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "data", "data.json");

/* ================= 站点配置（按需修改） ================= */
const SITE = {
  guildName: "妖精的尾巴",
  gameName: "冒险岛手游",
  slogan: "五大职业齐聚 · 冒险永不独行",
  totalSeats: 50,
  // 入群二维码图片链接（可选）：把二维码截图上传后填直链
  qrImage: "",
  groupInfo: "YY / 微信群",
  giftCatalog: ["皇家美发卡", "皇家整容卷", "58万游戏币"],
};

/* ============ 多维表格字段映射（改成你表里的实际列名） ============ */
const FIELDS = {
  name: "游戏ID",        // 成员名
  class: "职业",         // 战士/飞侠/魔法师/弓箭手/海盗
  level: "等级",         // 数字
  onlineTime: "日均在线时长",
  styles: "游戏风格",    // 多选
  needs: "家族需求",     // 多选
  gift: "入族好礼",      // 单选
};

/* ================= 主流程 ================= */
const APP_ID = process.env.FEISHU_APP_ID;
const APP_SECRET = process.env.FEISHU_APP_SECRET;

if (!APP_ID || !APP_SECRET) {
  console.warn("⚠️  未配置 FEISHU_APP_ID / FEISHU_APP_SECRET，跳过同步，保留现有 public/data/data.json");
  process.exit(0);
}

try {
  const token = await getTenantAccessToken(APP_ID, APP_SECRET);
  const { appToken, tableId } = await resolveBitable(process.env, token);
  if (!appToken || !tableId) {
    console.warn("⚠️  无法解析多维表格地址（BITABLE_URL 或 BITABLE_APP_TOKEN/BITABLE_TABLE_ID），跳过同步");
    process.exit(0);
  }
  const records = await fetchAllRecords(token, appToken, tableId);
  const members = records.map(recordToMember).filter(Boolean);

  const json = buildJson(members);
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(json, null, 2), "utf8");
  console.log(`✅ 同步完成：${members.length} 条成员记录 → data/data.json`);
} catch (err) {
  console.error("❌ 同步失败：", err.message);
  // 不以非 0 退出，避免部署流程被一次接口抖动卡死；如需严格失败可改为 process.exit(1)
  process.exit(0);
}

/* ================= 函数 ================= */

/** 从环境变量解析 app_token（base id）与 table_id；支持 /base/ 和 /wiki/ 两种链接 */
async function resolveBitable(env, token) {
  let appToken = env.BITABLE_APP_TOKEN || "";
  let tableId = env.BITABLE_TABLE_ID || "";
  const url = env.BITABLE_URL;
  if (url) {
    const mApp = url.match(/\/base\/([A-Za-z0-9]+)/);
    const mWiki = url.match(/\/wiki\/([A-Za-z0-9]+)/);
    const mTable = url.match(/[?&]table=([A-Za-z0-9]+)/);
    if (mApp) appToken = appToken || mApp[1];
    if (mTable) tableId = tableId || mTable[1];
    // wiki 链接需要先把 wiki token 转成多维表格的 app_token
    if (mWiki && !appToken) {
      const wikiToken = mWiki[1];
      const res = await fetch(
        `https://open.feishu.cn/open-apis/wiki/v2/spaces/get_node?token=${wikiToken}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.code !== 0) throw new Error(`wiki 链接解析失败: ${data.code} ${data.msg}`);
      appToken = data.data?.node?.obj_token || "";
      console.log(`ℹ️  wiki 链接已转换为多维表格 app_token: ${appToken}`);
    }
  }
  return { appToken, tableId };
}

/** 获取 tenant_access_token */
async function getTenantAccessToken(appId, appSecret) {
  const res = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(`获取 token 失败: ${data.code} ${data.msg}`);
  return data.tenant_access_token;
}

/** 分页拉取全部记录 */
async function fetchAllRecords(token, appToken, tableId) {
  const fieldNames = [...new Set(Object.values(FIELDS))];
  const records = [];
  let pageToken = "";
  do {
    const res = await fetch(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/search?page_size=500${pageToken ? `&page_token=${pageToken}` : ""}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ field_names: fieldNames }),
      }
    );
    const data = await res.json();
    if (data.code !== 0) throw new Error(`拉取记录失败: ${data.code} ${data.msg}（请检查应用是否有该表格权限）`);
    records.push(...(data.data?.items || []));
    pageToken = data.data?.page_token || "";
    if (!data.data?.has_more) break;
  } while (pageToken);
  return records;
}

/** 把一条记录转成页面需要的成员对象 */
function recordToMember(item) {
  const f = item.fields || {};
  const name = norm(f[FIELDS.name]);
  if (!name) return null; // 跳过没有名字的空行
  const levelRaw = norm(f[FIELDS.level]);
  return {
    name: String(name),
    class: String(norm(f[FIELDS.class]) || "未分职业"),
    level: isNaN(+levelRaw) ? levelRaw || "?" : +levelRaw,
    onlineTime: String(norm(f[FIELDS.onlineTime]) || "未知"),
    styles: toList(f[FIELDS.styles]),
    needs: toList(f[FIELDS.needs]),
    gift: String(norm(f[FIELDS.gift]) || ""),
  };
}

/** 用最新数据重建 data.json（站点配置保留在脚本里） */
function buildJson(members) {
  let prevQr = "";
  if (existsSync(OUT)) {
    try {
      const prev = JSON.parse(readFileSync(OUT, "utf8"));
      prevQr = prev.config?.qrImage || "";
    } catch {
      /* 忽略旧文件解析错误 */
    }
  }
  return {
    updatedAt: new Date().toISOString(),
    config: {
      guildName: SITE.guildName,
      gameName: SITE.gameName,
      slogan: SITE.slogan,
      totalSeats: SITE.totalSeats,
      qrImage: SITE.qrImage || prevQr,
      groupInfo: SITE.groupInfo,
      classOrder: ["战士", "飞侠", "魔法师", "弓箭手", "海盗"],
      giftCatalog: SITE.giftCatalog,
    },
    members,
  };
}

/** 归一化字段值：文本/数字/单选/人员/日期等统一取可读文本 */
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

/** 多选/数组字段 → 字符串数组 */
function toList(v) {
  if (!v) return [];
  const arr = Array.isArray(v) ? v : [v];
  return arr.map((x) => String(typeof x === "object" && x?.text ? x.text : x).trim()).filter(Boolean);
}
