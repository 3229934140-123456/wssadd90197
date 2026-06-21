import { useState } from 'react'
import { useAppStore, getStoreById, getAbnormalMembers } from '@/store/appStore'
import { RiskBadge, formatMoney, formatMoneyFull } from '@/components/RiskBadge'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Users, TrendingUp, TrendingDown, AlertTriangle, Wallet, ShoppingCart, Calendar, Save } from 'lucide-react'

export function StoreDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isWatched = useAppStore((s) => s.isWatched)
  const getWatchInfo = useAppStore((s) => s.getWatchInfo)
  const addWatchStore = useAppStore((s) => s.addWatchStore)
  const removeWatchStore = useAppStore((s) => s.removeWatchStore)
  const updateWatchStore = useAppStore((s) => s.updateWatchStore)

  const store = getStoreById(id!)
  if (!store) return <div className="p-4 text-text-muted">门店不存在</div>

  const abnormalMembers = getAbnormalMembers().filter((m) => m.storeId === id)
  const watched = isWatched(store.id)
  const watchInfo = watched ? getWatchInfo(store.id) : undefined

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
        <button className="p-2" onClick={() => watched ? removeWatchStore(store.id) : addWatchStore(store.id)}>
          {watched ? <Eye className="h-5 w-5 text-amber-400" /> : <EyeOff className="h-5 w-5 text-text-muted" />}
        </button>
      </div>

      {watched && <WatchSection storeId={store.id} note={watchInfo?.note ?? ''} nextFollowUp={watchInfo?.nextFollowUp ?? ''} addedAt={watchInfo?.addedAt ?? ''} updateWatchStore={updateWatchStore} />}

      <div className="mb-4 grid grid-cols-2 gap-2">
        {metricsOf(store).map((m) => (
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
              <div key={m.id} className="rounded-xl bg-bg-card px-4 py-3" onClick={() => navigate(`/member/${m.id}`)}>
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

function WatchSection({ storeId, note, nextFollowUp, addedAt, updateWatchStore }: {
  storeId: string
  note: string
  nextFollowUp: string
  addedAt: string
  updateWatchStore: (id: string, u: Partial<{ note: string; nextFollowUp: string }>) => void
}) {
  const [n, setN] = useState(note)
  const [d, setD] = useState(nextFollowUp)

  return (
    <div className="mb-4 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-amber-400">观察信息</span>
        <button className="flex items-center gap-1 rounded-lg bg-amber-400/20 px-2.5 py-1 text-xs text-amber-300 active:bg-amber-400/30"
          onClick={() => updateWatchStore(storeId, { note: n, nextFollowUp: d })}>
          <Save className="h-3.5 w-3.5" />保存
        </button>
      </div>
      <textarea rows={2} value={n} onChange={(e) => setN(e.target.value)} placeholder="备注..."
        className="mb-2 w-full rounded-lg border border-amber-400/20 bg-bg-card px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-amber-400/40 focus:outline-none" />
      <input type="date" value={d} onChange={(e) => setD(e.target.value)}
        className="mb-2 w-full rounded-lg border border-amber-400/20 bg-bg-card px-3 py-2 text-sm text-text-primary focus:border-amber-400/40 focus:outline-none [color-scheme:dark]" />
      {nextFollowUp && (
        <div className="mb-1 flex items-center gap-1.5 text-xs text-amber-300">
          <Calendar className="h-3.5 w-3.5" />下次跟进: {nextFollowUp}
        </div>
      )}
      {addedAt && <p className="text-xs text-text-muted">加入观察: {new Date(addedAt).toLocaleDateString('zh-CN')}</p>}
    </div>
  )
}

function metricsOf(s: NonNullable<ReturnType<typeof getStoreById>>) {
  return [
    { label: '总储值', value: formatMoneyFull(s.totalDeposit), icon: Wallet, color: 'text-blue-400' },
    { label: '总消耗', value: formatMoneyFull(s.totalConsumed), icon: ShoppingCart, color: 'text-emerald-400' },
    { label: '会员数', value: `${s.memberCount}`, icon: Users, color: 'text-purple-400' },
    { label: '储值增速', value: `${s.depositGrowth}%`, icon: s.depositGrowth >= 0 ? TrendingUp : TrendingDown, color: s.depositGrowth > 30 ? 'text-risk-red' : 'text-text-secondary' },
    { label: '消耗率', value: `${s.consumptionRate}%`, icon: TrendingUp, color: s.consumptionRate < 15 ? 'text-risk-red' : 'text-risk-green' },
    { label: '活动储值占比', value: `${s.activityDepositRatio}%`, icon: AlertTriangle, color: s.activityDepositRatio > 60 ? 'text-amber-400' : 'text-text-secondary' },
    { label: '异常会员', value: `${s.abnormalMemberCount}`, icon: AlertTriangle, color: s.abnormalMemberCount > 0 ? 'text-risk-red' : 'text-risk-green' },
  ]
}
