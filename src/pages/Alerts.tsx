import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Zap, Users, SplitSquareHorizontal, ChevronRight, TrendingUp } from 'lucide-react'
import { getAbnormalMembers } from '@/store/appStore'
import { RiskBadge, formatMoney } from '@/components/RiskBadge'
import { cn } from '@/lib/utils'
import type { MemberAlert } from '@/types'

type AlertFilter = 'all' | 'spike_deposit' | 'consultant_concentrated' | 'frequent_split'

const alertTypeConfig: Record<MemberAlert['type'], { label: string; color: string; border: string; icon: typeof Zap }> = {
  spike_deposit: { label: '冲高充值', color: 'text-risk-red', border: 'border-l-risk-red', icon: Zap },
  consultant_concentrated: { label: '顾问集中', color: 'text-amber-500', border: 'border-l-amber-500', icon: Users },
  frequent_split: { label: '频繁拆单', color: 'text-yellow-400', border: 'border-l-yellow-400', icon: SplitSquareHorizontal },
}

const filterTabs: { key: AlertFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'spike_deposit', label: '冲高充值' },
  { key: 'consultant_concentrated', label: '顾问集中' },
  { key: 'frequent_split', label: '频繁拆单' },
]

export function Alerts() {
  const [activeFilter, setActiveFilter] = useState<AlertFilter>('all')
  const navigate = useNavigate()
  const allMembers = getAbnormalMembers()

  const filteredMembers = activeFilter === 'all'
    ? allMembers
    : allMembers.filter((m) => m.alerts.some((a) => a.type === activeFilter))

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-risk-red" />
          <h1 className="text-lg font-bold text-text-primary">异常会员</h1>
          <span className="text-xs text-text-muted bg-bg-elevated px-2 py-0.5 rounded-full">
            {allMembers.length}
          </span>
        </div>
        <TrendingUp className="w-4 h-4 text-text-muted" />
      </div>

      <div className="flex items-center gap-2">
        {Object.entries(alertTypeConfig).map(([type, config]) => (
          <div key={type} className="flex items-center gap-1">
            <span className={cn('w-2 h-2 rounded-full', config.color.replace('text-', 'bg-'))} />
            <span className="text-[10px] text-text-muted">{config.label}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
              activeFilter === tab.key
                ? 'bg-accent-primary text-bg-primary'
                : 'bg-bg-elevated text-text-secondary'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredMembers.map((member, index) => (
          <div
            key={member.id}
            className="bg-bg-card rounded-xl p-4 animate-slide-up"
            style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
            onClick={() => navigate(`/member/${member.id}`)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text-primary">{member.name}</span>
                <span className="text-xs text-text-muted">{member.phone}</span>
                <RiskBadge level={member.riskLevel} size="sm" />
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted mt-0.5" />
            </div>

            <div className="mt-3 space-y-2">
              {member.alerts.map((alert, i) => {
                const config = alertTypeConfig[alert.type]
                const Icon = config.icon
                return (
                  <div
                    key={i}
                    className={cn('border-l-2 pl-3 py-1.5 bg-bg-elevated/50 rounded-r-lg', config.border)}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className={cn('w-3.5 h-3.5', config.color)} />
                      <span className="text-xs text-text-secondary">{alert.description}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
              <span>余额 <span className="text-accent-primary font-mono font-medium">{formatMoney(member.remainingBalance)}</span></span>
              <span>{member.storeName}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12 text-text-muted text-sm">
          暂无{activeFilter !== 'all' ? filterTabs.find((t) => t.key === activeFilter)?.label : ''}异常会员
        </div>
      )}
    </div>
  )
}
