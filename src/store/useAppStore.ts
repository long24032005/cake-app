/**
 * CAKE PET SAVINGS — Zustand App Store
 * Source: spec section A (Kiến trúc) + ghi chú dòng 851-852
 *
 * Nguyên tắc:
 *   - Store chỉ là một lớp wrapper mỏng trên engine functions
 *   - Engine functions là pure → store gọi engine, lấy kết quả, ghi vào state
 *   - Persist vào localStorage (spec dòng 852: "localStorage đủ cho demo")
 *   - Toàn bộ số liệu nhạy cảm (điểm, mốc) được tính bởi engine, không bởi UI
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Types
import type { User, SavingsBook } from '../types';

// Re-export types for convenience
export type { User, SavingsBook };

// Config types
import type { AnyMilestone } from '../config';

// Engine functions
import {
  runDailyPointJob,
  runLockCycleJob,
  runMaturityJob,
} from '../engine/pointEngine';
import {
  processViolation,
} from '../engine/violationEngine';
import {
  checkMilestones,
  addMilestoneReward,
  rollBlindBag,
} from '../engine/milestoneEngine';
import {
  checkRoundCompletion,
  triggerRoundComplete,
  processAccumulateDeposit,
} from '../engine/petEngine';

// Initial state
import {
  createInitialUser,
  createDemoStandardBook,
  createDemoAccumulateBook,
} from './initialState';

// Config
import { ALL_MILESTONES } from '../config';

// ─────────────────────────────────────────────────────────────
// Store State Type
// ─────────────────────────────────────────────────────────────

export interface AppState {
  /** Toàn bộ data của user mock */
  user: User;

  /** Ngày hiện tại trong simulation (ISO date string) */
  simDate: string | null;

  /** Milestone vừa đạt — dùng để trigger popup UI */
  pendingMilestonePopup: AnyMilestone | null;

  /** Blind bag item vừa được roll (itemId) — dùng trong MilestoneRewardPopup */
  pendingBlindBagItem: string | null;

  /** Flag: vừa hoàn vòng — dùng để trigger animation */
  roundJustCompleted: boolean;

  /** Dismiss blind bag popup sau khi user xem */
  dismissBlindBagItem: () => void;

  // ── B2 Engine Actions ────────────────────────────────────

  /** B2-1: Tính & cộng điểm hàng ngày cho tất cả sổ active */
  runDailyJob: (days?: number) => void;

  /** B2-3: Chốt điểm thủ công cho một sổ */
  runLockCycle: (bookId: string) => void;

  /** B2-4: Đáo hạn sổ */
  runMaturity: (bookId: string) => void;

  // ── B3 Engine Actions ────────────────────────────────────

  /** B3-1: Giả lập vi phạm (rút trước hạn) */
  violateBook: (bookId: string, violationType?: 'early_withdrawal' | 'plan_stopped') => void;

  // ── B4 Engine Actions ────────────────────────────────────

  /** B4-1: Kiểm tra + unlock milestone mới (tự gọi sau mỗi lần điểm thay đổi) */
  triggerCheckMilestones: () => void;

  /** B4-2: Unlock milestone trực tiếp (Sim Mode) */
  unlockMilestone: (milestoneId: string) => void;

  /** B4-3: Roll blind bag và xem kết quả */
  doRollBlindBag: () => string;

  // ── B5/B6 Engine Actions ─────────────────────────────────

  /** B5: Trigger hoàn vòng thủ công (Sim Mode) */
  doTriggerRoundComplete: () => void;

  /** B6: Nạp tiền kỳ vào sổ tích lũy */
  depositAccumulate: (bookId: string, amount: number, period: number) => void;

  // ── Book Management ───────────────────────────────────────

  addBook: (book: SavingsBook) => void;
  removeBook: (bookId: string) => void;

  // ── Sim Mode Helpers ──────────────────────────────────────

  /** Thêm điểm chốt trực tiếp (Sim Mode D2 Section 2) */
  addProgressPoints: (pts: number) => void;

  /** Trừ điểm chốt (Sim Mode D2 Section 2) */
  subtractProgressPoints: (pts: number) => void;

  /** Reset điểm về 0 (Sim Mode D2 Section 2) */
  resetPoints: () => void;

  /** Set điểm = mốc tiếp theo - 10 (Sim Mode D2 Section 2) */
  setPointsNearNextMilestone: () => void;

  /** Tạo sổ demo (Sim Mode D2 Section 3) */
  createDemoStandardBook: () => void;
  createDemoAccumulateBook: () => void;

  /** Set pet form/mood trực tiếp (Sim Mode D2 Section 4) */
  setPetForm: (form: User['petState']['form']) => void;
  setPetMood: (mood: User['petState']['mood']) => void;
  equipAccessory: (itemId: string) => void;
  unequipAccessory: (itemId: string) => void;

  /** Xóa toàn bộ inventory (Sim Mode D2 Section 5) */
  clearInventory: () => void;

  /** Set ngày sim (Sim Mode D2 Section 1) */
  setSimDate: (date: string | null) => void;

  /** Dismiss milestone popup */
  dismissMilestonePopup: () => void;

  /** Dismiss round complete flag */
  dismissRoundComplete: () => void;

  /** Reset toàn bộ về state ban đầu (Kịch bản 1) */
  hardReset: () => void;
}

// ─────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: createInitialUser(),
      simDate: null,
      pendingMilestonePopup: null,
      pendingBlindBagItem: null,
      roundJustCompleted: false,

      // ── B2 ──────────────────────────────────────────────────

      runDailyJob: (days = 1) => {
        let { user, simDate } = get();

        for (let i = 0; i < days; i++) {
          // Nếu có simDate, tăng 1 ngày mỗi vòng lặp
          const currentSim = simDate
            ? (() => {
                const d = new Date(simDate);
                d.setUTCDate(d.getUTCDate() + i);
                return d.toISOString().split('T')[0];
              })()
            : null;

          user = runDailyPointJob(user, currentSim);
        }

        // Cập nhật simDate nếu đang dùng simulation
        let nextSimDate = simDate;
        if (simDate) {
          const d = new Date(simDate);
          d.setUTCDate(d.getUTCDate() + days);
          nextSimDate = d.toISOString().split('T')[0];
        }

        set({ user, simDate: nextSimDate });

        // Sau khi chạy daily job, check milestones + round
        get().triggerCheckMilestones();
      },

      runLockCycle: (bookId) => {
        const { user, simDate } = get();
        const next = runLockCycleJob(user, bookId, simDate);
        set({ user: next });
        get().triggerCheckMilestones();
      },

      runMaturity: (bookId) => {
        const { user, simDate } = get();
        const next = runMaturityJob(user, bookId, simDate);
        set({ user: next });
        get().triggerCheckMilestones();
      },

      // ── B3 ──────────────────────────────────────────────────

      violateBook: (bookId, violationType = 'early_withdrawal') => {
        const { user, simDate } = get();
        const next = processViolation(user, bookId, violationType, simDate);
        set({ user: next });
      },

      // ── B4 ──────────────────────────────────────────────────

      triggerCheckMilestones: () => {
        const { user } = get();
        // Snapshot existing blind_bag_item instanceIds BEFORE checking milestones
        const prevBagIds = new Set(user.inventory.filter(i => i.type === 'blind_bag_item').map(i => i.instanceId));

        const { nextUser, newlyUnlocked } = checkMilestones(user);

        // Detect newly added blind_bag_item (for popup reveal)
        const newBagItem = nextUser.inventory.find(
          i => i.type === 'blind_bag_item' && !prevBagIds.has(i.instanceId)
        );

        // Nếu có milestone mới — queue popup (chỉ show 1 cái mỗi lần)
        const firstNew = newlyUnlocked[0] ?? null;

        // Check round completion sau khi update milestones
        const { nextUser: afterRound, roundCompleted } = checkRoundCompletion(nextUser);

        set({
          user: afterRound,
          pendingMilestonePopup: firstNew,
          pendingBlindBagItem: newBagItem?.itemId ?? null,
          roundJustCompleted: roundCompleted || get().roundJustCompleted,
        });
      },

      unlockMilestone: (milestoneId) => {
        const { user } = get();
        const milestone = ALL_MILESTONES.find((m) => m.id === milestoneId);
        if (!milestone) {
          console.warn(`[unlockMilestone] Không tìm thấy milestone "${milestoneId}"`);
          return;
        }
        const next = addMilestoneReward(user, milestone);

        // Ghi vào milestoneHistory nếu chưa có
        const alreadyIn = next.journey.milestoneHistory.some(
          (h) => h.milestoneId === milestoneId,
        );
        if (!alreadyIn) {
          next.journey.milestoneHistory.push({
            milestoneId,
            reachedAt: new Date().toISOString(),
            rewardClaimed: false,
          });
        }

        // Detect blind_bag_item added by unlockMilestone
        const prevBagIds2 = new Set(user.inventory.filter(i => i.type === 'blind_bag_item').map(i => i.instanceId));
        const newBagItem2 = next.inventory.find(
          i => i.type === 'blind_bag_item' && !prevBagIds2.has(i.instanceId)
        );

        set({
          user: next,
          pendingMilestonePopup: milestone,
          pendingBlindBagItem: newBagItem2?.itemId ?? null,
        });
      },

      doRollBlindBag: () => {
        const { user } = get();
        const result = rollBlindBag(user.journey.currentRound);
        console.log(`[rollBlindBag] Kết quả: ${result.itemId}`);
        return result.itemId;
      },

      // ── B5 ──────────────────────────────────────────────────

      doTriggerRoundComplete: () => {
        const { user } = get();
        const next = triggerRoundComplete(user);
        set({ user: next, roundJustCompleted: true });
      },

      depositAccumulate: (bookId, amount, period) => {
        const { user } = get();
        const next = processAccumulateDeposit(user, bookId, amount, period);
        set({ user: next });
      },

      // ── Book Management ──────────────────────────────────────

      addBook: (book) => {
        set((state) => ({
          user: {
            ...state.user,
            savingsBooks: [...state.user.savingsBooks, book],
          },
        }));
      },

      removeBook: (bookId) => {
        set((state) => ({
          user: {
            ...state.user,
            savingsBooks: state.user.savingsBooks.filter((b) => b.bookId !== bookId),
          },
        }));
      },

      // ── Sim Mode Helpers ─────────────────────────────────────

      addProgressPoints: (pts) => {
        set((state) => {
          const user: User = {
            ...state.user,
            journey: {
              ...state.user.journey,
              progressPoints: state.user.journey.progressPoints + pts,
            },
          };
          return { user };
        });
        get().triggerCheckMilestones();
      },

      subtractProgressPoints: (pts) => {
        set((state) => {
          const user: User = {
            ...state.user,
            journey: {
              ...state.user.journey,
              progressPoints: Math.max(0, state.user.journey.progressPoints - pts),
            },
          };
          return { user };
        });
      },

      resetPoints: () => {
        set((state) => ({
          user: {
            ...state.user,
            journey: {
              ...state.user.journey,
              progressPoints: 0,
              runningPoints: 0,
            },
          },
        }));
      },

      setPointsNearNextMilestone: () => {
        const { user } = get();
        const current = user.journey.progressPoints;
        const nextMilestone = ALL_MILESTONES
          .filter((m) => m.pointsRequired > current)
          .sort((a, b) => a.pointsRequired - b.pointsRequired)[0];

        if (!nextMilestone) {
          console.log('[setPointsNearNextMilestone] Đã đạt tất cả mốc trong vòng này.');
          return;
        }

        const targetPts = nextMilestone.pointsRequired - 10;
        set((state) => ({
          user: {
            ...state.user,
            journey: {
              ...state.user.journey,
              progressPoints: Math.max(0, targetPts),
            },
          },
        }));
        console.log(
          `[setPointsNearNextMilestone] Set điểm = ${targetPts} (mốc ${nextMilestone.id} ở ${nextMilestone.pointsRequired})`,
        );
      },

      createDemoStandardBook: () => {
        const { simDate } = get();
        const book = createDemoStandardBook({ simDate: simDate ?? undefined });
        get().addBook(book);
        console.log(`[Sim] Đã tạo sổ thường demo: ${book.bookId}`);
      },

      createDemoAccumulateBook: () => {
        const { simDate } = get();
        const book = createDemoAccumulateBook({ simDate: simDate ?? undefined });
        get().addBook(book);
        console.log(`[Sim] Đã tạo sổ tích lũy demo: ${book.bookId}`);
      },

      setPetForm: (form) => {
        set((state) => ({
          user: {
            ...state.user,
            petState: { ...state.user.petState, form },
          },
        }));
      },

      setPetMood: (mood) => {
        set((state) => ({
          user: {
            ...state.user,
            petState: { ...state.user.petState, mood },
          },
        }));
      },

      equipAccessory: (itemId) => {
        set((state) => {
          const acc = state.user.petState.accessories;
          if (acc.includes(itemId)) return state;
          return {
            user: {
              ...state.user,
              petState: { ...state.user.petState, accessories: [...acc, itemId] },
            },
          };
        });
      },

      unequipAccessory: (itemId) => {
        set((state) => {
          const acc = state.user.petState.accessories;
          return {
            user: {
              ...state.user,
              petState: { ...state.user.petState, accessories: acc.filter(a => a !== itemId) },
            },
          };
        });
      },

      clearInventory: () => {
        set((state) => ({
          user: { ...state.user, inventory: [] },
        }));
      },

      setSimDate: (date) => {
        set({ simDate: date });
      },

      dismissMilestonePopup: () => {
        set({ pendingMilestonePopup: null, pendingBlindBagItem: null });
      },

      dismissBlindBagItem: () => {
        set({ pendingBlindBagItem: null });
      },

      dismissRoundComplete: () => {
        set({ roundJustCompleted: false });
      },

      hardReset: () => {
        set({
          user: createInitialUser(),
          simDate: null,
          pendingMilestonePopup: null,
          pendingBlindBagItem: null,
          roundJustCompleted: false,
        });
        console.log('[hardReset] State đã reset về ban đầu.');
      },
    }),
    {
      name: 'cake-pet-savings-store',  // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Chỉ persist user data và simDate
      partialize: (state) => ({
        user: state.user,
        simDate: state.simDate,
      }),
    },
  ),
);

// ─────────────────────────────────────────────────────────────
// Selector helpers (dùng trong components)
// ─────────────────────────────────────────────────────────────

export const selectUser = (s: AppState) => s.user;
export const selectJourney = (s: AppState) => s.user.journey;
export const selectPetState = (s: AppState) => s.user.petState;
export const selectBooks = (s: AppState) => s.user.savingsBooks;
export const selectInventory = (s: AppState) => s.user.inventory;
export const selectActiveBooks = (s: AppState) =>
  s.user.savingsBooks.filter((b) => b.status === 'active');
