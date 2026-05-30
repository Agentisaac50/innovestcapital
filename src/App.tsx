import React, { useState, useEffect } from 'react';
import { 
  loadStateFromStorage, saveStateToStorage, seedDemoAccount, 
  getRawDefaultState, generateUID 
} from './ledgerEngine';
import { AppState, User, Investment, Transaction, TransactionType, YieldPlan, DEFAULT_PLANS, AdminNotification, AuditLog } from './types';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Modals from './components/Modals';
import LandingView from './components/LandingView';
import DashboardView from './components/DashboardView';
import AdminDashboardView from './components/AdminDashboardView';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import SimulatorPanel from './components/SimulatorPanel';
import TransactionReceiptModal from './components/TransactionReceiptModal';
import { MessageSquare, Users, X, Info, ExternalLink, ShieldCheck, Heart } from 'lucide-react';

export function getInviteStats(userId: string, users: Record<string, User>, investments: Investment[]) {
  const user = Object.values(users).find(u => u.id === userId);
  if (!user) return { totalInvited: 0, withActiveInvestments: 0, invitees: [] };

  const invitees = Object.values(users).filter(u => u.referredBy === user.referralCode);
  const totalInvited = invitees.length;
  
  // Find which ones have made at least one investment inside our investments database array
  const investUserIds = new Set(investments.map(inv => inv.userId));
  const inviteesWithInvestments = invitees.filter(u => investUserIds.has(u.id));
  const withActiveInvestments = inviteesWithInvestments.length;

  return {
    totalInvited,
    withActiveInvestments,
    invitees: invitees.map(u => ({
      name: u.name,
      phone: u.phone,
      hasInvested: investUserIds.has(u.id),
      verifiedStatus: u.verifiedStatus
    }))
  };
}

export default function App() {
  // Master application State
  const [state, setState] = useState<AppState>(loadStateFromStorage);
  
  // Recent Transaction Receipt State for visual summary modals
  const [recentTxReceipt, setRecentTxReceipt] = useState<Transaction | null>(null);
  
  // Toast notifications State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Ref URL Parameter State
  const [presetRefCode, setPresetRefCode] = useState('');

  // Floating WhatsApp Tooltip Menu State
  const [showWhatsAppTooltip, setShowWhatsAppTooltip] = useState(false);

  // Sidebar visibility state for mobile controls
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Synchronise state to LocalStorage
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  // Read URL params on load to detect Invite Code
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        const code = ref.trim().toUpperCase();
        setPresetRefCode(code);
        setState(prev => ({
          ...prev,
          currentPage: 'register'
        }));
        triggerToast(`Referral sponsor code ${code} detected from invitation!`, 'success');
      }
    }
  }, []);

  // Toast helper wrapper
  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  // Navigational controller
  const handleNavigate = (page: string) => {
    setState(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  // 1. Authentication Routines
  const handleLogin = (phone: string, secret: string) => {
    const formatted = phone.trim();
    const mockUsers = { ...state.users };
    
    let user = mockUsers[formatted];
    
    if (!user) {
      // Dynamic on-the-fly registration for testing
      const autoName = 'Investor ' + formatted.slice(-4);
      const isSystemAdmin = formatted === '0747662133' || formatted === '0749508233';
      const startingBalance = isSystemAdmin ? 0 : 5000;
      user = {
        id: `usr_${Date.now()}`,
        name: isSystemAdmin ? 'System Admin [innovest]' : autoName,
        phone: formatted,
        balance: startingBalance,
        totalInvested: 0,
        totalEarnings: 0,
        referralBonus: 0,
        referralCode: generateUID('INV'),
        referredBy: null,
        verifiedStatus: isSystemAdmin ? 'System Overseer Active' : 'Verified Secure',
        role: isSystemAdmin ? 'admin' : 'user',
        password: secret // Allow saving password on dynamic creation
      };

      mockUsers[formatted] = user;
      
      const transactionsWithBonus = [...state.transactions];
      if (!isSystemAdmin) {
        transactionsWithBonus.push({
          id: `tx_welcome_${user.id}`,
          userId: user.id,
          userName: user.name,
          type: 'Deposit',
          amount: 5000,
          status: 'Approved',
          phone: formatted,
          timestamp: new Date().toLocaleString(),
          paymentId: 'SYSTEM_SIGNUP_WELCOME_GIFT',
          channel: 'Promo Register Gift'
        });
      }
      
      setState(prev => ({
        ...prev,
        users: mockUsers,
        transactions: transactionsWithBonus,
        currentUser: user,
        currentPage: 'dashboard'
      }));

      return { 
        success: true, 
        message: isSystemAdmin ? `Welcome Authorized Admin!` : `Welcome ${user.name}! Profile preloaded with UGX 5,000 Signup Welcome Bonus!` 
      };
    } else {
      // Direct pass verification
      if (user.password && user.password !== secret) {
        return { success: false, message: 'Invalid password. Credentials mismatch.' };
      }
      
      setState(prev => ({
        ...prev,
        currentUser: user,
        currentPage: 'dashboard'
      }));

      return { success: true, message: `Welcome back, ${user.name}!` };
    }
  };

  const handleRegister = (name: string, phone: string, secret: string, referralCode?: string) => {
    const formatted = phone.trim();
    if (state.users[formatted]) {
      return { success: false, message: 'A client profile with this mobile number already exists.' };
    }

    let sponsorCode: string | null = null;
    if (referralCode) {
      const code = referralCode.trim().toUpperCase();
      const possibleSponsor = (Object.values(state.users) as User[]).find(u => u.referralCode === code);
      if (possibleSponsor) {
        sponsorCode = code;
      }
    }

    const isSystemAdmin = formatted === '0747662133' || formatted === '0749508233';
    const startingBalance = isSystemAdmin ? 0 : 5000;
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: name.trim() || ('Investor ' + formatted.slice(-4)),
      phone: formatted,
      balance: startingBalance,
      totalInvested: 0,
      totalEarnings: 0,
      referralBonus: 0,
      referralCode: generateUID('INV'),
      referredBy: sponsorCode,
      verifiedStatus: 'Verified Secure',
      password: secret,
      role: isSystemAdmin ? 'admin' : 'user'
    };

    const updatedUsers = { ...state.users, [formatted]: newUser };
    const transactionsWithBonus = [...state.transactions];
    if (!isSystemAdmin) {
      transactionsWithBonus.push({
        id: `tx_welcome_${newUser.id}`,
        userId: newUser.id,
        userName: newUser.name,
        type: 'Deposit',
        amount: 5000,
        status: 'Approved',
        phone: formatted,
        timestamp: new Date().toLocaleString(),
        paymentId: 'SYSTEM_SIGNUP_WELCOME_GIFT',
        channel: 'Promo Register Gift'
      });
    }

    setState(prev => ({
      ...prev,
      users: updatedUsers,
      transactions: transactionsWithBonus,
      currentUser: newUser,
      currentPage: 'dashboard'
    }));

    return { 
      success: true, 
      message: isSystemAdmin ? `Authorized Admin registered successfully.` : `Profile created! Reward of UGX 5,000 Welcome Bonus has been credited to your available balance!` 
    };
  };

  const handleLogout = () => {
    setState(prev => ({
      ...prev,
      currentUser: null,
      currentPage: 'home'
    }));
    triggerToast('Secure session logged out.', 'success');
  };

  const handleToggleAutoRefresh = () => {
    setState(prev => {
      const nextVal = !prev.autoRefresh;
      const newLog = {
        id: `audit_${Date.now()}`,
        action: 'AUTO_REFRESH_TOGGLE',
        details: `Simulation background auto-refresh was toggled to ${nextVal ? 'ENABLED' : 'PAUSED'}.`,
        timestamp: new Date().toLocaleString(),
        adminPhone: prev.currentUser?.phone || 'SYSTEM_DAEMON'
      };
      
      return {
        ...prev,
        autoRefresh: nextVal,
        auditLogs: [newLog, ...(prev.auditLogs || [])]
      };
    });
    triggerToast(`Simulation background auto-refresh is now ${!state.autoRefresh ? 'ACTIVE' : 'PAUSED'}.`, 'success');
  };

  useEffect(() => {
    if (!state.autoRefresh) return;

    // Checks every 15s to simulate global volume mutations
    const interval = setInterval(() => {
      const roll = Math.random();
      if (roll < 0.45) {
        setState(prev => ({
          ...prev,
          systemStats: {
            ...prev.systemStats,
            totalPaidOut: prev.systemStats.totalPaidOut + Math.floor(Math.random() * 3200 + 500)
          }
        }));
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [state.autoRefresh]);

  // 2. Ledger Modal Controls
  const handleOpenModal = (modalId: 'deposit' | 'invest' | 'withdraw') => {
    if (!state.currentUser) {
      triggerToast('Please sign in to access capital ledger transactions.', 'error');
      setState(prev => ({ ...prev, currentPage: 'login' }));
      return;
    }
    setState(prev => ({
      ...prev,
      activeModal: modalId
    }));
  };

  const handleCloseModal = () => {
    setState(prev => ({
      ...prev,
      activeModal: null
    }));
  };

  // 3. Transactions & Investment Cycle routines
  const handleDepositSubmit = (amount: number, txId: string) => {
    if (!state.currentUser) return;

    const newTx: Transaction = {
      id: `tx_${Date.now()}_dep`,
      userId: state.currentUser.id,
      type: 'Deposit',
      amount,
      status: 'Pending',
      details: 'Mobile Money Gateway validation ticket',
      timestamp: new Date().toISOString(),
      txId: txId.trim().toUpperCase()
    };

    const newNotification: AdminNotification = {
      id: `notif_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'deposit_submitted',
      message: `${state.currentUser.name} submitted a new deposit ticket for UGX ${amount.toLocaleString()}. Ref: ${txId}`,
      amount,
      userPhone: state.currentUser.phone,
      userName: state.currentUser.name,
      timestamp: new Date().toLocaleString(),
      read: false
    };

    setState(prev => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
      adminNotifications: [newNotification, ...(prev.adminNotifications || [])]
    }));

    // Trigger premium visual confirmation receipt modal
    setRecentTxReceipt(newTx);
  };

  const handleWithdrawSubmit = (amount: number, phone: string) => {
    if (!state.currentUser) return;

    // Invitation validation for Welcome Bonus
    const stats = getInviteStats(state.currentUser.id, state.users, state.investments);
    const hasUnlockedBonus = stats.withActiveInvestments >= 5;
    const withdrawable = hasUnlockedBonus ? state.currentUser.balance : Math.max(0, state.currentUser.balance - 5000);

    if (withdrawable < amount) {
      if (!hasUnlockedBonus && state.currentUser.balance >= amount) {
        triggerToast('Your UGX 5,000 Sign-up Welcome Bonus has been locked! You must enroll at least 5 referred users who deploy active yield contracts to unlock it.', 'error');
      } else {
        triggerToast('Insufficient withdrawable funds in statement balance.', 'error');
      }
      return;
    }

    const currentPhone = state.currentUser.phone;
    const workingUser = { ...state.currentUser };
    workingUser.balance -= amount;

    const feePercent = state.withdrawalFeePercent !== undefined ? state.withdrawalFeePercent : 5;
    const computedFee = Math.floor(amount * (feePercent / 100));
    const computedNet = Math.max(0, amount - computedFee);

    const newTx: Transaction = {
      id: `tx_${Date.now()}_wit`,
      userId: state.currentUser.id,
      type: 'Withdrawal',
      amount,
      fee: computedFee,
      netAmount: computedNet,
      status: 'Pending',
      details: `Profit payout liquidation transferred to Telecom address: ${phone}. Surcharge: UGX ${computedFee.toLocaleString()} (${feePercent}%), Net: UGX ${computedNet.toLocaleString()}`,
      timestamp: new Date().toISOString()
    };

    const newNotification: AdminNotification = {
      id: `notif_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'withdrawal_submitted',
      message: `${state.currentUser.name} requested cash-out liquidation of UGX ${amount.toLocaleString()} to mobile number ${phone}`,
      amount,
      userPhone: state.currentUser.phone,
      userName: state.currentUser.name,
      timestamp: new Date().toLocaleString(),
      read: false
    };

    const updatedUsers = { ...state.users, [currentPhone]: workingUser };

    setState(prev => ({
      ...prev,
      users: updatedUsers,
      currentUser: workingUser,
      transactions: [newTx, ...prev.transactions],
      adminNotifications: [newNotification, ...(prev.adminNotifications || [])]
    }));

    // Trigger premium visual confirmation receipt modal
    setRecentTxReceipt(newTx);
  };

  const handleInvestSubmit = (planType: 'Starter' | 'Growth' | 'Premium' | 'Elite') => {
    if (!state.currentUser) return;

    const currentPlans = state.plans || DEFAULT_PLANS;
    const plan = currentPlans.find(p => p.type === planType) || { price: 20000, daily: 2000, totalDays: 72 };

    const principal = plan.price;
    const dailyPay = plan.daily;
    const totalDays = plan.totalDays;

    if (state.currentUser.balance < principal) {
      triggerToast(`Insufficient balance. Reroute to Fund Wallet. Need UGX ${principal.toLocaleString()}`, 'error');
      return;
    }

    // Deduct principal
    const currentPhone = state.currentUser.phone;
    const workingUser = { ...state.currentUser };
    workingUser.balance -= principal;
    workingUser.totalInvested += principal;

    const updatedUsers = { ...state.users, [currentPhone]: workingUser };

    // Set new package contract
    const newInvestment: Investment = {
      id: `inv_${Date.now()}`,
      userId: state.currentUser.id,
      planType,
      principal,
      dailyPay,
      daysRemaining: totalDays,
      totalDays: totalDays,
      earningsEarned: 0,
      status: 'active',
      activatedAt: new Date().toISOString()
    };

    const newTx: Transaction = {
      id: `tx_${Date.now()}_inv`,
      userId: state.currentUser.id,
      type: 'Investment',
      amount: principal,
      status: 'Approved',
      details: `Activated brand new ${planType} plan cycle`,
      timestamp: new Date().toISOString()
    };

    const updatedInvestments = [newInvestment, ...state.investments];
    const updatedTransactions = [newTx, ...state.transactions];

    // Referral distribution rules: 10% cash payout
    if (workingUser.referredBy) {
      const code = workingUser.referredBy;
      const sponsor = (Object.values(updatedUsers) as User[]).find(u => u.referralCode === code);
      if (sponsor) {
        const bonus = Math.floor(principal * 0.10);
        sponsor.balance += bonus;
        sponsor.referralBonus += bonus;
        updatedUsers[sponsor.phone] = { ...sponsor };

        const refTx: Transaction = {
          id: `tx_${Date.now()}_refbonus`,
          userId: sponsor.id,
          type: 'Ref_Bonus',
          amount: bonus,
          status: 'Approved',
          details: `10% Instant Affiliate Bounty via sponsor activation (${planType})`,
          timestamp: new Date().toISOString()
        };
        updatedTransactions.unshift(refTx);
      }
    }

    setState(prev => ({
      ...prev,
      users: updatedUsers,
      currentUser: workingUser,
      investments: updatedInvestments,
      transactions: updatedTransactions,
      activeModal: null
    }));

    triggerToast(`Congratulations! Activated ${planType} cycle tier. Yields began accumulating.`, 'success');
  };

  // 4. SANDBOX DEV SIMULATORS CORES
  const handleAdvanceDay = () => {
    let totalPaidOutThisAdvance = 0;
    const newTxBlocks: Transaction[] = [];
    const workingUsers = { ...state.users };

    const updatedInvestments = state.investments.map(inv => {
      if (inv.status === 'active' && inv.daysRemaining > 0) {
        const remaining = inv.daysRemaining - 1;
        const totalEarningsAccrued = inv.earningsEarned + inv.dailyPay;
        totalPaidOutThisAdvance += inv.dailyPay;

        const yieldTx: Transaction = {
          id: `tx_${Date.now()}_yield_${inv.id}_${remaining}`,
          userId: inv.userId,
          type: 'Yield_Payout',
          amount: inv.dailyPay,
          status: 'Approved',
          details: `Daily 10% ROI payout installment for ${inv.planType} contract`,
          timestamp: new Date().toISOString()
        };

        newTxBlocks.push(yieldTx);

        // Find corresponding user & credit cash balance
        const targetUser = (Object.values(workingUsers) as User[]).find(u => u.id === inv.userId);
        if (targetUser) {
          targetUser.balance += inv.dailyPay;
          targetUser.totalEarnings += inv.dailyPay;
          workingUsers[targetUser.phone] = { ...targetUser };
        }

        return {
          ...inv,
          daysRemaining: remaining,
          earningsEarned: totalEarningsAccrued,
          status: remaining === 0 ? 'completed' as const : 'active' as const
        };
      }
      return inv;
    });

    // Merge transactions
    const combinedTransactions = [...newTxBlocks, ...state.transactions];

    // Sync logged in context user if exists
    let syncedCurrentUser = state.currentUser;
    if (syncedCurrentUser) {
      syncedCurrentUser = workingUsers[syncedCurrentUser.phone];
    }

    setState(prev => ({
      ...prev,
      users: workingUsers,
      currentUser: syncedCurrentUser,
      investments: updatedInvestments,
      transactions: combinedTransactions,
      systemStats: {
        ...prev.systemStats,
        totalPaidOut: prev.systemStats.totalPaidOut + totalPaidOutThisAdvance
      }
    }));

    triggerToast(`🌅 Time accelerated 24 hours. Distributed UGX ${totalPaidOutThisAdvance.toLocaleString()} yield credits into client statement portfolios!`, 'success');
  };

  const handleSimulateReferral = () => {
    if (!state.currentUser) {
      triggerToast('Authenticate or log in first to activate affiliate sponsor simulations.', 'error');
      setState(prev => ({ ...prev, currentPage: 'login' }));
      return;
    }

    const NAMES = ['Kizza Edward', 'Namubiru Grace', 'Kato Julius', 'Okot Moses', 'Atwine Sarah', 'Agaba Phiona'];
    const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];
    const randomPhone = '078' + Math.floor(1000000 + Math.random() * 9000000);
    const referralCode = state.currentUser.referralCode;

    const mockInviteUser: User = {
      id: `usr_sim_${Date.now()}`,
      name: randomName,
      phone: randomPhone,
      balance: 100000,
      totalInvested: 100000,
      totalEarnings: 0,
      referralBonus: 0,
      referralCode: generateUID('INV'),
      referredBy: referralCode,
      verifiedStatus: 'Verified Secure'
    };

    const mockInviteInvestment: Investment = {
      id: `inv_sim_${Date.now()}`,
      userId: mockInviteUser.id,
      planType: 'Premium',
      principal: 100000,
      dailyPay: 10000,
      daysRemaining: 72,
      totalDays: 72,
      earningsEarned: 0,
      status: 'active',
      activatedAt: new Date().toISOString()
    };

    const mockDepositTx: Transaction = {
      id: `tx_${Date.now()}_sim_dep`,
      userId: mockInviteUser.id,
      type: 'Deposit',
      amount: 100000,
      status: 'Approved',
      details: 'Deposit validation via Telecom Mobile Money',
      timestamp: new Date().toISOString()
    };

    // Credit direct cash referral bounty (10% of premium contract)
    const activePhone = state.currentUser.phone;
    const workingUsers = { ...state.users };
    const workingUser = { ...state.currentUser };

    const affiliateBounty = 10000; // 10% of 100,000 UGX
    workingUser.balance += affiliateBounty;
    workingUser.referralBonus += affiliateBounty;

    workingUsers[activePhone] = workingUser;
    workingUsers[randomPhone] = mockInviteUser;

    const sponsorBountyTx: Transaction = {
      id: `tx_${Date.now()}_sim_bonus`,
      userId: state.currentUser.id,
      type: 'Ref_Bonus',
      amount: affiliateBounty,
      status: 'Approved',
      details: `10% Sponsor bounty on client (${randomName}) joining active nodes`,
      timestamp: new Date().toISOString()
    };

    const updatedTransactions = [sponsorBountyTx, mockDepositTx, ...state.transactions];
    const updatedInvestments = [mockInviteInvestment, ...state.investments];

    setState(prev => ({
      ...prev,
      users: workingUsers,
      currentUser: workingUser,
      investments: updatedInvestments,
      transactions: updatedTransactions,
      systemStats: {
        ...prev.systemStats,
        activeInvestors: prev.systemStats.activeInvestors + 1
      }
    }));

    triggerToast(`👥 Simulated client joined! ${randomName} verified. Deployed UGX 10,000 credit bounty onto your statements balance!`, 'success');
  };

  const logAdminAction = (action: string, details: string) => {
    const adminPhone = state.currentUser?.phone || 'SYSTEM_DAEMON';
    const newLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      action,
      details,
      timestamp: new Date().toLocaleString(),
      adminPhone
    };
    setState(prev => ({
      ...prev,
      auditLogs: [newLog, ...(prev.auditLogs || [])]
    }));
  };

  const handleApproveAllDeposits = () => {
    const workingUsers = { ...state.users };
    let approvedCount = 0;
    
    const updatedTransactions = state.transactions.map(tx => {
      if (tx.status === 'Pending' && tx.type === 'Deposit') {
        const matchingClient = (Object.values(workingUsers) as User[]).find(u => u.id === tx.userId);
        if (matchingClient) {
          matchingClient.balance += tx.amount;
          workingUsers[matchingClient.phone] = { ...matchingClient };
          approvedCount++;
        }
        return { ...tx, status: 'Approved' as const };
      }
      return tx;
    });

    let syncedCurrentUser = state.currentUser;
    if (syncedCurrentUser) {
      syncedCurrentUser = workingUsers[syncedCurrentUser.phone];
    }

    setState(prev => ({
      ...prev,
      users: workingUsers,
      currentUser: syncedCurrentUser,
      transactions: updatedTransactions
    }));

    logAdminAction('MASS_APPROVE_DEPOSITS', `Approved ${approvedCount} outstanding client deposits systematically.`);
    triggerToast(`Approved ${approvedCount} outstanding client deposits systematically.`, 'success');
  };

  const handleRejectAllDeposits = () => {
    let rejectedCount = 0;
    const updatedTransactions = state.transactions.map(tx => {
      if (tx.status === 'Pending' && tx.type === 'Deposit') {
        rejectedCount++;
        return { ...tx, status: 'Declined' as const };
      }
      return tx;
    });

    setState(prev => ({
      ...prev,
      transactions: updatedTransactions
    }));

    logAdminAction('MASS_REJECT_DEPOSITS', `Declined all ${rejectedCount} pending client deposits.`);
    triggerToast(`Declined ${rejectedCount} pending deposits.`, 'error');
  };

  const handleApproveAllWithdrawals = () => {
    let approvedCount = 0;
    const updatedTransactions = state.transactions.map(tx => {
      if (tx.status === 'Pending' && tx.type === 'Withdrawal') {
        approvedCount++;
        return { ...tx, status: 'Approved' as const };
      }
      return tx;
    });

    setState(prev => ({
      ...prev,
      transactions: updatedTransactions
    }));

    logAdminAction('MASS_APPROVE_WITHDRAWALS', `Approved all ${approvedCount} pending client payout liquidations.`);
    triggerToast(`Approved ${approvedCount} pending payouts successfully.`, 'success');
  };

  const handleRejectAllWithdrawals = () => {
    const workingUsers = { ...state.users };
    let rejectedCount = 0;

    const updatedTransactions = state.transactions.map(tx => {
      if (tx.status === 'Pending' && tx.type === 'Withdrawal') {
        // Refund cashing out amount back to states
        const matchingClient = (Object.values(workingUsers) as User[]).find(u => u.id === tx.userId);
        if (matchingClient) {
          matchingClient.balance += tx.amount;
          workingUsers[matchingClient.phone] = { ...matchingClient };
          rejectedCount++;
        }
        return { ...tx, status: 'Declined' as const };
      }
      return tx;
    });

    let syncedCurrentUser = state.currentUser;
    if (syncedCurrentUser) {
      syncedCurrentUser = workingUsers[syncedCurrentUser.phone];
    }

    setState(prev => ({
      ...prev,
      users: workingUsers,
      currentUser: syncedCurrentUser,
      transactions: updatedTransactions
    }));

    logAdminAction('MASS_REJECT_WITHDRAWALS', `Declined all ${rejectedCount} pending client payout liquidations with full wallet refunds.`);
    triggerToast(`Declined ${rejectedCount} pending payouts. Statements refunded safely.`, 'error');
  };

  const handleApproveSingleTx = (txId: string) => {
    const workingUsers = { ...state.users };
    let msg = '';
    const oldTx = state.transactions.find(t => t.id === txId);

    const updatedTransactions = state.transactions.map(tx => {
      if (tx.id === txId && tx.status === 'Pending') {
        if (tx.type === 'Deposit') {
          const matchingClient = (Object.values(workingUsers) as User[]).find(u => u.id === tx.userId);
          if (matchingClient) {
            matchingClient.balance += tx.amount;
            workingUsers[matchingClient.phone] = { ...matchingClient };
          }
          msg = `Approved deposit of UGX ${tx.amount.toLocaleString()}.`;
        } else {
          msg = `Approved payout of UGX ${tx.amount.toLocaleString()}.`;
        }
        return { ...tx, status: 'Approved' as const };
      }
      return tx;
    });

    let syncedCurrentUser = state.currentUser;
    if (syncedCurrentUser) {
      syncedCurrentUser = workingUsers[syncedCurrentUser.phone];
    }

    setState(prev => ({
      ...prev,
      users: workingUsers,
      currentUser: syncedCurrentUser,
      transactions: updatedTransactions
    }));

    if (oldTx) {
      logAdminAction(`SINGLE_APPROVE_${oldTx.type.toUpperCase()}`, `Approved pending ${oldTx.type.toLowerCase()} trans-ID: ${txId} for User ID: ${oldTx.userId}. Amount: UGX ${oldTx.amount.toLocaleString()}.`);
    }

    if (msg) triggerToast(msg, 'success');
  };

  const handleRejectSingleTx = (txId: string) => {
    const workingUsers = { ...state.users };
    let msg = '';
    const oldTx = state.transactions.find(t => t.id === txId);

    const updatedTransactions = state.transactions.map(tx => {
      if (tx.id === txId && tx.status === 'Pending') {
        if (tx.type === 'Withdrawal') {
          const matchingClient = (Object.values(workingUsers) as User[]).find(u => u.id === tx.userId);
          if (matchingClient) {
            matchingClient.balance += tx.amount;
            workingUsers[matchingClient.phone] = { ...matchingClient };
          }
          msg = `Declined payout. Refunded UGX ${tx.amount.toLocaleString()}.`;
        } else {
          msg = `Declined deposit of UGX ${tx.amount.toLocaleString()}.`;
        }
        return { ...tx, status: 'Declined' as const };
      }
      return tx;
    });

    let syncedCurrentUser = state.currentUser;
    if (syncedCurrentUser) {
      syncedCurrentUser = workingUsers[syncedCurrentUser.phone];
    }

    setState(prev => ({
      ...prev,
      users: workingUsers,
      currentUser: syncedCurrentUser,
      transactions: updatedTransactions
    }));

    if (oldTx) {
      logAdminAction(`SINGLE_REJECT_${oldTx.type.toUpperCase()}`, `Declined pending ${oldTx.type.toLowerCase()} trans-ID: ${txId} for User ID: ${oldTx.userId}. Amount: UGX ${oldTx.amount.toLocaleString()}.`);
    }

    if (msg) triggerToast(msg, 'error');
  };

  const handleAdminUpdateUser = (phone: string, updatedFields: Partial<User>) => {
    const workingUsers = { ...state.users };
    if (!workingUsers[phone]) return;
    workingUsers[phone] = {
      ...workingUsers[phone],
      ...updatedFields
    };
    
    let syncedCurrentUser = state.currentUser;
    if (syncedCurrentUser && syncedCurrentUser.phone === phone) {
      syncedCurrentUser = workingUsers[phone];
    }

    setState(prev => ({
      ...prev,
      users: workingUsers,
      currentUser: syncedCurrentUser
    }));
    
    logAdminAction('USER_UPDATE', `Modified account phone: ${phone}. Revised fields: ${Object.keys(updatedFields).join(', ')}.`);
    triggerToast(`Successfully modified details for account ${workingUsers[phone].name}.`, 'success');
  };

  const handleAdminCreditUser = (phone: string, amount: number, isCredit: boolean, txDetails?: string) => {
    const workingUsers = { ...state.users };
    if (!workingUsers[phone]) return;
    
    const user = { ...workingUsers[phone] };
    const change = isCredit ? amount : -amount;
    user.balance = Math.max(0, user.balance + change);
    workingUsers[phone] = user;

    // Create a transaction to log this credit/debit adjustment
    const customTx: Transaction = {
      id: `tx_${Date.now()}_admin_adj`,
      userId: user.id,
      type: isCredit ? 'Ref_Bonus' : 'Withdrawal',
      amount: amount,
      status: 'Approved',
      details: txDetails || (isCredit ? 'Administrative balance credit adjustment' : 'Administrative balance debit adjustment'),
      timestamp: new Date().toISOString(),
      txId: `AUDIT${Math.floor(Math.random() * 900000 + 100000)}`
    };

    let syncedCurrentUser = state.currentUser;
    if (syncedCurrentUser && syncedCurrentUser.phone === phone) {
      syncedCurrentUser = user;
    }

    setState(prev => ({
      ...prev,
      users: workingUsers,
      currentUser: syncedCurrentUser,
      transactions: [customTx, ...prev.transactions]
    }));

    logAdminAction(isCredit ? 'CREDIT_ADJUSTMENT' : 'DEBIT_ADJUSTMENT', `Adjusted balance for client phone: ${phone} by UGX ${amount.toLocaleString()}. Action: ${isCredit ? 'Credit' : 'Debit'}. details: ${txDetails || 'N/A'}`);
    triggerToast(`Successfully ${isCredit ? 'credited' : 'debited'} UGX ${amount.toLocaleString()} on ${user.name}'s balance.`, 'success');
  };

  const handleAdminUpdateInvestment = (id: string, updatedFields: Partial<Investment>) => {
    const updatedInvestments = state.investments.map(inv => {
      if (inv.id === id) {
        return { ...inv, ...updatedFields };
      }
      return inv;
    });

    setState(prev => ({
      ...prev,
      investments: updatedInvestments
    }));

    logAdminAction('CONTRACT_UPDATE', `Updated active contract ID: ${id}. Revised fields: ${Object.keys(updatedFields).join(', ')}.`);
    triggerToast(`Yield contract modified successfully.`, 'success');
  };

  const handleAdminDeleteInvestment = (id: string) => {
    const updatedInvestments = state.investments.filter(inv => inv.id !== id);
    setState(prev => ({
      ...prev,
      investments: updatedInvestments
    }));

    logAdminAction('CONTRACT_DISMOUNT', `Dismounted active contract ID: ${id} from the live platform registry.`);
    triggerToast(`Yield contract successfully dismounted from the system database.`, 'success');
  };

  const handleAdminAddInvestment = (userId: string, planType: 'Starter' | 'Growth' | 'Premium' | 'Elite', principal: number, days: number, dailyPay: number) => {
    const workingUsers = { ...state.users };
    const matchingClient = (Object.values(workingUsers) as User[]).find(u => u.id === userId);
    
    const newInv: Investment = {
      id: `inv_adm_${Date.now()}`,
      userId: userId,
      planType: planType,
      principal: principal,
      dailyPay: dailyPay,
      daysRemaining: days,
      totalDays: days,
      earningsEarned: 0,
      status: 'active',
      activatedAt: new Date().toISOString()
    };

    if (matchingClient) {
      matchingClient.totalInvested += principal;
      workingUsers[matchingClient.phone] = { ...matchingClient };
    }

    const tx: Transaction = {
      id: `tx_adm_inv_${Date.now()}`,
      userId: userId,
      type: 'Investment',
      amount: principal,
      status: 'Approved',
      details: `Admin deployment of ${planType} yield contract`,
      timestamp: new Date().toISOString()
    };

    let syncedCurrentUser = state.currentUser;
    if (syncedCurrentUser && matchingClient && syncedCurrentUser.phone === matchingClient.phone) {
      syncedCurrentUser = workingUsers[matchingClient.phone];
    }

    setState(prev => ({
      ...prev,
      users: workingUsers,
      currentUser: syncedCurrentUser,
      investments: [newInv, ...prev.investments],
      transactions: [tx, ...prev.transactions]
    }));

    logAdminAction('CONTRACT_DEPLOYMENT', `Admin deployed direct yield contract ${planType} with principal: UGX ${principal.toLocaleString()} for User ID: ${userId}.`);
    triggerToast(`Deployed active ${planType} yield contract systematically!`, 'success');
  };

  const handleAdminUpdateTransaction = (id: string, updatedFields: Partial<Transaction>) => {
    const updatedTransactions = state.transactions.map(tx => {
      if (tx.id === id) {
        return { ...tx, ...updatedFields } as Transaction;
      }
      return tx;
    });

    setState(prev => ({
      ...prev,
      transactions: updatedTransactions
    }));

    logAdminAction('TRANSACTION_ALTER', `Modified transaction ledger reference ID: ${id}. Updated fields: ${Object.keys(updatedFields).join(', ')}.`);
    triggerToast(`Transaction log updated successfully.`, 'success');
  };

  const handleUpdatePlans = (updatedPlans: YieldPlan[]) => {
    setState(prev => ({
      ...prev,
      plans: updatedPlans
    }));
    logAdminAction('PLAN_UPDATES_PUBLISHED', 'Authorized and published newly-configured packages tiers settings.');
    triggerToast('Yield investment packages configurations saved and published successfully!', 'success');
  };

  const handleUpdateFee = (feePercent: number) => {
    setState(prev => ({
      ...prev,
      withdrawalFeePercent: feePercent
    }));
    logAdminAction('WITHDRAWAL_FEE_CONFiGURED', `Re-adjusted global platform-wide withdrawal processing surcharge to ${feePercent}%.`);
    triggerToast(`Global withdrawal processing fee rate adjusted to ${feePercent}% successfully!`, 'success');
  };

  const handleFactoryReset = () => {
    if (window.confirm("Restore platform ledger database elements to pre-seeded defaults?")) {
      const freshDefault = seedDemoAccount(getRawDefaultState());
      setState(freshDefault);
      triggerToast("System memory reinitialized to default administrative configurations.", "success");
    }
  };

  if (state.currentPage === 'dashboard' && state.currentUser) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-[#020617] text-slate-200 font-sans selection:bg-emerald-500/30">
        
        {/* Backdrop for mobile menu drawer */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          />
        )}

        {/* Sidebar Navigation */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-800 bg-[#030712] flex flex-col transform transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Brand */}
          <div className="p-5 flex items-center justify-between border-b border-slate-800/45">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                <img 
                  src="https://www.image2url.com/r2/default/images/1780121168413-6fd6e8f8-cb8a-489b-8ec0-f0ee3a9ab2f5.jpg" 
                  alt="INNOVEST LOGO" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight text-white leading-none font-display">INNOVEST</h1>
                <p className="text-[9px] font-bold text-slate-500 tracking-[0.12em] uppercase mt-1">Capital Uganda</p>
              </div>
            </div>
            {/* Close button for mobile screen slider */}
            <button 
              className="lg:hidden text-slate-400 hover:text-white p-1.5 hover:bg-slate-800/40 rounded-lg cursor-pointer transition-colors" 
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 px-3 space-y-1.5 py-6">
            <button
              onClick={() => {
                setSidebarOpen(false);
                const el = document.getElementById('dashboard-overview');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full text-left flex items-center gap-3 px-4 py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl transition-all font-bold uppercase tracking-wider text-[10px] cursor-pointer"
            >
              <span className="text-sm shrink-0">⊞</span>
              <span>Overview Terminal</span>
            </button>

            {state.currentUser?.role !== 'admin' && (
              <>
                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    handleOpenModal('invest');
                  }}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800/40 hover:text-white rounded-xl transition-all font-bold uppercase tracking-wider text-[10px] bg-transparent border-none cursor-pointer"
                >
                  <span className="text-sm shrink-0">◈</span>
                  <span>Deploy Contract</span>
                </button>

                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    const el = document.getElementById('active-contracts');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800/40 hover:text-white rounded-xl transition-all font-bold uppercase tracking-wider text-[10px] bg-transparent border-none cursor-pointer"
                >
                  <span className="text-sm shrink-0">✨</span>
                  <span>Yield Contracts</span>
                </button>

                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    const el = document.getElementById('ledger-sheets');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800/40 hover:text-white rounded-xl transition-all font-bold uppercase tracking-wider text-[10px] bg-transparent border-none cursor-pointer"
                >
                  <span className="text-sm shrink-0">⇅</span>
                  <span>Ledger Logs</span>
                </button>

                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    const el = document.getElementById('referral-hub');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800/40 hover:text-white rounded-xl transition-all font-bold uppercase tracking-wider text-[10px] bg-transparent border-none cursor-pointer"
                >
                  <span className="text-sm shrink-0">👥</span>
                  <span>Affiliates Hub</span>
                </button>
              </>
            )}

            {state.currentUser?.role === 'admin' && (
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  const el = document.getElementById('sandbox-anchor');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full text-left flex items-center gap-3 px-4 py-3 text-amber-400/90 hover:bg-slate-800/45 hover:text-amber-300 rounded-xl transition-all font-bold uppercase tracking-wider text-[10px] bg-transparent border-none cursor-pointer"
              >
                <span className="text-sm shrink-0">⚙</span>
                <span>Sandbox Terminal</span>
              </button>
            )}
            
            <button
              onClick={() => {
                setSidebarOpen(false);
                handleNavigate('home');
              }}
              className="w-full text-left flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-800/30 hover:text-white rounded-xl transition-all font-bold uppercase tracking-wider text-[10px] bg-transparent border-none cursor-pointer"
            >
              <span className="text-sm shrink-0">🏠</span>
              <span>Exit Console Web</span>
            </button>
          </nav>

          {/* Account Security Footer details in Sidebar */}
          <div className="p-4 border-t border-slate-850/40 bg-[#020617]/20">
            <div className="bg-gradient-to-br from-slate-900 to-[#030712] border border-slate-800/80 rounded-2xl p-4">
              <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-black mb-1.5">MUTUAL SHIELD</p>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-200 font-bold uppercase tracking-tight text-ellipsis overflow-hidden truncate max-w-full">{state.currentUser?.name}</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-[9px] text-emerald-450 font-bold uppercase tracking-wider font-mono">PORTFOLIO GUARANTEED</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main View Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#020617] h-screen overflow-hidden">
          
          {/* Header Bar */}
          <header className="h-16 border-b border-slate-800 bg-[#030712]/60 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 shrink-0 z-30">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-400 hover:text-white p-1 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors border-none bg-transparent outline-none self-center"
              >
                <span className="text-xl">☰</span>
              </button>
              <h2 className="text-[10px] font-semibold text-slate-550 uppercase tracking-widest hidden sm:inline-block font-sans">PORTFOLIO CONSOLE</h2>
              <div className="h-4 w-px bg-slate-800 hidden sm:inline-block"></div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 font-mono text-[9px] font-bold tracking-wider uppercase animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                MTN/AIRTEL SECURE CHANNEL ESCROW ACTIVE
              </div>
            </div>
            
            <div className="flex items-center gap-4 md:gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest font-mono">STATEMENT WALLET</p>
                <p className="text-xs md:text-md font-bold text-emerald-400 font-mono tracking-tight">UGX {state.currentUser?.balance.toLocaleString()}</p>
              </div>
              
              <div className="h-8 w-px bg-slate-800 hidden sm:block" />

              <button 
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-850 text-[10px] uppercase font-bold text-slate-350 tracking-wide hover:text-white transition-all cursor-pointer select-none"
                title="Dismount console session"
              >
                <span>🔓</span>
                <span className="hidden sm:inline">Secure Logout</span>
              </button>
            </div>
          </header>

          {/* Dynamic Content Viewport */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-8 scroll-smooth pb-24">
            
            <div id="dashboard-overview">
              {state.currentUser?.role === 'admin' ? (
                <AdminDashboardView
                  users={state.users}
                  transactions={state.transactions}
                  investments={state.investments}
                  onApproveAllDeposits={handleApproveAllDeposits}
                  onRejectAllDeposits={handleRejectAllDeposits}
                  onApproveAllWithdrawals={handleApproveAllWithdrawals}
                  onRejectAllWithdrawals={handleRejectAllWithdrawals}
                  onApproveSingleTx={handleApproveSingleTx}
                  onRejectSingleTx={handleRejectSingleTx}
                  onAdvanceDay={handleAdvanceDay}
                  onSimulateReferral={handleSimulateReferral}
                  onFactoryReset={handleFactoryReset}
                  systemStats={state.systemStats}
                  onUpdateUser={handleAdminUpdateUser}
                  onCreditUser={handleAdminCreditUser}
                  onUpdateInvestment={handleAdminUpdateInvestment}
                  onDeleteInvestment={handleAdminDeleteInvestment}
                  onAddInvestment={handleAdminAddInvestment}
                  onUpdateTransaction={handleAdminUpdateTransaction}
                  plans={state.plans || DEFAULT_PLANS}
                  onUpdatePlans={handleUpdatePlans}
                  auditLogs={state.auditLogs}
                  withdrawalFeePercent={state.withdrawalFeePercent}
                  onUpdateFee={handleUpdateFee}
                  adminNotifications={state.adminNotifications}
                />
              ) : (
                <DashboardView
                  currentUser={state.currentUser}
                  investments={state.investments}
                  transactions={state.transactions}
                  onOpenModal={handleOpenModal}
                  inviteStats={getInviteStats(state.currentUser?.id || '', state.users, state.investments)}
                />
              )}
            </div>

          </div>

          {/* Ticker Footer */}
          <footer className="h-10 border-t border-slate-800 bg-[#030712] flex items-center px-4 md:px-8 justify-between shrink-0 font-sans z-30">
            <div className="flex items-center gap-4 md:gap-8 overflow-hidden select-none">
              <span className="text-[9px] text-slate-500 font-bold font-mono tracking-widest uppercase shrink-0 hidden md:inline-block">LIVE FEEDS:</span>
              <div className="flex items-center gap-1.5 shrink-0 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[9px] text-slate-400 font-mono uppercase tracking-tight">Node 077***523 cleared payout UGX 25,000</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 hidden sm:flex">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] text-slate-400 font-mono uppercase tracking-tight">Sponsor bounty ref 075***019 paid UGX 10,000</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 hidden lg:flex">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[9px] text-slate-400 font-mono uppercase tracking-tight">Deposit validated node 078***291 UGX 20,000</span>
              </div>
            </div>
            <div className="text-[8px] md:text-[9px] text-slate-600 font-bold uppercase tracking-widest shrink-0 ml-4">
              URSB DIGITAL AUDITING CERTIFIED
            </div>
          </footer>

        </div>

        {/* Global Interactive Ledgers Modals container */}
        <Modals
          modalId={state.activeModal}
          onClose={handleCloseModal}
          currentUserBalance={state.currentUser ? state.currentUser.balance : 0}
          onDepositSubmit={handleDepositSubmit}
          onInvestSubmit={handleInvestSubmit}
          onWithdrawSubmit={handleWithdrawSubmit}
          plans={state.plans || DEFAULT_PLANS}
          withdrawalFeePercent={state.withdrawalFeePercent}
        />

        {/* Visual Confirmation Dialog for high-value deposit/withdrawal submissions */}
        <TransactionReceiptModal
          transaction={recentTxReceipt}
          onClose={() => setRecentTxReceipt(null)}
        />

        {/* Global Toast component */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

      </div>
    );
  }

  return (
    <div className="bg-[#030712] text-gray-200 min-h-screen flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      
      {/* Navbar segment */}
      <Navbar
        currentPage={state.currentPage}
        currentUser={state.currentUser}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        autoRefresh={state.autoRefresh || false}
        onToggleAutoRefresh={handleToggleAutoRefresh}
      />

      {/* Main viewport segment */}
      <main className="flex-grow w-full">
        {state.currentPage === 'home' && (
          <LandingView
            onNavigate={handleNavigate}
            isLoggedIn={!!state.currentUser}
            onOpenModal={handleOpenModal}
            systemStats={state.systemStats}
            onAdvanceDay={handleAdvanceDay}
            onSimulateReferral={handleSimulateReferral}
            onApproveAllLedgers={() => {
              handleApproveAllDeposits();
              handleApproveAllWithdrawals();
            }}
            onRejectAllLedgers={() => {
              handleRejectAllDeposits();
              handleRejectAllWithdrawals();
            }}
            onFactoryReset={handleFactoryReset}
            plans={state.plans || DEFAULT_PLANS}
          />
        )}

        {state.currentPage === 'login' && (
          <LoginView
            onLogin={handleLogin}
            onNavigate={handleNavigate}
            triggerToast={triggerToast}
          />
        )}

        {state.currentPage === 'register' && (
          <RegisterView
            onRegister={handleRegister}
            onNavigate={handleNavigate}
            presetReferralCode={presetRefCode}
            triggerToast={triggerToast}
          />
        )}

        {state.currentPage === 'dashboard' && state.currentUser && (
          <DashboardView
            currentUser={state.currentUser}
            investments={state.investments}
            transactions={state.transactions}
            onOpenModal={handleOpenModal}
            inviteStats={getInviteStats(state.currentUser?.id || '', state.users, state.investments)}
          />
        )}
      </main>

      {/* Corporate compliance regulatory footer */}
      <footer className="bg-[#090f1d] border-t border-gray-900 py-12 px-4 shadow-inner">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-10 text-xs text-gray-400">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-905 border border-slate-800 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                <img 
                  src="https://www.image2url.com/r2/default/images/1780121168413-6fd6e8f8-cb8a-489b-8ec0-f0ee3a9ab2f5.jpg" 
                  alt="INNOVEST LOGO" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-sm font-black text-white font-display">INNOVEST CAPITAL</span>
            </div>
            <p className="leading-relaxed text-[11px] text-gray-400">
              Uganda's premium digital asset and partner-backed yield allocation network, enabling secure wealth growth structures.
            </p>
            <div className="flex gap-3 text-sm pt-1">
              <span className="hover:text-white cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 font-sans">🐦</span>
              <span className="hover:text-white cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 font-sans">🔵</span>
              <a 
                href="https://chat.whatsapp.com/KXlGh4S26RgFjneMOcNpf8" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-transform duration-200 hover:-translate-y-0.5 font-sans"
              >
                💬
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[10px]">Product Contracts</h4>
            <ul className="space-y-2.5 font-medium text-[11px]">
              <li>
                <button onClick={() => { handleNavigate('home'); setTimeout(() => document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="text-left bg-transparent border-none text-gray-400 hover:text-white cursor-pointer font-sans">
                  Starter Yield Allocation (10% Daily)
                </button>
              </li>
              <li>
                <button onClick={() => { handleNavigate('home'); setTimeout(() => document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="text-left bg-transparent border-none text-teal-400 font-bold hover:text-teal-300 cursor-pointer font-sans">
                  Growth Capital Cycle (10% Daily)
                </button>
              </li>
              <li>
                <button onClick={() => { handleNavigate('home'); setTimeout(() => document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="text-left bg-transparent border-none text-gray-400 hover:text-white cursor-pointer font-sans">
                  Premium Tier Ledger (10% Daily)
                </button>
              </li>
              <li>
                <button onClick={() => { handleNavigate('home'); setTimeout(() => document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="text-left bg-transparent border-none text-gray-400 hover:text-white cursor-pointer font-sans">
                  Elite Reserve Contract (10% Daily)
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[10px]">Enterprise Compliance</h4>
            <ul className="space-y-2.5 font-medium text-[11px]">
              <li>
                <button onClick={() => { handleNavigate('home'); setTimeout(() => document.getElementById('why-choose-us')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="text-left bg-transparent border-none text-gray-400 hover:text-white cursor-pointer font-sans">
                  Security Core Matrices
                </button>
              </li>
              <li>
                <button onClick={() => { handleNavigate('home'); setTimeout(() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="text-left bg-transparent border-none text-gray-400 hover:text-white cursor-pointer font-sans">
                  Verification FAQ
                </button>
              </li>
              <li>
                <a href="https://chat.whatsapp.com/KXlGh4S26RgFjneMOcNpf8" target="_blank" rel="noopener noreferrer" className="text-[#25D366] font-bold hover:underline font-sans">
                  ★ Join Support WhatsApp Group
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4 font-mono text-[9px] text-gray-500">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[10px] font-sans">Regulatory Certification</h4>
            <ul className="space-y-1.5 leading-relaxed">
              <li>• URSB ENTERPRISE CERTIFIED</li>
              <li>• URA CORPORATE REGULATED</li>
              <li>• CAPITAL MATCH RESILIENCE LEVEL B</li>
              <li>• SSL SECURITY CERT EXPIRED: 2029</li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 border-t border-gray-900 text-center text-[10px] text-gray-500 leading-relaxed font-mono">
          &copy; 2026 INNOVEST CAPITAL UGANDA. All Rights Reserved. Private Asset Yield Allocation Network. <br />
          Institutional capital deposits are locked in liquidity agreements. All payout transfers processed systematically.
        </div>
      </footer>

      {/* Floating WhatsApp Action Trigger */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 font-sans">
        {/* Tooltip Popup Menu */}
        {showWhatsAppTooltip && (
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 shadow-2xl max-w-xs w-72 mb-1 animate-fade-in text-xs space-y-3.5 relative">
            <button 
              onClick={() => setShowWhatsAppTooltip(false)}
              className="absolute top-3.5 right-3.5 text-gray-500 hover:text-white bg-transparent border-none cursor-pointer outline-none font-sans"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="space-y-1 pr-4">
              <span className="flex h-2 w-2 rounded-full bg-[#25D366] inline-block mr-1.5 animate-pulse" />
              <h5 className="font-bold text-white uppercase tracking-wide inline-block">WhatsApp Support Console</h5>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Connect with our advisors or join other Ugandan portfolio handlers right now.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <a
                href="https://chat.whatsapp.com/KXlGh4S26RgFjneMOcNpf8"
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                className="flex items-center gap-2 px-3 py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded-xl text-center justify-center transition-colors shadow-sm uppercase text-[9px] tracking-wider shrink-0"
              >
                <Users className="w-3.5 h-3.5 font-sans" />
                Join Technical Support Group
              </a>

              <a
                href="https://wa.me/256749508233?text=Hello%20INNOVEST%20CAPITAL,%20I%20want%2520to%2520invest"
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                className="flex items-center gap-2 px-3 py-2.5 bg-[#1f2937] hover:bg-gray-700 text-gray-200 border border-gray-800 font-bold rounded-xl text-center justify-center transition-colors uppercase text-[9px] tracking-wider shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                Direct Chat With Administrator
              </a>
            </div>
          </div>
        )}

        {/* Floating Bubble Button */}
        <button
          onClick={() => setShowWhatsAppTooltip(!showWhatsAppTooltip)}
          className="bg-[#25D366] hover:bg-[#20ba5a] text-white w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-2xl shadow-[#25d366]/40 hover:scale-110 active:scale-95 transition-all cursor-pointer border-none outline-none animate-bounce"
          title="Connect with INNOVEST Assistance"
        >
          <span>💬</span>
        </button>
      </div>

      {/* Global Interactive Ledgers Modals container */}
      <Modals
        modalId={state.activeModal}
        onClose={handleCloseModal}
        currentUserBalance={state.currentUser ? state.currentUser.balance : 0}
        onDepositSubmit={handleDepositSubmit}
        onInvestSubmit={handleInvestSubmit}
        onWithdrawSubmit={handleWithdrawSubmit}
        plans={state.plans || DEFAULT_PLANS}
        withdrawalFeePercent={state.withdrawalFeePercent}
      />

      {/* Visual Confirmation Dialog for high-value deposit/withdrawal submissions */}
      <TransactionReceiptModal
        transaction={recentTxReceipt}
        onClose={() => setRecentTxReceipt(null)}
      />

      {/* Global Toast component */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
}
