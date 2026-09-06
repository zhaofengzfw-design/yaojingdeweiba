import { motion } from 'framer-motion';
import { QrCode, MessageCircle, Users, Sparkles, MapPin, Phone } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { useSiteData } from '@/data/site-data';

export default function JoinSection() {
  const { members, config } = useSiteData();
  const memberCount = members.length;
  const activeCount = members.filter(
    (m) => m.onlineDuration !== '1-3小时' && m.onlineDuration !== '未知'
  ).length;
  const qr = config.qrImage;

  return (
    <section id="join" className="w-full py-16 md:py-28 relative overflow-hidden bg-gradient-to-b from-[#5c3d2e] via-[#7a4e3a] to-[#5c3d2e]">
      {/* 背景装饰 - 枫叶光点 */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${3 + (i % 4)}px`,
              height: `${3 + (i % 4)}px`,
              left: `${(i * 3.7) % 100}%`,
              top: `${(i * 7.3) % 100}%`,
              backgroundColor: i % 3 === 0 ? '#ffd814' : i % 3 === 1 ? '#ff8c42' : '#ffffff',
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + (i % 5),
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* 暖光从底部照上来 */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-gradient-to-t from-[#ff6b35]/30 to-transparent blur-3xl" />

      <div className="relative max-w-5xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 mb-4">
            <MessageCircle className="size-4 text-[#ffd814]" />
            <span className="text-sm font-black text-white/90">加入我们</span>
          </div>
          <h2
            className="text-3xl md:text-5xl font-black mb-4"
            style={{
              color: '#ffd814',
              textShadow: '2px 2px 0 #5c3d2e, 4px 4px 0 rgba(0,0,0,0.3)',
            }}
          >
            妖精的尾巴 · 虚位以待
          </h2>
          <p className="text-white/70 text-base md:text-lg font-medium max-w-xl mx-auto">
            扫码加入家族{config.groupInfo}，开启你的冒险之旅！
            <br className="hidden md:block" />
            {memberCount} 位伙伴已经在等你了~
          </p>
        </motion.div>

        {/* WEB端：左右布局 */}
        <div className="hidden md:grid grid-cols-2 gap-10 items-center">
          {/* 左侧：二维码卡片 */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative">
              {/* 装饰边框 */}
              <div className="absolute -inset-3 bg-gradient-to-br from-[#ffd814] via-[#ff8c42] to-[#ff6b35] rounded-[0_36px] shadow-2xl shadow-orange-500/40" />
              <div className="relative p-6 bg-white rounded-[0_32px]">
                <Image
                  src={qr}
                  alt="入群二维码"
                  className="w-56 h-56 object-contain rounded-[0_24px]"
                />
                <div className="mt-4 text-center">
                  <div className="font-black text-[#5c3d2e] text-lg">扫码加入</div>
                  <div className="text-xs text-[#5c3d2e]/60 mt-0.5">{config.groupInfo}</div>
                </div>
              </div>
              {/* 角标装饰 */}
              <div className="absolute -top-3 -right-3 size-12 rounded-full bg-[#ffd814] border-4 border-[#5c3d2e] flex items-center justify-center animate-bounce">
                <Sparkles className="size-5 text-[#5c3d2e]" />
              </div>
            </div>
          </motion.div>

          {/* 右侧：入群说明 */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-5"
          >
            <div className="flex items-start gap-4">
              <div className="size-11 rounded-[0_14px] bg-gradient-to-br from-[#ffd814] to-[#ff8c42] flex items-center justify-center shrink-0 shadow-lg">
                <Users className="size-5 text-[#5c3d2e]" />
              </div>
              <div>
                <h3 className="text-white font-black text-lg mb-1">家族氛围轻松</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  我们是一群热爱冒险岛的小伙伴，不论你是大神还是萌新，都能在这里找到属于自己的位置。
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="size-11 rounded-[0_14px] bg-gradient-to-br from-[#87CEEB] to-[#7CB342] flex items-center justify-center shrink-0 shadow-lg">
                <MapPin className="size-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-black text-lg mb-1">日常活动丰富</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  每日组队打本、家族团建活动、语音欢乐聊天，冒险路上不再孤单。
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="size-11 rounded-[0_14px] bg-gradient-to-br from-[#C9AB6D] to-[#ff6b35] flex items-center justify-center shrink-0 shadow-lg">
                <Phone className="size-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-black text-lg mb-1">在线氛围浓厚</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  家族里 {activeCount} 位成员日均在线 3 小时以上，组队开黑，随时都有伴。
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Button
                size="lg"
                className="h-14 px-8 gap-2 rounded-[0_22px] bg-gradient-to-b from-[#ffd814] via-[#ffb347] to-[#ff6b35] text-[#5c3d2e] font-black border-2 border-[#ffd814] shadow-xl shadow-orange-500/40 hover:scale-105 transition-all text-base"
                onClick={() => {
                  navigator.clipboard?.writeText('妖精的尾巴').catch(() => {});
                }}
              >
                <QrCode className="size-5" />
                扫码立即加入
              </Button>
              <p className="text-white/40 text-xs mt-2">扫码加入后，请报游戏 ID 验证身份</p>
            </div>
          </motion.div>
        </div>

        {/* 移动端：上下布局 */}
        <div className="md:hidden flex flex-col items-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute -inset-2.5 bg-gradient-to-br from-[#ffd814] via-[#ff8c42] to-[#ff6b35] rounded-[0_28px] shadow-xl" />
            <div className="relative p-4 bg-white rounded-[0_24px]">
              <Image
                src={qr}
                alt="入群二维码"
                className="w-44 h-44 object-contain rounded-[0_18px]"
              />
              <div className="mt-3 text-center">
                <div className="font-black text-[#5c3d2e]">扫码加入</div>
                <div className="text-[10px] text-[#5c3d2e]/60">{config.groupInfo}</div>
              </div>
            </div>
            <div className="absolute -top-2 -right-2 size-10 rounded-full bg-[#ffd814] border-3 border-[#5c3d2e] flex items-center justify-center animate-bounce">
              <Sparkles className="size-4 text-[#5c3d2e]" />
            </div>
          </motion.div>

          <div className="w-full space-y-3.5">
            {[
              { icon: Users, title: '家族氛围轻松', desc: '不论大神萌新，都有自己的位置' },
              { icon: MapPin, title: '日常活动丰富', desc: '组队打本、家族团建、欢乐聊天' },
              { icon: Phone, title: '在线氛围浓厚', desc: `${activeCount} 位成员日均在线 3 小时+` },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
                className="flex items-start gap-3 p-3.5 rounded-[0_18px] bg-white/10 backdrop-blur border border-white/15"
              >
                <div
                  className="size-9 rounded-[0_12px] flex items-center justify-center shrink-0 shadow-md"
                  style={{
                    background: i === 0
                      ? 'linear-gradient(135deg, #ffd814, #ff8c42)'
                      : i === 1
                        ? 'linear-gradient(135deg, #87CEEB, #7CB342)'
                        : 'linear-gradient(135deg, #C9AB6D, #ff6b35)',
                  }}
                >
                  <item.icon className="size-4 text-white" />
                </div>
                <div>
                  <div className="text-white font-black text-sm">{item.title}</div>
                  <div className="text-white/60 text-xs mt-0.5">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <Button
            size="lg"
            className="w-full h-12 gap-2 rounded-[0_18px] bg-gradient-to-b from-[#ffd814] via-[#ffb347] to-[#ff6b35] text-[#5c3d2e] font-black border-2 border-[#ffd814] shadow-lg"
            onClick={() => {
              navigator.clipboard?.writeText('妖精的尾巴').catch(() => {});
            }}
          >
            <QrCode className="size-4" />
            扫码立即加入
          </Button>
        </div>
      </div>

      {/* 底部安全区 - 配合移动端底部导航 */}
      <div className="md:hidden h-20" />
    </section>
  );
}
