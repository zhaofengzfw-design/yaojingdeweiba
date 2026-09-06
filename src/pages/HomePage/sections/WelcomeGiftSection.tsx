import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Scissors, Palette, Coins, Gift as GiftIcon } from 'lucide-react';
import { useSiteData } from '@/data/site-data';

/** 礼物名称 → 图标/颜色/emoji（未收录的礼物走默认样式） */
const GIFT_STYLES: Record<string, { icon: typeof Scissors; color: string; emoji: string }> = {
  '皇家美发卡': { icon: Scissors, color: '#FF6B35', emoji: '💇' },
  '皇家整容卷': { icon: Palette, color: '#C9AB6D', emoji: '✨' },
  '58万游戏币': { icon: Coins, color: '#FFD814', emoji: '💰' },
};
const FALLBACK_GIFT_STYLE = { icon: GiftIcon, color: '#7CB342', emoji: '🎁' };

function AnimatedNumber({ value, color }: { value: number; color: string }) {
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

  return (
    <motion.span ref={ref} className="text-2xl md:text-3xl font-black leading-none" style={{ color }}>
      {display}
    </motion.span>
  );
}

export default function WelcomeGiftSection() {
  const { stats } = useSiteData();
  const gifts = stats.giftStats;
  const total = gifts.reduce((s, g) => s + g.count, 0);

  return (
    <section id="welcome-gift" className="w-full py-10 md:py-16 bg-gradient-to-b from-[#fff5d6] to-[#ffe4b5] relative overflow-hidden">
      <div className="absolute top-6 left-8 text-4xl opacity-15">🎁</div>
      <div className="absolute bottom-6 right-8 text-5xl opacity-10">🎀</div>

      <div className="relative max-w-5xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 md:mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur border-2 border-[#c9ab6d]/60 mb-3">
            <GiftIcon className="size-3.5 md:size-4 text-[#ff6b35]" />
            <span className="text-xs md:text-sm font-black text-[#5c3d2e]">家族欢迎礼</span>
          </div>
          <h2
            className="text-2xl md:text-4xl font-black text-[#5c3d2e]"
            style={{ textShadow: '2px 2px 0 rgba(255,215,0,0.5)' }}
          >
            入族好礼 三选一
          </h2>
          <p className="text-sm md:text-base text-[#5c3d2e]/70 font-medium mt-2">
            加入家族即可领取专属欢迎礼 · 共 <span className="font-black text-[#ff6b35]">{total}</span> 份已选择
          </p>
        </motion.div>

        {/* 一杠三：横向长条容器，三等分，竖线分隔 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative bg-white border-y-3 border-[#c9ab6d]/60 shadow-lg"
        >
          <div className="grid grid-cols-3">
            {gifts.map((gift, i) => {
              const style = GIFT_STYLES[gift.label] || FALLBACK_GIFT_STYLE;
              const Icon = style.icon;
              const percent = total ? Math.round((gift.count / total) * 100) : 0;
              return (
                <div
                  key={gift.label}
                  className="relative flex flex-col items-center justify-center py-5 md:py-7 px-2"
                >
                  {/* 左侧分隔线（第2、3个） */}
                  {i > 0 && (
                    <div className="absolute left-0 top-3 bottom-3 w-px bg-[#c9ab6d]/40" />
                  )}

                  <div className="text-2xl md:text-3xl mb-2">{style.emoji}</div>
                  <div className="flex items-center gap-1 mb-1">
                    <Icon className="size-3.5 md:size-4" style={{ color: style.color }} />
                    <span className="text-xs md:text-sm font-black text-[#5c3d2e]">{gift.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <AnimatedNumber value={gift.count} color={style.color} />
                    <span className="text-xs text-[#5c3d2e]/60 font-bold">人选择</span>
                  </div>
                  <div className="text-[10px] md:text-xs font-bold mt-1" style={{ color: style.color }}>
                    占比 {percent}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* 底部总进度条 */}
          <div className="flex h-1.5 md:h-2">
            {gifts.map((gift, i) => (
              <motion.div
                key={gift.label}
                initial={{ flex: 0 }}
                whileInView={{ flex: total ? (gift.count / total) * 10 : 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 + i * 0.15, ease: 'easeOut' }}
                style={{ backgroundColor: (GIFT_STYLES[gift.label] || FALLBACK_GIFT_STYLE).color }}
                title={`${gift.label}: ${gift.count}人`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
