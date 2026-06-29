import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, ChevronRight, ShoppingBag, Clock, CheckCircle2, Truck, Box } from 'lucide-react';
import { getOrdersByUser } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { Order } from '../types';

export function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      try {
        const data = await getOrdersByUser(user.uid);
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'Shipped': return <Truck size={14} />;
      case 'Delivered': return <CheckCircle2 size={14} />;
      case 'Printing':
      case 'Embroidery': return <Box size={14} className="animate-pulse" />;
      default: return <Clock size={14} />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Delivered': return 'bg-green-50 text-green-600';
      case 'Shipped': return 'bg-blue-50 text-blue-600';
      case 'Printing':
      case 'Embroidery': return 'bg-yellow-50 text-yellow-600';
      case 'Approved': return 'bg-purple-50 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 w-full bg-gray-50 animate-pulse border border-black/5" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-24 border border-dashed border-black/10">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={24} className="text-gray-300" />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-2">No orders found</h3>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-8 max-w-[200px] mx-auto leading-relaxed">
          You haven't placed any orders yet. Start designing your vision today.
        </p>
        <button 
          onClick={() => window.location.href = '/design-studio'}
          className="bg-black text-white px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gray-900 transition-all"
        >
          Open Studio
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-black/5 pb-4">
        <h2 className="text-lg font-bold uppercase tracking-widest">Order History</h2>
        <span className="text-[9px] font-mono opacity-30">{orders.length} // TOTAL ORDERS</span>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <motion.div 
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-white border border-black/5 hover:border-black/20 transition-all gap-6"
          >
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gray-50 border border-black/5 flex items-center justify-center relative overflow-hidden">
                <Package size={24} className="text-gray-300 relative z-10" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider">Order #{order.id.slice(-8).toUpperCase()}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 font-mono">
                  Placed on {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Processing...'}
                </p>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-2">
                  {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-12">
              <div className="text-right">
                <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-1 opacity-50">Total Amount</p>
                <p className="text-sm font-bold font-mono tracking-tight">${order.totalPrice.toFixed(2)}</p>
              </div>
              <button className="w-10 h-10 border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-all">
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
