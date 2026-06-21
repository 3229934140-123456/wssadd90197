import { create } from 'zustand'
import type { ApprovalItem, ApprovalStatus } from '@/types'
import { mockApprovals, mockStores, mockMembers } from '@/data/mockData'

interface AppState {
  watchedStoreIds: string[]
  toggleWatchStore: (storeId: string) => void
  approvals: ApprovalItem[]
  processApproval: (id: string, status: ApprovalStatus, reason: string, voiceNote?: string) => void
  getPendingApprovalCount: () => number
}

export const useAppStore = create<AppState>((set, get) => ({
  watchedStoreIds: mockStores.filter((s) => s.isWatched).map((s) => s.id),

  toggleWatchStore: (storeId: string) =>
    set((state) => ({
      watchedStoreIds: state.watchedStoreIds.includes(storeId)
        ? state.watchedStoreIds.filter((id) => id !== storeId)
        : [...state.watchedStoreIds, storeId],
    })),

  approvals: mockApprovals,

  processApproval: (id, status, reason, voiceNote) =>
    set((state) => ({
      approvals: state.approvals.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              reason,
              voiceNote,
              processedTime: new Date().toLocaleString('zh-CN'),
              processor: '当前用户',
            }
          : a
      ),
    })),

  getPendingApprovalCount: () => get().approvals.filter((a) => a.status === 'pending').length,
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
