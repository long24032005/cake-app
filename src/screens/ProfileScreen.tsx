/**
 * ProfileScreen — Hồ sơ & Hành trình (Spec E/Screen 6)
 */
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { PetDisplay } from '../components/PetDisplay';
import { ROUND_COMPLETE_THRESHOLD } from '../config';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN');
}

export function ProfileScreen() {
  const user = useAppStore(s => s.user);
  const { journey, petState, savingsBooks, inventory } = user;

  // Tính thống kê
  const totalRounds = journey.totalRoundsCompleted;
  const totalAllTimePoints = journey.progressPoints + journey.runningPoints + (totalRounds * ROUND_COMPLETE_THRESHOLD);
  const totalSaved = savingsBooks.reduce((sum, b) => sum + b.currentBalance, 0);
  const activeBooksCount = savingsBooks.filter(b => b.status === 'active').length;

  const badges = inventory.filter(i => i.type === 'badge');

  return (
    <div style={{ padding: '0 0 80px' }}>
      {/* ── 1. Header & Pet Showcase ────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(255,45,140,0.1) 0%, transparent 100%)',
        padding: '24px 20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        borderBottom: '1px solid var(--color-bg-card-border)'
      }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--color-text-primary)', marginBottom: 24, width: '100%', textAlign: 'left', paddingLeft: 44 }}>
          Hồ sơ của bạn
        </div>
        
        <PetDisplay
          form={petState.form}
          mood={petState.mood}
          accessories={petState.accessories}
          size="large"
          progressPoints={journey.progressPoints}
          roundCompleteThreshold={ROUND_COMPLETE_THRESHOLD}
        />
        
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Vòng hành trình: #{journey.currentRound}
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-primary-pink)', fontWeight: 700, marginTop: 4 }}>
            Tổng điểm đã tích: {totalAllTimePoints.toLocaleString('vi-VN')}
          </div>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* ── 2. Section Thống kê ───────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 12 }}>
            📊 Thống kê tiết kiệm
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10
          }}>
            <StatBox label="Tổng tiền đang gửi" value={`${totalSaved.toLocaleString('vi-VN')}đ`} />
            <StatBox label="Sổ đang hoạt động" value={`${activeBooksCount} sổ`} />
            <StatBox label="Vòng hoàn thành" value={totalRounds.toString()} />
            <StatBox label="Điểm vòng này" value={journey.progressPoints.toLocaleString('vi-VN')} />
          </div>
        </div>

        {/* ── 3. Section Thành tích (Badges) ────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 12 }}>
            🏅 Huy hiệu đã đạt
          </div>
          <div style={{
            background: 'var(--color-bg-card)', border: '1px solid var(--color-bg-card-border)',
            borderRadius: 'var(--radius-card)', padding: '16px',
            display: 'flex', flexWrap: 'wrap', gap: 12
          }}>
            {badges.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', textAlign: 'center', width: '100%' }}>
                Chưa có huy hiệu nào. Hãy tích cực gửi tiết kiệm nhé!
              </div>
            ) : (
              badges.map(b => (
                <div key={b.instanceId} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  width: 60
                }}>
                  <div style={{ fontSize: 24, background: 'rgba(255,45,140,0.1)', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    🏅
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--color-text-secondary)', textAlign: 'center', lineHeight: 1.2 }}>
                    {b.itemId}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── 4. Lịch sử hoàn vòng ───────────────────────────────── */}
        {journey.roundHistory.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 12 }}>
              🔄 Lịch sử hoàn vòng
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {journey.roundHistory.map((h, i) => (
                <div key={i} style={{
                  background: 'var(--color-bg-card)', border: '1px solid var(--color-bg-card-border)',
                  borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      Vòng {h.round}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                      {formatDate(h.completedAt)}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-primary-pink)' }}>
                    {h.finalPoints.toLocaleString('vi-VN')} pts
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 5. Cài đặt / Reset ────────────────────────────────── */}
        <button
          onClick={() => {
            if (window.confirm('Bạn có chắc muốn xóa toàn bộ dữ liệu hiện tại?')) {
              useAppStore.getState().hardReset();
            }
          }}
          style={{
            width: '100%', padding: '14px', borderRadius: 'var(--radius-btn)',
            background: 'transparent', border: '1px solid rgba(255,107,107,0.4)',
            color: '#FF6B6B', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            marginTop: 12
          }}
        >
          Xóa dữ liệu (Hard Reset)
        </button>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string, value: string }) {
  return (
    <div style={{
      background: 'var(--color-bg-card)', border: '1px solid var(--color-bg-card-border)',
      borderRadius: 12, padding: '12px', display: 'flex', flexDirection: 'column', gap: 4
    }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-primary)' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{label}</div>
    </div>
  );
}
