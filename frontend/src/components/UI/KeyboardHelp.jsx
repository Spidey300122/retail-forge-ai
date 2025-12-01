import { useState } from 'react';
import { Keyboard, X } from 'lucide-react';
import './KeyboardHelp.css';

function KeyboardHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { key: 'Ctrl/Cmd + Z', action: 'Undo' },
    { key: 'Ctrl/Cmd + Shift + Z', action: 'Redo' },
    { key: 'Delete / Backspace', action: 'Delete selected' },
    { key: 'Ctrl/Cmd + A', action: 'Select all' },
    { key: 'Escape', action: 'Deselect' },
    { key: 'Scroll Wheel', action: 'Zoom in/out' },
    { key: 'Alt/Cmd + Drag', action: 'Pan canvas' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="keyboard-help-btn"
        title="Keyboard Shortcuts"
      >
        <Keyboard size={20} />
      </button>

      {isOpen && (
        <div className="keyboard-help-modal" onClick={() => setIsOpen(false)}>
          <div className="keyboard-help-content" onClick={(e) => e.stopPropagation()}>
            <div className="keyboard-help-header">
              <h3>Keyboard Shortcuts</h3>
              <button onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="keyboard-help-list">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="shortcut-item">
                  <kbd>{shortcut.key}</kbd>
                  <span>{shortcut.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default KeyboardHelp;