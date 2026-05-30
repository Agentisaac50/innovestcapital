import React, { useState } from 'react';
import { 
  PlusCircle, ArrowDownRight, Sparkles, Copy, Check, Users, MessageSquare, 
  ExternalLink, TrendingUp, AlertCircle, Clock, CheckCircle2, ShieldAlert, ShieldCheck, Wallet, ArrowUpRight,
  Lock, Unlock, Award
} from 'lucide-react';
import { motion } from 'motion/react';
import { User, Investment, Transaction } from '../types';

interface DashboardViewProps {
  currentUser: User;
  investments: Investment[];
  transactions: Transaction[];
  onOpenModal: (modalId: 'deposit' | 'invest' | 'withdraw') => void;
  inviteStats?: {
    totalInvited: number;
    withActiveInvestments: number;
    invitees: any[];
  };
}

export default function DashboardView({
  currentUser,
  investments,
  transactions,
  onOpenModal,
  inviteStats = { totalInvited: 0, withActiveInvestments: 0, invitees: [] }
}: DashboardViewProps) {
  // Tabs within Statement Ledger Logs
  const [activeTab, setActiveTab] = useState<'all' | 'deposit' | 'withdraw' | 'yields'>('all');

  // Copy-related feedback states
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter user's specific investments and transactions
  const userInvestments = investments.filter(inv => inv.userId === currentUser.id);
  const userTransactions = transactions.filter(tx => tx.userId === currentUser.id);

  // Dynamic filter lists
  const filteredTransactions = userTransactions.filter(tx => {
    if (activeTab === 'all') return true;
    if (activeTab === 'deposit') return tx.type === 'Deposit';
    if (activeTab === 'withdraw') return tx.type === 'Withdrawal';
    if (activeTab === 'yields') return tx.type === 'Yield_Payout' || tx.type === 'Ref_Bonus';
    return true;
  });

  const getSponsorshipLink = () => {
    if (typeof window !== 'undefined') {
      const base = window.location.origin;
      return `${base}/?ref=${currentUser.referralCode}`;
    }
    return `http://localhost:3000/?ref=${currentUser.referralCode}`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentUser.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getSponsorshipLink());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-8 px-4 max-w-6xl mx-auto pb-16">
      
      {/* 1. GREETING HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-950 p-6 rounded-3xl border border-gray-905 mt-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-xl md:text-2xl font-black font-display text-white">
              Welcome back, {currentUser.name}
            </h1>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Secure
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Secure client ledger session is fully encrypted and operational.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 px-4 py-2.5 rounded-2xl shrink-0 self-start md:self-auto">
          <Users className="w-4 h-4 text-emerald-400" />
          <div className="text-[10px]">
            <span className="text-gray-500 font-mono block">SPONSOR CODE</span>
            <span className="font-mono font-bold text-white tracking-wider">{currentUser.referralCode}</span>
          </div>
        </div>
      </div>

      {/* 2. PORTFOLIO CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* A. Balance Statements */}
        <div className="bg-gray-950 border border-gray-900 rounded-3xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">Statements Balance</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="font-mono text-xl font-bold text-white">
              UGX {currentUser.balance.toLocaleString()}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => onOpenModal('deposit')}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[10px] uppercase shadow-md cursor-pointer font-sans active:scale-95 transition-all outline-none border-none"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Fund Wallet
            </button>
            <button
              onClick={() => onOpenModal('withdraw')}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-850 border border-gray-800 text-amber-500 hover:border-amber-500/20 font-bold text-[10px] uppercase cursor-pointer font-sans active:scale-95 transition-all outline-none"
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              Liquidate
            </button>
          </div>
        </div>

        {/* B. Total Invested */}
        <div className="bg-gray-950 border border-gray-900 rounded-3xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">Active Capital</span>
              <TrendingUp className="w-4 h-4 text-teal-400" />
            </div>
            <div className="font-mono text-xl font-bold text-teal-400">
              UGX {currentUser.totalInvested.toLocaleString()}
            </div>
          </div>
          
          <button
            onClick={() => onOpenModal('invest')}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#0a1321] border border-teal-500/30 hover:border-teal-400 text-teal-300 font-bold text-[10px] uppercase cursor-pointer font-sans active:scale-95 transition-all outline-none"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            Deploy Contract
          </button>
        </div>

        {/* C. Accumulated Yields */}
        <div className="bg-gray-950 border border-gray-900 rounded-3xl p-6 flex flex-col justify-center">
          <div className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-1">Accumulated Return</div>
          <div className="font-mono text-xl font-bold text-white mb-1">
            UGX {currentUser.totalEarnings.toLocaleString()}
          </div>
          <div className="text-[10px] text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" />
            From 10% daily cycles
          </div>
        </div>

        {/* D. Affiliate Commissions */}
        <div className="bg-gray-950 border border-gray-900 rounded-3xl p-6 flex flex-col justify-center">
          <div className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-1">Affiliate Bounties</div>
          <div className="font-mono text-xl font-bold text-amber-500 mb-1">
            UGX {currentUser.referralBonus.toLocaleString()}
          </div>
          <div className="text-[10px] text-gray-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-amber-500/80" />
            10% Instant Cash Credits
          </div>
        </div>

      </div>

      {/* 2.5 WELCOME BONUS VERIFICATION PROGRESS WIDGET */}
      <div id="welcome-bonus-widget" className="relative bg-[#061e12]/40 border border-emerald-500/20 rounded-3xl p-6 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              INNOVEST Welcome Signup Bonus
            </div>
            <h3 className="text-lg font-bold text-white flex flex-wrap items-center gap-2">
              <span>🎁 UGX 5,000 Free Signup Capital</span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 uppercase tracking-wider ${
                inviteStats.withActiveInvestments >= 5 
                  ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-400' 
                  : 'bg-amber-950/80 border border-amber-500/30 text-amber-400'
              }`}>
                {inviteStats.withActiveInvestments >= 5 ? (
                  <>
                    <Unlock className="w-3 h-3 text-emerald-400 animate-pulse" />
                    Withdrawable
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-amber-400" />
                    Locked (Progress: {inviteStats.withActiveInvestments}/5)
                  </>
                )}
              </span>
            </h3>
            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
              New user signup verification bonus of <strong className="text-emerald-300 font-mono">UGX 5,000</strong> has been loaded onto your available balance! To authorize liquidation cashing out for this welcome gift, invite at least <strong className="text-white font-mono">5 partners</strong> to join the INNOVEST platform who each deploy an active yield contract.
            </p>
          </div>

          <div className="bg-[#05110b] border border-emerald-500/15 rounded-2xl p-4 shrink-0 w-full lg:w-72 space-y-3 font-mono">
            <div className="flex justify-between items-center text-[10px] text-gray-400">
              <span>QUALIFIED REFERRALS:</span>
              <strong className="text-emerald-400 font-bold">{inviteStats.withActiveInvestments} / 5</strong>
            </div>
            
            {/* Visual 5-segment track progress bar */}
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((idx) => (
                <div 
                  key={idx} 
                  className={`h-2.5 rounded-full border transition-all ${
                    inviteStats.withActiveInvestments >= idx 
                      ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                      : 'bg-gray-900 border-gray-800'
                  }`}
                  title={inviteStats.withActiveInvestments >= idx ? `Active Referral #${idx} Checked` : `Referral #${idx} Pending`}
                />
              ))}
            </div>

            {/* List of micro referrals */}
            {inviteStats.invitees.length > 0 ? (
              <div className="space-y-1.5 pt-1 text-[9px] max-h-[80px] overflow-y-auto pr-1 scrollbar-thin">
                {inviteStats.invitees.map((inv, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-950/40 p-1 px-2 border border-gray-900 rounded">
                    <span className="text-gray-400 uppercase truncate max-w-[120px]">{inv.name}</span>
                    <span className={`font-bold font-mono ${inv.hasInvested ? 'text-emerald-400 font-bold' : 'text-amber-500 font-bold'}`}>
                      {inv.hasInvested ? '✓ INVESTED' : '⏳ ACTIVE INVS PENDING'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[9px] text-center text-gray-500 italic pb-1">No registrations with your invite code yet</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. DEDICATED WHATSAPP COMMUNITY ASSISTANCE WIDGET */}
      <div className="bg-gradient-to-br from-emerald-950/20 to-gray-950 border border-emerald-500/20 rounded-3xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#25D366] animate-pulse" />
              <h4 className="font-display font-bold text-white uppercase tracking-wider text-xs md:text-sm">
                INNOVEST UG SUPPORT DESK & GROUP CHAT
              </h4>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-2xl font-sans">
              Need validation for your deposits? Want to discuss strategies with other verified Ugandan portfolios?
              Join our active community WhatsApp Support Group for real-time guidance, alerts, and priority admin assistance. You can also chat 1-on-1 with customer service.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            {/* WhatsApp Public group join link strictly specified */}
            <a
              href="https://chat.whatsapp.com/KXlGh4S26RgFjneMOcNpf8"
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-[10px] uppercase rounded-xl transition-all font-sans active:scale-95 shadow-md shadow-[#25d366]/10 text-center"
            >
              <Users className="w-4 h-4 shrink-0" />
              Join Support Group
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>

            <a
              href="https://wa.me/256749508233?text=Hello%20INNOVEST%20CAPITAL,%20I%20want%20to%20invest"
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-3 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-200 font-bold text-[10px] uppercase rounded-xl transition-all font-sans active:scale-95 text-center"
            >
              <MessageSquare className="w-4 h-4 shrink-0 text-[#25D366]" />
              1-on-1 Help
            </a>
          </div>
        </div>
      </div>

      {/* 4. ACTIVE CONTRACTS POOL LIST */}
      <div id="active-contracts" className="bg-gray-950 border border-gray-900 rounded-3xl p-6 space-y-6 scroll-mt-20">
        <div>
          <h3 className="font-display font-black text-lg text-white">
            Active Yield Contracts ({userInvestments.length})
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            These contracts produce daily 10% principal returns systematically paid directly to statements.
          </p>
        </div>

        {userInvestments.length === 0 ? (
          <div className="border border-dashed border-gray-850 rounded-2xl py-10 px-4 text-center space-y-4">
            <span className="text-4xl">🏜️</span>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-xs">No Capital Contracts Found</h4>
              <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                Select 'Deploy Contract' above to instantiate 10% daily cycles backed by our liquidity reserves ecosystem.
              </p>
            </div>
            
            <button
              onClick={() => onOpenModal('invest')}
              className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white text-emerald-400 font-bold text-[10px] uppercase transition-all shadow-sm outline-none cursor-pointer"
            >
              Instantiate Yield Contract
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userInvestments.map((inv) => {
              const totalReturns = inv.principal * 7.2; // 720% overall ROI
              const completionPercent = Math.min(
                100,
                Math.round(((inv.totalDays - inv.daysRemaining) / inv.totalDays) * 100)
              );

              return (
                <div key={inv.id} className="bg-gray-900 border border-gray-850 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xl">
                          {inv.planType === 'Starter' ? '🌱' : inv.planType === 'Growth' ? '🌿' : inv.planType === 'Premium' ? '🚀' : '👑'}
                        </span>
                        <h4 className="font-bold text-white text-sm">
                          {inv.planType} Yield Tier
                        </h4>
                      </div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-gray-500 block">
                        DEPLOYED: {new Date(inv.activatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[9px] font-bold ${
                      inv.daysRemaining > 0 
                        ? 'bg-emerald-505/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-gray-800 text-gray-500'
                    }`}>
                      {inv.daysRemaining > 0 ? (
                        <>
                          <Clock className="w-3 h-3 animate-spin-slow shrink-0" />
                          Accumulating
                        </>
                      ) : 'Completed'}
                    </span>
                  </div>

                  {/* Portfolio Stats Row */}
                  <div className="grid grid-cols-3 gap-2 bg-gray-950/60 p-3 rounded-xl border border-gray-950 font-mono text-[10px] md:text-xs">
                    <div>
                      <span className="text-gray-500 block text-[8px] uppercase">Principal</span>
                      <span className="font-bold text-gray-200">UGX {inv.principal.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[8px] uppercase">Daily ROI</span>
                      <span className="font-bold text-emerald-400">UGX {inv.dailyPay.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[8px] uppercase">Accrued</span>
                      <span className="font-bold text-teal-300">UGX {inv.earningsEarned.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Yield Gauge Progress Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
                      <span>Cycle Complete: {completionPercent}%</span>
                      <span>{inv.daysRemaining} of {inv.totalDays} Days Left</span>
                    </div>
                    <div className="w-full bg-gray-950 h-2 rounded-full overflow-hidden border border-gray-950">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. STATEMENT LEDGERS HISTORY TABLE */}
      <div id="ledger-sheets" className="bg-gray-950 border border-gray-900 rounded-3xl p-6 space-y-6 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-black text-lg text-white">
              Statement Audit Ledger Sheets
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Complete chronological flow of cash deposits, contract fees, referral bounties, and liquidations.
            </p>
          </div>

          {/* Filtering Tabs */}
          <div className="flex flex-wrap gap-1 bg-gray-900 border border-gray-800 p-1 rounded-xl font-mono text-[10px] font-bold">
            {[
              { id: 'all', title: 'All' },
              { id: 'deposit', title: 'Deposits' },
              { id: 'withdraw', title: 'Liquidations' },
              { id: 'yields', title: 'Yield & Ref' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg uppercase cursor-pointer outline-none transition-colors border-none ${
                  activeTab === tab.id ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white bg-transparent'
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Sheet List */}
        {filteredTransactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-500 font-mono">
            No transaction ledger matching this classification category.
          </div>
        ) : (
          <div className="overflow-x-auto pr-1">
            <table className="w-full text-left text-xs font-sans min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-900 text-gray-500 text-[9px] uppercase font-mono pb-2">
                  <th className="pb-3">Transaction UID / Date</th>
                  <th className="pb-3">Classification</th>
                  <th className="pb-3">Value (UGX)</th>
                  <th className="pb-3">Details / Reference ID</th>
                  <th className="pb-3 text-right">Status Block</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900/50">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-900/20 text-gray-300">
                    <td className="py-3.5 pr-2">
                      <div className="font-mono text-gray-400 text-[10px] font-bold">
                        {tx.id.toUpperCase()}
                      </div>
                      <span className="text-[9px] font-mono text-gray-500 block mt-0.5">
                        {new Date(tx.timestamp).toLocaleString()}
                      </span>
                    </td>

                    <td className="py-3.5 pr-2">
                      <span className={`inline-block px-2 py-0.5 rounded-md font-mono text-[9px] font-bold ${
                        tx.type === 'Deposit' ? 'bg-emerald-950/40 text-emerald-400' :
                        tx.type === 'Withdrawal' ? 'bg-amber-950/40 text-amber-500' :
                        tx.type === 'Investment' ? 'bg-gray-900 text-gray-400' :
                        tx.type === 'Yield_Payout' ? 'bg-teal-950/40 text-teal-300' :
                        'bg-purple-950/40 text-purple-300'
                      }`}>
                        {tx.type.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 pr-2 font-mono font-bold">
                      {tx.type === 'Deposit' || tx.type === 'Yield_Payout' || tx.type === 'Ref_Bonus' ? '+' : '-'} 
                      UGX {tx.amount.toLocaleString()}
                    </td>

                    <td className="py-3.5 pr-2 max-w-[200px] truncate text-[11px] font-sans leading-relaxed text-gray-400">
                      {tx.details} 
                      {tx.txId && (
                        <span className="font-mono text-[9px] block text-emerald-400/80 font-semibold mt-0.5 uppercase">
                          Ref: {tx.txId}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 text-right pl-2">
                      <motion.span 
                        initial={{ opacity: 0, scale: 0.9, y: 3 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        whileHover={{ scale: 1.05, filter: "brightness(1.15)" }}
                        transition={{ type: "spring", stiffness: 450, damping: 25 }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[9px] font-bold border ${
                          tx.status === 'Approved' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.06)]' :
                          tx.status === 'Pending' ? 'bg-amber-950/40 text-amber-400 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.06)]' :
                          'bg-red-950/40 text-red-400 border-red-500/10'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          tx.status === 'Approved' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' :
                          tx.status === 'Pending' ? 'bg-amber-400 animate-pulse' :
                          'bg-red-500'
                        }`} />
                        {tx.status}
                      </motion.span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-[10px] text-gray-500 leading-normal bg-[#030712]/40 rounded-xl px-4 py-3 border border-gray-850">
          <span className="font-semibold text-emerald-400/80">LEDGER NOTICE:</span> Initial validation tickets (such as fresh standard deposit checks) reside as <span className="text-amber-400 font-bold">Pending</span> first. The administrator reviews transactions sequentially. For rapid platform evaluation, approve or decline pending transaction rows on the fly using the simulation controls at the landing interface.
        </div>
      </div>

      {/* 6. REFERRAL INVITATIONS NETWORK */}
      <div id="referral-hub" className="bg-[#0b101c] border border-gray-900 rounded-3xl p-6 gap-6 grid grid-cols-1 md:grid-cols-2 relative overflow-hidden scroll-mt-20">
        {/* Radial backing */}
        <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-amber-550/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
        
        <div className="space-y-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider font-mono">
            👥 Referral Bounty Ecosystem
          </div>
          <h3 className="font-display font-black text-xl text-white">
            10% Instant Affiliate Bounty
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            Help grow Uganda's premium safe investment node. Copy your verified referral code below and share it with your professional connections. When they activate any yield tier package, our systematic ledger credits an instant 10% affiliate bonus (e.g. UGX 50,000 for an Elite license) straight to your balance.
          </p>
        </div>

        <div className="bg-gray-950 p-5 rounded-2xl border border-gray-900 space-y-4 flex flex-col justify-center relative z-10">
          {/* Code block */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono text-gray-500 block uppercase font-bold">Sponsor Code</span>
            <div className="flex justify-between items-center bg-[#070b12] px-3.5 py-2 rounded-xl border border-gray-900 font-mono">
              <span className="font-black text-amber-400 tracking-wider text-sm">{currentUser.referralCode}</span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="bg-transparent border-none text-gray-400 hover:text-white cursor-pointer active:scale-95 transition-all outline-none"
              >
                {copiedCode ? (
                  <Check className="w-4 h-4 text-emerald-400 animate-pulse" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Direct Link Block */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono text-gray-500 block uppercase font-bold">Sponsorship Invite URL</span>
            <div className="flex justify-between items-center bg-[#070b12] px-3.5 py-2 rounded-xl border border-gray-900 font-mono">
              <span className="text-gray-400 text-[10px] truncate max-w-[200px] inline-block font-medium">
                {getSponsorshipLink()}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="bg-transparent border-none text-gray-400 hover:text-white cursor-pointer active:scale-95 transition-all outline-none shrink-0"
              >
                {copiedLink ? (
                  <Check className="w-4 h-4 text-emerald-400 animate-pulse" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
