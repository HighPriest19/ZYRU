import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowRight, ShoppingBag, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';
import { searchContent } from '../lib/db';
import { Product, Design } from '../types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ products: Product[], designs: Design[] }>({ products: [], designs: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setQuery('');
      setResults({ products: [], designs: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 1) {
        setLoading(true);
        try {
          const res = await searchContent(query);
          setResults(res);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults({ products: [], designs: [] });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-white flex flex-col"
        >
          {/* Header */}
          <div className="h-24 border-b border-black/5 flex items-center px-8 md:px-16 justify-between">
            <div className="flex items-center gap-6 flex-grow max-w-4xl">
              <Search size={24} className="text-black/30" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search products, collections, designs..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full text-2xl font-serif italic outline-none placeholder:text-black/10"
              />
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-black/5 rounded-full transition-colors"
            >
              <X size={28} />
            </button>
          </div>

          {/* Results Container */}
          <div className="flex-grow overflow-y-auto px-8 md:px-16 py-12">
            <div className="max-w-7xl mx-auto">
              {loading ? (
                <div className="space-y-12">
                  {[1, 2].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 w-32 bg-black/5 mb-8" />
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map(j => (
                          <div key={j} className="aspect-square bg-black/5" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-20">
                  {/* Products Section */}
                  {results.products.length > 0 && (
                    <section>
                      <div className="flex justify-between items-end mb-10">
                        <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] opacity-40">Products ({results.products.length})</h2>
                        <Link to="/shop" className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-50 transition-opacity" onClick={onClose}>
                          View All <ArrowRight size={12} />
                        </Link>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {results.products.map(product => (
                          <Link 
                            key={product.id} 
                            to={`/product/${product.id}`} 
                            className="group"
                            onClick={onClose}
                          >
                            <div className="aspect-square bg-gray-50 border border-black/5 mb-4 relative overflow-hidden">
                              <img 
                                src={product.images?.[0]} 
                                alt={product.name}
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                              />
                            </div>
                            <h3 className="text-[11px] font-bold uppercase tracking-widest">{product.name}</h3>
                            <p className="text-[10px] font-mono opacity-40 mt-1">${product.basePrice.toFixed(2)}</p>
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Designs Section */}
                  {results.designs.length > 0 && (
                    <section>
                      <div className="flex justify-between items-end mb-10">
                        <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] opacity-40">Community Designs ({results.designs.length})</h2>
                        <Link to="/community" className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-50 transition-opacity" onClick={onClose}>
                          Explore Lab <ArrowRight size={12} />
                        </Link>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {results.designs.map(design => (
                          <div key={design.id} className="group cursor-default">
                            <div className="aspect-square bg-black text-white p-6 flex flex-col justify-between border border-white/10 group-hover:border-white transition-colors relative overflow-hidden">
                              <div className="relative z-10">
                                <h3 className="text-[11px] font-bold uppercase tracking-widest mb-2">{design.name || 'Untitled Design'}</h3>
                                <p className="text-[9px] opacity-40 uppercase tracking-widest line-clamp-3">
                                  {design.config.layers.map(l => l.content).join(' // ')}
                                </p>
                              </div>
                              <div className="relative z-10 flex justify-between items-end">
                                <div className="flex gap-1">
                                  <div className="w-2 h-2" style={{ backgroundColor: design.config.baseColor }} />
                                </div>
                                <span className="text-[8px] font-mono opacity-30">{design.config.logoPlacement}</span>
                              </div>
                              <Palette size={80} className="absolute -bottom-8 -right-8 opacity-5 group-hover:opacity-10 transition-opacity" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Empty State */}
                  {query.trim().length > 1 && !loading && results.products.length === 0 && results.designs.length === 0 && (
                    <div className="py-32 text-center">
                      <Search size={48} className="mx-auto text-black/5 mb-6" />
                      <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-30 italic">No results found for "{query}"</p>
                      <p className="text-[10px] uppercase tracking-widest opacity-20 mt-4">Try searching for streetwear, minimalist, or specific product names.</p>
                    </div>
                  )}

                  {/* Suggestions when empty */}
                  {query.trim().length <= 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                      <div>
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] opacity-40 mb-10">Trending Searches</h3>
                        <div className="space-y-6">
                          {['Noir Collection', 'Over-sized Hoodie', 'Sustainable Cotton', 'Community Design Lab', 'Limited Edition'].map(tag => (
                            <button 
                              key={tag}
                              onClick={() => setQuery(tag)}
                              className="block text-2xl font-serif italic hover:opacity-50 transition-opacity"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] opacity-40 mb-10">Quick Links</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: 'New Arrivals', to: '/shop' },
                            { label: 'Best Sellers', to: '/shop' },
                            { label: 'Design Studio', to: '/studio' },
                            { label: 'Vote Now', to: '/community' },
                            { label: 'Account', to: '/account' },
                            { label: 'Wishlist', to: '/account' },
                          ].map(link => (
                            <Link 
                              key={link.label}
                              to={link.to}
                              onClick={onClose}
                              className="border border-black/5 p-6 flex items-center justify-between group hover:bg-black hover:text-white transition-all"
                            >
                              <span className="text-[10px] font-bold uppercase tracking-widest">{link.label}</span>
                              <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
