import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowLeft, Shield, Truck, RefreshCw, Heart } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Product, CartItem, WishlistItem } from '../types';
import { Skeleton } from '../components/Skeleton';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toggleWishlist, getWishlistByUser } from '../lib/db';

export function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  useEffect(() => {
    async function checkWishlist() {
      if (user && id) {
        const wishlist = await getWishlistByUser(user.uid);
        setIsWishlisted(wishlist.some(item => item.productId === id));
      }
    }
    checkWishlist();
  }, [user, id]);

  const handleWishlist = async () => {
    if (!user || !id) {
      alert('Please sign in to save items to your wishlist.');
      return;
    }
    const added = await toggleWishlist(user.uid, id);
    setIsWishlisted(added);
  };

  const handleAddToBag = () => {
    if (!product) return;
    
    addToCart({
      type: 'official',
      productId: product.id,
      quantity: 1,
      price: product.basePrice,
      productName: product.name,
      productImage: product.images?.[0] || '',
      options: {
        size: selectedSize,
        color: product.colors?.[0] || 'Original',
        quality: 'Premium',
        printMethod: 'DTG'
      }
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 bg-editorial-bg min-h-screen">
        <div className="flex items-center gap-2 mb-12 opacity-20"><Skeleton className="h-4 w-24" /></div>
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
          <Skeleton className="aspect-[3/4] w-full" />
          <div className="space-y-12">
            <div className="space-y-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-16 w-3/4" />
              <Skeleton className="h-8 w-1/4" />
            </div>
            <Skeleton className="h-40 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/4" />
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-14 h-14 bg-editorial-text/5 animate-pulse" />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-48 text-center bg-editorial-bg min-h-screen">
        <h2 className="text-4xl font-serif mb-4 italic">Vision Not Found</h2>
        <Link to="/shop" className="label-text border-b border-editorial-text pb-1 uppercase tracking-widest text-[10px] font-bold">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="bg-editorial-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <Link to="/shop" className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity mb-12">
          <ArrowLeft size={14} /> Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
          {/* Image Gallery */}
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-editorial-accent aspect-[3/4] overflow-hidden border border-editorial-text/5 flex items-center justify-center"
            >
              {product.images?.[0] ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover grayscale" 
                  referrerPolicy="no-referrer" 
                />
              ) : (
                <div className="text-[10px] uppercase tracking-widest opacity-20 font-bold">Awaiting Visual</div>
              )}
            </motion.div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="border-b border-editorial-text/10 pb-8 mb-8">
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-40 mb-4 block">{product.category} // Edition {new Date().getFullYear()}</span>
              <h1 className="text-6xl font-serif mb-4 italic tracking-tighter leading-tight">{product.name}</h1>
              <p className="text-3xl font-mono font-bold tracking-tighter">${product.basePrice}</p>
            </div>
            
            <div className="space-y-12">
              <p className="text-editorial-text/60 leading-relaxed font-light text-sm tracking-wide">
                {product.description || "A meticulously crafted piece from our latest collection. Designed for those who wear their vision with confidence."}
              </p>

              <div>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Select Scale</p>
                  <button className="text-[10px] font-bold uppercase tracking-widest underline opacity-20 hover:opacity-100 transition-opacity">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-4">
                  {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <button 
                      key={size} 
                      onClick={() => setSelectedSize(size)}
                      className={`w-16 h-16 border flex items-center justify-center text-[11px] font-bold tracking-widest transition-all ${
                        selectedSize === size ? 'border-editorial-text bg-editorial-text text-white shadow-xl' : 'border-editorial-text/10 hover:border-editorial-text opacity-40 hover:opacity-100'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <button 
                    onClick={handleAddToBag}
                    className="flex-grow bg-editorial-text text-white py-6 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gray-800 transition-all flex items-center justify-center gap-4 shadow-2xl"
                  >
                    Add to Collection <ShoppingBag size={18} />
                  </button>
                  <button 
                    onClick={handleWishlist}
                    className={`w-20 border flex items-center justify-center transition-all ${
                      isWishlisted ? 'bg-black text-white border-black' : 'border-editorial-text/10 hover:border-editorial-text'
                    }`}
                  >
                    <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                  </button>
                </div>
                <p className="text-[9px] text-center text-editorial-text/30 uppercase tracking-[0.2em] font-bold italic">Secure checkout via Vision Gateway.</p>
              </div>

              <div className="pt-12 border-t border-editorial-text/10 grid grid-cols-1 gap-8">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-editorial-accent"><Truck size={18} className="text-editorial-text opacity-40" /></div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Global Shipping</p>
                    <p className="text-[10px] text-editorial-text/40 tracking-wider">Estimated delivery: 5-10 cycles.</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-editorial-accent"><Shield size={18} className="text-editorial-text opacity-40" /></div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Vision Guarantee</p>
                    <p className="text-[10px] text-editorial-text/40 tracking-wider">Premium materials, crafted for durability.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

