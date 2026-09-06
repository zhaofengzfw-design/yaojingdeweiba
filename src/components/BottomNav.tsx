import { useLocation } from 'react-router-dom';
import { Home, Users, BarChart3, UserPlus, Info } from 'lucide-react';

const NAV_ITEMS = [
  { label: '首页', href: '#top', icon: Home },
  { label: '招募', href: '#overview', icon: Users },
  { label: '职业', href: '#class-showcase', icon: BarChart3 },
  { label: '成员', href: '#members', icon: UserPlus },
  { label: '入群', href: '#join', icon: Info },
];

export default function BottomNav() {
  const location = useLocation();
  const currentHash = location.hash || '#top';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#fff5d6] to-[#fff8e7]/95 backdrop-blur-xl border-t-3 border-[#c9ab6d]/50 shadow-[0_-4px_20px_rgba(92_61_46_0.15)]">
      <div className="flex items-center justify-around h-16 px-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentHash === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-h-[48px] transition-all ${
                isActive
                  ? 'scale-110 -translate-y-1'
                  : 'opacity-80 hover:opacity-100'
              }`}
            >
              <div
                className={`size-7 p-1.5 rounded-[0_12px] transition-all ${
                  isActive
                    ? 'bg-gradient-to-br from-[#ffd814] to-[#ff6b35] text-[#5c3d2e] shadow-md shadow-orange-400/30'
                    : 'text-[#5c3d2e]/70'
                }`}
              >
                <Icon className="size-full" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={`text-[10px] font-bold ${
                  isActive ? 'text-[#ff6b35]' : 'text-[#5c3d2e]/60'
                }`}
              >
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
      {/* iPhone 安全区 */}
      <div className="h-[env(safe-area-inset-bottom,0)]" />
    </nav>
  );
}
