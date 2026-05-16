/**
 * CAKE PET SAVINGS — Config (nguồn sự thật duy nhất)
 * Source: spec section B1 (Milestone Config) + section G (MVP defaults)
 *
 * Quy tắc: KHÔNG hardcode bất kỳ con số / mốc nào ngoài file này.
 */

// ─────────────────────────────────────────────────────────────
// SECTION G — Tham số MVP mặc định
// ─────────────────────────────────────────────────────────────

/** Cơ chế 1 — Tính điểm */
export const POINTS_PER_100K_PER_DAY = 1;   // 1 điểm / 100k / ngày
export const LOCK_CYCLE_DAYS = 30;           // chu kỳ chốt điểm mặc định (ngày)
export const CYCLE_COMPLETION_BONUS_RATE = 0.10;  // +10% điểm chu kỳ khi chốt thành công
export const MATURITY_COMPLETION_BONUS_RATE = 0.20; // +20% tổng lockedPoints khi đáo hạn

/** Cơ chế 3 — Điểm hoàn vòng */
export const ROUND_COMPLETE_THRESHOLD = 60_000; // = điểm của mốc L5

/** Cơ chế 5 — Định giá (tham khảo) */
export const BETA = 0.05;            // doanh nghiệp hoàn lại 5% giá trị tăng thêm
export const A_POINT_VALUE = 100;    // 1 điểm ~ 100đ giá trị kinh tế ước tính

/** Cơ chế 8 — Phạt vi phạm */
export const VIOLATION_THRESHOLDS = [
  { minR: 0.9, maxR: 1.0,  runningPointsKept: 0.75 }, // mất 25%
  { minR: 0.8, maxR: 0.9,  runningPointsKept: 0.50 }, // mất 50%
  { minR: 0.7, maxR: 0.8,  runningPointsKept: 0.25 }, // mất 75%
  { minR: 0.0, maxR: 0.7,  runningPointsKept: 0.00 }, // mất 100%
] as const;

/** MVP simplification flags */
export const ENABLE_BLIND_BAG = true;
export const ENABLE_BOOSTER_EFFECT = false;       // Booster chỉ trang trí trong MVP
export const ENABLE_REAL_TIME_DAILY_JOB = false;  // Dùng manual trigger qua Sim Mode

// ─────────────────────────────────────────────────────────────
// SECTION B1 — Milestone Configs
// ─────────────────────────────────────────────────────────────

export type LargeMilestone = {
  id: string;
  pointsRequired: number;
  rewardType: 'cash_voucher';
  rewardValue: number;
  blindBagEnabled: boolean;
};

export type SmallMilestone = {
  id: string;
  pointsRequired: number;
  rewardType: 'pet_accessory' | 'badge';
  itemId: string;
};

export type MidMilestone = {
  id: string;
  pointsRequired: number;
  rewardType: 'booster' | 'utility_ticket';
  itemId: string;
};

export type AnyMilestone = LargeMilestone | SmallMilestone | MidMilestone;

export const LARGE_MILESTONES: LargeMilestone[] = [
  { id: 'L1', pointsRequired: 3_000,  rewardType: 'cash_voucher', rewardValue: 30_000,  blindBagEnabled: true },
  { id: 'L2', pointsRequired: 7_000,  rewardType: 'cash_voucher', rewardValue: 50_000,  blindBagEnabled: true },
  { id: 'L3', pointsRequired: 15_000, rewardType: 'cash_voucher', rewardValue: 80_000,  blindBagEnabled: true },
  { id: 'L4', pointsRequired: 30_000, rewardType: 'cash_voucher', rewardValue: 150_000, blindBagEnabled: true },
  { id: 'L5', pointsRequired: 60_000, rewardType: 'cash_voucher', rewardValue: 280_000, blindBagEnabled: true },
];

export const SMALL_MILESTONES: SmallMilestone[] = [
  // Giữa L_start (0) và L1 (3000)
  { id: 'S1', pointsRequired: 500,   rewardType: 'pet_accessory', itemId: 'bow_pink' },
  { id: 'S2', pointsRequired: 1_200, rewardType: 'pet_accessory', itemId: 'hat_party' },
  { id: 'S3', pointsRequired: 2_000, rewardType: 'badge',         itemId: 'badge_saver_1' },
  // Giữa L1 (3000) và L2 (7000)
  { id: 'S4', pointsRequired: 4_000, rewardType: 'pet_accessory', itemId: 'scarf_yellow' },
  { id: 'S5', pointsRequired: 5_500, rewardType: 'badge',         itemId: 'badge_saver_2' },
  // Giữa L2 (7000) và L3 (15000)
  { id: 'S6', pointsRequired: 9_000,  rewardType: 'pet_accessory', itemId: 'wings_small' },
  { id: 'S7', pointsRequired: 12_000, rewardType: 'badge',         itemId: 'badge_golden' },
];

export const MID_MILESTONES: MidMilestone[] = [
  { id: 'M1', pointsRequired: 1_800,  rewardType: 'booster',        itemId: 'point_boost_x1.5_3days' },
  { id: 'M2', pointsRequired: 5_000,  rewardType: 'utility_ticket', itemId: 'ticket_interest_info' },
  { id: 'M3', pointsRequired: 10_000, rewardType: 'booster',        itemId: 'point_boost_x2_1day' },
  { id: 'M4', pointsRequired: 22_000, rewardType: 'utility_ticket', itemId: 'ticket_unlock_pet_theme' },
];

/** Toàn bộ milestones hợp nhất (dùng cho checkMilestones) */
export const ALL_MILESTONES: AnyMilestone[] = [
  ...LARGE_MILESTONES,
  ...SMALL_MILESTONES,
  ...MID_MILESTONES,
];

// ─────────────────────────────────────────────────────────────
// Blind bag pool (B4)
// ─────────────────────────────────────────────────────────────
export const BLIND_BAG_POOL = [
  { itemId: 'sticker_pack_1', probability: 0.40 },
  { itemId: 'pet_frame_gold',  probability: 0.30 },
  { itemId: 'voucher_10k',     probability: 0.20 },
  { itemId: 'voucher_50k',     probability: 0.10 },
] as const;
