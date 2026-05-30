import React, { useState } from 'react';
import { User, KeyRound, Phone, Users, ShieldCheck, ArrowRight } from 'lucide-react';

interface RegisterViewProps {
  onRegister: (name: string, phone: string, secret: string, referralCode?: string) => { success: boolean; message: string };
  onNavigate: (page: string) => void;
  presetReferralCode?: string;
  triggerToast: (msg: string, type: 'success' | 'error') => void;
}

export default function RegisterView({
  onRegister,
  onNavigate,
  presetReferralCode = '',
  triggerToast
}: RegisterViewProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [sponsorCode, setSponsorCode] = useState(presetReferralCode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      triggerToast('Mobile line is required to build safe transaction indices.', 'error');
      return;
    }
    if (password.length < 6) {
      triggerToast('Security password code must be at least 6 characters.', 'error');
      return;
    }

    const res = onRegister(name, phone, password, sponsorCode);
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
        <div className="absolute -top-20 -right-20 w-45 h-45 bg-[#10b981]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />
            Verified Registrar Compliance
          </div>
          <h2 className="text-2xl font-black font-display text-white tracking-tight">
            Register Investor Profile
          </h2>
          <p className="text-xs text-gray-400">
            Open your secure private asset yield ledger in 10 seconds.
          </p>
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          <div className="space-y-1.5">
            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">
              Investor Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="e.g. Kato Julius"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 focus:border-teal-500 rounded-xl py-2.5 pl-11 pr-4 text-white text-sm focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">
              Ugandan Mobile Money Line
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="e.g. 07XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 focus:border-teal-500 rounded-xl py-2.5 pl-11 pr-4 text-white font-mono text-sm focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">
              Security Log-In Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                placeholder="Min 6 characters code"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 focus:border-teal-500 rounded-xl py-2.5 pl-11 pr-4 text-white font-mono text-sm focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block flex justify-between">
              <span>Sponsor Code (Sponsor Code)</span>
              <span className="text-[10px] text-gray-500 font-normal capitalize">Optional</span>
            </label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="e.g. INV-XXXXX"
                value={sponsorCode}
                onChange={(e) => setSponsorCode(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 focus:border-emerald-500 rounded-xl py-2.5 pl-11 pr-4 text-white font-mono uppercase text-sm focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-xs uppercase tracking-wider active:scale-95 transition-all text-center cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5 mt-6"
          >
            Create Secured Ledger Account
            <ArrowRight className="w-4 h-4 animate-bounce-slow" />
          </button>
        </form>

        <div className="text-center text-xs font-medium font-mono text-gray-500 pt-4 border-t border-gray-900/60">
          <button
            onClick={() => onNavigate('login')}
            className="text-gray-400 hover:text-white bg-transparent border-none cursor-pointer outline-none block mx-auto underline text-xs"
          >
            Already registered? <span className="text-emerald-400 font-bold">Sign In here</span>
          </button>
        </div>

      </div>
    </div>
  );
}
