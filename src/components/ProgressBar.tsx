/**
 * ProgressBar — Spec C2
 * - progressPoints (chốt): gradient pink fill
 * - runningPoints (đang chạy): lighter + shimmer
 * - 3 tầng mốc: Small=white dot, Mid=blue star, Large=pink cat head
 * - Mốc đã đạt: filled + tick; Chưa đạt: outline
 * - Phía dưới: "X điểm đến mốc tiếp theo"
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LARGE_MILESTONES, SMALL_MILESTONES, MID_MILESTONES, ROUND_COMPLETE_THRESHOLD } from '../config';
import type { MilestoneHistoryEntry } from '../types';

interface ProgressBarProps {
  progressPoints: number;
  runningPoints: number;
  milestoneHistory: MilestoneHistoryEntry[];
  totalBonus?: number;
}

const ALL_MARKERS = [
  ...LARGE_MILESTONES.map(m => ({ ...m, tier: 'large' as const })),
  ...MID_MILESTONES.map(m  => ({ ...m, tier: 'mid'   as const })),
  ...SMALL_MILESTONES.map(m => ({ ...m, tier: 'small' as const })),
];

function pct(pts: number) {
  return Math.min((pts / ROUND_COMPLETE_THRESHOLD) * 100, 100);
}

function MarkerIcon({ tier, earned }: { tier: 'large' | 'mid' | 'small'; earned: boolean }) {
  if (tier === 'large') {
    return (
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        background: earned ? 'var(--color-primary-pink)' : 'transparent',
        border: `2px solid var(--color-primary-pink)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, lineHeight: 1,
        boxShadow: earned ? '0 0 8px rgba(255,45,140,0.6)' : 'none',
        transition: 'all 0.3s',
      }}>
        {earned ? '✓' : '🐱'}
      </div>
    );
  }
  if (tier === 'mid') {
    return (
      <div style={{
        width: 16, height: 16, borderRadius: '50%',
        background: earned ? 'var(--color-text-blue)' : 'transparent',
        border: `2px solid var(--color-text-blue)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9,
        boxShadow: earned ? '0 0 6px rgba(91,200,245,0.6)' : 'none',
        transition: 'all 0.3s',
      }}>
        {earned ? '✓' : '★'}
      </div>
    );
  }
  // small
  return (
    <div style={{
      width: 10, height: 10, borderRadius: '50%',
      background: earned ? 'white' : 'transparent',
      border: '2px solid rgba(255,255,255,0.7)',
      transition: 'all 0.3s',
    }} />
  );
}

export function ProgressBar({ progressPoints, runningPoints, milestoneHistory, totalBonus = 0 }: ProgressBarProps) {
  const [selectedMarker, setSelectedMarker] = useState<typeof ALL_MARKERS[0] | null>(null);

  const earnedIds = new Set(milestoneHistory.map(h => h.milestoneId));
  const totalPts = progressPoints + runningPoints;

  // Find next unearned milestone
  const nextMilestone = [...ALL_MARKERS]
    .sort((a, b) => a.pointsRequired - b.pointsRequired)
    .find(m => !earnedIds.has(m.id));

  const ptsToNext = nextMilestone ? Math.max(0, nextMilestone.pointsRequired - progressPoints) : 0;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* Scrollable Container */}
      <div style={{ 
        width: '100%', overflowX: 'auto', overflowY: 'visible',
        paddingBottom: 20, paddingTop: 20,
        scrollbarWidth: 'none' /* Firefox */
      }}>
        <div style={{ position: 'relative', height: 44, display: 'flex', alignItems: 'center', minWidth: 6000, margin: '0 16px', paddingRight: 16 }}>

          {/* Bar track */}
          <div style={{
            position: 'absolute', bottom: 6, left: 0, right: 0,
            height: 10, borderRadius: 5,
            background: 'var(--color-bg-card-border)',
            overflow: 'visible',
          }}>
            {/* Running points fill (behind locked) */}
            <motion.div
              style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                borderRadius: 5,
                background: 'rgba(255,45,140,0.25)',
                backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
              }}
              animate={{ width: `${pct(totalPts)}%`, backgroundPosition: ['200% center', '-200% center'] }}
              transition={{ width: { duration: 0.8, ease: 'easeOut' }, backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' } }}
            />

            {/* Locked points fill (on top) */}
            <motion.div
              style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                borderRadius: 5,
                background: 'linear-gradient(135deg, #FF2D8C, #C21A7A)',
                boxShadow: '0 0 8px rgba(255,45,140,0.5)',
              }}
              animate={{ width: `${pct(progressPoints)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          {/* Milestone markers */}
          {ALL_MARKERS.map((m) => {
            const left = pct(m.pointsRequired);
            const earned = earnedIds.has(m.id);
            const isSelected = selectedMarker?.id === m.id;
            
            // Put large markers exactly on track
            const bottomOffset =
              m.tier === 'large' ? 14 :
              m.tier === 'mid'   ? 10 : 6;

            return (
              <div
                key={m.id}
                onClick={() => setSelectedMarker(isSelected ? null : m)}
                style={{
                  position: 'absolute',
                  left: `${left}%`,
                  bottom: bottomOffset,
                  transform: 'translateX(-50%)',
                  zIndex: isSelected ? 10 : (m.tier === 'large' ? 3 : m.tier === 'mid' ? 2 : 1),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <MarkerIcon tier={m.tier} earned={earned} />
                
                {/* We removed the inline tooltip from here */}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed Full-Screen Popup for Selected Marker */}
      <AnimatePresence>
        {selectedMarker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMarker(null)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)', zIndex: 99999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)', padding: 20
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-primary-pink)',
                borderRadius: 20, padding: 24,
                width: '100%', maxWidth: 320,
                boxShadow: '0 8px 32px rgba(255,45,140,0.3)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                position: 'relative'
              }}
            >
              <button
                onClick={() => setSelectedMarker(null)}
                style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  width: 28, height: 28, borderRadius: '50%',
                  color: '#fff', fontSize: 16, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >✕</button>

              <div style={{ fontSize: 40, marginBottom: 8 }}>
                {selectedMarker.tier === 'large' ? '🎁' : selectedMarker.tier === 'mid' ? '🎒' : '🍬'}
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>Mốc {selectedMarker.id}</div>
              <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                Yêu cầu: <span style={{ color: 'var(--color-primary-pink)', fontWeight: 800 }}>{selectedMarker.pointsRequired.toLocaleString('vi-VN')}</span> điểm
              </div>
              
              <div style={{
                marginTop: 8, padding: '12px 16px', borderRadius: 12, width: '100%',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>Phần thưởng</div>
                {selectedMarker.tier === 'large' && <div style={{ color: '#FFD700', fontWeight: 700, fontSize: 15 }}>Voucher tiền mặt & Túi Mù ngẫu nhiên</div>}
                {selectedMarker.tier === 'mid' && <div style={{ color: '#E0F7FA', fontWeight: 700, fontSize: 15 }}>Thẻ Booster tăng điểm & Tiện ích</div>}
                {selectedMarker.tier === 'small' && <div style={{ color: '#E0F7FA', fontWeight: 700, fontSize: 15 }}>Phụ kiện / Huy hiệu Gato</div>}
              </div>

              {earnedIds.has(selectedMarker.id) ? (
                <div style={{ marginTop: 8, color: '#4ECDA4', fontWeight: 800, fontSize: 14 }}>
                  ✓ Bạn đã đạt mốc này
                </div>
              ) : (
                <div style={{ marginTop: 8, color: '#aaa', fontWeight: 600, fontSize: 13 }}>
                  🔒 Cố gắng tích thêm điểm nhé!
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3 Compact Point Baskets (Horizontal Flex Row) */}
      <div style={{
        display: 'flex',
        gap: 6,
        padding: '0 16px',
        marginTop: 10,
        marginBottom: 8,
      }}>
        {/* Basket 1: Đang Tích */}
        <div style={{
          flex: 1,
          background: 'rgba(155, 150, 200, 0.05)',
          border: '1px solid rgba(155, 150, 200, 0.12)',
          borderRadius: 8,
          padding: '6px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }} title="Điểm đang chạy hàng ngày, chưa chốt chu kỳ">
          <span style={{ fontSize: 9, fontWeight: 700, color: '#B39DDB', display: 'flex', alignItems: 'center', gap: 2 }}>
            <span>⏳</span> Tích lũy
          </span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#B39DDB' }}>
            ~{runningPoints.toLocaleString('vi-VN')}
          </span>
        </div>

        {/* Basket 2: Đã Chốt */}
        <div style={{
          flex: 1,
          background: 'rgba(255, 45, 140, 0.05)',
          border: '1px solid rgba(255, 45, 140, 0.15)',
          borderRadius: 8,
          padding: '6px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }} title="Điểm đã chốt chu kỳ 30 ngày an toàn, dùng để leo mốc đổi quà">
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-primary-pink)', display: 'flex', alignItems: 'center', gap: 2 }}>
            <span>✓</span> Đã chốt
          </span>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-primary-pink)' }}>
            {progressPoints.toLocaleString('vi-VN')}
          </span>
        </div>

        {/* Basket 3: Điểm Thưởng */}
        <div style={{
          flex: 1,
          background: 'rgba(255, 215, 0, 0.03)',
          border: '1px solid rgba(255, 215, 0, 0.12)',
          borderRadius: 8,
          padding: '6px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }} title="Điểm thưởng cam kết nhận khi đáo hạn sổ tiết kiệm">
          <span style={{ fontSize: 9, fontWeight: 700, color: '#FFD700', display: 'flex', alignItems: 'center', gap: 2 }}>
            <span>🎁</span> Thưởng
          </span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#FFD700' }}>
            {totalBonus.toLocaleString('vi-VN')}
          </span>
        </div>
      </div>

      {/* Next milestone label */}
      {nextMilestone && (
        <div style={{
          fontSize: 10,
          color: 'var(--color-text-secondary)',
          textAlign: 'right',
          paddingRight: 16,
          marginTop: 4,
          opacity: 0.95
        }}>
          còn <span style={{ color: 'var(--color-text-blue)', fontWeight: 700 }}>{ptsToNext.toLocaleString('vi-VN')}</span> điểm đến <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{nextMilestone.id}</span>
        </div>
      )}
    </div>
  );
}
