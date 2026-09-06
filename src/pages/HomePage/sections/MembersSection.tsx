import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, Clock, Gift, Search, X, Shield, Zap, Star, Target, Sword, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type IMember } from '@/data/members';
import { CLASS_COLORS } from '@/lib/chart-colors';
import { useSiteData } from '@/data/site-data';
import { useActiveClass } from '../ActiveClassContext';

const CLASS_ICONS: Record<string, typeof Shield> = {
  战士: Shield,
  飞侠: Zap,
  魔法师: Star,
  弓箭手: Target,
  海盗: Sword,
};
const FALLBACK_ICON = Shield;

const CLASS_EMOJI: Record<string, string> = {
  战士: '⚔️',
  飞侠: '🗡️',
  魔法师: '🔮',
  弓箭手: '🏹',
  海盗: '🏴‍☠️',
};
const FALLBACK_EMOJI = '🎲';

export default function MembersSection() {
  const { members, stats } = useSiteData();
  const classList = stats.classDistribution.map((c) => c.name);

  const [keyword, setKeyword] = useState('');
  const [filterClass, setFilterClass] = useState<string | 'all'>('all');
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(
    () => new Set(members.map((m) => m.characterClass).filter((cls) => classList.includes(cls)))
  );
  const { setActiveClass } = useActiveClass();

  const filtered = useMemo(() => {
    let list = members;
    if (filterClass !== 'all') {
      list = list.filter((m) => m.characterClass === filterClass);
    }
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      list = list.filter(
        (m) => m.gameId.toLowerCase().includes(kw) || m.characterClass.toLowerCase().includes(kw)
      );
    }
    return [...list].sort((a, b) => b.level - a.level);
  }, [members, keyword, filterClass]);

  const grouped = useMemo(() => {
    const groups: Record<string, IMember[]> = {};
    filtered.forEach((m) => {
      if (!groups[m.characterClass]) groups[m.characterClass] = [];
      groups[m.characterClass].push(m);
    });
    return groups;
  }, [filtered]);

  const toggleClass = (cls: string) => {
    setExpandedClasses((prev) => {
      const next = new Set(prev);
      if (next.has(cls)) next.delete(cls);
      else next.add(cls);
      return next;
    });
  };

  const classCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach((m) => { counts[m.characterClass] = (counts[m.characterClass] || 0) + 1; });
    return counts;
  }, [members]);

  return (
    <section id="members" className="w-full py-16 md:py-24 bg-gradient-to-b from-[#fff5d6] via-[#fff8e7] to-[#fff5d6] relative overflow-hidden">
      <div className="absolute top-10 left-10 text-5xl opacity-15">⚔️</div>
      <div className="absolute bottom-10 right-10 text-5xl opacity-15">🛡️</div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-10"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/80 backdrop-blur border-2 border-[#c9ab6d]/60 mb-4">
            <Users className="size-4 text-[#ff6b35]" />
            <span className="text-sm font-black text-[#5c3d2e]">家族名册</span>
          </div>
          <h2
            className="text-3xl md:text-5xl font-black text-[#5c3d2e] mb-3"
            style={{ textShadow: '2px 2px 0 rgba(255,215,0,0.5)' }}
          >
            家族成员名录
          </h2>
          <p className="text-[#5c3d2e]/70 font-medium">
            按职业分组展示，等级从高到低排列
          </p>
        </motion.div>

        {/* 搜索 + 筛选 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row gap-3 mb-8"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#5c3d2e]/40" />
            <Input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索游戏ID或职业..."
              className="pl-9 h-11 rounded-[0_14px] border-2 border-[#c9ab6d]/50 bg-white focus:border-[#ff6b35] focus:ring-[#ff6b35] font-medium"
            />
            {keyword && (
              <Button
                variant="ghost"
                size="icon"
                className="!absolute right-1 top-1/2 z-20 h-8 w-8 -translate-y-1/2"
                onClick={() => setKeyword('')}
                aria-label="清除搜索"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 md:pb-0">
            <Button
              variant={filterClass === 'all' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setFilterClass('all')}
              className={`rounded-[0_12px] h-11 px-4 font-black text-sm shrink-0 border-2 ${
                filterClass === 'all'
                  ? 'bg-gradient-to-b from-[#ffd814] to-[#ff6b35] border-[#c9ab6d] text-[#5c3d2e] shadow-md'
                  : 'bg-white border-[#c9ab6d]/50 text-[#5c3d2e] hover:bg-[#fff5d6]'
              }`}
            >
              全部
            </Button>
            {classList.map((cls) => {
              const Icon = CLASS_ICONS[cls] || FALLBACK_ICON;
              const colors = CLASS_COLORS[cls as keyof typeof CLASS_COLORS] || { primary: '#C9AB6D' };
              const active = filterClass === cls;
              return (
                <Button
                  key={cls}
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setFilterClass(active ? 'all' : cls);
                    if (!active) {
                      setActiveClass(cls as never);
                      setExpandedClasses((prev) => new Set(prev).add(cls));
                    }
                  }}
                  className={`rounded-[0_12px] h-11 px-3 font-black text-sm shrink-0 border-2 gap-1.5 ${
                    active ? 'shadow-md' : 'bg-white hover:bg-[#fff5d6]'
                  }`}
                  style={active
                    ? { backgroundColor: colors.primary, borderColor: colors.primary, color: 'white' }
                    : { borderColor: '#c9ab6d80', color: '#5c3d2e' }}
                >
                  <Icon className="size-4" />
                  {cls}
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/30">
                    {classCounts[cls] || 0}
                  </span>
                </Button>
              );
            })}
          </div>
        </motion.div>

        {/* 空态 */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <div className="font-black text-[#5c3d2e] text-lg">暂无匹配成员</div>
            <div className="text-sm text-[#5c3d2e]/60 mt-1">试试其他关键词吧</div>
          </div>
        )}

        {/* WEB端：按职业分组的卡片网格 */}
        <div className="hidden md:block space-y-8">
          {classList.filter((cls) => grouped[cls]?.length > 0 || filterClass === 'all').map((cls) => {
            const groupMembers = grouped[cls] || [];
            if (groupMembers.length === 0) return null;
            const Icon = CLASS_ICONS[cls] || FALLBACK_ICON;
            const colors = CLASS_COLORS[cls as keyof typeof CLASS_COLORS] || { primary: '#C9AB6D' };
            const isExpanded = expandedClasses.has(cls);

            return (
              <motion.div
                key={cls}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                {/* 分组标题栏 */}
                <button
                  onClick={() => toggleClass(cls)}
                  className="w-full flex items-center justify-between p-4 rounded-[0_24px] bg-gradient-to-r from-white to-[#fff8e7] border-3 hover:shadow-lg transition-shadow group"
                  style={{ borderColor: colors.primary + '50' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="size-12 rounded-[0_16px] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Icon className="size-6 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black" style={{ color: colors.primary }}>{cls}</span>
                        <Badge variant="outline" className="rounded-[0_10px] border-[#c9ab6d]/50">
                          {groupMembers.length} 人
                        </Badge>
                      </div>
                      <div className="text-xs text-[#5c3d2e]/60 font-medium">
                        等级范围：{Math.max(...groupMembers.map((m) => m.level))} - {Math.min(...groupMembers.map((m) => m.level))}级
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#5c3d2e]/60">
                      {isExpanded ? '收起' : '展开'}
                    </span>
                    <div className="size-8 rounded-full bg-[#fff5d6] flex items-center justify-center">
                      {isExpanded ? (
                        <ChevronUp className="size-4" style={{ color: colors.primary }} />
                      ) : (
                        <ChevronDown className="size-4" style={{ color: colors.primary }} />
                      )}
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4 pl-4 border-l-4" style={{ borderColor: colors.primary + '40' }}>
                        {groupMembers.map((member, idx) => (
                          <MemberCard key={`${member.gameId}-${idx}`} member={member} index={idx} classColor={colors.primary} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* 移动端：紧凑列表 */}
        <div className="md:hidden space-y-4">
          {classList.filter((cls) => grouped[cls]?.length > 0).map((cls) => {
            const groupMembers = grouped[cls] || [];
            if (groupMembers.length === 0) return null;
            const Icon = CLASS_ICONS[cls] || FALLBACK_ICON;
            const colors = CLASS_COLORS[cls as keyof typeof CLASS_COLORS] || { primary: '#C9AB6D' };
            const isExpanded = expandedClasses.has(cls);

            return (
              <motion.div
                key={cls}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <button
                  onClick={() => toggleClass(cls)}
                  className="w-full flex items-center justify-between p-3 rounded-[0_18px] bg-gradient-to-r from-white to-[#fff8e7] border-2 shadow-sm"
                  style={{ borderColor: colors.primary + '40' }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="size-9 rounded-[0_12px] flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Icon className="size-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-black" style={{ color: colors.primary }}>{cls}</span>
                        <span className="text-[10px] font-bold text-[#5c3d2e]/60">({groupMembers.length}人)</span>
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="size-4" style={{ color: colors.primary }} />
                  ) : (
                    <ChevronDown className="size-4" style={{ color: colors.primary }} />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-2.5 mt-2.5 ml-2 pl-2.5 border-l-2" style={{ borderColor: colors.primary + '30' }}>
                        {groupMembers.map((m, idx) => (
                          <MobileMemberCard key={`${m.gameId}-${idx}`} member={m} classColor={colors.primary} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* 总人数统计 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-10 md:mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-[0_20px] bg-white/90 backdrop-blur border-2 border-[#c9ab6d]/60 shadow-md">
            <Crown className="size-5 text-[#ffd814]" />
            <span className="font-black text-[#5c3d2e]">
              共 <span className="text-[#ff6b35] text-xl">{members.length}</span> 位家族成员
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ===== WEB 端卡片 =====
function MemberCard({ member, index, classColor }: { member: IMember; index: number; classColor: string }) {
  const isTop1 = index === 0;
  const isTop3 = index < 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className={`relative group ${isTop1 ? 'md:col-span-1' : ''}`}
    >
      <div className="relative p-4 rounded-[0_22px] bg-white border-3 shadow-lg hover:shadow-xl transition-all overflow-hidden"
        style={{ borderColor: classColor + '40' }}
      >
        {/* 顶部色条 */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: classColor }} />

        {/* 冠军徽章 */}
        {isTop1 && (
          <div className="absolute -top-1 -right-1 z-10">
            <div className="size-12 rounded-full bg-gradient-to-b from-[#ffd814] to-[#ff8c42] border-3 border-white flex items-center justify-center shadow-lg animate-bounce">
              <Crown className="size-5 text-white" />
            </div>
          </div>
        )}

        <div className="flex items-start gap-3 mb-3">
          {/* 头像 */}
          <div
            className="relative size-14 rounded-[0_16px] flex items-center justify-center shrink-0 text-2xl shadow-md"
            style={{ backgroundColor: classColor + '15' }}
          >
            <span className="text-2xl">
              {CLASS_EMOJI[member.characterClass] || FALLBACK_EMOJI}
            </span>
            {isTop3 && (
              <span className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-gradient-to-b from-[#ffd814] to-[#ff8c42] text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
                {index + 1}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-black text-[#5c3d2e] truncate text-base">{member.gameId}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="text-xs px-1.5 py-0.5 rounded-[0_8px] font-bold text-white"
                  style={{ backgroundColor: classColor }}
                >
                  {member.characterClass}
                </span>
              <span className="text-xs font-black text-[#ff6b35]">Lv.{member.level}</span>
            </div>
          </div>
        </div>

        {/* 信息行 */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <Clock className="size-3.5 text-[#5c3d2e]/50 shrink-0" />
            <span className="text-[#5c3d2e]/70 font-medium truncate">在线时长：{member.onlineDuration}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Gift className="size-3.5 text-[#5c3d2e]/50 shrink-0" />
            <span className="text-[#5c3d2e]/70 font-medium truncate">欢迎礼：{member.welcomeGift || '待选'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ===== 移动端紧凑卡片 =====
function MobileMemberCard({ member, classColor }: { member: IMember; classColor: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="p-2.5 rounded-[0_16px] bg-white border-2 shadow-sm"
      style={{ borderColor: classColor + '35' }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="size-7 rounded-[0_10px] flex items-center justify-center shrink-0 text-base"
          style={{ backgroundColor: classColor + '15' }}
        >
          {CLASS_EMOJI[member.characterClass] || FALLBACK_EMOJI}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-[#5c3d2e] text-sm truncate">{member.gameId}</div>
          <div className="text-[10px] text-[#ff6b35] font-black">Lv.{member.level}</div>
        </div>
      </div>
      <div className="flex items-center gap-1 text-[10px] text-[#5c3d2e]/60">
        <Clock className="size-2.5 shrink-0" />
        <span className="truncate">{member.onlineDuration}</span>
      </div>
    </motion.div>
  );
}
