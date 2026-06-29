import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowLeft, Shield, Truck, RefreshCw, Heart, Star, Send } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Product, CartItem, WishlistItem, Review } from '../types';
import { Skeleton } from '../components/Skeleton';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toggleWishlist, getWishlistByUser, getReviews, createReview } from '../lib/db';

export function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Reviews States
  const [reviews, setReviews] = useState<any[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [fitFeedback, setFitFeedback] = useState<'Too Small' | 'Perfect' | 'Too Large'>('Perfect');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProductAndReviews() {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        }
        const reviewsData = await getReviews(id);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching product and reviews:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProductAndReviews();
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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to submit reviews.');
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    try {
      await createReview({
        userId: user.uid,
        productId: id,
        rating: newRating,
        comment: newComment,
        fitFeedback,
        isVerified: true
      });
      setNewComment('');
      setNewRating(5);
      const updated = await getReviews(id);
      setReviews(updated);
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('Failed to transmit review');
    } finally {
      setSubmittingReview(false);
    }
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

        {/* Reviews Section */}
        <div className="mt-32 pt-24 border-t border-editorial-text/10 space-y-16">
          <header>
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold opacity-30">Customer_Critiques</span>
            <h2 className="text-4xl font-serif mt-2 italic tracking-tighter">Verified Reviews</h2>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Reviews list */}
            <div className="lg:col-span-2 space-y-10">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-editorial-text/5 pb-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={star <= r.rating ? "text-black fill-current" : "text-gray-200"}
                        />
                      ))}
                    </div>
                    {r.isVerified && (
                      <span className="text-[9px] font-bold uppercase bg-editorial-accent px-2 py-1 tracking-widest text-editorial-text/60">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-[15px] font-light italic leading-relaxed text-editorial-text/80">"{r.comment}"</p>
                  <div className="flex items-center gap-4 text-[10px] opacity-40 uppercase font-mono tracking-wider font-bold">
                    <span>Fit: {r.fitFeedback || 'Perfect'}</span>
                    <span>•</span>
                    <span>UID: {r.userId?.slice(0, 8)}</span>
                  </div>
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="py-16 text-center border border-dashed border-editorial-text/10 bg-editorial-accent/10">
                  <p className="text-sm font-serif italic opacity-40">No reviews yet. Be the first to leave feedback.</p>
                </div>
              )}
            </div>

            {/* Submit review */}
            <div className="p-8 bg-white border border-editorial-text/5 h-fit shadow-sm space-y-8">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] border-b border-editorial-text/10 pb-4">Submit Evaluation</h3>
              {user ? (
                <form onSubmit={handleSubmitReview} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider opacity-40">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            size={18}
                            className={star <= newRating ? "text-black fill-current" : "text-gray-200"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider opacity-40">Fit Feedback</label>
                    <select
                      value={fitFeedback}
                      onChange={(e) => setFitFeedback(e.target.value as any)}
                      className="w-full bg-transparent border-b border-editorial-text/20 py-2 text-xs font-bold uppercase focus:outline-none col-span-2"
                    >
                      <option value="Too Small">Too Small</option>
                      <option value="Perfect">Perfect Fit</option>
                      <option value="Too Large">Too Large</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider opacity-40">Comment</label>
                    <textarea
                      required
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts on the cut, material, and fit..."
                      className="w-full h-28 bg-editorial-accent/30 border border-editorial-text/10 p-4 text-xs font-light leading-relaxed focus:outline-none focus:border-editorial-text resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full py-4 bg-editorial-text text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                  >
                    {submittingReview ? <RefreshCw className="animate-spin" size={14} /> : <Send size={14} />} Transmit Review
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <p className="text-[11px] font-light leading-relaxed">
                    You must be authenticated with Google to submit product evaluations.
                  </p>
                  <Link
                    to="/login"
                    className="block text-center py-4 border border-editorial-text text-[10px] font-bold uppercase tracking-widest hover:bg-editorial-text hover:text-white transition-all"
                  >
                    Sign In to Evaluate
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

