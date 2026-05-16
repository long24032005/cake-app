/**
 * CAKE PET SAVINGS — Pet Engine
 * Source: spec section B5 — ENGINE HOÀN VÒNG & PET TIẾN HÓA (Cơ chế 7)
 */

import { LARGE_MILESTONES } from '../config';
import type { PetForm, User } from '../types';
import { checkMilestones } from './milestoneEngine';

// ─────────────────────────────────────────────────────────────
// B5 — Hàm 1: getPetNextForm
// ─────────────────────────────────────────────────────────────

/**
 * Spec mapping:
 *   egg      -> baby
 *   baby     -> teen
 *   teen     -> adult
 *   adult    -> reborn_1
 *   reborn_1 -> reborn_2
 *   reborn_2 -> reborn_2 (giữ nguyên, chỉ đổi skin)
 */
export function getPetNextForm(currentForm: PetForm, _round: number): PetForm {
  const mapping: Record<PetForm, PetForm> = {
    baby:     'teen',
    teen:     'adult',
    adult:    'reborn_1',
    reborn_1: 'reborn_2',
    reborn_2: 'reborn_2',
  };
  return mapping[currentForm];
}

// ─────────────────────────────────────────────────────────────
// B5 — Hàm 2: checkRoundCompletion
// ─────────────────────────────────────────────────────────────

/**
 * Kiểm tra xem user đã đủ điểm hoàn vòng chưa.
 * Nếu đủ → gọi triggerRoundComplete.
 */
export function checkRoundCompletion(user: User): {
  nextUser: User;
  roundCompleted: boolean;
} {
  const lastLargeMilestone = LARGE_MILESTONES[LARGE_MILESTONES.length - 1]; // L5 = 60_000

  if (user.journey.progressPoints >= lastLargeMilestone.pointsRequired) {
    const nextUser = triggerRoundComplete(user);
    return { nextUser, roundCompleted: true };
  }

  return { nextUser: user, roundCompleted: false };
}

// ─────────────────────────────────────────────────────────────
// B5 — Hàm 3: triggerRoundComplete
// ─────────────────────────────────────────────────────────────

/**
 * Spec algorithm:
 *   roundHistory.push({ round, completedAt, finalPoints, petFormAtEnd })
 *   newForm = getPetNextForm(currentForm, currentRound)
 *   petState.form = newForm
 *   petState.mood = "happy"
 *   currentRound += 1
 *   totalRoundsCompleted += 1
 *   progressPoints = 0
 *   runningPoints = 0
 *   lastMilestoneReached = 0
 *   milestoneHistory = []
 *   KHÔNG reset: roundHistory, totalRoundsCompleted, unlockedItems, inventory
 */
export function triggerRoundComplete(user: User): User {
  const next: User = JSON.parse(JSON.stringify(user));

  // Lưu lịch sử vòng
  next.journey.roundHistory.push({
    round: next.journey.currentRound,
    completedAt: new Date().toISOString(),
    finalPoints: next.journey.progressPoints,
    petFormAtEnd: next.petState.form,
  });

  // Tiến hóa pet
  const newForm = getPetNextForm(next.petState.form, next.journey.currentRound);
  next.petState.form = newForm;
  next.petState.mood = 'happy';

  // Reset vòng mới
  next.journey.currentRound += 1;
  next.journey.totalRoundsCompleted += 1;
  next.journey.progressPoints = 0;
  next.journey.runningPoints = 0;
  next.journey.lastMilestoneReached = 0;
  next.journey.milestoneHistory = [];

  // KHÔNG reset: roundHistory, totalRoundsCompleted, unlockedItems, inventory

  console.log(
    `[triggerRoundComplete] Vòng hoàn thành! Pet tiến hóa: ${user.petState.form} -> ${newForm}. Vòng mới: ${next.journey.currentRound}`,
  );

  return next;
}

// ─────────────────────────────────────────────────────────────
// B6 — Hàm: processAccumulateDeposit
// ─────────────────────────────────────────────────────────────

/**
 * Source: spec section B6 — ĐIỂM ĐẶC BIỆT CHO TIẾT KIỆM TÍCH LŨY
 *
 * Spec:
 *   if amount >= targetMonthlyAmount * 0.8 (chấp nhận ít hơn 20%):
 *     isValid = true, completedPeriods += 1, currentBalance += amount
 *   else:
 *     isValid = false — KHÔNG kích hoạt vi phạm, điểm vẫn chạy bình thường
 */
export function processAccumulateDeposit(
  user: User,
  bookId: string,
  amount: number,
  period: number,
): User {
  const next: User = JSON.parse(JSON.stringify(user));
  const book = next.savingsBooks.find((b) => b.bookId === bookId);

  if (!book || book.bookType !== 'accumulate' || !book.accumulate) {
    console.warn(`[processAccumulateDeposit] Sổ "${bookId}" không hợp lệ.`);
    return next;
  }

  const isValid = amount >= book.accumulate.targetMonthlyAmount * 0.8;

  book.accumulate.periodHistory.push({
    period,
    amount,
    depositedAt: new Date().toISOString(),
    isValid,
  });

  if (isValid) {
    book.accumulate.completedPeriods += 1;
    book.currentBalance += amount;
    console.log(
      `[processAccumulateDeposit] Kỳ ${period} hợp lệ (+${amount.toLocaleString('vi-VN')}đ)`,
    );
  } else {
    console.log(
      `[processAccumulateDeposit] Kỳ ${period} không hợp lệ (${amount.toLocaleString('vi-VN')}đ < 80% target) — không vi phạm, điểm vẫn chạy`,
    );
  }

  return next;
}
