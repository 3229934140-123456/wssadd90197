import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { RiskBadge, formatMoney } from '@/components/RiskBadge'
import { ApprovalAction } from '@/components/ApprovalAction'
import { cn } from '@/lib/utils'
import {
  Bell, FileText, AlertTriangle, CheckSquare, Gift, RotateCcw,
  Unlock, Clock, CheckCircle, XCircle, ChevronRight, MapPin, Calendar, Mic,
} from 'lucide-react'
import type { ApprovalItem, ApprovalType, UrgencyLevel, RegionWeeklyDetail, NotificationMessage } from '@/types'

type Tab = '审批' | '周报' | '通知'
type ApprovalTab = 'pending' | 'processed'

const typeConfig: Record<ApprovalType, { icon: typeof Gift; border: string; iconBg: string }> = {
  excess_gift: { icon: Gift, border: 'border-l-purple-500', iconBg: 'bg-purple-500/20 text-purple-400' },
  special_refund: { icon: RotateCcw, border: 'border-l-blue-500', iconBg: 'bg-blue-500/20 text-blue-400' },
  account_unfreeze: { icon: Unlock, border: 'border-l-teal-500', iconBg: 'bg-teal-500/20 text-teal-400' },
}

const urgencyDot: Record<UrgencyLevel, string> = {
  high: 'bg-risk-red', medium: 'bg-risk-yellow', low: 'bg-risk-green',
}

const riskBg: Record<string, string> = {
  red: 'bg-risk-redBg/40', yellow: 'bg-risk-yellowBg/40', green: 'bg-risk-greenBg/40',
}

export function Messages() {
  const [tab, setTab] = useState<Tab>('审批')
  const [approvalTab, setApprovalTab] = useState<ApprovalTab>('pending')
  const [selected, setSelected] = useState<ApprovalItem | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const navigate = useNavigate()
  const approvals = useAppStore((s) => s.approvals)
  const notifications = useAppStore((s) => s.notifications)
  const markNotificationRead = useAppStore((s) => s.markNotificationRead)
  const unreadCount = useAppStore((s) => s.getUnreadNotificationCount())

  const pendingCount = approvals.filter((a) => a.status === 'pending').length
  const processedCount = approvals.length - pendingCount
  const filteredApprovals = approvals.filter((a) =>
    approvalTab === 'pending' ? a.status === 'pending' : a.status !== 'pending',
  )

  const weeklyReports = notifications.filter((n) => n.type === 'weekly_report')
  const otherNotifs = notifications.filter((n) => n.type !== 'weekly_report')

  const toggleExpand = (id: string) => {
    const notif = notifications.find((n) => n.id === id)
    if (notif && !notif.read) markNotificationRead(id)
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const handleNotifClick = (n: NotificationMessage) => {
    if (!n.read) markNotificationRead(n.id)
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      <header className="sticky top-0 z-40 bg-bg-primary/90 backdrop-blur-md border-b border-border-default px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-text-primary">消息中心</h1>
          {unreadCount > 0 && (
            <span className="bg-accent-primary text-bg-primary text-xs font-bold rounded-full px-2 py-0.5">
              {unreadCount}
            </span>
          )}
        </div>
      </header>

      <div className="flex gap-2 px-4 py-3">
        {(['审批', '周报', '通知'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('px-4 py-2 rounded-full text-sm font-medium transition-colors',
              tab === t ? 'bg-accent-primary text-bg-primary' : 'bg-bg-card text-text-secondary')}>
            {t}
          </button>
        ))}
      </div>

      {tab === '审批' && (
        <>
          <div className="flex gap-2 px-4 pb-3">
            {(['pending', 'processed'] as ApprovalTab[]).map((t) => (
              <button key={t} onClick={() => setApprovalTab(t)}
                className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                  approvalTab === t ? 'bg-accent-primary/15 text-accent-primary' : 'bg-bg-card text-text-secondary')}>
                {t === 'pending' ? `待审批 (${pendingCount})` : `已处理 (${processedCount})`}
              </button>
            ))}
          </div>
          <div className="px-4 space-y-3">
            {filteredApprovals.map((item) => {
              const cfg = typeConfig[item.type]
              const Icon = cfg.icon
              const isPending = item.status === 'pending'
              return (
                <div key={item.id} className={cn('bg-bg-card rounded-xl border-l-4 p-4', cfg.border)}>
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
                        <div className="mt-1.5"><RiskBadge level={item.memberRiskLevel} size="sm" /></div>
                      </div>
                      {isPending ? (
                        <button onClick={() => { setSelected(item); setSheetOpen(true) }}
                          className="mt-3 w-full py-2 rounded-lg bg-accent-primary/15 text-accent-primary text-sm font-medium hover:bg-accent-primary/25">
                          审批
                        </button>
                      ) : (
                        <div className="mt-3 space-y-1">
                          <div className="flex items-start gap-2">
                            {item.status === 'approved'
                              ? <CheckCircle size={16} className="text-risk-green flex-shrink-0 mt-0.5" />
                              : <XCircle size={16} className="text-risk-red flex-shrink-0 mt-0.5" />}
                            <div>
                              <span className={cn('text-xs font-medium', item.status === 'approved' ? 'text-risk-green' : 'text-risk-red')}>
                                {item.status === 'approved' ? '已批准' : '已驳回'}
                              </span>
                              {item.reason && <p className="text-xs text-text-muted mt-0.5">{item.reason}</p>}
                            </div>
                          </div>
                          {item.voiceNote && (
                            <div className="flex items-center gap-1.5 text-xs text-text-muted">
                              <Mic size={12} /> {item.voiceNote}
                            </div>
                          )}
                          {item.processedTime && (
                            <div className="flex items-center gap-1.5 text-xs text-text-muted">
                              <Clock size={12} /> {item.processor} · {item.processedTime}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {filteredApprovals.length === 0 && (
              <div className="text-center py-16 text-text-muted text-sm">暂无{approvalTab === 'pending' ? '待审批' : '已处理'}消息</div>
            )}
          </div>
        </>
      )}

      {tab === '周报' && (
        <div className="px-4 space-y-3">
          {weeklyReports.map((n) => (
            <div key={n.id} className="bg-bg-card rounded-xl overflow-hidden">
              <div className="p-4 cursor-pointer" onClick={() => toggleExpand(n.id)}>
                <div className="flex items-start gap-3">
                  {!n.read && <span className="flex-shrink-0 w-2 h-2 rounded-full bg-accent-primary mt-1.5" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText size={14} className="text-text-muted" />
                      <span className="text-sm font-semibold text-text-primary truncate">{n.title}</span>
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-2">{n.summary}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-text-muted">
                      <Calendar size={12} /> {n.time}
                    </div>
                  </div>
                  <ChevronRight size={16} className={cn('text-text-muted transition-transform', expandedId === n.id && 'rotate-90')} />
                </div>
              </div>
              {expandedId === n.id && n.data && (
                <div className="px-4 pb-4 space-y-3">
                  {n.data.map((region: RegionWeeklyDetail) => (
                    <div key={region.region} className={cn('rounded-lg p-3', riskBg[region.riskLevel])}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-text-muted" />
                          <span className="text-sm font-semibold text-text-primary">{region.region}</span>
                        </div>
                        <RiskBadge level={region.riskLevel} size="sm" />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                        <div><span className="text-text-muted">储值总额</span><p className="text-text-primary font-mono mt-0.5">¥{formatMoney(region.depositTotal)}</p></div>
                        <div><span className="text-text-muted">退费压力</span><p className="text-text-primary font-mono mt-0.5">¥{formatMoney(region.refundPressure)}</p></div>
                        <div><span className="text-text-muted">异常会员</span><p className="text-text-primary mt-0.5">{region.abnormalMemberCount}</p></div>
                      </div>
                      <div className="space-y-1.5">
                        {region.stores.map((store) => (
                          <div key={store.storeId} onClick={() => navigate(`/stores/${store.storeId}`)}
                            className="flex items-center justify-between bg-bg-primary/50 rounded-md px-2.5 py-2 cursor-pointer hover:bg-bg-primary/80">
                            <span className="text-xs text-text-primary">{store.storeName}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-text-muted">偏离 {store.deviation}%</span>
                              <span className="text-xs text-text-muted">退费 ¥{formatMoney(store.refundPressure)}</span>
                              <RiskBadge level={store.riskLevel} size="sm" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {weeklyReports.length === 0 && <div className="text-center py-16 text-text-muted text-sm">暂无周报消息</div>}
        </div>
      )}

      {tab === '通知' && (
        <div className="px-4 space-y-3">
          {otherNotifs.map((n) => (
            <div key={n.id} onClick={() => handleNotifClick(n)}
              className="bg-bg-card rounded-xl p-4 cursor-pointer">
              <div className="flex items-start gap-3">
                {!n.read && <span className="flex-shrink-0 w-2 h-2 rounded-full bg-accent-primary mt-1.5" />}
                <div className={cn('flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center',
                  n.type === 'risk_alert' ? 'bg-risk-redBg text-risk-red' : 'bg-accent-primary/15 text-accent-primary')}>
                  {n.type === 'risk_alert' ? <AlertTriangle size={18} /> : <Bell size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-text-primary">{n.title}</span>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">{n.summary}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-text-muted">
                    <Clock size={12} /> {n.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {otherNotifs.length === 0 && <div className="text-center py-16 text-text-muted text-sm">暂无通知消息</div>}
        </div>
      )}

      <ApprovalAction approval={selected} open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  )
}
