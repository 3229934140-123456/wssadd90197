import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { RiskBadge, formatMoney } from '@/components/RiskBadge'
import { ApprovalAction } from '@/components/ApprovalAction'
import { cn } from '@/lib/utils'
import { Gift, RotateCcw, Unlock, Clock, CheckCircle, XCircle, Filter } from 'lucide-react'
import type { ApprovalItem, ApprovalType, UrgencyLevel } from '@/types'

const typeConfig: Record<ApprovalType, { icon: typeof Gift; border: string; iconBg: string }> = {
  excess_gift: { icon: Gift, border: 'border-l-purple-500', iconBg: 'bg-purple-500/20 text-purple-400' },
  special_refund: { icon: RotateCcw, border: 'border-l-blue-500', iconBg: 'bg-blue-500/20 text-blue-400' },
  account_unfreeze: { icon: Unlock, border: 'border-l-teal-500', iconBg: 'bg-teal-500/20 text-teal-400' },
}

const urgencyDot: Record<UrgencyLevel, string> = {
  high: 'bg-risk-red',
  medium: 'bg-risk-yellow',
  low: 'bg-risk-green',
}

export function Approvals() {
  const [tab, setTab] = useState<'pending' | 'processed'>('pending')
  const [selected, setSelected] = useState<ApprovalItem | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const approvals = useAppStore((s) => s.approvals)

  const filtered = approvals.filter((a) =>
    tab === 'pending' ? a.status === 'pending' : a.status !== 'pending'
  )

  const pendingCount = approvals.filter((a) => a.status === 'pending').length
  const processedCount = approvals.length - pendingCount

  const openSheet = (item: ApprovalItem) => {
    setSelected(item)
    setSheetOpen(true)
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      <header className="sticky top-0 z-40 bg-bg-primary/90 backdrop-blur-md border-b border-border-default px-4 py-3">
        <h1 className="text-lg font-bold text-text-primary">审批消息</h1>
      </header>

      <div className="flex gap-2 px-4 py-3">
        {(['pending', 'processed'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors',
              tab === t ? 'bg-accent-primary text-bg-primary' : 'bg-bg-card text-text-secondary')}>
            {t === 'pending' ? `待审批 (${pendingCount})` : `已处理 (${processedCount})`}
            {t === 'pending' && <Filter size={14} />}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-3">
        {filtered.map((item) => {
          const cfg = typeConfig[item.type]
          const Icon = cfg.icon
          const isPending = item.status === 'pending'
          return (
            <div key={item.id}
              className={cn('bg-bg-card rounded-xl border-l-4 p-4 transition-colors', cfg.border)}>
              <div className="flex items-start gap-3">
                <div className={cn('flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center', cfg.iconBg)}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-text-primary truncate">{item.title}</span>
                    <span className={cn('flex-shrink-0 w-2 h-2 rounded-full ml-2', urgencyDot[item.urgency])} />
                  </div>
                  <div className="text-xs text-text-secondary space-y-0.5">
                    <p>{item.memberName} · {item.storeName}</p>
                    <p className="font-mono text-text-primary">¥{formatMoney(item.amount)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={12} className="text-text-muted" />
                      <span className="text-text-muted">{item.applyTime}</span>
                    </div>
                    <div className="mt-1.5">
                      <RiskBadge level={item.memberRiskLevel} size="sm" />
                    </div>
                  </div>

                  {isPending ? (
                    <button onClick={() => openSheet(item)}
                      className="mt-3 w-full py-2 rounded-lg bg-accent-primary/15 text-accent-primary text-sm font-medium transition-colors hover:bg-accent-primary/25">
                      审批
                    </button>
                  ) : (
                    <div className="mt-3 flex items-start gap-2">
                      {item.status === 'approved' ? (
                        <CheckCircle size={16} className="text-risk-green flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle size={16} className="text-risk-red flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className={cn('text-xs font-medium',
                          item.status === 'approved' ? 'text-risk-green' : 'text-risk-red')}>
                          {item.status === 'approved' ? '已批准' : '已驳回'}
                        </span>
                        {item.reason && <p className="text-xs text-text-muted mt-0.5">{item.reason}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-text-muted text-sm">暂无{tab === 'pending' ? '待审批' : '已处理'}消息</div>
        )}
      </div>

      <ApprovalAction approval={selected} open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  )
}
