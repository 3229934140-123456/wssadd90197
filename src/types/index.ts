export type RiskLevel = 'red' | 'yellow' | 'green'

export interface RiskSignal {
  level: RiskLevel
  message: string
  link?: string
}

export interface OverviewData {
  totalBalance: number
  todayNewDeposit: number
  todayConsumption: number
  pendingRefund: number
  balanceYoY: number
  depositYoY: number
  consumptionYoY: number
  refundYoY: number
  consumptionTrend: TrendPoint[]
  riskSignals: RiskSignal[]
  pendingApprovalCount: number
  weeklyReport?: WeeklyReport
}

export interface TrendPoint {
  date: string
  value: number
}

export interface WeeklyReport {
  regionDepositTotal: number
  regionRefundPressure: number
  topRiskStores: string[]
  period: string
}

export interface RegionWeeklyDetail {
  region: string
  depositTotal: number
  refundPressure: number
  storeCount: number
  abnormalMemberCount: number
  riskLevel: RiskLevel
  stores: RegionStoreDetail[]
}

export interface RegionStoreDetail {
  storeId: string
  storeName: string
  depositGrowth: number
  consumptionRate: number
  deviation: number
  refundPressure: number
  riskLevel: RiskLevel
}

export interface NotificationMessage {
  id: string
  type: 'weekly_report' | 'system' | 'risk_alert'
  title: string
  summary: string
  time: string
  read: boolean
  data?: RegionWeeklyDetail[]
}

export interface Store {
  id: string
  name: string
  region: string
  depositGrowth: number
  consumptionRate: number
  deviation: number
  riskLevel: RiskLevel
  abnormalMemberCount: number
  activityDepositRatio: number
  isWatched: boolean
  totalDeposit: number
  totalConsumed: number
  memberCount: number
}

export interface WatchedStoreInfo {
  storeId: string
  note: string
  nextFollowUp: string
  addedAt: string
}

export interface Member {
  id: string
  name: string
  phone: string
  riskLevel: RiskLevel
  totalDeposit: number
  totalConsumed: number
  remainingBalance: number
  consultant: string
  storeId: string
  storeName: string
  alerts: MemberAlert[]
  depositTimeline: DepositRecord[]
  activities: ActivityRecord[]
  unconsumedItems: UnconsumedItem[]
  refundHistory: RefundRecord[]
}

export interface MemberAlert {
  type: 'spike_deposit' | 'consultant_concentrated' | 'frequent_split'
  description: string
  time: string
}

export type DispositionStatus = 'pending' | 'contacted' | 'needs_review' | 'suggest_refund' | 'resolved'

export interface MemberDisposition {
  memberId: string
  status: DispositionStatus
  note: string
  updatedAt: string
}

export interface DepositRecord {
  id: string
  time: string
  amount: number
  activity?: string
  operator: string
  type: 'normal' | 'activity' | 'gift'
}

export interface ActivityRecord {
  id: string
  name: string
  time: string
  depositAmount: number
  giftAmount: number
}

export interface UnconsumedItem {
  id: string
  name: string
  amount: number
  depositTime: string
}

export interface RefundRecord {
  id: string
  time: string
  amount: number
  reason: string
  approver: string
}

export type ApprovalType = 'excess_gift' | 'special_refund' | 'account_unfreeze'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type UrgencyLevel = 'high' | 'medium' | 'low'

export interface ApprovalItem {
  id: string
  type: ApprovalType
  title: string
  memberName: string
  memberPhone: string
  amount: number
  storeName: string
  applicant: string
  applyTime: string
  urgency: UrgencyLevel
  status: ApprovalStatus
  reason?: string
  voiceNote?: string
  processedTime?: string
  processor?: string
  memberId: string
  memberRiskLevel: RiskLevel
}

export interface ApprovalReason {
  id: string
  label: string
  type: ApprovalType
}
