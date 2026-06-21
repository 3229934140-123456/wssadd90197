import { useAppStore, getStoreById, getAbnormalMembers } from '@/store/appStore'
import { RiskBadge, formatMoney, formatMoneyFull } from '@/components/RiskBadge'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Users, TrendingUp, TrendingDown, AlertTriangle, Wallet, ShoppingCart } from 'lucide-react'

export function StoreDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const watchedStoreIds = useAppStore((s) => s.watchedStoreIds)
  const toggleWatchStore = useAppStore((s) => s.toggleWatchStore)

  const store = getStoreById(id!)
  if (!store) return <div className="p-4 text-text-muted">门店不存在</div>

  const abnormalMembers = getAbnormalMembers().filter((m) => m.storeId === id)
  const isWatched = watchedStoreIds.includes(store.id)

  const metrics = [
    { label: '总储值', value: formatMoneyFull(store.totalDeposit), icon: Wallet, color: 'text-blue-400' },
    { label: '总消耗', value: formatMoneyFull(store.totalConsumed), icon: ShoppingCart, color: 'text-emerald-400' },
    { label: '会员数', value: `${store.memberCount}`, icon: Users, color: 'text-purple-400' },
    { label: '储值增速', value: `${store.depositGrowth}%`, icon: store.depositGrowth >= 0 ? TrendingUp : TrendingDown, color: store.depositGrowth > 30 ? 'text-risk-red' : 'text-text-secondary' },
    { label: '消耗率', value: `${store.consumptionRate}%`, icon: TrendingUp, color: store.consumptionRate < 15 ? 'text-risk-red' : 'text-risk-green' },
    { label: '活动储值占比', value: `${store.activityDepositRatio}%`, icon: AlertTriangle, color: store.activityDepositRatio > 60 ? 'text-amber-400' : 'text-text-secondary' },
    { label: '异常会员', value: `${store.abnormalMemberCount}`, icon: AlertTriangle, color: store.abnormalMemberCount > 0 ? 'text-risk-red' : 'text-risk-green' },
  ]

  return (
    <div className="px-4 pt-4">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="h-5 w-5 text-text-secondary" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-text-primary">{store.name}</h1>
            <RiskBadge level={store.riskLevel} size="sm" />
          </div>
          <p className="text-xs text-text-muted">{store.region}</p>
        </div>
        <button className="p-2" onClick={() => toggleWatchStore(store.id)}>
          {isWatched ? <Eye className="h-5 w-5 text-amber-400" /> : <EyeOff className="h-5 w-5 text-text-muted" />}
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl bg-bg-card px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <m.icon className={`h-3.5 w-3.5 ${m.color}`} />
              {m.label}
            </div>
            <p className={`mt-1 text-base font-semibold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {abnormalMembers.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-medium text-risk-red">异常会员 ({abnormalMembers.length})</h2>
          <div className="flex flex-col gap-2">
            {abnormalMembers.map((m) => (
              <div
                key={m.id}
                className="rounded-xl bg-bg-card px-4 py-3"
                onClick={() => navigate(`/member/${m.id}`)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text-primary">{m.name}</span>
                  <span className="text-xs text-text-muted">{m.phone}</span>
                  <RiskBadge level={m.riskLevel} size="sm" />
                </div>
                <p className="mt-1 text-xs text-text-muted">
                  储值 {formatMoney(m.totalDeposit)} · 消耗 {formatMoney(m.totalConsumed)} · 余额 {formatMoney(m.remainingBalance)}
                </p>
                {m.alerts[0] && <p className="mt-1 text-xs text-risk-red">{m.alerts[0].description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default StoreDetail
