/**
 * MainCakeHomeScreen — The realistic fake Cake App home screen
 */
import { motion } from 'framer-motion';

export function MainCakeHomeScreen({ onGoToSavings }: { onGoToSavings: () => void }) {
  return (
    <div style={{ background: '#0A0A1A', minHeight: '100%', color: '#fff', paddingBottom: 80 }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1A1A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 'bold', border: '2px solid #5BC8F5' }}>
          NL
        </div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#FF2D8C', letterSpacing: '-1px' }}>
          CAKE
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔍</div>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            🔔
            <div style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: '#FF2D8C' }} />
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      <div style={{ margin: '0 20px', background: '#14142B', borderRadius: 16, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
            <span>🎁</span> Ưu đãi chỉ dành riêng bạn
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
            <span>⚡</span> Hoàn 199K khi nâng cấp gói Freedom nhé!
          </div>
        </div>
        <div style={{ color: '#888', fontWeight: 'bold' }}>›</div>
      </div>

      {/* Promo Banner Placeholder */}
      <div style={{ margin: '16px 20px', height: 120, borderRadius: 16, background: 'linear-gradient(135deg, #FF2D8C, #F5A623)', display: 'flex', padding: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-1px', zIndex: 1 }}>CAKE</div>
        <div style={{ position: 'absolute', right: 20, bottom: 20, fontSize: 32, fontWeight: 900, color: '#0A0A1A', opacity: 0.3, zIndex: 1 }}>be</div>
      </div>

      {/* Account Cards */}
      <div style={{ display: 'flex', gap: 12, margin: '0 20px' }}>
        <div style={{ flex: 1, background: '#14142B', borderRadius: 16, border: '1.5px solid #FF2D8C', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600 }}>TÀI KHOẢN CHÍNH ›</div>
            <div style={{ fontSize: 14, color: '#aaa' }}>👁</div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>********** đ</div>
        </div>
        <div style={{ flex: 1, background: '#14142B', borderRadius: 16, border: '1.5px solid #5BC8F5', padding: '16px' }}>
          <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600, marginBottom: 8 }}>KHOẢN VAY ›</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Thời hạn linh hoạt</div>
        </div>
      </div>

      {/* Grid Features */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px 10px', margin: '24px 20px' }}>
        {[
          { icon: '💸', label: 'Chuyển tiền' },
          { icon: '🎟️', label: 'Vé sự kiện' },
          { icon: '🌍', label: 'Nhận tiền QT' },
          { icon: '👥', label: 'Mời bạn bè' },
          { icon: '🎱', label: 'Vietlott' },
          { icon: '🍏', label: 'Apple Pay' },
          { icon: '🎯', label: 'Ưu đãi' },
          { icon: '🧾', label: 'Hóa đơn lưu' },
          { icon: '📱', label: 'Nạp điện thoại' },
          { icon: '⚡', label: 'Hóa đơn' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 24 }}>{item.icon}</div>
            <div style={{ fontSize: 10, color: '#ccc', textAlign: 'center', lineHeight: 1.2 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Fake Transaction History */}
      <div style={{ margin: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[
          { icon: 'C', title: 'Trả lãi tài khoản thanh toán', date: '01/05, 08:24', amt: '+27 đ', color: '#4ECDA4' },
          { icon: '💳', title: 'Thanh toán thẻ tín dụng', date: '28/04, 13:11', amt: '-176.314 đ', color: '#fff' },
          { icon: '→', title: 'Tới NGUYEN THI TUYET', date: '19/04, 12:35', amt: '-70.000 đ', color: '#fff' },
        ].map((tx, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1A1A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#ccc' }}>
              {tx.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 2 }}>Loại giao dịch</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{tx.title}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: tx.color }}>{tx.amt}</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{tx.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CakeBottomNav({ activeTab, onTabChange }: { activeTab: string, onTabChange: (t: string) => void }) {
  const tabs = [
    { id: 'vay_nhanh', icon: '💰', label: 'VAY NHANH' },
    { id: 'ung_truoc', icon: '💵', label: 'ỨNG TRƯỚC' },
    { id: 'qr', icon: '📱', label: 'QUÉT QR', isCenter: true },
    { id: 'tiet_kiem', icon: '🐷', label: 'TIẾT KIỆM' },
    { id: 'dau_tu', icon: '📈', label: 'ĐẦU TƯ' },
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: '#0D0D20', borderTop: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end',
      padding: '10px 10px 24px', zIndex: 100
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onTabChange(t.id)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            flex: 1, padding: 0, color: activeTab === t.id ? '#FF2D8C' : '#888'
          }}
        >
          {t.isCenter ? (
            <div style={{
              width: 50, height: 50, borderRadius: '50%', background: '#FF2D8C',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, marginBottom: 4, color: '#fff', boxShadow: '0 4px 12px rgba(255,45,140,0.4)'
            }}>
              {t.icon}
            </div>
          ) : (
            <div style={{ fontSize: 24 }}>{t.icon}</div>
          )}
          <div style={{ fontSize: 9, fontWeight: 800 }}>{t.label}</div>
        </button>
      ))}
    </div>
  );
}
