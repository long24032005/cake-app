/**
 * CAKE PET SAVINGS — Initial State Factory
 * Tạo default User object cho MVP demo.
 * Source: spec section G (MVP defaults) + F (onboarding flow)
 */

import { LOCK_CYCLE_DAYS } from '../config';
import type { User } from '../types';
import { toISODate, addDays } from '../engine/pointEngine';

export const DEFAULT_USER_ID = 'mock_user_001';
export const DEFAULT_DISPLAY_NAME = 'Cake User';

/**
 * Tạo User object mặc định cho lần đầu khởi động.
 * Spec F — Onboarding: pet bắt đầu ở dạng "egg"
 */
export function createInitialUser(): User {
  const today = toISODate(new Date());

  return {
    userId: DEFAULT_USER_ID,
    displayName: DEFAULT_DISPLAY_NAME,

    petState: {
      form: 'baby',     // spec: start at baby instead of egg
      mood: 'neutral',
      accessories: [],
      unlockedItems: [],
    },

    journey: {
      currentRound: 1,
      totalRoundsCompleted: 0,
      progressPoints: 0,
      runningPoints: 0,
      lastMilestoneReached: 0,
      milestoneHistory: [],
      roundHistory: [],
    },

    savingsBooks: [],
    inventory: [],
    notifications: [],
  };
}

/**
 * Factory: tạo SavingsBook mẫu "Tiêu chuẩn" cho Sim Mode.
 * Spec D2 Section 3: principal=5,000,000đ, term=12 tháng, rate=7.4%
 */
export function createDemoStandardBook(overrides?: Partial<{
  principalAmount: number;
  termMonths: number;
  interestRate: number;
  simDate: string;
}>): import('../types').SavingsBook {
  const today = overrides?.simDate ?? toISODate(new Date());
  const principal = overrides?.principalAmount ?? 5_000_000;
  const termMonths = overrides?.termMonths ?? 12;
  const rate = overrides?.interestRate ?? 7.4;

  const maturityDate = addDays(today, termMonths * 30);

  return {
    bookId: `book_std_${Date.now()}`,
    bookType: 'standard',
    status: 'active',
    principalAmount: principal,
    currentBalance: principal,
    interestRate: rate,
    termMonths,
    startDate: today,
    maturityDate,
    pointTracking: {
      balanceHistory: [{ date: today, balance: principal }],
      lockedPoints: 0,
      runningPoints: 0,
      commitmentBonusPoints: 0,
      lockCycleDays: LOCK_CYCLE_DAYS,
      lastLockDate: today,
      nextLockDate: addDays(today, LOCK_CYCLE_DAYS),
      violationRatio: null,
    },
  };
}

/**
 * Factory: tạo SavingsBook mẫu "Tích lũy" cho Sim Mode.
 * Spec D2 Section 3: monthlyTarget=500,000đ, totalPeriods=12, rate=6.7%
 */
export function createDemoAccumulateBook(overrides?: Partial<{
  targetMonthlyAmount: number;
  totalPeriods: number;
  interestRate: number;
  simDate: string;
}>): import('../types').SavingsBook {
  const today = overrides?.simDate ?? toISODate(new Date());
  const target = overrides?.targetMonthlyAmount ?? 500_000;
  const totalPeriods = overrides?.totalPeriods ?? 12;
  const rate = overrides?.interestRate ?? 6.7;

  const maturityDate = addDays(today, totalPeriods * 30);

  return {
    bookId: `book_acc_${Date.now()}`,
    bookType: 'accumulate',
    status: 'active',
    principalAmount: 0,
    currentBalance: 0,
    interestRate: rate,
    termMonths: totalPeriods,
    startDate: today,
    maturityDate,
    accumulate: {
      targetMonthlyAmount: target,
      totalPeriods,
      completedPeriods: 0,
      periodHistory: [],
    },
    pointTracking: {
      balanceHistory: [],
      lockedPoints: 0,
      runningPoints: 0,
      commitmentBonusPoints: 0,
      lockCycleDays: LOCK_CYCLE_DAYS,
      lastLockDate: today,
      nextLockDate: addDays(today, LOCK_CYCLE_DAYS),
      violationRatio: null,
    },
  };
}
