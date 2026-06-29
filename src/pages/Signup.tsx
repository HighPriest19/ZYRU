import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Sparkles, AlertCircle, Shield } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { createUserProfile } from '../lib/db';

export function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      await updateProfile(user, { displayName: formData.name });
      
      await createUserProfile({
        uid: user.uid,
        email: formData.email,
        displayName: formData.name,
        photoURL: '',
        loyaltyPoints: 10, // Welcome points
        wishlist: [],
        savedDesigns: [],
        joinedAt: new Date()
      });

      navigate('/account');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-editorial-bg flex flex-col md:flex-row pt-16">
      {/* Form Side */}
      <div className="flex-grow flex items-center justify-center p-8 md:p-24 bg-white order-2 md:order-1">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-12">
            <span className="label-text opacity-40 uppercase tracking-[0.3em] font-bold text-[10px]">Auth_02</span>
            <h2 className="text-4xl font-serif mt-4">Registry</h2>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 flex items-start gap-3 text-red-900">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p className="text-[11px] font-bold uppercase tracking-widest leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 block">Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-transparent border-b border-editorial-text/20 py-4 text-xs font-bold uppercase tracking-[0.3em] focus:outline-none focus:border-editorial-text placeholder:opacity-10"
                  placeholder="ALEX VISION"
                />
                <User size={16} className="absolute right-0 top-4 opacity-20" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 block">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-transparent border-b border-editorial-text/20 py-4 text-xs font-bold uppercase tracking-[0.3em] focus:outline-none focus:border-editorial-text placeholder:opacity-10"
                  placeholder="name@domain.com"
                />
                <Mail size={16} className="absolute right-0 top-4 opacity-20" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 block">Password</label>
                <div className="relative">
                  <input 
                    type="password" 
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-transparent border-b border-editorial-text/20 py-4 text-xs font-bold uppercase tracking-[0.3em] focus:outline-none focus:border-editorial-text placeholder:opacity-10"
                    placeholder="••••••••"
                  />
                  <Lock size={16} className="absolute right-0 top-4 opacity-20" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 block">Confirm</label>
                <div className="relative">
                  <input 
                    type="password" 
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full bg-transparent border-b border-editorial-text/20 py-4 text-xs font-bold uppercase tracking-[0.3em] focus:outline-none focus:border-editorial-text placeholder:opacity-10"
                    placeholder="••••••••"
                  />
                  <Shield size={16} className="absolute right-0 top-4 opacity-20" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 py-4">
              <input type="checkbox" required className="w-4 h-4 border-editorial-text/20 rounded-none focus:ring-editorial-text" />
              <label className="text-[9px] uppercase tracking-widest opacity-40">I agree to the Visionary Terms and Privacy Policy.</label>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-editorial-text text-white py-6 text-xs font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              {loading ? 'Establishing Identity...' : 'Join the Registry'} <ArrowRight size={14} />
            </button>
          </form>

          <p className="mt-12 text-center text-[11px] uppercase tracking-[0.2em] opacity-40">
            Already registered? <Link to="/login" className="text-editorial-text font-bold underline ml-2">Access Account</Link>
          </p>
        </motion.div>
      </div>

      {/* Branding Side */}
      <div className="hidden md:flex md:w-1/2 bg-editorial-accent text-editorial-text p-24 flex-col justify-between relative overflow-hidden order-1 md:order-2">
        <div className="relative z-10">
          <p className="label-text opacity-40 uppercase tracking-[0.4em] font-bold mb-8 text-[10px]">Registry Access</p>
          <h1 className="text-8xl font-serif leading-[0.8] tracking-tighter mb-12">NEW <br/>IDENTITY</h1>
          <p className="text-lg font-light leading-relaxed max-w-sm opacity-60">
            Join the collective. Track your impact, earn loyalty rewards, and help shape the future of ZYRU™ collections.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <Sparkles size={20} className="opacity-40" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Visionaries receive +10 XP on entry</span>
          </div>
          <p className="text-[9px] uppercase tracking-[0.4em] opacity-30 italic">Wear Your Vision // Every Piece Tells A Story</p>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-serif italic opacity-[0.03] select-none pointer-events-none">
          ZR
        </div>
      </div>
    </div>
  );
}
