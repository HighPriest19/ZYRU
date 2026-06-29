import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';

export function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, cartTotal, isCartOpen, setIsCartOpen } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} />
                <h2 className="text-sm font-bold uppercase tracking-[0.2em]">Shopping Bag</h2>
                <span className="text-[10px] font-mono opacity-30">({cart.length})</span>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-grow overflow-y-auto p-6 space-y-8">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                    <ShoppingBag size={24} className="text-gray-200" />
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest opacity-40 italic">Your bag is empty</p>
                  <Link 
                    to="/shop" 
                    onClick={() => setIsCartOpen(false)}
                    className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:opacity-50 transition-opacity"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartId} className="flex gap-6 group">
                    <div className="w-24 h-24 bg-gray-50 border border-black/5 flex-shrink-0 relative overflow-hidden">
                      <img 
                        src={item.productImage} 
                        alt={item.productName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-[11px] font-bold uppercase tracking-wider">{item.productName}</h3>
                          <button 
                            onClick={() => removeFromCart(item.cartId)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[9px] text-gray-400 uppercase tracking-widest">
                            {item.options.size} // {item.options.color}
                          </p>
                          {item.options.layers && item.options.layers.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-black text-white text-[7px] font-bold uppercase tracking-tighter rounded-sm">
                              Custom Design
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest">
                          {item.options.printMethod} // {item.options.quality}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-black/5">
                          <button 
                            onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                            className="p-1.5 hover:bg-gray-50 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-[10px] font-mono">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                            className="p-1.5 hover:bg-gray-50 transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <p className="text-[11px] font-bold font-mono">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-8 border-t border-black/5 bg-gray-50/50 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest opacity-50">
                    <span>Subtotal</span>
                    <span className="font-mono">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] uppercase tracking-widest opacity-50">
                    <span>Shipping</span>
                    <span className="font-mono">Calculated at next step</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-black/5">
                    <span className="text-[11px] font-bold uppercase tracking-widest">Estimated Total</span>
                    <span className="text-sm font-bold font-mono">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-gray-900 transition-all group">
                  Initiate Checkout <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
                
                <p className="text-[8px] text-center text-gray-400 uppercase tracking-widest leading-relaxed">
                  Taxes and shipping calculated at checkout. <br/> Secure payment via ZYRU™ Neural Gateway.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
