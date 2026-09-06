import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Swords, Users } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { CLASS_IMAGES, type CharacterClassName } from '@/data/assets';
import { CLASS_COLORS } from '@/lib/chart-colors';
import { useSiteData } from '@/data/site-data';

/** 各职业固定文案 */
const CLASS_DESC: Record<string, string> = {
  '战士': '近战王者，钢铁壁垒',
  '飞侠': '暗影刺客，爆发伤害',
  '魔法师': '元素法师，远程控场',
  '弓箭手': '百步穿杨，灵巧暴击',
  '海盗': '海盗船长，枪炮齐鸣',
};
const DEFAULT_DESC = '等待冒险者加入';

// 雷达图几何参数
const CENTER = 180;
const RADIUS = 130;

function getRadarPoint(index: number, value: number, total: number, maxCount: number, radius: number = RADIUS) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const r = (value / maxCount) * radius;
  return {
    x: CENTER + Math.cos(angle) * r,
    y: CENTER + Math.sin(angle) * r,
  };
}

function getOuterPoint(index: number, total: number, radius: number = RADIUS) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return {
    x: CENTER + Math.cos(angle) * radius,
    y: CENTER + Math.sin(angle) * radius,
  };
}

export default function ClassShowcaseSection() {
  const { stats } = useSiteData();
  const classes = stats.classDistribution;
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogIdx, setDialogIdx] = useState<number | null>(null);

  // 雷达最大值：随数据自适应，留一档余量
  const maxCount = useMemo(
    () => Math.max(4, ...classes.map((c) => c.value)) + 1,
    [classes]
  );

  const polygonPoints = useMemo(
    () =>
      classes
        .map((c, i) => {
          const p = getRadarPoint(i, c.value, classes.length, maxCount);
          return `${p.x},${p.y}`;
        })
        .join(' '),
    [classes, maxCount]
  );

  const centerPoints = useMemo(
    () => classes.map(() => `${CENTER},${CENTER}`).join(' '),
    [classes]
  );

  const handleNodeClick = (idx: number) => {
    setDialogIdx(idx);
    setDialogOpen(true);
  };

  const selectedClass = dialogIdx !== null ? classes[dialogIdx] : null;

  const colorOf = (name: string) => CLASS_COLORS[name as keyof typeof CLASS_COLORS]?.primary || '#FF6B35';

  return (
    <section id="class-showcase" className="w-full py-10 md:py-16 bg-gradient-to-b from-[#fff8e7] to-[#ffe4b5] relative overflow-hidden">
      <div className="absolute top-6 right-6 text-5xl opacity-10">⚔️</div>
      <div className="absolute bottom-10 left-6 text-4xl opacity-15">🛡️</div>

      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 md:mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border-2 border-[#c9ab6d]/60 mb-3">
            <Swords className="size-3.5 md:size-4 text-[#ff6b35]" />
            <span className="text-xs md:text-sm font-black text-[#5c3d2e]">职业分布</span>
          </div>
          <h2
            className="text-2xl md:text-4xl font-black text-[#5c3d2e]"
            style={{ textShadow: '2px 2px 0 rgba(255,215,0,0.5)' }}
          >
            五大职业 全员集结
          </h2>
          <p className="text-sm md:text-base text-[#5c3d2e]/70 font-medium mt-2">
            点击雷达图上的职业节点，查看职业详情
          </p>
        </motion.div>

        {/* 雷达图 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative flex justify-center mb-6"
        >
          <div className="relative w-full max-w-[420px] md:max-w-[560px] aspect-square">
            <svg viewBox="0 0 360 360" className="w-full h-full drop-shadow-lg">
              <defs>
                <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffd814" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#ff6b35" stopOpacity="0.3" />
                </radialGradient>
                <filter id="radarGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* 背景网格（4层） */}
              {[0.25, 0.5, 0.75, 1].map((scale, si) => {
                const pts = classes.map((_, i) => {
                  const p = getOuterPoint(i, classes.length, RADIUS * scale);
                  return `${p.x},${p.y}`;
                }).join(' ');
                return (
                  <polygon
                    key={si}
                    points={pts}
                    fill={si === 3 ? '#fff8e7' : 'none'}
                    stroke="#c9ab6d"
                    strokeWidth={si === 3 ? 2 : 0.8}
                    strokeOpacity={si === 3 ? 0.6 : 0.25}
                  />
                );
              })}

              {/* 放射线 */}
              {classes.map((_, i) => {
                const outer = getOuterPoint(i, classes.length);
                return (
                  <line
                    key={i}
                    x1={CENTER} y1={CENTER}
                    x2={outer.x} y2={outer.y}
                    stroke="#c9ab6d"
                    strokeWidth="0.8"
                    strokeOpacity="0.3"
                  />
                );
              })}

              {/* 数据多边形 */}
              <motion.polygon
                initial={{ points: centerPoints }}
                whileInView={{ points: polygonPoints }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                fill="url(#radarFill)"
                stroke="#ff6b35"
                strokeWidth="2.5"
                strokeLinejoin="round"
                filter="url(#radarGlow)"
              />

              {/* 各职业节点（可点击） */}
              {classes.map((c, i) => {
                const p = getRadarPoint(i, c.value, classes.length, maxCount);
                const outer = getOuterPoint(i, classes.length);
                const color = colorOf(c.name);
                const isActive = activeIdx === i;
                return (
                  <g key={c.name}>
                    {/* 外标签（职业名+人数） */}
                    <g
                      onClick={() => handleNodeClick(i)}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setActiveIdx(i)}
                      onMouseLeave={() => setActiveIdx(null)}
                    >
                      <text
                        x={outer.x}
                        y={outer.y}
                        textAnchor={outer.x === CENTER ? 'middle' : outer.x > CENTER ? 'start' : 'end'}
                        dominantBaseline={outer.y === CENTER ? 'middle' : outer.y > CENTER ? 'hanging' : 'auto'}
                        className="text-xs font-black select-none"
                        fill={color}
                        stroke="#fff8e7"
                        strokeWidth="3"
                        paintOrder="stroke"
                        dy={
                          i === 0 ? '-2' :
                          (i === 2 || i === 3) ? '16' :
                          (i === 1) ? '0' : '16'
                        }
                      >
                        {c.name}
                      </text>
                      <text
                        x={outer.x}
                        y={outer.y + 14}
                        textAnchor={outer.x === CENTER ? 'middle' : outer.x > CENTER ? 'start' : 'end'}
                        dominantBaseline={outer.y > CENTER ? 'hanging' : 'auto'}
                        className="text-[10px] font-bold select-none"
                        fill="#5c3d2e"
                        stroke="#fff8e7"
                        strokeWidth="2"
                        paintOrder="stroke"
                        dy={i === 0 ? '-2' : (i === 2 || i === 3 ? '16' : '0')}
                      >
                        {c.value}人
                      </text>
                    </g>

                    {/* 节点圆点（可点击） */}
                    <motion.circle
                      cx={p.x}
                      cy={p.y}
                      r={isActive ? 9 : 6}
                      fill={color}
                      stroke="white"
                      strokeWidth="2.5"
                      style={{ cursor: 'pointer', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                      onClick={() => handleNodeClick(i)}
                      onMouseEnter={() => setActiveIdx(i)}
                      onMouseLeave={() => setActiveIdx(null)}
                      whileHover={{ scale: 1.3 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </motion.div>

        {/* 底部图例 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2 md:gap-4"
        >
          {classes.map((c, i) => {
            const color = colorOf(c.name);
            return (
              <button
                key={c.name}
                onClick={() => handleNodeClick(i)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#c9ab6d]/40 hover:border-[#ff6b35] hover:shadow-md transition-all text-xs font-bold text-[#5c3d2e]"
              >
                <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
                {c.name}
                <span className="text-[10px] text-[#5c3d2e]/60">· {c.value}人</span>
              </button>
            );
          })}
        </motion.div>
      </div>

      {/* 职业详情 Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md md:max-w-lg p-0 rounded-[0_28px] bg-gradient-to-b from-[#fff8e7] to-white border-4 border-[#c9ab6d]/60 overflow-hidden shadow-2xl">
          <AnimatePresence>
            {selectedClass && (
              <motion.div
                key={selectedClass.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                {/* 关闭按钮 */}
                <DialogClose className="absolute right-3 top-3 z-10 size-8 rounded-full bg-white/90 border-2 border-[#c9ab6d]/60 flex items-center justify-center text-[#5c3d2e] hover:bg-white hover:scale-110 transition-all shadow-md">
                  <X className="size-4" />
                </DialogClose>

                {/* 顶部渐变背景 + 立绘 */}
                <div
                  className="relative h-56 md:h-64 flex items-end justify-center overflow-hidden"
                  style={{
                    background: `linear-gradient(180deg, ${colorOf(selectedClass.name)}22 0%, #fff8e7 100%)`,
                  }}
                >
                  {/* 装饰光点 */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute size-2 rounded-full bg-yellow-300/60"
                        style={{
                          left: `${(i * 8 + 5) % 100}%`,
                          top: `${(i * 13 + 10) % 70}%`,
                        }}
                        animate={{
                          y: [0, -20, 0],
                          opacity: [0.4, 0.9, 0.4],
                        }}
                        transition={{
                          duration: 2 + (i % 3),
                          repeat: Infinity,
                          delay: i * 0.3,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </div>

                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="relative h-52 md:h-60"
                  >
                    <Image
                      src={CLASS_IMAGES[selectedClass.name as CharacterClassName] || CLASS_IMAGES['战士']}
                      alt={selectedClass.name}
                      className="h-full w-auto object-contain drop-shadow-[0_10px_20px_rgba(92_61_46_0.3)]"
                    />
                  </motion.div>
                </div>

                {/* 底部信息 */}
                <div className="px-6 pb-6 pt-2">
                  <div className="flex items-center gap-3 mb-1">
                    <h3
                      className="text-2xl md:text-3xl font-black"
                      style={{
                        color: colorOf(selectedClass.name),
                        textShadow: '1px 1px 0 rgba(92,61,46,0.1)',
                      }}
                    >
                      {selectedClass.name}
                    </h3>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-black text-white"
                      style={{ backgroundColor: colorOf(selectedClass.name) }}
                    >
                      {selectedClass.value === 0 ? '待加入' : `${selectedClass.value}人`}
                    </span>
                  </div>
                  <p className="text-sm text-[#5c3d2e]/70 font-medium mb-4">
                    {CLASS_DESC[selectedClass.name] || DEFAULT_DESC}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-[0_14px] bg-white border-2 border-[#c9ab6d]/40">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Users className="size-3.5 text-[#ff6b35]" />
                        <span className="text-[10px] font-bold text-[#5c3d2e]/60">家族人数</span>
                      </div>
                      <div className="text-xl font-black text-[#5c3d2e]">
                        {selectedClass.value}
                        <span className="text-xs font-bold text-[#5c3d2e]/60 ml-0.5">人</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-[0_14px] bg-white border-2 border-[#c9ab6d]/40">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold text-[#5c3d2e]/60">📈 等级区间</span>
                      </div>
                      <div className="text-lg font-black text-[#5c3d2e]">
                        {selectedClass.value === 0 ? '虚位以待' : `${selectedClass.levelMin}级 ~ ${selectedClass.levelMax}级`}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </section>
  );
}
