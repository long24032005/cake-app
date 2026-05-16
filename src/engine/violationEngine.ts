/**
 * CAKE PET SAVINGS — Violation Engine
 * Source: spec section B3 — ENGINE XỬ LÝ VI PHẠM (Cơ chế 8)
 */

import { VIOLATION_THRESHOLDS } from '../config';
import type { User } from '../types';
import { daysBetween, toISODate } from './pointEngine';

// ─────────────────────────────────────────────────────────────
// B3 — Hàm 1: processViolation
// ─────────────────────────────────────────────────────────────

/**
 * Xử lý vi phạm khi user rút trước hạn hoặc dừng kế hoạch.
 *
 * Spec algorithm:
 *   r = tỷ lệ hoàn thành cam kết (0..1)
 *   For standard: r = daysElapsed / totalDays
 *   For accumulate: r = completedPeriods / totalPeriods
 *
 *   commitmentBonusPoints = 0 (mất 100%)
 *   runningPoints bị trừ theo bảng violation thresholds
 *   lockedPoints KHÔNG BỊ TRỪ
 *   status = "violated"
 *
 * @param user          - Current user state
 * @param bookId        - ID của sổ vi phạm
 * @param violationType - "early_withdrawal" | "plan_stopped"
 * @param simDate       - Ngày mô phỏng
 */
export function processViolation(
  user: User,
  bookId: string,
  violationType: 'early_withdrawal' | 'plan_stopped',
  simDate: string | null = null,
): User {
  void violationType; // ghi nhận để log / hiển thị sau

  const today = simDate ?? toISODate(new Date());
  const next: User = JSON.parse(JSON.stringify(user));

  const book = next.savingsBooks.find((b) => b.bookId === bookId);
  if (!book) {
    console.warn(`[processViolation] bookId "${bookId}" không tìm thấy.`);
    return next;
  }
  if (book.status !== 'active') {
    console.warn(`[processViolation] Sổ "${bookId}" không ở trạng thái active.`);
    return next;
  }

  // Tính r
  let r: number;
  if (book.bookType === 'standard') {
    const daysElapsed = daysBetween(book.startDate, today);
    const totalDays = book.termMonths * 30;
    r = Math.min(daysElapsed / totalDays, 1); // clamp 0..1
  } else {
    // accumulate
    if (!book.accumulate) {
      console.error(`[processViolation] Sổ accumulate "${bookId}" thiếu field accumulate.`);
      return next;
    }
    r = book.accumulate.completedPeriods / book.accumulate.totalPeriods;
  }

  book.pointTracking.violationRatio = r;

  // Mất 100% commitmentBonusPoints
  book.pointTracking.commitmentBonusPoints = 0;

  // Trừ runningPoints theo 4 ngưỡng r (spec B3)
  // Sort descending by minR: first match where r >= minR wins
  // Fix edge case: r=1.0 must hit the 0.9 tier (not fall through to fallback)
  const sortedThresholds = [...VIOLATION_THRESHOLDS].sort((a, b) => b.minR - a.minR);
  const threshold = sortedThresholds.find(t => r >= t.minR)
    ?? sortedThresholds[sortedThresholds.length - 1]; // mất 100% fallback

  const keptRatio = threshold.runningPointsKept;
  book.pointTracking.runningPoints = Math.floor(
    book.pointTracking.runningPoints * keptRatio,
  );

  // lockedPoints KHÔNG bị trừ (Cơ chế 8)
  book.status = 'violated';

  // Recalculate user journey
  recalculateUserJourneyPointsOnUser(next);

  console.log(
    `[processViolation] Sổ ${bookId} | r=${r.toFixed(2)} | kept=${(keptRatio * 100).toFixed(0)}% running | lockedPoints UNCHANGED`,
  );

  return next;
}

// ─────────────────────────────────────────────────────────────
// B3 — Hàm 2: processPartialWithdrawal (Rút 1 phần)
// ─────────────────────────────────────────────────────────────

export function processPartialWithdrawal(
  user: User,
  bookId: string,
  withdrawAmount: number,
  simDate: string | null = null,
): User {
  const next: User = JSON.parse(JSON.stringify(user));
  const book = next.savingsBooks.find((b) => b.bookId === bookId);
  
  if (!book || book.status !== 'active' || book.bookType !== 'standard') return next;
  if (withdrawAmount <= 0 || withdrawAmount > book.currentBalance * 0.9) return next;

  // Giảm số dư
  book.currentBalance -= withdrawAmount;

  // Tính tỷ lệ rút
  const withdrawRatio = withdrawAmount / (book.currentBalance + withdrawAmount);

  const today = simDate ?? toISODate(new Date());
  const daysElapsed = daysBetween(book.startDate, today);
  const totalDays = book.termMonths * 30;
  const r = Math.min(daysElapsed / totalDays, 1);

  const sortedThresholds = [...VIOLATION_THRESHOLDS].sort((a, b) => b.minR - a.minR);
  const threshold = sortedThresholds.find(t => r >= t.minR) ?? sortedThresholds[sortedThresholds.length - 1];

  // running points của phần rút
  const runningPointsForWithdrawn = book.pointTracking.runningPoints * withdrawRatio;
  const runningPointsKept = runningPointsForWithdrawn * threshold.runningPointsKept;
  const runningPointsLost = runningPointsForWithdrawn - runningPointsKept;

  book.pointTracking.runningPoints = Math.max(0, Math.floor(book.pointTracking.runningPoints - runningPointsLost));
  
  // bonus points: mất tỉ lệ tương ứng
  book.pointTracking.commitmentBonusPoints = Math.floor(book.pointTracking.commitmentBonusPoints * (1 - withdrawRatio));

  recalculateUserJourneyPointsOnUser(next);

  console.log(`[processPartialWithdrawal] Sổ ${bookId} | Rút ${withdrawAmount} | Trừ ${runningPointsLost.toFixed(0)} running points`);

  return next;
}

// ─────────────────────────────────────────────────────────────
// B3 — Hàm 3: recalculateUserJourneyPoints
// ─────────────────────────────────────────────────────────────

/**
 * Tính lại tổng điểm user từ tất cả sổ.
 * Spec: progressPoints = SUM(lockedPoints for ALL books)
 *       runningPoints  = SUM(runningPoints for active/violated books)
 */
export function recalculateUserJourneyPoints(user: User): User {
  const next: User = JSON.parse(JSON.stringify(user));
  recalculateUserJourneyPointsOnUser(next);
  return next;
}

/** Internal helper — mutates in-place (dùng khi đã clone) */
function recalculateUserJourneyPointsOnUser(user: User): void {
  user.journey.progressPoints = user.savingsBooks.reduce(
    (sum, b) => sum + b.pointTracking.lockedPoints,
    0,
  );
  user.journey.runningPoints = user.savingsBooks
    .filter((b) => b.status === 'active' || b.status === 'violated')
    .reduce((sum, b) => sum + b.pointTracking.runningPoints, 0);
}
