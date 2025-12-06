import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, Plus, Palette, Image as ImageIcon, Sparkles, Loader2, Check } from 'lucide-react';
import { useCanvas } from '../context/CanvasContext';

const BrandKitPanel = () => {
  const { canvas } = useCanvas();
  const [brandKits, setBrandKits] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Initial loading state
  const [isProcessing, setIsProcessing] = useState(false); // For save/delete actions
  const [activeAction, setActiveAction] = useState(null); // 'save', 'load', 'delete'

  const [currentKit, setCurrentKit] = useState({
    name: '',
    logoUrl: '',
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
    fonts: [],
    preferences: {}
  });
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedKit, setSelectedKit] = useState(null);

  // Helper: Show Notification
  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `fixed top-4 right-4 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white px-4 py-2 rounded shadow-lg z-50 flex items-center gap-2 animate-fade-in-down`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  };

  // Effect: Load kits on mount with simulated delay for Skeleton UI
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate network request for UX polish
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        const saved = localStorage.getItem('retailforge_brand_kits');
        if (saved) {
          setBrandKits(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading brand kits:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const saveBrandKits = (kits) => {
    try {
      localStorage.setItem('retailforge_brand_kits', JSON.stringify(kits));
      setBrandKits(kits);
    } catch (error) {
      console.error('Error saving brand kits:', error);
      showNotification('Failed to save brand kit', 'error');
    }
  };

  const handleSaveKit = async () => {
    if (!currentKit.name.trim()) {
      alert('Please enter a brand kit name');
      return;
    }

    setIsProcessing(true);
    setActiveAction('save');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    const newKit = {
      ...currentKit,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };

    const updatedKits = [...brandKits, newKit];
    saveBrandKits(updatedKits);
    setIsCreatingNew(false);
    setCurrentKit({
      name: '',
      logoUrl: '',
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
      fonts: [],
      preferences: {}
    });

    setIsProcessing(false);
    setActiveAction(null);
    showNotification('✓ Brand kit saved successfully', 'success');
  };

  const handleLoadKit = async (kit) => {
    if (!canvas) return;
    
    setIsProcessing(true);
    setActiveAction(`load-${kit.id}`);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 600));

    // Apply colors to canvas background
    if (kit.colors && kit.colors[0]) {
      canvas.setBackgroundColor(kit.colors[0], canvas.renderAll.bind(canvas));
    }

    // Update current kit reference
    setSelectedKit(kit);

    // Update last used timestamp
    const updatedKits = brandKits.map(k =>
      k.id === kit.id ? { ...k, lastUsed: new Date().toISOString() } : k
    );
    saveBrandKits(updatedKits);

    setIsProcessing(false);
    setActiveAction(null);
    showNotification('✓ Brand kit loaded', 'success');
  };

  const handleDeleteKit = async (kitId) => {
    if (!confirm('Are you sure you want to delete this brand kit?')) return;

    // Optimistic update could happen here, but we'll show loading
    const updatedKits = brandKits.filter(k => k.id !== kitId);
    saveBrandKits(updatedKits);

    if (selectedKit?.id === kitId) {
      setSelectedKit(null);
    }

    showNotification('✓ Brand kit deleted', 'success');
  };

  const extractCurrentBrandSettings = () => {
    if (!canvas) return null;

    const objects = canvas.getObjects();
    const colors = new Set();
    const fonts = new Set();
    let logoUrl = '';

    objects.forEach(obj => {
      if (obj.fill && typeof obj.fill === 'string') colors.add(obj.fill);
      if (obj.stroke) colors.add(obj.stroke);
      if (obj.fontFamily) fonts.add(obj.fontFamily);
      if (obj.type === 'image' && !logoUrl) logoUrl = obj.getSrc ? obj.getSrc() : '';
    });

    const bgColor = canvas.backgroundColor;
    if (bgColor && typeof bgColor === 'string') colors.add(bgColor);

    return {
      colors: Array.from(colors).slice(0, 5),
      fonts: Array.from(fonts),
      logoUrl
    };
  };

  const handleCreateKit = () => {
    const extracted = extractCurrentBrandSettings();
    setCurrentKit({
      name: '',
      logoUrl: extracted?.logoUrl || '',
      colors: extracted?.colors.length > 0 ? extracted.colors : currentKit.colors,
      fonts: extracted?.fonts || [],
      preferences: {
        lastUsed: new Date().toISOString(),
        canvasSize: { width: canvas?.width, height: canvas?.height }
      }
    });
    setIsCreatingNew(true);
  };

  const handleColorChange = (index, color) => {
    const newColors = [...currentKit.colors];
    newColors[index] = color;
    setCurrentKit({ ...currentKit, colors: newColors });
  };

  // Skeleton Loader Component
  const SkeletonCard = () => (
    <div className="border border-gray-100 rounded-lg p-4 mb-3 animate-pulse bg-white">
      <div className="flex justify-between mb-3">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-4"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded mb-2 w-1/4"></div>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="w-8 h-8 rounded bg-gray-200"></div>
        ))}
      </div>
      <div className="h-8 bg-gray-200 rounded w-full"></div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-600" />
          Brand Memory
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Save and reuse your brand settings
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Create New Kit Button */}
        {!isCreatingNew && !isLoading && (
          <button
            onClick={handleCreateKit}
            className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md flex items-center justify-center gap-2 transition-colors mb-4 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create New Brand Kit
          </button>
        )}

        {/* Create/Edit Form */}
        {isCreatingNew && (
          <div className="mb-6 p-4 border border-purple-200 rounded-lg bg-purple-50 animate-fade-in">
            <h3 className="font-semibold text-gray-800 mb-4">New Brand Kit</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Kit Name</label>
              <input
                type="text"
                value={currentKit.name}
                onChange={(e) => setCurrentKit({ ...currentKit, name: e.target.value })}
                placeholder="e.g., Summer Campaign 2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand Colors</label>
              <div className="grid grid-cols-5 gap-2">
                {currentKit.colors.map((color, index) => (
                  <input
                    key={index}
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    className="w-full h-10 rounded cursor-pointer border border-gray-300"
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveKit}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isProcessing && activeAction === 'save' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isProcessing ? 'Saving...' : 'Save Kit'}
              </button>
              <button
                onClick={() => setIsCreatingNew(false)}
                disabled={isProcessing}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Saved Brand Kits List */}
        {!isLoading && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Saved Kits ({brandKits.length})
            </h3>

            {brandKits.length === 0 && !isCreatingNew && (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No brand kits yet</p>
              </div>
            )}

            {brandKits
              .sort((a, b) => new Date(b.lastUsed || b.createdAt) - new Date(a.lastUsed || a.createdAt))
              .map((kit) => (
                <div
                  key={kit.id}
                  className={`border rounded-lg p-4 transition-all group ${
                    selectedKit?.id === kit.id
                      ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500'
                      : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-800 flex items-center gap-2">
                        {kit.name}
                        {selectedKit?.id === kit.id && <Check className="w-3 h-3 text-purple-600" />}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Last used: {new Date(kit.lastUsed || kit.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteKit(kit.id)}
                      className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete brand kit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Colors */}
                  <div className="flex gap-1 mb-4">
                    {kit.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>

                  {/* Load Button */}
                  <button
                    onClick={() => handleLoadKit(kit)}
                    disabled={isProcessing}
                    className={`w-full px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
                      selectedKit?.id === kit.id 
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200'
                    }`}
                  >
                    {isProcessing && activeAction === `load-${kit.id}` ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FolderOpen className="w-4 h-4" />
                    )}
                    {selectedKit?.id === kit.id ? 'Active Kit' : 'Load Kit'}
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandKitPanel;