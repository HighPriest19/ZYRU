import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Package, Heart, CreditCard, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { OrderHistory } from '../components/OrderHistory';
import { WishlistGrid } from '../components/WishlistGrid';

export function Account() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-2">
          <div className="mb-12">
            <h1 className="text-2xl font-bold font-display tracking-tight">My Account</h1>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-[0.3em] font-bold">
              Welcome back, {user?.displayName?.split(' ')[0] || 'Member'}
            </p>
          </div>
          
          {[
            { id: 'orders', label: 'Order History', icon: Package },
            { id: 'wishlist', label: 'Wishlist', icon: Heart },
            { id: 'designs', label: 'My Designs', icon: Settings },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'settings', label: 'Profile Settings', icon: User },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all border-l-2 ${
                activeTab === item.id 
                  ? 'bg-black text-white border-black' 
                  : 'hover:bg-gray-50 text-gray-400 border-transparent hover:text-black'
              }`}
            >
              <item.icon size={14} />
              <span>{item.label}</span>
            </button>
          ))}
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-red-500 hover:bg-red-50/50 mt-8 transition-all border-l-2 border-transparent"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </aside>

        {/* Content */}
        <div className="flex-grow">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-black/5 p-8 md:p-12"
          >
            {activeTab === 'orders' && <OrderHistory />}
            {activeTab === 'wishlist' && <WishlistGrid />}

            {activeTab === 'designs' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1].map((design) => (
                  <div key={design} className="border border-black/5 p-4 hover:border-black transition-all">
                    <div className="aspect-square bg-gray-100 mb-4 flex items-center justify-center relative overflow-hidden group">
                      <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=500&auto=format&fit=crop" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                        <button className="bg-white text-black px-4 py-2 text-[10px] font-bold uppercase tracking-widest">Edit Design</button>
                      </div>
                    </div>
                    <h3 className="text-xs font-bold uppercase">My Custom Hoodie</h3>
                    <p className="text-[10px] text-gray-400 mt-1 font-mono">Created on June 15, 2026</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
