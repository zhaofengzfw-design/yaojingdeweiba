import { useState, useEffect, useRef } from 'react';
import { Menu, X, QrCode, Sparkles, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

const NAV_ITEMS = [
  { label: '招募概况', href: '#overview' },
  { label: '职业分布', href: '#class-showcase' },
  { label: '成员名录', href: '#members' },
  { label: '需求洞察', href: '#insights' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 首次滚动后隐藏引导提示
  useEffect(() => {
    if (scrolled) setShowHint(false);
  }, [scrolled]);

  // 右侧边缘滑动手势：从屏幕右边缘向左滑打开抽屉
  useEffect(() => {
    const isMobile = () => window.innerWidth < 1024;

    const onTouchStart = (e: TouchEvent) => {
      if (!isMobile() || drawerOpen) return;
      const touch = e.touches[0];
      // 只在屏幕右边缘 30px 内触发
      if (touch.clientX > window.innerWidth - 30) {
        touchStartX.current = touch.clientX;
        touchStartY.current = touch.clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchStartX.current === null) return;
      const touch = e.touches[0];
      const dx = touchStartX.current - touch.clientX;
      const dy = Math.abs((touchStartY.current ?? 0) - touch.clientY);
      // 横向滑动优先，且滑动距离 > 50px
      if (dx > 50 && dx > dy) {
        setDrawerOpen(true);
        touchStartX.current = null;
        touchStartY.current = null;
      }
    };

    const onTouchEnd = () => {
      touchStartX.current = null;
      touchStartY.current = null;
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [drawerOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-gradient-to-b from-[#fff8e7]/95 to-[#fff5d6]/90 backdrop-blur-xl shadow-[0_4px_20px_rgba(92_61_46_0.12)] border-b-2 border-[#c9ab6d]/40'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex h-16 md:h-20 items-center justify-between">
        {/* Logo */}
        <a href="#top" className="flex items-center gap-2 group shrink-0">
          <div className="relative size-10 md:size-11 rounded-[0_16px] bg-gradient-to-br from-[#ffd814] via-[#ffb347] to-[#ff6b35] flex items-center justify-center shadow-lg shadow-orange-400/30 group-hover:scale-105 transition-transform border-2 border-[#5c3d2e]/20">
            <Sparkles className="size-5 md:size-6 text-[#5c3d2e]" />
          </div>
          <div className="flex flex-col leading-tight">
            <span
              className="text-base md:text-lg font-black tracking-[0.05em]"
              style={{
                fontFamily: "'Noto Serif SC', 'Noto Sans SC', serif",
                background: 'linear-gradient(180deg, #5c3d2e 0%, #8b5a3c 50%, #5c3d2e 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 1px 0 rgba(255,215,0,0.4))',
              }}
            >
              妖精的尾巴
            </span>
            <span
              className="text-[9px] md:text-[10px] tracking-[0.3em] font-black"
              style={{
                fontFamily: "'Playfair Display', serif",
                background: 'linear-gradient(180deg, #ffd814, #c9ab6d)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              FAIRY TAIL
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-4 py-2 text-sm font-bold rounded-[0_14px] transition-all duration-200 text-[#5c3d2e]/80 hover:bg-[#ffd814]/30 hover:text-[#5c3d2e]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <a href="#join">
            <Button
              size="sm"
              className="h-10 px-5 gap-2 rounded-[0_18px] bg-gradient-to-b from-[#ffd814] via-[#ffb347] to-[#ff8c42] text-[#5c3d2e] font-black border-2 border-[#c9ab6d] shadow-lg shadow-orange-400/30 hover:scale-105 hover:shadow-xl hover:shadow-orange-400/40 transition-all"
            >
              <QrCode className="size-4" />
              扫码入群
            </Button>
          </a>
        </div>

        {/* Mobile / Tablet Menu - Drawer */}
        <div className="lg:hidden">
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-10 text-[#5c3d2e] relative"
                onClick={() => setShowHint(false)}
              >
                <Menu className="size-5" />
                {/* 引导提示：右滑打开 */}
                {showHint && (
                  <span className="absolute -left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 whitespace-nowrap">
                    <span className="inline-flex items-center gap-0.5 px-2 py-1 rounded-full bg-[#5c3d2e] text-white text-[10px] font-bold shadow-lg animate-pulse">
                      <ChevronLeft className="size-3" />
                      右滑打开
                    </span>
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] sm:w-[320px] p-0 bg-gradient-to-b from-[#fff8e7] to-[#fff5d6] border-l-4 border-[#c9ab6d]">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-5 border-b-2 border-[#c9ab6d]/30">
                  <div className="flex items-center gap-2">
                    <div className="size-9 rounded-[0_14px] bg-gradient-to-br from-[#ffd814] to-[#ff6b35] flex items-center justify-center border-2 border-[#5c3d2e]/20">
                      <Sparkles className="size-4 text-[#5c3d2e]" />
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-black text-[#5c3d2e]">妖精的尾巴</span>
                      <span className="text-[9px] text-[#c9ab6d] tracking-widest font-bold">FAIRY TAIL</span>
                    </div>
                  </div>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="size-8 text-[#5c3d2e]">
                      <X className="size-4" />
                    </Button>
                  </SheetClose>
                </div>
                <nav className="flex-1 flex flex-col gap-2 p-4">
                  {NAV_ITEMS.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <a
                        href={item.href}
                        className="px-4 py-3 rounded-[0_16px] text-sm font-bold transition-all text-[#5c3d2e]/80 hover:bg-[#ffd814]/30"
                      >
                        {item.label}
                      </a>
                    </SheetClose>
                  ))}
                </nav>
                <div className="p-4 border-t-2 border-[#c9ab6d]/30">
                  <SheetClose asChild>
                    <a href="#join" className="block">
                      <Button className="w-full gap-2 rounded-[0_18px] bg-gradient-to-b from-[#ffd814] via-[#ffb347] to-[#ff8c42] text-[#5c3d2e] font-black border-2 border-[#c9ab6d] shadow-lg">
                        <QrCode className="size-4" />
                        扫码入群
                      </Button>
                    </a>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
