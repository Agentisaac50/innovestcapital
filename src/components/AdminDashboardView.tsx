import React, { useState } from 'react';
import { 
  Users, Check, X, ShieldAlert, Sparkles, RefreshCw, 
  Coins, Filter, ArrowUpRight, ArrowDownRight, Clock, 
  FileSpreadsheet, UserCheck, Search, Edit3, Trash2, 
  PlusCircle, AlertCircle, TrendingUp, Key, Layers, Award,
  Bell, BellRing, Eye, Settings, Compass
} from 'lucide-react';
import { motion } from 'motion/react';
import { User, Transaction, Investment, YieldPlan, DEFAULT_PLANS, AuditLog, AdminNotification } from '../types';

interface AdminDashboardViewProps {
  users: Record<string, User>;
  transactions: Transaction[];
  investments: Investment[];
  onApproveAllDeposits: () => void;
  onRejectAllDeposits: () => void;
  onApproveAllWithdrawals: () => void;
  onRejectAllWithdrawals: () => void;
  onApproveSingleTx: (txId: string) => void;
  onRejectSingleTx: (txId: string) => void;
  onAdvanceDay: () => void;
  onSimulateReferral: () => void;
  onFactoryReset: () => void;
  systemStats: {
    totalPaidOut: number;
    activeInvestors: number;
    totalROI: string;
    support: string;
  };
  onUpdateUser: (phone: string, updatedFields: Partial<User>) => void;
  onCreditUser: (phone: string, amount: number, isCredit: boolean, txDetails?: string) => void;
  onUpdateInvestment: (id: string, updatedFields: Partial<Investment>) => void;
  onDeleteInvestment: (id: string) => void;
  onAddInvestment: (userId: string, planType: 'Starter' | 'Growth' | 'Premium' | 'Elite', principal: number, days: number, dailyPay: number) => void;
  onUpdateTransaction: (id: string, updatedFields: Partial<Transaction>) => void;
  plans?: YieldPlan[];
  onUpdatePlans: (plans: YieldPlan[]) => void;
  auditLogs?: AuditLog[];
  withdrawalFeePercent?: number;
  onUpdateFee?: (fee: number) => void;
  adminNotifications?: AdminNotification[];
}

export default function AdminDashboardView({
  users,
  transactions,
  investments = [],
  onApproveAllDeposits,
  onRejectAllDeposits,
  onApproveAllWithdrawals,
  onRejectAllWithdrawals,
  onApproveSingleTx,
  onRejectSingleTx,
  onAdvanceDay,
  onSimulateReferral,
  onFactoryReset,
  systemStats,
  onUpdateUser,
  onCreditUser,
  onUpdateInvestment,
  onDeleteInvestment,
  onAddInvestment,
  onUpdateTransaction,
  plans,
  onUpdatePlans,
  auditLogs = [],
  withdrawalFeePercent = 5,
  onUpdateFee,
  adminNotifications = []
}: AdminDashboardViewProps) {
  // Navigation tabs within Admin module
  const [activeTab, setActiveTab] = useState<'transactions' | 'users' | 'investments' | 'plans' | 'audit' | 'notifications'>('transactions');

  // Filters and search logic
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'Approved' | 'Declined'>('pending');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserPhone, setSelectedUserPhone] = useState<string | null>(null);

  // Administrative Credit/Debit balances form state
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustDetails, setAdjustDetails] = useState('');
  const [adjustIsCredit, setAdjustIsCredit] = useState(true);

  // Administrative User Update form state
  const [editName, setEditName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editInvested, setEditInvested] = useState('');
  const [editEarnings, setEditEarnings] = useState('');
  const [editRefBonus, setEditRefBonus] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editReferredBy, setEditReferredBy] = useState('');

  // Deploying custom yield plan form state
  const [deployUserId, setDeployUserId] = useState('');
  const [deployPlanType, setDeployPlanType] = useState<'Starter' | 'Growth' | 'Premium' | 'Elite'>('Starter');
  const [deployPrincipal, setDeployPrincipal] = useState('20000');
  const [deployDailyPay, setDeployDailyPay] = useState('2000');
  const [deployDays, setDeployDays] = useState('72');

  // Edit live yield contract state
  const [editingInvId, setEditingInvId] = useState<string | null>(null);
  const [editInvDaysRemaining, setEditInvDaysRemaining] = useState('');
  const [editInvEarnings, setEditInvEarnings] = useState('');

  // Editing website yield plans state
  const currentPlans = plans || DEFAULT_PLANS;
  const [editedPlans, setEditedPlans] = useState<YieldPlan[]>([]);
  const [tempFee, setTempFee] = useState(withdrawalFeePercent);

  // Initialize editedPlans state when tab opens if it is empty
  React.useEffect(() => {
    if (editedPlans.length === 0 && currentPlans.length > 0) {
      setEditedPlans(JSON.parse(JSON.stringify(currentPlans)));
    }
  }, [currentPlans, editedPlans]);

  React.useEffect(() => {
    setTempFee(withdrawalFeePercent);
  }, [withdrawalFeePercent]);

  const handleUpdatePlanField = (planType: 'Starter' | 'Growth' | 'Premium' | 'Elite', field: keyof YieldPlan, value: any) => {
    setEditedPlans(prev => prev.map(p => {
      if (p.type === planType) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const handleSavePlans = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePlans(editedPlans);
    if (onUpdateFee) {
      onUpdateFee(tempFee);
    }
  };

  const userList = Object.values(users) as User[];
  const pendingTxs = transactions.filter(tx => tx.status === 'Pending');
  const pendingDeposits = pendingTxs.filter(tx => tx.type === 'Deposit');
  const pendingWithdrawals = pendingTxs.filter(tx => tx.type === 'Withdrawal');

  // Multi-signature outstanding reserves calculations
  const totalPendingDepositsAmount = pendingDeposits.reduce((sum, tx) => sum + tx.amount, 0);
  const totalPendingWithdrawalsAmount = pendingWithdrawals.reduce((sum, tx) => sum + tx.amount, 0);

  const filteredUsers = userList.filter(u => {
    const term = userSearch.toLowerCase();
    return u.name.toLowerCase().includes(term) || u.phone.includes(term) || u.referralCode.toLowerCase().includes(term);
  });

  const displayedTxs = transactions.filter(tx => {
    if (filterType === 'all') return true;
    if (filterType === 'pending') return tx.status === 'Pending';
    return tx.status === filterType;
  });

  // Resolve user info Helper Functions
  const getUserName = (userId: string) => {
    const found = userList.find(u => u.id === userId);
    return found ? found.name : 'Unknown Investor';
  };

  const getUserPhone = (userId: string) => {
    const found = userList.find(u => u.id === userId);
    return found ? found.phone : '0000000000';
  };

  const handleSelectUser = (u: User) => {
    setSelectedUserPhone(u.phone);
    setEditName(u.name);
    setEditPassword(u.password || '');
    setEditInvested(u.totalInvested.toString());
    setEditEarnings(u.totalEarnings.toString());
    setEditRefBonus(u.referralBonus.toString());
    setEditStatus(u.verifiedStatus || 'Verified Secure');
    setEditReferredBy(u.referredBy || '');
    
    // reset adjust form
    setAdjustAmount('');
    setAdjustDetails('');
  };

  const submitAdjustBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserPhone) return;
    const numericAmount = parseInt(adjustAmount, 10);
    if (!numericAmount || numericAmount <= 0) {
      alert("Please enter a valid positive numeric amount.");
      return;
    }
    
    onCreditUser(selectedUserPhone, numericAmount, adjustIsCredit, adjustDetails.trim() || undefined);
    setAdjustAmount('');
    setAdjustDetails('');
    
    // Refresh selections info
    const refreshedUser = users[selectedUserPhone];
    if (refreshedUser) {
      handleSelectUser(refreshedUser);
    }
  };

  const submitUserStatsUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserPhone) return;

    onUpdateUser(selectedUserPhone, {
      name: editName.trim(),
      password: editPassword,
      totalInvested: parseInt(editInvested, 10) || 0,
      totalEarnings: parseInt(editEarnings, 10) || 0,
      referralBonus: parseInt(editRefBonus, 10) || 0,
      verifiedStatus: editStatus,
      referredBy: editReferredBy.trim() || null
    });
  };

  const submitDeployPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deployUserId) {
      alert("Please specify a target investor account.");
      return;
    }
    const princ = parseInt(deployPrincipal, 10);
    const dayPay = parseInt(deployDailyPay, 10);
    const totDays = parseInt(deployDays, 10);

    if (isNaN(princ) || princ <= 0 || isNaN(dayPay) || dayPay < 0 || isNaN(totDays) || totDays <= 0) {
      alert("Ensure positive parameters are defined for deployment fields.");
      return;
    }

    onAddInvestment(deployUserId, deployPlanType, princ, totDays, dayPay);
    
    // reset form fields
    setDeployUserId('');
    setDeployPrincipal('20000');
    setDeployDailyPay('2000');
    setDeployDays('72');
  };

  const submitUpdateInvestmentState = (invId: string) => {
    const remains = parseInt(editInvDaysRemaining, 10);
    const totalEarned = parseInt(editInvEarnings, 10);

    if (isNaN(remains) || remains < 0 || isNaN(totalEarned) || totalEarned < 0) {
      alert("Must provide valid positive integers");
      return;
    }

    onUpdateInvestment(invId, {
      daysRemaining: remains,
      earningsEarned: totalEarned
    });
    setEditingInvId(null);
  };

  // Adjust pre-filled stats depending on selection of standard package pre-sets
  const handleSelectPackagePreset = (plan: 'Starter' | 'Growth' | 'Premium' | 'Elite') => {
    setDeployPlanType(plan);
    if (plan === 'Starter') {
      setDeployPrincipal('20000');
      setDeployDailyPay('2000');
      setDeployDays('72');
    } else if (plan === 'Growth') {
      setDeployPrincipal('100000');
      setDeployDailyPay('12000');
      setDeployDays('72');
    } else if (plan === 'Premium') {
      setDeployPrincipal('500000');
      setDeployDailyPay('70000');
      setDeployDays('72');
    } else if (plan === 'Elite') {
      setDeployPrincipal('2000000');
      setDeployDailyPay('300000');
      setDeployDays('72');
    }
  };

  const activeUser = selectedUserPhone ? users[selectedUserPhone] : null;

  return (
    <div className="space-y-8 pb-12">
      {/* Admin Actionable Alerts Notification Banner */}
      {pendingTxs.length > 0 && (
        <div id="urgent-admin-banner" className="relative bg-[#1c120c] border border-amber-500/30 rounded-3xl p-5 shadow-xl overflow-hidden animate-pulse">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5.5 h-5.5 text-amber-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span className="inline-block w-2 bg-amber-500 rounded-full animate-ping h-2 shrink-0"></span>
                  System Action Required: {pendingTxs.length} Pending Audits
                </h3>
                <p className="text-[11px] font-sans text-slate-300 leading-relaxed max-w-2xl">
                  There are currently <strong className="text-emerald-300 font-mono">{pendingDeposits.length} deposits</strong> and <strong className="text-rose-300 font-mono">{pendingWithdrawals.length} withdrawals</strong> in queue requiring signature validation in order to balance the platform reserve ledger.
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400 font-mono pt-0.5">
                  <span>Pending Deposits Volume: <strong className="text-emerald-400 font-bold">UGX {totalPendingDepositsAmount.toLocaleString()}</strong></span>
                  <span className="text-slate-705">|</span>
                  <span>Pending Payouts Volume: <strong className="text-rose-400 font-bold">UGX {totalPendingWithdrawalsAmount.toLocaleString()}</strong></span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2.5 shrink-0 self-start lg:self-center">
              {pendingDeposits.length > 0 && (
                <button
                  id="urgent-approve-deposits"
                  onClick={onApproveAllDeposits}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-950/80 to-emerald-900/80 hover:from-emerald-900 hover:to-emerald-850 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold font-mono text-[10.5px] cursor-pointer select-none transition-all active:scale-95 shadow-lg"
                >
                  ✓ APPROVE {pendingDeposits.length} DEPOSITS
                </button>
              )}
              {pendingWithdrawals.length > 0 && (
                <button
                  id="urgent-approve-withdrawals"
                  onClick={onApproveAllWithdrawals}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-950/80 to-indigo-900/80 hover:from-indigo-900 hover:to-indigo-850 text-indigo-300 border border-indigo-500/45 rounded-xl font-bold font-mono text-[10.5px] cursor-pointer select-none transition-all active:scale-95 shadow-lg"
                >
                  ✓ APPROVE {pendingWithdrawals.length} PAYOUTS
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Intro Header banner */}
      <div className="relative bg-gradient-to-r from-slate-950 via-[#0a0f1d] to-slate-950 border border-slate-800/80 rounded-3xl p-6 md:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              Platform Auditor Command Console
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-black font-display text-white tracking-tight leading-tight">
                GRADES N AUDITING HUD
              </h1>
              
              {/* Dynamic Notification Bell */}
              <div className="relative group shrink-0">
                <button 
                  onClick={() => {
                    setActiveTab('transactions');
                    setFilterType('pending');
                    const banner = document.getElementById('urgent-admin-banner');
                    if (banner) {
                      banner.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="relative p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-amber-500 hover:text-amber-400 transition-all cursor-pointer shadow-md select-none outline-none focus:ring-1 focus:ring-amber-500/50 flex items-center justify-center"
                  title={`${pendingTxs.length} pending items requiring manual verification`}
                >
                  <BellRing className={`w-4 h-4 ${pendingTxs.length > 0 ? 'animate-bounce' : ''}`} />
                  {pendingTxs.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[8.5px] font-mono font-bold text-white shadow-md">
                      {pendingTxs.length}
                    </span>
                  )}
                </button>
                {/* Hover Summary Box */}
                <div className="absolute left-0 mt-2 hidden group-hover:block w-64 p-3 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-50 text-[10px] text-slate-300 font-mono space-y-1.5">
                  <p className="font-bold text-slate-100 border-b border-prefix border-slate-800 pb-1 flex items-center gap-1">
                    <Bell className="w-3.5 h-3.5 text-amber-500" />
                    PENDING LEDGER STATUS
                  </p>
                  <p className="flex justify-between">
                    <span>Pending Deposits:</span>
                    <strong className="text-emerald-400 font-bold">{pendingDeposits.length} txn</strong>
                  </p>
                  <p className="flex justify-between font-mono">
                    <span>Pending Cash-outs:</span>
                    <strong className="text-rose-450 font-bold">{pendingWithdrawals.length} txn</strong>
                  </p>
                  <p className="border-t border-slate-800 pt-1 text-[9px] text-slate-500 text-center uppercase">Click to audit pending list</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Real-time multi-signature reserve verification ledger. Authorize pending deposits, payouts, referrals, and track user statements state instantly.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={onAdvanceDay}
              className="flex items-center gap-1.5 px-3.5 py-2 font-mono font-bold rounded-xl text-[10.5px] bg-[#0c1f2e] text-sky-400 hover:bg-[#071724] border border-sky-500/20 shadow-lg cursor-pointer transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              ADVANCE 24H YIELDS
            </button>
            <button
              onClick={onSimulateReferral}
              className="flex items-center gap-1.5 px-3.5 py-2 font-mono font-bold rounded-xl text-[10.5px] bg-emerald-950/40 text-emerald-400 hover:bg-emerald-950/80 border border-emerald-500/20 shadow-lg cursor-pointer transition-all active:scale-95"
            >
              <Users className="w-3.5 h-3.5" />
              SIMULATE REFERRAL
            </button>
            <button
              onClick={onFactoryReset}
              className="flex items-center gap-1.5 px-3 py-2 font-mono font-bold rounded-xl text-[10.5px] bg-red-950/20 text-red-400 hover:bg-red-950/40 border border-red-500/10 cursor-pointer transition-all active:scale-95"
            >
              RESET DB
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Key Admin Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#050914] border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">PENDING DEPOSIT POOL</span>
            <span className="p-1 px-2 rounded bg-amber-500/10 text-amber-400 text-[9px] font-bold font-mono">
              {pendingDeposits.length} txn
            </span>
          </div>
          <p className="text-xl md:text-2xl font-mono font-black text-amber-400 mt-2.5">
            UGX {totalPendingDepositsAmount.toLocaleString()}
          </p>
          <span className="text-[9px] text-slate-500 mt-1 block">Requires manual deposit verification</span>
        </div>

        <div className="bg-[#050914] border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">PENDING WITHDRAWAL POOL</span>
            <span className="p-1 px-2 rounded bg-red-500/10 text-red-400 text-[9px] font-bold font-mono">
              {pendingWithdrawals.length} txn
            </span>
          </div>
          <p className="text-xl md:text-2xl font-mono font-black text-rose-400 mt-2.5">
            UGX {totalPendingWithdrawalsAmount.toLocaleString()}
          </p>
          <span className="text-[9px] text-slate-500 mt-1 block">Requires manual cash-out dispatch</span>
        </div>

        <div className="bg-[#050914] border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">REGISTERED ACCOUNTS</span>
          <p className="text-xl md:text-2xl font-mono font-black text-white mt-2.5">
            {userList.length} Nodes
          </p>
          <span className="text-[9px] text-slate-500 mt-1 block">Live connections secure active nodes</span>
        </div>

        <div className="bg-[#050914] border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">COMPLETED SETTLEMENTS</span>
          <p className="text-xl md:text-2xl font-mono font-black text-teal-400 mt-2.5">
            UGX {systemStats.totalPaidOut.toLocaleString()}
          </p>
          <span className="text-[9px] text-slate-500 mt-1 block">Yield allocations paid systematically</span>
        </div>

      </div>

      {/* Module Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold font-mono text-xs transition-all tracking-wider uppercase cursor-pointer ${
            activeTab === 'transactions' ? 'bg-[#091524] border border-sky-500/20 text-sky-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Ledger & Pending Orders ({pendingTxs.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold font-mono text-xs transition-all tracking-wider uppercase cursor-pointer ${
            activeTab === 'users' ? 'bg-[#0c1c1c] border border-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Investor Users Directory ({userList.length})
        </button>
        <button
          onClick={() => setActiveTab('investments')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold font-mono text-xs transition-all tracking-wider uppercase cursor-pointer ${
            activeTab === 'investments' ? 'bg-[#181124] border border-purple-500/20 text-purple-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          Active Yield Contracts ({investments.length})
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold font-mono text-xs transition-all tracking-wider uppercase cursor-pointer ${
            activeTab === 'plans' ? 'bg-[#221c0c] border border-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          Edit Yield Plans (Active)
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold font-mono text-xs transition-all tracking-wider uppercase cursor-pointer ${
            activeTab === 'audit' ? 'bg-[#120924] border border-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          Audit Logs ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex-grow flex items-center justify-center gap-2 py-3 rounded-xl font-bold font-mono text-xs transition-all tracking-wider uppercase cursor-pointer relative ${
            activeTab === 'notifications' ? 'bg-[#24091a] border border-pink-500/20 text-pink-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          Alerts ({adminNotifications.length})
          {adminNotifications.filter(n => !n.read).length > 0 && (
            <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-pink-500 text-[9px] font-mono font-bold text-white leading-none">
              {adminNotifications.filter(n => !n.read).length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Ledger & Outstanding pending Orders */}
      {activeTab === 'transactions' && (
        <div className="space-y-8">
          {/* Mass Actions Suite */}
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-teal-400" />
              <h2 className="font-display font-black text-sm tracking-tight text-white uppercase">
                MASS OPERATIONS SYSTEM AUDITING TOOLS
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-6 max-w-2xl leading-relaxed">
              Settle bulk queues instantly using these server-authoritative handlers, eliminating the need to process transactions individually during high activity.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={onApproveAllDeposits}
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-500/30 rounded-2xl font-bold font-mono text-xs cursor-pointer select-none transition-all active:scale-95 shadow-md"
                title="Approve all outstanding deposits"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                APPROVE ALL DEPOSITS ({pendingDeposits.length})
              </button>

              <button
                onClick={onRejectAllDeposits}
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-red-950/30 text-rose-300 hover:bg-red-950/50 border border-red-500/20 rounded-2xl font-bold font-mono text-xs cursor-pointer select-none transition-all active:scale-95 shadow-md"
                title="Reject all outstanding deposits"
              >
                <X className="w-4 h-4 text-rose-450" />
                DECLINE ALL DEPOSITS ({pendingDeposits.length})
              </button>

              <button
                onClick={onApproveAllWithdrawals}
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-950/50 text-indigo-300 hover:bg-indigo-950 border border-indigo-500/35 rounded-2xl font-bold font-mono text-xs cursor-pointer select-none transition-all active:scale-95 shadow-md"
                title="Approve all pending payouts"
              >
                <Check className="w-4 h-4 text-indigo-400" />
                APPROVE ALL WITHDRAWALS ({pendingWithdrawals.length})
              </button>

              <button
                onClick={onRejectAllWithdrawals}
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-amber-950/40 text-amber-300 hover:bg-amber-950 border border-amber-500/20 rounded-2xl font-bold font-mono text-xs cursor-pointer select-none transition-all active:scale-95 shadow-md"
                title="Reject all payouts and refund"
              >
                <X className="w-4 h-4 text-amber-500" />
                DECLINE ALL WITHDRAWALS ({pendingWithdrawals.length})
              </button>
            </div>
          </div>

          <div className="bg-[#030712] border border-slate-850 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-display font-black text-sm text-white uppercase tracking-tight flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                  Comprehensive Ledger Registry Logs
                </h3>
                <p className="text-xs text-slate-500">Live feed of global financial transitions inside the system ledger.</p>
              </div>

              <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setFilterType('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' : 'text-slate-400 hover:text-white border border-transparent'}`}
                >
                  Pending ({pendingTxs.length})
                </button>
                <button
                  onClick={() => setFilterType('Approved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'text-slate-400 hover:text-white border border-transparent'}`}
                >
                  Approved
                </button>
                <button
                  onClick={() => setFilterType('Declined')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'Declined' ? 'bg-red-500/10 text-rose-455 border border-red-500/25' : 'text-slate-400 hover:text-white border border-transparent'}`}
                >
                  Declined
                </button>
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  All Logs
                </button>
              </div>
            </div>

            {displayedTxs.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <div className="text-2xl text-slate-600">📭</div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">No matching transactions detected.</p>
                <p className="text-[10px] text-slate-500">Queue is completely synchronized and audited.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans font-medium">
                  <thead>
                    <tr className="bg-slate-950 text-slate-500 uppercase tracking-wider font-mono text-[9px] border-b border-slate-850">
                      <th className="py-3 px-5 font-bold">Client Account</th>
                      <th className="py-3 px-5 font-bold">Transaction Type</th>
                      <th className="py-3 px-5 font-bold">Requested Volume</th>
                      <th className="py-3 px-5 font-bold text-center">Reference / Gateway ID</th>
                      <th className="py-3 px-5 font-bold">Date Logged</th>
                      <th className="py-3 px-5 font-bold">Ledger Status</th>
                      <th className="py-3 px-5 font-bold text-right">Auditor Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-xs">
                    {displayedTxs.map(tx => {
                      const isDeposit = tx.type === 'Deposit';
                      const isPending = tx.status === 'Pending';
                      return (
                        <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-4 px-5">
                            <div className="font-bold text-slate-200">{getUserName(tx.userId)}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{getUserPhone(tx.userId)}</div>
                          </td>
                          <td className="py-4 px-5">
                            <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold ${isDeposit ? 'text-emerald-400' : tx.type === 'Withdrawal' ? 'text-rose-400' : 'text-indigo-400'}`}>
                              {isDeposit ? <ArrowDownRight className="w-3.5 h-3.5 shrink-0" /> : <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />}
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-4 px-5 font-mono font-bold text-slate-100">
                            UGX {tx.amount.toLocaleString()}
                          </td>
                          <td className="py-4 px-5 text-center font-mono">
                            {tx.txId ? (
                              <span className="px-2 py-0.5 text-[11px] font-bold font-mono bg-[#0c1322] border border-slate-800 text-teal-400 rounded-md">
                                {tx.txId}
                              </span>
                            ) : (
                              <span className="text-slate-600 font-mono text-[10px]">No Ticket</span>
                            )}
                            <p className="text-[9px] text-slate-500 mt-1 max-w-xs mx-auto text-ellipsis overflow-hidden truncate">
                              {tx.details}
                            </p>
                          </td>
                          <td className="py-4 px-5 text-slate-400 font-mono text-[10px]">
                            {new Date(tx.timestamp).toLocaleString()}
                          </td>
                          <td className="py-4 px-5">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase font-mono border ${
                              tx.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                              tx.status === 'Declined' ? 'bg-red-500/10 text-rose-455 border-red-500/20' : 
                              'bg-amber-500/10 text-amber-400 border-amber-500/25 animate-pulse'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => onApproveSingleTx(tx.id)}
                                  className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20 cursor-pointer text-xs"
                                  title="Audit approve"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onRejectSingleTx(tx.id)}
                                  className="p-1.5 rounded-lg bg-red-500/10 text-rose-455 hover:bg-red-500/20 border border-red-500/15 cursor-pointer text-xs"
                                  title="Audit decline & refund"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-2 text-[10px] text-slate-600 font-mono italic">
                                <span>Audited</span>
                                <button
                                  onClick={() => {
                                    const nextStatus = tx.status === 'Approved' ? 'Declined' : 'Approved';
                                    if (window.confirm(`Force change status from ${tx.status} to ${nextStatus}?`)) {
                                      onUpdateTransaction(tx.id, { status: nextStatus });
                                    }
                                  }}
                                  className="text-[9px] text-[#5b21b6] hover:underline bg-transparent border-none cursor-pointer font-bold uppercase shrink-0"
                                >
                                  Toggle
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: User Accounts & Direct Statements credit card Suite */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left panel - User list */}
          <div className="lg:col-span-7 bg-[#030712] border border-slate-850 rounded-3xl overflow-hidden shadow-xl space-y-4 p-5">
            <div className="flex items-center justify-between gap-4 border-b border-slate-850 pb-4">
              <h3 className="font-display font-black text-sm text-white uppercase flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                registered profiles
              </h3>
              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Query telephone or name..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-slate-905 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-850/60 max-h-[550px] overflow-y-auto pr-1">
              {filteredUsers.map(u => {
                const isSelected = selectedUserPhone === u.phone;
                return (
                  <div
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-4 ${
                      isSelected ? 'bg-gradient-to-r from-emerald-950/20 to-[#0e1717]/40 border border-emerald-500/25 shadow-md' : 'hover:bg-slate-900/40 border border-transparent'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-slate-100 flex items-center gap-2 text-xs">
                        {u.name}
                        {u.role === 'admin' && (
                          <span className="px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-400 text-[8px] uppercase tracking-widest font-mono font-bold">Admin HUD</span>
                        )}
                      </div>
                      <div className="text-[10px] text-indigo-400 font-mono font-bold">{u.phone}</div>
                      <div className="flex items-center gap-2 text-[9px] text-slate-550 font-mono mt-1">
                        <span>Invites: <strong className="text-slate-300">{u.referralCode}</strong></span>
                        {u.referredBy && <span>• Sponsor: <strong className="text-amber-500">{u.referredBy}</strong></span>}
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="font-mono text-xs font-black text-emerald-400">UGX {u.balance.toLocaleString()}</div>
                      <div className="text-[9px] text-slate-500 font-mono">
                        Invested: <strong className="text-slate-450">UGX {u.totalInvested.toLocaleString()}</strong>
                      </div>
                      <div className={`px-2 py-0.2 rounded-full inline-block text-[8px] font-mono font-bold tracking-wider uppercase border ${
                        u.verifiedStatus?.includes('Suspended') ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {u.verifiedStatus || 'Active Node'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right panel - selected user details form */}
          <div className="lg:col-span-5 space-y-6">
            {activeUser ? (
              <div className="space-y-6">
                
                {/* 1. Administrative Banking Credit Adjustment Form */}
                <div className="bg-[#030712] border border-slate-850 rounded-3xl p-6 shadow-xl space-y-4">
                  <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-850 pb-3">
                    <Coins className="w-4 h-4 text-amber-500" />
                    ADMINISTRATIVE DIRECT STATEMENT ADJUSTER
                  </h3>
                  
                  <div className="p-3.5 bg-slate-900/50 rounded-xl border border-slate-800 text-xs space-y-1">
                    <p className="text-slate-400">Target Profile Name: <strong className="text-slate-200">{activeUser.name}</strong></p>
                    <p className="text-slate-400">Standard Statement Balance: <strong className="text-emerald-400 font-mono font-bold">UGX {activeUser.balance.toLocaleString()}</strong></p>
                  </div>

                  <form onSubmit={submitAdjustBalance} className="space-y-3 font-sans">
                    <div className="flex bg-slate-905 p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setAdjustIsCredit(true)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${adjustIsCredit ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'text-slate-400'}`}
                      >
                        CREDIT (+)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdjustIsCredit(false)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${!adjustIsCredit ? 'bg-red-500/10 text-rose-455 border border-red-500/25' : 'text-slate-400'}`}
                      >
                        DEBIT (-)
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 uppercase font-mono font-bold">Transaction Value (UGX)</label>
                      <input
                        type="number"
                        placeholder="e.g. 50000"
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(e.target.value)}
                        className="w-full bg-slate-905 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono font-bold"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 uppercase font-mono font-bold">Reference audit log note</label>
                      <input
                        type="text"
                        placeholder="e.g. Compensation for Airtel gateway downtime delay"
                        value={adjustDetails}
                        onChange={(e) => setAdjustDetails(e.target.value)}
                        className="w-full bg-slate-905 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className={`w-full py-2.5 font-bold font-mono text-xs rounded-xl cursor-pointer select-none border transition-all ${
                        adjustIsCredit 
                        ? 'bg-emerald-950/60 text-emerald-450 hover:bg-emerald-950 border-emerald-500/20' 
                        : 'bg-red-955/20 text-rose-455 hover:bg-rose-950 border-red-500/15'
                      }`}
                    >
                      AUTHORIZE STATEMENT MODIFICATION
                    </button>
                  </form>
                </div>

                {/* 2. Standard direct attribute fields editor */}
                <div className="bg-[#030712] border border-slate-850 rounded-3xl p-6 shadow-xl space-y-4">
                  <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-850 pb-3">
                    <Edit3 className="w-4 h-4 text-sky-400" />
                    DIRECT PROFILE ACCOUNT EDITOR
                  </h3>

                  <form onSubmit={submitUserStatsUpdate} className="space-y-3 text-xs font-sans">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-500 uppercase font-mono">Full Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-slate-905 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-500 uppercase font-mono">Password Key</label>
                        <input
                          type="text"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          className="w-full bg-slate-905 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-500 uppercase font-mono">Invested (UGX)</label>
                        <input
                          type="number"
                          value={editInvested}
                          onChange={(e) => setEditInvested(e.target.value)}
                          className="w-full bg-slate-905 border border-slate-800 rounded-xl py-2 px-2 text-xs text-slate-200 focus:outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-500 uppercase font-mono">Earnings (UGX)</label>
                        <input
                          type="number"
                          value={editEarnings}
                          onChange={(e) => setEditEarnings(e.target.value)}
                          className="w-full bg-slate-905 border border-slate-800 rounded-xl py-2 px-2 text-xs text-teal-400 focus:outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-500 uppercase font-mono">Ref Bonus (UGX)</label>
                        <input
                          type="number"
                          value={editRefBonus}
                          onChange={(e) => setEditRefBonus(e.target.value)}
                          className="w-full bg-[#0c1322] border border-slate-800 rounded-xl py-2 px-2 text-xs text-amber-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-500 uppercase font-mono">Referral Sponsor By</label>
                        <input
                          type="text"
                          placeholder="INV-XXXXX code"
                          value={editReferredBy}
                          onChange={(e) => setEditReferredBy(e.target.value)}
                          className="w-full bg-[#1c1729]/30 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-500 uppercase font-mono">Auditor status badge</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="w-full bg-slate-905 border border-slate-800 rounded-xl py-1.8 px-2 text-xs text-white focus:outline-none"
                        >
                          <option value="Verified Secure">Verified Secure</option>
                          <option value="Pending KYC Identification">Pending KYC</option>
                          <option value="Suspended Restricted">Suspended Restricted</option>
                          <option value="Operational Audit Review">Audit Review</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-sky-950/50 text-sky-400 hover:bg-sky-950 border border-sky-500/20 rounded-xl font-bold font-mono text-[10.5px] cursor-pointer"
                    >
                      COMMIT PROFILE MODIFICATIONS
                    </button>
                  </form>
                </div>

              </div>
            ) : (
              <div className="bg-[#030712] border border-slate-850 rounded-3xl p-8 shadow-xl text-center space-y-2">
                <p className="text-2xl">👤</p>
                <p className="text-xs uppercase font-mono text-slate-400 font-bold">No investor profile selected</p>
                <p className="text-[10px] text-slate-500 leading-normal font-sans max-w-xs mx-auto">
                  Click on any investor record in the primary directory tree on the left of this pane to access direct ledger balance modification forms and stats editors.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Plan Deployer & Active yield contracts */}
      {activeTab === 'investments' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left panel - deploy custom plan */}
          <div className="lg:col-span-4 bg-[#030712] border border-slate-850 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
              <PlusCircle className="w-4 h-4 text-purple-400" />
              <h3 className="font-display font-black text-xs text-white uppercase tracking-wider">
                DEPLOY NEW YIELD CONTRACT
              </h3>
            </div>

            <form onSubmit={submitDeployPlan} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase font-mono font-bold block">Target Investor Account</label>
                <select
                  value={deployUserId}
                  onChange={(e) => setDeployUserId(e.target.value)}
                  className="w-full bg-slate-905 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                  required
                >
                  <option value="">Select Account...</option>
                  {userList.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.phone}) - Bal: UGX {u.balance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Presets Grid */}
              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 uppercase font-mono font-bold block">Preset Yield Packages</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['Starter', 'Growth', 'Premium', 'Elite'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleSelectPackagePreset(p)}
                      className={`py-1 rounded-md text-[9px] font-mono font-bold border transition-all ${
                        deployPlanType === p 
                          ? 'bg-purple-950/60 border-purple-500/40 text-purple-450' 
                          : 'bg-slate-905 border-slate-800 text-slate-450 hover:bg-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-mono font-bold">Principal (UGX)</label>
                  <input
                    type="number"
                    value={deployPrincipal}
                    onChange={(e) => {
                      setDeployPrincipal(e.target.value);
                      setDeployPlanType('Starter'); // unlock preset
                    }}
                    className="w-full bg-slate-905 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-mono font-bold font-semibold">Daily Yield (UGX)</label>
                  <input
                    type="number"
                    value={deployDailyPay}
                    onChange={(e) => {
                      setDeployDailyPay(e.target.value);
                      setDeployPlanType('Starter');
                    }}
                    className="w-full bg-slate-905 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase font-mono font-bold">Total Contract Duration (Days)</label>
                <input
                  type="number"
                  value={deployDays}
                  onChange={(e) => setDeployDays(e.target.value)}
                  className="w-full bg-slate-905 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="p-3 bg-indigo-950/10 border border-indigo-500/15 rounded-2xl text-[10.5px] leading-relaxed text-indigo-400">
                ⚠️ <strong>Auditor Notice:</strong> Deploying this plan immediately adds the configured principal amount to the user's <em>Invested Capital</em> statistics and logs a ledger transaction. Yield distribution starts on the next global clock advance.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-purple-950/70 to-indigo-950/70 text-purple-300 hover:from-purple-900 border border-purple-500/25 rounded-xl font-bold font-mono text-xs cursor-pointer tracking-wider"
              >
                DEPLOY CONTRACT NOW
              </button>
            </form>
          </div>

          {/* Right panel - contract database list */}
          <div className="lg:col-span-8 bg-[#030712] border border-slate-850 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-850">
              <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                ACTIVE YIELD ARCH TYPE LEDGERS
              </h3>
            </div>

            {investments.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <p className="text-xl">💼</p>
                <p className="text-xs uppercase font-mono text-slate-400 font-bold">No active investments found</p>
                <p className="text-[10px] text-slate-500">Deploy a contract using the form on the left pane.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans font-medium">
                  <thead>
                    <tr className="bg-slate-950 text-slate-500 uppercase tracking-wider font-mono text-[9px] border-b border-slate-850">
                      <th className="py-2.5 px-4 font-bold">Investor Node</th>
                      <th className="py-2.5 px-4 font-bold">Yield Contract Target</th>
                      <th className="py-2.5 px-4 font-bold text-center">Remaining / Duration</th>
                      <th className="py-2.5 px-4 font-bold">Payouts Earned</th>
                      <th className="py-2.5 px-4 font-bold">Current Status</th>
                      <th className="py-2.5 px-4 font-bold text-right">Ledger Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-xs">
                    {investments.map(inv => {
                      const clientPhone = getUserPhone(inv.userId);
                      const isEditing = editingInvId === inv.id;
                      return (
                        <tr key={inv.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-200">{getUserName(inv.userId)}</div>
                            <div className="text-[10px] text-indigo-400 font-mono">{clientPhone}</div>
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold uppercase text-[9px] border border-purple-500/15 mr-1.5">
                              {inv.planType}
                            </span>
                            <strong className="text-white">UGX {inv.principal.toLocaleString()}</strong>
                            <div className="text-[8px] text-slate-500">Yield: +{inv.dailyPay}/24h</div>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-250">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5 justify-center max-w-[80px] mx-auto">
                                <input
                                  type="number"
                                  value={editInvDaysRemaining}
                                  onChange={(e) => setEditInvDaysRemaining(e.target.value)}
                                  className="w-full bg-slate-905 border border-slate-800 rounded py-0.5 px-1 text-xs text-center font-mono text-white"
                                />
                                <span className="text-slate-500">/{inv.totalDays}</span>
                              </div>
                            ) : (
                              <span>{inv.daysRemaining} / {inv.totalDays} days</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editInvEarnings}
                                onChange={(e) => setEditInvEarnings(e.target.value)}
                                className="w-24 bg-slate-905 border border-slate-800 rounded py-0.5 px-1.5 text-xs font-mono text-emerald-400"
                              />
                            ) : (
                              <span className="text-emerald-400 font-bold">UGX {inv.earningsEarned.toLocaleString()}</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] border font-mono font-bold ${
                              inv.status === 'active' 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                : 'bg-slate-800 border-slate-800 text-slate-500'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => submitUpdateInvestmentState(inv.id)}
                                    className="p-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px] cursor-pointer"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingInvId(null)}
                                    className="p-1 rounded bg-slate-800 text-slate-400 cursor-pointer text-[10px]"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingInvId(inv.id);
                                      setEditInvDaysRemaining(inv.daysRemaining.toString());
                                      setEditInvEarnings(inv.earningsEarned.toString());
                                    }}
                                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 cursor-pointer"
                                    title="Edit parameters"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (window.confirm("Do you want to terminate and dismount this active yield contract permanently? User invested ledger totals will remain intact until manually modified.")) {
                                        onDeleteInvestment(inv.id);
                                      }
                                    }}
                                    className="p-1 rounded bg-red-955/10 hover:bg-red-955/20 text-rose-455 border border-red-500/15 cursor-pointer"
                                    title="Dismount contract"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Site Yield Plans Editor state */}
      {activeTab === 'plans' && (
        <div id="admin-plans-tab" className="bg-[#030712] border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <h3 className="font-display font-black text-sm text-white uppercase flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Edit Website Yield Investment Plans
              </h3>
              <p className="text-xs text-slate-500">Alter required deposit pricing, daily payouts, and durations for platform plans.</p>
            </div>
          </div>

          <form onSubmit={handleSavePlans} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {editedPlans.map((plan, index) => (
                <div key={plan.type} className="bg-[#050914] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{plan.icon}</span>
                      <span className="font-display font-bold text-white text-sm">{plan.type} Plan</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[9px] uppercase font-bold">Preset {index + 1}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs font-sans">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 uppercase font-mono font-bold block">Required Deposit (UGX)</label>
                      <input
                        type="number"
                        value={plan.price}
                        onChange={(e) => handleUpdatePlanField(plan.type, 'price', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-[#0c1322] border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-amber-500 font-mono font-bold"
                        required
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 uppercase font-mono font-bold block">Daily Pay (UGX)</label>
                      <input
                        type="number"
                        value={plan.daily}
                        onChange={(e) => handleUpdatePlanField(plan.type, 'daily', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-[#0c1322] border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-amber-500 font-mono font-bold"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 uppercase font-mono font-bold block">Duration (Days)</label>
                      <input
                        type="number"
                        value={plan.totalDays}
                        onChange={(e) => handleUpdatePlanField(plan.type, 'totalDays', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-[#0c1322] border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-amber-500 font-mono font-bold"
                        required
                      />
                    </div>
                  </div>

                  {/* Calculated metrics visualizer helper */}
                  <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-[10px] text-slate-400 font-mono flex justify-between items-center">
                    <span>Total Projected Yield:</span>
                    <strong className="text-emerald-400 uppercase font-bold">UGX {(plan.daily * plan.totalDays).toLocaleString()} ({(plan.price > 0 ? ( (plan.daily * plan.totalDays / plan.price) * 100).toFixed(0) : '0')}% ROI)</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Global Settings Section */}
            <div className="bg-[#050914] border border-slate-800 rounded-2xl p-6 mt-4 space-y-4 shadow-md">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                <span className="font-display font-bold text-white text-sm">Global Platform Fees & Settings</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase font-mono font-bold block">
                    Withdrawal Processing Fee Rate (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={tempFee}
                      onChange={(e) => setTempFee(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#0c1322] border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500 font-mono font-bold pr-10"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none font-mono font-bold text-xs text-slate-500">
                      %
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-500 block leading-normal mt-1">
                    This processing fee is automatically calculated and deducted when processing user mobile money payouts. Default is 5%.
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-emerald-900 to-teal-900 hover:from-emerald-850 hover:to-teal-850 text-white font-mono font-bold text-xs uppercase rounded-xl border border-emerald-500/20 cursor-pointer shadow-lg active:scale-95 transition-all text-center"
            >
              ✓ Authorize & Publish Revised Yield Configurations
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: Admin Audit Logs Section */}
      {activeTab === 'audit' && (
        <div id="admin-audit-tab" className="bg-[#030712] border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <h3 className="font-display font-black text-sm text-white uppercase flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-500 animate-spin-slow" />
                Administrative System Audit Trail Ledger
              </h3>
              <p className="text-xs text-slate-500">Live cryptographic logging of all state alterations and administrative actions.</p>
            </div>
            
            <span className="p-1 px-2.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold font-mono">
              SECURED WITH SHA-256
            </span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-mono border border-dashed border-slate-800 rounded-2xl">
              No administrative audit entries logged in this cycle session.
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-2">
              {auditLogs.map((log) => {
                const getActionColor = (action: string) => {
                  if (action.includes('APPROVE') || action.includes('CREDIT') || action.includes('SYS')) return 'border-emerald-500/25 bg-emerald-950/20 text-emerald-400';
                  if (action.includes('REJECT') || action.includes('DECLINE') || action.includes('DELETE')) return 'border-red-500/25 bg-red-950/20 text-rose-400';
                  if (action.includes('PLAN') || action.includes('UPDATE')) return 'border-amber-500/25 bg-amber-950/20 text-amber-400';
                  return 'border-indigo-500/25 bg-indigo-950/20 text-indigo-400';
                };

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-slate-900/40 rounded-xl border border-slate-850 flex flex-col md:flex-row md:items-start justify-between gap-4 font-mono text-xs hover:border-slate-800 transition-all"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {log.timestamp}
                        </span>
                        <span className="text-[10px] text-indigo-400 font-semibold bg-[#120924] px-1.5 py-0.2 rounded">
                          Admin: {log.adminPhone}
                        </span>
                      </div>
                      <p className="text-slate-300 font-sans text-xs leading-relaxed">
                        {log.details}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: Admin Notifications Centre */}
      {activeTab === 'notifications' && (
        <div id="admin-notifications-tab" className="bg-[#030712] border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <h3 className="font-display font-black text-sm text-white uppercase flex items-center gap-2">
                <BellRing className="w-5 h-5 text-pink-500 animate-pulse" />
                Live Client Activity Dispatch Centre
              </h3>
              <p className="text-xs text-slate-500">Real-time alerts on inbound user deposit vouchers, withdrawal invoices, and referenda bounty events.</p>
            </div>
            
            <span className="p-1 px-2.5 rounded bg-pink-500/10 text-pink-400 text-[10px] font-bold font-mono">
              {adminNotifications.filter(n => !n.read).length} UNREAD ALERTS
            </span>
          </div>

          {adminNotifications.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-mono border border-dashed border-slate-800 rounded-2xl">
              No recent client activity notifications received.
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-2">
              {adminNotifications.map((notif) => {
                const getNotifColor = (type: string) => {
                  if (type === 'deposit_submitted') return 'border-emerald-500/25 bg-emerald-950/20 text-emerald-400';
                  if (type === 'withdrawal_submitted') return 'border-rose-500/25 bg-[#250d18] text-rose-400';
                  return 'border-amber-500/25 bg-amber-950/20 text-amber-400';
                };

                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-slate-900/40 rounded-xl border border-slate-850 flex flex-col md:flex-row md:items-start justify-between gap-4 font-mono text-xs hover:border-slate-800 transition-all"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${getNotifColor(notif.type)}`}>
                          {notif.type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {notif.timestamp}
                        </span>
                        <span className="text-[10px] text-pink-400 font-semibold bg-[#24091a] px-1.5 py-0.2 rounded">
                          Phone: {notif.userPhone}
                        </span>
                      </div>
                      <p className="text-slate-200 font-sans text-xs leading-relaxed">
                        {notif.message}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center">
                      <button 
                        onClick={() => {
                          setActiveTab('transactions');
                          setFilterType('pending');
                        }}
                        className="px-3 py-1 bg-slate-950 hover:bg-slate-900 rounded-lg border border-slate-800 text-[10px] text-[#25D366] font-bold font-mono transition-all"
                      >
                        MANUAL VERIFY →
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
