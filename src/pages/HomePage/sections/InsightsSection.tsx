import { motion } from 'framer-motion';
import { Target, Gift, Lightbulb, Heart, Gamepad2 } from 'lucide-react';
import { useSiteData } from '@/data/site-data';

/** 三栏洞察的固定样式 */
const CATEGORY_STYLES = [
  { icon: Gamepad2, color: '#FF6B35', desc: '看看大家最偏爱哪种玩法' },
  { icon: Heart, color: '#C9AB6D', desc: '稳定团队是大家的共同心愿' },
  { icon: Gift, color: '#FFD814', desc: '实用主义完胜颜值党' },
];

export default function InsightsSection() {
  const { stats } = useSiteData();
  const categories = stats.insightCategories;

  return (
    <section id="insights" className="w-full py-16 md:py-24 bg-gradient-to-b from-[#fff5d6] via-[#ffe4b5] to-[#ffd1a4] relative overflow-hidden">
      <div className="absolute top-10 left-10 text-5xl opacity-15">💡</div>
      <div className="absolute bottom-10 right-10 text-5xl opacity-15">📊</div>
      <div className="absolute top-1/3 right-1/4 text-3xl opacity-20">✨</div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/80 backdrop-blur border-2 border-[#c9ab6d]/60 mb-4">
            <Lightbulb className="size-4 text-[#ffd814]" />
            <span className="text-sm font-black text-[#5c3d2e]">需求洞察</span>
          </div>
          <h2
            className="text-3xl md:text-5xl font-black text-[#5c3d2e] mb-3"
            style={{ textShadow: '2px 2px 0 rgba(255,215,0,0.5)' }}
          >
            家族成员心声洞察
          </h2>
          <p className="text-[#5c3d2e]/70 font-medium">
            看看大家喜欢什么样的游戏风格和家族氛围
          </p>
        </motion.div>

        {/* WEB端：三栏并排 */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {categories.map((section, si) => {
            const style = CATEGORY_STYLES[si % CATEGORY_STYLES.length];
            const Icon = style.icon;
            const maxVal = Math.max(1, ...section.items.map((i) => i.count));
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: si * 0.15 }}
                whileHover={{ y: -8 }}
                className="relative"
              >
                <div className="relative h-full p-6 rounded-[0_32px] bg-white border-3 border-[#c9ab6d]/60 shadow-xl overflow-hidden">
                  {/* 顶部装饰 */}
                  <div
                    className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-25"
                    style={{ backgroundColor: style.color }}
                  />

                  <div className="relative">
                    {/* 标题 */}
                    <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-dashed border-[#c9ab6d]/30">
                      <div
                        className="size-12 rounded-[0_16px] flex items-center justify-center shadow-md"
                        style={{ backgroundColor: style.color }}
                      >
                        <Icon className="size-6 text-white" />
                      </div>
                      <div>
                        <div className="font-black text-[#5c3d2e] text-lg">{section.title}</div>
                        <div className="text-xs text-[#5c3d2e]/60">{style.desc}</div>
                      </div>
                    </div>

                    {/* 项目列表 */}
                    {section.items.length === 0 ? (
                      <div className="flex items-center gap-2 text-sm text-[#5c3d2e]/50 py-4">
                        <Target className="size-4" />
                        暂无数据
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {section.items.map((item, i) => {
                          const percent = (item.count / maxVal) * 100;
                          return (
                            <div key={item.label}>
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="size-1.5 rounded-full"
                                    style={{ backgroundColor: style.color }}
                                  />
                                  <span className="text-sm font-bold text-[#5c3d2e]">{item.label}</span>
                                </div>
                                <span
                                  className="text-sm font-black"
                                  style={{ color: style.color }}
                                >
                                  {item.count}人
                                </span>
                              </div>
                              <div className="h-2.5 rounded-full bg-[#fff5d6] overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${percent}%` }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 + i * 0.1 }}
                                  className="h-full rounded-full relative overflow-hidden"
                                  style={{ backgroundColor: style.color }}
                                >
                                  {/* 进度条光效 */}
                                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                                </motion.div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 移动端：纵向堆叠 */}
        <div className="md:hidden space-y-4">
          {categories.map((section, si) => {
            const style = CATEGORY_STYLES[si % CATEGORY_STYLES.length];
            const Icon = style.icon;
            const maxVal = Math.max(1, ...section.items.map((i) => i.count));
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: si * 0.1 }}
                className="p-4 rounded-[0_24px] bg-white border-2 border-[#c9ab6d]/50 shadow-lg"
              >
                <div className="flex items-center gap-2.5 mb-3 pb-2.5 border-b border-dashed border-[#c9ab6d]/30">
                  <div
                    className="size-9 rounded-[0_12px] flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: style.color }}
                  >
                    <Icon className="size-4 text-white" />
                  </div>
                  <div>
                    <div className="font-black text-[#5c3d2e] text-base">{section.title}</div>
                    <div className="text-[10px] text-[#5c3d2e]/60">{style.desc}</div>
                  </div>
                </div>
                {section.items.length === 0 ? (
                  <div className="text-xs text-[#5c3d2e]/50 py-2">暂无数据</div>
                ) : (
                  <div className="space-y-2.5">
                    {section.items.map((item, i) => {
                      const percent = (item.count / maxVal) * 100;
                      return (
                        <div key={item.label}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-[#5c3d2e]">{item.label}</span>
                            <span className="text-xs font-black" style={{ color: style.color }}>
                              {item.count}人
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-[#fff5d6] overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${percent}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 + i * 0.08 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: style.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
