import { Sparkles, Heart } from 'lucide-react';
import { useSiteData } from '@/data/site-data';

export default function Footer() {
  const { updatedAt, source } = useSiteData();
  const timeText = updatedAt
    ? new Date(updatedAt).toLocaleString('zh-CN', { hour12: false })
    : '';
  const sourceText =
    source === 'worker' ? '实时数据' :
    source === 'file' ? '每小时同步' : '';

  return (
    <footer className="w-full bg-[#3d2817] text-amber-100/80 py-8 md:py-10 border-t-4 border-[#c9ab6d]/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-[0_14px] bg-gradient-to-br from-[#ffd814] to-[#ff6b35] flex items-center justify-center border-2 border-[#5c3d2e]/50">
              <Sparkles className="size-4 text-[#5c3d2e]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span
                className="text-sm font-black tracking-[0.08em]"
                style={{
                  fontFamily: "'Noto Serif SC', 'Noto Sans SC', serif",
                  background: 'linear-gradient(180deg, #fff5d6 0%, #ffd814 50%, #c9ab6d 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))',
                }}
              >
                妖精的尾巴
              </span>
              <span
                className="text-[10px] font-black tracking-[0.25em] mt-0.5"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  background: 'linear-gradient(180deg, #ffd814, #c9ab6d)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                FAIRY TAIL
              </span>
              <span className="text-[9px] text-amber-200/50 mt-0.5">冒险岛手游家族</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-200/70">
            <span>妖精的尾巴公会 · 家族招募数据看板</span>
            {timeText && (
              <span className="text-amber-200/50">
                · 数据更新于 {timeText}
                {sourceText ? `（${sourceText}）` : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-200/60">
            <span>© 2026 妖精的尾巴家族</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              以 <Heart className="size-3 text-red-400 fill-red-400" /> 打造
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
