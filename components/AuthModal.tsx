
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert("Account created! You can now log in.");
        setMode('login');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onClose(); // Successful login closes modal, App.tsx handles redirection
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-8 m-4">
        
        <div className="text-center mb-8">
           <h2 className="text-2xl font-bold text-gray-50 mb-2">
             {mode === 'login' ? 'Welcome Back' : 'Create Account'}
           </h2>
           <p className="text-gray-400 text-sm">
             {mode === 'login' ? 'Log in to access your scanner history.' : 'Start flipping smarter today.'}
           </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-gray-50 focus:border-cyan-500 outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Password</label>
            <input 
              type="password" 
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-gray-50 focus:border-cyan-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-500 text-sm text-center">
               {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-gray-50 font-bold rounded-lg shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : (mode === 'login' ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          {mode === 'login' ? (
             <>Don't have an account? <button onClick={() => setMode('signup')} className="text-cyan-500 font-bold hover:underline">Sign Up</button></>
          ) : (
             <>Already have an account? <button onClick={() => setMode('login')} className="text-cyan-500 font-bold hover:underline">Log In</button></>
          )}
        </div>

      </div>
    </div>
  );
};
