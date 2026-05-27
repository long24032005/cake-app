/**
 * CAKE PET SAVINGS — Milestone Engine
 * Source: spec section B4 — ENGINE MỐC VÀ REWARD
 */

import {
  ALL_MILESTONES,
  BLIND_BAG_POOL,
  ENABLE_BLIND_BAG,
  type AnyMilestone,
  type LargeMilestone,
} from '../config';
import type { User } from '../types';
import { toISODate } from './pointEngine';

// ─────────────────────────────────────────────────────────────
// B4 — Hàm 1: checkMilestones
// ─────────────────────────────────────────────────────────────

/**
 * Kiểm tra và unlock tất cả mốc mà user đã đủ điểm nhưng chưa nhận.
 * Gọi sau mỗi lần progressPoints thay đổi.
 *
 * Spec:
 *   totalPoints = user.journey.progressPoints
 *   For each milestone in ALL_MILESTONES:
 *     if totalPoints >= milestone.pointsRequired
 *     AND milestone.id NOT IN milestoneHistory:
 *       addMilestoneReward(user, milestone)
 *       push to milestoneHistory
 *
 * @returns { nextUser, newlyUnlockedMilestones } — milestones mới đạt để trigger UI
 */
export function checkMilestones(user: User): {
  nextUser: User;
  newlyUnlocked: AnyMilestone[];
} {
  const next: User = JSON.parse(JSON.stringify(user));
  const newlyUnlocked: AnyMilestone[] = [];

  const totalPoints = next.journey.progressPoints;
  const earnedIds = new Set(next.journey.milestoneHistory.map((h) => h.milestoneId));

  for (const milestone of ALL_MILESTONES) {
    if (totalPoints >= milestone.pointsRequired && !earnedIds.has(milestone.id)) {
      // Thêm reward vào inventory
      addMilestoneRewardToUser(next, milestone);

      // Ghi vào milestoneHistory
      next.journey.milestoneHistory.push({
        milestoneId: milestone.id,
        reachedAt: new Date().toISOString(),
        rewardClaimed: false,
      });

      // Cập nhật lastMilestoneReached nếu là Large milestone
      const largeMilestones = ALL_MILESTONES.filter(
        (m): m is LargeMilestone => m.rewardType === 'cash_voucher',
      );
      const largeIdx = largeMilestones.findIndex((m) => m.id === milestone.id);
      if (largeIdx !== -1 && largeIdx > next.journey.lastMilestoneReached) {
        next.journey.lastMilestoneReached = largeIdx;
      }

      newlyUnlocked.push(milestone);
      earnedIds.add(milestone.id); // tránh double-count trong cùng 1 lần check

      console.log(
        `[checkMilestones] Mốc đạt: ${milestone.id} (${milestone.pointsRequired} pts)`,
      );
    }
  }

  return { nextUser: next, newlyUnlocked };
}

// ─────────────────────────────────────────────────────────────
// B4 — Hàm 2: addMilestoneReward
// ─────────────────────────────────────────────────────────────

/**
 * Thêm phần thưởng mốc vào inventory user.
 * Public overload cho Sim Mode (gọi trực tiếp mà không qua checkMilestones).
 */
export function addMilestoneReward(user: User, milestone: AnyMilestone): User {
  const next: User = JSON.parse(JSON.stringify(user));
  addMilestoneRewardToUser(next, milestone);
  return next;
}

/** Internal — mutates in-place khi đã clone */
function addMilestoneRewardToUser(user: User, milestone: AnyMilestone): void {
  const now = new Date().toISOString();
  const today = toISODate(new Date());

  if (milestone.rewardType === 'cash_voucher') {
    // Voucher chính
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    user.inventory.push({
      instanceId: generateId(),
      type: 'voucher',
      value: milestone.rewardValue,
      expiresAt: expiryDate.toISOString(),
      source: milestone.id,
      receivedAt: now,
    });

    // Blind bag (nếu enabled)
    if (milestone.blindBagEnabled && ENABLE_BLIND_BAG) {
      const blindItem = rollBlindBag(user.journey.currentRound);
      user.inventory.push({
        instanceId: generateId(),
        type: 'blind_bag_item',
        itemId: blindItem.itemId,
        source: 'blind_bag',
        receivedAt: now,
      });
    }

    // Thưởng thêm voucher lãi suất nếu là mốc lớn cuối cùng L5
    if (milestone.id === 'L5') {
      const bonusRate = parseFloat((1.3 + (user.journey.currentRound - 1) * 0.01).toFixed(2));
      user.inventory.push({
        instanceId: generateId(),
        type: 'voucher',
        itemId: 'voucher_interest_rate',
        value: bonusRate,
        expiresAt: expiryDate.toISOString(),
        source: milestone.id,
        receivedAt: now,
      });
    }
  } else if (
    milestone.rewardType === 'pet_accessory' ||
    milestone.rewardType === 'badge'
  ) {
    user.inventory.push({
      instanceId: generateId(),
      type: milestone.rewardType,
      itemId: milestone.itemId,
      source: milestone.id,
      receivedAt: now,
    });
    // Unlock vào petState
    if (!user.petState.unlockedItems.includes(milestone.itemId)) {
      user.petState.unlockedItems.push(milestone.itemId);
    }
  } else if (
    milestone.rewardType === 'booster' ||
    milestone.rewardType === 'utility_ticket'
  ) {
    user.inventory.push({
      instanceId: generateId(),
      type: milestone.rewardType,
      itemId: milestone.itemId,
      source: milestone.id,
      receivedAt: now,
    });
  }

  void today; // available for future date-based filtering
}

// ─────────────────────────────────────────────────────────────
// B4 — Hàm 3: rollBlindBag
// ─────────────────────────────────────────────────────────────

/**
 * Random có trọng số từ BLIND_BAG_POOL.
 * currentRound dự kiến dùng sau để điều chỉnh pool.
 */
export function rollBlindBag(
  _currentRound: number,
): { itemId: string } {
  const pool = [...BLIND_BAG_POOL];
  const rand = Math.random();
  let cumulative = 0;

  for (const item of pool) {
    cumulative += item.probability;
    if (rand < cumulative) {
      return { itemId: item.itemId };
    }
  }

  // Fallback (floating point edge case)
  return { itemId: pool[pool.length - 1].itemId };
}

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
