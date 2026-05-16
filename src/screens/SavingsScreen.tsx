/**
 * SavingsScreen — Screen 2: SAVINGS — TIẾT KIỆM
 * Handles internal navigation: list ↔ open-standard flow
 * Spec E/Screen 2
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { SavingsBookCard } from '../components/SavingsBookCard';
import { OpenStandardBookFlow } from './OpenStandardBookFlow';
import { OpenAccumulateBookFlow } from './OpenAccumulateBookFlow';

type SavingsView = 'list' | 'open-standard' | 'open-accumulate';

// ── Toast
function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      onAnimationComplete={() => setTimeout(onDone, 2200)}
      style={{
        position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
        background: 'var(--color-bg-card)', border: '1px solid var(--color-primary-pink)',
        borderRadius: 24, padding: '10px 20px', zIndex: 200,
        fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)',
        boxShadow: '0 4px 24px rgba(255,45,140,0.35)', whiteSpace: 'nowrap',
      }}
    >{msg}</motion.div>
  );
}

// ── Summary Card (masked balance toggle) — spec Screen 2 Section 2
function SummaryCard() {
  const [masked, setMasked] = useState(true);
  const allBooks   = useAppStore(s => s.user.savingsBooks);
  const inventory = useAppStore(s => s.user.inventory);

  const totalBalance = allBooks.reduce((s, b) => s + b.currentBalance, 0);
  const totalInterest = allBooks.reduce((s, b) =>
    s + Math.floor(b.currentBalance * (b.interestRate / 100) * (b.termMonths / 12)), 0);
  const totalVoucher = inventory
    .filter(i => i.type === 'voucher')
    .reduce((s, i) => s + (i.value ?? 0), 0);

  const hide = (v: number) => masked ? '*** ***' : v.toLocaleString('vi-VN') + 'đ';

  return (
    <div style={{
      background: 'var(--color-bg-card)', border: '1px solid var(--color-bg-card-border)',
      borderRadius: 'var(--radius-card)', padding: '16px 18px',
      margin: '12px 20px 0',
    }}>
      {/* Total balance row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 3 }}>Tổng số dư tiết kiệm</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-text-primary)' }}>
            {hide(totalBalance)}
          </div>
        </div>
        <button
          id="btn-toggle-mask"
          onClick={() => setMasked(m => !m)}
          style={{
            background: 'rgba(155,150,200,0.1)', border: '1px solid var(--color-bg-card-border)',
            borderRadius: 20, padding: '6px 12px', cursor: 'pointer',
            color: 'var(--color-text-secondary)', fontSize: 13,
          }}
          aria-label={masked ? 'Hiện số dư' : 'Ẩn số dư'}
        >{masked ? '👁' : '🙈'}</button>
      </div>

      {/* Two masked fields — spec */}
      <div style={{ display: 'flex', gap: 16 }}>
        {[
          { label: 'Tổng điểm lãi', val: totalInterest, icon: '?' },
          { label: 'Tổng tiền thưởng', val: totalVoucher, icon: '?' },
        ].map(({ label, val, icon }) => (
          <div key={label} style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
              <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>{label}</span>
              <span style={{
                width: 14, height: 14, borderRadius: '50%',
                background: 'rgba(155,150,200,0.2)', fontSize: 9,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-text-secondary)', cursor: 'help',
              }}>{icon}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-green)' }}>
              {hide(val)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Open type cards — spec Screen 2 Section 3
function OpenTypeCard({ icon, title, sub, accent, onClick, id }: {
  icon: string; title: string; sub: string; accent: string;
  onClick: () => void; id: string;
}) {
  return (
    <motion.button
      id={id}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        flex: 1, background: 'var(--color-bg-card)',
        border: '1px solid var(--color-bg-card-border)',
        borderRadius: 'var(--radius-card)', padding: '14px 12px',
        cursor: 'pointer', textAlign: 'left',
        display: 'flex', flexDirection: 'column', gap: 8,
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = accent)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-bg-card-border)')}
    >
      <span style={{ fontSize: 28 }}>{icon}</span>
      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text-primary)' }}>{title}</div>
      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{sub}</div>
    </motion.button>
  );
}

// ── History section (collapsed by default)
function HistorySection() {
  const [open, setOpen] = useState(false);
  const books = useAppStore(s => s.user.savingsBooks)
    .filter(b => b.status === 'matured' || b.status === 'violated' || b.status === 'closed');

  if (books.length === 0) return null;

  return (
    <div style={{ margin: '20px 20px 0' }}>
      <button
        id="btn-toggle-history"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '8px 0', color: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 700,
        }}
      >
        <span>Lịch sử ({books.length} sổ)</span>
        <span style={{ transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(90deg)' : 'none' }}>›</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 8 }}>
              {books.map(b => <SavingsBookCard key={b.bookId} book={b} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main SavingsScreen
export function SavingsScreen() {
  const [view, setView] = useState<SavingsView>('list');
  const [toast, setToast] = useState<string | null>(null);

  const allBooks    = useAppStore(s => s.user.savingsBooks);
  const activeBooks = allBooks.filter(b => b.status === 'active');
  const maxRate = Math.max(...[7.4, 7.2, 4.75]);

  function handleSuccess() {
    setView('list');
    setToast('Đã mở sổ! Gato bắt đầu tích điểm từ hôm nay 🎉');
  }

  if (view === 'open-standard') {
    return (
      <OpenStandardBookFlow
        onBack={() => setView('list')}
        onSuccess={handleSuccess}
      />
    );
  }

  if (view === 'open-accumulate') {
    return (
      <OpenAccumulateBookFlow
        onBack={() => setView('list')}
        onSuccess={handleSuccess}
      />
    );
  }

  return (
    <div style={{ paddingBottom: 16 }}>

      {/* 1. Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 20px 8px 64px',
      }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--color-text-primary)' }}>Tiết kiệm</div>
        <button
          id="btn-manage-books"
          style={{
            background: 'transparent', border: '1.5px solid var(--color-primary-pink)',
            borderRadius: 20, padding: '6px 14px', cursor: 'pointer',
            color: 'var(--color-primary-pink)', fontSize: 12, fontWeight: 700,
          }}
        >Quản lý sổ</button>
      </div>

      {/* 2. Summary card */}
      <SummaryCard />

      {/* 3. Mở sổ mới */}
      <div style={{ margin: '20px 20px 0' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 10 }}>
          Mở sổ tiết kiệm mới
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <OpenTypeCard
            id="btn-open-standard"
            icon="🐷" title="Tiêu chuẩn"
            sub={`Đến ${maxRate}%/năm`}
            accent="var(--color-primary-pink)"
            onClick={() => setView('open-standard')}
          />
          <OpenTypeCard
            id="btn-open-accumulate"
            icon="🌱" title="Tích lũy"
            sub="Gửi góp linh hoạt"
            accent="var(--color-text-green)"
            onClick={() => setView('open-accumulate')}
          />
        </div>
      </div>

      {/* 4. Đang hoạt động */}
      <div style={{ margin: '20px 20px 0' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 10 }}>
          Đang hoạt động
          {activeBooks.length > 0 && (
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 400, marginLeft: 6 }}>
              ({activeBooks.length} sổ)
            </span>
          )}
        </div>

        {activeBooks.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '32px 16px',
            color: 'var(--color-text-secondary)', fontSize: 13,
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🐷</div>
            <div>Chưa có sổ nào đang hoạt động.</div>
            <div style={{ marginTop: 6 }}>Mở sổ mới để Gato bắt đầu tích điểm!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeBooks.map(b => <SavingsBookCard key={b.bookId} book={b} />)}
          </div>
        )}
      </div>

      {/* 5. Lịch sử — collapsed by default */}
      <HistorySection />

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
