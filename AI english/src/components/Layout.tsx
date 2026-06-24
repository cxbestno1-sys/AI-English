import { useLocation, useNavigate } from 'react-router-dom'
import { Headphones, BookOpen, Home, Award, Settings, History } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  
  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/history', icon: History, label: '记录' },
    { path: '/learn/latest', icon: Headphones, label: '学习' },
    { path: '/profile', icon: Award, label: '我的' },
    { path: '/settings', icon: Settings, label: '设置' },
  ]

  const isActive = (path: string) => {
    if (path === '/learn/latest') {
      return location.pathname.startsWith('/learn')
    }
    return location.pathname === path
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <main className="max-w-lg mx-auto px-4 py-6">
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-sm">
        <div className="max-w-lg mx-auto flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center py-2 px-3 min-w-0 flex-1 ${
                  active ? 'text-primary-600' : 'text-slate-400'
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
