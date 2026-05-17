/**
 * HomeScreen — Spec E/Screen 1
 * Layout (top→bottom):
 *  1. Header bar: Logo CAKE + 🔔
 *  2. Greeting: "Xin chào, [Tên]! 👋" + "Vòng hành trình #N"
 *  3. Pet Display (CENTER) + glow
 *  4. Progress Bar section
 *  5. Quick Stats (3 cards)
 *  6. Savings books horizontal scroll
 *  7. Inventory banner (nếu có item)
 */
import { motion } from 'framer-motion';
import { PetDisplay } from '../components/PetDisplay';
import { ProgressBar } from '../components/ProgressBar';
import { SavingsBookCardCompact } from '../components/SavingsBookCardCompact';
import { useAppStore } from '../store/useAppStore';
import { calculateDailyPoints } from '../engine/pointEngine';
import { ROUND_COMPLETE_THRESHOLD } from '../config';
import { GatoEduModal } from '../components/GatoEduModal';
import { useState } from 'react';

interface HomeScreenProps {
  onGoToInventory?: () => void;
  onGoToSavings?: () => void;
  onGoToMilestoneMap?: () => void;
  onLogoTap?: () => void;  // 5 taps to open Sim Mode
}

// ── Quick Stat Card ──────────────────────────────────────────
function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div style={{
      flex: 1, background: 'var(--color-bg-card)',
      border: '1px solid var(--color-bg-card-border)',
      borderRadius: 'var(--radius-card)', padding: '10px 8px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: accent ?? 'var(--color-text-primary)' }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', textAlign: 'center', lineHeight: 1.3 }}>
        {label}
      </div>
    </div>
  );
}

// ── Main Screen ──────────────────────────────────────────────
export function HomeScreen({ onGoToInventory, onGoToSavings, onGoToMilestoneMap, onLogoTap }: HomeScreenProps) {
  const user      = useAppStore(s => s.user);
  const [isEduOpen, setIsEduOpen] = useState(false);
  const { journey, petState, savingsBooks, inventory } = user;

  const activeBooks = savingsBooks.filter(b => b.status === 'active');
  const unclaimedCount = inventory.length; // all items as "unclaimed" display

  // Điểm hôm nay = tổng daily rate từ active books
  const dailyRate = activeBooks.reduce((sum, b) => sum + calculateDailyPoints(b), 0);
  const totalBonus = savingsBooks.reduce((sum, b) => sum + b.pointTracking.commitmentBonusPoints, 0);

  return (
    <div style={{ padding: '0 0 16px' }}>

      {/* ── 1. Header bar ─────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
        padding: '16px 20px 8px', position: 'relative'
      }}>
        <div
          id="logo-cake"
          onClick={onLogoTap}
          style={{ 
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            fontSize: 16, fontWeight: 800, letterSpacing: '0.5px', 
            cursor: onLogoTap ? 'pointer' : 'default', userSelect: 'none',
            color: 'var(--color-primary-pink)'
          }}
          title="Easter egg 🐱"
        >
          NUÔI GATO
        </div>
        <button
          id="btn-notification"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 20, position: 'relative', padding: 4,
          }}
          aria-label="Thông báo"
        >
          🔔
          {unclaimedCount > 0 && (
            <span style={{
              position: 'absolute', top: 0, right: 0,
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--color-primary-pink)',
            }} />
          )}
        </button>
      </div>

      {/* ── 2. Greeting ───────────────────────────────────── */}
      <div style={{ padding: '4px 20px 0' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)' }}>
          Xin chào, {user.displayName}! 👋
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
          Vòng hành trình #{journey.currentRound}
        </div>
      </div>

      {/* ── 3. Pet Display (CENTER) ───────────────────────── */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '24px 0 16px', position: 'relative',
      }}>
        <PetDisplay
          form={petState.form}
          mood={petState.mood}
          accessories={petState.accessories}
          size="large"
          progressPoints={journey.progressPoints}
          roundCompleteThreshold={ROUND_COMPLETE_THRESHOLD}
        />
      </div>

      {/* ── 4. Progress Bar ───────────────────────────────── */}
      <div style={{
        margin: '0 20px',
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-bg-card-border)',
        borderRadius: 'var(--radius-card)',
        padding: '14px 16px 12px',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Hành trình của Gato
            </div>
            <button
              onClick={() => setIsEduOpen(true)}
              style={{
                width: 18, height: 18, borderRadius: '50%',
                background: 'rgba(155,150,200,0.15)', border: 'none',
                color: 'var(--color-text-secondary)', fontSize: 11,
                fontWeight: 800, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', padding: 0
              }}
            >?</button>
          </div>
          <button
            id="btn-milestone-map"
            onClick={onGoToMilestoneMap}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, color: 'var(--color-text-blue)',
              padding: 0, fontWeight: 600,
            }}
          >Xem tất cả mốc thưởng &gt;</button>
        </div>

        <ProgressBar
          progressPoints={journey.progressPoints}
          runningPoints={journey.runningPoints}
          milestoneHistory={journey.milestoneHistory}
          totalBonus={totalBonus}
        />
      </div>

      {/* ── 5. Quick Stats ────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, margin: '12px 20px 0' }}>
        <StatCard label="Sổ đang hoạt động" value={activeBooks.length} accent="var(--color-text-green)" />
        <StatCard label="Điểm hôm nay" value={`+${dailyRate}`} accent="var(--color-primary-pink)" />
        <StatCard label="Vòng hoàn thành" value={journey.totalRoundsCompleted} accent="var(--color-text-blue)" />
      </div>

      {/* ── 6. Active Books Horizontal Scroll ─────────────── */}
      <div style={{ marginTop: 20 }}>
        <div style={{
          padding: '0 20px', fontSize: 14, fontWeight: 700,
          color: 'var(--color-text-primary)', marginBottom: 10,
        }}>
          Đang tích điểm
        </div>

        <div style={{
          display: 'flex', gap: 10, overflowX: 'auto', overflowY: 'visible',
          padding: '4px 20px 8px', scrollbarWidth: 'none',
        }}>
          {activeBooks.length === 0 ? (
            <div style={{
              fontSize: 13, color: 'var(--color-text-secondary)',
              padding: '12px 0',
            }}>
              Chưa có sổ nào đang chạy.
            </div>
          ) : (
            activeBooks.map(book => (
              <motion.div key={book.bookId} whileTap={{ scale: 0.97 }}>
                <SavingsBookCardCompact book={book} />
              </motion.div>
            ))
          )}

          {/* + Mở sổ mới button — ghost style, border hồng */}
          <button
            id="btn-open-new-book"
            onClick={onGoToSavings}
            style={{
              minWidth: 140, height: '100%', minHeight: 120,
              background: 'transparent',
              border: '1.5px dashed var(--color-primary-pink)',
              borderRadius: 'var(--radius-card)',
              cursor: 'pointer', color: 'var(--color-primary-pink)',
              fontWeight: 700, fontSize: 13,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 6, flexShrink: 0,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,45,140,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ fontSize: 22 }}>＋</span>
            <span>Mở sổ mới</span>
          </button>
        </div>
      </div>

      {/* ── 7. Inventory Banner ───────────────────────────── */}
      {unclaimedCount > 0 && (
        <motion.button
          id="btn-inventory-banner"
          onClick={onGoToInventory}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          style={{
            margin: '12px 20px 0',
            width: 'calc(100% - 40px)',
            background: 'linear-gradient(135deg, rgba(255,45,140,0.18), rgba(194,26,122,0.18))',
            border: '1px solid rgba(255,45,140,0.4)',
            borderRadius: 'var(--radius-card)',
            padding: '12px 16px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🎁</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Bạn có {unclaimedCount} phần thưởng
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-secondary-pink)' }}>
                Tap để xem kho đồ
              </div>
            </div>
          </div>
          <span style={{ color: 'var(--color-primary-pink)', fontSize: 16 }}>›</span>
        </motion.button>
      )}
      {/* Educational Modal */}
      <GatoEduModal isOpen={isEduOpen} onClose={() => setIsEduOpen(false)} />
    </div>
  );
}
