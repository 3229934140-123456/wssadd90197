import { mockOverview } from '@/data/mockData'
import { RiskBadge, formatMoney, formatYoY } from '@/components/RiskBadge'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Bell, ChevronRight, TrendingUp, TrendingDown, AlertTriangle, FileText } from 'lucide-react'

const levelColor = { red: '#FF4757', yellow: '#FFA502', green: '#2ED573' } as const

export default function Overview() {
  const navigate = useNavigate()
  const pendingCount = useAppStore((s) => s.getPendingApprovalCount())
  const data = mockOverview
  const today = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })

  const metrics = [
    { label: '全集团储值余额', value: data.totalBalance, yoy: data.balanceYoY, accent: true, positiveIsGood: true },
    { label: '今日新增储值', value: data.todayNewDeposit, yoy: data.depositYoY, accent: false, positiveIsGood: true },
    { label: '今日消耗', value: data.todayConsumption, yoy: data.consumptionYoY, accent: false, positiveIsGood: true },
    { label: '待退款金额', value: data.pendingRefund, yoy: data.refundYoY, accent: false, positiveIsGood: false, riskRed: true },
  ]

  return (
    <div className="px-4 pt-4 space-y-4 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">储值风控</h1>
          <p className="text-xs text-text-muted mt-0.5">{today}</p>
        </div>
        <button
          onClick={() => navigate('/approvals')}
          className="relative flex items-center gap-1 bg-bg-card rounded-xl px-3 py-2 border border-border-default"
        >
          <Bell size={16} className="text-text-secondary" />
          {pendingCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-risk-red text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className={cn(
              'rounded-xl p-4 border border-border-default animate-slide-up bg-bg-card',
              m.accent && 'col-span-2',
            )}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <p className="text-xs text-text-secondary mb-1">{m.label}</p>
            <p className={cn('font-mono text-2xl font-bold', m.accent ? 'text-accent-primary' : m.riskRed ? 'text-risk-red' : 'text-text-primary')}>
              ¥{formatMoney(m.value)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {m.yoy >= 0 ? (
                <TrendingUp size={12} className={m.positiveIsGood ? 'text-risk-green' : 'text-risk-red'} />
              ) : (
                <TrendingDown size={12} className={m.positiveIsGood ? 'text-risk-red' : 'text-risk-green'} />
              )}
              <span className={cn('text-xs font-mono', m.positiveIsGood ? (m.yoy >= 0 ? 'text-risk-green' : 'text-risk-red') : (m.yoy >= 0 ? 'text-risk-red' : 'text-risk-green'))}>
                同比 {formatYoY(m.yoy)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-4 border border-border-default bg-bg-card animate-slide-up" style={{ animationDelay: '240ms' }}>
        <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-1.5">
          <AlertTriangle size={14} className="text-risk-yellow" />风险信号
        </h2>
        <div className="space-y-2.5">
          {data.riskSignals.map((signal, i) => (
            <button
              key={i}
              onClick={() => signal.link && navigate(signal.link)}
              className="w-full flex items-start gap-2.5 text-left"
            >
              <RiskBadge level={signal.level} dotOnly size="sm" className="mt-1.5 shrink-0" />
              <span className="text-xs text-text-secondary flex-1">{signal.message}</span>
              {signal.link && <ChevronRight size={14} className="text-text-muted shrink-0 mt-0.5" />}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-4 border border-border-default bg-bg-card animate-slide-up" style={{ animationDelay: '300ms' }}>
        <h2 className="text-sm font-semibold text-text-primary mb-3">消耗趋势（近7日）</h2>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.consumptionTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00D4AA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#556677', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#556677', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 10000).toFixed(0)}万`} />
              <Tooltip
                contentStyle={{ background: '#1A2332', border: '1px solid #2A3A4A', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#8899AA' }}
                itemStyle={{ color: '#00D4AA' }}
                formatter={(v: number) => [`¥${formatMoney(v)}`, '消耗']}
              />
              <Area type="monotone" dataKey="value" stroke="#00D4AA" fill="url(#areaGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {data.weeklyReport && (
        <div className="rounded-xl p-4 border border-border-default bg-bg-card animate-slide-up" style={{ animationDelay: '360ms' }}>
          <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-1.5">
            <FileText size={14} className="text-accent-primary" />周报概要
          </h2>
          <p className="text-[10px] text-text-muted mb-2">{data.weeklyReport.period}</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-[10px] text-text-muted">区域储值总额</p>
              <p className="font-mono text-sm font-bold text-text-primary">¥{formatMoney(data.weeklyReport.regionDepositTotal)}</p>
            </div>
            <div>
              <p className="text-[10px] text-text-muted">退款压力</p>
              <p className="font-mono text-sm font-bold text-risk-yellow">¥{formatMoney(data.weeklyReport.regionRefundPressure)}</p>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-text-muted mb-1">高风险门店</p>
            <div className="flex gap-2">
              {data.weeklyReport.topRiskStores.map((store) => (
                <span key={store} className="text-xs bg-risk-redBg text-risk-red rounded-md px-2 py-0.5">{store}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
