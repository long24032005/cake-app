import { useAppStore } from '../store/useAppStore';
import { LARGE_MILESTONES, SMALL_MILESTONES, MID_MILESTONES } from '../config';

export function MilestoneMapScreen({ onBack }: { onBack: () => void }) {
  const user = useAppStore(s => s.user);
  const { progressPoints } = user.journey;

  const allMilestones = [...LARGE_MILESTONES, ...SMALL_MILESTONES, ...MID_MILESTONES]
    .sort((a, b) => a.pointsRequired - b.pointsRequired);

  return (
    <div style={{ padding: '20px 0', paddingBottom: 80, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', padding: '0 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button 
          onClick={onBack}
          style={{ 
            background: 'none', border: 'none', color: 'var(--color-primary-pink)', 
            fontSize: 24, cursor: 'pointer', padding: 0 
          }}
        >
          ←
        </button>
        <h2 style={{ margin: 0, fontSize: 18, color: 'var(--color-text-primary)' }}>Bản đồ mốc thưởng</h2>
      </div>

      <div style={{ 
        position: 'relative', 
        width: '100%', 
        padding: '0 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 30
      }}>
        {/* Vertical Line */}
        <div style={{
          position: 'absolute',
          left: 40,
          top: 0,
          bottom: 0,
          width: 4,
          background: 'var(--color-bg-card-border)',
          zIndex: 0
        }} />

        {allMilestones.map((ms, index) => {
          const isReached = progressPoints >= ms.pointsRequired;
          const isCurrent = !isReached && (index === 0 || progressPoints >= allMilestones[index - 1].pointsRequired);
          
          let icon = '🎁';
          if (ms.rewardType === 'cash_voucher') icon = '💵';
          else if (ms.rewardType === 'pet_accessory') icon = '🎀';
          else if (ms.rewardType === 'badge') icon = '🏅';
          else if (ms.rewardType === 'booster') icon = '⚡';
          
          return (
            <div key={ms.id} style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative', zIndex: 1 }}>
              {/* Node */}
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: isCurrent ? 'var(--color-primary-pink)' : isReached ? 'var(--color-bg-card)' : 'var(--color-bg-card)',
                border: `3px solid ${isCurrent || isReached ? 'var(--color-primary-pink)' : 'var(--color-bg-card-border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
                boxShadow: isCurrent ? '0 0 15px rgba(255,45,140,0.5)' : 'none',
                flexShrink: 0
              }}>
                {isReached ? '✓' : icon}
              </div>
              
              {/* Info */}
              <div style={{
                background: 'var(--color-bg-card)',
                border: `1px solid ${isCurrent ? 'var(--color-primary-pink)' : 'var(--color-bg-card-border)'}`,
                borderRadius: 'var(--radius-card)',
                padding: '12px 16px',
                flex: 1,
                opacity: isReached ? 0.7 : 1
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Mốc {ms.pointsRequired.toLocaleString()} điểm
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                  Phần thưởng: {ms.rewardType === 'cash_voucher' ? `${ms.rewardValue?.toLocaleString()}đ` : 'Vật phẩm'}
                </div>
                {isCurrent && (
                  <div style={{ fontSize: 11, color: 'var(--color-primary-pink)', marginTop: 6, fontWeight: 600 }}>
                    BẠN ĐANG Ở ĐÂY
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
