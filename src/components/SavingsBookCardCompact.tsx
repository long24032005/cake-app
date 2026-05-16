/**
 * SavingsBookCardCompact — compact version for HomeScreen horizontal scroll
 * Spec C2 + E Screen 1 Section 6
 */
import type { SavingsBook } from '../types';
import { calculateDailyPoints } from '../engine/pointEngine';

const STATUS_COLOR: Record<string, string> = {
  active:  '#4ECDA4',
  matured: '#9B96C8',
  violated:'#FF6B6B',
  closed:  '#9B96C8',
};

const BOOK_TYPE_LABEL: Record<string, string> = {
  standard:   'Tiêu chuẩn',
  accumulate: 'Tích lũy',
};

function daysLeft(maturityDate: string): number {
  const today = new Date();
  const maturity = new Date(maturityDate);
  return Math.max(0, Math.ceil((maturity.getTime() - today.getTime()) / 86_400_000));
}

function formatVND(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}tr`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}k`;
  return amount.toString();
}

export function SavingsBookCardCompact({ book }: { book: SavingsBook }) {
  const dailyPts = calculateDailyPoints(book);
  const statusColor = STATUS_COLOR[book.status] ?? '#9B96C8';
  const left = daysLeft(book.maturityDate);

  return (
    <div style={{
      minWidth: 160, maxWidth: 176,
      background: 'var(--color-bg-card)',
      border: `1px solid var(--color-bg-card-border)`,
      borderRadius: 'var(--radius-card)',
      padding: '12px 14px',
      display: 'flex', flexDirection: 'column', gap: 8,
      flexShrink: 0,
    }}>
      {/* Header: type badge + status dot */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
          color: 'var(--color-text-secondary)',
          background: 'rgba(155,150,200,0.12)',
          padding: '2px 7px', borderRadius: 'var(--radius-chip)',
          textTransform: 'uppercase',
        }}>{BOOK_TYPE_LABEL[book.bookType]}</span>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: statusColor, display: 'inline-block' }} />
      </div>

      {/* Amount */}
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
          {formatVND(book.currentBalance)}
        </div>
        <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 1 }}>
          {book.interestRate}%/năm · {book.termMonths}T
        </div>
      </div>

      {/* Time left */}
      <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
        {book.status === 'active' ? `Còn ${left} ngày` : book.status.toUpperCase()}
      </div>

      {/* Contribution chip — spec C2 */}
      {book.status === 'active' && (
        <div style={{
          background: 'rgba(78,205,164,0.12)',
          border: '1px solid rgba(78,205,164,0.3)',
          borderRadius: 'var(--radius-chip)',
          padding: '3px 8px',
          fontSize: 11, fontWeight: 700,
          color: 'var(--color-text-green)',
          alignSelf: 'flex-start',
        }}>
          +{dailyPts} điểm/ngày
        </div>
      )}
    </div>
  );
}
