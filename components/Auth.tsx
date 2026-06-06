import React, { useState } from 'react';
import { UserProfile } from '../types';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (authMode === 'forgot') {
      setError('Password reset is not implemented in this demo.');
      return;
    }

    const endpoint = authMode === 'login' ? '/api/login' : '/api/register';
    const body = authMode === 'login' 
      ? { email, password } 
      : { email, password, name, dailyTargets: { calories: 2200, protein: 160, carbs: 250, fat: 70, fiber: 30 } };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('nutrismart_token', data.token);
        onLogin(data.user);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Server connection failed. Please try again later.');
    }
  };

  const renderForgotPassword = () => (
    <div className="animate-fade-in">
      {!resetSent ? (
        <>
          <p className="text-slate-500 text-sm font-medium mb-8">
            Enter the email associated with your account and we'll send you a link to reset your password.
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Account Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
            >
              Send Reset Link
            </button>
          </form>
        </>
      ) : (
        <div className="text-center py-6 animate-fade-in">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Check Your Email</h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
            A secure password reset link has been sent to <span className="text-slate-900 font-bold">{email}</span>. It will expire in 1 hour.
          </p>
        </div>
      )}
      <button
        onClick={() => { setAuthMode('login'); setResetSent(false); setError(''); }}
        className="w-full mt-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Sign In
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-200">
        <div className="text-center mb-10">
          <div className="inline-flex bg-white rounded-3xl overflow-hidden mb-6 shadow-xl border-4 border-emerald-50 w-24 h-24">
            <img 
              src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=200&auto=format&fit=crop" 
              alt="NutriSmart Welcome" 
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
            Nutri<span className="text-emerald-500">Smart</span>
          </h2>
          <p className="text-slate-400 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">
            {authMode === 'login' ? 'Intelligence Portal' : authMode === 'register' ? 'Join the movement' : 'Security Recovery'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600 text-sm font-medium animate-fade-in">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {authMode === 'forgot' ? (
          renderForgotPassword()
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
            {authMode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Full Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                  placeholder="Alex Thompson"
                />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email Address</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                placeholder="alex@example.com"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Password</label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setAuthMode('forgot'); setError(''); }}
                    className="text-[10px] font-black text-emerald-600 uppercase hover:underline tracking-widest"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all active:scale-[0.98] mt-4 uppercase tracking-widest text-xs"
            >
              {authMode === 'login' ? 'Sign In' : 'Register Account'}
            </button>
          </form>
        )}

        {authMode !== 'forgot' && (
          <div className="mt-8 text-center border-t border-slate-100 pt-8">
            <button
              onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              {authMode === 'login' ? "New here? Create an account" : "Already have an account? Login"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
