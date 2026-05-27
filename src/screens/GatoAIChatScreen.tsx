import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { AI_SCENARIOS } from '../services/gatoAIService';
import { BankConsentModal } from '../components/BankConsentModal';

interface Props {
  onBack: () => void;
}

export function GatoAIChatScreen({ onBack }: Props) {
  const user = useAppStore((s) => s.user);
  const sendChatMessage = useAppStore((s) => s.sendChatMessage);
  const clearChatHistory = useAppStore((s) => s.clearChatHistory);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scenario = AI_SCENARIOS[user?.currentScenarioId || 'impulsive_spender'] || AI_SCENARIOS.impulsive_spender;
  const { chatHistory = [], externalBankLinked = false } = user || {};

  // Cuộn tin nhắn xuống dưới cùng
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  async function handleSend(text: string) {
    if (!text.trim() || isTyping) return;
    setInputText('');
    setIsTyping(true);

    // Gửi chat lên store (được xử lý bởi Gemini API / Fallback)
    await sendChatMessage(text);
    setIsTyping(false);
  }

  return (
    <div
      style={{
        background: '#0D0B1F',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 105,
        color: '#fff',
      }}
    >
      {/* ── 1. Header Bar ────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-bg-card-border)',
          background: 'rgba(26, 22, 53, 0.5)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <button
          id="btn-chat-back"
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary-pink)',
            fontSize: 24,
            cursor: 'pointer',
            padding: 0,
            marginRight: 12,
          }}
        >
          ←
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
            <img 
              src="/gato-chat-avatar.png" 
              alt="Gato AI" 
              style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid var(--color-primary-pink)', objectFit: 'cover' }} 
            />
            Gato AI
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                background: 'rgba(78,205,164,0.15)',
                color: 'var(--color-text-green)',
                padding: '2px 6px',
                borderRadius: 8,
              }}
            >
              TRỢ LÝ TÀI CHÍNH
            </span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 2 }}>
            Kịch bản: {scenario.name.split(' (')[0]}
          </div>
        </div>

        {/* Nút dọn dẹp chat để reset demo */}
        <button
          id="btn-chat-clear"
          onClick={() => {
            if (window.confirm('Dọn dẹp lịch sử trò chuyện để bắt đầu lại?')) {
              clearChatHistory();
            }
          }}
          style={{
            background: 'none',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 12,
            padding: '4px 10px',
            fontSize: 10,
            color: 'var(--color-text-secondary)',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Xóa chat
        </button>
      </div>

      {/* ── 2. Message History Area ──────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 20px 130px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {chatHistory.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: isBot ? 'flex-start' : 'flex-end',
                width: '100%',
              }}
            >
              <div
                style={{
                  maxWidth: '85%',
                  background: isBot ? 'var(--color-bg-card)' : 'linear-gradient(135deg, #FF2D8C, #C21A7A)',
                  border: isBot ? '1px solid var(--color-bg-card-border)' : 'none',
                  borderRadius: isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                  padding: '12px 16px',
                  boxShadow: isBot ? 'none' : '0 4px 15px rgba(255,45,140,0.25)',
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  color: '#fff',
                  whiteSpace: 'pre-line',
                }}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}
            >
              <div
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-bg-card-border)',
                  borderRadius: '16px 16px 16px 4px',
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  Gato đang phân tích...
                </div>
                <div style={{ display: 'flex', gap: 3, marginLeft: 4 }}>
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF2D8C' }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* ── 3. Bottom Control (Quick Replies & Text Input) ───────── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(180deg, transparent 0%, #0D0B1F 40%)',
          padding: '12px 16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          zIndex: 5,
        }}
      >
        {/* Quick Replies list */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            paddingBottom: 4,
          }}
        >


          {scenario.quickReplies.map((qrText) => (
            <button
              key={qrText}
              onClick={() => handleSend(qrText)}
              disabled={isTyping}
              style={{
                flexShrink: 0,
                padding: '6px 14px',
                borderRadius: 20,
                background: 'rgba(155, 150, 200, 0.08)',
                border: '1px solid var(--color-bg-card-border)',
                color: 'var(--color-text-secondary)',
                fontSize: 12,
                fontWeight: 700,
                cursor: isTyping ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isTyping) e.currentTarget.style.borderColor = 'rgba(255,45,140,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-bg-card-border)';
              }}
            >
              {qrText}
            </button>
          ))}
        </div>

        {/* Text Input area */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-bg-card-border)',
            borderRadius: 24,
            padding: '6px 6px 6px 16px',
            alignItems: 'center',
          }}
        >
          <input
            id="input-chat-text"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend(inputText);
            }}
            placeholder="Hỏi Gato AI bất cứ điều gì..."
            disabled={isTyping}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: 13,
            }}
          />
          <button
            id="btn-chat-send"
            onClick={() => handleSend(inputText)}
            disabled={!inputText.trim() || isTyping}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: inputText.trim() && !isTyping ? 'var(--gradient-btn-primary)' : 'var(--color-btn-disabled)',
              border: 'none',
              color: '#fff',
              fontSize: 16,
              cursor: inputText.trim() && !isTyping ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: inputText.trim() && !isTyping ? '0 2px 10px rgba(255,45,140,0.3)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            ➔
          </button>
        </div>
      </div>

      {/* Consent modal */}
      <BankConsentModal isOpen={consentOpen} onClose={() => setConsentOpen(false)} />
    </div>
  );
}
