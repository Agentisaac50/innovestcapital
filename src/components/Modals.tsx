import React, { useState } from 'react';
import { X, Copy, Check, AlertCircle, Sparkles, Shield, ArrowRight, Wallet, CheckCircle2, ExternalLink } from 'lucide-react';
import { YieldPlan, DEFAULT_PLANS } from '../types';

interface ModalsProps {
  modalId: 'deposit' | 'invest' | 'withdraw' | null;
  onClose: () => void;
  currentUserBalance: number;
  onDepositSubmit: (amount: number, txId: string) => void;
  onInvestSubmit: (planType: 'Starter' | 'Growth' | 'Premium' | 'Elite') => void;
  onWithdrawSubmit: (amount: number, phone: string) => void;
  plans?: YieldPlan[];
  withdrawalFeePercent?: number;
}

export default function Modals({
  modalId,
  onClose,
  currentUserBalance,
  onDepositSubmit,
  onInvestSubmit,
  onWithdrawSubmit,
  plans,
  withdrawalFeePercent = 5
}: ModalsProps) {
  if (!modalId) return null;

  // State for deposit modal
  const [depositAmount, setDepositAmount] = useState<number>(20000);
  const [depositTxId, setDepositTxId] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // State for withdraw modal
  const [withdrawAmount, setWithdrawAmount] = useState<number>(15000);
  const [withdrawPhone, setWithdrawPhone] = useState<string>('');

  const GATEWAY_NUMBER = '0749508233';

  const handleCopyGateway = () => {
    navigator.clipboard.writeText(GATEWAY_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount < 20000) return;
    if (!depositTxId.trim()) return;
    onDepositSubmit(depositAmount, depositTxId);
    setDepositTxId('');
    onClose();
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount < 15000) return;
    if (!withdrawPhone.trim()) return;
    onWithdrawSubmit(withdrawAmount, withdrawPhone);
    setWithdrawPhone('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-6 relative shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white bg-transparent border-none cursor-pointer focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. DEPOSIT MODAL */}
        {modalId === 'deposit' && (
          <div>
            <h3 className="text-xl font-bold font-display text-white mb-1.5 flex items-center gap-2">
              📥 Fund Account Wallet
            </h3>
            <p className="text-gray-400 text-xs mb-5">
              Submit funds securely using MTN Mobile Money or Airtel Money networks.
            </p>

            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3.5 rounded-2xl text-xs mb-5 flex gap-2">
              <AlertCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold">Deposit requirement:</p>
                <p className="text-[11px] mt-0.5 leading-relaxed text-gray-300">
                  Minimum deposit is <strong className="text-white">UGX 20,000</strong>. You can make an automated payment instantly or send manually to the designated mobile number, then submit your transaction receipt reference.
                </p>
              </div>
            </div>

            {/* DIRECT ONLINE DEPOSIT ROUTER */}
            <div className="mb-5">
              <a
                href="https://wallet.wearemarz.com/pay/0a40b0f6-c733-427b-b74f-34c62d495d58"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-extrabold text-[11px] uppercase tracking-wider transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-teal-500/15 cursor-pointer no-underline decoration-none"
              >
                <span>⚡ Make Automated Online Deposit</span>
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>
            </div>

            <div className="bg-gray-950 px-5 py-4 rounded-xl border border-gray-800 mb-5">
              <div className="text-[9px] uppercase tracking-widest font-bold text-gray-500 block mb-1">
                Authorized Collection Number
              </div>
              
              <div className="flex justify-between items-center bg-[#070b12] px-3.5 py-2.5 rounded-lg border border-gray-900">
                <span className="font-mono text-lg font-black text-amber-400 tracking-wider">{GATEWAY_NUMBER}</span>
                <button
                  type="button"
                  onClick={handleCopyGateway}
                  className="bg-transparent border-none text-gray-400 hover:text-white cursor-pointer active:scale-95 transition-all outline-none"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400 animate-pulse" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              <div className="flex justify-between items-center mt-3 text-[10px]">
                <span className="text-gray-400 font-medium">Merchant Corporate Name:</span>
                <span className="text-gray-200 font-bold text-teal-400">Grades N [innovestcapital]</span>
              </div>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs font-bold block mb-1.5 uppercase tracking-wider">
                  Deposit Size (UGX)
                </label>
                <input
                  type="number"
                  min="20000"
                  step="1000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-teal-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs font-bold block mb-1.5 uppercase tracking-wide">
                  Mobile Money TX / REF ID HASH
                </label>
                <input
                  type="text"
                  placeholder="e.g. MTN84591CC or Ref Code"
                  value={depositTxId}
                  onChange={(e) => setDepositTxId(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-emerald-500 font-mono uppercase"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 mt-6 shadow-lg shadow-emerald-500/10 cursor-pointer font-sans"
              >
                Submit Wallet Validation Ticket
              </button>
            </form>
          </div>
        )}

        {/* 2. CHOOSE CONTRACT MODAL */}
        {modalId === 'invest' && (
          <div className="max-w-md w-full">
            <h3 className="text-xl font-bold font-display text-white mb-1.5 flex items-center gap-2">
              🚀 Deploy Yield Contract Tier
            </h3>
            <p className="text-gray-400 text-xs mb-5">
              Deduct capital directly from your statement wallet to activate high-performance 10% daily cycles.
            </p>

            <div className="flex justify-between items-center bg-gray-950 px-4 py-3 rounded-xl border border-gray-800 text-xs mb-6 font-semibold">
              <span className="text-gray-400">Your Statements Balance:</span>
              <span className="text-emerald-400 font-mono">UGX {currentUserBalance.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {/* Plan Cards */}
              {(plans || DEFAULT_PLANS).map((plan) => {
                const isPremium = plan.type === 'Premium';
                return (
                  <div
                    key={plan.type}
                    onClick={() => onInvestSubmit(plan.type as any)}
                    className={`bg-gray-950/60 border rounded-2xl p-4 cursor-pointer text-center transition-all hover:-translate-y-0.5 max-w-full relative ${
                      isPremium ? 'border-amber-500/50 hover:border-amber-400' : 'border-gray-800 hover:border-teal-500/60'
                    }`}
                  >
                    {isPremium && (
                      <span className="absolute -top-2 right-4 bg-amber-500 text-gray-900 text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-md">
                        POPULAR
                      </span>
                    )}
                    <span className="text-2xl mb-1 block">{plan.icon}</span>
                    <h4 className="font-bold text-white text-sm mb-1">{plan.type} Plan</h4>
                    
                    <div className="bg-gray-900/50 py-1.5 px-1.5 border border-gray-800 rounded-lg text-white mb-2 max-w-full">
                      <span className="text-[8px] font-mono text-gray-500 block leading-[1]">REQUIRED DEPOSIT</span>
                      <span className="font-mono font-bold text-[11px] text-gray-200">UGX {plan.price.toLocaleString()}</span>
                    </div>
                    
                    <span className="text-emerald-400 text-[9px] font-bold block bg-emerald-950/40 rounded-full py-0.5 px-1 font-mono">
                      +UGX {plan.daily.toLocaleString()}/day
                    </span>
                  </div>
                );
              })}
            </div>
            
            <p className="text-center text-[10px] text-gray-500 mt-5 leading-relaxed">
              * Yield accumulation payouts post systematically every 24 hours. Full duration cycle spans exactly {(plans || DEFAULT_PLANS)[0].totalDays} days total.
            </p>
          </div>
        )}

        {/* 3. WITHDRAWAL MODAL */}
        {modalId === 'withdraw' && (
          <div>
            <h3 className="text-xl font-bold font-display text-white mb-1.5 flex items-center gap-2">
              📤 Profit Liquidation Transfer
            </h3>
            <p className="text-gray-400 text-xs mb-5">
              Liquidate accumulated earnings directly to your mobile money telecom account.
            </p>

            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-3.5 rounded-2xl text-xs mb-5 flex gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="font-semibold">Processing Guidelines:</p>
                <p className="text-[11px] mt-0.5 leading-relaxed text-gray-300">
                  Minimum liquidation amount is <strong className="text-white">UGX 15,000</strong>. A {withdrawalFeePercent}% platform processing fee applies to each transfer. Secure audits execute instantly via telecom networks within standard SLA operations.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center bg-gray-950 px-4 py-3 rounded-xl border border-gray-800 text-xs mb-5 font-semibold">
              <span className="text-gray-400">Available Wallet Statement Balance:</span>
              <span className="text-teal-400 font-mono">UGX {currentUserBalance.toLocaleString()}</span>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs font-bold block mb-1.5 uppercase tracking-wider">
                  Liquidation Value (UGX)
                </label>
                <input
                  type="number"
                  min="15000"
                  max={currentUserBalance}
                  step="1000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-teal-500 font-mono"
                  required
                />
                
                {withdrawAmount >= 15000 && (
                  <div className="mt-2 text-[10.5px] bg-[#0c1322] border border-gray-800/60 rounded-lg p-2.5 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Operational Surcharge ({withdrawalFeePercent}%):</span>
                      <span className="text-amber-500 font-mono font-bold">UGX {Math.floor(withdrawAmount * (withdrawalFeePercent / 100)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-800/30 pt-1 mt-1">
                      <span className="text-gray-400 font-bold">Net Yield payout received:</span>
                      <span className="text-emerald-400 font-mono font-extrabold">UGX {Math.max(0, withdrawAmount - Math.floor(withdrawAmount * (withdrawalFeePercent / 100))).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-gray-400 text-xs font-bold block mb-1.5 uppercase tracking-wide">
                  MTN / Airtel Mobile Money Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 07XXXXXXXX"
                  value={withdrawPhone}
                  onChange={(e) => setWithdrawPhone(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-teal-500 font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={currentUserBalance < withdrawAmount || withdrawAmount < 15000}
                className="disabled:opacity-40 disabled:cursor-not-allowed w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 mt-6 shadow-lg shadow-amber-500/10 cursor-pointer font-sans"
              >
                Initialize Payout Transfer
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
