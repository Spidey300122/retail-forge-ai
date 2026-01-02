// SmartAssistant.jsx - FIXED VERSION WITH DYNAMIC API URLS
// LEP: Simple blue "LEP" text to the right of all packshots (no logo image used)
// Non-LEP: Logo at top-left

import { useState, useCallback } from 'react';
import { Sparkles, Loader, CheckCircle, AlertCircle, Wand2 } from 'lucide-react';
import useAIStore from '../../store/aiStore';
import useCanvasStore from '../../store/canvasStore';
import { fabric } from 'fabric';
import toast from 'react-hot-toast';
import { buildApiUrl, buildImageServiceUrl } from '../../utils/apiConfig';

function SmartAssistant() {
  const { canvas } = useCanvasStore();
  const { assistantInput, setAssistantInput, assistantResults, setAssistantResults } = useAIStore();
  const [localInput, setLocalInput] = useState(assistantInput);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(null);

  const detectCategory = useCallback((prompt) => {
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.match(/\b(sport|athletic|fitness|cricket|bat|ball)\b/)) return 'sports';
    if (lowerPrompt.match(/\b(beverage|drink|juice|soda)\b/)) return 'beverage';
    if (lowerPrompt.match(/\b(food|meal|snack)\b/)) return 'food';
    return 'lifestyle';
  }, []);

  const detectLEP = useCallback((prompt) => 
    prompt.toLowerCase().includes('lep') || 
    prompt.toLowerCase().includes('low price'),
  []);

  const detectExclusive = useCallback((prompt) => 
    prompt.toLowerCase().includes('exclusive'),
  []);

  const extractBrandName = useCallback((prompt) => {
    const match = prompt.match(/["']([A-Z][a-zA-Z\s&]+?)["']/);
    return match ? match[1] : null;
  }, []);

  const extractPrice = useCallback((prompt) => {
    const match = prompt.match(/(?:Rs|₹)\s*(\d+(?:,\d+)*)/i);
    return match ? `Rs ${match[1]}` : null;
  }, []);

  const getContrastColor = useCallback((bgColor) => {
    if (!bgColor || typeof bgColor !== 'string') return '#ffffff';
    const hex = bgColor.replace('#', '');
    const rgb = parseInt(hex, 16);
    const brightness = ((rgb >> 16) * 299 + ((rgb >> 8) & 0xff) * 587 + (rgb & 0xff) * 114) / 1000;
    return brightness < 128 ? '#ffffff' : '#1f2937';
  }, []);

  const removeBackgroundFromImage = useCallback(async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('file', blob, 'image.jpg');
      formData.append('method', 'fast');

      // FIXED: Use buildImageServiceUrl instead of hardcoded localhost
      const bgResponse = await fetch(buildImageServiceUrl('/process/remove-background'), {
        method: 'POST',
        body: formData,
      });

      const data = await bgResponse.json();
      if (data.success) {
          const downloadUrl = data.download_url;
  
          // Only construct if it's a relative path
          const fullUrl = downloadUrl.startsWith('http') 
            ? downloadUrl  // Already a full URL from backend
            : buildImageServiceUrl(downloadUrl);  // Relative path, construct it
          
          console.log('🔗 Background removed, full URL:', fullUrl);
          return fullUrl;
      }
    } catch (error) {
      console.warn('⚠️ Background removal failed:', error);
    }
    return imageUrl;
  }, []);

  const generateCopy = useCallback(async (productInfo) => {
    try {
      // FIXED: Use buildApiUrl instead of hardcoded localhost
      const response = await fetch(buildApiUrl('/ai/generate-copy'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productInfo: {
            name: productInfo.name,
            category: productInfo.category,
            features: ['Premium quality', 'Excellent value'],
            audience: 'customers'
          },
          style: 'energetic'
        }),
      });

      const data = await response.json();
      if (data.success && data.data.suggestions?.[0]) {
        return {
          headline: data.data.suggestions[0].headline,
          tagline: data.data.suggestions[0].subhead
        };
      }
    } catch (error) {
      console.warn('Copy generation failed:', error);
    }

    return {
      headline: productInfo.name.toUpperCase(),
      tagline: 'Premium Quality Product'
    };
  }, []);

  const generateBackground = useCallback(async (category) => {
  // More specific and detailed prompts for better AI generation
  const prompts = {
    sports: 'basketball court arena with wooden floor, stadium lights, crowd in background, energetic sports venue, dramatic spotlights, arena atmosphere, professional sports photography, athletic action background, court markings visible',
    beverage: 'fresh water droplets and ice cubes on gradient blue background, clean modern aesthetic, refreshing cool tones, subtle bokeh effects, professional product photography style, crisp and clean',
    food: 'warm wooden table with soft natural lighting, appetizing warm colors, subtle food texture backgrounds, inviting rustic atmosphere, professional culinary photography, delicious ambiance',
    lifestyle: 'modern minimalist interior with soft natural light, clean contemporary aesthetic, subtle gradient backgrounds, professional lifestyle photography, sophisticated elegance',
    default: 'premium quality gradient background with subtle geometric patterns, professional modern aesthetic, soft lighting, clean sophisticated look, contemporary design'
  };

  // Map each category to its most suitable style
  const styleMap = {
    sports: 'vibrant',
    beverage: 'modern',
    food: 'vibrant',
    lifestyle: 'minimal',
    default: 'professional'
  };

  try {
    // FIXED: Use buildApiUrl instead of hardcoded localhost
    const response = await fetch(buildApiUrl('/image/generate-background'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompts[category] || prompts.default,
        style: styleMap[category] || styleMap.default,
        width: 1080,
        height: 1080
      }),
    });

      const data = await response.json();
      if (data.success) {
        // FIXED: Use buildImageServiceUrl to construct full URL
        return data.data.download_url.startsWith('http') 
          ? data.data.download_url 
          : buildImageServiceUrl(data.data.download_url);
      }
    } catch (error) {
      console.warn('Background generation failed:', error);
    }

    return null;
  }, []);

  const addText = useCallback((text, options = {}) => {
    if (!canvas || !text) return;
    
    const textObj = new fabric.IText(text, {
      fontSize: 36,
      fill: '#ffffff',
      fontWeight: 'bold',
      fontFamily: 'Arial, sans-serif',
      originX: 'left',
      originY: 'center',
      selectable: true,
      isAIGenerated: true,
      shadow: new fabric.Shadow({
        color: 'rgba(0, 0, 0, 0.9)',
        blur: 15,
        offsetX: 3,
        offsetY: 3
      }),
      ...options
    });

    canvas.add(textObj);
    
    setTimeout(() => {
      const bounds = textObj.getBoundingRect(true);
      const MARGIN = 50;
      const maxWidth = canvas.width - (MARGIN * 2);
      
      if (bounds.width > maxWidth) {
        const scale = maxWidth / bounds.width;
        textObj.set({
          scaleX: textObj.scaleX * scale * 0.95,
          scaleY: textObj.scaleY * scale * 0.95
        });
      }
      
      const newBounds = textObj.getBoundingRect(true);
      
      if (textObj.left < MARGIN) {
        textObj.set({ left: MARGIN });
      }
      
      if (textObj.left + newBounds.width > canvas.width - MARGIN) {
        textObj.set({ left: canvas.width - MARGIN - newBounds.width });
      }
      
      if (textObj.top - (newBounds.height / 2) < MARGIN) {
        textObj.set({ top: MARGIN + (newBounds.height / 2) });
      }
      
      if (textObj.top + (newBounds.height / 2) > canvas.height - MARGIN) {
        textObj.set({ top: canvas.height - MARGIN - (newBounds.height / 2) });
      }
      
      textObj.setCoords();
      canvas.renderAll();
    }, 150);
    
    return textObj;
  }, [canvas]);

  const createLayout = useCallback(async (productInfo, backgroundUrl) => {
    if (!canvas) return;

    const W = canvas.width;
    const H = canvas.height;
    const isLEP = productInfo.isLEP;
    const isExclusive = productInfo.isExclusive;

    canvas.getObjects().forEach(obj => {
      if (obj.isAIGenerated) canvas.remove(obj);
    });

    // BACKGROUND
    if (isLEP) {
      canvas.setBackgroundColor('#ffffff', () => canvas.renderAll());
    } else if (backgroundUrl) {
      await new Promise(resolve => {
        fabric.Image.fromURL(backgroundUrl, (img) => {
          const scale = Math.max(W / img.width, H / img.height);
          img.set({
            left: W / 2,
            top: H / 2,
            originX: 'center',
            originY: 'center',
            scaleX: scale,
            scaleY: scale,
            selectable: false,
            isBackground: true
          });
          canvas.setBackgroundImage(img, () => {
            canvas.renderAll();
            resolve();
          });
        }, { crossOrigin: 'anonymous' });
      });
    } else {
      const gradients = {
        sports: [{ offset: 0, color: '#1e3a8a' }, { offset: 1, color: '#60a5fa' }],
        beverage: [{ offset: 0, color: '#4facfe' }, { offset: 1, color: '#00f2fe' }],
        default: [{ offset: 0, color: '#6366f1' }, { offset: 1, color: '#8b5cf6' }]
      };
      const gradient = gradients[productInfo.category] || gradients.default;
      canvas.setBackgroundColor({
        type: 'linear',
        coords: { x1: 0, y1: 0, x2: W, y2: H },
        colorStops: gradient
      }, () => canvas.renderAll());
    }

    await new Promise(r => setTimeout(r, 200));

    // CATEGORIZE
    const allImages = canvas.getObjects('image').filter(img => !img.isBackground);
    const packshots = allImages.filter(img => 
      img.imageType === 'packshot' || (!img.imageType && img.width * img.height > 30000)
    );
    const logos = allImages.filter(img => 
      img.imageType === 'logo' || (!img.imageType && img.width * img.height < 30000)
    );
    const decorative = allImages.filter(img => img.imageType === 'decorative');

    console.log(`📊 ${packshots.length} packshots, ${logos.length} logos`);

    // POSITION PACKSHOTS
    let packshotRightEdge = 0;
    
    for (let i = 0; i < packshots.length; i++) {
      const packshot = packshots[i];
      const cleanUrl = await removeBackgroundFromImage(packshot.getSrc());
      
      await new Promise(resolve => {
        fabric.Image.fromURL(cleanUrl, (newImg) => {
          const targetSize = H * 0.40;
          const scale = targetSize / Math.max(newImg.width, newImg.height);
          
          let left, top;
          
          if (packshots.length === 1) {
            left = W / 2;
            top = H / 2;
          } else if (packshots.length === 2) {
            const spacing = W * 0.25;
            left = (W / 2) - spacing + (i * spacing * 2);
            top = H / 2;
          } else {
            const totalSpacing = W * 0.60;
            const gap = totalSpacing / (packshots.length - 1);
            left = (W * 0.20) + (i * gap);
            top = H / 2;
          }
          
          newImg.set({
            left: left,
            top: top,
            scaleX: scale,
            scaleY: scale,
            originX: 'center',
            originY: 'center',
            angle: 0,
            shadow: isLEP ? null : new fabric.Shadow({
              color: 'rgba(0, 0, 0, 0.6)',
              blur: 22,
              offsetX: 10,
              offsetY: 10
            })
          });
          
          const bounds = newImg.getBoundingRect();
          const thisRightEdge = bounds.left + bounds.width;
          if (thisRightEdge > packshotRightEdge) {
            packshotRightEdge = thisRightEdge;
          }
          
          canvas.remove(packshot);
          canvas.add(newImg);
          canvas.bringToFront(newImg);
          console.log(`✅ Packshot ${i + 1} right edge: ${Math.round(thisRightEdge)}`);
          resolve();
        }, { crossOrigin: 'anonymous' });
      });
    }
    
    // POSITION LOGO OR LEP TEXT
    if (isLEP) {
      // For LEP: Add simple blue "LEP" text to the right of packshots
      const logoOffset = 60;
      const lepText = new fabric.Text('LEP', {
        left: packshotRightEdge + logoOffset,
        top: H / 2,
        originX: 'left',
        originY: 'center',
        fontSize: 80,
        fontWeight: 'bold',
        fill: '#00539F', // Tesco blue
        fontFamily: 'Arial Black, Impact',
        shadow: null,
        stroke: null,
        strokeWidth: 0
      });
      
      canvas.add(lepText);
      canvas.bringToFront(lepText);
      console.log(`✅ LEP Text: x=${Math.round(packshotRightEdge + logoOffset)} (RIGHT of ALL packshots)`);
    } else if (!isLEP && logos.length > 0) {
      // Non-LEP: Use uploaded logo at top-left
      const logo = logos[0];
      const logoScale = 100 / Math.max(logo.width, logo.height);
      logo.set({
        left: 130,
        top: 110,
        scaleX: logoScale,
        scaleY: logoScale,
        originX: 'center',
        originY: 'center',
        shadow: new fabric.Shadow({ color: 'rgba(0, 0, 0, 0.4)', blur: 12 })
      });
      canvas.bringToFront(logo);
    }

    decorative.forEach((decor) => {
      const scale = 150 / Math.max(decor.width, decor.height);
      decor.set({
        left: W - 160,
        top: H - 180,
        scaleX: scale,
        scaleY: scale,
        originX: 'center',
        originY: 'center',
        opacity: 0.95,
        angle: 0
      });
    });

    canvas.renderAll();

    // TEXT
    const TESCO_BLUE = '#00539F';

    // HEADLINE - LEFT ALIGNED - ALWAYS BRIGHT WHITE
    addText(productInfo.headline.toUpperCase(), {
      left: 110,
      top: 110,
      originX: 'left',
      fontSize: 64,
      fontWeight: 'bold',
      fill: '#ffffff',  // Always bright white
      stroke: isLEP ? null : 'rgba(0,0,0,0.8)',
      strokeWidth: isLEP ? 0 : 3,
      fontFamily: 'Impact, Arial Black',
      shadow: isLEP ? null : new fabric.Shadow({
        color: 'rgba(0,0,0,1)',
        blur: 25,
        offsetX: 5,
        offsetY: 5
      })
    });

    // TAGLINE
    const taglineWords = productInfo.tagline.split(' ');
    
    if (isLEP) {
      // LEP: Split into lines, LEFT-ALIGNED
      const wordsPerLine = Math.ceil(taglineWords.length / 2);
      const lines = [];
      
      for (let i = 0; i < taglineWords.length; i += wordsPerLine) {
        lines.push(taglineWords.slice(i, i + wordsPerLine).join(' '));
      }
      
      lines.forEach((line, idx) => {
        addText(line, {
          left: 110,
          top: 180 + (idx * 30),
          originX: 'left',
          fontSize: 24,
          fill: TESCO_BLUE,
          fontWeight: 'normal',
          textAlign: 'left',
          shadow: null,
          stroke: null,
          strokeWidth: 0
        });
      });
      
      console.log(`✅ LEP: ${lines.length} tagline lines, LEFT-ALIGNED`);
    } else {
      // Non-LEP: Centered
      addText(productInfo.tagline, {
        left: W / 2,
        top: 190,
        originX: 'center',
        fontSize: 30,
        fill: '#ffffff',
        fontWeight: 'bold',
        stroke: 'rgba(0,0,0,0.7)',
        strokeWidth: 2,
        shadow: new fabric.Shadow({
          color: 'rgba(0, 0, 0, 1)',
          blur: 18,
          offsetX: 4,
          offsetY: 4
        })
      });
    }

    // Price, CTA, Tags
    if (productInfo.price) {
      const priceBg = new fabric.Rect({
        left: 110,
        top: 280,
        width: 210,
        height: 85,
        fill: isLEP ? '#ffffff' : '#ef4444',
        rx: 14,
        ry: 14,
        stroke: isLEP ? TESCO_BLUE : 'transparent',
        strokeWidth: isLEP ? 5 : 0,
        selectable: true,
        isAIGenerated: true,
        shadow: isLEP ? null : new fabric.Shadow({
          color: 'rgba(0, 0, 0, 0.6)',
          blur: 18,
          offsetY: 8
        })
      });
      canvas.add(priceBg);

      addText(productInfo.price, {
        left: 215,
        top: 322,
        originX: 'center',
        fontSize: 52,
        fontWeight: 'bold',
        fill: isLEP ? TESCO_BLUE : '#ffffff',
        shadow: null,
        stroke: null,
        strokeWidth: 0
      });
    }

    const ctaRect = new fabric.Rect({
      left: 110,
      top: H - 170,
      width: 290,
      height: 75,
      fill: '#10b981',
      rx: 38,
      ry: 38,
      selectable: true,
      isAIGenerated: true,
      shadow: isLEP ? null : new fabric.Shadow({
        color: 'rgba(0, 0, 0, 0.6)',
        blur: 20,
        offsetY: 8
      })
    });
    canvas.add(ctaRect);

    addText('BUY NOW ▶', {
      left: 255,
      top: H - 132,
      originX: 'center',
      fontSize: 30,
      fontWeight: 'bold',
      fill: '#ffffff',
      shadow: null,
      stroke: null,
      strokeWidth: 0
    });

    const tagText = isExclusive ? 'Only at Tesco' : 'Available at Tesco';
    addText(tagText, {
      left: 110,
      top: H - 230,
      originX: 'left',
      fontSize: 24,
      fontWeight: 'bold',
      fill: isLEP ? TESCO_BLUE : '#ffffff',
      stroke: isLEP ? null : 'rgba(0,0,0,0.6)',
      strokeWidth: isLEP ? 0 : 1.5,
      shadow: isLEP ? null : new fabric.Shadow({
        color: 'rgba(0, 0, 0, 0.8)',
        blur: 10,
        offsetX: 2,
        offsetY: 2
      })
    });

    if (isLEP) {
      addText('Selected stores. While stocks last', {
        left: 110,
        top: H - 195,
        originX: 'left',
        fontSize: 20,
        fill: TESCO_BLUE,
        shadow: null,
        stroke: null,
        strokeWidth: 0
      });
    }

    if (!isLEP) {
      const badge = new fabric.Circle({
        left: W - 100,
        top: 95,
        radius: 60,
        fill: '#ffd700',
        stroke: '#ffffff',
        strokeWidth: 6,
        originX: 'center',
        originY: 'center',
        selectable: true,
        isAIGenerated: true,
        shadow: new fabric.Shadow({ color: 'rgba(0, 0, 0, 0.5)', blur: 15 })
      });
      canvas.add(badge);

      addText('TOP\nQUALITY', {
        left: W - 100,
        top: 95,
        originX: 'center',
        fontSize: 15,
        fontWeight: 'bold',
        fill: getContrastColor('#ffd700'),
        textAlign: 'center',
        lineHeight: 1.2,
        shadow: null,
        selectable: true
      });
    }

    canvas.renderAll();
    toast.success('✅ Perfect layout!', { duration: 5000 });
  }, [canvas, addText, getContrastColor, removeBackgroundFromImage]);

  const generate = useCallback(async () => {
    if (!localInput.trim()) {
      toast.error('Please describe the ad');
      return;
    }

    const allImages = canvas?.getObjects('image').filter(img => !img.isBackground) || [];
    if (allImages.length === 0) {
      toast.error('Upload images first!');
      return;
    }

    setIsGenerating(true);
    setProgress({ step: 'Analyzing...', progress: 10 });

    try {
      const category = detectCategory(localInput);
      const isLEP = detectLEP(localInput);
      const isExclusive = detectExclusive(localInput);
      const brandName = extractBrandName(localInput) || 'Premium Product';
      const price = extractPrice(localInput);

      setProgress({ step: 'Generating copy...', progress: 30 });
      const copy = await generateCopy({ name: brandName, category });

      setProgress({ step: 'Creating background...', progress: 50 });
      const backgroundUrl = isLEP ? null : await generateBackground(category);

      setProgress({ step: 'Building layout...', progress: 70 });
      await createLayout({
        headline: copy.headline,
        tagline: copy.tagline,
        name: brandName,
        price,
        category,
        isLEP,
        isExclusive
      }, backgroundUrl);

      setProgress({ step: 'Complete!', progress: 100 });

      setAssistantResults({
        recommendations: [
          { type: 'success', message: `✨ ${brandName} ad created!` },
          { type: 'success', message: '🔪 Backgrounds removed' },
          ...(isLEP ? [
            { type: 'success', message: '🏷️ LEP text: RIGHT of ALL packshots' },
            { type: 'success', message: '📝 ALL text: LEFT-ALIGNED' },
            { type: 'success', message: '✂️ Tagline split, left-aligned' }
          ] : [
            { type: 'success', message: '📍 Logo: TOP-LEFT' },
            { type: 'success', message: '🎨 Centered text with shadows' }
          ])
        ]
      });

      toast.success('🎉 Perfect ad ready!', { duration: 5000 });
      setLocalInput('');
      setAssistantInput('');

    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('Failed to generate ad');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(null), 2000);
    }
  }, [localInput, canvas, detectCategory, detectLEP, detectExclusive, extractBrandName, extractPrice, generateCopy, generateBackground, createLayout, setAssistantInput, setAssistantResults]);

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={20} color="#8b5cf6" />
          AI Smart Assistant
        </h3>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>
          LEP: Left-aligned text · LEP text right of packshots<br/>Non-LEP: Centered text · Top-left logo
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); generate(); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <textarea
          value={localInput}
          onChange={(e) => { setLocalInput(e.target.value); setAssistantInput(e.target.value); }}
          placeholder='E.g., "Sports LEP ad" or "Premium beverage ad"'
          rows={4}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            resize: 'vertical',
          }}
        />

        <button
          type="submit"
          disabled={isGenerating}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: isGenerating ? '#9ca3af' : '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {isGenerating ? (
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

      {progress && (
        <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>{progress.step}</span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>{progress.progress}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progress.progress}%`, height: '100%', backgroundColor: '#8b5cf6', transition: 'width 0.5s' }} />
          </div>
        </div>
      )}

      {assistantResults && !isGenerating && (
        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#8b5cf6" />
            Results
          </h4>

          {assistantResults.recommendations?.map((rec, i) => {
            const icon = rec.type === 'success' ? <CheckCircle size={16} color="#10b981" /> : <AlertCircle size={16} color="#3b82f6" />;
            const bgColor = rec.type === 'success' ? '#f0fdf4' : '#eff6ff';
            const borderColor = rec.type === 'success' ? '#bbf7d0' : '#bfdbfe';

            return (
              <div key={i} style={{ padding: '12px', backgroundColor: bgColor, border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                {icon}
                <div style={{ flex: 1 }}>{rec.message}</div>
              </div>
            );
          })}

          <button 
            onClick={() => setAssistantResults(null)}
            style={{ width: '100%', marginTop: '12px', padding: '8px', fontSize: '12px', color: '#6b7280', border: '1px solid #e5e7eb', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer' }}
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