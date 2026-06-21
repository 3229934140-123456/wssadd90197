import { create } from 'zustand'
import type { ApprovalItem, ApprovalStatus, WatchedStoreInfo, MemberDisposition, DispositionStatus, NotificationMessage } from '@/types'
import { mockApprovals, mockStores, mockMembers, mockNotifications } from '@/data/mockData'

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : fallback
  } catch {
    return fallback
  }
}

function saveJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

function mergeApprovalsWithPersisted(base: ApprovalItem[]): ApprovalItem[] {
  const persisted = loadJSON<Record<string, Partial<ApprovalItem>>>('approval_results', {})
  return base.map((a) => {
    const saved = persisted[a.id]
    if (saved && saved.status && saved.status !== 'pending') {
      return { ...a, ...saved } as ApprovalItem
    }
    return a
  })
}

function persistApprovalResult(item: ApprovalItem) {
  const persisted = loadJSON<Record<string, Partial<ApprovalItem>>>('approval_results', {})
  persisted[item.id] = {
    status: item.status,
    reason: item.reason,
    voiceNote: item.voiceNote,
    processedTime: item.processedTime,
    processor: item.processor,
  }
  saveJSON('approval_results', persisted)
}

const defaultWatched: WatchedStoreInfo[] = mockStores
  .filter((s) => s.isWatched)
  .map((s) => ({ storeId: s.id, note: '', nextFollowUp: '', addedAt: new Date().toISOString() }))

interface AppState {
  watchedStores: WatchedStoreInfo[]
  addWatchStore: (storeId: string, note?: string, nextFollowUp?: string) => void
  removeWatchStore: (storeId: string) => void
  updateWatchStore: (storeId: string, updates: Partial<Pick<WatchedStoreInfo, 'note' | 'nextFollowUp'>>) => void
  isWatched: (storeId: string) => boolean
  getWatchInfo: (storeId: string) => WatchedStoreInfo | undefined

  approvals: ApprovalItem[]
  processApproval: (id: string, status: ApprovalStatus, reason: string, voiceNote?: string) => void
  getPendingApprovalCount: () => number

  memberDispositions: Record<string, MemberDisposition>
  setMemberDisposition: (memberId: string, status: DispositionStatus, note?: string) => void
  getMemberDisposition: (memberId: string) => MemberDisposition | undefined

  notifications: NotificationMessage[]
  markNotificationRead: (id: string) => void
  getUnreadNotificationCount: () => number
}

export const useAppStore = create<AppState>((set, get) => ({
  watchedStores: loadJSON<WatchedStoreInfo[]>('watched_stores', defaultWatched),

  addWatchStore: (storeId, note = '', nextFollowUp = '') =>
    set((state) => {
      if (state.watchedStores.some((w) => w.storeId === storeId)) return state
      const updated = [...state.watchedStores, { storeId, note, nextFollowUp, addedAt: new Date().toISOString() }]
      saveJSON('watched_stores', updated)
      return { watchedStores: updated }
    }),

  removeWatchStore: (storeId) =>
    set((state) => {
      const updated = state.watchedStores.filter((w) => w.storeId !== storeId)
      saveJSON('watched_stores', updated)
      return { watchedStores: updated }
    }),

  updateWatchStore: (storeId, updates) =>
    set((state) => {
      const updated = state.watchedStores.map((w) =>
        w.storeId === storeId ? { ...w, ...updates } : w
      )
      saveJSON('watched_stores', updated)
      return { watchedStores: updated }
    }),

  isWatched: (storeId) => get().watchedStores.some((w) => w.storeId === storeId),

  getWatchInfo: (storeId) => get().watchedStores.find((w) => w.storeId === storeId),

  approvals: mergeApprovalsWithPersisted(mockApprovals),

  processApproval: (id, status, reason, voiceNote) =>
    set((state) => {
      const updated = state.approvals.map((a) =>
        a.id === id
          ? { ...a, status, reason, voiceNote, processedTime: new Date().toLocaleString('zh-CN'), processor: '当前用户' }
          : a
      )
      const processed = updated.find((a) => a.id === id)!
      persistApprovalResult(processed)
      return { approvals: updated }
    }),

  getPendingApprovalCount: () => get().approvals.filter((a) => a.status === 'pending').length,

  memberDispositions: loadJSON<Record<string, MemberDisposition>>('member_dispositions', {}),

  setMemberDisposition: (memberId, status, note = '') =>
    set((state) => {
      const updated = {
        ...state.memberDispositions,
        [memberId]: { memberId, status, note, updatedAt: new Date().toLocaleString('zh-CN') },
      }
      saveJSON('member_dispositions', updated)
      return { memberDispositions: updated }
    }),

  getMemberDisposition: (memberId) => get().memberDispositions[memberId],

  notifications: loadJSON<NotificationMessage[]>('notifications', mockNotifications),

  markNotificationRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
      saveJSON('notifications', updated)
      return { notifications: updated }
    }),

  getUnreadNotificationCount: () => get().notifications.filter((n) => !n.read).length,
}))

export function getStoreById(id: string) {
  return mockStores.find((s) => s.id === id)
}

export function getMemberById(id: string) {
  return mockMembers.find((m) => m.id === id)
}

export function getAbnormalMembers() {
  return mockMembers.filter((m) => m.alerts.length > 0)
}
