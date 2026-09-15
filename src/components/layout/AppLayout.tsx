import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';

const NAV_ITEMS = [
  { to: '/', label: 'ダッシュボード', icon: '🎯' },
  { to: '/training', label: '今日の練習', icon: '📝' },
  { to: '/missions', label: 'ミッション', icon: '✅' },
  { to: '/history', label: '履歴', icon: '📅' },
  { to: '/charts', label: 'グラフ', icon: '📈' },
  { to: '/weakness', label: '弱点分析', icon: '🔎' },
  { to: '/settings', label: '設定', icon: '⚙️' },
];

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f3f4f7] lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:shrink-0 border-r border-black/[0.06] bg-white px-3 py-6">
        <div className="px-3 mb-6">
          <div className="text-lg font-extrabold text-ink-900">🎯 Darts Training</div>
          <div className="text-xs text-ink-900/40 font-medium">Support</div>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors',
                  isActive ? 'bg-brand-500 text-white' : 'text-ink-900/60 hover:bg-ink-900/5',
                )
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 pb-24 lg:pb-8">
        <div className="mx-auto max-w-5xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-6 lg:px-8 lg:pt-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-black/[0.06] flex justify-between px-1 z-20"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] touch-manipulation',
                isActive ? 'text-brand-600' : 'text-ink-900/40',
              )
            }
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="text-[10px] font-bold leading-none">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
