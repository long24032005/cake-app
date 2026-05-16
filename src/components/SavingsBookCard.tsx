/**
 * SavingsBookCard — Full size (Screen 2 "Đang hoạt động")
 * Spec E/Screen 2 Section 4
 */
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { SavingsBook } from '../types';
import { calculateDailyPoints } from '../engine/pointEngine';
import { useAppStore } from '../store/useAppStore';

const BOOK_TYPE_LABEL: Record<string, string> = {
  standard: 'Tiêu chuẩn', accumulate: 'Tích lũy',
};
const STATUS_COLOR: Record<string, string> = {
  active: '#4ECDA4', matured: '#9B96C8', violated: '#FF6B6B', closed: '#9B96C8',
};

function fmtVND(n: number) {
  return n.toLocaleString('vi-VN') + 'đ';
}
function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}
function termProgress(book: SavingsBook): number {
  const start = new Date(book.startDate).getTime();
  const end   = new Date(book.maturityDate).getTime();
  const now   = Date.now();
  return Math.min(Math.max((now - start) / (end - start), 0), 1);
}
function daysLeft(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

interface Props { book: SavingsBook; }

export function SavingsBookCard({ book }: Props) {
  const violateBook = useAppStore(s => s.violateBook);
  const dailyPts = calculateDailyPoints(book);
  const progress  = termProgress(book);
  const statusClr = STATUS_COLOR[book.status] ?? '#9B96C8';
  const left      = daysLeft(book.maturityDate);

  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [showPartialWithdraw, setShowPartialWithdraw] = useState(false);
  const [partialAmount, setPartialAmount] = useState('');
  const [partialError, setPartialError] = useState('');

  const r = book.bookType === 'standard'
    ? Math.min(Math.ceil((Date.now() - new Date(book.startDate).getTime()) / 86_400_000) / (book.termMonths * 30), 1)
    : (book.accumulate?.completedPeriods ?? 0) / (book.accumulate?.totalPeriods ?? 1);
  const penalty = r >= 0.9 ? 25 : r >= 0.8 ? 50 : r >= 0.7 ? 75 : 100;
  const maxAmount = Math.floor(book.currentBalance * 0.9);

  function handleConfirmEarlyWithdraw() {
    setShowWithdrawConfirm(false);
    violateBook(book.bookId, 'early_withdrawal');
  }

  function handleConfirmPartialWithdraw() {
    const amount = parseInt(partialAmount.replace(/\D/g, ''), 10);
    if (isNaN(amount) || amount <= 0) {
      setPartialError('Số tiền không hợp lệ!');
      return;
    }
    if (amount > maxAmount) {
      setPartialError(`Không thể rút quá 90% giá trị sổ (${fmtVND(maxAmount)})!`);
      return;
    }
    setPartialError('');
    setPartialAmount('');
    setShowPartialWithdraw(false);
    useAppStore.getState().partialWithdraw(book.bookId, amount);
  }

  const rootEl = document.getElementById('root');

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--color-bg-card)',
          border: `1px solid var(--color-bg-card-border)`,
          borderRadius: 'var(--radius-card)',
          padding: '16px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
              color: 'var(--color-text-secondary)',
              background: 'rgba(155,150,200,0.12)',
              padding: '3px 8px', borderRadius: 'var(--radius-chip)',
              textTransform: 'uppercase',
            }}>{BOOK_TYPE_LABEL[book.bookType]}</span>
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              {book.termMonths}T
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontSize: 10, color: statusClr, fontWeight: 600, textTransform: 'uppercase',
            }}>{book.status}</span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusClr, display: 'inline-block' }} />
          </div>
        </div>

        {/* Amount + Rate */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>
              {fmtVND(book.currentBalance)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 3 }}>
              Gốc: {fmtVND(book.principalAmount)}
            </div>
          </div>
          <div style={{
            background: 'rgba(78,205,164,0.12)', border: '1px solid rgba(78,205,164,0.25)',
            borderRadius: 'var(--radius-chip)', padding: '4px 10px',
            fontSize: 13, fontWeight: 700, color: 'var(--color-text-green)',
          }}>
            {book.interestRate}%/năm
          </div>
        </div>

        {/* Term progress bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--color-text-secondary)', marginBottom: 5 }}>
            <span>Tiến độ kỳ hạn</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--color-bg-card-border)', overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #4ECDA4, #5BC8F5)' }}
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Bottom row: points chip + maturity + action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Contribution chip */}
            {book.status === 'active' && (
              <div style={{
                background: 'rgba(78,205,164,0.12)', border: '1px solid rgba(78,205,164,0.3)',
                borderRadius: 'var(--radius-chip)', padding: '3px 8px',
                fontSize: 11, fontWeight: 700, color: 'var(--color-text-green)',
                alignSelf: 'flex-start',
              }}>
                Đóng góp: +{dailyPts} điểm/ngày
              </div>
            )}
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              Đáo hạn: <span style={{ color: 'var(--color-text-blue)' }}>{fmtDate(book.maturityDate)}</span>
              {book.status === 'active' && <span style={{ color: 'var(--color-text-secondary)' }}> · còn {left} ngày</span>}
            </div>
          </div>

          {book.status === 'active' && (
            <div style={{ display: 'flex', gap: 6 }}>
              {book.bookType === 'standard' && (
                <button
                  id={`btn-partial-withdraw-${book.bookId}`}
                  onClick={() => {
                    setPartialAmount('');
                    setPartialError('');
                    setShowPartialWithdraw(true);
                  }}
                  style={{
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 'var(--radius-chip)', padding: '5px 10px',
                    color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  }}
                >Rút 1 phần</button>
              )}
              <button
                id={`btn-withdraw-${book.bookId}`}
                onClick={() => setShowWithdrawConfirm(true)}
                style={{
                  background: 'transparent', border: '1px solid rgba(255,107,107,0.5)',
                  borderRadius: 'var(--radius-chip)', padding: '5px 10px',
                  color: '#FF6B6B', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}
              >Tất toán sớm</button>
            </div>
          )}
        </div>

        {/* Points summary */}
        <div style={{
          background: 'rgba(255,45,140,0.06)', border: '1px solid rgba(255,45,140,0.15)',
          borderRadius: 10, padding: '8px 12px',
          display: 'flex', gap: 16,
        }}>
          {[
            { label: 'Đã chốt', val: book.pointTracking.lockedPoints, clr: 'var(--color-primary-pink)' },
            { label: 'Đang tích', val: book.pointTracking.runningPoints, clr: 'rgba(255,128,192,0.8)' },
            { label: 'Thưởng', val: book.pointTracking.commitmentBonusPoints, clr: 'var(--color-text-green)' },
          ].map(({ label, val, clr }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: clr }}>{val.toLocaleString('vi-VN')}</div>
              <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* MODALS rendered via portal to #root to avoid transform trapping */}
      {rootEl && createPortal(
        <AnimatePresence>
          {showWithdrawConfirm && (
            <div style={{
              position: 'fixed', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)',
              width: '100%', maxWidth: 430, zIndex: 900, pointerEvents: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowWithdrawConfirm(false)}
                style={{ position: 'absolute', inset: 0, background: 'rgba(13,11,31,0.85)', backdropFilter: 'blur(6px)', pointerEvents: 'auto' }}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                style={{
                  position: 'relative', width: 'min(340px, calc(100% - 32px))',
                  background: 'var(--color-bg-card)', border: '1.5px solid rgba(255,107,107,0.5)',
                  borderRadius: 24, padding: '24px', display: 'flex', flexDirection: 'column', gap: 16,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)', pointerEvents: 'auto'
                }}
              >
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0, textAlign: 'center' }}>
                  Tất toán sớm sổ {book.bookId}?
                </h3>
                <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8 }}><span style={{ color: '#FF6B6B' }}>•</span> <span>Mất 100% điểm thưởng cam kết</span></div>
                  <div style={{ display: 'flex', gap: 8 }}><span style={{ color: '#FF6B6B' }}>•</span> <span>Mất {penalty}% điểm đang tích (running)</span></div>
                  <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--color-text-green)' }}>•</span> <span>Điểm đã chốt (locked) KHÔNG thay đổi</span></div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button onClick={() => setShowWithdrawConfirm(false)} style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-btn)', background: 'transparent', border: '1px solid var(--color-bg-card-border)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
                  <button onClick={handleConfirmEarlyWithdraw} style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-btn)', background: '#FF6B6B', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Xác nhận</button>
                </div>
              </motion.div>
            </div>
          )}

          {showPartialWithdraw && (
            <div style={{
              position: 'fixed', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)',
              width: '100%', maxWidth: 430, zIndex: 900, pointerEvents: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowPartialWithdraw(false)}
                style={{ position: 'absolute', inset: 0, background: 'rgba(13,11,31,0.85)', backdropFilter: 'blur(6px)', pointerEvents: 'auto' }}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                style={{
                  position: 'relative', width: 'min(340px, calc(100% - 32px))',
                  background: 'var(--color-bg-card)', border: '1.5px solid var(--color-bg-card-border)',
                  borderRadius: 24, padding: '24px', display: 'flex', flexDirection: 'column', gap: 16,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)', pointerEvents: 'auto'
                }}
              >
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0, textAlign: 'center' }}>
                  Rút 1 phần tiền
                </h3>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0, textAlign: 'center' }}>
                  Tối đa: <span style={{ color: '#fff', fontWeight: 700 }}>{fmtVND(maxAmount)}</span> (90% sổ)
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Nhập số tiền..."
                    value={partialAmount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPartialAmount(val ? parseInt(val, 10).toLocaleString('vi-VN') : '');
                      setPartialError('');
                    }}
                    style={{
                      width: '100%', padding: '14px 16px', borderRadius: 12,
                      background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-bg-card-border)',
                      color: '#fff', fontSize: 16, fontWeight: 600, outline: 'none'
                    }}
                  />
                  {partialError && <div style={{ color: '#FF6B6B', fontSize: 12 }}>{partialError}</div>}
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                    <span style={{ color: '#FF6B6B' }}>Lưu ý:</span> Bạn sẽ bị trừ điểm đang tích (running points) tương ứng với tỷ lệ rút.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button onClick={() => setShowPartialWithdraw(false)} style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-btn)', background: 'transparent', border: '1px solid var(--color-bg-card-border)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
                  <button onClick={handleConfirmPartialWithdraw} style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-btn)', background: 'var(--gradient-btn-primary)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Xác nhận</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      , rootEl)}
    </>
  );
}
