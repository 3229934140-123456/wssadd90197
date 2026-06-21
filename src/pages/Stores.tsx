import { mockStores } from '@/data/mockData'
import { RiskBadge, formatMoney } from '@/components/RiskBadge'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, TrendingUp, TrendingDown, ChevronRight, Building2 } from 'lucide-react'

const deviationColor = (d: number) =>
  d > 20 ? 'bg-risk-red' : d > 10 ? 'bg-risk-yellow' : 'bg-risk-green'

const deviationBarWidth = (d: number) => Math.min(Math.abs(d), 50) * 2

export function Stores() {
  const navigate = useNavigate()
  const watchedStoreIds = useAppStore((s) => s.watchedStoreIds)
  const toggleWatchStore = useAppStore((s) => s.toggleWatchStore)

  const sorted = [...mockStores].sort((a, b) => b.deviation - a.deviation)
  const watched = sorted.filter((s) => watchedStoreIds.includes(s.id))
  const rest = sorted.filter((s) => !watchedStoreIds.includes(s.id))

  const renderRow = (store: (typeof sorted)[0], rank: number, isWatchedRow = false) => (
    <div
      key={store.id}
      className={cn(
        'flex items-center gap-3 rounded-xl bg-bg-card px-4 py-3',
        isWatchedRow && 'border-l-4 border-amber-500'
      )}
      onClick={() => navigate(`/stores/${store.id}`)}
    >
      <span className="w-6 text-center text-sm font-bold text-text-muted">{rank}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-text-primary">{store.name}</span>
          <span className="shrink-0 text-xs text-text-muted">{store.region}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-bg-elevated">
            <div
              className={cn('h-full rounded-full', deviationColor(store.deviation))}
              style={{ width: `${deviationBarWidth(store.deviation)}%` }}
            />
          </div>
          <span className="flex items-center gap-0.5 text-xs text-text-muted">
            {store.deviation >= 0 ? <TrendingUp className="h-3 w-3 text-risk-red" /> : <TrendingDown className="h-3 w-3 text-risk-green" />}
            {Math.abs(store.deviation).toFixed(1)}%
          </span>
        </div>
      </div>
      <RiskBadge level={store.riskLevel} size="sm" />
      <button
        className="shrink-0 p-1"
        onClick={(e) => { e.stopPropagation(); toggleWatchStore(store.id) }}
      >
        {watchedStoreIds.includes(store.id)
          ? <Eye className="h-4 w-4 text-amber-400" />
          : <EyeOff className="h-4 w-4 text-text-muted" />}
      </button>
      <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" />
    </div>
  )

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-4 text-xl font-bold text-text-primary">门店排行</h1>
      {watched.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-amber-400">
            <Eye className="h-4 w-4" />重点观察
          </h2>
          <div className="flex flex-col gap-2">
            {watched.map((s, i) => renderRow(s, i + 1, true))}
          </div>
        </section>
      )}
      <section>
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-text-secondary">
          <Building2 className="h-4 w-4" />全部门店
        </h2>
        <div className="flex flex-col gap-2">
          {rest.map((s, i) => renderRow(s, watched.length + i + 1))}
        </div>
      </section>
    </div>
  )
}

export default Stores
