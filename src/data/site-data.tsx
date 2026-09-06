/**
 * 站点数据中枢：
 * 1. 优先请求 Cloudflare Worker 实时接口（秒级新鲜）
 * 2. 失败则请求本地 data/data.json（GitHub Actions 每小时同步）
 * 3. 都失败则使用内置兜底数据，页面永不空白
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { FALLBACK_MEMBERS, CLASS_ORDER, ONLINE_BUCKETS, type IMember } from './members';
import { QR_URL } from './assets';
import { SITE_CONFIG } from './config';

/* ============ 类型 ============ */
export interface SiteConfig {
  guildName: string;
  gameName: string;
  slogan: string;
  totalSeats: number;
  qrImage: string;
  groupInfo: string;
  classOrder: string[];
  giftCatalog: string[];
}

export interface SiteData {
  members: IMember[];
  config: SiteConfig;
  updatedAt: string;
  source: 'fallback' | 'file' | 'worker';
}

export interface ISeatStats {
  totalSeats: number;
  joined: number;
  remaining: number;
}

export interface IKpiStats {
  totalMembers: number;
  avgLevel: number;
  classTypes: number;
  activeRate: number;
  activeCount: number;
}

export interface IClassDist {
  name: string;
  value: number;
  levelMin: number;
  levelMax: number;
}

export interface IDistItem {
  label: string;
  count: number;
}

export interface IInsightCategory {
  title: string;
  items: IDistItem[];
}

export interface SiteStats {
  seatStats: ISeatStats;
  kpis: IKpiStats;
  classDistribution: IClassDist[];
  onlineDistribution: IDistItem[];
  giftStats: IDistItem[];
  insightCategories: IInsightCategory[];
}

type SiteDataWithStats = SiteData & { stats: SiteStats };

/* ============ 默认配置 ============ */
export const DEFAULT_CONFIG: SiteConfig = {
  guildName: '妖精的尾巴',
  gameName: '冒险岛手游',
  slogan: '五大职业齐聚 · 冒险永不独行',
  totalSeats: 50,
  qrImage: QR_URL,
  groupInfo: 'YY / 微信群',
  classOrder: [...CLASS_ORDER],
  giftCatalog: ['皇家美发卡', '皇家整容卷', '58万游戏币'],
};

/* ============ 归一化 ============ */
function toList(v: unknown): string[] {
  if (!v) return [];
  const arr = Array.isArray(v) ? v : [v];
  return arr.map((x) => String(typeof x === 'object' && x && 'text' in x ? (x as { text: string }).text : x).trim()).filter(Boolean);
}

function toText(v: unknown): string {
  if (v == null) return '';
  if (Array.isArray(v)) return v.map(toText).filter(Boolean).join('、');
  if (typeof v === 'object' && v !== null) {
    const o = v as Record<string, unknown>;
    if (typeof o.text === 'string') return o.text;
    if (typeof o.name === 'string') return o.name;
    if (typeof o.value === 'string') return o.value;
    return '';
  }
  return String(v);
}

/** 在线时长归一到五个档位，无法识别的按小时数估档，最终归入"未知" */
function bucketOnline(v: string): string {
  const s = (v || '').trim();
  if (!s || s === '未知') return '未知';
  if (ONLINE_BUCKETS.includes(s)) return s;
  const m = s.match(/(\d+(?:\.\d+)?)/);
  if (m) {
    const h = parseFloat(m[1]);
    if (h > 12) return '肝帝';
    if (h >= 8) return '8-12小时';
    if (h >= 6) return '6-8小时';
    if (h >= 3) return '3-6小时';
    return '1-3小时';
  }
  if (/肝/.test(s)) return '肝帝';
  return '未知';
}

function normalizeMember(raw: Record<string, unknown>, idx: number): IMember {
  const level = Number(toText(raw.level));
  return {
    id: String(idx + 1),
    gameId: toText(raw.name ?? raw.gameId) || `成员${idx + 1}`,
    characterClass: toText(raw.class ?? raw.characterClass) || '未分职业',
    level: Number.isFinite(level) && level > 0 ? Math.round(level) : 0,
    onlineDuration: bucketOnline(toText(raw.onlineTime ?? raw.onlineDuration)),
    welcomeGift: toText(raw.gift ?? raw.welcomeGift),
    gamePlans: toList(raw.styles ?? raw.gamePlans),
    familyNeeds: toList(raw.needs ?? raw.familyNeeds),
  };
}

function normalizeConfig(raw: Record<string, unknown> | undefined): SiteConfig {
  if (!raw) return { ...DEFAULT_CONFIG };
  const cfg = { ...DEFAULT_CONFIG };
  if (typeof raw.guildName === 'string' && raw.guildName) cfg.guildName = raw.guildName;
  if (typeof raw.gameName === 'string' && raw.gameName) cfg.gameName = raw.gameName;
  if (typeof raw.slogan === 'string' && raw.slogan) cfg.slogan = raw.slogan;
  if (Number.isFinite(Number(raw.totalSeats)) && Number(raw.totalSeats) > 0) cfg.totalSeats = Number(raw.totalSeats);
  if (typeof raw.qrImage === 'string' && raw.qrImage) cfg.qrImage = raw.qrImage;
  if (typeof raw.groupInfo === 'string' && raw.groupInfo) cfg.groupInfo = raw.groupInfo;
  if (Array.isArray(raw.classOrder) && raw.classOrder.length) cfg.classOrder = raw.classOrder.map(String);
  if (Array.isArray(raw.giftCatalog) && raw.giftCatalog.length) cfg.giftCatalog = raw.giftCatalog.map(String);
  return cfg;
}

/* ============ 统计计算（全部由成员数据驱动） ============ */
function countBy(items: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const it of items) {
    if (!it || it === '无') continue;
    map.set(it, (map.get(it) || 0) + 1);
  }
  return map;
}

function mapToItems(map: Map<string, number>, preferredOrder: string[] = []): IDistItem[] {
  const items: IDistItem[] = [];
  for (const label of preferredOrder) {
    if (map.has(label)) items.push({ label, count: map.get(label)! });
  }
  const rest = [...map.entries()]
    .filter(([label]) => !preferredOrder.includes(label))
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count }));
  return [...items, ...rest];
}

export function buildStats(data: SiteData): SiteStats {
  const { members, config } = data;
  const total = members.length;

  // 席位
  const seatStats: ISeatStats = {
    totalSeats: config.totalSeats,
    joined: total,
    remaining: Math.max(0, config.totalSeats - total),
  };

  // KPI（第4项：日均在线 ≥3 小时的活跃占比）
  const levels = members.filter((m) => m.level > 0).map((m) => m.level);
  const avgLevel = levels.length ? Math.round(levels.reduce((s, l) => s + l, 0) / levels.length) : 0;
  const classTypes = new Set(members.map((m) => m.characterClass).filter(Boolean)).size;
  const activeMembers = members.filter((m) => m.onlineDuration !== '1-3小时' && m.onlineDuration !== '未知').length;
  const kpis: IKpiStats = {
    totalMembers: total,
    avgLevel,
    classTypes,
    activeRate: total ? Math.round((activeMembers / total) * 100) : 0,
    activeCount: activeMembers,
  };

  // 职业分布（含每职业等级区间）
  const classOrder = [...new Set([...config.classOrder, ...members.map((m) => m.characterClass)])].filter(Boolean);
  const classDistribution: IClassDist[] = classOrder.map((name) => {
    const lv = members.filter((m) => m.characterClass === name && m.level > 0).map((m) => m.level);
    return {
      name,
      value: members.filter((m) => m.characterClass === name).length,
      levelMin: lv.length ? Math.min(...lv) : 0,
      levelMax: lv.length ? Math.max(...lv) : 0,
    };
  });

  // 在线时长分布
  const onlineMap = countBy(members.map((m) => m.onlineDuration));
  const onlineDistribution: IDistItem[] = mapToItems(onlineMap, [...ONLINE_BUCKETS]).filter((i) => i.count > 0);

  // 欢迎礼统计
  const giftMap = countBy(members.map((m) => m.welcomeGift));
  const giftStats: IDistItem[] = mapToItems(giftMap, config.giftCatalog);

  // 洞察三栏
  const styleMap = countBy(members.flatMap((m) => m.gamePlans));
  const needMap = countBy(members.flatMap((m) => m.familyNeeds));
  const insightCategories: IInsightCategory[] = [
    { title: '游戏风格分布', items: mapToItems(styleMap).slice(0, 6) },
    { title: '家族需求分布', items: mapToItems(needMap).slice(0, 6) },
    { title: '欢迎礼偏好分布', items: giftStats.slice(0, 6) },
  ];

  return { seatStats, kpis, classDistribution, onlineDistribution, giftStats, insightCategories };
}

/* ============ 远程加载 ============ */
function parseSiteJson(json: unknown, source: SiteData['source']): SiteData | null {
  if (!json || typeof json !== 'object') return null;
  const obj = json as Record<string, unknown>;
  if (!Array.isArray(obj.members)) return null;
  const members = (obj.members as Record<string, unknown>[]).map(normalizeMember).filter((m) => m.gameId);
  return {
    members,
    config: normalizeConfig(obj.config as Record<string, unknown>),
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : '',
    source,
  };
}

async function fetchJson(url: string, timeoutMs: number): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function loadSiteData(): Promise<SiteData> {
  // 1) Worker 实时接口
  if (SITE_CONFIG.DATA_API_URL) {
    try {
      const json = await fetchJson(SITE_CONFIG.DATA_API_URL, 5000);
      const data = parseSiteJson(json, 'worker');
      if (data) return data;
    } catch {
      /* 落到下一级 */
    }
  }
  // 2) 本地 data.json（相对 base 路径，兼容 GitHub Pages 子目录）
  try {
    const base = import.meta.env.BASE_URL || '/';
    const url = `${base}data/data.json?t=${Date.now()}`;
    const json = await fetchJson(url, 8000);
    const data = parseSiteJson(json, 'file');
    if (data) return data;
  } catch {
    /* 落到兜底 */
  }
  return { members: FALLBACK_MEMBERS, config: { ...DEFAULT_CONFIG }, updatedAt: '', source: 'fallback' };
}

/* ============ React Provider ============ */
const INITIAL_DATA: SiteData = {
  members: FALLBACK_MEMBERS,
  config: { ...DEFAULT_CONFIG },
  updatedAt: '',
  source: 'fallback',
};

const SiteDataContext = createContext<SiteDataWithStats | null>(null);

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData>(INITIAL_DATA);

  useEffect(() => {
    let alive = true;
    loadSiteData().then((d) => {
      if (alive && d.members.length) setData(d);
    });
    return () => {
      alive = false;
    };
  }, []);

  const stats = useMemo(() => buildStats(data), [data]);
  return <SiteDataContext.Provider value={{ ...data, stats }}>{children}</SiteDataContext.Provider>;
}

export function useSiteData(): SiteDataWithStats {
  const ctx = useContext(SiteDataContext);
  if (!ctx) throw new Error('useSiteData must be used within SiteDataProvider');
  return ctx;
}
