import { getMemberById } from '@/store/appStore'
import { RiskBadge, formatMoney, formatMoneyFull } from '@/components/RiskBadge'
import { cn } from '@/lib/utils'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Phone, MapPin, Clock, Package, Gift, Calendar, CreditCard, AlertTriangle } from 'lucide-react'

const alertIconMap: Record<string, { icon: React.ReactNode; color: string }> = {
  spike_deposit: { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-risk-red' },
  consultant_concentrated: { icon: <User className="w-4 h-4" />, color: 'text-risk-yellow' },
  frequent_split: { icon: <Package className="w-4 h-4" />, color: 'text-risk-yellow' },
}

const typeBadge: Record<string, { label: string; cls: string }> = {
  normal: { label: '常规', cls: 'bg-bg-elevated text-text-secondary' },
  activity: { label: '活动', cls: 'bg-accent-primary/15 text-accent-primary' },
  gift: { label: '赠送', cls: 'bg-purple-500/15 text-purple-400' },
}

export default function MemberDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const member = getMemberById(id!)

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-text-secondary">
        <p>未找到会员信息</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-accent-primary">返回</button>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 pb-8 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 text-text-secondary">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-text-primary">会员详情</h1>
      </div>

      <div className="bg-bg-card rounded-xl p-4 space-y-3 border border-border-default">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xl font-bold text-text-primary">{member.name}</div>
            <div className="flex items-center gap-1.5 mt-1 text-text-secondary text-sm">
              <Phone className="w-3.5 h-3.5" />{member.phone}
            </div>
          </div>
          <RiskBadge level={member.riskLevel} size="lg" />
        </div>
        <div className="flex items-center gap-1.5 text-text-secondary text-sm">
          <MapPin className="w-3.5 h-3.5" />{member.storeName}
        </div>
        <div className="flex items-center gap-1.5 text-text-secondary text-sm">
          <User className="w-3.5 h-3.5" />顾问：{member.consultant}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '总充值', value: formatMoney(member.totalDeposit) },
          { label: '已消耗', value: formatMoney(member.totalConsumed) },
          { label: '余额', value: formatMoney(member.remainingBalance) },
        ].map((s) => (
          <div key={s.label} className="bg-bg-card rounded-xl p-3 text-center border border-border-default">
            <div className="font-mono text-lg font-bold text-text-primary">{s.value}</div>
            <div className="text-xs text-text-secondary mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {member.alerts.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-text-secondary">风险预警</div>
          {member.alerts.map((a, i) => {
            const cfg = alertIconMap[a.type] ?? alertIconMap.spike_deposit
            return (
              <div key={i} className="bg-bg-card rounded-xl p-3 border border-border-default flex items-start gap-2.5">
                <span className={cn('mt-0.5', cfg.color)}>{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-text-primary">{a.description}</div>
                  <div className="text-xs text-text-muted mt-1">{a.time}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="space-y-2">
        <div className="text-xs text-text-secondary flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />充值记录
        </div>
        <div className="relative pl-6">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-accent-primary/30" />
          {member.depositTimeline.map((d) => (
            <div key={d.id} className="relative pb-4 last:pb-0">
              <div className="absolute left-[-18px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent-primary border-2 border-bg-primary" />
              <div className="bg-bg-card rounded-xl p-3 border border-border-default">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-text-primary">¥{formatMoneyFull(d.amount)}</span>
                  <span className={cn('text-xs px-1.5 py-0.5 rounded', typeBadge[d.type].cls)}>
                    {typeBadge[d.type].label}
                  </span>
                </div>
                {d.activity && <div className="text-sm text-accent-primary mt-1">{d.activity}</div>}
                <div className="flex items-center gap-3 mt-1.5 text-xs text-text-muted">
                  <span>{d.time}</span><span>操作：{d.operator}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {member.activities.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-text-secondary flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />参与活动
          </div>
          {member.activities.map((a) => (
            <div key={a.id} className="bg-bg-card rounded-xl p-3 border border-border-default space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">{a.name}</span>
                <span className="text-xs text-text-muted">{a.time}</span>
              </div>
              <div className="flex gap-4 text-xs">
                <span className="text-text-secondary">充值 <span className="font-mono text-text-primary">¥{formatMoneyFull(a.depositAmount)}</span></span>
                <span className="text-text-secondary">赠送 <span className="font-mono text-purple-400">¥{formatMoneyFull(a.giftAmount)}</span></span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <div className="text-xs text-text-secondary flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5" />未消耗项目
        </div>
        {member.unconsumedItems.map((u) => (
          <div key={u.id} className="bg-bg-card rounded-xl p-3 border border-border-default flex items-center justify-between">
            <div>
              <div className="text-sm text-text-primary">{u.name}</div>
              <div className="text-xs text-text-muted mt-0.5">充值时间：{u.depositTime}</div>
            </div>
            <span className="font-mono text-sm text-text-primary">¥{formatMoneyFull(u.amount)}</span>
          </div>
        ))}
        <div className="bg-bg-card rounded-xl p-3 border border-accent-primary/30 flex items-center justify-between">
          <span className="text-sm text-text-secondary">剩余总额</span>
          <span className="font-mono font-bold text-accent-primary">¥{formatMoneyFull(member.remainingBalance)}</span>
        </div>
      </div>

      {member.refundHistory.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-text-secondary flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" />退款记录
          </div>
          {member.refundHistory.map((r) => (
            <div key={r.id} className="bg-bg-card rounded-xl p-3 border border-border-default space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-risk-red">-¥{formatMoneyFull(r.amount)}</span>
                <span className="text-xs text-text-muted">{r.time}</span>
              </div>
              <div className="text-xs text-text-secondary">原因：{r.reason} · 审批人：{r.approver}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
