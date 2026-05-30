import React from 'react';
import { X, CheckCircle, Clock, ShieldCheck, ArrowUpRight, ArrowDownLeft, ExternalLink } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export default function TransactionReceiptModal({ transaction, onClose }: TransactionReceiptModalProps) {
  if (!transaction) return null;

  const isDeposit = transaction.type === 'Deposit';
  
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[3000] flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 relative shadow-2xl overflow-hidden font-sans">
        
        {/* Decorative ambient background glowing circular meshes */}
        <div className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isDeposit ? 'bg-emerald-500' : 'bg-amber-500'
        }`} />

        <div className="text-center pt-2 space-y-4 relative z-10">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-slate-900 border border-slate-800 shadow-inner">
            {isDeposit ? (
              <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ArrowUpRight className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800/80 text-[10px] font-bold font-mono tracking-widest uppercase text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-450 animate-pulse shrink-0" />
              PENDING AUDIT SECURE
            </span>
            <h3 className="text-xl font-black font-display text-white tracking-tight pt-1">
              {isDeposit ? 'Deposit Ticket Submitted' : 'Withdrawal Request Logged'}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Your transaction has been securely broadcast to our Ugandan ledger nodes and scheduled for immediate audit review.
            </p>
          </div>
        </div>

        {/* Transaction detailed specifications */}
        <div className="bg-[#070c18] border border-slate-850 rounded-2xl p-5 mt-6 mb-6 space-y-4 font-sans relative z-10">
          <div className="text-center pb-3 border-b border-slate-850/60">
            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">AMOUNT REVIEW INDEX</span>
            <span className="text-3xl font-black text-white font-mono tracking-tight mt-1 inline-block">
              UGX {transaction.amount.toLocaleString()}
            </span>
            {!isDeposit && (
              <div className="mt-2.5 flex justify-center gap-4 text-[11px] font-mono text-slate-400 bg-slate-900/40 p-1.5 rounded-lg border border-slate-900">
                <span>Fee (5%): <strong className="text-amber-500">UGX {(transaction.amount * 0.05).toLocaleString()}</strong></span>
                <span className="text-slate-700">|</span>
                <span>Net Recv: <strong className="text-emerald-400">UGX {(transaction.amount * 0.95).toLocaleString()}</strong></span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-y-3.5 text-xs pt-1">
            <div>
              <span className="text-slate-500 text-[10px] font-bold block uppercase tracking-wider">Transaction Type</span>
              <span className={`font-extrabold text-[11px] ${isDeposit ? 'text-emerald-400' : 'text-amber-400'}`}>
                {transaction.type}
              </span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] font-bold block uppercase tracking-wider">Status Indicator</span>
              <span className="inline-flex items-center gap-1 font-bold text-amber-450 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-450 animate-ping" />
                Under Audit
              </span>
            </div>

            {transaction.txId && (
              <div className="col-span-2">
                <span className="text-slate-500 text-[10px] font-bold block uppercase tracking-wider">Validation Ref Code</span>
                <span className="font-mono text-[11px] text-emerald-450 font-extrabold tracking-wide uppercase">
                  {transaction.txId}
                </span>
              </div>
            )}

            <div className="col-span-2">
              <span className="text-slate-500 text-[10px] font-bold block uppercase tracking-wider">Allocation Target</span>
              <span className="text-[11px] text-slate-300 leading-normal font-sans">
                {transaction.details}
              </span>
            </div>

            <div className="col-span-2">
              <span className="text-slate-500 text-[10px] font-bold block uppercase tracking-wider">Submission Date</span>
              <span className="font-mono text-[10px] text-slate-400">
                {new Date(transaction.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Security / Compliance information row */}
        <div className="bg-slate-900/50 border border-slate-800/40 rounded-xl px-4 py-3 text-[10.5px] leading-relaxed text-slate-400 flex items-start gap-2.5 mb-6 relative z-10">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p>
            This transaction is secured by the <strong className="text-slate-300 font-bold">INNOVEST Capital Escrow guidelines</strong>. Our compliance team verifies details systematically.
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onClose}
          className="w-full py-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider active:scale-95 transition-all text-center cursor-pointer shadow-md flex items-center justify-center gap-2 relative z-10 outline-none"
        >
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          Acknowledge & Close
        </button>

      </div>
    </div>
  );
}
