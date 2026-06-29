import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Search, LogOut, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { CartDrawer } from './CartDrawer';
import { SearchOverlay } from './SearchOverlay';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = user?.email === 'adamsolagunju17@gmail.com';

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-editorial-bg/80 backdrop-blur-md border-b border-editorial-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Nav */}
          <div className="hidden md:flex gap-8 text-[11px] font-bold tracking-[0.2em] uppercase">
            <Link to="/shop" className={`hover:opacity-100 transition-opacity ${location.pathname === '/shop' ? 'opacity-100' : 'opacity-40'}`}>Shop</Link>
            <Link to="/studio" className={`hover:opacity-100 transition-opacity ${location.pathname === '/studio' ? 'opacity-100' : 'opacity-40'}`}>Studio</Link>
            <Link to="/community" className={`hover:opacity-100 transition-opacity ${location.pathname === '/community' ? 'opacity-100' : 'opacity-40'}`}>Community</Link>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-serif tracking-tighter font-black">
              ZYRU<span className="text-[10px] align-top font-sans not-italic">™</span>
            </Link>
          </div>

          {/* Right Nav */}
          <div className="hidden md:flex gap-8 text-[11px] font-bold tracking-[0.2em] uppercase items-center">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="opacity-40 hover:opacity-100 transition-opacity"
            >
              Search
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2"
            >
              Bag ({cartCount})
            </button>
            
            <div className="relative">
              <button 
                onClick={() => user ? setIsProfileOpen(!isProfileOpen) : navigate('/login')}
                className={`transition-opacity flex items-center gap-2 ${user ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
              >
                <User size={18} />
                {user && <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />}
              </button>

              <AnimatePresence>
                {isProfileOpen && user && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-4 w-48 bg-white shadow-2xl border border-black/5 p-4 flex flex-col gap-2"
                  >
                    <p className="text-[8px] font-bold uppercase tracking-widest opacity-30 px-2 py-2 border-b border-black/5">
                      {user.displayName || user.email}
                    </p>
                    <Link to="/account" className="text-[10px] font-bold uppercase tracking-widest p-2 hover:bg-editorial-accent transition-colors flex items-center gap-2" onClick={() => setIsProfileOpen(false)}>
                      Profile
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="text-[10px] font-bold uppercase tracking-widest p-2 text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2" onClick={() => setIsProfileOpen(false)}>
                        <ShieldCheck size={12} /> Dashboard
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="text-[10px] font-bold uppercase tracking-widest p-2 text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2 text-left w-full"
                    >
                      <LogOut size={12} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 hover:bg-black/5 rounded-full transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-b border-black/5"
          >
            <div className="px-4 pt-2 pb-8 space-y-4 text-center">
              <button 
                onClick={() => { setIsSearchOpen(true); setIsMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-3 py-3 text-lg font-serif italic border-b border-black/5"
              >
                <Search size={18} /> Search
              </button>
              <Link to="/shop" className="block py-3 text-lg font-serif italic border-b border-black/5" onClick={() => setIsMenuOpen(false)}>Shop</Link>
              <Link to="/studio" className="block py-3 text-lg font-serif italic border-b border-black/5" onClick={() => setIsMenuOpen(false)}>Design Studio</Link>
              <Link to="/community" className="block py-3 text-lg font-serif italic border-b border-black/5" onClick={() => setIsMenuOpen(false)}>Community Lab</Link>
              
              <div className="pt-6 space-y-4">
                {user ? (
                  <>
                    <Link to="/account" className="block text-[11px] font-bold uppercase tracking-[0.3em] py-2" onClick={() => setIsMenuOpen(false)}>My Account</Link>
                    {isAdmin && <Link to="/admin" className="block text-[11px] font-bold uppercase tracking-[0.3em] py-2 text-blue-600" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>}
                    <button 
                      onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                      className="block w-full text-[11px] font-bold uppercase tracking-[0.3em] py-2 text-red-500"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="block bg-black text-white py-4 text-[11px] font-bold uppercase tracking-[0.3em]" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <CartDrawer />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="h-16 border-t border-editorial-text flex items-center px-10 gap-20 overflow-hidden bg-editorial-bg">
      <div className="flex gap-20 items-center animate-ticker whitespace-nowrap">
        {[1, 2, 3].map((_, i) => (
          <div key={i} className="flex gap-20 items-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-4">
              <span className="w-2 h-2 bg-editorial-text rounded-full"></span>
              Next Drop: Minimalist Series (12:04:55)
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-4">
              <span className="w-2 h-2 bg-editorial-text rounded-full"></span>
              Free Shipping on Orders over $150
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-4">
              <span className="w-2 h-2 bg-editorial-text rounded-full"></span>
              Join the ZYRU™ Creator Marketplace
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-4">
              <span className="w-2 h-2 bg-editorial-text rounded-full"></span>
              Sustainability: Carbon Neutral Delivery
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }
      `}</style>
    </footer>
  );
}
