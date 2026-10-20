import React, { useState } from 'react';
import { useTraffic, DEMO_USERS } from '../../context/TrafficContext';
import { UserRole } from '../../types/traffic';
import { api } from '../../services/api';
import {
  ShieldCheck,
  User,
  Lock,
  Mail,
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, setCurrentUser, switchUserRole, addNotification } = useTraffic();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('commuter');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        setErrorMsg('Please enter both email and password.');
        return;
      }
      setIsSubmitting(true);
      try {
        const res = await api.login(email.trim());
        setCurrentUser(res.user);
        addNotification('success', 'Logged In Successfully', `Welcome back, ${res.user.name}!`);
        setAuthModalOpen(false);
      } catch (err: any) {
        setErrorMsg(err.message || 'Login failed. Please check your credentials.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setErrorMsg('Name, email, and password are required.');
        return;
      }
      setIsSubmitting(true);
      try {
        const res = await api.register({
          name: name.trim(),
          email: email.trim(),
          role,
          phone: phone.trim()
        });
        setCurrentUser(res.user);
        addNotification('success', 'Account Registered', `Welcome to SmartRoute AI, ${res.user.name}!`);
        setAuthModalOpen(false);
      } catch (err: any) {
        setErrorMsg(err.message || 'Registration failed.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDemoLogin = (r: UserRole) => {
    switchUserRole(r);
    setAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md p-6 rounded-3xl bg-navy-900 border border-slate-700 shadow-2xl space-y-5 relative">
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-white">
            {mode === 'login' ? 'Sign In to SmartRoute AI' : 'Create Commuter Account'}
          </h2>
          <p className="text-xs text-slate-400">
            Access saved daily commutes, report road incidents, and monitor live traffic telemetry.
          </p>
        </div>

        {/* 1-Click Instant Demo Login Buttons */}
        <div className="p-3.5 rounded-2xl bg-navy-950 border border-slate-800 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
            🚀 1-Click Instant Evaluation Logins
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoLogin('commuter')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition text-center"
            >
              👤 Commuter
            </button>
            <button
              onClick={() => handleDemoLogin('warden')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-cyan-300 transition text-center"
            >
              🛡️ Warden
            </button>
            <button
              onClick={() => handleDemoLogin('admin')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-purple-300 transition text-center"
            >
              👑 Admin
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="commuter@smartroute.ai"
              className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-black text-xs shadow-lg shadow-cyan-500/20 transition mt-2"
          >
            {isSubmitting ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button onClick={() => setMode('register')} className="text-cyan-400 font-bold hover:underline">
                Register now
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button onClick={() => setMode('login')} className="text-cyan-400 font-bold hover:underline">
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
