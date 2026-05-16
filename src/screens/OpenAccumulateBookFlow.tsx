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
function buildAccumulateBook(
  initialAmount: number,
  monthlyTarget: number,
  termMonths: number,
  rate: number,
  autoDeposit?: { enabled: boolean; amount: number; dayOfMonth: number | 'start' | 'end' }
): SavingsBook {
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
      periodHistory: [],
      autoDeposit: autoDeposit?.enabled ? {
        enabled: true,
        amount: autoDeposit.amount,
        dayOfMonth: autoDeposit.dayOfMonth,
      } : undefined,
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
function GatoPointsPreview({ initialAmount, monthlyTarget, termMonths, currentProgressPoints }: {
  initialAmount: number; monthlyTarget: number; termMonths: number; currentProgressPoints: number;
}) {
  // Estimation: points per day = floor(Balance / 100,000)
  // Total pts = Sum for T months (assume 30 days each)
  let totalPts = 0;
  for (let m = 0; m < termMonths; m++) {
    const currentBalance = initialAmount + m * monthlyTarget;
    const dailyPts = Math.floor(currentBalance / 100_000);
    totalPts += dailyPts * 30;
  }

  const monthlyPtsAvg = termMonths > 0 ? Math.floor(totalPts / termMonths) : 0;


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
          ~{monthlyPtsAvg.toLocaleString('vi-VN')} điểm/tháng
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
          Nếu gửi đều {termMonths} tháng: khoảng{' '}
          <span style={{ color: 'var(--color-text-primary)', fontWeight: 700 }}>
            {totalPts.toLocaleString('vi-VN')} điểm
          </span>
        </div>
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
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [rawInitial, setRawInitial] = useState('100000');
  const [termMonths, setTermMonths] = useState(12);
  const [rate, setRate]           = useState(6.7);

  // Auto-deposit settings
  const [autoDepositEnabled, setAutoDepositEnabled] = useState(false);
  const [rawAutoAmount, setRawAutoAmount] = useState('500000');
  const [autoDay, setAutoDay] = useState<number | 'start' | 'end'>(1);

  const addBook     = useAppStore(s => s.addBook);
  const runDailyJob = useAppStore(s => s.runDailyJob);
  const progressPts = useAppStore(s => s.user.journey.progressPoints);

  const initialAmount = Math.max(0, parseInt(rawInitial.replace(/\D/g, '') || '0', 10));
  const autoAmount = Math.max(0, parseInt(rawAutoAmount.replace(/\D/g, '') || '0', 10));
  
  // Logic: monthlyAmount is determined by autoDeposit if enabled
  const monthlyAmount = autoDepositEnabled ? autoAmount : 0;

  const isStep1Valid = initialAmount >= 100_000;
  const isStep2Valid = !autoDepositEnabled || autoAmount >= 100_000;

  const maturityDate = addDays(toISODate(new Date()), termMonths * 30);

  function handleConfirm() {
    const book = buildAccumulateBook(
      initialAmount, 
      monthlyAmount, 
      termMonths, 
      rate,
      { enabled: autoDepositEnabled, amount: autoAmount, dayOfMonth: autoDay }
    );
    addBook(book);
    runDailyJob(1); 
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
        onClick={() => {
          if (step === 1) onBack();
          else setStep((step - 1) as any);
        }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--color-text-primary)', padding: 4 }}
        aria-label="Quay lại"
      >←</button>
      <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text-primary)' }}>{title}</div>
      <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--color-text-secondary)' }}>
        Bước {step}/3
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
        <motion.div key="4a"
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}
        >
          <PageHeader title="Mở sổ Tích lũy" />
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* 1. Số tiền bắt đầu */}
            <div>
              <SectionLabel>Số tiền gửi lần đầu (Bắt buộc)</SectionLabel>
              <div style={{
                background: 'var(--color-bg-card)', border: '1px solid var(--color-bg-card-border)',
                borderRadius: 'var(--radius-card)', padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20, color: 'var(--color-text-secondary)' }}>₫</span>
                  <input
                    type="text" inputMode="numeric"
                    value={initialAmount > 0 ? fmtVND(initialAmount) : ''}
                    onChange={e => setRawInitial(e.target.value)}
                    placeholder="Tối thiểu 100,000đ"
                    style={{
                      flex: 1, background: 'transparent', border: 'none', outline: 'none',
                      fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)',
                      width: '100%',
                    }}
                  />
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 6 }}>
                  Yêu cầu tối thiểu: 100,000đ
                </div>
                {initialAmount > 0 && initialAmount < 100_000 && (
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
                    key={opt.months} months={opt.months} rate={opt.rate}
                    selected={termMonths === opt.months}
                    onSelect={() => { setTermMonths(opt.months); setRate(opt.rate); }}
                  />
                ))}
              </div>
            </div>

            {/* 4. Estimate points */}
            <GatoPointsPreview initialAmount={initialAmount} monthlyTarget={monthlyAmount} termMonths={termMonths} currentProgressPoints={progressPts} />
          </div>
          <PillBtn id="btn-continue" label="Tiếp tục →" disabled={!isStep1Valid} onClick={() => setStep(2)} />
        </motion.div>

      ) : step === 2 ? (
        // ════════════════════════════════════════════
        // SCREEN 4B — Auto-deposit settings
        // ════════════════════════════════════════════
        <motion.div key="4b"
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}
        >
          <PageHeader title="Tự động nạp tiền" />
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            <div style={{
              background: 'var(--color-bg-card)', border: '1px solid var(--color-bg-card-border)',
              borderRadius: 'var(--radius-card)', padding: '20px 16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)' }}>Chế độ nạp tiền tự động</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>Giúp Gato nhận điểm đều đặn mỗi tháng</div>
              </div>
              <div 
                onClick={() => setAutoDepositEnabled(!autoDepositEnabled)}
                style={{
                  width: 50, height: 28, borderRadius: 14, cursor: 'pointer',
                  background: autoDepositEnabled ? '#5BC8F5' : 'rgba(255,255,255,0.1)',
                  position: 'relative', transition: 'all 0.2s'
                }}
              >
                <motion.div 
                  animate={{ x: autoDepositEnabled ? 24 : 2 }}
                  style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2 }}
                />
              </div>
            </div>

            {autoDepositEnabled && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
              >
                <div>
                  <SectionLabel>Số tiền nạp mỗi tháng</SectionLabel>
                  <div style={{
                    background: 'var(--color-bg-card)', border: '1px solid var(--color-bg-card-border)',
                    borderRadius: 'var(--radius-card)', padding: '14px 16px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20, color: 'var(--color-text-secondary)' }}>₫</span>
                      <input
                        type="text" inputMode="numeric"
                        value={autoAmount > 0 ? fmtVND(autoAmount) : ''}
                        onChange={e => setRawAutoAmount(e.target.value)}
                        placeholder="Nhập số tiền"
                        style={{
                          flex: 1, background: 'transparent', border: 'none', outline: 'none',
                          fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)',
                          width: '100%',
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <SectionLabel>Ngày nạp hàng tháng</SectionLabel>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {[
                      { label: 'Đầu tháng', val: 'start' as const },
                      { label: 'Ngày 15',    val: 15 },
                      { label: 'Cuối tháng', val: 'end' as const },
                    ].map(opt => (
                      <button
                        key={opt.label}
                        onClick={() => setAutoDay(opt.val)}
                        style={{
                          padding: '12px 8px', borderRadius: 10, cursor: 'pointer',
                          background: autoDay === opt.val ? 'rgba(91,200,245,0.12)' : 'var(--color-bg-card)',
                          border: autoDay === opt.val ? '1.5px solid #5BC8F5' : '1px solid var(--color-bg-card-border)',
                          fontSize: 13, fontWeight: 700, color: autoDay === opt.val ? '#5BC8F5' : 'var(--color-text-primary)',
                        }}
                      >{opt.label}</button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              💡 Việc thiết lập tự động nạp tiền sẽ giúp sổ tích lũy của bạn luôn duy trì phong độ và nhận được đầy đủ các phần thưởng Gato theo mốc.
            </div>
          </div>
          <PillBtn id="btn-continue-2" label="Tiếp tục →" disabled={!isStep2Valid} onClick={() => setStep(3)} />
        </motion.div>

      ) : (
        // ════════════════════════════════════════════
        // SCREEN 4C — Confirmation
        // ════════════════════════════════════════════
        <motion.div key="4c"
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}
        >
          <PageHeader title="Xác nhận thông tin" />
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: 'var(--color-bg-card)', border: '1px solid var(--color-bg-card-border)',
              borderRadius: 'var(--radius-card)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 4 }}>Thông tin sổ tích lũy</div>
              {[
                { label: 'Gửi lần đầu',   val: `${fmtVND(initialAmount)}đ` },
                { label: 'Gửi góp (Target)',val: monthlyAmount > 0 ? `${fmtVND(monthlyAmount)}đ/tháng` : 'Không đăng ký', accent: '#5BC8F5' },
                { label: 'Tự động nạp',    val: autoDepositEnabled ? `Có (${fmtVND(autoAmount)}đ)` : 'Không', accent: autoDepositEnabled ? 'var(--color-text-green)' : undefined },
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

            <GatoPointsPreview initialAmount={initialAmount} monthlyTarget={monthlyAmount} termMonths={termMonths} currentProgressPoints={progressPts} />
          </div>
          <PillBtn id="btn-confirm-open" label="🎉 Xác nhận mở sổ" onClick={handleConfirm} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
