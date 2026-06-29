import { useState, useEffect, MouseEvent } from 'react';
import { motion } from 'motion/react';
import { Filter, ChevronDown, ShoppingBag, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProducts, toggleWishlist, getWishlistByUser } from '../lib/db';
import { Product } from '../types';
import { ProductSkeleton } from '../components/Skeleton';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const categories = ['All', 'Streetwear', 'Minimal', 'Luxury', 'Athleisure', 'Accessories'];

export function Shop() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    async function loadWishlist() {
      if (user) {
        const wishlist = await getWishlistByUser(user.uid);
        setWishlistIds(wishlist.map(item => item.productId));
      }
    }
    loadWishlist();
  }, [user]);

  const handleWishlist = async (e: MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please sign in to save items to your wishlist.');
      return;
    }
    
    const added = await toggleWishlist(user.uid, productId);
    setWishlistIds(prev => 
      added ? [...prev, productId] : prev.filter(id => id !== productId)
    );
  };

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const handleQuickAdd = (e: MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      type: 'official',
      productId: product.id,
      quantity: 1,
      price: product.basePrice,
      productName: product.name,
      productImage: product.images?.[0] || '',
      options: {
        size: 'M', // Default size for quick add
        color: product.colors?.[0] || 'Original',
        quality: 'Premium',
        printMethod: 'DTG'
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-editorial-bg min-h-screen">
      <header className="mb-16">
        <span className="label-text opacity-40 uppercase tracking-[0.3em] font-bold text-[10px]">Official Collections</span>
        <h1 className="text-6xl font-serif mt-4 italic tracking-tighter">The Shop</h1>
      </header>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-y border-editorial-text py-6 mb-16 gap-6">
        <div className="flex flex-wrap gap-8">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] font-bold uppercase tracking-[0.3em] transition-all pb-1 border-b-2 ${
                activeCategory === cat ? 'border-editorial-text text-editorial-text' : 'border-transparent text-editorial-text/30 hover:text-editorial-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-12">
          <button className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.3em] text-editorial-text/40 hover:text-editorial-text">
            <Filter size={14} /> <span>Filter</span>
          </button>
          <button className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.3em] text-editorial-text/40 hover:text-editorial-text">
            <span>Sort By</span> <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
          {[1, 2, 3, 4, 5, 6].map(i => <ProductSkeleton key={i} />)}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
          {filteredProducts.map((product) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <Link to={`/product/${product.id}`} className="block">
                <div className="aspect-[3/4] bg-editorial-accent overflow-hidden mb-8 relative border border-editorial-text/5 flex items-center justify-center">
                  {product.images?.[0] ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-[10px] uppercase tracking-widest opacity-20 font-bold">Awaiting Visual</div>
                  )}
                  
                  <button 
                    onClick={(e) => handleWishlist(e, product.id)}
                    className={`absolute top-6 right-6 w-10 h-10 border border-black/5 flex items-center justify-center transition-all z-10 ${
                      wishlistIds.includes(product.id) ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Heart size={14} fill={wishlistIds.includes(product.id) ? "currentColor" : "none"} />
                  </button>

                  <button 
                    onClick={(e) => handleQuickAdd(e, product)}
                    className="absolute bottom-8 left-8 right-8 bg-editorial-text text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 flex items-center justify-center z-10"
                  >
                    Quick Add <ShoppingBag size={14} className="ml-3" />
                  </button>
                </div>
                <div className="flex justify-between items-start px-2">
                  <div className="space-y-1">
                    <p className="text-[9px] text-editorial-text/30 uppercase tracking-[0.3em] font-bold">{product.category} // {product.type}</p>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest group-hover:italic transition-all">{product.name}</h3>
                  </div>
                  <p className="text-[11px] font-mono font-bold">${product.basePrice}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-48 border border-dashed border-editorial-text/10 bg-editorial-accent/20">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30 mb-2 italic">Official collection is currently empty.</p>
          <p className="text-[9px] uppercase tracking-widest opacity-20">Restocking New Visions Soon</p>
        </div>
      )}
    </div>
  );
}

