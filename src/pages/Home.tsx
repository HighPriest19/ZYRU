import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Star, TrendingUp, Users, Instagram, Mail, Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProducts } from '../lib/db';
import { Product } from '../types';

export function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ days: 12, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    async function loadData() {
      try {
        const products = await getProducts();
        setFeaturedProducts(products.filter(p => p.category === 'Minimal').slice(0, 3));
        setNewArrivals(products.filter(p => p.category === 'Streetwear').slice(0, 4));
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 12);
    targetDate.setHours(12, 0, 0, 0);

    const timer = setInterval(() => {
      const difference = targetDate.getTime() - Date.now();
      if (difference <= 0) {
        setCountdown({ days: 0, hours: 0, mins: 0, secs: 0 });
        clearInterval(timer);
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((difference / 1000 / 60) % 60);
      const secs = Math.floor((difference / 1000) % 60);
      setCountdown({ days, hours, mins, secs });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-editorial-bg min-h-screen">
      {/* Editorial Hero Grid */}
      <section className="grid grid-cols-1 md:grid-cols-12 min-h-[calc(100vh-64px)] border-b border-editorial-text">
        {/* Left: Brand Messaging */}
        <div className="md:col-span-5 border-r border-editorial-text p-10 flex flex-col justify-between">
          <div>
            <p className="label-text opacity-50 mb-12 uppercase tracking-[0.3em] font-bold">ZYRU™ EDITION 001 // THE VISION</p>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-7xl md:text-9xl font-serif leading-[0.8] tracking-tighter"
            >
              WEAR <br/>YOUR <br/><span className="italic">VISION</span>
            </motion.h1>
            <p className="mt-12 text-lg max-w-[320px] leading-relaxed font-light text-editorial-text/70">
              Transform your imagination into wearable art. ZYRU™ blends high-end craftsmanship with absolute creative freedom.
            </p>
          </div>
          
          <div className="flex items-center gap-6 mt-12 md:mt-0">
            <Link 
              to="/studio" 
              className="px-10 py-5 bg-editorial-text text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-all flex items-center gap-4"
            >
              Enter Design Lab <ArrowRight size={14} />
            </Link>
            <div className="label-text">
              <span className="block opacity-40 uppercase text-[9px] font-bold">Current Phase</span>
              <span className="text-[10px] font-mono">LABS_ALPHA_021</span>
            </div>
          </div>
        </div>

        {/* Middle: Immersive Visual */}
        <div className="md:col-span-4 relative flex items-center justify-center overflow-hidden bg-editorial-accent py-20 border-r border-editorial-text">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-[320px] h-[450px] bg-editorial-muted shadow-2xl relative flex flex-col items-center justify-center border border-editorial-text/5 overflow-hidden group"
          >
            {featuredProducts[0]?.images?.[0] ? (
              <img 
                src={featuredProducts[0].images[0]} 
                alt="ZYRU Signature Piece" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[1500ms]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-40 h-40 border-2 border-dashed border-editorial-text/10 flex items-center justify-center text-[9px] font-bold uppercase tracking-[0.3em] text-editorial-text/40 text-center px-4 leading-relaxed font-mono">
                ZYRU™<br/>Aesthetic<br/>Preview
              </div>
            )}
            <div className="absolute bottom-12 left-10 bg-white/90 backdrop-blur-sm p-4 border border-editorial-text/5">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] mb-1">
                {featuredProducts[0]?.name || "Signature Drop"}
              </p>
              <p className="text-[9px] opacity-60 uppercase tracking-[0.4em] font-mono">
                Batch: {featuredProducts[0]?.id?.slice(0,8).toUpperCase() || "2026-VISION"}
              </p>
            </div>
            <div className="absolute top-6 right-6 text-[10px] bg-white border border-editorial-text px-3 py-1 italic font-serif">
              Studio Concept
            </div>
          </motion.div>
          <div className="absolute bottom-20 right-0 transform translate-x-1/2 rotate-90 origin-left text-[11px] font-bold tracking-[0.6em] uppercase opacity-10 whitespace-nowrap">
            AESTHETIC INNOVATION // 2026
          </div>
        </div>

        {/* Right: Interaction Hub */}
        <div className="md:col-span-3 flex flex-col">
          <Link to="/studio" className="h-1/2 p-12 border-b border-editorial-text flex flex-col justify-between group hover:bg-white transition-all bg-editorial-accent/20">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Sparkles size={16} className="opacity-40" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">AI Generator</span>
              </div>
              <h2 className="text-4xl font-serif italic mb-4 leading-tight">Create With <br/>Intelligence</h2>
              <p className="text-[10px] leading-relaxed opacity-50 uppercase tracking-[0.2em]">Generate unique patterns and motifs using our proprietary ZYRU™ model.</p>
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
              <span>Explore Engine</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          <Link to="/community" className="h-1/2 p-12 bg-white flex flex-col justify-between group overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-4xl font-serif italic leading-tight">Community <br/>Insights</h2>
                <span className="text-[9px] font-bold bg-editorial-text text-white px-3 py-1.5 uppercase tracking-widest">Live</span>
              </div>
              <p className="text-[10px] leading-relaxed opacity-50 uppercase tracking-[0.2em] max-w-[180px]">Participate in the ZYRU™ Community Lab. Your input drives our next drop.</p>
            </div>
            
            <div className="relative z-10 space-y-6">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-30 italic">
                Awaiting Next Collection Vote...
              </p>
            </div>
            <div className="absolute -bottom-10 -right-10 opacity-[0.03] scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
              <Users size={200} />
            </div>
          </Link>
        </div>
      </section>

      {/* Limited Edition Countdown Banner */}
      <section className="bg-editorial-text text-white py-12 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-white/5 rounded-full"><Clock size={24} /></div>
            <div>
              <h3 className="text-xl font-serif italic">Limited Drop: The Midnight Cargo</h3>
              <p className="text-[10px] uppercase tracking-[0.3em] opacity-50">Next official release in limited quantities.</p>
            </div>
          </div>
          <div className="flex gap-12">
            {[
              { label: 'Days', val: countdown.days },
              { label: 'Hours', val: countdown.hours },
              { label: 'Mins', val: countdown.mins },
              { label: 'Secs', val: countdown.secs }
            ].map(t => (
              <div key={t.label} className="text-center">
                <span className="text-3xl font-mono block font-bold leading-none">{t.val.toString().padStart(2, '0')}</span>
                <span className="text-[9px] uppercase tracking-widest opacity-40 mt-1 block">{t.label}</span>
              </div>
            ))}
          </div>
          <button className="px-8 py-4 border border-white/20 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-editorial-text transition-all">Notify Me</button>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="flex justify-between items-end mb-20">
          <div>
            <span className="label-text opacity-40 uppercase tracking-[0.4em] font-bold text-[10px]">Official Archives</span>
            <h2 className="text-6xl font-serif mt-6 tracking-tighter">The <span className="italic">Essentials</span></h2>
          </div>
          <Link to="/shop" className="label-text border-b border-editorial-text pb-2 hover:opacity-50 transition-all uppercase tracking-widest text-[11px] font-bold">Catalogue Index</Link>
        </div>
        
        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {featuredProducts.map((product) => (
              <motion.div 
                key={product.id}
                whileHover={{ y: -10 }}
                className="group cursor-pointer"
              >
                <div className="aspect-[3/4] bg-editorial-accent overflow-hidden mb-8 border border-editorial-text/5 flex items-center justify-center relative">
                  {product.images?.[0] ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-100 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-[10px] uppercase tracking-widest opacity-20">Preview Unavailable</div>
                  )}
                  <div className="absolute inset-0 bg-editorial-text/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold uppercase tracking-[0.4em] border border-white px-6 py-3 backdrop-blur-sm">View Details</span>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em]">{product.name}</h3>
                    <p className="text-[10px] opacity-40 uppercase mt-1 tracking-widest">{product.category}</p>
                  </div>
                  <p className="text-xs font-mono font-bold">${product.basePrice}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 border border-dashed border-editorial-text/10 bg-editorial-accent/20">
            <p className="label-text opacity-40 uppercase tracking-[0.3em] font-bold text-[10px]">Vault Currently Sealed</p>
            <p className="text-[9px] mt-4 uppercase tracking-[0.4em] italic">Available in Future Drop</p>
          </div>
        )}
      </section>

      {/* Community Favorites Grid - To be populated by top voted designs */}
      <section className="bg-editorial-accent/30 py-32 border-y border-editorial-text/10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-24">
            <span className="label-text opacity-40 uppercase tracking-[0.4em] font-bold text-[10px]">Crowd Sourced</span>
            <h2 className="text-5xl font-serif mt-6">Community Favorites</h2>
          </div>
          
          <div className="py-24 text-center border border-dashed border-editorial-text/10">
             <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-20 italic">No community favorites archived yet.</p>
             <p className="text-[9px] mt-4 uppercase tracking-widest opacity-20">Winning designs from Community Lab appear here.</p>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-32 bg-editorial-bg">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <Mail size={32} className="mx-auto mb-8 opacity-20" />
          <h2 className="text-5xl font-serif mb-6">Join the Registry</h2>
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-50 mb-12 leading-relaxed">Early access to drops, design challenges, and community insights. No noise, just vision.</p>
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="email" 
              placeholder="YOUR@EMAIL.COM" 
              className="flex-grow bg-transparent border-b border-editorial-text/20 py-4 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-editorial-text placeholder:opacity-20"
            />
            <button className="px-12 py-4 bg-editorial-text text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gray-800 transition-all">Subscribe</button>
          </div>
        </div>
      </section>

      {/* Instagram Gallery Mock */}
      <section className="border-t border-editorial-text/10">
        <div className="grid grid-cols-2 md:grid-cols-6 h-[250px]">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-editorial-accent border-r border-editorial-text/10 flex items-center justify-center group overflow-hidden relative">
               <div className="absolute inset-0 bg-editorial-text/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center z-10">
                 <Instagram size={20} className="text-white" />
               </div>
               <div className="text-[8px] font-bold opacity-10 uppercase tracking-[0.3em]">@ZYRU_VISUALS</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final Brand Motto */}
      <section className="py-24 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.5em] opacity-20">Wear Your Vision // Every Piece Tells A Story</p>
      </section>
    </div>
  );
}
