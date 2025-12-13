// frontend/src/components/AI/SmartAssistant.jsx - v4 ULTIMATE
// FIXES: Editable text, product-matching backgrounds, context-aware copy, smart analysis

import { useState, useEffect } from 'react';
import { Sparkles, Loader, CheckCircle, AlertCircle, Info, Wand2, Image as ImageIcon, Zap, Tag } from 'lucide-react';
import useAIStore from '../../store/aiStore';
import useCanvasStore from '../../store/canvasStore';
import { fabric } from 'fabric';
import toast from 'react-hot-toast';

function SmartAssistant() {
  const { canvas } = useCanvasStore();
  
  const { 
    assistantInput, 
    setAssistantInput, 
    assistantResults, 
    setAssistantResults
  } = useAIStore();

  const [localInput, setLocalInput] = useState(assistantInput);
  const [isGeneratingAd, setIsGeneratingAd] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(null);
  const [autoMode, setAutoMode] = useState(false);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setLocalInput(val);
    setAssistantInput(val);
  };

  const examplePrompts = [
    'Create a kettle advertisement',
    'My brand is Asian Paints, Rs 3000 paint ad',
    'Professional soap ad with logo',
    'Cricket bat Rs 1500 sports ad',
  ];

  // Extract brand name
  const extractBrandName = (prompt) => {
    let match = prompt.match(/my brand(?:\s+name)?\s+is\s+["']([^"']+)["']/i);
    if (match) return match[1];
    
    match = prompt.match(/brand(?:\s+name)?:\s*([A-Z][a-zA-Z\s&]+?)(?:\s*,|\s*and|\s*here|$)/i);
    if (match) return match[1].trim();
    
    match = prompt.match(/["']([A-Z][a-zA-Z\s&]+?)["']/);
    if (match) return match[1];
    
    return null;
  };

  // ENHANCED: Better category detection
  const detectCategory = (prompt) => {
    const categories = {
      kettle: /kettle|electric kettle|tea kettle|water boiler/i,
      paint: /paint|color|coating|asian paints|berger|nerolac/i,
      soap: /soap|bathing|hygiene|lux|dove|lifebuoy/i,
      sports: /cricket|bat|ball|sports|athletic|game|fitness/i,
      beverages: /drink|juice|soda|beverage|water|coffee|tea|cola/i,
      food: /food|snack|meal|bread|cheese|burger|pizza/i,
      beauty: /beauty|makeup|cosmetic|skincare|lotion/i,
      electronics: /electronic|phone|laptop|tech|gadget|mobile|appliance/i,
      fashion: /fashion|clothing|apparel|shirt|dress/i,
      home: /home|kitchen|appliance|furniture|decor/i,
    };

    for (const [category, regex] of Object.entries(categories)) {
      if (regex.test(prompt)) {
        console.log(`✅ Category: ${category}`);
        return category;
      }
    }

    return 'general';
  };

  // Extract price
  const extractPrice = (prompt) => {
    const patterns = [
      /(?:Rs|₹)\s*(\d+(?:,\d+)*)/i,
      /(\d+(?:,\d+)*)\s*(?:Rs|rupees)/i,
      /price\s*(?:is|:)?\s*(?:Rs|₹)?\s*(\d+(?:,\d+)*)/i,
    ];

    for (const pattern of patterns) {
      const match = prompt.match(pattern);
      if (match) return `Rs ${match[1]}`;
    }
    return null;
  };

  // SMART: Extract product name
  const extractProductName = (prompt, category) => {
    const patterns = [
      /(?:ad|advertisement)\s+for\s+(?:my|this|the|a|an)?\s*([a-z\s]+?)(?:\s+which|\s+that|\s+costs|\s+with|,|$)/i,
      /create.*?(?:for|of)\s+(?:my|this|the|a|an)?\s*([a-z\s]+?)(?:\s+which|\s+that|\s+costs|\s+with|,|$)/i,
    ];

    for (const pattern of patterns) {
      const match = prompt.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        if (name.length > 2 && name.length < 30) {
          return name.charAt(0).toUpperCase() + name.slice(1);
        }
      }
    }

    // Category-based intelligent defaults
    const categoryDefaults = {
      kettle: 'Electric Kettle',
      paint: 'Premium Paint',
      soap: 'Luxury Soap',
      sports: 'Cricket Bat',
      beverages: 'Refreshing Drink',
      food: 'Delicious Meal',
      beauty: 'Beauty Product',
      electronics: 'Smart Device',
      fashion: 'Fashion Item',
      home: 'Home Essential',
      general: 'Premium Product'
    };

    return categoryDefaults[category] || 'Premium Product';
  };

  // Find logo on canvas
  const findLogoOnCanvas = () => {
    if (!canvas) return null;
    
    const images = canvas.getObjects('image');
    const sortedBySize = images.sort((a, b) => (a.width * a.height) - (b.width * b.height));
    
    if (sortedBySize.length > 1) {
      const smallest = sortedBySize[0];
      if (smallest.width * smallest.height < 50000) {
        console.log('✅ Logo detected');
        return smallest;
      }
    }
    
    return null;
  };

  const getAllImagesFromCanvas = () => {
    if (!canvas) return [];
    const images = canvas.getObjects('image');
    return images.map(img => ({
      src: img.getSrc(),
      width: img.width,
      height: img.height,
      area: img.width * img.height,
      object: img
    }));
  };

  const getBestImageForLayout = () => {
    const images = getAllImagesFromCanvas();
    if (images.length === 0) return null;
    images.sort((a, b) => b.area - a.area);
    return images[0];
  };

  // FIXED: Make text EDITABLE
  const addEditableText = (text, options = {}) => {
    if (!canvas || !text) return;
    
    const defaultOptions = {
      fontSize: 36,
      fill: '#ffffff',
      fontWeight: 'bold',
      fontFamily: 'Arial, sans-serif',
      left: canvas.width / 2,
      top: canvas.height / 2,
      originX: 'center',
      originY: 'center',
      // CRITICAL: Make text editable!
      selectable: true,
      editable: true,
      hasControls: true,
      hasBorders: true,
      shadow: new fabric.Shadow({
        color: 'rgba(0, 0, 0, 0.8)',
        blur: 10,
        offsetX: 2,
        offsetY: 2
      }),
      ...options
    };

    // Use IText for editable text
    const textObject = new fabric.IText(text, defaultOptions);
    canvas.add(textObject);
    canvas.renderAll();
    
    return textObject;
  };

  // SMART: Category-specific background generation
  const generateSmartBackground = async (category, productName) => {
    const backgroundPrompts = {
      kettle: 'modern kitchen background, bright and clean, morning coffee vibes, professional product photography, warm lighting',
      paint: 'colorful paint splashes, artistic brush strokes, vibrant gradient, creative design, professional lighting',
      soap: 'clean spa background, water bubbles and foam, fresh mint leaves, soft pastel colors, serene atmosphere',
      sports: 'dynamic sports stadium, energetic crowd, bright lights, action-packed scene, athletic energy',
      beverages: 'refreshing background with water droplets, ice cubes, citrus fruits, cool summer vibes',
      food: 'appetizing food styling background, wooden table, natural ingredients, warm inviting atmosphere',
      electronics: 'futuristic tech background, digital grid, neon lights, modern minimalist design',
      home: 'cozy home interior, comfortable living space, warm lighting, inviting atmosphere',
      general: 'professional product photography background, clean gradient, studio lighting'
    };

    const stylePresets = {
      kettle: 'modern',
      paint: 'vibrant',
      soap: 'minimal',
      sports: 'energetic',
      beverages: 'fresh',
      food: 'warm',
      electronics: 'sleek',
      home: 'cozy',
      general: 'professional'
    };

    const prompt = backgroundPrompts[category] || backgroundPrompts.general;
    const style = stylePresets[category] || stylePresets.general;

    console.log(`🎨 Generating ${category}-specific background: "${prompt}"`);

    try {
      const response = await fetch('http://localhost:3000/api/image/generate-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          style: style,
          width: 1080,
          height: 1080
        }),
      });

      const data = await response.json();
      if (data.success) {
        const url = data.data.download_url.startsWith('http') 
          ? data.data.download_url 
          : `http://localhost:8000${data.data.download_url}`;
        
        console.log('✅ Background generated:', url);
        return url;
      }
    } catch (error) {
      console.warn('Background generation failed:', error);
    }

    return null;
  };

  // SMART: Generate product-specific copy with Claude
  const generateSmartCopy = async (productInfo) => {
    console.log(`✍️ Generating copy for ${productInfo.name} (${productInfo.category})`);

    // Category-specific features and audiences
    const categoryInfo = {
      kettle: {
        features: ['Fast boiling', 'Energy efficient', 'Auto shut-off safety'],
        audience: 'tea and coffee lovers, busy professionals'
      },
      paint: {
        features: ['Vibrant colors', 'Long-lasting finish', 'Easy application'],
        audience: 'homeowners, interior designers'
      },
      soap: {
        features: ['Gentle formula', 'Long-lasting fragrance', 'Moisturizing'],
        audience: 'beauty-conscious individuals, families'
      },
      sports: {
        features: ['Professional grade', 'High performance', 'Durable'],
        audience: 'athletes, sports enthusiasts'
      },
      general: {
        features: ['Premium quality', 'Best value', 'Reliable'],
        audience: 'discerning customers'
      }
    };

    const info = categoryInfo[productInfo.category] || categoryInfo.general;

    try {
      const response = await fetch('http://localhost:3000/api/ai/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productInfo: {
            name: productInfo.brandName || productInfo.name,
            category: productInfo.category,
            features: info.features,
            price: productInfo.price,
            audience: info.audience
          },
          style: 'energetic'
        }),
      });

      const data = await response.json();
      if (data.success && data.data.suggestions && data.data.suggestions.length > 0) {
        const copy = data.data.suggestions[0];
        console.log('✅ Claude generated:', copy);
        return {
          headline: copy.headline,
          tagline: copy.subhead
        };
      }
    } catch (error) {
      console.warn('Copy generation failed:', error);
    }

    // Fallback to category defaults
    const fallbacks = {
      kettle: { headline: 'Perfect Cup, Every Time', tagline: 'Fast boiling, energy efficient, safe' },
      paint: { headline: 'Transform Your Space', tagline: 'Vibrant colors that last' },
      soap: { headline: 'Pure Freshness Daily', tagline: 'Gentle care for your skin' },
      sports: { headline: 'Unleash Your Potential', tagline: 'Performance meets quality' },
      general: { headline: 'Premium Quality', tagline: 'Excellence you can trust' }
    };

    return fallbacks[productInfo.category] || fallbacks.general;
  };

  // CREATE SMART LAYOUT
  const createSmartLayout = async (productImage, productInfo, backgroundUrl, logo) => {
    if (!canvas) return;

    console.log('🎨 Creating smart layout for:', productInfo);
    
    // Clear text/shapes (keep images)
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      if (obj.type === 'text' || obj.type === 'i-text' || (obj.type === 'rect' && !obj.isBackground) || obj.type === 'circle') {
        canvas.remove(obj);
      }
    });

    // Step 1: Apply background
    if (backgroundUrl) {
      fabric.Image.fromURL(backgroundUrl, (img) => {
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        img.set({
          left: 0,
          top: 0,
          scaleX: scale,
          scaleY: scale,
          selectable: false,
          evented: false,
        });
        canvas.add(img);
        canvas.sendToBack(img);
        canvas.renderAll();
      }, { crossOrigin: 'anonymous' });
    } else {
      // Fallback gradient
      const gradients = {
        kettle: [{ offset: 0, color: '#667eea' }, { offset: 1, color: '#764ba2' }],
        paint: [{ offset: 0, color: '#f093fb' }, { offset: 1, color: '#f5576c' }],
        soap: [{ offset: 0, color: '#4facfe' }, { offset: 1, color: '#00f2fe' }],
        sports: [{ offset: 0, color: '#1e3a8a' }, { offset: 1, color: '#60a5fa' }],
        default: [{ offset: 0, color: '#6366f1' }, { offset: 1, color: '#8b5cf6' }]
      };

      const gradient = gradients[productInfo.category] || gradients.default;
      canvas.setBackgroundColor({
        type: 'linear',
        coords: { x1: 0, y1: 0, x2: canvas.width, y2: canvas.height },
        colorStops: gradient
      }, canvas.renderAll.bind(canvas));
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 2: Position product (CENTER-RIGHT, large)
    if (productImage) {
      const img = productImage.object;
      const targetWidth = canvas.width * 0.40;
      const scale = targetWidth / img.width;
      
      img.set({
        left: canvas.width * 0.65,
        top: canvas.height / 2,
        scaleX: scale,
        scaleY: scale,
        angle: 0,
        originX: 'center',
        originY: 'center',
        selectable: true, // Allow repositioning
        shadow: new fabric.Shadow({
          color: 'rgba(0, 0, 0, 0.4)',
          blur: 20,
          offsetX: 10,
          offsetY: 10
        })
      });
      
      canvas.bringToFront(img);
    }

    // Step 3: Add BRAND NAME or PRODUCT NAME (top-left, EDITABLE)
    const mainHeadline = productInfo.brandName || productInfo.name;
    addEditableText(mainHeadline.toUpperCase(), {
      left: 80,
      top: 100,
      originX: 'left',
      originY: 'top',
      fontSize: 68,
      fontWeight: 'bold',
      fill: '#ffffff',
      fontFamily: 'Impact, Arial Black, sans-serif',
      stroke: '#000000',
      strokeWidth: 2,
      shadow: new fabric.Shadow({
        color: 'rgba(0, 0, 0, 0.7)',
        blur: 15,
        offsetX: 3,
        offsetY: 3
      })
    });

    // Step 4: Add AI-GENERATED TAGLINE (EDITABLE)
    addEditableText(productInfo.aiTagline || 'Premium Quality', {
      left: 80,
      top: 190,
      originX: 'left',
      originY: 'top',
      fontSize: 26,
      fontWeight: 'normal',
      fill: '#fbbf24',
      fontFamily: 'Arial, sans-serif',
      shadow: new fabric.Shadow({
        color: 'rgba(0, 0, 0, 0.8)',
        blur: 8,
        offsetX: 2,
        offsetY: 2
      })
    });

    // Step 5: Price badge (if available, EDITABLE)
    if (productInfo.price) {
      const priceBg = new fabric.Rect({
        left: 80,
        top: 270,
        width: 180,
        height: 75,
        fill: '#ef4444',
        rx: 10,
        ry: 10,
        selectable: true,
        shadow: new fabric.Shadow({
          color: 'rgba(0, 0, 0, 0.5)',
          blur: 10,
          offsetY: 5
        })
      });
      canvas.add(priceBg);

      addEditableText(productInfo.price, {
        left: 170,
        top: 307,
        fontSize: 44,
        fontWeight: 'bold',
        fill: '#ffffff',
        fontFamily: 'Arial Black, sans-serif',
        shadow: null
      });
    }

    // Step 6: CTA button (EDITABLE)
    const ctaY = canvas.height - 140;
    const ctaRect = new fabric.Rect({
      left: 80,
      top: ctaY,
      width: 270,
      height: 65,
      fill: '#10b981',
      rx: 33,
      ry: 33,
      selectable: true,
      shadow: new fabric.Shadow({
        color: 'rgba(0, 0, 0, 0.4)',
        blur: 15,
        offsetY: 5
      })
    });
    canvas.add(ctaRect);

    addEditableText('BUY NOW ▶', {
      left: 215,
      top: ctaY + 32,
      originX: 'center',
      originY: 'center',
      fontSize: 26,
      fontWeight: 'bold',
      fill: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    });

    // Step 7: Quality badge (PROPERLY CENTERED in circle)
    const badgeX = canvas.width - 95;
    const badgeY = 85;
    
    const badge = new fabric.Circle({
      left: badgeX,
      top: badgeY,
      radius: 52,
      fill: '#fbbf24',
      stroke: '#ffffff',
      strokeWidth: 4,
      originX: 'center',
      originY: 'center',
      selectable: false,
      shadow: new fabric.Shadow({
        color: 'rgba(0, 0, 0, 0.3)',
        blur: 10
      })
    });
    canvas.add(badge);

    // FIXED: Text properly centered in circle
    addEditableText('TOP\nQUALITY', {
      left: badgeX,
      top: badgeY,
      originX: 'center',
      originY: 'center',
      fontSize: 13,
      fontWeight: 'bold',
      fill: '#1f2937',
      textAlign: 'center',
      lineHeight: 1.2,
      fontFamily: 'Arial, sans-serif',
      shadow: null,
      selectable: false
    });

    // Step 8: Position logo (if exists)
    if (logo) {
      const logoScale = 75 / Math.max(logo.width, logo.height);
      logo.set({
        left: 55,
        top: 55,
        scaleX: logoScale,
        scaleY: logoScale,
        originX: 'center',
        originY: 'center',
        selectable: true,
        shadow: new fabric.Shadow({
          color: 'rgba(0, 0, 0, 0.3)',
          blur: 8
        })
      });
      canvas.bringToFront(logo);
    }

    canvas.renderAll();
    
    toast.success('✅ All text is now editable! Click any text to edit.', {
      duration: 5000,
      icon: '✏️'
    });
  };

  const generateCompleteAd = async (isAutoMode = false) => {
    if (!isAutoMode && !localInput.trim()) {
      toast.error('Please describe the ad you want to create');
      return;
    }

    const productImageData = getBestImageForLayout();
    const logoData = findLogoOnCanvas();

    if (!productImageData) {
      toast.error('⚠️ Please upload a product image first!');
      return;
    }

    setIsGeneratingAd(true);
    setGenerationProgress({ step: 'Understanding your request...', progress: 5 });

    try {
      const brandName = extractBrandName(localInput);
      const price = extractPrice(localInput);
      const category = detectCategory(localInput);
      const productName = extractProductName(localInput, category);

      console.log('📊 Analysis:', { brandName, price, category, productName });

      const productInfo = {
        brandName: brandName,
        name: productName,
        price: price,
        category: category,
        hasLogo: !!logoData
      };

      const results = { background: null, copy: null, processingSteps: [] };

      // Step 1: Remove Background (15%)
      setGenerationProgress({ step: 'Removing background...', progress: 15 });
      
      let cleanProductImage = productImageData.src;
      try {
        const response = await fetch(cleanProductImage);
        const blob = await response.blob();
        
        const formData = new FormData();
        formData.append('file', blob, 'product.jpg');
        formData.append('method', 'fast');

        const bgRemovalResponse = await fetch('http://localhost:8000/process/remove-background', {
          method: 'POST',
          body: formData,
        });

        const bgData = await bgRemovalResponse.json();
        
        if (bgData.success) {
          cleanProductImage = `http://localhost:8000${bgData.download_url}`;
          
          fabric.Image.fromURL(cleanProductImage, (newImg) => {
            const images = canvas.getObjects('image');
            const mainImage = images.find(img => 
              img.width * img.height === Math.max(...images.map(i => i.width * i.height))
            );
            if (mainImage) {
              newImg.set({
                left: mainImage.left,
                top: mainImage.top,
                scaleX: mainImage.scaleX,
                scaleY: mainImage.scaleY,
              });
              canvas.remove(mainImage);
              canvas.add(newImg);
              
              productImageData.object = newImg;
              productImageData.src = cleanProductImage;
              
              canvas.renderAll();
            }
          }, { crossOrigin: 'anonymous' });

          results.processingSteps.push({ step: 'background_removal', success: true });
        }
      } catch (error) {
        console.warn('Background removal skipped:', error);
        results.processingSteps.push({ step: 'background_removal', success: false });
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Generate SMART Copy (35%)
      setGenerationProgress({ step: 'Writing product-specific copy...', progress: 35 });
      
      const aiCopy = await generateSmartCopy(productInfo);
      productInfo.aiHeadline = aiCopy.headline;
      productInfo.aiTagline = aiCopy.tagline;
      
      console.log('✅ AI Copy:', aiCopy);
      results.copy = [aiCopy];
      results.processingSteps.push({ step: 'copy', success: true });

      // Step 3: Generate SMART Background (60%)
      setGenerationProgress({ step: `Creating ${category}-themed background...`, progress: 60 });
      
      const backgroundUrl = await generateSmartBackground(category, productName);
      if (backgroundUrl) {
        results.background = { url: backgroundUrl };
        results.processingSteps.push({ step: 'background', success: true });
      }

      // Step 4: Create Layout (85%)
      setGenerationProgress({ step: 'Designing layout...', progress: 85 });

      await createSmartLayout(productImageData, productInfo, backgroundUrl, logoData);

      setGenerationProgress({ step: 'Complete!', progress: 100 });

      const successfulSteps = results.processingSteps.filter(s => s.success).length;
      
      results.recommendations = [
        { type: 'success', message: `✨ ${productName} ad created!` },
        { type: 'success', message: `✏️ All text is editable - just click to edit!` },
        { type: 'info', message: `📝 Headline: "${aiCopy.headline}"` },
        { type: 'info', message: `📝 Tagline: "${aiCopy.tagline}"` },
        { type: 'info', message: `🎨 Background: ${category}-themed` },
        { type: 'info', message: `✅ ${successfulSteps}/${results.processingSteps.length} steps completed` }
      ];

      setAssistantResults(results);
      toast.success('🎉 Your ad is ready! Click any text to edit it.', { duration: 5000 });

      if (!isAutoMode) {
        setLocalInput('');
        setAssistantInput('');
      }

    } catch (error) {
      console.error('❌ Ad generation failed:', error);
      toast.error('Failed to generate ad');
      setAssistantResults({
        success: false,
        recommendations: [{ type: 'error', message: `Error: ${error.message}` }]
      });
    } finally {
      setIsGeneratingAd(false);
      setTimeout(() => setGenerationProgress(null), 2000);
    }
  };

  useEffect(() => {
    if (!canvas || !autoMode) return;

    const handleImageAdded = (e) => {
      if (e.target?.type === 'image') {
        console.log('📸 Auto-generating ad...');
        setTimeout(() => {
          setLocalInput('Create a professional ad for this product');
          generateCompleteAd(true);
        }, 1000);
      }
    };

    canvas.on('object:added', handleImageAdded);
    return () => canvas.off('object:added', handleImageAdded);
  }, [canvas, autoMode]); 

  const handleExampleClick = (prompt) => {
    setLocalInput(prompt);
    setAssistantInput(prompt);
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          marginBottom: '8px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          color: '#1f2937'
        }}>
          <Sparkles size={20} color="#8b5cf6" />
          AI Smart Assistant
        </h3>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>
          Smart AI: Product-specific copy, matching backgrounds, editable text
        </p>
      </div>

      <div style={{ 
        padding: '12px', 
        backgroundColor: autoMode ? '#f0fdf4' : '#f3f4f6', 
        borderRadius: '8px',
        border: `2px solid ${autoMode ? '#22c55e' : '#e5e7eb'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={16} color={autoMode ? '#22c55e' : '#6b7280'} />
          <span style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>
            Auto-Generate on Upload
          </span>
        </div>
        <button
          onClick={() => setAutoMode(!autoMode)}
          style={{
            padding: '6px 12px',
            backgroundColor: autoMode ? '#22c55e' : '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          {autoMode ? 'ON' : 'OFF'}
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); generateCompleteAd(); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <textarea
          value={localInput}
          onChange={handleInputChange}
          placeholder='E.g., "Create a kettle advertisement" or "My brand is Asian Paints, Rs 3000"'
          rows={4}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />

        <button
          type="submit"
          disabled={isGeneratingAd || !localInput.trim()}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: isGeneratingAd ? '#9ca3af' : '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isGeneratingAd ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background-color 0.2s'
          }}
        >
          {isGeneratingAd ? (
            <>
              <Loader size={18} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 size={18} />
              Generate Smart Ad
            </>
          )}
        </button>
      </form>

      {generationProgress && (
        <div style={{
          padding: '16px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>
              {generationProgress.step}
            </span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              {generationProgress.progress}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${generationProgress.progress}%`,
              height: '100%',
              backgroundColor: '#8b5cf6',
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
      )}

      {!assistantResults && !isGeneratingAd && (
        <div>
          <label style={{ 
            fontSize: '12px', 
            color: '#6b7280', 
            fontWeight: '500', 
            marginBottom: '8px', 
            display: 'block' 
          }}>
            Try these:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(prompt)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e0e7ff';
                  e.target.style.borderColor = '#8b5cf6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.borderColor = '#e5e7eb';
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {assistantResults && !isGeneratingAd && (
        <div style={{ 
          marginTop: '20px', 
          padding: '16px', 
          backgroundColor: '#f9fafb', 
          borderRadius: '8px', 
          border: '1px solid #e5e7eb' 
        }}>
          <h4 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            marginBottom: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            color: '#1f2937'
          }}>
            <Sparkles size={16} color="#8b5cf6" />
            Results
          </h4>

          {assistantResults.recommendations?.map((rec, index) => {
            const isSuccess = rec.type === 'success';
            const isWarning = rec.type === 'warning';
            const isInfo = rec.type === 'info';
            const isError = rec.type === 'error';
            
            const icon = isSuccess ? (
              <CheckCircle size={16} color="#10b981" />
            ) : isWarning ? (
              <AlertCircle size={16} color="#f59e0b" />
            ) : isError ? (
              <AlertCircle size={16} color="#ef4444" />
            ) : (
              <Info size={16} color="#3b82f6" />
            );

            const bgColor = isSuccess ? '#f0fdf4' : isWarning ? '#fffbeb' : isError ? '#fef2f2' : '#eff6ff';
            const borderColor = isSuccess ? '#bbf7d0' : isWarning ? '#fcd34d' : isError ? '#fca5a5' : '#bfdbfe';

            return (
              <div
                key={index}
                style={{
                  padding: '12px',
                  backgroundColor: bgColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '6px',
                  fontSize: '13px',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <div style={{ flexShrink: 0, marginTop: '2px' }}>
                  {icon}
                </div>
                <div style={{ flex: 1, color: '#1f2937', whiteSpace: 'pre-line' }}>
                  {rec.message}
                </div>
              </div>
            );
          })}

          <button 
             onClick={() => setAssistantResults(null)}
             style={{
               width: '100%',
               marginTop: '12px',
               padding: '8px',
               fontSize: '12px',
               color: '#6b7280',
               border: '1px solid #e5e7eb',
               backgroundColor: 'white',
               borderRadius: '6px',
               cursor: 'pointer',
               transition: 'background-color 0.2s',
             }}
             onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
             onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
          >
            Clear
          </button>
        </div>
      )}

      {!assistantResults && !isGeneratingAd && (
        <div style={{
          padding: '12px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#1e40af'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <ImageIcon size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Smart Features:</strong>
              <ul style={{ marginTop: '4px', paddingLeft: '16px' }}>
                <li>✏️ All text is editable</li>
                <li>🎨 Product-matching backgrounds</li>
                <li>🤖 AI-generated relevant copy</li>
                <li>📱 Logo support</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default SmartAssistant;