import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

interface Props {
  onClick: () => void;
}

export function GatoFloatingBubble({ onClick }: Props) {
  const user = useAppStore((s) => s.user);
  const [showTooltip, setShowTooltip] = useState(false);

  const { currentScenarioId, externalBankLinked } = user;

  // Lấy tin nhắn tooltip dựa trên kịch bản và trạng thái liên kết
  function getTooltipText() {
    if (currentScenarioId === 'impulsive_spender') {
      return externalBankLinked
        ? 'Insight mới: Bạn tiêu 45% lương cho ăn uống rồi kìa! ⚠️'
        : 'Trà sữa đang ngốn 560k của bạn kìa! ☕ Bấm để xem insight.';
    }
    if (currentScenarioId === 'disciplined_saver') {
      return externalBankLinked
        ? 'Lãi suất 7.2%/năm đang chờ bạn nhấp vào nè! 📈'
        : 'Tuyệt vời! Bạn đang tiết kiệm rất kỷ luật. Tiếp tục phát huy! 🏆';
    }
    if (currentScenarioId === 'variable_income') {
      return externalBankLinked
        ? 'Dòng tiền lưu động rất tốt. Tối ưu ngay kỳ hạn 1 tháng nhé! 💼'
        : 'Nhận 20.5M doanh thu kìa! Gửi kỳ hạn ngắn để xoay vốn nha. 💰';
    }
    return 'Gato AI đã sẵn sàng phân tích tài chính giúp bạn! 🤖';
  }

  // Tự động bật tooltip sau 2.5s và tự động ẩn sau 8s
  useEffect(() => {
    const timerShow = setTimeout(() => setShowTooltip(true), 2500);
    const timerHide = setTimeout(() => setShowTooltip(false), 10000);

    return () => {
      clearTimeout(timerShow);
      clearTimeout(timerHide);
    };
  }, [currentScenarioId, externalBankLinked]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 92,
        right: 20,
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        pointerEvents: 'none', // cho phép click xuyên qua khu vực trống xung quanh
      }}
    >
      {/* ── Speech bubble tooltip ─────────────────────────────── */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.8 }}
            onClick={onClick}
            style={{
              background: '#1A1635',
              border: '1.5px solid var(--color-primary-pink)',
              borderRadius: 16,
              padding: '10px 14px',
              fontSize: 11.5,
              fontWeight: 700,
              color: '#fff',
              maxWidth: 200,
              boxShadow: '0 4px 20px rgba(255,45,140,0.3)',
              position: 'relative',
              cursor: 'pointer',
              pointerEvents: 'auto', // bật click cho tooltip
              lineHeight: 1.4,
            }}
          >
            {getTooltipText()}
            {/* Tooltip arrow pointing right */}
            <div
              style={{
                position: 'absolute',
                right: -6,
                top: '50%',
                transform: 'translateY(-50%) rotate(45deg)',
                width: 10,
                height: 10,
                background: '#1A1635',
                borderTop: '1.5px solid var(--color-primary-pink)',
                borderRight: '1.5px solid var(--color-primary-pink)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Head Gato Chat Button ──────────────────────────────── */}
      <motion.button
        id="btn-gato-ai-bubble"
        onClick={onClick}
        whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
        whileTap={{ scale: 0.95 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#1A1635',
          border: '2px solid #fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(255,45,140,0.45)',
          pointerEvents: 'auto', // bật click cho button
          position: 'relative',
          padding: 0,
        }}
        title="Trò chuyện với Gato AI"
      >
        {/* Custom Gato AI Avatar image */}
        <img 
          src="/gato-chat-avatar.png" 
          alt="Gato AI" 
          style={{ 
            width: '100%', 
            height: '100%', 
            borderRadius: '50%', 
            objectFit: 'cover' 
          }} 
        />

        {/* AI glowing dot badge */}
        <div
          style={{
            position: 'absolute',
            top: 2,
            right: 2,
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: externalBankLinked ? '#4ECDA4' : '#5BC8F5',
            border: '2px solid #fff',
            boxShadow: externalBankLinked ? '0 0 8px #4ECDA4' : '0 0 8px #5BC8F5',
          }}
        />
      </motion.button>
    </div>
  );
}
