import React, { useState } from 'react';
import { Lock, Phone, KeyRound, AlertCircle, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';

interface LoginViewProps {
  onLogin: (phone: string, secret: string) => { success: boolean; message: string };
  onNavigate: (page: string) => void;
  triggerToast: (msg: string, type: 'success' | 'error') => void;
}

export default function LoginView({ onLogin, onNavigate, triggerToast }: LoginViewProps) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      triggerToast('Please specify your mobile number.', 'error');
      return;
    }
    if (password.length < 6) {
      triggerToast('Password must be at least 6 characters.', 'error');
      return;
    }

    const res = onLogin(phone, password);
    if (res.success) {
      triggerToast(res.message, 'success');
      onNavigate('dashboard');
    } else {
      triggerToast(res.message, 'error');
    }
  };

  return (
    <div className="max-w-md w-full mx-auto px-4 py-16">
      <div className="bg-gray-950 border border-gray-900 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
        
        {/* Radial backing */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            Client Vault Access
          </div>
          <h2 className="text-2xl font-black font-display text-white tracking-tight">
            Sign In to Yield Portfolio
          </h2>
          <p className="text-xs text-gray-400">
            Securely access your statement log and capital allocations.
          </p>
        </div>

        {/* Main form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          <div className="space-y-1.5">
             <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">
              Ugandan Mobile Line (MTN / Airtel)
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="e.g. 0749508233"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 focus:border-teal-500 rounded-xl py-2.5 pl-11 pr-4 text-white font-mono text-sm focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">
              Platform Password Code
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 focus:border-teal-500 rounded-xl py-2.5 pl-11 pr-4 text-white font-mono text-sm focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-xs uppercase tracking-wider active:scale-95 transition-all text-center cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5"
          >
            Authenticate Credentials
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex flex-col gap-2 pt-2 text-center text-xs font-medium font-mono text-gray-500 border-t border-gray-900/60">
          <button
            onClick={() => onNavigate('register')}
            className="text-gray-400 hover:text-white bg-transparent border-none cursor-pointer outline-none mt-1"
          >
            Need a fresh custom profile? <span className="text-teal-400 underline font-bold">Register here</span>
          </button>
        </div>

      </div>
    </div>
  );
}
