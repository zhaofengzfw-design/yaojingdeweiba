import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { CharacterClassName } from '@/data/assets';

interface ActiveClassContextValue {
  activeClass: CharacterClassName;
  setActiveClass: (cls: CharacterClassName) => void;
  scrollAndSetActive: (cls: CharacterClassName) => void;
}

const ActiveClassContext = createContext<ActiveClassContextValue | null>(null);

export function ActiveClassProvider({ children }: { children: ReactNode }) {
  const [activeClass, setActiveClass] = useState<CharacterClassName>('战士');

  const scrollAndSetActive = useCallback((cls: CharacterClassName) => {
    setActiveClass(cls);
    // 延迟到下一帧，确保 state 更新后再滚动
    requestAnimationFrame(() => {
      const el = document.getElementById('class-showcase');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }, []);

  return (
    <ActiveClassContext.Provider value={{ activeClass, setActiveClass, scrollAndSetActive }}>
      {children}
    </ActiveClassContext.Provider>
  );
}

export function useActiveClass() {
  const ctx = useContext(ActiveClassContext);
  if (!ctx) throw new Error('useActiveClass must be used within ActiveClassProvider');
  return ctx;
}
