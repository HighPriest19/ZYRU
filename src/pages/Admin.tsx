import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, ShoppingCart, Users, PieChart, 
  Plus, Search, Edit2, Trash2, CheckCircle2, 
  Clock, Filter, BarChart2, MessageSquare, Tag,
  LayoutDashboard, ChevronRight, X, FileText, Gift
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  getProducts, 
  getAllOrders, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  updateOrderStatus,
  createPoll,
  getBlogPosts,
  createBlogPost,
  deleteBlogPost,
  getDiscounts,
  createDiscount,
  deleteDiscount
} from '../lib/db';
import { Product, Order, Poll, BlogPost, Discount, ProductCategory, ProductType } from '../types';
import { Skeleton, OrderRowSkeleton } from '../components/Skeleton';

type AdminTab = 'overview' | 'products' | 'orders' | 'blog' | 'discounts' | 'community' | 'users' | 'reviews' | 'config';

export function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [siteConfig, setSiteConfig] = useState<any[]>([]);
  const [isSqlActive, setIsSqlActive] = useState(true);
  
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingBlogPost, setIsAddingBlogPost] = useState(false);
  const [isAddingDiscount, setIsAddingDiscount] = useState(false);

  // Form States
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    category: 'Minimal',
    type: 'Short Sleeve T-Shirt',
    basePrice: 0,
    isOfficial: true,
    isPublished: true,
    stock: 50,
    images: [],
    colors: ['#000000', '#FFFFFF'],
    sizes: ['S', 'M', 'L', 'XL']
  });

  const [newPost, setNewPost] = useState<Partial<BlogPost>>({
    title: '',
    excerpt: '',
    content: '',
    author: user?.displayName || 'Admin',
    category: 'Announcements',
    isPublished: true
  });

  const [newDiscount, setNewDiscount] = useState<Partial<Discount>>({
    code: '',
    type: 'percentage',
    value: 0,
    isActive: true
  });

  useEffect(() => {
    if (!user || user.email !== 'adamsolagunju17@gmail.com') {
      navigate('/');
      return;
    }

    async function loadData() {
      try {
        const [pData, oData, bData, dData, cData] = await Promise.all([
          getProducts(false),
          getAllOrders(),
          getBlogPosts(false),
          getDiscounts(),
          fetch('/api/site-config').then(async res => {
            if (res.status === 503) {
              setIsSqlActive(false);
              return [];
            }
            return res.json();
          })
        ]);
        setProducts(pData);
        setOrders(oData);
        setBlogPosts(bData);
        setDiscounts(dData);
        setSiteConfig(cData);
      } catch (err) {
        console.error('Admin data load failed:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, navigate]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await createProduct(newProduct as Omit<Product, 'id' | 'createdAt'>);
      
      // Sync to SQL
      if (user) {
        const token = await user.getIdToken();
        await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id: created.id,
            name: created.name,
            description: created.description,
            price: Math.round(created.basePrice * 100),
            category: created.category,
            stock: created.stock,
            metadata: { type: created.type, colors: created.colors, sizes: created.sizes }
          })
        });
      }

      setIsAddingProduct(false);
      const updated = await getProducts(false);
      setProducts(updated);
    } catch (err) {
      alert('Failed to create product');
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBlogPost(newPost as Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>);
      setIsAddingBlogPost(false);
      const updated = await getBlogPosts(false);
      setBlogPosts(updated);
    } catch (err) {
      alert('Failed to create post');
    }
  };

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDiscount({
        ...newDiscount,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      } as any);
      setIsAddingDiscount(false);
      const updated = await getDiscounts();
      setDiscounts(updated);
    } catch (err) {
      alert('Failed to create discount');
    }
  };

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatus(orderId, status);
      const updated = await getAllOrders();
      setOrders(updated);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-editorial-bg flex pt-16">
        <aside className="w-64 border-r border-editorial-text bg-white hidden lg:flex flex-col h-[calc(100vh-64px)] fixed">
          <div className="p-8 border-b border-editorial-text/10 space-y-4">
             <Skeleton className="h-4 w-24" />
             <Skeleton className="h-8 w-32" />
          </div>
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-12 w-full bg-editorial-text/5 animate-pulse" />)}
          </div>
        </aside>
        <main className="flex-grow lg:ml-64 p-8 md:p-12 space-y-12">
          <header className="flex justify-between items-end">
            <div className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-12 w-64" />
            </div>
            <Skeleton className="h-12 w-48" />
          </header>
          <div className="grid grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 w-full bg-editorial-text/5 animate-pulse" />)}
          </div>
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-editorial-bg flex pt-16">
      {/* Admin Rail */}
      <aside className="w-64 border-r border-editorial-text bg-white hidden lg:flex flex-col h-[calc(100vh-64px)] fixed z-20">
        <div className="p-8 border-b border-editorial-text/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">System Online</span>
          </div>
          <h2 className="text-xl font-serif italic">Command Center</h2>
        </div>

        <nav className="flex-grow p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {(['overview', 'products', 'orders', 'blog', 'discounts', 'community', 'users', 'reviews', 'config'] as AdminTab[]).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center justify-between p-4 text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-editorial-text text-white shadow-xl' : 'hover:bg-editorial-accent opacity-40 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-3">
                {tab === 'overview' && <LayoutDashboard size={14} />}
                {tab === 'products' && <Package size={14} />}
                {tab === 'orders' && <ShoppingCart size={14} />}
                {tab === 'blog' && <FileText size={14} />}
                {tab === 'discounts' && <Gift size={14} />}
                {tab === 'community' && <Users size={14} />}
                {tab === 'users' && <Users size={14} />}
                {tab === 'reviews' && <MessageSquare size={14} />}
                {tab === 'config' && <PieChart size={14} />}
                {tab}
              </div>
              <ChevronRight size={12} className={activeTab === tab ? 'opacity-100' : 'opacity-0'} />
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-editorial-text/10">
          <p className="text-[9px] font-bold uppercase tracking-widest opacity-20">ZYRU™ CORE v1.2.0</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow lg:ml-64 p-8 md:p-12 min-h-[calc(100vh-64px)]">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
              <header className="flex justify-between items-end">
                <div>
                  <span className="label-text opacity-40 uppercase tracking-[0.3em] font-bold text-[10px]">Real-time Analytics</span>
                  <h1 className="text-5xl font-serif mt-4 italic tracking-tighter">Command Overview</h1>
                </div>
                <div className="flex gap-4">
                   <button className="px-8 py-4 border border-editorial-text text-[10px] font-bold uppercase tracking-widest hover:bg-editorial-text hover:text-white transition-all shadow-lg">Download Manifest</button>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  { label: 'Total Revenue', value: `$${orders.reduce((sum, o) => sum + o.totalPrice, 0).toFixed(2)}`, icon: <BarChart2 size={20} />, trend: '+0%' },
                  { label: 'Active Orders', value: orders.length, icon: <ShoppingCart size={20} />, trend: '+0%' },
                  { label: 'Products', value: products.length, icon: <Package size={20} />, trend: '+0%' },
                  { label: 'Points Issued', value: '1,240', icon: <Tag size={20} />, trend: '+5%' }
                ].map((stat, i) => (
                  <div key={i} className="p-10 bg-white border border-editorial-text/5 group hover:border-editorial-text transition-all shadow-sm hover:shadow-2xl">
                    <div className="flex justify-between items-start mb-8">
                      <div className="p-4 bg-editorial-accent group-hover:bg-editorial-text group-hover:text-white transition-all">{stat.icon}</div>
                      <span className="text-[10px] font-mono font-bold text-green-600">{stat.trend}</span>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30 mb-2">{stat.label}</p>
                    <p className="text-4xl font-mono font-bold tracking-tighter">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="p-10 bg-white border border-editorial-text/5 shadow-sm">
                  <div className="flex justify-between items-center mb-10 border-b border-editorial-text/10 pb-6">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.3em]">Recent Operational Logs</h3>
                    <button className="text-[10px] font-bold uppercase underline opacity-30 hover:opacity-100">View All</button>
                  </div>
                  <div className="space-y-8">
                    {orders.slice(0, 5).map(order => (
                      <div key={order.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-editorial-accent flex items-center justify-center font-mono text-[10px] font-bold group-hover:bg-editorial-text group-hover:text-white transition-all">#ORD</div>
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest">Order_{order.id.slice(-4)}</p>
                            <p className="text-[9px] opacity-40 uppercase tracking-[0.2em] mt-1 font-bold">{order.status} // {new Date(order.createdAt?.toDate()).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono font-bold">${order.totalPrice}</span>
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <div className="py-24 text-center opacity-20 italic">
                        <p className="text-[11px] uppercase tracking-[0.4em] font-bold">Awaiting First Transmission</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-10 bg-white border border-editorial-text/5 shadow-sm">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-10 border-b border-editorial-text/10 pb-6">Production Density</h3>
                  <div className="space-y-8">
                     {products.slice(0, 5).map(product => (
                       <div key={product.id} className="flex items-center justify-between">
                         <div className="flex items-center gap-6">
                           <div className="w-12 h-16 bg-editorial-accent overflow-hidden grayscale group-hover:grayscale-0">
                             {product.images?.[0] && <img src={product.images[0]} className="w-full h-full object-cover" />}
                           </div>
                           <div>
                             <p className="text-[11px] font-bold uppercase tracking-widest">{product.name}</p>
                             <div className="flex items-center gap-2 mt-1">
                               <div className="w-24 h-1 bg-editorial-accent overflow-hidden">
                                 <div className="h-full bg-editorial-text" style={{ width: `${Math.min(product.stock, 100)}%` }} />
                               </div>
                               <span className="text-[9px] opacity-40 uppercase font-bold">{product.stock} Units</span>
                             </div>
                           </div>
                         </div>
                         <span className="text-[11px] font-mono font-bold">${product.basePrice}</span>
                       </div>
                     ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
              <header className="flex justify-between items-end">
                <div>
                  <span className="label-text opacity-40 uppercase tracking-[0.3em] font-bold text-[10px]">Registry Studio</span>
                  <h1 className="text-5xl font-serif mt-4 italic tracking-tighter">Production Grid</h1>
                </div>
                <button 
                  onClick={() => setIsAddingProduct(true)}
                  className="px-10 py-5 bg-editorial-text text-white text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-gray-800 transition-all shadow-2xl"
                >
                  <Plus size={18} /> Initialize Entry
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10">
                {products.map(product => (
                  <div key={product.id} className="group bg-white border border-editorial-text/5 overflow-hidden flex flex-col shadow-sm hover:shadow-2xl transition-all">
                    <div className="aspect-[3/4] bg-editorial-accent relative overflow-hidden flex items-center justify-center">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" />
                      ) : (
                        <span className="text-[11px] font-bold opacity-10 uppercase tracking-[0.4em] italic">Awaiting Visual</span>
                      )}
                      <div className="absolute inset-0 bg-editorial-text/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4">
                        <button className="p-4 bg-white shadow-xl hover:bg-gray-100 transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => deleteProduct(product.id)} className="p-4 bg-white shadow-xl hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                      {!product.isPublished && (
                        <div className="absolute top-6 left-6 bg-black text-white text-[9px] font-bold px-3 py-1 uppercase tracking-[0.3em]">Draft_Mode</div>
                      )}
                    </div>
                    <div className="p-8">
                      <p className="text-[9px] font-bold opacity-30 uppercase tracking-[0.3em] mb-2">{product.category} // {product.type}</p>
                      <h3 className="text-[12px] font-bold uppercase tracking-widest mb-6 truncate leading-relaxed">{product.name}</h3>
                      <div className="flex justify-between items-center border-t border-editorial-text/5 pt-6">
                        <span className="text-[12px] font-mono font-bold tracking-tighter">${product.basePrice}</span>
                        <span className="text-[10px] opacity-40 uppercase font-mono font-bold">In_Stock: {product.stock}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="col-span-full py-48 text-center border border-dashed border-editorial-text/10 bg-editorial-accent/20">
                    <p className="text-[11px] uppercase tracking-[0.5em] font-bold opacity-30 italic">No visions registered in system.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'blog' && (
            <motion.div key="blog" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
              <header className="flex justify-between items-end">
                <div>
                  <span className="label-text opacity-40 uppercase tracking-[0.3em] font-bold text-[10px]">Transmission Hub</span>
                  <h1 className="text-5xl font-serif mt-4 italic tracking-tighter">Blog & News</h1>
                </div>
                <button 
                  onClick={() => setIsAddingBlogPost(true)}
                  className="px-10 py-5 bg-editorial-text text-white text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-gray-800 transition-all shadow-2xl"
                >
                  <Plus size={18} /> New Transmission
                </button>
              </header>

              <div className="bg-white border border-editorial-text/10 shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-editorial-text/10 bg-editorial-accent/20">
                      <th className="p-8 text-[11px] font-bold uppercase tracking-widest opacity-40">Title</th>
                      <th className="p-8 text-[11px] font-bold uppercase tracking-widest opacity-40">Category</th>
                      <th className="p-8 text-[11px] font-bold uppercase tracking-widest opacity-40">Date</th>
                      <th className="p-8 text-[11px] font-bold uppercase tracking-widest opacity-40">Status</th>
                      <th className="p-8 text-[11px] font-bold uppercase tracking-widest opacity-40 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-editorial-text/5">
                    {blogPosts.map(post => (
                      <tr key={post.id} className="hover:bg-editorial-accent/5 transition-colors group">
                        <td className="p-8">
                          <p className="text-[12px] font-bold uppercase tracking-widest leading-relaxed">{post.title}</p>
                          <p className="text-[10px] opacity-40 mt-1 truncate max-w-md">{post.excerpt}</p>
                        </td>
                        <td className="p-8">
                          <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40">{post.category}</span>
                        </td>
                        <td className="p-8">
                          <span className="text-[10px] font-mono opacity-60 font-bold">{new Date(post.createdAt?.toDate()).toLocaleDateString()}</span>
                        </td>
                        <td className="p-8">
                          <span className={`text-[9px] font-bold uppercase px-4 py-1 tracking-widest ${
                            post.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {post.isPublished ? 'Live' : 'Draft'}
                          </span>
                        </td>
                        <td className="p-8 text-right">
                          <div className="flex justify-end gap-4">
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-editorial-accent"><Edit2 size={14} /></button>
                            <button onClick={() => deleteBlogPost(post.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {blogPosts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-32 text-center">
                          <p className="text-[11px] uppercase tracking-[0.5em] font-bold opacity-30 italic">Hub Silent // No transmissions broadcasted.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'discounts' && (
            <motion.div key="discounts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
               <header className="flex justify-between items-end">
                <div>
                  <span className="label-text opacity-40 uppercase tracking-[0.3em] font-bold text-[10px]">Incentive Protocol</span>
                  <h1 className="text-5xl font-serif mt-4 italic tracking-tighter">Discount Codes</h1>
                </div>
                <button 
                  onClick={() => setIsAddingDiscount(true)}
                  className="px-10 py-5 bg-editorial-text text-white text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-gray-800 transition-all shadow-2xl"
                >
                  <Plus size={18} /> New Protocol
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {discounts.map(discount => (
                  <div key={discount.id} className="p-10 bg-white border border-editorial-text/10 shadow-sm relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => deleteDiscount(discount.id)} className="p-2 text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                    </div>
                    <div className="flex justify-between items-start mb-8">
                      <div className="p-4 bg-editorial-accent"><Tag size={20} className="opacity-40" /></div>
                      <span className={`text-[9px] font-bold uppercase px-3 py-1 tracking-widest ${
                        discount.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {discount.isActive ? 'Active' : 'Expired'}
                      </span>
                    </div>
                    <h3 className="text-2xl font-mono font-bold tracking-widest mb-2">{discount.code}</h3>
                    <p className="text-[11px] font-bold uppercase opacity-40 mb-6 tracking-[0.2em]">
                      {discount.type === 'percentage' ? `${discount.value}% OFF` : `$${discount.value} OFF`}
                    </p>
                    <div className="flex justify-between items-center pt-6 border-t border-editorial-text/5">
                      <span className="text-[10px] font-bold uppercase opacity-20">Usage: {discount.usageCount}</span>
                      <span className="text-[10px] font-mono opacity-40 font-bold">Ends: {new Date(discount.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {discounts.length === 0 && (
                   <div className="col-span-full py-48 text-center border border-dashed border-editorial-text/10 bg-editorial-accent/20">
                    <p className="text-[11px] uppercase tracking-[0.5em] font-bold opacity-30 italic">No protocols initialized.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
               <header className="flex justify-between items-end">
                <div>
                  <span className="label-text opacity-40 uppercase tracking-[0.3em] font-bold text-[10px]">Production Queue</span>
                  <h1 className="text-5xl font-serif mt-4 italic tracking-tighter">Operations</h1>
                </div>
                <div className="flex gap-4">
                  <button className="px-8 py-4 border border-editorial-text/10 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-editorial-accent transition-all">
                    <Filter size={16} /> Filter Queue
                  </button>
                </div>
              </header>

              <div className="bg-white border border-editorial-text/10 overflow-x-auto shadow-sm">
                <table className="w-full text-left min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-editorial-text/10 bg-editorial-accent/20">
                      <th className="p-8 text-[11px] font-bold uppercase tracking-widest opacity-40">Identifier</th>
                      <th className="p-8 text-[11px] font-bold uppercase tracking-widest opacity-40">Identity</th>
                      <th className="p-8 text-[11px] font-bold uppercase tracking-widest opacity-40">Volume</th>
                      <th className="p-8 text-[11px] font-bold uppercase tracking-widest opacity-40">Valuation</th>
                      <th className="p-8 text-[11px] font-bold uppercase tracking-widest opacity-40">Status</th>
                      <th className="p-8 text-[11px] font-bold uppercase tracking-widest opacity-40">Execution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-editorial-text/5">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-editorial-accent/10 transition-colors group">
                        <td className="p-8 font-mono text-[11px] font-bold tracking-widest">#{order.id.slice(-8)}</td>
                        <td className="p-8">
                          <p className="text-[11px] font-bold uppercase tracking-widest leading-relaxed">{order.shippingAddress.name}</p>
                          <p className="text-[10px] opacity-40 font-bold uppercase tracking-[0.1em] mt-1">{order.shippingAddress.country}</p>
                        </td>
                        <td className="p-8">
                          <span className="text-[11px] font-mono font-bold">{order.items.length} Units</span>
                        </td>
                        <td className="p-8">
                          <span className="text-[12px] font-mono font-bold tracking-tighter">${order.totalPrice}</span>
                        </td>
                        <td className="p-8">
                          <span className={`text-[9px] font-bold uppercase px-4 py-1 rounded-none tracking-widest ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-8">
                          <div className="flex items-center gap-4">
                            <select 
                              onChange={(e) => handleUpdateStatus(order.id, e.target.value as any)}
                              className="text-[10px] font-bold uppercase bg-transparent border border-editorial-text/20 py-2 px-4 focus:outline-none focus:border-editorial-text transition-all"
                              defaultValue={order.status}
                            >
                              <option value="Received">Received</option>
                              <option value="Approved">Approved</option>
                              <option value="Printing">Printing</option>
                              <option value="Embroidery">Embroidery</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                            <button className="p-3 hover:bg-editorial-accent rounded-none transition-colors opacity-0 group-hover:opacity-100"><Edit2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-48 text-center">
                          <p className="text-[11px] uppercase tracking-[0.5em] font-bold opacity-30 italic leading-relaxed">System Idle // No production requests detected.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}          {activeTab === 'config' && (
            <motion.div key="config" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
               <header className="flex justify-between items-end">
                <div>
                  <span className="label-text opacity-40 uppercase tracking-[0.3em] font-bold text-[10px]">Infrastructure Registry</span>
                  <h1 className="text-5xl font-serif mt-4 italic tracking-tighter">System Config</h1>
                </div>
              </header>

              {!isSqlActive ? (
                 <div className="p-20 bg-editorial-accent/20 border border-dashed border-editorial-text/10 text-center">
                    <p className="text-[11px] uppercase tracking-[0.4em] font-bold opacity-40 leading-relaxed max-w-sm mx-auto">
                      Relational Database Bridge (Cloud SQL) is not active. 
                      Please configure DATABASE_URL to enable advanced site config and mirroring.
                    </p>
                 </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="p-10 bg-white border border-editorial-text/5 shadow-sm">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-10 border-b border-editorial-text/10 pb-6">SQL site_config Table</h3>
                    <div className="space-y-6">
                      {siteConfig.map(c => (
                        <div key={c.key} className="p-6 bg-editorial-accent/30 border border-editorial-text/5">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-mono font-bold">{c.key}</span>
                            <span className="text-[9px] opacity-40">{new Date(c.updatedAt).toLocaleString()}</span>
                          </div>
                          <pre className="text-[10px] font-mono overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(c.value, null, 2)}
                          </pre>
                        </div>
                      ))}
                      {siteConfig.length === 0 && (
                        <p className="text-center py-12 opacity-40 italic text-[11px] uppercase tracking-widest">No config entries found in SQL.</p>
                      )}
                    </div>
                  </div>

                  <div className="p-10 bg-white border border-editorial-text/5 shadow-sm">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-10 border-b border-editorial-text/10 pb-6">Initialize/Sync Protocol</h3>
                    <div className="space-y-8">
                      <p className="text-[11px] font-light leading-relaxed">
                        This protocol synchronizes critical system metadata between Firestore and the relational SQL database. 
                        Use this to refresh relational indexes or broadcast system-wide updates.
                      </p>
                      <button 
                        onClick={async () => {
                          const token = await user?.getIdToken();
                          await fetch('/api/site-config', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ key: 'last_sync', value: { timestamp: new Date().toISOString(), admin: user?.email } })
                          });
                          const updated = await fetch('/api/site-config').then(res => res.json());
                          setSiteConfig(updated);
                        }}
                        className="w-full py-6 border border-editorial-text text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-editorial-text hover:text-white transition-all shadow-lg"
                      >
                        Broadcast Sync Signal
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isAddingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-editorial-text/95 backdrop-blur-sm" onClick={() => setIsAddingProduct(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-3xl bg-white p-16 overflow-y-auto max-h-[90vh] custom-scrollbar shadow-2xl">
              <div className="flex justify-between items-start mb-16">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.5em] font-bold opacity-30">Production_Registry</span>
                  <h2 className="text-5xl font-serif mt-4 italic tracking-tighter">Initialize Entry</h2>
                </div>
                <button onClick={() => setIsAddingProduct(false)} className="p-3 hover:bg-editorial-accent transition-colors"><X size={24} /></button>
              </div>
              <form onSubmit={handleCreateProduct} className="space-y-12">
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Design Name</label>
                    <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-transparent border-b border-editorial-text/20 py-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-editorial-text" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Valuation (USD)</label>
                    <input required type="number" value={newProduct.basePrice} onChange={e => setNewProduct({...newProduct, basePrice: parseFloat(e.target.value)})} className="w-full bg-transparent border-b border-editorial-text/20 py-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-editorial-text" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Classification</label>
                    <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value as any})} className="w-full bg-transparent border-b border-editorial-text/20 py-4 text-xs font-bold uppercase tracking-widest focus:outline-none">
                      <option value="Minimal">Minimal Collection</option>
                      <option value="Streetwear">Streetwear</option>
                      <option value="Luxury">Luxury Collection</option>
                      <option value="Limited Edition">Limited Edition</option>
                    </select>
                  </div>
                   <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Blueprint Type</label>
                    <select value={newProduct.type} onChange={e => setNewProduct({...newProduct, type: e.target.value as any})} className="w-full bg-transparent border-b border-editorial-text/20 py-4 text-xs font-bold uppercase tracking-widest focus:outline-none">
                      <option value="Short Sleeve T-Shirt">Short Sleeve T-Shirt</option>
                      <option value="Oversized T-Shirt">Oversized T-Shirt</option>
                      <option value="Hoodie">Hoodie</option>
                      <option value="Face Cap">Face Cap</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Visual Manifest (URL)</label>
                  <input type="text" value={newProduct.images?.[0] || ''} onChange={e => setNewProduct({...newProduct, images: [e.target.value]})} className="w-full bg-transparent border-b border-editorial-text/20 py-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-editorial-text" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Narrative (Description)</label>
                  <textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full h-40 bg-editorial-accent/30 border border-editorial-text/10 p-6 text-[11px] font-light leading-relaxed focus:outline-none focus:border-editorial-text resize-none" />
                </div>
                <button type="submit" className="w-full bg-editorial-text text-white py-8 text-[11px] font-bold uppercase tracking-[0.5em] hover:bg-gray-800 transition-all shadow-2xl">Broadcast to Production</button>
              </form>
            </motion.div>
          </div>
        )}

        {isAddingBlogPost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-editorial-text/95 backdrop-blur-sm" onClick={() => setIsAddingBlogPost(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-3xl bg-white p-16 overflow-y-auto max-h-[90vh] shadow-2xl">
              <div className="flex justify-between items-start mb-16">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.5em] font-bold opacity-30">Transmission_Encoder</span>
                  <h2 className="text-5xl font-serif mt-4 italic tracking-tighter">New Blog Entry</h2>
                </div>
                <button onClick={() => setIsAddingBlogPost(false)} className="p-3 hover:bg-editorial-accent transition-colors"><X size={24} /></button>
              </div>
              <form onSubmit={handleCreatePost} className="space-y-12">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Transmission Title</label>
                  <input required type="text" value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} className="w-full bg-transparent border-b border-editorial-text/20 py-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-editorial-text" />
                </div>
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Category</label>
                    <select value={newPost.category} onChange={e => setNewPost({...newPost, category: e.target.value})} className="w-full bg-transparent border-b border-editorial-text/20 py-4 text-xs font-bold uppercase tracking-widest focus:outline-none">
                      <option value="Announcements">Announcements</option>
                      <option value="Editorial">Editorial</option>
                      <option value="Collections">Collections</option>
                      <option value="Behind the Vision">Behind the Vision</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Visual Header (URL)</label>
                    <input type="text" value={newPost.image} onChange={e => setNewPost({...newPost, image: e.target.value})} className="w-full bg-transparent border-b border-editorial-text/20 py-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-editorial-text" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Transmission Excerpt</label>
                  <input required type="text" value={newPost.excerpt} onChange={e => setNewPost({...newPost, excerpt: e.target.value})} className="w-full bg-transparent border-b border-editorial-text/20 py-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-editorial-text" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Body Content</label>
                  <textarea required value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} className="w-full h-64 bg-editorial-accent/30 border border-editorial-text/10 p-6 text-[11px] font-light leading-relaxed focus:outline-none focus:border-editorial-text resize-none" />
                </div>
                <button type="submit" className="w-full bg-editorial-text text-white py-8 text-[11px] font-bold uppercase tracking-[0.5em] hover:bg-gray-800 transition-all shadow-2xl">Broadcast Transmission</button>
              </form>
            </motion.div>
          </div>
        )}

        {isAddingDiscount && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-editorial-text/95 backdrop-blur-sm" onClick={() => setIsAddingDiscount(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-2xl bg-white p-16 shadow-2xl">
              <div className="flex justify-between items-start mb-16">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.5em] font-bold opacity-30">Incentive_Encoder</span>
                  <h2 className="text-5xl font-serif mt-4 italic tracking-tighter">New Protocol</h2>
                </div>
                <button onClick={() => setIsAddingDiscount(false)} className="p-3 hover:bg-editorial-accent transition-colors"><X size={24} /></button>
              </div>
              <form onSubmit={handleCreateDiscount} className="space-y-12">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Access Code</label>
                  <input required type="text" value={newDiscount.code} onChange={e => setNewDiscount({...newDiscount, code: e.target.value?.toUpperCase()})} className="w-full bg-transparent border-b border-editorial-text/20 py-4 text-2xl font-mono font-bold tracking-[0.5em] focus:outline-none focus:border-editorial-text" placeholder="ZYRU_VISION" />
                </div>
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Protocol Type</label>
                    <select value={newDiscount.type} onChange={e => setNewDiscount({...newDiscount, type: e.target.value as any})} className="w-full bg-transparent border-b border-editorial-text/20 py-4 text-xs font-bold uppercase tracking-widest focus:outline-none">
                      <option value="percentage">Percentage OFF</option>
                      <option value="fixed">Fixed Amount OFF</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Value</label>
                    <input required type="number" value={newDiscount.value} onChange={e => setNewDiscount({...newDiscount, value: parseFloat(e.target.value)})} className="w-full bg-transparent border-b border-editorial-text/20 py-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-editorial-text" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-editorial-text text-white py-8 text-[11px] font-bold uppercase tracking-[0.5em] hover:bg-gray-800 transition-all shadow-2xl">Authorize Protocol</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

