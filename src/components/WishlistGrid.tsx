import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { getWishlistByUser, getProductById, toggleWishlist } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export function WishlistGrid() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      const wishlistData = await getWishlistByUser(user.uid);
      const productPromises = wishlistData.map(item => getProductById(item.productId));
      const products = await Promise.all(productPromises);
      setItems(products.filter((p): p is Product => p !== null));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const handleRemove = async (productId: string) => {
    if (!user) return;
    await toggleWishlist(user.uid, productId);
    setItems(prev => prev.filter(p => p.id !== productId));
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      type: 'official',
      productId: product.id,
      quantity: 1,
      price: product.basePrice,
      productName: product.name,
      productImage: product.images?.[0] || '',
      options: {
        size: 'M',
        color: product.colors?.[0] || 'Original',
        quality: 'Premium',
        printMethod: 'DTG'
      }
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="aspect-[4/5] bg-gray-50 animate-pulse border border-black/5" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-24 border border-dashed border-black/10">
        <Heart size={48} className="mx-auto text-gray-200 mb-6" />
        <h2 className="text-sm font-bold uppercase tracking-widest mb-2">Your wishlist is empty</h2>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-8">Save your favorite designs for later.</p>
        <Link 
          to="/shop" 
          className="bg-black text-white px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gray-900 transition-all inline-block"
        >
          Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-black/5 pb-4">
        <h2 className="text-lg font-bold uppercase tracking-widest">My Wishlist</h2>
        <span className="text-[9px] font-mono opacity-30">{items.length} // SAVED ITEMS</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((product) => (
          <motion.div 
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
          >
            <div className="aspect-[4/5] bg-gray-50 border border-black/5 relative overflow-hidden mb-4">
              <Link to={`/product/${product.id}`}>
                <img 
                  src={product.images?.[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </Link>
              <button 
                onClick={() => handleRemove(product.id)}
                className="absolute top-4 right-4 w-10 h-10 bg-white border border-black/5 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all z-10"
              >
                <Trash2 size={16} />
              </button>
              <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <button 
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-black text-white py-4 text-[9px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                >
                  Move to Bag <ShoppingBag size={14} />
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest mb-1">{product.name}</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">{product.category}</p>
              </div>
              <p className="text-sm font-bold font-mono tracking-tight">${product.basePrice.toFixed(2)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
