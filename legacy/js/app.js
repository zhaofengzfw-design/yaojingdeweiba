/* 妖精的尾巴家族招募页 —— 数据全部来自 data/data.json（由飞书多维表格同步生成） */
const CLASS_META = {
  战士: { icon: "⚔️", color: "#e8622c" },
  飞侠: { icon: "🗡️", color: "#8e6bd8" },
  魔法师: { icon: "✨", color: "#3f8fd8" },
  弓箭手: { icon: "🏹", color: "#4caf6e" },
  海盗: { icon: "⚓", color: "#f5a623" },
};
const ONLINE_ORDER = ["肝帝", "8-12小时", "6-8小时", "3-6小时", "1-3小时", "1小时以内"];
let DATA = null;
let activeClass = "全部";
let keyword = "";

document.addEventListener("DOMContentLoaded", loadData);

async function loadData() {
  try {
    const res = await fetch("data/data.json?t=" + Date.now());
    DATA = await res.json();
    renderAll();
  } catch (e) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<div style="background:#ffe3d2;color:#c94a1a;padding:10px;text-align:center;font-size:.9rem">数据加载失败，请确认 data/data.json 是否存在</div>'
    );
  }
}

function renderAll() {
  const members = DATA.members || [];
  const cfg = DATA.config || {};
  document.title = `${cfg.guildName || "家族"} · 家族招募 | ${cfg.gameName || ""}`;

  // Hero
  if (cfg.slogan) document.getElementById("heroDesc").textContent = cfg.slogan;
  document.getElementById("heroMeta").innerHTML = `
    <span>👥 ${members.length} 位伙伴已经加入</span>
    <span>🎭 ${countBy(members, "class").size} 大职业齐聚</span>
    <span>⏳ 数据每小时自动同步</span>`;

  // 同步时间
  const t = DATA.updatedAt ? new Date(DATA.updatedAt) : new Date();
  const tStr = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())} ${pad(t.getHours())}:${pad(t.getMinutes())}`;
  document.getElementById("syncTime").textContent = `数据更新于 ${tStr}`;
  document.getElementById("footerTime").textContent = tStr;

  renderSeats(members, cfg);
  renderGifts(members, cfg);
  renderStats(members);
  renderClassChart(members, cfg);
  renderOnlineChart(members);
  renderFilterChips(members, cfg);
  renderMembers(members, cfg);
  renderInsights(members);
  renderJoin(members, cfg);
}

/* ---------- 席位 ---------- */
function renderSeats(members, cfg) {
  const total = cfg.totalSeats || 50;
  const joined = members.length;
  const left = Math.max(total - joined, 0);
  const pct = Math.min(Math.round((joined / total) * 100), 100);
  document.getElementById("seatCards").innerHTML = `
    <div class="seat-card crown"><div class="ico">👑</div><div class="label">总席位</div><div class="num">${total}</div><div class="hint">限定席位</div></div>
    <div class="seat-card users"><div class="ico">👥</div><div class="label">已加入</div><div class="num">${joined}</div><div class="hint">冒险伙伴</div></div>
    <div class="seat-card hot"><div class="ribbon">虚位以待</div><div class="ico">🙋</div><div class="label">剩余席位</div><div class="num">${left}</div><div class="hint">等你来加入</div></div>`;
  requestAnimationFrame(() => {
    document.getElementById("seatBar").style.width = pct + "%";
  });
  document.getElementById("seatPercent").textContent = `招募进度 ${pct}% ${left > 0 ? "· 还有 " + left + " 个位置等你！" : "· 席位已满！"}`;
}

/* ---------- 好礼 ---------- */
function renderGifts(members, cfg) {
  const counts = {};
  members.forEach((m) => {
    const g = m.gift || "未选择";
    counts[g] = (counts[g] || 0) + 1;
  });
  const catalog = cfg.giftCatalog && cfg.giftCatalog.length ? cfg.giftCatalog : Object.keys(counts);
  const list = catalog
    .map((name) => ({ name, count: counts[name] || 0 }))
    .sort((a, b) => b.count - a.count);
  const total = members.length || 1;
  const icons = ["💇", "💆", "💰", "🎁"];
  document.getElementById("giftCards").innerHTML = list
    .map(
      (g, i) => `
    <div class="gift-card">
      <div class="ico">${icons[i % icons.length]}</div>
      <h3>${g.name}</h3>
      <div class="num">${g.count} <small style="font-size:.9rem">人选择</small></div>
      <div class="pct">占比 ${Math.round((g.count / total) * 100)}%</div>
      <div class="bar"><i style="width:${(g.count / total) * 100}%"></i></div>
    </div>`
    )
    .join("");
}

/* ---------- 概览 ---------- */
function renderStats(members) {
  const levels = members.map((m) => +m.level).filter((n) => !isNaN(n));
  const avg = levels.length ? Math.round(levels.reduce((a, b) => a + b, 0) / levels.length) : 0;
  const max = levels.length ? Math.max(...levels) : 0;
  const stats = [
    { num: members.length, label: "家族成员" },
    { num: avg, label: "平均等级" },
    { num: max, label: "最高等级" },
    { num: countBy(members, "class").size, label: "覆盖职业数" },
  ];
  document.getElementById("statCards").innerHTML = stats
    .map((s) => `<div class="stat-card"><div class="num">${s.num}</div><div class="label">${s.label}</div></div>`)
    .join("");
}

/* ---------- 职业雷达图 ---------- */
function renderClassChart(members, cfg) {
  const classMap = countBy(members, "class");
  const order = cfg.classOrder && cfg.classOrder.length ? cfg.classOrder : [...classMap.keys()];
  const counts = order.map((c) => classMap.get(c) || 0);
  const el = document.getElementById("classChart");
  if (typeof echarts === "undefined") {
    // CDN 不可用时的降级：用横向条形图
    el.className = "chart-bars";
    el.innerHTML = order.map((c, i) => hbar(c, counts[i], Math.max(...counts, 1), CLASS_META[c]?.icon || "")).join("");
    return;
  }
  const chart = echarts.init(el);
  chart.setOption({
    radar: {
      indicator: order.map((c) => ({ name: c, max: Math.max(...counts, 5) })),
      radius: "65%",
      splitArea: { areaStyle: { color: ["#fffdf7", "#fdf4e0"] } },
      axisName: { color: "#8a6a4a", fontWeight: 600 },
    },
    series: [
      {
        type: "radar",
        data: [
          {
            value: counts,
            name: "职业人数",
            areaStyle: { color: "rgba(232, 98, 44, 0.35)" },
            lineStyle: { color: "#e8622c", width: 2.5 },
            itemStyle: { color: "#e8622c" },
            label: { show: true, color: "#c94a1a", fontWeight: 700 },
          },
        ],
      },
    ],
  });
  window.addEventListener("resize", () => chart.resize());
}

/* ---------- 在线时长 ---------- */
function renderOnlineChart(members) {
  const counts = {};
  members.forEach((m) => {
    const k = m.onlineTime || "未知";
    counts[k] = (counts[k] || 0) + 1;
  });
  const keys = Object.keys(counts).sort((a, b) => idx(ONLINE_ORDER, a) - idx(ONLINE_ORDER, b));
  const max = Math.max(...Object.values(counts), 1);
  document.getElementById("onlineChart").innerHTML = keys
    .map((k) => hbar(k, counts[k], max, "⏱"))
    .join("");
}

/* ---------- 成员 ---------- */
function renderFilterChips(members, cfg) {
  const classMap = countBy(members, "class");
  const order = cfg.classOrder && cfg.classOrder.length ? cfg.classOrder : [...classMap.keys()];
  const chips = ["全部", ...order.filter((c) => classMap.has(c))];
  const box = document.getElementById("classFilter");
  box.innerHTML = chips
    .map((c) => `<button class="chip ${c === activeClass ? "active" : ""}" data-class="${c}">${c}</button>`)
    .join("");
  box.querySelectorAll(".chip").forEach((btn) =>
    btn.addEventListener("click", () => {
      activeClass = btn.dataset.class;
      renderFilterChips(members, cfg);
      renderMembers(members, cfg);
    })
  );
}

function renderMembers(members, cfg) {
  const kw = keyword.trim().toLowerCase();
  const filtered = members.filter((m) => {
    const okClass = activeClass === "全部" || m.class === activeClass;
    const okKw = !kw || (m.name || "").toLowerCase().includes(kw);
    return okClass && okKw;
  });
  const classMap = countBy(filtered, "class");
  const order = cfg.classOrder && cfg.classOrder.length ? cfg.classOrder : [...classMap.keys()];
  const groups = order
    .map((c) => ({ c, list: filtered.filter((m) => m.class === c).sort((a, b) => (+b.level || 0) - (+a.level || 0)) }))
    .filter((g) => g.list.length);

  const box = document.getElementById("memberGroups");
  if (!groups.length) {
    box.innerHTML = '<div class="empty-tip">没有找到符合条件的成员 🧭</div>';
    return;
  }
  box.innerHTML = groups
    .map(
      (g) => `
    <div class="member-group">
      <div class="member-group-head">
        <div class="gico">${CLASS_META[g.c]?.icon || "🎮"}</div>
        <h3>${g.c}</h3><span class="count">（${g.list.length}人）</span>
      </div>
      <div class="member-grid">
        ${g.list.map(memberCard).join("")}
      </div>
    </div>`
    )
    .join("");
}

function memberCard(m) {
  const meta = CLASS_META[m.class] || { icon: "🎮", color: "#8a6a4a" };
  return `
    <div class="member-card">
      <div class="avatar" style="background:linear-gradient(135deg, ${meta.color}, ${meta.color}bb)">${meta.icon}</div>
      <div class="info">
        <div class="name">${escapeHtml(m.name || "未知")}</div>
        <div class="lv">Lv.${m.level ?? "?"}</div>
        <div class="meta"><span>⏱ ${escapeHtml(m.onlineTime || "未知")}</span></div>
        ${(m.styles || []).length ? `<div class="member-tags">${m.styles.map((s) => `<span>${escapeHtml(s)}</span>`).join("")}</div>` : ""}
      </div>
    </div>`;
}

/* ---------- 洞察 ---------- */
function renderInsights(members) {
  renderTagBars("styleBars", tally(members, "styles"));
  renderTagBars("needBars", tally(members, "needs"));
}

function renderTagBars(id, counts) {
  const list = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...list.map((x) => x[1]), 1);
  document.getElementById(id).innerHTML = list.length
    ? list.map(([k, v]) => hbar(k, v, max, "")).join("")
    : '<div class="empty-tip">暂无数据</div>';
}

/* ---------- 加入 ---------- */
function renderJoin(members, cfg) {
  document.getElementById("joinCount").textContent = `${members.length} 位伙伴已经在等你~`;
  const qr = document.getElementById("joinQrcode");
  if (cfg.qrImage) {
    qr.innerHTML = `<img src="${cfg.qrImage}" alt="入群二维码" />`;
  } else {
    qr.innerHTML = `<div class="qr-empty">二维码待配置<br />在同步脚本 SITE 配置中填入 qrImage 链接即可显示</div>`;
  }
  const perks = (cfg.giftCatalog || []).map((g) => `<span>🎁 ${g}</span>`).join("");
  document.getElementById("joinPerks").innerHTML = perks + `<span>👥 ${cfg.groupInfo || ""}</span>`;
}

/* ---------- 工具 ---------- */
function countBy(list, key) {
  const map = new Map();
  list.forEach((m) => {
    const k = m[key] || "未知";
    map.set(k, (map.get(k) || 0) + 1);
  });
  return map;
}
function tally(list, key) {
  const counts = {};
  list.forEach((m) => (m[key] || []).forEach((v) => (counts[v] = (counts[v] || 0) + 1)));
  return counts;
}
function hbar(label, value, max, icon) {
  return `
    <div class="hbar">
      <div class="hbar-head"><span>${icon ? icon + " " : ""}${escapeHtml(label)}</span><em>${value}人</em></div>
      <div class="hbar-track"><div class="hbar-fill" style="width:${(value / max) * 100}%"></div></div>
    </div>`;
}
function idx(arr, v) {
  const i = arr.indexOf(v);
  return i === -1 ? arr.length : i;
}
function pad(n) {
  return String(n).padStart(2, "0");
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
document.getElementById("memberSearch").addEventListener("input", (e) => {
  keyword = e.target.value;
  if (DATA) renderMembers(DATA.members, DATA.config);
});
