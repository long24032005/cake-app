/**
 * CAKE PET SAVINGS — Console Debug Bridge
 * Expose store và engine functions lên window.__cake để test từ DevTools console.
 *
 * Cách dùng:
 *   window.__cake.runDailyJob()           → chạy daily job 1 ngày
 *   window.__cake.runDailyJob(7)          → chạy 7 ngày liên tiếp
 *   window.__cake.addPoints(500)          → thêm 500 điểm chốt
 *   window.__cake.createStandardBook()    → tạo sổ thường demo
 *   window.__cake.createAccumulateBook()  → tạo sổ tích lũy demo
 *   window.__cake.lockBook(bookId)        → chốt chu kỳ cho sổ
 *   window.__cake.matureBook(bookId)      → đáo hạn sổ
 *   window.__cake.violateBook(bookId)     → giả lập vi phạm sổ
 *   window.__cake.setPoints(2800)         → set điểm chốt trực tiếp
 *   window.__cake.nearNextMilestone()     → set điểm = mốc tiếp theo - 10
 *   window.__cake.testViolationThresholds() → verify 4 ngưỡng r (B3)
 *   window.__cake.testMilestonePopup('L1')  → trigger popup milestone (B4)
 *   window.__cake.unlockMilestone('L1')     → unlock milestone thủ công
 *   window.__cake.rollBlindBag()            → roll blind bag, xem kết quả
 *   window.__cake.setPetForm('adult')       → set pet form
 *   window.__cake.setPetMood('happy')       → set pet mood
 *   window.__cake.triggerRound()            → trigger hoàn vòng
 *   window.__cake.clearInventory()          → xóa kho đồ
 *   window.__cake.reset()                   → reset về ban đầu
 *   window.__cake.state()                   → xem toàn bộ state hiện tại
 *   window.__cake.debug()                   → xem debug summary (spec D2 Section 6)
 */

import { useAppStore } from './useAppStore';
import { VIOLATION_THRESHOLDS } from '../config';

export interface CakeDebugBridge {
  runDailyJob: (days?: number) => void;
  addPoints: (pts: number) => void;
  subtractPoints: (pts: number) => void;
  setPoints: (pts: number) => void;
  nearNextMilestone: () => void;
  createStandardBook: () => void;
  createAccumulateBook: () => void;
  lockBook: (bookId: string) => void;
  matureBook: (bookId: string) => void;
  violateBook: (bookId: string) => void;
  /** Test B3: verify 4 ngưỡng r bằng cách giả lập với r trực tiếp */
  testViolationThresholds: () => void;
  rollBlindBag: () => string;
  unlockMilestone: (milestoneId: string) => void;
  /** Test B4: trigger milestone popup bằng cách unlock milestone trực tiếp */
  testMilestonePopup: (milestoneId?: string) => void;
  setPetForm: (form: string) => void;
  setPetMood: (mood: string) => void;
  triggerRound: () => void;
  clearInventory: () => void;
  reset: () => void;
  state: () => object;
  debug: () => void;
}

declare global {
  interface Window {
    __cake: CakeDebugBridge;
  }
}

export function installDebugBridge(): void {
  const bridge: CakeDebugBridge = {
    runDailyJob: (days = 1) => {
      useAppStore.getState().runDailyJob(days);
      console.log(`⚡ [Sim] Đã chạy daily job ${days} ngày`);
      bridge.debug();
    },

    addPoints: (pts) => {
      useAppStore.getState().addProgressPoints(pts);
      console.log(`⚡ [Sim] Đã thêm ${pts} điểm chốt`);
      bridge.debug();
    },

    subtractPoints: (pts) => {
      useAppStore.getState().subtractProgressPoints(pts);
      console.log(`⚡ [Sim] Đã trừ ${pts} điểm chốt`);
      bridge.debug();
    },

    setPoints: (pts) => {
      useAppStore.getState().resetPoints();
      useAppStore.getState().addProgressPoints(pts);
      console.log(`⚡ [Sim] Đã set điểm chốt = ${pts}`);
      bridge.debug();
    },

    nearNextMilestone: () => {
      useAppStore.getState().setPointsNearNextMilestone();
      bridge.debug();
    },

    createStandardBook: () => {
      useAppStore.getState().createDemoStandardBook();
      bridge.debug();
    },

    createAccumulateBook: () => {
      useAppStore.getState().createDemoAccumulateBook();
      bridge.debug();
    },

    lockBook: (bookId) => {
      useAppStore.getState().runLockCycle(bookId);
      console.log(`⚡ [Sim] Đã chốt chu kỳ sổ: ${bookId}`);
      bridge.debug();
    },

    matureBook: (bookId) => {
      useAppStore.getState().runMaturity(bookId);
      console.log(`⚡ [Sim] Đã đáo hạn sổ: ${bookId}`);
      bridge.debug();
    },

    violateBook: (bookId) => {
      const { user } = useAppStore.getState();
      const book = user.savingsBooks.find((b) => b.bookId === bookId);
      if (!book) { console.error(`Không tìm thấy sổ: ${bookId}`); return ''; }

      const runningBefore = book.pointTracking.runningPoints;
      useAppStore.getState().violateBook(bookId);
      const runningAfter = useAppStore.getState().user.savingsBooks
        .find((b) => b.bookId === bookId)?.pointTracking.runningPoints ?? 0;

      console.log(`⚡ [Sim] Vi phạm sổ ${bookId}`);
      console.log(`  Running điểm trước: ${runningBefore}`);
      console.log(`  Running điểm sau:   ${runningAfter}`);
      console.log(`  Locked điểm (không thay đổi): ${book.pointTracking.lockedPoints}`);
      bridge.debug();
    },

    // ── B3 Test: Verify 4 ngưỡng r ───────────────────────
    testViolationThresholds: () => {
      console.group('🧪 [B3] Violation Threshold Test');
      const cases = [
        { r: 0.0,  expected: '0%  giữ (mất 100%)' },
        { r: 0.5,  expected: '0%  giữ (mất 100%)' },
        { r: 0.69, expected: '0%  giữ (mất 100%)' },
        { r: 0.7,  expected: '25% giữ (mất 75%)' },
        { r: 0.8,  expected: '50% giữ (mất 50%)' },
        { r: 0.9,  expected: '75% giữ (mất 25%)' },
        { r: 1.0,  expected: '75% giữ (mất 25%) ← edge case r=1.0' },
      ];
      const sorted = [...VIOLATION_THRESHOLDS].sort((a: any, b: any) => b.minR - a.minR);
      for (const c of cases) {
        const t = sorted.find((th: any) => c.r >= th.minR) ?? sorted[sorted.length - 1];
        const keptPct = Math.round((t as any).runningPointsKept * 100);
        console.log(`  r=${c.r.toFixed(2)} → kept=${keptPct}% | expected: ${c.expected}`);
      }
      console.groupEnd();
    },

    rollBlindBag: () => {
      const result = useAppStore.getState().doRollBlindBag();
      console.log(`⚡ [Sim] Blind bag result: ${result}`);
      return result;
    },

    // ── B4 Test: Trigger milestone popup ─────────────────
    testMilestonePopup: (milestoneId = 'L1') => {
      console.log(`⚡ [B4] Triggering popup for milestone: ${milestoneId}`);
      useAppStore.getState().unlockMilestone(milestoneId);
      console.log('Popup should appear in UI. Check pendingMilestonePopup in store.');
      bridge.debug();
    },

    unlockMilestone: (milestoneId) => {
      useAppStore.getState().unlockMilestone(milestoneId);
      console.log(`⚡ [Sim] Đã unlock milestone: ${milestoneId}`);
      bridge.debug();
    },

    setPetForm: (form) => {
      useAppStore.getState().setPetForm(form as any);
      console.log(`⚡ [Sim] Pet form → ${form}`);
    },

    setPetMood: (mood) => {
      useAppStore.getState().setPetMood(mood as any);
      console.log(`⚡ [Sim] Pet mood → ${mood}`);
    },

    triggerRound: () => {
      useAppStore.getState().doTriggerRoundComplete();
      console.log('⚡ [Sim] Đã trigger hoàn vòng!');
      bridge.debug();
    },

    clearInventory: () => {
      useAppStore.getState().clearInventory();
      console.log('⚡ [Sim] Đã xóa toàn bộ inventory');
    },

    reset: () => {
      useAppStore.getState().hardReset();
      console.log('⚡ [Sim] Đã reset toàn bộ về ban đầu');
    },

    state: () => {
      return useAppStore.getState().user;
    },

    // Debug summary — spec D2 Section 6
    debug: () => {
      const { user } = useAppStore.getState();
      const { journey, petState, savingsBooks } = user;

      console.groupCollapsed('📊 CAKE Debug Info');
      console.log('── Journey ──');
      console.log(`  Vòng:         ${journey.currentRound} (hoàn thành: ${journey.totalRoundsCompleted})`);
      console.log(`  progressPoints: ${journey.progressPoints} ✓`);
      console.log(`  runningPoints:  ${journey.runningPoints} ~`);
      console.log(`  Tổng:           ${journey.progressPoints + journey.runningPoints}`);
      console.log(`  Mốc đã đạt:    ${journey.milestoneHistory.map((h) => h.milestoneId).join(', ') || '(chưa có)'}`);

      console.log('── Pet ──');
      console.log(`  Form: ${petState.form} | Mood: ${petState.mood}`);
      console.log(`  Accessories: ${petState.accessories.join(', ') || '(none)'}`);

      console.log('── Savings Books ──');
      for (const b of savingsBooks) {
        console.log(
          `  [${b.bookId}] ${b.bookType} | ${b.status} | locked: ${b.pointTracking.lockedPoints} | running: ${b.pointTracking.runningPoints} | bonus: ${b.pointTracking.commitmentBonusPoints}`,
        );
      }
      console.groupEnd();
    },
  };

  window.__cake = bridge;
  console.log(
    '%c🐱 CAKE Debug Bridge ready. Type window.__cake.debug() to start.',
    'color: #FF2D8C; font-weight: bold;',
  );
}
