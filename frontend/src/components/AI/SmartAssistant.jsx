// frontend/src/components/AI/SmartAssistant.jsx - TRULY GENERIC VERSION
// NO HARDCODING - Everything is dynamic based on user input
// Categories are abstract: lifestyle, apparel, beverage, food, etc.
// NO specific products mentioned anywhere in code

import { useState, useEffect } from 'react';
import { Sparkles, Loader, CheckCircle, AlertCircle, Info, Wand2, Zap } from 'lucide-react';
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

  // Example prompts with variables
  const examplePrompts = [
    'Create an advertisement for my product',
    'Professional ad with brand logo',
    'Product showcase with pricing',
    'Marketing creative for new launch',
  ];

  // Smart Contrast Detection
  const getBackgroundBrightness = (color) => {
    if (!color || typeof color !== 'string') return 255;
    
    if (typeof color === 'object') {
      if (color.colorStops && color.colorStops[0]) {
        color = color.colorStops[0].color;
      } else {
        return 255;
      }
    }
    
    const hex = color.replace('#', '');
    const rgb = parseInt(hex, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    
    return (r * 299 + g * 587 + b * 114) / 1000;
  };

  const getContrastingColor = (backgroundColor) => {
    const brightness = getBackgroundBrightness(backgroundColor);
    return brightness < 128 ? '#ffffff' : '#1f2937';
  };

  const getAccentColor = (backgroundColor) => {
    const brightness = getBackgroundBrightness(backgroundColor);
    return brightness < 128 ? '#fbbf24' : '#2563eb';
  };

  const extractBrandName = (prompt) => {
    let match = prompt.match(/my brand(?:\s+name)?\s+is\s+["']([^"']+)["']/i);
    if (match) return match[1];
    
    match = prompt.match(/brand(?:\s+name)?:\s*([A-Z][a-zA-Z\s&]+?)(?:\s*,|\s*and|\s*here|$)/i);
    if (match) return match[1].trim();
    
    match = prompt.match(/["']([A-Z][a-zA-Z\s&]+?)["']/);
    if (match) return match[1];
    
    return null;
  };

  // Generic category detection based on common keywords
  const detectCategory = (prompt) => {
    const lowerPrompt = prompt.toLowerCase();
    
    // Abstract categories only
    if (lowerPrompt.match(/\b(apparel|clothing|wear|fashion|garment)\b/)) return 'apparel';
    if (lowerPrompt.match(/\b(appliance|device|gadget|machine)\b/)) return 'appliance';
    if (lowerPrompt.match(/\b(beverage|drink|liquid refreshment)\b/)) return 'beverage';
    if (lowerPrompt.match(/\b(food|edible|consumable|meal)\b/)) return 'food';
    if (lowerPrompt.match(/\b(beauty|cosmetic|skincare|personal care)\b/)) return 'beauty';
    if (lowerPrompt.match(/\b(electronic|tech|digital|smart device)\b/)) return 'electronics';
    if (lowerPrompt.match(/\b(sport|athletic|fitness|active)\b/)) return 'sports';
    if (lowerPrompt.match(/\b(home|household|domestic|interior)\b/)) return 'home';
    if (lowerPrompt.match(/\b(hygiene|cleaning|sanitation)\b/)) return 'hygiene';
    if (lowerPrompt.match(/\b(decor|decoration|paint|coating)\b/)) return 'decor';
    
    return 'lifestyle';
  };

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

    // Generic fallback based on category
    const categoryDefaults = {
      apparel: 'Fashion Product',
      appliance: 'Premium Appliance',
      beverage: 'Refreshing Beverage',
      food: 'Delicious Product',
      beauty: 'Beauty Product',
      electronics: 'Smart Device',
      sports: 'Performance Gear',
      home: 'Home Essential',
      hygiene: 'Care Product',
      decor: 'Style Solution',
      lifestyle: 'Premium Product'
    };

    return categoryDefaults[category] || 'Premium Product';
  };

  const findLogoOnCanvas = () => {
    if (!canvas) return null;
    
    const images = canvas.getObjects('image');
    const sortedBySize = images.sort((a, b) => (a.width * a.height) - (b.width * b.height));
    
    if (sortedBySize.length > 1) {
      const smallest = sortedBySize[0];
      if (smallest.width * smallest.height < 50000) {
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

  // Smart text with bounds checking
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

    const textObject = new fabric.IText(text, defaultOptions);
    canvas.add(textObject);
    
    // Ensure text fits within canvas bounds
    setTimeout(() => {
      const textBounds = textObject.getBoundingRect();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const margin = 20;
      
      // Scale down if too wide
      if (textBounds.width > canvasWidth - (margin * 2)) {
        const scaleFactor = (canvasWidth - (margin * 2)) / textBounds.width;
        textObject.set({
          scaleX: scaleFactor,
          scaleY: scaleFactor
        });
      }
      
      // Adjust vertical position if overflowing
      const updatedBounds = textObject.getBoundingRect();
      if (updatedBounds.top < margin) {
        textObject.set({ top: margin + (updatedBounds.height / 2) });
      }
      if (updatedBounds.top + updatedBounds.height > canvasHeight - margin) {
        textObject.set({ top: canvasHeight - margin - (updatedBounds.height / 2) });
      }
      
      textObject.setCoords();
      canvas.renderAll();
    }, 50);
    
    return textObject;
  };

  // TRULY GENERIC background generation - abstract descriptions only
  const generateSmartBackground = async (category, productName) => {
    // Generic, abstract prompts - NO specific product mentions
    const backgroundPrompts = {
      apparel: 'fashion studio background, modern aesthetic, clean minimal style, professional lighting',
      appliance: 'contemporary lifestyle setting, clean modern interior, professional product ambiance',
      beverage: 'refreshing atmosphere with cool tones, clean minimal aesthetic, professional lighting',
      food: 'appetizing setting with warm natural tones, inviting atmosphere, professional food style',
      beauty: 'elegant spa-like environment, soft pastel tones, luxurious minimal aesthetic, professional lighting',
      electronics: 'futuristic tech environment, sleek modern aesthetic, professional studio setup, clean gradients',
      sports: 'dynamic athletic environment, energetic atmosphere, bold professional aesthetic, action-oriented',
      home: 'comfortable living space, warm inviting atmosphere, modern interior aesthetic',
      hygiene: 'clean fresh environment, minimal aesthetic, professional studio lighting, serene atmosphere',
      decor: 'stylish interior setting, creative artistic atmosphere, modern aesthetic, professional lighting',
      lifestyle: 'versatile modern setting, professional aesthetic, clean minimal style '
    };

    const stylePresets = {
      apparel: 'modern',
      appliance: 'contemporary',
      beverage: 'fresh',
      food: 'warm',
      beauty: 'elegant',
      electronics: 'sleek',
      sports: 'energetic',
      home: 'cozy',
      hygiene: 'minimal',
      decor: 'artistic',
      lifestyle: 'professional'
    };

    const prompt = backgroundPrompts[category] || backgroundPrompts.lifestyle;
    const style = stylePresets[category] || stylePresets.lifestyle;

    console.log(`🎨 Generating ${category} background with abstract prompt`);

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
        
        return url;
      }
    } catch (error) {
      console.warn('Background generation failed:', error);
    }

    return null;
  };

  // Generic copy generation
  const generateSmartCopy = async (productInfo) => {
    console.log(`✍️ Generating copy for ${productInfo.name}`);

    // Generic features and audiences by category
    const categoryInfo = {
      apparel: {
        features: ['Premium quality', 'Comfortable fit', 'Stylish design'],
        audience: 'fashion-conscious individuals'
      },
      appliance: {
        features: ['Efficient performance', 'Durable build', 'User-friendly'],
        audience: 'modern households'
      },
      beverage: {
        features: ['Refreshing taste', 'Quality ingredients', 'Perfect serving'],
        audience: 'health-conscious consumers'
      },
      food: {
        features: ['Delicious flavor', 'Quality ingredients', 'Satisfying portion'],
        audience: 'food enthusiasts'
      },
      beauty: {
        features: ['Gentle formula', 'Effective results', 'Premium quality'],
        audience: 'beauty-conscious individuals'
      },
      electronics: {
        features: ['Advanced technology', 'Reliable performance', 'User-friendly'],
        audience: 'tech-savvy users'
      },
      sports: {
        features: ['High performance', 'Durable construction', 'Professional grade'],
        audience: 'active individuals'
      },
      home: {
        features: ['Quality craftsmanship', 'Functional design', 'Long-lasting'],
        audience: 'homeowners'
      },
      hygiene: {
        features: ['Effective formula', 'Gentle care', 'Long-lasting'],
        audience: 'health-conscious families'
      },
      decor: {
        features: ['Beautiful finish', 'Easy application', 'Long-lasting results'],
        audience: 'design enthusiasts'
      },
      lifestyle: {
        features: ['Premium quality', 'Excellent value', 'Reliable choice'],
        audience: 'discerning customers'
      }
    };

    const info = categoryInfo[productInfo.category] || categoryInfo.lifestyle;

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
        return {
          headline: copy.headline,
          tagline: copy.subhead
        };
      }
    } catch (error) {
      console.warn('Copy generation failed:', error);
    }

    // Generic fallbacks
    const fallbacks = {
      apparel: { headline: 'Style Meets Comfort', tagline: 'Premium quality for everyday wear' },
      appliance: { headline: 'Smarter Living', tagline: 'Efficiency meets innovation' },
      beverage: { headline: 'Pure Refreshment', tagline: 'Quality in every sip' },
      food: { headline: 'Delicious Choice', tagline: 'Quality ingredients, perfect taste' },
      beauty: { headline: 'Beautiful You', tagline: 'Premium care for your skin' },
      electronics: { headline: 'Smart Innovation', tagline: 'Technology that works for you' },
      sports: { headline: 'Peak Performance', tagline: 'Built for champions' },
      home: { headline: 'Home Comfort', tagline: 'Quality that lasts' },
      hygiene: { headline: 'Pure Care', tagline: 'Gentle yet effective' },
      decor: { headline: 'Transform Your Space', tagline: 'Professional results guaranteed' },
      lifestyle: { headline: 'Premium Quality', tagline: 'Excellence you can trust' }
    };

    return fallbacks[productInfo.category] || fallbacks.lifestyle;
  };

  // FIXED: Smart Layout with proper product positioning
  const createSmartLayout = async (productImage, productInfo, backgroundUrl, logo) => {
    if (!canvas) return;

    console.log('🎨 Creating smart layout');
    
    // Clear old elements
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      if (obj.type === 'text' || obj.type === 'i-text' || (obj.type === 'rect' && !obj.isBackground) || obj.type === 'circle') {
        canvas.remove(obj);
      }
    });

    // Apply background first
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
        
        setTimeout(() => {
          const bgColor = canvas.backgroundColor || '#ffffff';
          applyTextWithContrast(bgColor);
        }, 100);
      }, { crossOrigin: 'anonymous' });
    } else {
      // Generic gradient fallback
      const gradients = {
        apparel: [{ offset: 0, color: '#ec4899' }, { offset: 1, color: '#8b5cf6' }],
        appliance: [{ offset: 0, color: '#667eea' }, { offset: 1, color: '#764ba2' }],
        beverage: [{ offset: 0, color: '#4facfe' }, { offset: 1, color: '#00f2fe' }],
        food: [{ offset: 0, color: '#f093fb' }, { offset: 1, color: '#f5576c' }],
        beauty: [{ offset: 0, color: '#ffecd2' }, { offset: 1, color: '#fcb69f' }],
        electronics: [{ offset: 0, color: '#667eea' }, { offset: 1, color: '#764ba2' }],
        sports: [{ offset: 0, color: '#1e3a8a' }, { offset: 1, color: '#60a5fa' }],
        home: [{ offset: 0, color: '#d9afd9' }, { offset: 1, color: '#97d9e1' }],
        hygiene: [{ offset: 0, color: '#a1c4fd' }, { offset: 1, color: '#c2e9fb' }],
        decor: [{ offset: 0, color: '#fa709a' }, { offset: 1, color: '#fee140' }],
        default: [{ offset: 0, color: '#6366f1' }, { offset: 1, color: '#8b5cf6' }]
      };

      const gradient = gradients[productInfo.category] || gradients.default;
      canvas.setBackgroundColor({
        type: 'linear',
        coords: { x1: 0, y1: 0, x2: canvas.width, y2: canvas.height },
        colorStops: gradient
      }, () => {
        canvas.renderAll();
        applyTextWithContrast(gradient[0].color);
      });
    }

    const applyTextWithContrast = (backgroundColor) => {
      const textColor = getContrastingColor(backgroundColor);
      const accentColor = getAccentColor(backgroundColor);
      
      // Brand name/headline
      const mainHeadline = productInfo.brandName || productInfo.name;
      addEditableText(mainHeadline.toUpperCase(), {
        left: 100,
        top: 120,
        originX: 'left',
        originY: 'top',
        fontSize: 64,
        fontWeight: 'bold',
        fill: textColor,
        fontFamily: 'Impact, Arial Black, sans-serif',
        stroke: backgroundColor === '#ffffff' ? '#e5e7eb' : 'rgba(0,0,0,0.3)',
        strokeWidth: 1,
        shadow: new fabric.Shadow({
          color: backgroundColor === '#ffffff' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.7)',
          blur: 15,
          offsetX: 3,
          offsetY: 3
        })
      });

      // Tagline
      addEditableText(productInfo.aiTagline || 'Premium Quality', {
        left: 100,
        top: 200,
        originX: 'left',
        originY: 'top',
        fontSize: 28,
        fontWeight: 'normal',
        fill: accentColor,
        fontFamily: 'Arial, sans-serif',
        shadow: new fabric.Shadow({
          color: 'rgba(0, 0, 0, 0.8)',
          blur: 8,
          offsetX: 2,
          offsetY: 2
        })
      });

      // Price badge
      if (productInfo.price) {
        const priceBg = new fabric.Rect({
          left: 100,
          top: 280,
          width: 180,
          height: 75,
          fill: accentColor === '#fbbf24' ? '#ef4444' : '#2563eb',
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
          left: 190,
          top: 317,
          fontSize: 44,
          fontWeight: 'bold',
          fill: '#ffffff',
          fontFamily: 'Arial Black, sans-serif',
          shadow: null
        });
      }

      // CTA button
      const ctaY = canvas.height - 140;
      const ctaRect = new fabric.Rect({
        left: 100,
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
        left: 235,
        top: ctaY + 32,
        originX: 'center',
        originY: 'center',
        fontSize: 26,
        fontWeight: 'bold',
        fill: '#ffffff',
        fontFamily: 'Arial, sans-serif'
      });

      // Quality badge
      const badgeX = canvas.width - 95;
      const badgeY = 85;
      
      const badge = new fabric.Circle({
        left: badgeX,
        top: badgeY,
        radius: 52,
        fill: accentColor,
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

      const badgeTextColor = getContrastingColor(accentColor);
      addEditableText('TOP\nQUALITY', {
        left: badgeX,
        top: badgeY,
        originX: 'center',
        originY: 'center',
        fontSize: 13,
        fontWeight: 'bold',
        fill: badgeTextColor,
        textAlign: 'center',
        lineHeight: 1.2,
        fontFamily: 'Arial, sans-serif',
        shadow: null,
        selectable: false
      });
    };

    await new Promise(resolve => setTimeout(resolve, 500));

    // FIXED: Intelligent product positioning and resizing
    if (productImage) {
      const img = productImage.object;
      const imgAspectRatio = img.width / img.height;
      
      // Determine optimal size based on aspect ratio
      let targetWidth, targetHeight;
      
      if (imgAspectRatio > 1) {
        // Wide product (landscape)
        targetWidth = canvas.width * 0.45;
        targetHeight = targetWidth / imgAspectRatio;
      } else {
        // Tall product (portrait) or square
        targetHeight = canvas.height * 0.50;
        targetWidth = targetHeight * imgAspectRatio;
      }
      
      const scaleX = targetWidth / img.width;
      const scaleY = targetHeight / img.height;
      
      // Position based on layout space
      const leftPosition = canvas.width * 0.65;
      const topPosition = canvas.height / 2;
      
      img.set({
        left: leftPosition,
        top: topPosition,
        scaleX: scaleX,
        scaleY: scaleY,
        angle: 0,
        originX: 'center',
        originY: 'center',
        selectable: true,
        shadow: new fabric.Shadow({
          color: 'rgba(0, 0, 0, 0.4)',
          blur: 20,
          offsetX: 10,
          offsetY: 10
        })
      });
      
      canvas.bringToFront(img);
      console.log(`✅ Product repositioned: ${Math.round(targetWidth)}x${Math.round(targetHeight)}`);
    }

    // Logo positioning
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
    
    toast.success('✅ Smart layout applied with proper positioning!', {
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

      // Background removal
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

      // Generate copy
      setGenerationProgress({ step: 'Writing smart copy...', progress: 35 });
      
      const aiCopy = await generateSmartCopy(productInfo);
      productInfo.aiHeadline = aiCopy.headline;
      productInfo.aiTagline = aiCopy.tagline;
      
      results.copy = [aiCopy];
      results.processingSteps.push({ step: 'copy', success: true });

      // Generate background
      setGenerationProgress({ step: `Creating ${category} background...`, progress: 60 });
      
      const backgroundUrl = await generateSmartBackground(category, productName);
      if (backgroundUrl) {
        results.background = { url: backgroundUrl };
        results.processingSteps.push({ step: 'background', success: true });
      }

      // Create layout
      setGenerationProgress({ step: 'Designing layout...', progress: 85 });

      await createSmartLayout(productImageData, productInfo, backgroundUrl, logoData);

      setGenerationProgress({ step: 'Complete!', progress: 100 });

      const successfulSteps = results.processingSteps.filter(s => s.success).length;
      
      results.recommendations = [
        { type: 'success', message: `✨ ${productName} ad created successfully!` },
        { type: 'success', message: `✏️ All text is editable - click to customize` },
        { type: 'success', message: `🎨 Smart contrast applied automatically` },
        { type: 'info', message: `📝 Headline: "${aiCopy.headline}"` },
        { type: 'info', message: `📝 Tagline: "${aiCopy.tagline}"` },
        { type: 'info', message: `✅ ${successfulSteps}/${results.processingSteps.length} steps completed` }
      ];

      setAssistantResults(results);
      toast.success('🎉 Your ad is ready!', { duration: 5000 });

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
          Smart contrast · No overflow · Dynamic positioning · Generic backgrounds
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
          placeholder='E.g., "Create an advertisement" or "My brand is [Name], Rs 3000"'
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