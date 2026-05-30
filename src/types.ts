/**
 * Types and interfaces for the INNOVEST CAPITAL yield investment ledger engine files.
 */

export interface User {
  id: string;
  name: string;
  phone: string;
  balance: number; // Statement value in UGX
  totalInvested: number; // Deployed capital value in UGX
  totalEarnings: number; // Collected yielding returns in UGX
  referralBonus: number; // Received affiliate payouts in UGX
  referralCode: string; // The user's own invite sequence
  referredBy: string | null; // Sponsor ref code of the user who invited them
  verifiedStatus: string; // "Verified Secure"
  password?: string; // Optional security password
  role?: 'admin' | 'user'; // Optional account role
}

export interface Investment {
  id: string;
  userId: string;
  planType: 'Starter' | 'Growth' | 'Premium' | 'Elite';
  principal: number;
  dailyPay: number;
  daysRemaining: number;
  totalDays: number;
  earningsEarned: number;
  status: 'active' | 'completed';
  activatedAt: string;
}

export type TransactionType = 'Deposit' | 'Withdrawal' | 'Investment' | 'Yield_Payout' | 'Ref_Bonus';
export type TransactionStatus = 'Approved' | 'Pending' | 'Declined';

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  adminPhone: string;
}

export interface AdminNotification {
  id: string;
  type: 'deposit_submitted' | 'withdrawal_submitted' | 'invite_active';
  message: string;
  amount: number;
  userPhone: string;
  userName: string;
  timestamp: string;
  read: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  details: string;
  timestamp: string;
  txId?: string; // Mobile money MTN / Airtel validation reference
  fee?: number; // Calculated withdrawal fee
  netAmount?: number; // Total net amount payout
}

export interface SystemStats {
  totalPaidOut: number;
  activeInvestors: number;
  totalROI: string;
  support: string;
}

export interface YieldPlan {
  type: 'Starter' | 'Growth' | 'Premium' | 'Elite';
  price: number;
  daily: number;
  totalDays: number;
  icon: string;
}

export interface AppState {
  currentUser: User | null;
  users: Record<string, User>; // Index by telephone line
  investments: Investment[];
  transactions: Transaction[];
  systemStats: SystemStats;
  currentPage: string;
  activeModal: string | null;
  plans?: YieldPlan[];
  auditLogs?: AuditLog[];
  withdrawalFeePercent?: number;
  adminNotifications?: AdminNotification[];
  autoRefresh?: boolean;
}

export const DEFAULT_PLANS: YieldPlan[] = [
  { type: 'Starter', price: 20000, daily: 2000, totalDays: 72, icon: '🌱' },
  { type: 'Growth', price: 50000, daily: 5000, totalDays: 72, icon: '🌿' },
  { type: 'Premium', price: 100000, daily: 10000, totalDays: 72, icon: '🚀' }, // Note 100000 originally, we can keep it standard
  { type: 'Elite', price: 500000, daily: 50000, totalDays: 72, icon: '👑' }
];
