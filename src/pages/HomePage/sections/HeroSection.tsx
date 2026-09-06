import { motion } from 'framer-motion';
import { Users, Sparkles, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { HERO_BG_URL } from '@/data/assets';

export default function HeroSection() {
  const scrollToMembers = () => {
    document.getElementById('members')?.scrollIntoView({ behavior: 'smooth' });
  };
  const scrollToJoin = () => {
    document.getElementById('join')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative w-full min-h-[90vh] md:min-h-screen flex flex-col items-center overflow-hidden pt-20 md:pt-28">
      {/* 背景图 - 蘑菇村 */}
      <div className="absolute inset-0">
        <Image
          src={HERO_BG_URL}
          alt="冒险岛蘑菇村"
          className="w-full h-full object-cover md:object-center object-[30%_20%]"
        />
        {/* 底部渐变承接，不影响顶部蓝天区域 */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#fff8e7]" />
      </div>

      {/* 主内容 - 靠上，放在蓝天区域，高对比度文字 */}
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-4xl mx-auto px-4 md:px-6">
        {/* 徽章标签 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-white/60 shadow-md mb-4 md:mb-6"
        >
          <span className="size-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs md:text-sm font-bold text-[#3d2b1f]">冒险岛手游 · 火爆招募中</span>
        </motion.div>

        {/* 主标题：深棕色 + 白色粗描边 + 多层阴影，背景图上清晰可读 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-black leading-tight select-none text-[#3d2b1f] text-center"
          style={{
            fontSize: 'clamp(2.5rem, 9vw, 6rem)',
            fontFamily: "'Noto Serif SC', 'Noto Sans SC', serif",
            letterSpacing: '0.08em',
            WebkitTextStroke: '3px #ffffff',
            textShadow:
              '0 2px 4px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.45), 0 8px 32px rgba(0,0,0,0.35), 0 0 1px rgba(0,0,0,0.6)',
          }}
        >
          妖精的尾巴
        </motion.h1>

        {/* 副标题：金色 + 白色描边 + 深色阴影 */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-2 md:mt-3 text-xl md:text-3xl font-black tracking-wide"
          style={{
            color: '#ffd814',
            WebkitTextStroke: '1.5px #5c3d2e',
            textShadow: '0 2px 6px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          家族招募
        </motion.p>

        {/* 宣传语 */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-3 text-sm md:text-lg text-white font-semibold max-w-md"
          style={{
            textShadow: '0 1px 4px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          五大职业齐聚 · 冒险永不独行
          <br className="md:hidden" />
          加入妖精的尾巴家族，一起闯荡冒险岛！
        </motion.p>

        {/* CTA 按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-wrap gap-3 md:gap-4 justify-center mt-6 md:mt-8"
        >
          <Button
            size="lg"
            onClick={scrollToMembers}
            className="h-11 md:h-13 px-5 md:px-7 text-sm md:text-base gap-2 rounded-full bg-[#7A1A2B] text-white font-bold border-2 border-white/40 shadow-lg shadow-[#7A1A2B]/30 hover:bg-[#9B2226] hover:scale-105 hover:shadow-xl transition-all duration-300"
          >
            <Users className="size-4 md:size-5" />
            查看全部成员
          </Button>
          <Button
            size="lg"
            onClick={scrollToJoin}
            className="h-11 md:h-13 px-5 md:px-7 text-sm md:text-base gap-2 rounded-full bg-white/95 text-[#3d2b1f] font-bold border-2 border-white/60 shadow-lg hover:bg-white hover:scale-105 hover:shadow-xl transition-all duration-300"
          >
            <Sparkles className="size-4 md:size-5 text-[#C9AB6D]" />
            立即加入
          </Button>
        </motion.div>
      </div>

      {/* 向下滚动提示 - WEB端 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{
          opacity: { duration: 1, delay: 1.2 },
          y: { duration: 2, delay: 1.5, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-1.5 z-20"
      >
        <div className="px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-white/50 shadow-md">
          <span className="text-xs font-bold text-[#3d2b1f]/70">向下探索 ↓</span>
        </div>
        <ArrowDown className="size-5 text-white drop-shadow-[0_1px_3px_rgba(0_0_0_0.5)]" />
      </motion.div>

      {/* 移动端底部占位 */}
      <div className="md:hidden mt-auto h-12" />
    </section>
  );
}
