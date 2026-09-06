import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Clock, Activity, Zap, Coffee, Flame, BatteryCharging, Gauge } from 'lucide-react';
import { useSiteData } from '@/data/site-data';

/** 时长档位 → 图标/颜色 */
const BUCKET_STYLES: Record<string, { icon: typeof Clock; color: string }> = {
  '1-3小时': { icon: Coffee, color: '#87CEEB' },
  '3-6小时': { icon: Activity, color: '#7CB342' },
  '6-8小时': { icon: BatteryCharging, color: '#C9AB6D' },
  '8-12小时': { icon: Zap, color: '#FF8C42' },
  '肝帝': { icon: Flame, color: '#FF6B35' },
};
const FALLBACK_BUCKET_STYLE = { icon: Gauge, color: '#C9AB6D' };

function Bar({ value, color, label, maxCount }: { value: number; color: string; label: string; maxCount: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const heightSpring = useSpring(0, { stiffness: 50, damping: 15 });
  const displayHeight = useTransform(heightSpring, (v) => `${(v / maxCount) * 100}%`);

  const numSpring = useSpring(0, { stiffness: 50, damping: 15 });
  const displayNum = useTransform(numSpring, (v) => Math.round(v));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting && !inView) setInView(true); }),
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView]);

  useEffect(() => {
    if (inView) {
      heightSpring.set(value);
      numSpring.set(value);
    }
  }, [inView, value, heightSpring, numSpring]);

  return (
    <div ref={ref} className="relative flex flex-col items-center flex-1 min-w-0 group">
      {/* 顶部数字标签 */}
      <div className="h-6 md:h-7 flex items-center justify-center mb-1">
        <motion.span
          className="text-sm md:text-base font-black"
          style={{ color }}
        >
          {displayNum}
        </motion.span>
      </div>

      {/* 柱子 */}
      <div className="relative w-full max-w-[56px] md:max-w-[72px] h-44 md:h-60 flex items-end">
        <motion.div
          className="w-full rounded-t-[12px] relative overflow-hidden group-hover:scale-105 origin-bottom transition-transform duration-300"
          style={{
            height: displayHeight,
            background: `linear-gradient(180deg, ${color}ff 0%, ${color}aa 60%, ${color}66 100%)`,
            boxShadow: `0 4px 12px ${color}55`,
          }}
          whileHover={{ filter: 'brightness(1.1)' }}
          initial={{ y: 0 }}
        >
          {/* 柱子内高光 */}
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 w-1/3 h-6 rounded-full bg-white/30 blur-sm"
          />
          {/* 图标 */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2">
            {(() => {
              const style = BUCKET_STYLES[label] || FALLBACK_BUCKET_STYLE;
              const Icon = style.icon;
              return <Icon className="size-4 md:size-5 text-white drop-shadow-md" />;
            })()}
          </div>
        </motion.div>

        {/* hover tooltip */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -translate-y-full">
          <div className="px-2.5 py-1 rounded-md bg-[#5c3d2e] text-white text-xs font-bold whitespace-nowrap shadow-lg">
            {label} · {value}人
            <div
              className="absolute left-1/2 -bottom-1 w-2 h-2 rotate-45"
              style={{ backgroundColor: '#5c3d2e', transform: 'translateX(-50%) rotate(45deg)' }}
            />
          </div>
        </div>
      </div>

      {/* 底部标签 */}
      <div className="mt-2 md:mt-3 text-center">
        <div className="text-[10px] md:text-xs font-bold text-[#5c3d2e]/70 leading-tight">
          {label}
        </div>
      </div>
    </div>
  );
}

export default function OnlineActivitySection() {
  const { stats } = useSiteData();
  const data = stats.onlineDistribution;
  const total = data.reduce((s, a) => s + a.count, 0);
  const maxCount = Math.max(4, ...data.map((d) => d.count));
  const tickStep = maxCount > 8 ? 4 : 2;
  const ticks = [Math.ceil(maxCount / tickStep) * tickStep];
  while (ticks[ticks.length - 1] > 0) ticks.push(ticks[ticks.length - 1] - tickStep);
  const barColors = ['#87CEEB', '#7CB342', '#C9AB6D', '#FF8C42', '#FF6B35', '#E53935', '#8D6E63'];

  return (
    <section id="activity" className="w-full py-10 md:py-16 bg-gradient-to-b from-[#ffe4b5] to-[#fff8e7] relative overflow-hidden">
      <div className="absolute top-6 left-8 text-4xl opacity-15">⏰</div>
      <div className="absolute bottom-8 right-6 text-5xl opacity-10">🔥</div>

      <div className="relative max-w-5xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 md:mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border-2 border-[#c9ab6d]/60 mb-3">
            <Clock className="size-3.5 md:size-4 text-[#ff6b35]" />
            <span className="text-xs md:text-sm font-black text-[#5c3d2e]">在线活跃度</span>
          </div>
          <h2
            className="text-2xl md:text-4xl font-black text-[#5c3d2e]"
            style={{ textShadow: '2px 2px 0 rgba(255,215,0,0.5)' }}
          >
            日均在线时长分布
          </h2>
          <p className="text-sm md:text-base text-[#5c3d2e]/70 font-medium mt-2">
            共 <span className="font-black text-[#ff6b35]">{total}</span> 位成员数据
          </p>
        </motion.div>

        {/* 柱状图容器 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative p-5 md:p-8 rounded-[0_24px] bg-white/90 backdrop-blur-sm border-2 border-[#c9ab6d]/40 shadow-lg"
        >
          {/* Y轴网格线 + 柱子 */}
          <div className="relative h-52 md:h-72 flex items-end gap-2 md:gap-4 px-1 md:px-2">
            {/* Y轴刻度参考线 */}
            <div className="absolute inset-x-6 md:inset-x-10 inset-y-0 flex flex-col justify-between pointer-events-none">
              {ticks.map((level) => (
                <div key={level} className="flex items-center gap-2">
                  <span className="w-6 md:w-8 text-right text-[10px] md:text-xs font-bold text-[#5c3d2e]/40 tabular-nums">
                    {level}
                  </span>
                  <div className="flex-1 border-t border-dashed border-[#c9ab6d]/30" />
                </div>
              ))}
            </div>

            {/* 柱状图（带左侧刻度留白） */}
            <div className="ml-8 md:ml-10 flex-1 flex items-end justify-around gap-1 md:gap-3 h-full">
              {data.map((item, i) => (
                <Bar
                  key={item.label}
                  value={item.count}
                  color={(BUCKET_STYLES[item.label] || FALLBACK_BUCKET_STYLE).color || barColors[i % barColors.length]}
                  label={item.label}
                  maxCount={maxCount}
                />
              ))}
            </div>
          </div>

          {/* X轴说明 */}
          <div className="mt-4 pt-3 border-t border-[#c9ab6d]/30 flex items-center justify-center gap-2 text-[10px] md:text-xs text-[#5c3d2e]/60 font-medium">
            <Activity className="size-3 md:size-4" />
            <span>时长区间</span>
            <span className="mx-2">·</span>
            <UsersIcon className="size-3 md:size-4" />
            <span>人数（人）</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
