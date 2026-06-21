import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Building2, AlertTriangle, CheckSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/appStore'

const tabs = [
  { path: '/', label: '概览', icon: LayoutDashboard },
  { path: '/stores', label: '门店', icon: Building2 },
  { path: '/alerts', label: '异常', icon: AlertTriangle },
  { path: '/approvals', label: '审批', icon: CheckSquare },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const getPendingApprovalCount = useAppStore((s) => s.getPendingApprovalCount)
  const pendingCount = getPendingApprovalCount()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-bg-card/95 backdrop-blur-lg border-t border-border-default z-50 safe-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const active = isActive(tab.path)
          const Icon = tab.icon
          const showBadge = tab.path === '/approvals' && pendingCount > 0
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 w-16 h-full relative transition-colors',
                active ? 'text-accent-primary' : 'text-text-muted hover:text-text-secondary'
              )}
            >
              <div className="relative">
                <Icon className={cn('w-5 h-5', active && 'drop-shadow-[0_0_6px_rgba(0,212,170,0.5)]')} strokeWidth={active ? 2.5 : 2} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 flex items-center justify-center bg-risk-red text-white text-[10px] font-bold rounded-full px-1">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </div>
              <span className={cn('text-[10px]', active && 'font-medium')}>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
