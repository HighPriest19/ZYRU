import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, loginWithGoogle } from '../lib/firebase';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/account');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-editorial-bg flex flex-col md:flex-row pt-16">
      {/* Branding Side */}
      <div className="hidden md:flex md:w-1/2 bg-editorial-text text-white p-24 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <p className="label-text opacity-40 uppercase tracking-[0.4em] font-bold mb-8 text-[10px]">Registry Access</p>
          <h1 className="text-8xl font-serif leading-[0.8] tracking-tighter mb-12 italic">WELCOME <br/>BACK</h1>
          <p className="text-lg font-light leading-relaxed max-w-sm opacity-60">
            Access your saved visions, track active orders, and participate in the Community Lab.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <Sparkles size={20} className="opacity-40" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Join the ecosystem</span>
          </div>
          <p className="text-[9px] uppercase tracking-[0.4em] opacity-30 italic">Wear Your Vision // Every Piece Tells A Story</p>
        </div>

        <div className="absolute -bottom-20 -left-20 text-[20vw] font-serif italic opacity-[0.03] select-none pointer-events-none">
          ZYRU
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-grow flex items-center justify-center p-8 md:p-24 bg-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-12">
            <span className="label-text opacity-40 uppercase tracking-[0.3em] font-bold text-[10px]">Auth_01</span>
            <h2 className="text-4xl font-serif mt-4">Login</h2>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 flex items-start gap-3 text-red-900">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p className="text-[11px] font-bold uppercase tracking-widest leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 block">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-editorial-text/20 py-4 text-xs font-bold uppercase tracking-[0.3em] focus:outline-none focus:border-editorial-text placeholder:opacity-10"
                  placeholder="name@domain.com"
                />
                <Mail size={16} className="absolute right-0 top-4 opacity-20" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Password</label>
                <Link to="/forgot" className="text-[9px] font-bold uppercase underline opacity-40 hover:opacity-100">Forgot?</Link>
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-editorial-text/20 py-4 text-xs font-bold uppercase tracking-[0.3em] focus:outline-none focus:border-editorial-text placeholder:opacity-10"
                  placeholder="••••••••"
                />
                <Lock size={16} className="absolute right-0 top-4 opacity-20" />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-editorial-text text-white py-6 text-xs font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Access Account'} <ArrowRight size={14} />
            </button>
          </form>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex-grow border-t border-editorial-text/20"></div>
              <span className="text-[10px] font-bold uppercase opacity-40">Or</span>
              <div className="flex-grow border-t border-editorial-text/20"></div>
            </div>

            <button 
              onClick={async () => {
                setError(null);
                setLoading(true);
                try {
                  await loginWithGoogle();
                  navigate('/account');
                } catch (err: any) {
                  setError(err.message || 'Failed to sign in with Google.');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full mt-8 border border-editorial-text text-editorial-text py-6 text-xs font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-editorial-text hover:text-white transition-all disabled:opacity-50"
            >
              Access with Google
            </button>

          <p className="mt-12 text-center text-[11px] uppercase tracking-[0.2em] opacity-40">
            New to ZYRU™? <Link to="/signup" className="text-editorial-text font-bold underline ml-2">Register Vision</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
