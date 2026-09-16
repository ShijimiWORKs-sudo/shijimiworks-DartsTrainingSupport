import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
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

/** どの画面でも戻れるように（§6フィードバック）。トップ画面では非表示。 */
function BackBar() {
  const location = useLocation();
  const navigate = useNavigate();
  if (location.pathname === '/') return null;
  return (
    <div className="lg:hidden sticky top-0 z-10 -mx-4 mb-2 bg-[#f3f4f7]/95 px-4 pt-1 pb-2 backdrop-blur-sm lg:mx-0 lg:px-0">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex min-h-[40px] items-center gap-1 rounded-lg bg-white px-3 text-sm font-bold text-ink-900/70 shadow-card active:bg-ink-900/5 touch-manipulation"
      >
        ← 戻る
      </button>
    </div>
  );
}

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

      {/* Mobile top nav (§7フィードバック: 下部固定から上部固定へ移動) */}
      <nav
        className="lg:hidden fixed top-0 left-0 right-0 z-20 flex gap-0.5 overflow-x-auto bg-white border-b border-black/[0.06] px-1"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 min-h-[52px] min-w-[60px] shrink-0 touch-manipulation',
                isActive ? 'text-brand-600' : 'text-ink-900/40',
              )
            }
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="text-[10px] font-bold leading-none whitespace-nowrap">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-[calc(52px+env(safe-area-inset-top,0px))] pb-8 lg:pt-0">
        <div className="mx-auto max-w-5xl px-4 pt-3 pb-6 lg:px-8 lg:pt-8">
          <BackBar />
          <Outlet />
        </div>
      </main>
    </div>
  );
}
