import { AppState, User, Investment, Transaction, AuditLog, AdminNotification } from './types';

export const STORAGE_KEY = 'innovest_capital_state_v1';

export function generateUID(prefix: string): string {
  return `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;
}

export function getRawDefaultState(): AppState {
  return {
    currentUser: null,
    users: {},
    investments: [],
    transactions: [],
    systemStats: {
      totalPaidOut: 2145890000,
      activeInvestors: 5412,
      totalROI: '720%',
      support: '24/7 Live'
    },
    currentPage: 'home',
    activeModal: null,
    auditLogs: [
      {
        id: 'log_seed_1',
        action: 'SYSTEM_BOOT',
        details: 'INNOVEST CAPITAL Yield Engine Core Booted. Default variables loaded securely.',
        timestamp: new Date().toLocaleString(),
        adminPhone: 'SATELLITE_DAEMON'
      }
    ],
    withdrawalFeePercent: 5,
    adminNotifications: [
      {
        id: 'notif_seed_1',
        type: 'deposit_submitted',
        message: 'Security audits protocol established. Welcome Admin!',
        amount: 0,
        userPhone: 'SYSTEM',
        userName: 'System Daemon',
        timestamp: new Date().toLocaleString(),
        read: false
      }
    ],
    autoRefresh: true
  };
}

export function seedDemoAccount(baseState: AppState): AppState {
  const adminPhone1 = '0747662133';
  const adminPhone2 = '0749508233';
  
  // Skip seeding if both admins already exist in the database
  if (baseState.users[adminPhone1] && baseState.users[adminPhone2]) {
    return baseState;
  }

  const adminUser1: User = {
    id: 'usr_admin',
    name: 'Admin Auditor [innovestcapital]',
    phone: adminPhone1,
    balance: 0,
    totalInvested: 0,
    totalEarnings: 0,
    referralBonus: 0,
    referralCode: 'INV-ADMIN',
    referredBy: null,
    verifiedStatus: 'System Overseer Active',
    password: 'Ug2530050',
    role: 'admin'
  };

  const adminUser2: User = {
    id: 'usr_admin2',
    name: 'System Admin [innovest]',
    phone: adminPhone2,
    balance: 0,
    totalInvested: 0,
    totalEarnings: 0,
    referralBonus: 0,
    referralCode: 'INV-ADMIN2',
    referredBy: null,
    verifiedStatus: 'System Overseer Active',
    password: 'Ug2530050',
    role: 'admin'
  };

  const user1Phone = '0781234567';
  const user1: User = {
    id: 'usr_grace',
    name: 'Namubiru Grace',
    phone: user1Phone,
    balance: 0,
    totalInvested: 0,
    totalEarnings: 0,
    referralBonus: 0,
    referralCode: 'INV-GRACE',
    referredBy: null,
    verifiedStatus: 'Verified Secure',
    password: 'password123',
    role: 'user'
  };

  const user2Phone = '0787654321';
  const user2: User = {
    id: 'usr_julius',
    name: 'Kato Julius',
    phone: user2Phone,
    balance: 45000,
    totalInvested: 20000,
    totalEarnings: 2000,
    referralBonus: 0,
    referralCode: 'INV-KATO',
    referredBy: null,
    verifiedStatus: 'Verified Secure',
    password: 'password123',
    role: 'user'
  };

  const pendingTx1: Transaction = {
    id: 'tx_pending_dep1',
    userId: 'usr_grace',
    type: 'Deposit',
    amount: 100000,
    status: 'Pending',
    details: 'Airtel Money transfer ticket #TXN812903',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    txId: 'ART99381'
  };

  const pendingTx2: Transaction = {
    id: 'tx_pending_wit1',
    userId: 'usr_julius',
    type: 'Withdrawal',
    amount: 25000,
    status: 'Pending',
    details: 'MTN Mobile Money liquidation transfer to 0787654321',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  };

  const updatedUsers = { 
    ...baseState.users, 
    [adminPhone1]: adminUser1,
    [adminPhone2]: adminUser2,
    [user1Phone]: user1,
    [user2Phone]: user2
  };
  
  return {
    ...baseState,
    users: updatedUsers,
    investments: [],
    transactions: [pendingTx1, pendingTx2],
    currentUser: null
  };
}

export function loadStateFromStorage(): AppState {
  if (typeof window === 'undefined') {
    return getRawDefaultState();
  }
  
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Ensure we seed demo accounts if user hash is empty
      if (!parsed.users || Object.keys(parsed.users).length === 0) {
        return seedDemoAccount(parsed);
      }
      return parsed;
    } catch {
      return seedDemoAccount(getRawDefaultState());
    }
  }
  return seedDemoAccount(getRawDefaultState());
}

export function saveStateToStorage(state: AppState): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}
