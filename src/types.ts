/**
 * CAKE PET SAVINGS — TypeScript Types
 * Source: spec section B1 — CẤU TRÚC DỮ LIỆU
 *
 * Quy tắc: tất cả field name phải khớp 1-1 với spec.
 * Không thêm field khi chưa có trong spec.
 */

// ─────────────────────────────────────────────────────────────
// Pet
// ─────────────────────────────────────────────────────────────

/** Các dạng hình thái của Gato (spec B5) */
export type PetForm =
  | 'egg'      // Trứng chưa nở
  | 'baby'     // Gato nhỏ, trắng, mắt to
  | 'teen'     // Gato có hình dạng rõ hơn
  | 'adult'    // Gato đầy đủ như hình mascot chính thức
  | 'reborn_1' // Gato có vầng sáng / hào quang nhẹ
  | 'reborn_2'; // Gato có wings hoặc crown

export type PetMood = 'happy' | 'neutral' | 'sleeping';

export interface PetState {
  form: PetForm;
  mood: PetMood;
  /** Danh sách itemId đang được equip */
  accessories: string[];
  /** Toàn bộ itemId đã unlock (kể cả không đang equip) */
  unlockedItems: string[];
}

// ─────────────────────────────────────────────────────────────
// Journey
// ─────────────────────────────────────────────────────────────

export interface MilestoneHistoryEntry {
  milestoneId: string;
  reachedAt: string;      // ISO timestamp
  rewardClaimed: boolean;
}

export interface RoundHistoryEntry {
  round: number;
  completedAt: string;    // ISO timestamp
  finalPoints: number;
  petFormAtEnd: PetForm;
}

export interface Journey {
  /** Vòng hiện tại (bắt đầu từ 1) */
  currentRound: number;
  /** Tổng số vòng đã hoàn thành */
  totalRoundsCompleted: number;
  /** Điểm đã chốt trong vòng này (không thể bị trừ, trừ khi hoàn vòng reset) */
  progressPoints: number;
  /** Điểm đang chạy chưa chốt trong vòng này */
  runningPoints: number;
  /** Index của mốc lớn (LARGE_MILESTONES) gần nhất đã đạt */
  lastMilestoneReached: number;
  /** Lịch sử tất cả mốc đã đạt trong vòng này */
  milestoneHistory: MilestoneHistoryEntry[];
  /** Lịch sử các vòng đã hoàn thành */
  roundHistory: RoundHistoryEntry[];
}

// ─────────────────────────────────────────────────────────────
// Savings Book
// ─────────────────────────────────────────────────────────────

export type BookType = 'standard' | 'accumulate';
export type BookStatus = 'active' | 'matured' | 'violated' | 'closed';

export interface AccumulatePeriodEntry {
  period: number;
  amount: number;
  depositedAt: string;  // ISO timestamp
  isValid: boolean;
}

export interface AutoDepositSettings {
  enabled: boolean;
  amount: number;
  dayOfMonth: number | 'start' | 'end';
}

export interface AccumulateInfo {
  /** Số tiền gửi góp hàng kỳ mục tiêu */
  targetMonthlyAmount: number;
  /** Tổng số kỳ */
  totalPeriods: number;
  /** Số kỳ đã hoàn thành hợp lệ (gửi >= 80% target) */
  completedPeriods: number;
  periodHistory: AccumulatePeriodEntry[];
  /** Cài đặt tự động gửi góp */
  autoDeposit?: AutoDepositSettings;
}

export interface BalanceHistoryEntry {
  date: string;     // ISO date string (YYYY-MM-DD)
  balance: number;
}

export interface PointTracking {
  /** Lịch sử số dư từng ngày */
  balanceHistory: BalanceHistoryEntry[];

  // Ba rổ điểm (Cơ chế 1 + Cơ chế 8)
  /** Điểm đã chốt — KHÔNG bị trừ khi vi phạm */
  lockedPoints: number;
  /** Điểm đang chạy chu kỳ hiện tại — có thể bị trừ khi vi phạm */
  runningPoints: number;
  /** Điểm thưởng hoàn thành cam kết — mất hết khi vi phạm */
  commitmentBonusPoints: number;

  // Chu kỳ chốt
  lockCycleDays: number;
  lastLockDate: string;   // ISO date
  nextLockDate: string;   // ISO date

  // Vi phạm
  /** r = tỷ lệ hoàn thành cam kết khi vi phạm. null = chưa vi phạm */
  violationRatio: number | null;
}

export interface SavingsBook {
  bookId: string;
  bookType: BookType;
  status: BookStatus;

  // Thông tin cơ bản
  principalAmount: number;
  currentBalance: number;
  interestRate: number;   // %/năm
  termMonths: number;
  startDate: string;      // ISO date
  maturityDate: string;   // ISO date

  // Chỉ cho tiết kiệm tích lũy
  accumulate?: AccumulateInfo;

  pointTracking: PointTracking;
}

// ─────────────────────────────────────────────────────────────
// Inventory
// ─────────────────────────────────────────────────────────────

export type InventoryItemType =
  | 'voucher'
  | 'pet_accessory'
  | 'badge'
  | 'booster'
  | 'utility_ticket'
  | 'blind_bag_item';

export interface InventoryItem {
  instanceId: string;       // unique per item instance (UUID)
  type: InventoryItemType;
  itemId?: string;          // cho accessory, badge, booster, ticket
  value?: number;           // cho voucher (số tiền VND)
  expiresAt?: string;       // ISO timestamp — cho voucher
  source?: string;          // milestoneId hoặc 'blind_bag'
  receivedAt: string;       // ISO timestamp
}

// ─────────────────────────────────────────────────────────────
// Notification
// ─────────────────────────────────────────────────────────────

export type NotificationType = 'milestone_reached' | 'lock_cycle' | 'maturity' | 'violation' | 'round_complete';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: string;  // ISO timestamp
  read: boolean;
}

// ─────────────────────────────────────────────────────────────
// User (root object)
// ─────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;     // Ăn uống, Giải trí, Mua sắm, Di chuyển, Thu nhập, Tiết kiệm
  description: string;
  date: string;         // YYYY-MM-DD
  bank: string;         // Cake, Techcombank, Vietcombank,...
}

export interface User {
  userId: string;
  displayName: string;
  petState: PetState;
  journey: Journey;
  savingsBooks: SavingsBook[];
  inventory: InventoryItem[];
  notifications: Notification[];

  // Chatbot Gato AI
  geminiApiKey: string | null;
  currentScenarioId: string;
  externalBankLinked: boolean;
  chatHistory: ChatMessage[];
  transactions: Transaction[];
  externalTransactions: Transaction[];
}
