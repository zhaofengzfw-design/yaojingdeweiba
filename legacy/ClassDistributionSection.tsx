import { useMemo } from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { CLASS_DISTRIBUTION, ONLINE_DISTRIBUTION } from '@/data/members';
import { CHART_PALETTE, RADAR_COLORS } from '@/lib/chart-colors';

export default function ClassDistributionSection() {
  const radarOption: EChartsOption = useMemo(() => ({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e5e5e5',
      borderWidth: 1,
      textStyle: { color: '#333', fontSize: 13 },
      formatter: (params) => {
        const p = params as { name: string; value: number; marker: string };
        return `${p.marker}${p.name}：${p.value}人`;
      },
    },
    radar: {
      indicator: CLASS_DISTRIBUTION.map((c) => ({ name: c.name })),
      center: ['50%', '52%'],
      radius: '65%',
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: '#4a3728',
        fontSize: 13,
        fontWeight: 600,
      },
      splitLine: {
        lineStyle: {
          color: ['rgba(139,44,44,0.08)', 'rgba(139,44,44,0.12)', 'rgba(139,44,44,0.16)', 'rgba(139,44,44,0.2)'],
        },
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(255,248,240,0.6)', 'rgba(255,243,230,0.4)', 'rgba(255,235,215,0.3)', 'rgba(255,225,200,0.2)'],
        },
      },
      axisLine: {
        lineStyle: { color: 'rgba(139,44,44,0.15)' },
      },
    },
    series: [
      {
        type: 'radar',
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 2.5,
          color: RADAR_COLORS.line,
        },
        itemStyle: {
          color: RADAR_COLORS.line,
          borderColor: '#fff',
          borderWidth: 2,
        },
        areaStyle: {
          color: {
            type: 'radial',
            x: 0.5,
            y: 0.5,
            r: 0.7,
            colorStops: [
              { offset: 0, color: 'rgba(139,44,44,0.1)' },
              { offset: 1, color: 'rgba(184,92,62,0.35)' },
            ],
          },
        },
        data: [
          {
            value: CLASS_DISTRIBUTION.map((c) => c.value),
            name: '职业分布',
          },
        ],
      },
    ],
  }), []);

  const maxOnline = Math.max(...ONLINE_DISTRIBUTION.map((d) => d.count));
  const onlineTotal = ONLINE_DISTRIBUTION.reduce((s, d) => s + d.count, 0);

  const onlineColors = [
    'from-amber-300 to-amber-400',
    'from-amber-400 to-orange-400',
    'from-orange-400 to-orange-500',
    'from-orange-500 to-red-500',
    'from-red-500 to-primary',
  ];

  return (
    <section id="class-distribution" className="w-full py-16 md:py-20 bg-gradient-to-b from-background to-primary/[0.03]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-14"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider mb-4">
            CLASS DISTRIBUTION
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-3">
            职业<span className="text-primary">分布</span>
          </h2>
          <p className="text-foreground/60">五大职业，各司其职，组成最强冒险队伍</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* 雷达图 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="bg-white rounded-3xl p-6 md:p-8 border border-border/60 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-foreground">职业构成雷达图</h3>
              <span className="text-xs text-foreground/50">共 {CLASS_DISTRIBUTION.reduce((s, c) => s + c.value, 0)} 人</span>
            </div>
            <div className="h-[320px] md:h-[360px]">
              <ReactECharts option={radarOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </motion.div>

          {/* 在线活跃度 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
            className="bg-white rounded-3xl p-6 md:p-8 border border-border/60 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground">在线活跃度</h3>
              <span className="text-xs text-foreground/50">日均在线时长</span>
            </div>

            <div className="space-y-5">
              {ONLINE_DISTRIBUTION.map((item, i) => {
                const percent = Math.round((item.count / maxOnline) * 100);
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground/80">{item.label}</span>
                      <span className="text-sm font-bold text-foreground">
                        {item.count}人
                        <span className="text-xs font-normal text-foreground/40 ml-1.5">
                          {Math.round((item.count / onlineTotal) * 100)}%
                        </span>
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${percent}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.4 + i * 0.1, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${onlineColors[i]}`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* 活跃小结 */}
            <div className="mt-8 pt-6 border-t border-border/50 grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-xl bg-amber-50">
                <div className="text-2xl font-black text-amber-600">{onlineTotal}</div>
                <div className="text-xs text-foreground/60 mt-1">统计总人数</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-primary/5">
                <div className="text-2xl font-black text-primary">
                  {Math.round(((onlineTotal - ONLINE_DISTRIBUTION[0].count) / onlineTotal) * 100)}%
                </div>
                <div className="text-xs text-foreground/60 mt-1">日均 ≥ 3h</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
