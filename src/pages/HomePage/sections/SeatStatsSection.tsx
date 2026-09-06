import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Crown, Users, UserPlus, Sparkles } from 'lucide-react';
import { useSiteData } from '@/data/site-data';

function AnimatedNumber({ value, color, size = 'md' }: { value: number; color: string; size?: 'md' | 'lg' }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  const spring = useSpring(0, { stiffness: 50, damping: 15 });
  const display = useTransform(spring, (v) => Math.round(v));

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
    if (inView) spring.set(value);
  }, [inView, value, spring]);

  const sizeClass = size === 'lg' ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl';

  return (
    <motion.span
      ref={ref}
      className={`${sizeClass} font-black leading-none`}
      style={{ color }}
    >
      {display}
    </motion.span>
  );
}

export default function SeatStatsSection() {
  const { stats } = useSiteData();
  const { seatStats } = stats;

  return (
    <section id="seats" className="w-full py-8 md:py-12 bg-gradient-to-b from-[#fff8e7] to-[#fff5d6] relative overflow-hidden">
      <div className="absolute top-6 left-8 text-2xl md:text-4xl opacity-15 select-none">🍂</div>
      <div className="absolute bottom-4 right-8 text-3xl md:text-5xl opacity-10 select-none">🎪</div>

      <div className="relative max-w-4xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4 md:mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#c9ab6d]/50 mb-2">
            <Sparkles className="size-3 text-[#ffd814]" />
            <span className="text-[11px] md:text-xs font-bold text-[#5c3d2e]">席位速报</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-[#5c3d2e]">
            家族席位实时播报
          </h2>
        </motion.div>

        {/* 一杠三布局：三个数据一行排开，高度统一，剩余席位高亮 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-[0_16px] md:rounded-[0_20px] bg-white border-2 border-[#c9ab6d]/50 shadow-lg overflow-hidden"
        >
          <div className="grid grid-cols-3 min-h-[140px] md:min-h-[160px]">
            {/* 总席位 */}
            <div className="relative flex flex-col items-center justify-center py-4 px-2">
              <Crown className="size-5 md:size-6 text-[#c9ab6d] mb-1.5" />
              <div className="text-[11px] md:text-xs font-bold text-[#5c3d2e]/60 mb-0.5">总席位</div>
              <AnimatedNumber value={seatStats.totalSeats} color="#C9AB6D" />
              <div className="text-[9px] md:text-[10px] text-[#5c3d2e]/50 mt-0.5">限定席位</div>
            </div>

            {/* 竖线分隔 */}
            <div className="absolute top-3 bottom-3 left-1/3 w-px bg-[#c9ab6d]/30" />

            {/* 已加入 */}
            <div className="relative flex flex-col items-center justify-center py-4 px-2">
              <Users className="size-5 md:size-6 text-[#7CB342] mb-1.5" />
              <div className="text-[11px] md:text-xs font-bold text-[#5c3d2e]/60 mb-0.5">已加入</div>
              <AnimatedNumber value={seatStats.joined} color="#7CB342" />
              <div className="text-[9px] md:text-[10px] text-[#5c3d2e]/50 mt-0.5">冒险伙伴</div>
            </div>

            {/* 竖线分隔 */}
            <div className="absolute top-3 bottom-3 left-2/3 w-px bg-[#c9ab6d]/30" />

            {/* 剩余席位 - 高亮 */}
            <div className="relative flex flex-col items-center justify-center py-4 px-2 pt-8 bg-gradient-to-b from-[#ff6b35]/10 via-[#ff8c42]/10 to-[#ffd814]/15">
              <div className="absolute inset-0 border-l-2 border-[#ff6b35]/40" />
              <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ffd814] text-white text-[9px] md:text-[10px] font-black shadow-md whitespace-nowrap">
                ⭐ 虚位以待
              </div>
              <UserPlus className="size-5 md:size-6 text-[#ff6b35] mb-1.5" />
              <div className="text-[11px] md:text-xs font-black text-[#5c3d2e] mb-0.5">剩余席位</div>
              <AnimatedNumber value={seatStats.remaining} color="#FF6B35" size="lg" />
              <div className="text-[9px] md:text-[10px] text-[#5c3d2e]/60 mt-0.5 font-bold">
                等你来加入
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
