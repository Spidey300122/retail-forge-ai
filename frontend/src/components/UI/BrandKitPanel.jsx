import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, Plus, Palette, Type, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useCanvas } from '../context/CanvasContext';

const BrandKitPanel = () => {
  const { canvas } = useCanvas();
  const [brandKits, setBrandKits] = useState([]);
  const [currentKit, setCurrentKit] = useState({
    name: '',
    logoUrl: '',
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
    fonts: [],
    preferences: {}
  });
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedKit, setSelectedKit] = useState(null);

  useEffect(() => {
    loadBrandKits();
  }, []);

  const loadBrandKits = () => {
    try {
      const saved = localStorage.getItem('retailforge_brand_kits');
      if (saved) {
        setBrandKits(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading brand kits:', error);
    }
  };

  const saveBrandKits = (kits) => {
    try {
      localStorage.setItem('retailforge_brand_kits', JSON.stringify(kits));
      setBrandKits(kits);
    } catch (error) {
      console.error('Error saving brand kits:', error);
      alert('Failed to save brand kit');
    }
  };

  const extractCurrentBrandSettings = () => {
    if (!canvas) return null;

    const objects = canvas.getObjects();
    const colors = new Set();
    const fonts = new Set();
    let logoUrl = '';

    objects.forEach(obj => {
      // Extract colors
      if (obj.fill && typeof obj.fill === 'string') {
        colors.add(obj.fill);
      }
      if (obj.stroke) {
        colors.add(obj.stroke);
      }

      // Extract fonts
      if (obj.fontFamily) {
        fonts.add(obj.fontFamily);
      }

      // Find logo (usually the first uploaded image)
      if (obj.type === 'image' && !logoUrl) {
        logoUrl = obj.getSrc ? obj.getSrc() : '';
      }
    });

    // Get background color
    const bgColor = canvas.backgroundColor;
    if (bgColor && typeof bgColor === 'string') {
      colors.add(bgColor);
    }

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

  const handleSaveKit = () => {
    if (!currentKit.name.trim()) {
      alert('Please enter a brand kit name');
      return;
    }

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

    // Success notification
    showNotification('✓ Brand kit saved successfully', 'success');
  };

  const handleLoadKit = (kit) => {
    if (!canvas) return;

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

    showNotification('✓ Brand kit loaded', 'success');
  };

  const handleDeleteKit = (kitId) => {
    if (!confirm('Are you sure you want to delete this brand kit?')) return;

    const updatedKits = brandKits.filter(k => k.id !== kitId);
    saveBrandKits(updatedKits);

    if (selectedKit?.id === kitId) {
      setSelectedKit(null);
    }

    showNotification('✓ Brand kit deleted', 'success');
  };

  const handleColorChange = (index, color) => {
    const newColors = [...currentKit.colors];
    newColors[index] = color;
    setCurrentKit({ ...currentKit, colors: newColors });
  };

  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `fixed top-4 right-4 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white px-4 py-2 rounded shadow-lg z-50`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  };

  return (
    <div className="h-full flex flex-col">
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
        {!isCreatingNew && (
          <button
            onClick={handleCreateKit}
            className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md flex items-center justify-center gap-2 transition-colors mb-4"
          >
            <Plus className="w-5 h-5" />
            Create New Brand Kit
          </button>
        )}

        {/* Create/Edit Form */}
        {isCreatingNew && (
          <div className="mb-6 p-4 border border-purple-200 rounded-lg bg-purple-50">
            <h3 className="font-semibold text-gray-800 mb-4">New Brand Kit</h3>

            {/* Kit Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Kit Name *
              </label>
              <input
                type="text"
                value={currentKit.name}
                onChange={(e) => setCurrentKit({ ...currentKit, name: e.target.value })}
                placeholder="e.g., Fresh Squeeze Juice Co."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Logo URL */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <ImageIcon className="w-4 h-4" />
                Logo URL
              </label>
              <input
                type="text"
                value={currentKit.logoUrl}
                onChange={(e) => setCurrentKit({ ...currentKit, logoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {currentKit.logoUrl && (
                <img
                  src={currentKit.logoUrl}
                  alt="Logo preview"
                  className="mt-2 h-12 object-contain"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
            </div>

            {/* Brand Colors */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Palette className="w-4 h-4" />
                Brand Colors (up to 5)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {currentKit.colors.map((color, index) => (
                  <div key={index} className="relative">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      className="w-full h-12 rounded cursor-pointer border border-gray-300"
                    />
                    <div className="text-xs text-center mt-1 text-gray-600">
                      {color}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSaveKit}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md flex items-center justify-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Kit
              </button>
              <button
                onClick={() => setIsCreatingNew(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Saved Brand Kits List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Saved Brand Kits ({brandKits.length})
          </h3>

          {brandKits.length === 0 && !isCreatingNew && (
            <div className="text-center py-8 text-gray-400">
              <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No brand kits saved yet</p>
              <p className="text-xs mt-1">Create one to save your brand settings</p>
            </div>
          )}

          {brandKits
            .sort((a, b) => new Date(b.lastUsed || b.createdAt) - new Date(a.lastUsed || a.createdAt))
            .map((kit) => (
              <div
                key={kit.id}
                className={`border rounded-lg p-4 transition-all ${
                  selectedKit?.id === kit.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-800">{kit.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Last used: {new Date(kit.lastUsed || kit.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteKit(kit.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Delete brand kit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Logo Preview */}
                {kit.logoUrl && (
                  <img
                    src={kit.logoUrl}
                    alt={`${kit.name} logo`}
                    className="h-10 object-contain mb-2"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}

                {/* Color Palette */}
                <div className="flex gap-1 mb-3">
                  {kit.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded border border-gray-300"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>

                {/* Load Button */}
                <button
                  onClick={() => handleLoadKit(kit)}
                  className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <FolderOpen className="w-4 h-4" />
                  Load Kit
                </button>
              </div>
            ))}
        </div>

        {/* Usage Stats (Optional Enhancement) */}
        {selectedKit && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Active Brand Kit
            </h4>
            <p className="text-sm text-blue-700">
              Using: <strong>{selectedKit.name}</strong>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              All new creatives will use these brand settings by default
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandKitPanel;