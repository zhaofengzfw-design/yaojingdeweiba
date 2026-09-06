import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Users, TrendingUp, Swords, Activity, Gauge } from 'lucide-react';
import { useSiteData } from '@/data/site-data';

function AnimatedNumber({ value, color }: { value: number; color: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  const spring = useSpring(0, { stiffness: 60, damping: 18 });
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
    <motion.span ref={ref} className="text-3xl md:text-4xl font-black leading-none" style={{ color }}>
      {display}
    </motion.span>
  );
}

export default function KpiOverviewSection() {
  const { stats } = useSiteData();
  const { kpis } = stats;

  const KPIS = [
    { value: kpis.totalMembers, suffix: '人', label: '登记人数', icon: Users, color: '#FF6B35', desc: '家族成员' },
    { value: kpis.avgLevel, suffix: '级', label: '平均等级', icon: TrendingUp, color: '#7CB342', desc: '成长中...' },
    { value: kpis.classTypes, suffix: '种', label: '职业种类', icon: Swords, color: '#87CEEB', desc: '齐聚一堂' },
    { value: kpis.activeRate, suffix: '%', label: '日均≥3小时', icon: Activity, color: '#C9AB6D', desc: `${kpis.activeCount}人达标` },
  ];

  return (
    <section id="overview" className="w-full py-10 md:py-16 bg-gradient-to-b from-[#ffe4b5] to-[#fff8e7] relative overflow-hidden">
      <div className="absolute top-5 left-1/4 text-3xl opacity-20">⭐</div>
      <div className="absolute bottom-8 right-10 text-4xl opacity-15">🏆</div>

      <div className="relative max-w-5xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 md:mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border-2 border-[#c9ab6d]/60 mb-3">
            <Gauge className="size-3.5 md:size-4 text-[#ff6b35]" />
            <span className="text-xs md:text-sm font-black text-[#5c3d2e]">招募概况</span>
          </div>
          <h2
            className="text-2xl md:text-4xl font-black text-[#5c3d2e]"
            style={{ textShadow: '2px 2px 0 rgba(255,215,0,0.5)' }}
          >
            家族数据概览
          </h2>
        </motion.div>

        {/* WEB：4个并排卡片，大数字+小图标+标签 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {KPIS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <div className="relative p-4 md:p-6 rounded-[0_20px] bg-white border-2 border-[#c9ab6d]/40 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                  {/* 顶部色条 */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: item.color }}
                  />
                  <div
                    className="absolute -top-8 -right-8 w-20 h-20 rounded-full blur-2xl opacity-20 group-hover:opacity-35 transition-opacity"
                    style={{ backgroundColor: item.color }}
                  />

                  <div className="relative flex items-start gap-2.5 md:gap-3 mb-2 md:mb-3">
                    <div
                      className="size-9 md:size-11 rounded-[0_14px] flex items-center justify-center shrink-0 shadow-sm"
                      style={{ backgroundColor: item.color }}
                    >
                      <Icon className="size-4 md:size-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs md:text-sm font-bold text-[#5c3d2e]/70">{item.label}</div>
                      <div className="text-[10px] md:text-xs text-[#5c3d2e]/50">{item.desc}</div>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <AnimatedNumber value={item.value} color={item.color} />
                    <span className="text-sm md:text-base font-bold" style={{ color: item.color + 'cc' }}>
                      {item.suffix}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
