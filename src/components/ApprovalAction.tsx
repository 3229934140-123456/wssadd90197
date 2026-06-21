import { useState, useEffect, useCallback } from 'react'
import { X, Mic } from 'lucide-react'
import type { ApprovalItem, ApprovalStatus } from '@/types'
import { useAppStore } from '@/store/appStore'
import { mockApprovalReasons } from '@/data/mockData'
import { formatMoney } from '@/components/RiskBadge'
import { cn } from '@/lib/utils'

interface ApprovalActionProps {
  approval: ApprovalItem | null
  open: boolean
  onClose: () => void
}

export function ApprovalAction({ approval, open, onClose }: ApprovalActionProps) {
  const [action, setAction] = useState<ApprovalStatus>('approved')
  const [selectedReason, setSelectedReason] = useState('')
  const [voiceNote, setVoiceNote] = useState('')
  const [recording, setRecording] = useState(false)
  const processApproval = useAppStore((s) => s.processApproval)

  useEffect(() => {
    if (open) {
      setAction('approved')
      setSelectedReason('')
      setVoiceNote('')
      setRecording(false)
    }
  }, [open])

  const reasons = mockApprovalReasons.filter((r) => r.type === approval?.type)

  const handleVoice = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR || recording) return
    const recognition = new SR()
    recognition.lang = 'zh-CN'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onstart = () => setRecording(true)
    recognition.onresult = (e: any) => {
      setVoiceNote(e.results[0][0].transcript)
      setRecording(false)
    }
    recognition.onerror = () => setRecording(false)
    recognition.onend = () => setRecording(false)
    recognition.start()
  }, [recording])

  const handleConfirm = () => {
    if (!approval || !selectedReason) return
    processApproval(approval.id, action, selectedReason, voiceNote || undefined)
    onClose()
  }

  if (!open || !approval) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full bg-bg-card rounded-t-2xl p-5 pb-8 max-h-[85vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">审批操作</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-2 mb-5 text-sm">
          <div className="flex justify-between"><span className="text-text-muted">类型</span><span className="text-text-primary">{approval.title}</span></div>
          <div className="flex justify-between"><span className="text-text-muted">会员</span><span className="text-text-primary">{approval.memberName} {approval.memberPhone}</span></div>
          <div className="flex justify-between"><span className="text-text-muted">金额</span><span className="text-text-primary font-mono">¥{formatMoney(approval.amount)}</span></div>
          <div className="flex justify-between"><span className="text-text-muted">门店</span><span className="text-text-primary">{approval.storeName}</span></div>
          <div className="flex justify-between"><span className="text-text-muted">申请人</span><span className="text-text-primary">{approval.applicant}</span></div>
        </div>

        <div className="flex gap-3 mb-5">
          <button
            onClick={() => { setAction('approved'); setSelectedReason('') }}
            className={cn('flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors',
              action === 'approved' ? 'bg-emerald-600 text-white' : 'bg-bg-elevated text-text-secondary')}
          >批准</button>
          <button
            onClick={() => { setAction('rejected'); setSelectedReason('') }}
            className={cn('flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors',
              action === 'rejected' ? 'bg-risk-red text-white' : 'bg-bg-elevated text-text-secondary')}
          >驳回</button>
        </div>

        <p className="text-sm text-text-muted mb-2">选择原因</p>
        <div className="space-y-2 mb-4">
          {reasons.map((r) => (
            <label key={r.id} className={cn('flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
              selectedReason === r.label ? 'bg-accent-primary/10 ring-1 ring-accent-primary/30' : 'bg-bg-elevated')}>
              <input type="radio" name="reason" checked={selectedReason === r.label}
                onChange={() => setSelectedReason(r.label)} className="accent-accent-primary" />
              <span className="text-sm text-text-primary">{r.label}</span>
            </label>
          ))}
        </div>

        <div className="mb-5">
          <button onClick={handleVoice}
            className={cn('flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
              recording ? 'bg-risk-red/20 text-risk-red' : 'bg-bg-elevated text-text-secondary')}>
            {recording ? (
              <>
                <span className="flex items-center gap-0.5 h-4">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span key={i} className="w-0.5 bg-risk-red rounded-full"
                      style={{ animation: 'voiceBar 0.6s ease-in-out infinite alternate', animationDelay: `${i * 0.1}s`, height: '4px' }} />
                  ))}
                </span>
                录音中...
              </>
            ) : (<><Mic size={16} />语音备注</>)}
          </button>
          {voiceNote && <p className="mt-2 text-xs text-text-secondary">语音: {voiceNote}</p>}
        </div>

        <button onClick={handleConfirm} disabled={!selectedReason}
          className={cn('w-full py-3 rounded-lg font-medium text-sm transition-colors',
            selectedReason
              ? action === 'approved' ? 'bg-emerald-600 text-white' : 'bg-risk-red text-white'
              : 'bg-bg-elevated text-text-muted cursor-not-allowed')}>
          确认{action === 'approved' ? '批准' : '驳回'}
        </button>

        <style>{`
          @keyframes voiceBar {
            0% { height: 4px; }
            100% { height: 16px; }
          }
        `}</style>
      </div>
    </div>
  )
}
