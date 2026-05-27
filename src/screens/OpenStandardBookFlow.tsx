/**
 * OpenStandardBookFlow — Screen 3A (input) + 3B (confirm)
 * Spec E/Screen 3
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { ALL_MILESTONES } from '../config';
import { LOCK_CYCLE_DAYS } from '../config';
import { toISODate, addDays } from '../engine/pointEngine';
import type { SavingsBook } from '../types';

// ── Term options — spec "Grid 2x2: 12T/7.4% | 6T/7.2% | 1T/4.75% | 2T/4.75%"
const TERM_OPTIONS = [
  { months: 12, rate: 7.4  },
  { months: 6,  rate: 7.2  },
  { months: 1,  rate: 4.75 },
  { months: 2,  rate: 4.75 },
] as const;

// ── Interest timing chips — spec
const INTEREST_TIMINGS = ['Cuối kỳ', 'Đầu kỳ', 'Hàng tháng', 'Hàng ngày'] as const;
type InterestTiming = typeof INTEREST_TIMINGS[number];

// ── Build SavingsBook object from user inputs
function buildStandardBook(amount: number, termMonths: number, rate: number): SavingsBook {
  const today = toISODate(new Date());
  return {
    bookId: `book_std_${Date.now()}`,
    bookType: 'standard',
    status: 'active',
    principalAmount: amount,
    currentBalance: amount,
    interestRate: rate,
    termMonths,
    startDate: today,
    maturityDate: addDays(today, termMonths * 30),
    pointTracking: {
      balanceHistory: [{ date: today, balance: amount }],
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

// ── Gato Points Preview Card
function GatoPointsPreview({ amount, termMonths, currentProgressPoints }: {
  amount: number; termMonths: number; currentProgressPoints: number;
}) {
  const dailyPts = Math.floor(amount / 10_000);
  const totalPts = dailyPts * 30 * termMonths;


  return (
    <div style={{
      background: 'rgba(255,45,140,0.09)',
      border: '1px solid rgba(255,45,140,0.3)',
      borderRadius: 'var(--radius-card)',
      padding: '14px 16px',
      display: 'flex', gap: 14, alignItems: 'center',
    }}>
      {/* Pet icon */}
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: 'linear-gradient(135deg, #FF2D8C, #C21A7A)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0,
        boxShadow: '0 0 12px rgba(255,45,140,0.4)',
      }}>🐱</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--color-secondary-pink)', fontWeight: 600, marginBottom: 4 }}>
          Gato sẽ nhận được:
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-primary-pink)', lineHeight: 1 }}>
          ~{dailyPts.toLocaleString('vi-VN')} điểm/ngày
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
          Trong {termMonths} tháng: khoảng{' '}
          <span style={{ color: 'var(--color-text-primary)', fontWeight: 700 }}>
            {totalPts.toLocaleString('vi-VN')} điểm
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Chip selector
function Chip({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      style={{
        padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
        cursor: 'pointer', transition: 'all 0.18s',
        background: selected ? 'var(--color-primary-pink)' : 'var(--color-bg-card)',
        color: selected ? '#fff' : 'var(--color-text-secondary)',
        border: selected ? '1px solid var(--color-primary-pink)' : '1px solid var(--color-bg-card-border)',
        boxShadow: selected ? '0 0 10px rgba(255,45,140,0.35)' : 'none',
      }}
    >{label}</button>
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
        background: selected ? 'rgba(255,45,140,0.12)' : 'var(--color-bg-card)',
        border: selected ? '1.5px solid var(--color-primary-pink)' : '1px solid var(--color-bg-card-border)',
        display: 'flex', flexDirection: 'column', gap: 3, textAlign: 'left',
        transition: 'all 0.18s',
        boxShadow: selected ? '0 0 12px rgba(255,45,140,0.25)' : 'none',
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 800, color: selected ? 'var(--color-primary-pink)' : 'var(--color-text-primary)' }}>
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

export function OpenStandardBookFlow({ onBack, onSuccess }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [rawAmount, setRawAmount] = useState('1000000');
  const [timing, setTiming]       = useState<InterestTiming>('Cuối kỳ');
  const [termMonths, setTermMonths] = useState(12);
  const [rate, setRate]           = useState(7.4);

  const addBook     = useAppStore(s => s.addBook);
  const runDailyJob = useAppStore(s => s.runDailyJob);
  const progressPts = useAppStore(s => s.user.journey.progressPoints);

  const amount = Math.max(0, parseInt(rawAmount.replace(/\D/g, '') || '0', 10));
  const isValid = amount >= 100_000;
  const MOCK_AVAILABLE = 10_000_000;
  const maturityDate = addDays(toISODate(new Date()), termMonths * 30);

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\./g, '').replace(/\D/g, '');
    setRawAmount(digits);
  }

  function handleConfirm() {
    const book = buildStandardBook(amount, termMonths, rate);
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
          background: disabled ? 'var(--color-btn-disabled)' : 'linear-gradient(135deg, #FF2D8C, #C21A7A)',
          color: '#fff', fontSize: 15, fontWeight: 800,
          boxShadow: disabled ? 'none' : '0 4px 20px rgba(255,45,140,0.4)',
          transition: 'all 0.2s',
        }}
      >{label}</button>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {step === 1 ? (
        // ════════════════════════════════════════════
        // SCREEN 3A — Input
        // ════════════════════════════════════════════
        <motion.div key="3a"
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}
        >
          <PageHeader title="Mở sổ tiết kiệm" />

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* 1. Số tiền muốn gửi */}
            <div>
              <SectionLabel>Số tiền muốn gửi</SectionLabel>
              <div style={{
                background: 'var(--color-bg-card)', border: '1px solid var(--color-bg-card-border)',
                borderRadius: 'var(--radius-card)', padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20, color: 'var(--color-text-secondary)' }}>₫</span>
                  <input
                    id="input-amount"
                    type="text"
                    inputMode="numeric"
                    value={amount > 0 ? fmtVND(amount) : ''}
                    onChange={handleAmountChange}
                    placeholder="Nhập số tiền"
                    style={{
                      flex: 1, background: 'transparent', border: 'none', outline: 'none',
                      fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)',
                      width: '100%',
                    }}
                  />
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 6 }}>
                  Tối thiểu: 100,000đ &nbsp;·&nbsp; Số dư khả dụng:{' '}
                  <span style={{ color: 'var(--color-text-green)' }}>{fmtVND(MOCK_AVAILABLE)}đ</span>
                </div>
                {amount > 0 && amount < 100_000 && (
                  <div style={{ fontSize: 11, color: '#FF6B6B', marginTop: 4 }}>
                    ⚠ Số tiền tối thiểu là 100,000đ
                  </div>
                )}
              </div>
            </div>

            {/* 2. Thời điểm nhận lãi */}
            <div>
              <SectionLabel>Thời điểm nhận lãi</SectionLabel>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {INTEREST_TIMINGS.map(t => (
                  <Chip key={t} label={t} selected={timing === t} onSelect={() => setTiming(t)} />
                ))}
              </div>
            </div>

            {/* 3. Kỳ hạn & lãi suất — Grid 2x2 */}
            <div>
              <SectionLabel>Kỳ hạn & lãi suất theo năm</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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

            {/* 4. Hành động khi hết kỳ hạn */}
            <div style={{
              background: 'var(--color-bg-card)', border: '1px solid var(--color-bg-card-border)',
              borderRadius: 'var(--radius-card)', padding: '12px 16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 2 }}>Hành động khi hết kỳ hạn</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Gửi cả gốc và lãi</div>
              </div>
              <button style={{
                background: 'transparent', border: '1px solid var(--color-primary-pink)',
                borderRadius: 20, padding: '4px 12px', color: 'var(--color-primary-pink)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>Thay đổi</button>
            </div>

            {/* 5. PHẦN MỚI: Ước tính điểm Gato */}
            <GatoPointsPreview amount={amount} termMonths={termMonths} currentProgressPoints={progressPts} />

            {/* 6. Ưu đãi */}
            <div>
              <SectionLabel>Ưu đãi dành cho bạn</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: '🎁', text: 'Tặng sổ tiếp theo +1.3%' },
                  { icon: '⭐', text: 'Sổ đầu tiên +1.5% ưu đãi' },
                ].map(({ icon, text }) => (
                  <div key={text} style={{
                    background: 'rgba(91,200,245,0.08)', border: '1px solid rgba(91,200,245,0.2)',
                    borderRadius: 10, padding: '10px 14px',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{ fontSize: 18 }}>{icon}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-blue)', fontWeight: 600 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <PillBtn id="btn-continue" label="Tiếp tục →" disabled={!isValid} onClick={() => setStep(2)} />
        </motion.div>

      ) : (
        // ════════════════════════════════════════════
        // SCREEN 3B — Xác nhận
        // ════════════════════════════════════════════
        <motion.div key="3b"
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
                { label: 'Loại sổ',       val: 'Tiết kiệm Tiêu chuẩn' },
                { label: 'Số tiền gửi',   val: `${fmtVND(amount)}đ`,   accent: 'var(--color-primary-pink)' },
                { label: 'Kỳ hạn',        val: `${termMonths} tháng` },
                { label: 'Lãi suất',      val: `${rate}%/năm`,          accent: 'var(--color-text-green)' },
                { label: 'Nhận lãi',      val: timing },
                { label: 'Ngày đáo hạn',  val: fmtDate(maturityDate),   accent: 'var(--color-text-blue)' },
                { label: 'Hết kỳ',        val: 'Gửi cả gốc và lãi' },
              ].map(({ label, val, accent }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: accent ?? 'var(--color-text-primary)' }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Gato preview lần 2 */}
            <GatoPointsPreview amount={amount} termMonths={termMonths} currentProgressPoints={progressPts} />

            {/* Note */}
            <div style={{
              fontSize: 11, color: 'var(--color-text-secondary)',
              background: 'rgba(155,150,200,0.07)', borderRadius: 10, padding: '10px 14px',
              lineHeight: 1.6,
            }}>
              💡 Điểm Gato sẽ được tích hàng ngày dựa trên số dư thực tế. Rút trước hạn sẽ ảnh hưởng đến điểm đang tích.
            </div>
          </div>

          <PillBtn id="btn-confirm-open" label="🎉 Xác nhận mở sổ" onClick={handleConfirm} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
