import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Zap, Users, SplitSquareHorizontal, ChevronRight, Phone, ClipboardCheck, RefreshCw, Banknote, CheckCircle } from 'lucide-react'
import { useAppStore, getAbnormalMembers } from '@/store/appStore'
import { RiskBadge, formatMoney } from '@/components/RiskBadge'
import { cn } from '@/lib/utils'
import type { MemberAlert, DispositionStatus } from '@/types'

type AlertFilter = 'all' | 'spike_deposit' | 'consultant_concentrated' | 'frequent_split'
type DispositionFilter = 'all' | DispositionStatus

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

const dispositionConfig: Record<DispositionStatus, { label: string; bg: string; text: string; icon: typeof Phone }> = {
  pending: { label: '待处理', bg: 'bg-gray-700', text: 'text-gray-300', icon: ClipboardCheck },
  contacted: { label: '已联系', bg: 'bg-blue-900/50', text: 'text-blue-400', icon: Phone },
  needs_review: { label: '需复核', bg: 'bg-yellow-900/40', text: 'text-yellow-400', icon: RefreshCw },
  suggest_refund: { label: '建议退款', bg: 'bg-red-900/40', text: 'text-risk-red', icon: Banknote },
  resolved: { label: '已解决', bg: 'bg-green-900/40', text: 'text-green-400', icon: CheckCircle },
}

const dispositionTabs: { key: DispositionFilter; label: string }[] = [
  { key: 'all', label: '全部处置' },
  { key: 'pending', label: '待处理' },
  { key: 'contacted', label: '已联系' },
  { key: 'needs_review', label: '需复核' },
  { key: 'suggest_refund', label: '建议退款' },
  { key: 'resolved', label: '已解决' },
]

export function Alerts() {
  const [activeFilter, setActiveFilter] = useState<AlertFilter>('all')
  const [activeDisposition, setActiveDisposition] = useState<DispositionFilter>('all')
  const navigate = useNavigate()
  const allMembers = getAbnormalMembers()
  const getMemberDisposition = useAppStore((s) => s.getMemberDisposition)

  const getEffectiveStatus = (memberId: string): DispositionStatus => {
    const d = getMemberDisposition(memberId)
    return d ? d.status : 'pending'
  }

  const filteredMembers = allMembers.filter((m) => {
    const matchAlert = activeFilter === 'all' || m.alerts.some((a) => a.type === activeFilter)
    const matchDisposition = activeDisposition === 'all' || getEffectiveStatus(m.id) === activeDisposition
    return matchAlert && matchDisposition
  })

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

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {dispositionTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveDisposition(tab.key)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border',
              activeDisposition === tab.key
                ? 'bg-accent-primary/20 border-accent-primary text-accent-primary'
                : 'bg-bg-elevated border-transparent text-text-secondary'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredMembers.map((member, index) => {
          const disposition = getMemberDisposition(member.id)
          const effectiveStatus = disposition ? disposition.status : 'pending'
          const statusConfig = dispositionConfig[effectiveStatus]
          const StatusIcon = statusConfig.icon

          return (
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
                <div className="flex items-center gap-2">
                  <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium', statusConfig.bg, statusConfig.text)}>
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig.label}
                  </span>
                  <span>{member.storeName}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12 text-text-muted text-sm">
          暂无符合条件的异常会员
        </div>
      )}
    </div>
  )
}
