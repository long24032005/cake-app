import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function GatoEduModal({ isOpen, onClose }: Props) {
  const rootEl = document.getElementById('root');
  if (!rootEl) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 430, zIndex: 1000, pointerEvents: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(13,11,31,0.92)', backdropFilter: 'blur(8px)', pointerEvents: 'auto' }}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'relative', width: '90%', maxHeight: '85vh',
              background: 'var(--color-bg-card)', border: '1.5px solid var(--color-bg-card-border)',
              borderRadius: 28, padding: '24px 0 0', display: 'flex', flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)', pointerEvents: 'auto', overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ padding: '0 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0 }}>
                Nuôi Gato là gì? 🐱
              </h2>
              <button 
                onClick={onClose}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>
            </div>

            {/* Scrollable Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Illustration */}
              <div style={{ width: '100%', borderRadius: 20, overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
                <img src="/gato_edu_illustration.png" alt="Gato Edu" style={{ width: '100%', display: 'block' }} />
              </div>

              {/* Section 1: Intro */}
              <div>
                <div style={{ fontSize: 15, color: '#fff', fontWeight: 700, marginBottom: 8 }}>💎 Tiết kiệm thông minh - Nhận quà cực đỉnh</div>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
                  Nuôi Gato là chương trình khách hàng thân thiết mới của Cake. Khi bạn mở sổ Tiết kiệm, Gato sẽ bắt đầu tích lũy điểm thưởng để giúp bạn mở các mốc quà giá trị.
                </p>
              </div>

              {/* Section 2: Points Types */}
              <div style={{ background: 'rgba(155,150,200,0.06)', borderRadius: 20, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-primary-pink)' }}>✨ 3 Loại điểm bạn cần biết:</div>
                
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 24, fontSize: 16 }}>🏃</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Điểm Đang tích (Running)</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Tự động cộng vào ví Gato mỗi ngày dựa trên số dư thực tế của sổ.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 24, fontSize: 16 }}>🔒</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-green)' }}>Điểm Đã chốt (Locked)</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Sau mỗi chu kỳ 30 ngày giữ sổ ổn định, điểm Running sẽ được "chốt" thành điểm Locked vĩnh viễn.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 24, fontSize: 16 }}>🎁</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-blue)' }}>Điểm Thưởng (Bonus)</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                      Thưởng thêm cực lớn để tăng tốc hành trình nhận quà:
                      <br />• <strong style={{ color: '#FFE082' }}>Thưởng thêm 10%</strong> tổng điểm tích lũy của tháng đối với việc giữ tiền đủ 30 ngày liên tục không rút.
                      <br />• <strong style={{ color: '#FFE082' }}>Thưởng thêm 20%</strong> tổng điểm tích lũy ở tháng đáo hạn nếu giữ tiền thành công đến hết kỳ hạn.
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Rewards */}
              <div>
                <div style={{ fontSize: 15, color: '#fff', fontWeight: 700, marginBottom: 8 }}>🎁 Điều kiện mở quà</div>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
                  Quà sẽ được tự động mở khi tổng <span style={{ color: 'var(--color-text-green)', fontWeight: 700 }}>Điểm Đã chốt</span> của bạn đạt đến các mốc (Milestones). Càng nhiều điểm chốt, quà càng to!
                </p>
              </div>

              <div style={{ borderLeft: '3px solid #FF6B6B', paddingLeft: 16 }}>
                <div style={{ fontSize: 15, color: '#FF6B6B', fontWeight: 700, marginBottom: 8 }}>⚠️ Lưu ý khi rút tiền sớm</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div>
                    • <strong style={{ color: '#fff' }}>Rút một phần (tối đa 90% số dư)</strong>: Bạn <strong style={{ color: '#81C784' }}>KHÔNG bị trừ điểm</strong> đã tích lũy. Số dư còn lại vẫn tiếp tục sinh điểm bình thường (chỉ làm chậm tiến độ đạt mốc do số dư giảm).
                  </div>
                  <div>
                    • <strong style={{ color: '#fff' }}>Tất toán sổ trước hạn (rút sạch tiền)</strong>: Bạn sẽ <strong style={{ color: '#FF8A80' }}>bị trừ toàn bộ Điểm Đang tích</strong> và <strong style={{ color: '#FF8A80' }}>mất toàn bộ Điểm Thưởng</strong> của chu kỳ đó.
                  </div>
                  <div>
                    • <strong style={{ color: '#FFD54F' }}>Điểm Đã chốt (Locked)</strong>: Đây là tài sản vĩnh viễn của bạn, <strong style={{ color: '#81C784' }}>không bao giờ bị trừ</strong> dưới mọi hình thức!
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px 24px', borderTop: '1px solid var(--color-bg-card-border)' }}>
              <button 
                onClick={onClose}
                style={{
                  width: '100%', padding: '14px', borderRadius: 'var(--radius-btn)',
                  background: 'var(--gradient-btn-primary)', border: 'none', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer'
                }}
              >Tôi đã hiểu!</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    rootEl
  );
}
