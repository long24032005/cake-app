import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { AI_SCENARIOS } from '../services/gatoAIService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function BankConsentModal({ isOpen, onClose }: Props) {
  const user = useAppStore((s) => s.user);
  const linkExternalBank = useAppStore((s) => s.linkExternalBank);
  const [loading, setLoading] = useState(false);

  const scenario = AI_SCENARIOS[user.currentScenarioId] || AI_SCENARIOS.impulsive_spender;
  const bankName = scenario.externalBankName;

  async function handleAgree() {
    setLoading(true);
    // Giả lập kết nối API ngân hàng ngoài mất 1.5 giây
    await new Promise((resolve) => setTimeout(resolve, 1500));
    linkExternalBank();
    setLoading(false);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 430,
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Overlay backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={loading ? undefined : onClose}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(13, 11, 31, 0.9)',
            backdropFilter: 'blur(8px)',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        />

        {/* Modal content */}
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          style={{
            position: 'relative',
            width: '90%',
            background: 'var(--color-bg-card)',
            border: '1.5px solid var(--color-bg-card-border)',
            borderRadius: 24,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
            zIndex: 1101,
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24, paddingBottom: 24, gap: 16, textAlign: 'center' }}>
              {/* Spinner */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: '3px solid rgba(91,200,245,0.2)',
                  borderTopColor: '#5BC8F5',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Đang kết nối Open Banking API...</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', maxWidth: 260 }}>
                Thiết lập kênh kết nối an toàn với máy chủ của {bankName} để đồng bộ lịch sử giao dịch.
              </div>
            </div>
          ) : (
            <>
              {/* Title */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔗</div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: 0 }}>
                  Liên kết tài khoản {bankName}
                </h3>
              </div>

              {/* Consent Terms */}
              <div
                style={{
                  background: 'rgba(155, 150, 200, 0.05)',
                  border: '1px solid var(--color-bg-card-border)',
                  borderRadius: 16,
                  padding: 16,
                  fontSize: 12,
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                  maxHeight: 180,
                  overflowY: 'auto',
                }}
              >
                Bằng việc nhấn <strong>"Đồng ý cấp quyền"</strong>, bạn đồng ý cho phép <strong>Gato AI (ứng dụng Cake)</strong> thực hiện:
                <br />
                1. Đọc và thu thập thông tin số dư tài khoản thanh toán và lịch sử giao dịch gần nhất của bạn tại ngân hàng liên kết <strong>{bankName}</strong>.
                <br />
                2. Phân tích các thói quen chi tiêu, phân loại giao dịch (Ăn uống, Mua sắm, Di chuyển...) để sinh báo cáo tài chính cá nhân hóa.
                <br />
                3. Đưa ra các lời khuyên, cảnh báo và lập kế hoạch tài chính tối ưu cho bạn.
                <br />
                <br />
                <em>Cam kết bảo mật:</em> Thông tin của bạn được truyền tải qua giao thức mã hóa an toàn Open Banking API và bảo mật tuyệt đối theo tiêu chuẩn ngân hàng số. Chúng tôi KHÔNG lưu trữ mật khẩu đăng nhập tài khoản liên kết của bạn.
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  id="btn-consent-agree"
                  onClick={handleAgree}
                  style={{
                    flex: 1,
                    padding: 13,
                    borderRadius: 'var(--radius-btn)',
                    background: 'linear-gradient(135deg, #5BC8F5, #3A9FD6)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(91,200,245,0.3)',
                  }}
                >
                  Đồng ý cấp quyền
                </button>
                <button
                  id="btn-consent-cancel"
                  onClick={onClose}
                  style={{
                    padding: '13px 20px',
                    borderRadius: 'var(--radius-btn)',
                    background: 'transparent',
                    border: '1px solid var(--color-bg-card-border)',
                    color: 'var(--color-text-secondary)',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  Từ chối
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
