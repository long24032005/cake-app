/**
 * MilestoneRewardPopup — Spec C2
 * - Popup full-screen khi đạt mốc
 * - Animation mở: scale 0→1 + confetti 🐱 màu hồng rơi xuống
 * - Nếu có blind bag: animation flip card reveal
 * - Nút "Mở quà" và "Đóng" + "Xem kho đồ"
 */
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { AnyMilestone } from '../config';

// ── Blind bag item human-readable labels
const BAG_ITEM_LABELS: Record<string, { label: string; icon: string }> = {
  sticker_pack_1:  { label: 'Sticker Pack',       icon: '🎨' },
  pet_frame_gold:  { label: 'Khung Pet Vàng',      icon: '🖼️' },
  voucher_10k:     { label: 'Voucher 10,000đ',     icon: '💰' },
  voucher_50k:     { label: 'Voucher 50,000đ',     icon: '💰' },
};

// ── Reward display per type
function rewardLabel(m: AnyMilestone): { icon: string; text: string } {
  switch (m.rewardType) {
    case 'cash_voucher':    return { icon: '🎫', text: `Voucher ${(m as any).rewardValue?.toLocaleString('vi-VN')}đ` };
    case 'pet_accessory':   return { icon: '🎀', text: `Phụ kiện: ${(m as any).itemId}` };
    case 'badge':           return { icon: '🏅', text: `Huy hiệu: ${(m as any).itemId}` };
    case 'booster':         return { icon: '⚡', text: `Booster: ${(m as any).itemId}` };
    case 'utility_ticket':  return { icon: '🎫', text: `Vé: ${(m as any).itemId}` };
    default:                return { icon: '🎁', text: 'Phần thưởng đặc biệt' };
  }
}

// ── Tier colors
const TIER_STYLE: Record<string, { bg: string; border: string; label: string }> = {
  L: { bg: 'rgba(255,45,140,0.15)',  border: 'rgba(255,45,140,0.5)',  label: 'Mốc Lớn'  },
  M: { bg: 'rgba(91,200,245,0.12)',  border: 'rgba(91,200,245,0.4)',  label: 'Mốc Trung' },
  S: { bg: 'rgba(155,150,200,0.12)', border: 'rgba(155,150,200,0.3)', label: 'Mốc Nhỏ'  },
};
function tierOf(id: string) {
  return TIER_STYLE[id[0]] ?? TIER_STYLE['S'];
}

// ── Confetti particles (memoized so they don't regenerate each render)
function Confetti() {
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: 3 + Math.random() * 94,
      delay: Math.random() * 0.7,
      duration: 1.6 + Math.random() * 1.4,
      rotate: Math.random() * 360,
      size: 12 + Math.random() * 8,
    })),
  []);

  return (
    <>
      {particles.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: -30,
            zIndex: 310,
            fontSize: p.size,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
          animate={{
            y: ['0vh', '105vh'],
            rotate: [p.rotate, p.rotate + 360],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeIn',
            repeat: Infinity,
            repeatDelay: 0.2,
          }}
        >🐱</motion.div>
      ))}
    </>
  );
}

// ── Blind bag flip card
function BlindBagCard({ itemId }: { itemId: string }) {
  const [opened, setOpened] = useState(false);
  const item = BAG_ITEM_LABELS[itemId] ?? { label: itemId, icon: '🎁' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 600 }}>
        🎲 Blind Bag bí ẩn
      </div>

      {/* Flip card container */}
      <div style={{ perspective: 600, width: 120, height: 120 }}>
        <motion.div
          style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d' }}
          animate={{ rotateY: opened ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Front face — ? */}
          <div style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
            background: 'linear-gradient(135deg, #2D2850, #1A1635)',
            border: '2px solid rgba(255,45,140,0.4)',
            borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 6,
          }}>
            <span style={{ fontSize: 36 }}>🎁</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>???</span>
          </div>

          {/* Back face — revealed */}
          <div style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, rgba(255,45,140,0.2), rgba(194,26,122,0.2))',
            border: '2px solid var(--color-primary-pink)',
            borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 6,
            boxShadow: '0 0 20px rgba(255,45,140,0.4)',
          }}>
            <span style={{ fontSize: 36 }}>{item.icon}</span>
            <span style={{ fontSize: 10, color: 'var(--color-primary-pink)', fontWeight: 700, textAlign: 'center', padding: '0 8px' }}>
              {item.label}
            </span>
          </div>
        </motion.div>
      </div>

      {!opened && (
        <motion.button
          id="btn-open-blind-bag"
          onClick={() => setOpened(true)}
          whileTap={{ scale: 0.95 }}
          style={{
            background: 'linear-gradient(135deg, #FF2D8C, #C21A7A)',
            border: 'none', borderRadius: 20, padding: '8px 20px',
            color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(255,45,140,0.4)',
          }}
        >✨ Mở quà</motion.button>
      )}

      {opened && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ fontSize: 12, color: 'var(--color-text-green)', fontWeight: 600 }}
        >Đã thêm vào kho đồ! 🎉</motion.div>
      )}
    </div>
  );
}

// ── Main popup
interface MilestoneRewardPopupProps {
  milestone: AnyMilestone;
  blindBagItem?: string | null;
  onClose: () => void;
  onViewInventory: () => void;
}

export function MilestoneRewardPopup({
  milestone, blindBagItem, onClose, onViewInventory,
}: MilestoneRewardPopupProps) {
  const tier    = tierOf(milestone.id);
  const reward  = rewardLabel(milestone);
  const hasBag  = !!(blindBagItem && (milestone as any).blindBagEnabled);

  return (
    <div style={{
      position: 'fixed', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430, zIndex: 300, pointerEvents: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {/* Confetti layer */}
      <Confetti />

      {/* Overlay backdrop */}
      <motion.div
        id="milestone-popup-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0, zIndex: 300,
          background: 'rgba(13,11,31,0.85)',
          backdropFilter: 'blur(6px)',
          pointerEvents: 'auto'
        }}
      />

      {/* Popup card */}
      <motion.div
        id="milestone-popup-card"
        initial={{ scale: 0, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0, opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        style={{
          position: 'relative', zIndex: 301,
          width: 'min(340px, calc(100% - 32px))',
          background: 'var(--color-bg-card)',
          border: `1.5px solid ${tier.border}`,
          borderRadius: 24,
          padding: '28px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
          boxShadow: `0 0 40px ${tier.border}, 0 20px 60px rgba(0,0,0,0.5)`,
          pointerEvents: 'auto'
        }}
      >
        {/* Glow ring */}
        <div style={{
          position: 'absolute', inset: -8, borderRadius: 32,
          background: `radial-gradient(ellipse, ${tier.bg} 0%, transparent 70%)`,
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Tier badge */}
        <motion.div
          animate={{ rotate: [0, -3, 3, -3, 3, 0] }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            background: tier.bg, border: `1px solid ${tier.border}`,
            borderRadius: 20, padding: '4px 14px',
            fontSize: 11, fontWeight: 800, letterSpacing: '0.08em',
            color: 'var(--color-text-primary)', textTransform: 'uppercase', zIndex: 1,
          }}
        >{tier.label} • {milestone.id}</motion.div>

        {/* Title */}
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{ fontSize: 36, marginBottom: 6 }}
          >🎉</motion.div>
          <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
            Bạn đã đạt mốc!
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
            {milestone.pointsRequired.toLocaleString('vi-VN')} điểm chốt
          </div>
        </div>

        {/* Reward card */}
        <div style={{
          width: '100%', background: tier.bg,
          border: `1px solid ${tier.border}`,
          borderRadius: 14, padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 12, zIndex: 1,
        }}>
          <span style={{ fontSize: 28 }}>{reward.icon}</span>
          <div>
            <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginBottom: 2 }}>Phần thưởng</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {reward.text}
            </div>
          </div>
        </div>

        {/* Blind bag section */}
        {hasBag && blindBagItem && (
          <div style={{ width: '100%', zIndex: 1 }}>
            <div style={{
              height: 1, background: 'var(--color-bg-card-border)',
              margin: '0 0 16px',
            }} />
            <BlindBagCard itemId={blindBagItem} />
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, width: '100%', zIndex: 1 }}>
          <button
            id="btn-view-inventory"
            onClick={onViewInventory}
            style={{
              flex: 1, padding: '12px', borderRadius: 'var(--radius-btn)',
              background: 'linear-gradient(135deg, #FF2D8C, #C21A7A)',
              border: 'none', color: '#fff', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,45,140,0.35)',
            }}
          >🎒 Xem kho đồ</button>
          <button
            id="btn-close-milestone-popup"
            onClick={onClose}
            style={{
              padding: '12px 16px', borderRadius: 'var(--radius-btn)',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-bg-card-border)',
              color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: 13,
              cursor: 'pointer',
            }}
          >Đóng</button>
        </div>
      </motion.div>
    </div>
  );
}
