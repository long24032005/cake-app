/**
 * OpenAccumulateBookFlow — Screen 4
 * Spec E/Screen 4
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { ALL_MILESTONES } from '../config';
import { LOCK_CYCLE_DAYS } from '../config';
import { toISODate, addDays } from '../engine/pointEngine';
import type { SavingsBook } from '../types';

// ── Term options — spec "6T/4.5%, 9T/6.7%, 12T/6.7%"
const TERM_OPTIONS = [
  { months: 6,  rate: 4.5 },
  { months: 9,  rate: 6.7 },
  { months: 12, rate: 6.7 },
] as const;

// ── Build SavingsBook object
function buildAccumulateBook(initialAmount: number, monthlyTarget: number, termMonths: number, rate: number): SavingsBook {
  const today = toISODate(new Date());
  return {
    bookId: `book_acc_${Date.now()}`,
    bookType: 'accumulate',
    status: 'active',
    principalAmount: initialAmount,
    currentBalance: initialAmount,
    interestRate: rate,
    termMonths,
    startDate: today,
    maturityDate: addDays(today, termMonths * 30),
    accumulate: {
      targetMonthlyAmount: monthlyTarget,
      totalPeriods: termMonths,
      completedPeriods: 0,
      periodHistory: []
    },
    pointTracking: {
      balanceHistory: [{ date: today, balance: initialAmount }],
      lockedPoints: 0, runningPoints: 0, commitmentBonusPoints: 0,
      lockCycleDays: LOCK_CYCLE_DAYS,
      lastLockDate: today,
      nextLockDate: addDays(today, LOCK_CYCLE_DAYS),
      violationRatio: null,
    },
  };
}

// ── Helpers
function fmtVND(n: number) { return n.toLocaleString('vi-VN'); }
function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

// ── Gato Points Preview Card (Accumulate logic)
function GatoPointsPreview({ monthlyTarget, termMonths, currentProgressPoints }: {
  monthlyTarget: number; termMonths: number; currentProgressPoints: number;
}) {
  const monthlyPts = Math.floor(monthlyTarget / 100_000) * 30; // base pts if they meet target
  
  // Total pts is an estimation assuming balance grows by monthlyTarget each month.
  // Month 1: 1 * monthlyTarget
  // Month 2: 2 * monthlyTarget
  // ... sum = n(n+1)/2 * monthlyTarget
  const sumOfPeriods = (termMonths * (termMonths + 1)) / 2;
  const totalPts = Math.floor((sumOfPeriods * monthlyTarget) / 100_000) * 30;

  const nextMilestone = [...ALL_MILESTONES]
    .sort((a, b) => a.pointsRequired - b.pointsRequired)
    .find(m => m.pointsRequired > currentProgressPoints);

  const ptsLeft = nextMilestone ? Math.max(1, nextMilestone.pointsRequired - currentProgressPoints) : 1;
  const pct = Math.min(Math.round((totalPts / ptsLeft) * 100), 999);

  return (
    <div style={{
      background: 'rgba(91,200,245,0.09)',
      border: '1px solid rgba(91,200,245,0.3)',
      borderRadius: 'var(--radius-card)',
      padding: '14px 16px',
      display: 'flex', gap: 14, alignItems: 'center',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: 'linear-gradient(135deg, #5BC8F5, #3A9FD6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0,
        boxShadow: '0 0 12px rgba(91,200,245,0.4)',
      }}>🐱</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-blue)', fontWeight: 600, marginBottom: 4 }}>
          Gato sẽ nhận được:
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#5BC8F5', lineHeight: 1.2 }}>
          ~{monthlyPts.toLocaleString('vi-VN')} điểm/tháng
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
          Nếu gửi đều {termMonths} tháng: khoảng{' '}
          <span style={{ color: 'var(--color-text-primary)', fontWeight: 700 }}>
            {totalPts.toLocaleString('vi-VN')} điểm
          </span>
        </div>
        {nextMilestone && (
          <div style={{ fontSize: 11, color: 'var(--color-text-green)', marginTop: 2 }}>
            Tương đương: <b>{pct}%</b> tiến độ đến mốc {nextMilestone.id}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Term card
function TermCard({ months, rate, selected, onSelect }: {
  months: number; rate: number; selected: boolean; onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        padding: '12px', borderRadius: 'var(--radius-card)', cursor: 'pointer',
        background: selected ? 'rgba(91,200,245,0.12)' : 'var(--color-bg-card)',
        border: selected ? '1.5px solid #5BC8F5' : '1px solid var(--color-bg-card-border)',
        display: 'flex', flexDirection: 'column', gap: 3, textAlign: 'left',
        transition: 'all 0.18s',
        boxShadow: selected ? '0 0 12px rgba(91,200,245,0.25)' : 'none',
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 800, color: selected ? '#5BC8F5' : 'var(--color-text-primary)' }}>
        {months}T
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-green)' }}>
        {rate}%/năm
      </div>
    </button>
  );
}

// ── Section label
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
      {children}
    </div>
  );
}

// ── Main Flow Component
interface Props { onBack: () => void; onSuccess: () => void; }

export function OpenAccumulateBookFlow({ onBack, onSuccess }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [rawInitial, setRawInitial] = useState('');
  const [rawMonthly, setRawMonthly] = useState('500000');
  const [termMonths, setTermMonths] = useState(12);
  const [rate, setRate]           = useState(6.7);

  const addBook     = useAppStore(s => s.addBook);
  const runDailyJob = useAppStore(s => s.runDailyJob);
  const progressPts = useAppStore(s => s.user.journey.progressPoints);

  const initialAmount = Math.max(0, parseInt(rawInitial.replace(/\D/g, '') || '0', 10));
  const monthlyAmount = Math.max(0, parseInt(rawMonthly.replace(/\D/g, '') || '0', 10));
  
  const isValid = monthlyAmount >= 100_000;
  const MOCK_AVAILABLE = 10_000_000;
  const maturityDate = addDays(toISODate(new Date()), termMonths * 30);

  function handleConfirm() {
    const book = buildAccumulateBook(initialAmount, monthlyAmount, termMonths, rate);
    addBook(book);
    runDailyJob(1); // trigger immediately so user sees points update
    onSuccess();
  }

  // ── Back button header
  const PageHeader = ({ title }: { title: string }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '16px 20px 12px',
      borderBottom: '1px solid var(--color-bg-card-border)',
    }}>
      <button
        id="btn-back"
        onClick={step === 2 ? () => setStep(1) : onBack}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--color-text-primary)', padding: 4 }}
        aria-label="Quay lại"
      >←</button>
      <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text-primary)' }}>{title}</div>
      <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--color-text-secondary)' }}>
        Bước {step}/2
      </div>
    </div>
  );

  // ── Bottom pill button
  const PillBtn = ({ label, disabled, onClick, id }: { label: string; disabled?: boolean; onClick: () => void; id: string }) => (
    <div style={{ padding: '16px 20px' }}>
      <button
        id={id}
        onClick={onClick}
        disabled={disabled}
        style={{
          width: '100%', padding: '15px',
          borderRadius: 'var(--radius-btn)',
          border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
          background: disabled ? 'var(--color-btn-disabled)' : 'linear-gradient(135deg, #5BC8F5, #3A9FD6)',
          color: '#fff', fontSize: 15, fontWeight: 800,
          boxShadow: disabled ? 'none' : '0 4px 20px rgba(91,200,245,0.4)',
          transition: 'all 0.2s',
        }}
      >{label}</button>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {step === 1 ? (
        // ════════════════════════════════════════════
        // SCREEN 4A — Input
        // ════════════════════════════════════════════
        <motion.div key="4a"
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}
        >
          <PageHeader title="Mở sổ Tích lũy" />

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* 1. Số tiền bắt đầu */}
            <div>
              <SectionLabel>Số tiền gửi lần đầu (Có thể để trống)</SectionLabel>
              <div style={{
                background: 'var(--color-bg-card)', border: '1px solid var(--color-bg-card-border)',
                borderRadius: 'var(--radius-card)', padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20, color: 'var(--color-text-secondary)' }}>₫</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={initialAmount > 0 ? fmtVND(initialAmount) : ''}
                    onChange={e => setRawInitial(e.target.value)}
                    placeholder="0"
                    style={{
                      flex: 1, background: 'transparent', border: 'none', outline: 'none',
                      fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)',
                      width: '100%',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 2. Số tiền gửi góp hàng tháng */}
            <div>
              <SectionLabel>Số tiền gửi góp mỗi tháng</SectionLabel>
              <div style={{
                background: 'var(--color-bg-card)', border: '1px solid var(--color-bg-card-border)',
                borderRadius: 'var(--radius-card)', padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20, color: 'var(--color-text-secondary)' }}>₫</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={monthlyAmount > 0 ? fmtVND(monthlyAmount) : ''}
                    onChange={e => setRawMonthly(e.target.value)}
                    placeholder="Nhập số tiền"
                    style={{
                      flex: 1, background: 'transparent', border: 'none', outline: 'none',
                      fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)',
                      width: '100%',
                    }}
                  />
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 6 }}>
                  Khuyến nghị tối thiểu: 100,000đ
                </div>
                {monthlyAmount > 0 && monthlyAmount < 100_000 && (
                  <div style={{ fontSize: 11, color: '#FF6B6B', marginTop: 4 }}>
                    ⚠ Số tiền tối thiểu là 100,000đ
                  </div>
                )}
              </div>
            </div>

            {/* 3. Kỳ hạn & lãi suất */}
            <div>
              <SectionLabel>Kỳ hạn & lãi suất theo năm</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {TERM_OPTIONS.map(opt => (
                  <TermCard
                    key={opt.months}
                    months={opt.months} rate={opt.rate}
                    selected={termMonths === opt.months}
                    onSelect={() => { setTermMonths(opt.months); setRate(opt.rate); }}
                  />
                ))}
              </div>
            </div>

            {/* 4. Note */}
            <div style={{
              fontSize: 11, color: 'var(--color-text-secondary)',
              background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 14px',
              lineHeight: 1.6,
            }}>
              💡 Lãi suất không cố định cho toàn bộ thời gian gửi mà có thể thay đổi dựa trên quy định tại từng thời điểm.
            </div>

            {/* 5. Ước tính điểm Gato */}
            <GatoPointsPreview monthlyTarget={monthlyAmount} termMonths={termMonths} currentProgressPoints={progressPts} />
          </div>

          <PillBtn id="btn-continue" label="Tiếp tục →" disabled={!isValid} onClick={() => setStep(2)} />
        </motion.div>

      ) : (
        // ════════════════════════════════════════════
        // SCREEN 4B — Xác nhận
        // ════════════════════════════════════════════
        <motion.div key="4b"
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}
        >
          <PageHeader title="Xác nhận mở sổ" />

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Recap card */}
            <div style={{
              background: 'var(--color-bg-card)', border: '1px solid var(--color-bg-card-border)',
              borderRadius: 'var(--radius-card)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                Thông tin sổ tiết kiệm
              </div>
              {[
                { label: 'Loại sổ',       val: 'Tiết kiệm Tích lũy' },
                { label: 'Gửi lần đầu',   val: `${fmtVND(initialAmount)}đ` },
                { label: 'Gửi góp định kỳ',val: `${fmtVND(monthlyAmount)}đ/tháng`, accent: '#5BC8F5' },
                { label: 'Kỳ hạn',        val: `${termMonths} tháng` },
                { label: 'Lãi suất',      val: `${rate}%/năm`, accent: 'var(--color-text-green)' },
                { label: 'Ngày đáo hạn',  val: fmtDate(maturityDate), accent: 'var(--color-text-blue)' },
              ].map(({ label, val, accent }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: accent ?? 'var(--color-text-primary)' }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Gato preview lần 2 */}
            <GatoPointsPreview monthlyTarget={monthlyAmount} termMonths={termMonths} currentProgressPoints={progressPts} />
          </div>

          <PillBtn id="btn-confirm-open" label="🎉 Xác nhận mở sổ" onClick={handleConfirm} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
