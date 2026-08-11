'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    localStorage.removeItem('kaksedthan_logged_out');
    localStorage.setItem('kaksedthan_user_session', 'active');
    document.cookie = 'kaksedthan_token=active_session; path=/; max-age=86400';

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 600);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#dc5c15]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white text-slate-900 border border-slate-200 rounded-3xl p-8 shadow-2xl space-y-6 relative z-10">
        
        {/* Header Branding with Official Apple Touch Icon */}
        <div className="text-center space-y-3">
          <div className="h-24 w-24 p-2 bg-white rounded-3xl border border-slate-200 shadow-xl mx-auto flex items-center justify-center relative group overflow-hidden">
            <img
              src="/apple-touch-icon.png"
              alt="KAKSEDTHAN Admin Logo"
              className="h-full w-full object-contain group-hover:scale-105 transition-transform"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-wider">KAKSEDTHAN</h1>
            <p className="text-[10px] font-black text-[#dc5c15] uppercase tracking-[0.2em] mt-0.5">
              HERDBOOK LIVESTOCK SYSTEM
            </p>
          </div>
          <p className="text-xs text-slate-500 font-semibold max-w-xs mx-auto">
            Sign in to access admin portal, sire/dam registries, breeding programs, and herdbook verification.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 pt-2">
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Authentication successful! Redirecting to Dashboard...</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-[#dc5c15]" />
              <span>Corporate Email Address</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. email@kaksedthan.com"
              className="w-full px-4 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15] focus:outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-[#dc5c15]" />
              <span>Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#dc5c15] focus:outline-none transition-all"
              required
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="h-3.5 w-3.5 text-[#dc5c15] rounded border-slate-300 focus:ring-[#dc5c15]" />
              <span className="text-slate-600 font-semibold text-[11px]">Remember login session</span>
            </label>
            <span className="text-[11px] font-bold text-[#dc5c15] hover:underline cursor-pointer">Forgot password?</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#dc5c15] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-xs py-3 rounded-2xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {loading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <span>Sign In to Admin Portal</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 text-[10px] font-semibold text-slate-400">
          <p>© 2026 Kaksedthan Livestock Systems • RBAC Admin Access</p>
        </div>

      </div>
    </div>
  );
}
