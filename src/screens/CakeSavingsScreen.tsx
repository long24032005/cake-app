/**
 * CakeSavingsScreen — Tiết kiệm tab in Main Cake App
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { GatoEduModal } from '../components/GatoEduModal';

// Gato Egg Widget
function GatoWidget({ onGoToPetApp, onShowEdu }: { onGoToPetApp: () => void; onShowEdu: () => void }) {
  return (
    <motion.div
      onClick={onGoToPetApp}
      whileTap={{ scale: 0.98 }}
      style={{
        margin: '20px 20px 0',
        background: 'linear-gradient(135deg, #1A1635, #2A1B3D)',
        borderRadius: 16,
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: '0 4px 20px rgba(255,45,140,0.2)',
        border: '1px solid rgba(255,45,140,0.3)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
    >
      {/* Pink glow effect */}
      <div style={{ position: 'absolute', top: -20, left: -20, width: 80, height: 80, background: '#FF2D8C', filter: 'blur(40px)', opacity: 0.3 }} />

      <div style={{ width: 50, height: 50, zIndex: 1 }}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="55" r="35" fill="#FF2D8C" />
          <ellipse cx="50" cy="50" rx="35" ry="40" fill="#FF2D8C" />
          <path d="M35 45 C50 35, 65 45, 65 45" stroke="#C21A7A" strokeWidth="3" strokeLinecap="round" />
          <circle cx="42" cy="55" r="3" fill="#fff" />
          <circle cx="58" cy="55" r="3" fill="#fff" />
          <path d="M48 62 Q50 65 52 62" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <div style={{ flex: 1, zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Nuôi Gato cùng bạn</div>
          <button
            onClick={(e) => { e.stopPropagation(); onShowEdu(); }}
            style={{
              width: 18, height: 18, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', border: 'none',
              color: 'rgba(255,255,255,0.6)', fontSize: 11,
              fontWeight: 800, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', padding: 0
            }}
          >?</button>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Tích điểm mỗi ngày, mở quà mỗi mốc 🎁</div>
      </div>

      <div style={{ fontSize: 18, color: '#FF2D8C', fontWeight: 800, zIndex: 1 }}>›</div>
    </motion.div>
  );
}

export function CakeSavingsScreen({ 
  onBack, 
  onGoToPetApp,
  onOpenStandard,
  onOpenAccumulate,
  onManageBooks
}: { 
  onBack: () => void;
  onGoToPetApp: () => void;
  onOpenStandard: () => void;
  onOpenAccumulate: () => void;
  onManageBooks: () => void;
}) {
  const [masked, setMasked] = useState(true);
  const [isEduOpen, setIsEduOpen] = useState(false);
  const allBooks = useAppStore(s => s.user.savingsBooks);
  const inventory = useAppStore(s => s.user.inventory);

  const totalBalance = allBooks.reduce((s, b) => s + b.currentBalance, 0);
  const totalInterest = allBooks.reduce((s, b) =>
    s + Math.floor(b.currentBalance * (b.interestRate / 100) * (b.termMonths / 12)), 0);
  const totalVoucher = inventory.filter(i => i.type === 'voucher').reduce((s, i) => s + (i.value ?? 0), 0);

  const hide = (v: number) => masked ? '*** ***' : v.toLocaleString('vi-VN') + 'đ';

  return (
    <div style={{ background: '#0A0A1A', minHeight: '100%', color: '#fff', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', gap: 16 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', padding: 0 }}>←</button>
        <div style={{ fontSize: 18, fontWeight: 800, flex: 1 }}>Tiền gửi có kỳ hạn</div>
      </div>

      {/* Summary Card */}
      <div style={{ background: '#14142B', borderRadius: 16, padding: '16px 20px', margin: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ fontSize: 20, fontWeight: 900 }}>{hide(totalBalance)}</div>
            <button onClick={() => setMasked(!masked)} style={{ background: 'none', border: 'none', color: '#888', fontSize: 16, cursor: 'pointer', padding: 0 }}>{masked ? '👁' : '🙈'}</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 12, color: '#aaa', display: 'flex', gap: 4, alignItems: 'center' }}>
              Tổng tiền lãi <span style={{ color: '#4ECDA4', fontWeight: 700 }}>{hide(totalInterest)}</span>
              <span style={{ display: 'inline-flex', width: 14, height: 14, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>?</span>
            </div>
            <div style={{ fontSize: 12, color: '#aaa', display: 'flex', gap: 4, alignItems: 'center' }}>
              Tổng tiền thưởng <span style={{ color: '#4ECDA4', fontWeight: 700 }}>{hide(totalVoucher)}</span>
              <span style={{ display: 'inline-flex', width: 14, height: 14, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>?</span>
            </div>
          </div>
        </div>
        <button onClick={onManageBooks} style={{ background: '#FF2D8C', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Quản lý sổ
        </button>
      </div>

      {/* Gato Widget */}
      <GatoWidget onGoToPetApp={onGoToPetApp} onShowEdu={() => setIsEduOpen(true)} />

      {/* Edu Modal */}
      <GatoEduModal isOpen={isEduOpen} onClose={() => setIsEduOpen(false)} />

      {/* Mở sổ tiết kiệm mới */}
      <div style={{ margin: '24px 20px 0' }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>Mở sổ tiết kiệm mới</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Card Tiêu chuẩn */}
          <button onClick={onOpenStandard} style={{ background: '#14142B', borderRadius: 16, padding: '16px', display: 'flex', alignItems: 'center', gap: 16, border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
            <div style={{ fontSize: 32 }}>🐷</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Tiêu chuẩn • Đến 7.40%/năm</div>
              <div style={{ fontSize: 12, color: '#aaa' }}>Gửi với lãi suất cao nhất</div>
            </div>
            <div style={{ color: '#888', fontWeight: 'bold' }}>›</div>
          </button>

          {/* Card Tích lũy */}
          <button onClick={onOpenAccumulate} style={{ background: '#14142B', borderRadius: 16, padding: '16px', display: 'flex', alignItems: 'center', gap: 16, border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
            <div style={{ fontSize: 32 }}>🌱</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Tích lũy • Gửi góp linh hoạt</div>
              <div style={{ fontSize: 12, color: '#aaa' }}>Gửi từng khoản nhỏ cho tương lai</div>
            </div>
            <div style={{ color: '#888', fontWeight: 'bold' }}>›</div>
          </button>
        </div>
      </div>
    </div>
  );
}
