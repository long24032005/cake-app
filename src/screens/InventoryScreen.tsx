/**
 * InventoryScreen — Kho đồ của Gato (Spec E/Screen 5)
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { PetDisplay } from '../components/PetDisplay';
import { ROUND_COMPLETE_THRESHOLD } from '../config';
import type { InventoryItemType, InventoryItem } from '../types';

// Tab filter definition
const FILTER_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'voucher', label: 'Voucher' },
  { id: 'pet_accessory', label: 'Phụ kiện' },
  { id: 'badge', label: 'Badge' },
  { id: 'booster', label: 'Booster' },
  { id: 'blind_bag_item', label: 'Blind Bag' },
] as const;

type FilterTab = typeof FILTER_TABS[number]['id'];

const TYPE_ICONS: Record<InventoryItemType, string> = {
  voucher: '🎫',
  pet_accessory: '🎁',
  badge: '🏅',
  booster: '⚡',
  utility_ticket: '🎟️',
  blind_bag_item: '🎁',
};

const ITEM_LABELS: Record<string, string> = {
  cat_ears: 'Mũ Tai Mèo',
  bow_pastel: 'Nơ Cổ Pastel',
  heart_glasses: 'Kính Trái Tim',
  golden_bell: 'Chuông Vàng',
  heart_badge: 'Huy Hiệu Tim',
  princess_crown: 'Vương Miện Công Chúa',
  toy_mouse: 'Bạn Chuột Đồ Chơi',
  gold_fish: 'Cá Vàng Nhỏ',
  feather_band: 'Băng Đô Lông Vũ',
  pirate_hat: 'Mũ Hải Tặc',
  angel_wings: 'Cánh Thiên Thần',
  pearl_necklace: 'Chuỗi Ngọc Trai',
  daisy_flower: 'Hoa Cúc Nhỏ',
  diamond_bracelet: 'Vòng Tay Kim Cương',
  rainbow_lollipop: 'Kẹo Mút Cầu Vồng',
  sparkle_effect: 'Hiệu Ứng Lấp Lánh',
  little_bird: 'Bạn Chim Nhỏ',
  chef_hat: 'Mũ Đầu Bếp',
  star_clip: 'Kẹp Ngôi Sao',
  bunny_hug: 'Thỏ Con Ôm Ấp',
  bow_pink: 'Nơ Hồng',
  wings_small: 'Cánh Nhỏ',
  sticker_pack_1: 'Sticker Pack',
  pet_frame_gold: 'Khung Pet Vàng',
};

const ITEM_ICONS: Record<string, string> = {
  cat_ears: '🐱',
  bow_pastel: '🎀',
  heart_glasses: '👓',
  golden_bell: '🔔',
  heart_badge: '❤️',
  princess_crown: '👑',
  toy_mouse: '🐭',
  gold_fish: '🐠',
  feather_band: '🪶',
  pirate_hat: '🏴‍☠️',
  angel_wings: '👼',
  pearl_necklace: '📿',
  daisy_flower: '🌼',
  diamond_bracelet: '💍',
  rainbow_lollipop: '🍭',
  sparkle_effect: '✨',
  little_bird: '🐦',
  chef_hat: '👨‍🍳',
  star_clip: '⭐',
  bunny_hug: '🐰',
  bow_pink: '🎀',
  wings_small: '🦋',
};

// Formatting date string
function formatDate(isoString: string) {
  const d = new Date(isoString);
  return d.toLocaleDateString('vi-VN');
}

export function InventoryScreen() {
  const user = useAppStore(s => s.user);
  const equipAccessory = useAppStore(s => s.equipAccessory);
  const unequipAccessory = useAppStore(s => s.unequipAccessory);

  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const { inventory, petState, journey } = user;
  const { accessories } = petState;

  // Lọc items
  const filteredItems = inventory.filter(item => {
    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });

  return (
    <div style={{ padding: '0 0 80px' }}>
      {/* ── 1. Header ────────────────────────────────────────── */}
      <div style={{
        padding: '16px 20px 16px 64px',
        fontSize: 20, fontWeight: 900,
        color: 'var(--color-text-primary)'
      }}>
        Kho đồ của Gato
      </div>

      {/* ── 2. Tab Filter ────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto',
        padding: '0 20px 16px', scrollbarWidth: 'none'
      }}>
        {FILTER_TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flexShrink: 0,
                padding: '6px 14px', borderRadius: 20,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                background: isActive ? 'var(--color-primary-pink)' : 'var(--color-bg-card)',
                border: isActive ? '1px solid transparent' : '1px solid var(--color-bg-card-border)',
                color: isActive ? '#fff' : 'var(--color-text-secondary)',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── 3. Section Đang đeo (chỉ hiện khi có phụ kiện) ───── */}
      <AnimatePresence>
        {accessories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              margin: '0 20px 16px', background: 'var(--color-bg-card)',
              border: '1px solid var(--color-bg-card-border)',
              borderRadius: 'var(--radius-card)', padding: '16px',
              display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 12, width: '100%' }}>
                Đang đeo
              </div>
              <PetDisplay
                form={petState.form}
                mood={petState.mood}
                accessories={accessories}
                size="small"
                progressPoints={journey.progressPoints}
                roundCompleteThreshold={ROUND_COMPLETE_THRESHOLD}
              />
              <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                {accessories.map(accId => (
                  <div key={accId} style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 12,
                    background: 'rgba(255,45,140,0.1)', color: 'var(--color-primary-pink)',
                    border: '1px solid rgba(255,45,140,0.3)'
                  }}>
                    {ITEM_LABELS[accId] || accId}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4. Grid Inventory ────────────────────────────────── */}
      <div style={{ padding: '0 20px' }}>
        {filteredItems.length === 0 ? (
          // ── 5. Empty State ───────────────────────────────────
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '40px 0', gap: 16
          }}>
            <div style={{ fontSize: 48, filter: 'grayscale(1)', opacity: 0.5 }}>📦</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', textAlign: 'center', maxWidth: 220 }}>
              Chưa có đồ gì. Tiếp tục tiết kiệm để mở kho nhé!
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12
          }}>
            {filteredItems.map(item => (
              <InventoryCard
                key={item.instanceId}
                item={item}
                isEquipped={item.itemId ? accessories.includes(item.itemId) : false}
                onEquip={() => item.itemId && equipAccessory(item.itemId)}
                onUnequip={() => item.itemId && unequipAccessory(item.itemId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Item Card Component ──────────────────────────────────────
function InventoryCard({
  item, isEquipped, onEquip, onUnequip
}: {
  item: InventoryItem;
  isEquipped: boolean;
  onEquip: () => void;
  onUnequip: () => void;
}) {
  const icon = TYPE_ICONS[item.type] || '🎁';
  const label = item.itemId ? (ITEM_LABELS[item.itemId] || item.itemId) : '';

  // Card specific rendering
  if (item.type === 'voucher') {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(245,166,35,0.15), rgba(245,166,35,0.05))',
        border: '1px solid rgba(245,166,35,0.4)', borderRadius: 12, padding: '12px 8px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        position: 'relative'
      }}>
        <div style={{ fontSize: 24 }}>{icon}</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#F5A623', textAlign: 'center' }}>
          {(item.value ?? 0).toLocaleString('vi-VN')}đ
        </div>
        <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 4 }}>
          Đã nhận: {item.receivedAt ? new Date(item.receivedAt).toLocaleDateString('vi-VN') : '---'}
        </div>
      </div>
    );
  }

  if (item.type === 'pet_accessory') {
    const itemIcon = item.itemId ? (ITEM_ICONS[item.itemId] || icon) : icon;
    return (
      <div style={{
        background: isEquipped ? 'rgba(255,45,140,0.1)' : 'var(--color-bg-card)',
        border: isEquipped ? '1px solid rgba(255,45,140,0.4)' : '1px solid var(--color-bg-card-border)',
        borderRadius: 12, padding: '12px 8px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6
      }}>
        <div style={{ fontSize: 24 }}>{itemIcon}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-primary)', textAlign: 'center' }}>
          {label}
        </div>
        <button
          onClick={isEquipped ? onUnequip : onEquip}
          style={{
            marginTop: 'auto', background: isEquipped ? 'transparent' : 'var(--color-primary-pink)',
            border: isEquipped ? '1px solid var(--color-primary-pink)' : 'none',
            color: isEquipped ? 'var(--color-primary-pink)' : '#fff',
            padding: '4px 12px', borderRadius: 12, fontSize: 10, fontWeight: 700, cursor: 'pointer'
          }}
        >
          {isEquipped ? 'Tháo' : 'Đeo'}
        </button>
      </div>
    );
  }

  // Mặc định (badge, booster, blind_bag_item)
  return (
    <div style={{
      background: 'var(--color-bg-card)', border: '1px solid var(--color-bg-card-border)',
      borderRadius: 12, padding: '12px 8px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6
    }}>
      <div style={{ fontSize: 24 }}>{item.itemId ? (ITEM_ICONS[item.itemId] || icon) : icon}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-primary)', textAlign: 'center' }}>
        {label || item.type}
      </div>
      <div style={{ fontSize: 9, color: 'var(--color-text-secondary)', marginTop: 'auto' }}>
        {formatDate(item.receivedAt)}
      </div>
    </div>
  );
}
