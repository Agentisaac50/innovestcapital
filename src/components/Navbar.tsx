import React, { useState } from 'react';
import { Menu, X, LogOut, LayoutDashboard, Compass, Lock, ShieldCheck, HelpCircle } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentPage: string;
  currentUser: User | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
}

export default function Navbar({
  currentPage,
  currentUser,
  onNavigate,
  onLogout,
  autoRefresh,
  onToggleAutoRefresh
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gray-950/90 border-b border-gray-900 sticky top-0 z-[1000] backdrop-blur-xl transition-all">
      <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
        
        {/* Branding Logo */}
        <div 
          onClick={() => handleLinkClick(currentUser ? 'dashboard' : 'home')} 
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 select-none group"
        >
          <div className="w-10 h-10 bg-slate-900 border border-slate-800 flex items-center justify-center rounded-2xl shadow-md overflow-hidden group-hover:scale-105 transition-transform shrink-0">
            <img 
              src="https://www.image2url.com/r2/default/images/1780121168413-6fd6e8f8-cb8a-489b-8ec0-f0ee3a9ab2f5.jpg" 
              alt="INNOVEST Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <span className="text-base md:text-lg font-black tracking-wider text-gradient font-display block leading-none">INNOVEST</span>
            <span className="text-[9px] font-bold text-gray-500 tracking-[0.2em] font-mono block mt-1">CAPITAL UGANDA</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          {currentUser ? (
            /* Logged In Navbar */
            <>
              <button
                onClick={() => handleLinkClick('dashboard')}
                className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                  currentPage === 'dashboard' ? 'text-emerald-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Ledger Console
              </button>

              <button
                onClick={() => handleLinkClick('home')}
                className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                  currentPage === 'home' ? 'text-emerald-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Compass className="w-4 h-4" />
                Investment Plans
              </button>

              <div className="h-4 w-px bg-gray-800" />

              {/* Auto Refresh Simulator switch */}
              <button
                onClick={onToggleAutoRefresh}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[10px] font-mono font-bold uppercase transition-all shadow-md cursor-pointer select-none outline-none ${
                  autoRefresh 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                    : 'bg-slate-900 border-slate-800/80 text-slate-500 hover:bg-slate-850'
                }`}
                title={autoRefresh ? "Auto-Refresh Simulator is ACTIVE" : "Auto-Refresh Simulator is PAUSED"}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                <span>Sim Engine: {autoRefresh ? 'ON' : 'OFF'}</span>
              </button>

              <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-full">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-mono text-[10px] font-bold text-gray-300">
                  {currentUser.name}
                </span>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 active:scale-95 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </>
          ) : (
            /* Public Standard Navbar */
            <>
              <button
                onClick={() => handleLinkClick('home')}
                className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white cursor-pointer"
              >
                Welcome Screen
              </button>

              <button
                onClick={() => {
                  handleLinkClick('home');
                  setTimeout(() => {
                    const el = document.getElementById('plans-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white cursor-pointer"
              >
                ROI Tiers
              </button>

              <button
                onClick={() => {
                  handleLinkClick('home');
                  setTimeout(() => {
                    const el = document.getElementById('why-choose-us');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white cursor-pointer"
              >
                Security Audit
              </button>

              <button
                onClick={() => {
                  handleLinkClick('home');
                  setTimeout(() => {
                    const el = document.getElementById('faq');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white cursor-pointer"
              >
                FAQ
              </button>

              <div className="h-4 w-px bg-gray-800" />

              <button
                onClick={() => handleLinkClick('login')}
                className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white cursor-pointer flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                Sign In
              </button>

              <button
                onClick={() => handleLinkClick('register')}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Create Account
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-gray-400 hover:text-white bg-transparent border-none cursor-pointer outline-none p-1"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-b border-gray-800 px-4 py-6 flex flex-col gap-4 animate-fade-in">
          {currentUser ? (
            <>
              <div className="flex items-center justify-between gap-2 bg-gray-950 border border-gray-850 px-3 py-2 rounded-xl mb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-mono text-xs font-bold text-gray-300">
                    Investor: {currentUser.name}
                  </span>
                </div>
                <button
                  onClick={onToggleAutoRefresh}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-mono font-bold transition-all ${
                    autoRefresh 
                      ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400' 
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  SIM: {autoRefresh ? 'ON' : 'OFF'}
                </button>
              </div>

              <button
                onClick={() => handleLinkClick('dashboard')}
                className="w-full text-left py-2 font-bold uppercase text-xs text-gray-300 hover:text-white flex items-center gap-2 cursor-pointer bg-transparent border-none"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-500" />
                Ledger Console
              </button>

              <button
                onClick={() => handleLinkClick('home')}
                className="w-full text-left py-2 font-bold uppercase text-xs text-gray-300 hover:text-white flex items-center gap-2 cursor-pointer bg-transparent border-none"
              >
                <Compass className="w-4 h-4 text-teal-400" />
                Investment Plans
              </button>

              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 font-bold uppercase text-xs text-red-400 hover:text-red-300 flex items-center gap-2 cursor-pointer bg-transparent border-none"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleLinkClick('home')}
                className="w-full text-left py-2 font-bold uppercase text-xs text-gray-400 hover:text-white cursor-pointer bg-transparent border-none"
              >
                Welcome Screen
              </button>

              <button
                onClick={() => {
                  handleLinkClick('home');
                  setTimeout(() => {
                    const el = document.getElementById('plans-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }}
                className="w-full text-left py-2 font-bold uppercase text-xs text-gray-400 hover:text-white cursor-pointer bg-transparent border-none"
              >
                ROI Tiers
              </button>

              <button
                onClick={() => {
                  handleLinkClick('home');
                  setTimeout(() => {
                    const el = document.getElementById('why-choose-us');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }}
                className="w-full text-left py-2 font-bold uppercase text-xs text-gray-400 hover:text-white cursor-pointer bg-transparent border-none"
              >
                Security Audit
              </button>

              <button
                onClick={() => {
                  handleLinkClick('home');
                  setTimeout(() => {
                    const el = document.getElementById('faq');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }}
                className="w-full text-left py-2 font-bold uppercase text-xs text-gray-400 hover:text-white cursor-pointer bg-transparent border-none"
              >
                FAQ
              </button>

              <hr className="border-gray-800" />

              <button
                onClick={() => handleLinkClick('login')}
                className="w-full py-2 font-bold uppercase text-xs text-gray-300 hover:text-white flex items-center gap-2 bg-transparent border-none cursor-pointer"
              >
                <Lock className="w-4 h-4 text-teal-400" />
                Sign In
              </button>

              <button
                onClick={() => handleLinkClick('register')}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-center rounded-xl text-xs uppercase tracking-wider shadow-md bg-transparent border-none cursor-pointer"
              >
                Create Account
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
