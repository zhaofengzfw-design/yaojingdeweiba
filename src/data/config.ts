/**
 * 站点运行时配置 —— 部署后按需填写，其余代码无需改动
 */
export const SITE_CONFIG = {
  /**
   * Cloudflare Worker 实时数据接口地址（部署 Worker 后填入）
   * 例如: 'https://fairy-tail-data.你的子域.workers.dev/api/data'
   * 留空则只用本地 data.json（每小时由 GitHub Actions 同步）
   */
  DATA_API_URL: '',

  /**
   * 百度统计 ID（在 tongji.baidu.com 申请后填入，例如 'a1b2c3d4e5f6...'）
   * 留空则不加载统计脚本
   */
  BAIDU_TONGJI_ID: '',
} as const;
