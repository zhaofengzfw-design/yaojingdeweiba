/**
 * 百度统计接入：在 src/data/config.ts 填入 BAIDU_TONGJI_ID 后自动生效
 */
import { SITE_CONFIG } from '@/data/config';

declare global {
  interface Window {
    _hmt?: unknown[][];
  }
}

export function initAnalytics() {
  const id = SITE_CONFIG.BAIDU_TONGJI_ID;
  if (!id || typeof window === 'undefined') return;
  window._hmt = window._hmt || [];
  const hm = document.createElement('script');
  hm.src = `https://hm.baidu.com/hm.js?${id}`;
  hm.async = true;
  document.head.appendChild(hm);
}
