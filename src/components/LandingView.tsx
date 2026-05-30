import React, { useState } from 'react';
import { 
  ArrowRight, Shield, ShieldCheck, ChevronDown, ChevronUp, Users, 
  HelpCircle, Info, Coins, Clock, Sparkles, Send, CheckCircle2, MessageSquare, ExternalLink
} from 'lucide-react';
import SimulatorPanel from './SimulatorPanel';
import { SystemStats, YieldPlan, DEFAULT_PLANS } from '../types';

interface LandingViewProps {
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
  onOpenModal: (modalId: 'deposit' | 'invest' | 'withdraw') => void;
  systemStats: SystemStats;
  onAdvanceDay: () => void;
  onSimulateReferral: () => void;
  onApproveAllLedgers: () => void;
  onRejectAllLedgers: () => void;
  onFactoryReset: () => void;
  plans?: YieldPlan[];
}

export default function LandingView({
  onNavigate,
  isLoggedIn,
  onOpenModal,
  systemStats,
  onAdvanceDay,
  onSimulateReferral,
  onApproveAllLedgers,
  onRejectAllLedgers,
  onFactoryReset,
  plans
}: LandingViewProps) {
  // FAQ accordion active state index
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const activePlans = plans || DEFAULT_PLANS;
  const PLANS = activePlans.map(p => {
    const totalReturn = p.daily * p.totalDays;
    const roiFactor = p.price > 0 ? ((totalReturn / p.price) * 100).toFixed(0) : '0';
    return {
      type: p.type,
      price: p.price,
      daily: p.daily,
      icon: p.icon,
      best: p.type === 'Premium',
      perks: [
        `Daily yields of UGX ${p.daily.toLocaleString()}`,
        'Direct statement payouts',
        `Cycle period: ${p.totalDays} Days`,
        `Total return: UGX ${totalReturn.toLocaleString()} (${roiFactor}% ROI)`,
        p.type === 'Starter' ? 'SSL Encryption verification' :
        p.type === 'Growth' ? '10% Instant Sponsor Affiliate Bonus' :
        p.type === 'Premium' ? 'VIP WhatsApp priority queue support' :
        'Direct account manager support'
      ]
    };
  });

  const FAQs = [
    {
      q: "What is INNOVEST CAPITAL UGANDA?",
      a: "INNOVEST CAPITAL is Uganda's premium digital asset allocation and institutional partner-backed yield provider. We secure stable 10% daily ROI streams through multi-signature arbitrage and liquified trading vaults, serving over 5,400 verified clients."
    },
    {
      q: "How does the daily 10% profit contract operate?",
      a: "When you fund your wallet and select a yield contract (such as Starter or Growth), your principal is allocated into secure, partner-backed liquidity pools. Every 24 hours, the system systematically generates a 10% yield installment, which is paid directly into your available balance for exactly 72 days total."
    },
    {
      q: "What is the minimum deposit and liquidation threshold?",
      a: "The minimum single account funding/deposit value is UGX 20,000. For profit cashing out or liquidation, the minimum payout transfer threshold is UGX 5,000 straight to your connected telecom line."
    },
    {
      q: "How can I verify my payment or transaction?",
      a: "When funding, click the 'Fund Account' button to pay the active automated collection line (0749508233). Paste your resulting Mobile Money reference ID or receipt sequence inside our secure submission form. The blockchain gateway immediately schedules automated verification."
    },
    {
      q: "Is there an invitations or referral reward program?",
      a: "Yes! Every verified client receives a unique referral code. When a client registers with your code and activates any yield contract, the ledger pays you an instant 10% cash affiliate bounty (e.g. UGX 10,000 for a Premium contract) directly into your withdrawable statement wallet balance."
    }
  ];

  const handlePlanClick = () => {
    if (isLoggedIn) {
      onOpenModal('invest');
    } else {
      onNavigate('register');
    }
  };

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. HERO BANNER */}
      <section className="relative px-4 pt-10 md:pt-16 max-w-6xl mx-auto overflow-hidden">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] md:text-xs font-semibold uppercase tracking-wider animate-pulse">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            URSB Registered • Secured Yield Ledger
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-display text-white tracking-tight leading-none">
            Secure Wealth Growth <br />
            <span className="text-gradient">With 10% Daily ROI</span> Tiers
          </h1>
          
          <p className="text-gray-400 text-sm md:text-base leading-relaxed font-sans max-w-2xl mx-auto">
            Deploy digital capital systematically into Uganda’s premium partner-backed liquidity cycles. Earn automated yield settlements paid out directly to your mobile money telecom account inside 24 hours.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            {isLoggedIn ? (
              <button
                onClick={() => onNavigate('dashboard')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold rounded-2xl text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all cursor-pointer font-sans"
              >
                Go To Personal Dashboard
                <ArrowRight className="w-4 h-4 text-emerald-200" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('register')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold rounded-2xl text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all cursor-pointer font-sans"
                >
                  Instantiate Free Account
                  <ArrowRight className="w-4 h-4 text-emerald-200" />
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-200 font-bold rounded-2xl text-xs uppercase tracking-wider hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all cursor-pointer font-sans"
                >
                  Direct Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 2. LIVE WHATSAPP COMMUNITY HELPDESK & GUIDANCE SECTION */}
      <section className="px-4 max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900/60 border border-emerald-550/20 rounded-3xl p-6 md:p-8 relative overflow-hidden backdrop-blur-md">
          {/* Radial glow */}
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-[10px] uppercase font-bold font-mono">
                💬 Community Assistance Active
              </div>
              
              <h2 className="text-2xl md:text-3xl font-black font-display text-white leading-tight">
                Join the INNOVEST Uganda Support Community
              </h2>
              
              <p className="text-gray-400 text-xs md:text-sm leading-relaxed font-sans">
                Do you need real-time technical assistance, payment validation guides, or portfolio tips? 
                Connect with our active African investor community and dedicated system admin support directly through our WhatsApp networks. All system guidelines, promotions, and payout notifications are synchronized here!
              </p>
            </div>
            
            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3">
              {/* WhatsApp VIP Public group link */}
              <a
                href="https://chat.whatsapp.com/KXlGh4S26RgFjneMOcNpf8"
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#25d366]/20 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all font-sans text-center cursor-pointer uppercase tracking-wider"
              >
                <Users className="w-4 h-4 shrink-0" />
                Join Support Group
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>

              {/* Direct 1-on-1 admin link */}
              <a
                href="https://wa.me/256749508233?text=Hello%20INNOVEST%20CAPITAL,%20I%20want%20to%20invest"
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 bg-gray-950 hover:bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-200 font-bold text-xs rounded-xl hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all font-sans text-center cursor-pointer uppercase tracking-wider"
              >
                <MessageSquare className="w-4 h-4 shrink-0 text-[#25D366]" />
                1-on-1 Help Desk
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SIMULATOR INTERACTIVE BOX */}
      <section className="px-4 max-w-6xl mx-auto">
        <SimulatorPanel
          onAdvanceDay={onAdvanceDay}
          onSimulateReferral={onSimulateReferral}
          onApproveAllLedgers={onApproveAllLedgers}
          onRejectAllLedgers={onRejectAllLedgers}
          onFactoryReset={onFactoryReset}
          systemStats={systemStats}
        />
      </section>

      {/* 4. PLANS SECTION */}
      <section id="plans-section" className="px-4 max-w-6xl mx-auto space-y-8 scroll-mt-20">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-black font-display text-white">
            Available Capital Yield Contracts
          </h2>
          <p className="text-gray-400 text-xs md:text-sm max-w-xl mx-auto">
            Choose the principal cycle best aligned to your portfolio goals. Backed by institutional security reserves.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.type}
              className={`bg-gray-950/60 border rounded-3xl p-6 relative flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                plan.best 
                  ? 'border-amber-500/50 hover:border-amber-400 shadow-xl shadow-amber-500/5' 
                  : 'border-gray-900 hover:border-emerald-500/40'
              }`}
            >
              {plan.best && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-gray-900 text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-md tracking-wider">
                  RECOMMENDED CONFIGURATION
                </span>
              )}

              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-3xl">{plan.icon}</span>
                  <span className="text-[10px] font-mono uppercase bg-emerald-950/40 text-emerald-400 px-2 py-0.5 rounded-md font-bold">
                    10% Daily ROI
                  </span>
                </div>

                <h3 className="font-display font-black text-xl text-white mb-1.5">{plan.type} Tier</h3>
                <div className="mb-4 text-2xl font-mono font-black text-gray-200">
                  UGX {plan.price.toLocaleString()}
                </div>

                <ul className="space-y-3 pt-4 border-t border-gray-900 text-xs text-gray-400 mb-6">
                  {plan.perks.map((perk, pIdx) => (
                    <li key={pIdx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handlePlanClick}
                className={`w-full py-3.5 rounded-2xl text-xs uppercase font-bold tracking-wider active:scale-95 transition-all text-center cursor-pointer font-sans ${
                  plan.best
                    ? 'bg-amber-500 text-gray-950 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/10'
                    : 'bg-gray-900 border border-gray-800 hover:bg-gray-850 hover:border-teal-500/40 text-gray-300'
                }`}
              >
                {isLoggedIn ? 'Activate Contract' : 'Get Started Now'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 5. INTEGRITY CORE & SECURITY MATRICES */}
      <section id="why-choose-us" className="px-4 max-w-6xl mx-auto scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              INTEGRITY MATRIX
            </div>
            <h2 className="text-3xl md:text-4xl font-black font-display text-white tracking-tight leading-tight">
              A Highly Secure Yield Environment
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              INNOVEST operates a closed private-ledger model with high collateral offsets. All transaction blocks undergo multi-signature approval guarantees to avoid liquidity risk.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex gap-3">
                <div className="p-2 rounded-xl bg-gray-900 border border-gray-800 shrink-0 text-amber-400 font-bold self-start mt-1">
                  100%
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Capital Collateral Match</h4>
                  <p className="text-xs text-gray-400 leading-normal">
                    Partner banks and institutional liquidity anchors match all incoming capital 1:1, safeguarding risk.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-2 rounded-xl bg-gray-900 border border-gray-800 shrink-0 text-emerald-400 font-bold self-start mt-1">
                  UrGent
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Automated MM Clearing Nodes</h4>
                  <p className="text-xs text-gray-400 leading-normal">
                    Deposits and withdrawals are checked systematically in real-time. Mobile Money integrations clear wallets fast.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#0d1323] border border-gray-850 rounded-3xl p-6 md:p-8 space-y-6">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-emerald-400" />
              Ugandan Regulatory Alignment Trackers
            </h3>
            
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              Our financial model complies with local guidelines. All contracts comply with registered enterprise frameworks:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-950 rounded-2xl border border-gray-900 space-y-1">
                <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400 block font-bold">URS REGISTRY</span>
                <h4 className="font-bold text-white text-xs">REG LICENCE CONTRACT</h4>
                <p className="text-[10px] text-gray-500 leading-normal">INNOVEST TRADING CO. LTD is registered as a legal trading structure.</p>
              </div>

              <div className="p-4 bg-gray-950 rounded-2xl border border-gray-900 space-y-1">
                <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400 block font-bold">TRA COMPLIANT</span>
                <h4 className="font-bold text-white text-xs">COMMODITIES TRACKING</h4>
                <p className="text-[10px] text-gray-500 leading-normal">All yield proceeds are cleared and reported securely to taxation nodes.</p>
              </div>

              <div className="p-4 bg-gray-950 rounded-2xl border border-gray-900 space-y-1">
                <span className="font-mono text-[9px] uppercase tracking-wider text-amber-500 block font-bold">UIA STANDARDS</span>
                <h4 className="font-bold text-white text-xs">UIA COMPLIANT CORE</h4>
                <p className="text-[10px] text-gray-500 leading-normal">Operational standards safeguard capital integrity across East Africa.</p>
              </div>

              <div className="p-4 bg-gray-950 rounded-2xl border border-gray-900 space-y-1">
                <span className="font-mono text-[9px] uppercase tracking-wider text-teal-400 block font-bold">BANKSEC ENCRYPTION</span>
                <h4 className="font-bold text-white text-xs">256-BIT SECURE SSL</h4>
                <p className="text-[10px] text-gray-500 leading-normal">Secure server certificates encrypt transactional values from end to end.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section id="faq" className="px-4 max-w-3xl mx-auto scroll-mt-20">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl md:text-3xl font-black font-display text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400 text-xs md:text-sm">
            Answers regarding payments, cycle terminations, audit ledger rules, and security.
          </p>
        </div>

        <div className="space-y-3">
          {FAQs.map((faq, idx) => (
            <div 
              key={idx} 
              className="bg-gray-950/80 border border-gray-900 rounded-2xl overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full text-left px-5 py-4 flex items-center justify-between font-bold text-gray-200 hover:text-white hover:bg-gray-900 text-xs md:text-sm outline-none border-none bg-transparent cursor-pointer"
              >
                <span>{faq.q}</span>
                {activeFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                )}
              </button>
              
              {activeFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-xs text-gray-400 leading-relaxed font-sans border-t border-gray-900">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      
    </div>
  );
}
