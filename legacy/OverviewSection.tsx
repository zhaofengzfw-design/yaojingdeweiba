import { motion, useSpring, useMotionValueEvent } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Users, TrendingUp, Sword, Mic2 } from 'lucide-react';
import { MOCK_KPI_STATS } from '@/data/stats';

function CountUpNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useMotionValueEvent(spring, 'change', (v) => {
    setDisplay(Math.round(v).toString());
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          spring.set(value);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, spring, started]);

  return (
    <span ref={ref} className="inline-flex items-baseline tabular-nums">
      {display}
      {suffix && <span className="text-lg ml-0.5">{suffix}</span>}
    </span>
  );
}

const KPI_ITEMS = [
  {
    key: 'total',
    label: '登记人数',
    valueKey: 'totalMembers' as const,
    suffix: '人',
    icon: Users,
    color: 'from-primary to-[#B85C3E]',
    bgLight: 'bg-primary/5',
  },
  {
    key: 'level',
    label: '平均等级',
    valueKey: 'avgLevel' as const,
    suffix: '级',
    icon: TrendingUp,
    color: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-50',
  },
  {
    key: 'class',
    label: '职业种类',
    valueKey: 'classTypes' as const,
    suffix: '种',
    icon: Sword,
    color: 'from-rose-500 to-pink-500',
    bgLight: 'bg-rose-50',
  },
  {
    key: 'yy',
    label: 'YY活跃率',
    valueKey: 'yyActiveRate' as const,
    suffix: '%',
    subLabel: (stats: typeof MOCK_KPI_STATS) => `${stats.yyActiveCount}人在线`,
    icon: Mic2,
    color: 'from-violet-500 to-purple-500',
    bgLight: 'bg-violet-50',
  },
];

export default function OverviewSection() {
  return (
    <section id="overview" className="w-full py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-14"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-amber-100/80 text-amber-700 text-xs font-semibold tracking-wider mb-4">
            OVERVIEW
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-3">
            家族招募<span className="text-primary">概况</span>
          </h2>
          <p className="text-foreground/60">数据驱动，见证家族成长每一步</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {KPI_ITEMS.map((item, i) => {
            const Icon = item.icon;
            const value = MOCK_KPI_STATS[item.valueKey];
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="relative group rounded-2xl p-5 md:p-6 bg-white border border-border/60 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
              >
                {/* 背景装饰 */}
                <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${item.bgLight} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative z-10">
                  <div className={`size-10 md:size-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md mb-4`}>
                    <Icon className="size-5 text-white" />
                  </div>

                  <div className="text-3xl md:text-4xl font-black text-foreground mb-1 tracking-tight">
                    <CountUpNumber value={value} suffix={item.suffix} />
                  </div>

                  <div className="text-sm text-foreground/60 font-medium">{item.label}</div>

                  {item.subLabel && (
                    <div className="text-xs text-foreground/40 mt-1">
                      {item.subLabel(MOCK_KPI_STATS)}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
