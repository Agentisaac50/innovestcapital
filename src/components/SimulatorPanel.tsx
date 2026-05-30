import React from 'react';
import { Sparkles, RefreshCw, Users, CheckCircle, XCircle, Trash2, Clock, Coins } from 'lucide-react';
import { SystemStats } from '../types';

interface SimulatorPanelProps {
  onAdvanceDay: () => void;
  onSimulateReferral: () => void;
  onApproveAllLedgers: () => void;
  onRejectAllLedgers: () => void;
  onFactoryReset: () => void;
  systemStats: SystemStats;
}

export default function SimulatorPanel({
  onAdvanceDay,
  onSimulateReferral,
  onApproveAllLedgers,
  onRejectAllLedgers,
  onFactoryReset,
  systemStats
}: SimulatorPanelProps) {
  return (
    <div className="w-full bg-slate-900/60 border border-emerald-500/20 rounded-3xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              INTEGRATION & SANDBOX SIMULATOR
            </h3>
          </div>
          <p className="text-xs text-gray-400">
            Simulate real-time billing cycles and state events. Fully offline ledger simulation.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onFactoryReset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold border border-red-500/20 text-red-400 hover:bg-red-500/10 active:scale-95 transition-all cursor-pointer"
            title="Reset storage & seed Ronald demo account"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Reset DB
          </button>
        </div>
      </div>

      {/* Simulator Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 bg-gray-950/40 p-4 rounded-2xl border border-gray-800">
        <div className="p-3">
          <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[9px] uppercase tracking-wider mb-1">
            <Coins className="w-3.5 h-3.5 text-emerald-500" />
            Total Distributed
          </div>
          <div className="font-mono text-xs md:text-sm font-black text-emerald-400">
            UGX {systemStats.totalPaidOut.toLocaleString()}
          </div>
        </div>

        <div className="p-3 border-l border-gray-800">
          <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[9px] uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5 text-teal-400" />
            Active Investors
          </div>
          <div className="font-mono text-xs md:text-sm font-bold text-white">
            {systemStats.activeInvestors.toLocaleString()}
          </div>
        </div>

        <div className="p-3 border-l border-gray-800">
          <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[9px] uppercase tracking-wider mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Simulation Speed
          </div>
          <div className="font-mono text-xs md:text-sm font-bold text-amber-400">
            72 Days (720% ROI)
          </div>
        </div>

        <div className="p-3 border-l border-gray-800">
          <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[9px] uppercase tracking-wider mb-1">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            Status Support
          </div>
          <div className="font-mono text-xs md:text-sm font-bold text-teal-300">
            {systemStats.support}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <button
          onClick={onAdvanceDay}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 active:scale-95 transition-all text-center cursor-pointer font-sans"
        >
          <RefreshCw className="w-4 h-4 text-emerald-200 animate-spin-slow" />
          Advance 24 Hours
        </button>

        <button
          onClick={onSimulateReferral}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-950 border border-teal-500/30 hover:border-teal-400 hover:bg-gray-900 text-teal-300 font-bold text-xs rounded-xl active:scale-95 transition-all text-center cursor-pointer font-sans"
        >
          <Users className="w-4 h-4 text-teal-400" />
          Simulate Referral Join
        </button>

        <button
          onClick={onApproveAllLedgers}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-950/80 border border-emerald-500/40 hover:bg-emerald-900 text-emerald-300 font-bold text-xs rounded-xl active:scale-95 transition-all text-center cursor-pointer font-sans"
        >
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          Approve Pending Ledgers
        </button>

        <button
          onClick={onRejectAllLedgers}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-red-950/40 border border-red-500/20 hover:bg-red-950 text-red-300 font-bold text-xs rounded-xl active:scale-95 transition-all text-center cursor-pointer font-sans"
        >
          <XCircle className="w-4 h-4 text-red-400" />
          Decline Pending Ledgers
        </button>
      </div>

      <div className="mt-4 text-[10px] text-gray-500 leading-relaxed bg-[#030712]/40 rounded-xl px-4 py-3 border border-gray-800">
        <span className="font-semibold text-emerald-400/80">SANDBOX TIP:</span> Advancing 24 hours forces the active contracts of all platform portfolios to yield a daily 10% ROI installment, paid directly into user statements balances. Simulating a referral registers a new Ugandan invitee who deposits UGX 100,000, sending an instant 10% cash bonus of UGX 10,000 to your ledger!
      </div>
    </div>
  );
}
