import { useState, useRef, ChangeEvent, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, Type, Palette, Sparkles, RotateCw, 
  Maximize, Trash2, CheckCircle2, Info, ChevronDown, Plus
} from 'lucide-react';
import { getProducts } from '../lib/db';
import { Product, PrintingMethod, QualityTier, CartItem } from '../types';
import { useCart } from '../contexts/CartContext';

import { uploadImage } from '../lib/cloudinary';

type Tab = 'product' | 'design' | 'text' | 'ai' | 'upload';

interface DesignLayer {
  id: string;
  type: 'image' | 'text';
  content: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  fontFamily?: string;
  color?: string;
  fontSize?: number;
}

export function DesignStudio() {
  const [activeTab, setActiveTab] = useState<Tab>('product');
  const [isUploading, setIsUploading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [selectedSize, setSelectedSize] = useState('M');
  const [printMethod, setPrintMethod] = useState<PrintingMethod>('DTG');
  const [quality, setQuality] = useState<QualityTier>('Standard');
  const [logoPlacement, setLogoPlacement] = useState<string>('Chest');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiConcepts, setAiConcepts] = useState<any[]>([]);
  const [layers, setLayers] = useState<DesignLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart, setIsCartOpen } = useCart();

  // Text Layer States
  const [newText, setNewText] = useState('');
  const [activeFont, setActiveFont] = useState('serif');
  const [textColor, setTextColor] = useState('#000000');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
        if (data.length > 0) setSelectedProduct(data[0]);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const colors = ['#000000', '#FFFFFF', '#333333', '#E5E5E5', '#1A237E', '#B71C1C'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const printMethods: PrintingMethod[] = ['DTG', 'DTF', 'Screen Print', 'Embroidery', 'Premium Embroidery'];
  const qualities: QualityTier[] = ['Standard', 'Premium', 'Luxury'];
  const placements = ['Large', 'Chest', 'Sleeve', 'Back', 'Inside', 'None'];
  const fonts = [
    { name: 'Editorial Serif', value: 'serif' },
    { name: 'Modern Sans', value: 'sans' },
    { name: 'Technical Mono', value: 'mono' }
  ];

  const estimatedPrice = useMemo(() => {
    if (!selectedProduct) return 0;
    let price = selectedProduct.basePrice || 0;
    
    if (quality === 'Premium') price += 15;
    if (quality === 'Luxury') price += 35;
    
    if (printMethod === 'Embroidery') price += 10;
    if (printMethod === 'Premium Embroidery') price += 25;
    if (printMethod === 'Screen Print') price += 5;
    
    price += layers.length * 5;
    return price;
  }, [selectedProduct, quality, printMethod, layers]);

  const handleAddText = () => {
    if (!newText.trim()) return;
    const layer: DesignLayer = {
      id: Date.now().toString(),
      type: 'text',
      content: newText,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: 1,
      zIndex: layers.length,
      fontFamily: activeFont,
      color: textColor,
      fontSize: 24
    };
    setLayers([...layers, layer]);
    setNewText('');
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    setAiConcepts([]);
    try {
      const response = await fetch('/api/ai/generate-concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await response.json();
      if (data.concepts) {
        setAiConcepts(data.concepts);
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAIImage = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      
      if (response.status === 403) {
        alert('This model requires a paid API key. Please configure one in Settings > Secrets.');
        return;
      }
      
      const data = await response.json();
      if (data.url) {
        const newLayer: DesignLayer = {
          id: crypto.randomUUID(),
          type: 'image',
          content: data.url,
          x: 0,
          y: 0,
          scale: 0.5,
          rotation: 0,
          opacity: 1,
          zIndex: layers.length + 1
        };
        setLayers([...layers, newLayer]);
        setSelectedLayerId(newLayer.id);
        setActiveTab('design');
      }
    } catch (error) {
      console.error('AI Image Generation Error:', error);
      alert('Failed to generate image asset.');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyConcept = (concept: any) => {
    // Add a text layer with the concept name or description as a placeholder
    const layer: DesignLayer = {
      id: Date.now().toString(),
      type: 'text',
      content: concept.name.toUpperCase(),
      x: 0,
      y: 0,
      scale: 1.2,
      rotation: 0,
      opacity: 1,
      zIndex: layers.length,
      fontFamily: 'serif',
      color: concept.colors?.[0] || '#000000',
      fontSize: 32
    };
    setLayers([...layers, layer]);
    setLogoPlacement(concept.placement || 'Chest');
    
    // Logic for style could be expanded later
    if (concept.style?.toLowerCase().includes('minimal')) setQuality('Luxury');
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { url } = await uploadImage(file, 'user_designs');
      const newLayer: DesignLayer = {
        id: crypto.randomUUID(),
        type: 'image',
        content: url,
        x: 0,
        y: 0,
        scale: 0.5,
        rotation: 0,
        opacity: 1,
        zIndex: layers.length + 1
      };
      setLayers([...layers, newLayer]);
      setSelectedLayerId(newLayer.id);
      setActiveTab('design');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please check your Cloudinary configuration.');
    } finally {
      setIsUploading(false);
    }
  };

  const updateLayer = (id: string, updates: Partial<DesignLayer>) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    addToCart({
      type: 'custom',
      productId: selectedProduct.id,
      quantity: 1,
      price: estimatedPrice,
      productName: `Custom ${selectedProduct.name}`,
      productImage: selectedProduct.images?.[0] || '',
      options: {
        size: selectedSize,
        color: selectedColor,
        quality: quality,
        printMethod: printMethod,
        layers: layers 
      }
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setIsCartOpen(true);
    }, 1500);
  };

  return (
    <div className="h-screen bg-editorial-bg flex flex-col md:flex-row pt-16 overflow-hidden">
      {/* Sidebar Controls */}
      <div className="w-full md:w-[450px] bg-editorial-bg border-r border-editorial-text flex flex-col order-2 md:order-1 flex-1 md:flex-none md:h-full">
        {/* Tabs */}
        <div className="flex border-b border-editorial-text overflow-x-auto no-scrollbar shrink-0">
          {(['product', 'design', 'text', 'upload', 'ai'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[80px] py-6 text-[9px] font-bold uppercase tracking-[0.2em] transition-all ${
                activeTab === tab ? 'bg-editorial-text text-white' : 'hover:bg-editorial-accent text-editorial-text/40'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                {tab === 'product' && <Palette size={14} />}
                {tab === 'design' && <CheckCircle2 size={14} />}
                {tab === 'text' && <Type size={14} />}
                {tab === 'upload' && <Upload size={14} />}
                {tab === 'ai' && <Sparkles size={14} />}
                <span className="text-[8px]">{tab}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar min-h-0">
          <AnimatePresence mode="wait">
            {activeTab === 'product' && (
              <motion.div key="product" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-12">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-serif italic">Base Canvas</h3>
                    <span className="text-[10px] font-mono opacity-40">{products.length} options</span>
                  </div>
                  {loading ? (
                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2].map(i => <div key={i} className="aspect-square bg-editorial-accent animate-pulse border border-editorial-text/5" />)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {products.map((p) => (
                        <button 
                          key={p.id}
                          onClick={() => setSelectedProduct(p)}
                          className={`p-4 border transition-all text-left group ${
                            selectedProduct?.id === p.id ? 'border-editorial-text bg-editorial-text/5' : 'border-editorial-text/10 hover:border-editorial-text'
                          }`}
                        >
                          <div className="aspect-square mb-3 bg-editorial-muted overflow-hidden flex items-center justify-center">
                            {p.images?.[0] ? (
                              <img src={p.images[0]} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="text-[8px] uppercase tracking-widest opacity-20 text-center px-2">No Template</div>
                            )}
                          </div>
                          <p className="text-[10px] font-bold uppercase truncate mb-1">{p.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">${p.basePrice}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Base Color</h3>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((c) => (
                        <button 
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          className={`w-8 h-8 border transition-all ${
                            selectedColor === c ? 'ring-1 ring-editorial-text ring-offset-4' : 'border-editorial-text/10'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Size</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {sizes.map((s) => (
                        <button 
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`py-2 text-[9px] font-bold border transition-all ${
                            selectedSize === s ? 'bg-editorial-text text-white' : 'border-editorial-text/10'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Logo Placement</h3>
                    <div className="relative">
                      <select 
                        value={logoPlacement}
                        onChange={(e) => setLogoPlacement(e.target.value)}
                        className="w-full bg-transparent border-b border-editorial-text/20 py-2 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-editorial-text appearance-none"
                      >
                        {placements.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <ChevronDown size={12} className="absolute right-0 top-3 pointer-events-none opacity-40" />
                    </div>
                  </div>
                </div>

                <div className="space-y-8 pt-8 border-t border-editorial-text/5">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Material Quality</h3>
                    <Info size={14} className="opacity-20" />
                  </div>
                  <div className="flex gap-2">
                    {qualities.map((q) => (
                      <button 
                        key={q}
                        onClick={() => setQuality(q)}
                        className={`flex-1 py-3 text-[9px] font-bold uppercase tracking-widest border transition-all ${
                          quality === q ? 'bg-editorial-text text-white' : 'border-editorial-text/10 text-editorial-text/40'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'design' && (
              <motion.div key="design" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-12">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6">Production Method</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {printMethods.map((m) => (
                      <button 
                        key={m}
                        onClick={() => setPrintMethod(m)}
                        className={`py-4 px-2 text-[8px] font-bold uppercase tracking-widest border transition-all flex flex-col items-center gap-2 ${
                          printMethod === m ? 'border-editorial-text bg-editorial-accent' : 'border-editorial-text/5 opacity-40'
                        }`}
                      >
                        {m}
                        <div className="h-[1px] w-4 bg-editorial-text/20" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6">Your Assets</h3>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border border-dashed border-editorial-text/10 py-16 flex flex-col items-center justify-center hover:bg-editorial-accent transition-all group"
                  >
                    <Upload size={32} className="text-editorial-text/20 mb-4 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Import Vision</p>
                    <p className="text-[8px] text-gray-400 mt-2 uppercase tracking-widest">Vector / PNG / AI Assets</p>
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>

                {selectedLayerId && (
                  <div className="p-6 bg-editorial-accent border border-editorial-text/5 space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest">Transform Layer</h4>
                      <button onClick={() => setSelectedLayerId(null)} className="opacity-40 hover:opacity-100 transition-opacity">
                        <Plus size={12} className="rotate-45" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-[8px] uppercase mb-2">
                          <span>Scale</span>
                          <span>{Math.round((layers.find(l => l.id === selectedLayerId)?.scale || 1) * 100)}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0.1" 
                          max="3" 
                          step="0.01"
                          value={layers.find(l => l.id === selectedLayerId)?.scale || 1}
                          onChange={(e) => updateLayer(selectedLayerId, { scale: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-black/10 rounded-lg appearance-none cursor-pointer accent-black"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[8px] uppercase mb-2">
                          <span>Rotation</span>
                          <span>{Math.round(layers.find(l => l.id === selectedLayerId)?.rotation || 0)}°</span>
                        </div>
                        <input 
                          type="range" 
                          min="-180" 
                          max="180" 
                          step="1"
                          value={layers.find(l => l.id === selectedLayerId)?.rotation || 0}
                          onChange={(e) => updateLayer(selectedLayerId, { rotation: parseInt(e.target.value) })}
                          className="w-full h-1 bg-black/10 rounded-lg appearance-none cursor-pointer accent-black"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[8px] uppercase mb-2">
                          <span>Opacity</span>
                          <span>{Math.round((layers.find(l => l.id === selectedLayerId)?.opacity || 1) * 100)}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.01"
                          value={layers.find(l => l.id === selectedLayerId)?.opacity || 1}
                          onChange={(e) => updateLayer(selectedLayerId, { opacity: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-black/10 rounded-lg appearance-none cursor-pointer accent-black"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4 pt-8 border-t border-editorial-text/5">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Active Layers</h3>
                    <span className="text-[10px] font-mono opacity-20">{layers.length}</span>
                  </div>
                  <div className="space-y-2">
                    {layers.map((layer) => (
                      <div 
                        key={layer.id} 
                        onClick={() => setSelectedLayerId(layer.id)}
                        className={`flex items-center justify-between p-4 border transition-all cursor-pointer group ${
                          selectedLayerId === layer.id ? 'border-editorial-text bg-editorial-accent' : 'bg-white border-editorial-text/5'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-editorial-accent border border-editorial-text/5 overflow-hidden flex items-center justify-center">
                            {layer.type === 'image' ? (
                              <img src={layer.content} className="w-full h-full object-contain" />
                            ) : (
                              <Type size={16} className="opacity-40" />
                            )}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase truncate max-w-[120px]">{layer.content.length > 15 ? layer.content.slice(0, 15) + '...' : layer.content}</p>
                            <p className="text-[8px] text-gray-400 uppercase tracking-widest">{layer.type === 'image' ? 'Overlay' : 'Text'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button onClick={() => setLayers(layers.filter(l => l.id !== layer.id))}>
                            <Trash2 size={14} className="text-editorial-text/20 hover:text-red-500 transition-colors" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'text' && (
              <motion.div key="text" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-10">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Add Typography</h3>
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      placeholder="ENTER TEXT..." 
                      className="w-full bg-transparent border-b border-editorial-text/20 py-4 text-xs font-bold uppercase tracking-[0.3em] focus:outline-none focus:border-editorial-text placeholder:opacity-20"
                    />
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] opacity-40 mb-3">Font Family</p>
                        <select 
                          value={activeFont}
                          onChange={(e) => setActiveFont(e.target.value)}
                          className="w-full bg-transparent border-b border-editorial-text/10 py-2 text-[10px] font-bold uppercase tracking-widest focus:outline-none appearance-none"
                        >
                          {fonts.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] opacity-40 mb-3">Color</p>
                        <div className="flex gap-2">
                          {['#000000', '#FFFFFF', '#B71C1C'].map(c => (
                            <button 
                              key={c}
                              onClick={() => setTextColor(c)}
                              className={`w-6 h-6 border ${textColor === c ? 'ring-1 ring-editorial-text ring-offset-2' : 'border-editorial-text/10'}`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={handleAddText}
                      className="w-full py-4 bg-editorial-text text-white text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-gray-800 transition-all"
                    >
                      Add Layer <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="pt-8 border-t border-editorial-text/5">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Active Text</h3>
                  {layers.filter(l => l.type === 'text').map(l => (
                    <div key={l.id} className="flex items-center justify-between p-4 bg-white border border-editorial-text/5 mb-2">
                      <span className="text-[10px] font-bold uppercase truncate max-w-[150px]">{l.content}</span>
                      <button onClick={() => setLayers(layers.filter(layer => layer.id !== l.id))}>
                        <Trash2 size={12} className="opacity-20 hover:opacity-100 transition-opacity" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'upload' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em]">Upload Graphics</h3>
                <p className="text-[10px] text-editorial-text/40 leading-relaxed">
                  Import high-resolution PNG or SVG assets. Transparent backgrounds recommended for best results.
                </p>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed border-black/5 p-12 text-center cursor-pointer hover:border-black/20 transition-all group relative overflow-hidden ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
              >
                {isUploading ? (
                  <div className="space-y-4">
                    <RotateCw size={32} className="mx-auto animate-spin opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Uploading to Cloudinary...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload size={32} className="mx-auto opacity-10 group-hover:opacity-40 transition-opacity" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Select Files or Drag & Drop</p>
                    <p className="text-[9px] opacity-30 uppercase">Max 5MB per asset</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept="image/*"
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-[9px] font-bold uppercase tracking-widest opacity-40">Guidelines</h4>
                <ul className="space-y-2 text-[9px] text-editorial-text/40 uppercase tracking-wider">
                  <li>• Use high contrast for screen printing</li>
                  <li>• Keep details above 2mm for embroidery</li>
                  <li>• Vector files (SVG) are prioritized</li>
                </ul>
              </div>
            </div>
          )}
          {activeTab === 'ai' && (
            <motion.div key="ai" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8 pb-12">
                <div className="p-8 bg-editorial-text text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="flex items-center space-x-2 mb-4 relative z-10">
                    <Sparkles size={18} className="text-white/80" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em]">ZYRU™ NEURAL ENGINE</span>
                  </div>
                  <p className="text-[11px] text-white/50 leading-relaxed uppercase tracking-widest relative z-10">
                    Input your conceptual vision. Our neural model will derive architectural patterns and curated design drafts.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <textarea 
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="E.G., A MINIMALIST SILVER DRAGON PATTERN ON THE BACK..."
                      className="w-full h-40 p-6 bg-white border border-editorial-text/5 text-[10px] font-bold uppercase tracking-[0.2em] focus:outline-none focus:border-editorial-text/40 transition-colors resize-none placeholder:opacity-10 leading-loose"
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <div className="w-1 h-1 rounded-full bg-editorial-text/20 animate-pulse" />
                      <div className="w-1 h-1 rounded-full bg-editorial-text/20 animate-pulse [animation-delay:200ms]" />
                      <div className="w-1 h-1 rounded-full bg-editorial-text/20 animate-pulse [animation-delay:400ms]" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={handleGenerateAI}
                      disabled={isGenerating || !aiPrompt}
                      className="bg-editorial-text text-white py-6 text-[10px] font-bold uppercase tracking-[0.4em] disabled:opacity-50 hover:bg-black transition-all flex items-center justify-center group"
                    >
                      {isGenerating ? (
                        <RotateCw size={14} className="animate-spin" />
                      ) : (
                        <span className="flex items-center gap-4">
                          Derive Concepts <Sparkles size={14} />
                        </span>
                      )}
                    </button>
                    <button 
                      onClick={handleGenerateAIImage}
                      disabled={isGenerating || !aiPrompt}
                      className="border border-editorial-text text-editorial-text py-6 text-[10px] font-bold uppercase tracking-[0.4em] disabled:opacity-50 hover:bg-editorial-accent transition-all flex items-center justify-center group"
                    >
                      {isGenerating ? (
                        <RotateCw size={14} className="animate-spin" />
                      ) : (
                        <span className="flex items-center gap-4">
                          Synthesize Asset <Upload size={14} />
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* AI Concepts Results */}
                <div className="space-y-6 pt-8 border-t border-editorial-text/5">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">Derived Concepts</h4>
                    <span className="text-[9px] font-mono opacity-20">{aiConcepts.length} // STABLE</span>
                  </div>
                  
                  {aiConcepts.length === 0 && !isGenerating && (
                    <div className="py-12 text-center border border-dashed border-editorial-text/5">
                      <p className="text-[9px] uppercase tracking-widest opacity-20 italic">Awaiting input signal...</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {aiConcepts.map((concept, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group bg-white border border-editorial-text/5 p-6 hover:border-editorial-text transition-all cursor-pointer"
                        onClick={() => applyConcept(concept)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-[8px] font-mono opacity-40 uppercase mb-1 block">Concept 0{idx + 1}</span>
                            <h5 className="text-[10px] font-bold uppercase tracking-[0.2em]">{concept.name}</h5>
                          </div>
                          <span className="px-2 py-1 bg-editorial-accent text-[8px] font-bold uppercase tracking-widest">{concept.style}</span>
                        </div>
                        <p className="text-[9px] text-editorial-text/60 leading-relaxed uppercase tracking-wider mb-6">
                          {concept.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {concept.colors?.map((c: string) => (
                              <div key={c} className="w-3 h-3 rounded-full border border-black/5" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                          <button className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 group-hover:text-editorial-text transition-colors">
                            Apply Design <Plus size={10} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-editorial-text bg-editorial-bg mt-auto shrink-0">
          <div className="flex justify-between items-end mb-8">
            <div className="group relative">
              <p className="text-[9px] font-bold text-editorial-text/40 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                Instant Quote <Info size={10} className="cursor-help" />
              </p>
              
              {/* Price Breakdown Tooltip */}
              <div className="absolute bottom-full left-0 mb-4 w-64 bg-editorial-text text-white p-6 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all z-50 shadow-2xl border border-white/10">
                <h4 className="text-[10px] font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Price Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-[9px] uppercase tracking-widest opacity-60">
                    <span>Base {selectedProduct?.name}</span>
                    <span className="font-mono">${selectedProduct?.basePrice || 0}</span>
                  </div>
                  {quality !== 'Standard' && (
                    <div className="flex justify-between text-[9px] uppercase tracking-widest opacity-60">
                      <span>{quality} Tier</span>
                      <span className="font-mono">+{quality === 'Premium' ? '15' : '35'}</span>
                    </div>
                  )}
                  {['Embroidery', 'Premium Embroidery', 'Screen Print'].includes(printMethod) && (
                    <div className="flex justify-between text-[9px] uppercase tracking-widest opacity-60">
                      <span>{printMethod}</span>
                      <span className="font-mono">+{printMethod === 'Embroidery' ? '10' : printMethod === 'Premium Embroidery' ? '25' : '5'}</span>
                    </div>
                  )}
                  {layers.length > 0 && (
                    <div className="flex justify-between text-[9px] uppercase tracking-widest opacity-60">
                      <span>Assets ({layers.length})</span>
                      <span className="font-mono">+{layers.length * 5}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest border-t border-white/10 pt-3 mt-1">
                    <span>Total</span>
                    <span className="font-mono">${estimatedPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-3xl font-mono font-bold">${estimatedPrice.toFixed(2)}</span>
                <span className="text-[10px] font-mono opacity-40 uppercase">USD</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-editorial-text/40 uppercase tracking-[0.3em] mb-2">Estimate</p>
              <p className="text-[10px] font-mono font-bold uppercase">5-7 Business Days</p>
            </div>
          </div>
          <button 
            disabled={!selectedProduct || isAdded}
            onClick={handleAddToCart}
            className={`w-full py-5 text-xs font-bold uppercase tracking-[0.3em] transition-all disabled:opacity-10 active:scale-[0.98] ${
              isAdded ? 'bg-green-600 text-white' : 'bg-editorial-text text-white hover:bg-gray-800'
            }`}
          >
            {isAdded ? 'Design Captured // In Bag' : 'Finalize & Add to Cart'}
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-editorial-accent relative overflow-hidden order-1 md:order-2 min-h-[300px]">
        <div className="absolute top-10 left-10 label-text opacity-30 flex items-center gap-4">
          <span>Studio Mode // ZR-MOCK-01</span>
          <span className="w-10 h-[1px] bg-editorial-text/20" />
          <span className="font-mono text-[8px] uppercase">{quality} Tier // {printMethod}</span>
        </div>

        <motion.div layout className="relative w-full max-w-2xl aspect-[4/5] flex items-center justify-center bg-editorial-muted shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] p-20 border border-editorial-text/5">
          {selectedProduct ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute inset-0 mix-blend-multiply opacity-80" style={{ backgroundColor: selectedColor }} />
              {selectedProduct.images?.[0] && (
                <img src={selectedProduct.images[0]} alt="Preview" className="max-w-full max-h-full object-contain grayscale mix-blend-screen opacity-90" referrerPolicy="no-referrer" />
              )}

              {/* Design Layers Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                {layers.map((layer) => (
                  <motion.div 
                    key={layer.id}
                    drag
                    dragMomentum={false}
                    onDragEnd={(_, info) => {
                      updateLayer(layer.id, { 
                        x: layer.x + info.offset.x, 
                        y: layer.y + info.offset.y 
                      });
                    }}
                    className={`absolute cursor-grab active:cursor-grabbing ${selectedLayerId === layer.id ? 'ring-2 ring-editorial-text/20 ring-offset-4' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLayerId(layer.id);
                    }}
                    style={{ left: `calc(50% + ${layer.x}px)`, top: `calc(50% + ${layer.y}px)`, transform: 'translate(-50%, -50%)' }}
                  >
                    {layer.type === 'image' ? (
                      <img 
                        src={layer.content} 
                        className="max-w-[250px] drop-shadow-xl pointer-events-none" 
                        style={{ 
                          transform: `scale(${layer.scale}) rotate(${layer.rotation}deg)`,
                          opacity: layer.opacity 
                        }} 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span 
                        className={`text-2xl font-bold drop-shadow-lg whitespace-nowrap select-none ${
                          layer.fontFamily === 'serif' ? 'font-serif' : 
                          layer.fontFamily === 'mono' ? 'font-mono' : 'font-sans'
                        }`}
                        style={{ 
                          color: layer.color, 
                          transform: `scale(${layer.scale}) rotate(${layer.rotation}deg)`,
                          opacity: layer.opacity
                        }}
                      >
                        {layer.content}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Logo Marker */}
              {logoPlacement !== 'None' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={`border-2 border-dashed border-red-500/30 flex items-center justify-center ${
                    logoPlacement === 'Chest' ? 'w-16 h-8 -translate-y-20 translate-x-12' :
                    logoPlacement === 'Sleeve' ? 'w-8 h-16 -translate-x-40' :
                    logoPlacement === 'Back' ? 'w-32 h-32 translate-y-10' :
                    logoPlacement === 'Large' ? 'w-56 h-56' : 'hidden'
                  }`}>
                    <span className="text-[7px] text-red-500 font-bold uppercase tracking-widest bg-editorial-bg px-2">{logoPlacement}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center"><p className="label-text opacity-20 italic">Select a base canvas to begin</p></div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
