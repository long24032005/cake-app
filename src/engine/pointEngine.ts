/**
 * CAKE PET SAVINGS — Point Engine
 * Source: spec section B2 — ENGINE TÍNH ĐIỂM
 *
 * Các hàm trong file này là pure functions — chúng nhận state, trả về state mới.
 * KHÔNG mutate trực tiếp — Zustand store sẽ gọi produce() để apply.
 *
 * Thứ tự hàm khớp với spec B2:
 *   1. calculateDailyPoints
 *   2. runDailyPointJob
 *   3. runLockCycleJob
 *   4. runMaturityJob (spec B2 — phần cuối)
 */

import {
  LOCK_CYCLE_DAYS,
  CYCLE_COMPLETION_BONUS_RATE,
  MATURITY_COMPLETION_BONUS_RATE,
} from '../config';
import type { SavingsBook, User } from '../types';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/** Trả về chuỗi YYYY-MM-DD từ Date */
function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

/** Cộng thêm N ngày vào một chuỗi ISO date */
function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setUTCDate(d.getUTCDate() + days);
  return toISODate(d);
}

/** Tính số ngày giữa hai ISO date string */
export function daysBetween(startISO: string, endISO: string): number {
  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  return Math.floor((end - start) / (1000 * 60 * 60 * 24));
}

// ─────────────────────────────────────────────────────────────
// B2 — Hàm 1: calculateDailyPoints
// ─────────────────────────────────────────────────────────────

/**
 * Tính điểm hàng ngày của một sổ.
 * Spec: validBalance = currentBalance nếu status === "active", else 0
 *       dailyPoints = Math.floor(validBalance / 10_000)
 */
export function calculateDailyPoints(book: SavingsBook): number {
  if (book.status !== 'active') return 0;
  return Math.floor(book.currentBalance / 10_000);
}

// ─────────────────────────────────────────────────────────────
// B2 — Hàm 2: runDailyPointJob
// ─────────────────────────────────────────────────────────────

/**
 * Chạy mỗi ngày (trong MVP: trigger thủ công qua Sim Mode).
 *
 * Spec algorithm:
 *   Với mỗi sổ có status === "active":
 *     dailyPts = calculateDailyPoints(book)
 *     book.pointTracking.runningPoints += dailyPts
 *     book.pointTracking.balanceHistory.push({ date: today, balance: currentBalance })
 *
 *   Sau khi tính xong tất cả sổ, aggregate lên user:
 *     user.journey.runningPoints = SUM(runningPoints for all active books)
 *     user.journey.progressPoints = SUM(lockedPoints for ALL books) ← đã chốt
 *
 * @param user    - Current user state (sẽ được clone bởi Zustand produce)
 * @param simDate - Ngày mô phỏng (ISO date string). Nếu null dùng ngày thực.
 * @returns       Bản sao User mới với điểm đã cập nhật
 */
export function runDailyPointJob(user: User, simDate: string | null = null): User {
  const today = simDate ?? toISODate(new Date());

  // Deep clone để không mutate argument
  const next: User = JSON.parse(JSON.stringify(user));

  // Bước 1: Tính điểm từng sổ active
  for (const book of next.savingsBooks) {
    if (book.status !== 'active') continue;

    const dailyPts = calculateDailyPoints(book);

    book.pointTracking.runningPoints += dailyPts;

    // Ghi balanceHistory — tránh duplicate cùng ngày
    const alreadyLogged = book.pointTracking.balanceHistory.some(
      (h) => h.date === today,
    );
    if (!alreadyLogged) {
      book.pointTracking.balanceHistory.push({
        date: today,
        balance: book.currentBalance,
      });
    }

    // Kiểm tra nếu đã đến ngày chốt (nextLockDate) — auto-lock
    if (today >= book.pointTracking.nextLockDate) {
      runLockCycleJobOnBook(book, today);
    }
  }

  // Bước 2: Aggregate lên user.journey
  next.journey.runningPoints = next.savingsBooks
    .filter((b) => b.status === 'active')
    .reduce((sum, b) => sum + b.pointTracking.runningPoints, 0);

  next.journey.progressPoints = next.savingsBooks.reduce(
    (sum, b) => sum + b.pointTracking.lockedPoints,
    0,
  );

  return next;
}

// ─────────────────────────────────────────────────────────────
// B2 — Hàm 3: runLockCycleJob
// ─────────────────────────────────────────────────────────────

/**
 * Chốt điểm cho một sổ khi đến nextLockDate.
 * Điều kiện: sổ phải có status === "active".
 *
 * Spec algorithm:
 *   lockedThisCycle = book.pointTracking.runningPoints
 *   book.pointTracking.lockedPoints += lockedThisCycle
 *   cycleBonus = Math.floor(lockedThisCycle * 0.10)
 *   book.pointTracking.commitmentBonusPoints += cycleBonus
 *   book.pointTracking.runningPoints = 0
 *   book.pointTracking.lastLockDate = today
 *   book.pointTracking.nextLockDate = today + lockCycleDays
 *
 * @param user   - Current user state
 * @param bookId - ID của sổ cần chốt
 * @param simDate - Ngày mô phỏng. Nếu null dùng ngày thực.
 * @returns Bản sao User mới sau khi chốt
 */
export function runLockCycleJob(
  user: User,
  bookId: string,
  simDate: string | null = null,
): User {
  const today = simDate ?? toISODate(new Date());
  const next: User = JSON.parse(JSON.stringify(user));

  const book = next.savingsBooks.find((b) => b.bookId === bookId);
  if (!book) {
    console.warn(`[runLockCycleJob] bookId "${bookId}" không tìm thấy.`);
    return next;
  }
  if (book.status !== 'active') {
    console.warn(`[runLockCycleJob] Sổ "${bookId}" không ở trạng thái active (${book.status}).`);
    return next;
  }

  runLockCycleJobOnBook(book, today);

  // Re-aggregate user journey
  next.journey.progressPoints = next.savingsBooks.reduce(
    (sum, b) => sum + b.pointTracking.lockedPoints,
    0,
  );

  return next;
}

/**
 * Internal helper — mutates book in-place (chỉ dùng khi đã deep-clone).
 * Tách riêng để runDailyPointJob có thể gọi inline khi auto-lock.
 */
function runLockCycleJobOnBook(book: SavingsBook, today: string): void {
  const lockedThisCycle = book.pointTracking.runningPoints;

  book.pointTracking.lockedPoints += lockedThisCycle;

  // Thưởng hoàn thành chu kỳ: +10%
  const cycleBonus = Math.floor(lockedThisCycle * CYCLE_COMPLETION_BONUS_RATE);
  book.pointTracking.commitmentBonusPoints += cycleBonus;

  book.pointTracking.runningPoints = 0;
  book.pointTracking.lastLockDate = today;
  book.pointTracking.nextLockDate = addDays(today, book.pointTracking.lockCycleDays);
}

// ─────────────────────────────────────────────────────────────
// B2 — Hàm 4: runMaturityJob
// ─────────────────────────────────────────────────────────────

/**
 * Xử lý khi sổ đáo hạn thành công.
 *
 * Spec algorithm:
 *   maturityBonus = Math.floor(lockedPoints * 0.20)
 *   commitmentBonusPoints += maturityBonus
 *   lockedPoints += commitmentBonusPoints (unlock toàn bộ bonus)
 *   commitmentBonusPoints = 0
 *   status = "matured"
 *
 * @param user   - Current user state
 * @param bookId - ID của sổ đáo hạn
 * @param simDate - Ngày mô phỏng
 */
export function runMaturityJob(
  user: User,
  bookId: string,
  simDate: string | null = null,
): User {
  const _today = simDate ?? toISODate(new Date()); // kept for future use
  void _today;

  const next: User = JSON.parse(JSON.stringify(user));

  const book = next.savingsBooks.find((b) => b.bookId === bookId);
  if (!book) {
    console.warn(`[runMaturityJob] bookId "${bookId}" không tìm thấy.`);
    return next;
  }
  if (book.status !== 'active') {
    console.warn(`[runMaturityJob] Sổ "${bookId}" không ở trạng thái active.`);
    return next;
  }

  // Thưởng hoàn thành cam kết: +20% tổng điểm đã chốt
  const maturityBonus = Math.floor(
    book.pointTracking.lockedPoints * MATURITY_COMPLETION_BONUS_RATE,
  );
  book.pointTracking.commitmentBonusPoints += maturityBonus;

  // Unlock toàn bộ bonus vào lockedPoints
  book.pointTracking.lockedPoints += book.pointTracking.commitmentBonusPoints;
  book.pointTracking.commitmentBonusPoints = 0;

  book.status = 'matured';

  // Re-aggregate
  next.journey.progressPoints = next.savingsBooks.reduce(
    (sum, b) => sum + b.pointTracking.lockedPoints,
    0,
  );

  return next;
}

// ─────────────────────────────────────────────────────────────
// Re-export helpers for use in other engines
// ─────────────────────────────────────────────────────────────
export { toISODate, addDays };
export { LOCK_CYCLE_DAYS };
