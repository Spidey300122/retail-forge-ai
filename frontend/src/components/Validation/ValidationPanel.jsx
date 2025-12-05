import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Lightbulb,
  RefreshCw,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import useCanvasStore from '../../store/canvasStore';
import toast from 'react-hot-toast';
import './ValidationPanel.css';

function ValidationPanel() {
  const { canvas } = useCanvasStore();
  const [validationResults, setValidationResults] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [autoValidate, setAutoValidate] = useState(true);
  const [highlightedElements, setHighlightedElements] = useState([]);
  const [expandedViolations, setExpandedViolations] = useState(new Set());
  
  // Refs for race condition handling
  const latestRequestRef = useRef(0);
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);

  const extractCreativeData = useCallback(() => {
    if (!canvas) return null;

    const objects = canvas.getObjects();
    
    const textElements = objects.filter(obj => 
      obj.type === 'i-text' || obj.type === 'text'
    );
    
    const allText = textElements.map(obj => obj.text).join(' ');

    const sortedBySize = [...textElements].sort((a, b) => 
      (b.fontSize || 16) - (a.fontSize || 16)
    );

    return {
      format: 'instagram_post',
      backgroundColor: canvas.backgroundColor,
      text: allText,
      headline: sortedBySize[0]?.text || '',
      subhead: sortedBySize[1]?.text || '',
      elements: objects.map((obj, index) => ({
        type: obj.type,
        content: obj.text || '',
        fontSize: obj.fontSize,
        fill: obj.fill,
        left: obj.left,
        top: obj.top,
        width: obj.width * (obj.scaleX || 1),
        height: obj.height * (obj.scaleY || 1),
        isPackshot: obj.type === 'image',
        index: index,
      })),
      category: 'general',
      isAlcohol: false,
    };
  }, [canvas]);

  const validateCreative = useCallback(async () => {
    if (!canvas) return;

    // Cancel previous running request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    const requestId = ++latestRequestRef.current;
    setIsValidating(true);

    try {
      const creativeData = extractCreativeData();
      
      const response = await fetch('http://localhost:3000/api/validate/creative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creativeData }),
        signal: abortController.signal
      });

      const data = await response.json();

      // Only update state if this is still the latest request
      if (requestId === latestRequestRef.current) {
        if (data.success) {
          setValidationResults(data.data);
          console.log('✅ Validation complete:', data.data);
        } else {
          throw new Error(data.error?.message || 'Validation failed');
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Validation error:', error);
        toast.error('Failed to validate creative');
      }
    } finally {
      if (requestId === latestRequestRef.current) {
        setIsValidating(false);
      }
    }
  }, [canvas, extractCreativeData]);

  // Debounced Auto-validation
  useEffect(() => {
    if (!canvas || !autoValidate) return;

    const handleModified = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      // Wait 1.5s after last change before validating
      timeoutRef.current = setTimeout(() => {
        validateCreative();
      }, 1500);
    };

    canvas.on('object:modified', handleModified);
    canvas.on('object:added', handleModified);
    canvas.on('object:removed', handleModified);

    return () => {
      canvas.off('object:modified', handleModified);
      canvas.off('object:added', handleModified);
      canvas.off('object:removed', handleModified);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [canvas, autoValidate, validateCreative]);

  const handleHighlightViolation = (violation) => {
    if (!canvas || !violation.affectedElements) return;

    clearHighlights();

    const objects = canvas.getObjects();
    const newHighlights = [];

    violation.affectedElements.forEach(affected => {
      const elementIndex = affected.index || parseInt(affected.element?.split('_')[1] || '0');
      const obj = objects[elementIndex];

      if (obj) {
        const original = {
          stroke: obj.stroke,
          strokeWidth: obj.strokeWidth,
        };

        obj.set({
          stroke: '#ef4444',
          strokeWidth: 3,
        });

        newHighlights.push({ obj, original });
      }
    });

    setHighlightedElements(newHighlights);
    canvas.renderAll();

    setTimeout(clearHighlights, 5000);
  };

  const clearHighlights = () => {
    highlightedElements.forEach(({ obj, original }) => {
      obj.set(original);
    });
    setHighlightedElements([]);
    if (canvas) canvas.renderAll();
  };

  const handleApplyFix = async (violation) => {
    if (!canvas) return;

    switch (violation.ruleId) {
      case 'min_font_size':
        applyFontSizeFix(violation);
        break;
      case 'wcag_contrast':
        applyContrastFix(violation);
        break;
      default:
        toast.info('Manual fix required for this violation');
    }
  };

  const applyFontSizeFix = (violation) => {
    const objects = canvas.getObjects();
    let fixed = 0;

    violation.affectedElements?.forEach(affected => {
      const elementIndex = affected.index || parseInt(affected.element?.split('_')[1] || '0');
      const obj = objects[elementIndex];

      if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
        const minSize = affected.minimumSize || 20;
        obj.set({ fontSize: minSize });
        fixed++;
      }
    });

    canvas.renderAll();
    toast.success(`Fixed ${fixed} text element(s)`);
    validateCreative();
  };

  const applyContrastFix = (violation) => {
    const objects = canvas.getObjects();
    const bgColor = canvas.backgroundColor || '#ffffff';
    const bgBrightness = getColorBrightness(bgColor);
    const newColor = bgBrightness > 128 ? '#000000' : '#ffffff';

    let fixed = 0;

    violation.affectedElements?.forEach(affected => {
      const elementIndex = affected.index || parseInt(affected.element?.split('_')[1] || '0');
      const obj = objects[elementIndex];

      if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
        obj.set({ fill: newColor });
        fixed++;
      }
    });

    canvas.renderAll();
    toast.success(`Fixed contrast for ${fixed} element(s)`);
    validateCreative();
  };

  const getColorBrightness = (hex) => {
    if (!hex) return 255;
    const rgb = parseInt(hex.replace('#', ''), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    return (r * 299 + g * 587 + b * 114) / 1000;
  };

  const toggleViolationExpand = (index) => {
    const newExpanded = new Set(expandedViolations);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedViolations(newExpanded);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'hard_fail':
        return 'severity-error';
      case 'warning':
        return 'severity-warning';
      default:
        return 'severity-info';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'hard_fail':
        return <AlertCircle size={18} />;
      case 'warning':
        return <Info size={18} />;
      default:
        return <Info size={18} />;
    }
  };

  return (
    <div className="validation-panel">
      <div className="validation-header">
        <div className="header-title">
          <Shield size={20} />
          <h3>Compliance Check</h3>
        </div>

        <div className="header-controls">
          <button
            onClick={() => setAutoValidate(!autoValidate)}
            className={`auto-validate-btn ${autoValidate ? 'active' : ''}`}
            title={autoValidate ? 'Auto-validation ON' : 'Auto-validation OFF'}
          >
            {autoValidate ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>

          <button
            onClick={validateCreative}
            disabled={isValidating}
            className="validate-btn"
          >
            <RefreshCw size={16} className={isValidating ? 'animate-spin' : ''} />
            Validate
          </button>
        </div>
      </div>

      {isValidating && (
        <div className="validation-loading">
          <RefreshCw size={24} className="animate-spin" />
          <p>Validating against rules...</p>
        </div>
      )}

      {!isValidating && validationResults && (
        <div className="validation-results">
          <div className={`score-badge ${validationResults.isCompliant ? 'compliant' : 'non-compliant'}`}>
            <div className="score-icon">
              {validationResults.isCompliant ? (
                <CheckCircle size={32} />
              ) : (
                <AlertCircle size={32} />
              )}
            </div>
            <div className="score-info">
              <h4 className="score-title">
                {validationResults.isCompliant ? 'Compliant' : 'Issues Found'}
              </h4>
              <p className="score-subtitle">
                Score: {validationResults.score}/100
              </p>
              <p className="score-details">
                {validationResults.rulesPassed}/{validationResults.rulesChecked} rules passed
              </p>
            </div>
          </div>

          {validationResults.violations.length > 0 && (
            <div className="violations-section">
              <h4 className="section-title">
                <AlertCircle size={16} />
                Violations ({validationResults.violations.length})
              </h4>

              <div className="violations-list">
                {validationResults.violations.map((violation, index) => (
                  <div key={index} className={`violation-card ${getSeverityColor(violation.severity)}`}>
                    <div 
                      className="violation-header"
                      onClick={() => toggleViolationExpand(index)}
                    >
                      <div className="violation-icon">
                        {getSeverityIcon(violation.severity)}
                      </div>
                      <div className="violation-info">
                        <h5 className="violation-name">{violation.ruleName}</h5>
                        <p className="violation-message">{violation.message}</p>
                      </div>
                      <button className="expand-btn">
                        {expandedViolations.has(index) ? '−' : '+'}
                      </button>
                    </div>

                    {expandedViolations.has(index) && (
                      <div className="violation-details">
                        {violation.suggestion && (
                          <div className="suggestion-box">
                            <Lightbulb size={14} />
                            <span>{violation.suggestion}</span>
                          </div>
                        )}

                        <div className="violation-actions">
                          <button
                            onClick={() => handleHighlightViolation(violation)}
                            className="action-btn highlight-btn"
                          >
                            <Eye size={14} />
                            Highlight
                          </button>

                          <button
                            onClick={() => handleApplyFix(violation)}
                            className="action-btn fix-btn"
                          >
                            <CheckCircle size={14} />
                            Auto-Fix
                          </button>
                        </div>

                        {violation.affectedElements && violation.affectedElements.length > 0 && (
                          <div className="affected-elements">
                            <p className="affected-title">Affected elements:</p>
                            <ul>
                              {violation.affectedElements.map((el, i) => (
                                <li key={i}>{el.element}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {validationResults.warnings.length > 0 && (
            <div className="warnings-section">
              <h4 className="section-title">
                <Info size={16} />
                Warnings ({validationResults.warnings.length})
              </h4>

              <div className="warnings-list">
                {validationResults.warnings.map((warning, index) => (
                  <div key={index} className="warning-card">
                    <Info size={16} />
                    <div className="warning-content">
                      <p className="warning-name">{warning.ruleName}</p>
                      <p className="warning-message">{warning.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {validationResults.isCompliant && validationResults.violations.length === 0 && (
            <div className="success-state">
              <CheckCircle size={48} className="success-icon" />
              <h4>All Clear!</h4>
              <p>Your creative passes all compliance checks.</p>
            </div>
          )}
        </div>
      )}

      {!isValidating && !validationResults && (
        <div className="validation-empty">
          <Shield size={48} className="empty-icon" />
          <h4>Ready to Validate</h4>
          <p>Click "Validate" to check your creative against compliance rules.</p>
        </div>
      )}
    </div>
  );
}

export default ValidationPanel;