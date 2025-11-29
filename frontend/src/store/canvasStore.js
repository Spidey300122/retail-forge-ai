import { create } from 'zustand';

const useCanvasStore = create((set, get) => ({
  // State
  canvas: null,
  elements: [],
  selectedElement: null,
  history: {
    past: [],
    future: [],
  },
  zoom: 100,
  _shouldSave: true, // Renamed with underscore prefix to satisfy ESLint

  // Set canvas instance
  setCanvas: (canvas) => set({ canvas }),

  // Clear entire canvas
  clearCanvas: () => {
    const { canvas } = get();
    if (!canvas) return;
    
    // Temporarily disable history saving
    set({ _shouldSave: false });
    
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    canvas.renderAll();
    
    // Re-enable history saving
    set({ _shouldSave: true });
    
    // Save the cleared state
    get().saveState();
    console.log('🗑️ Canvas cleared');
  },

  // Save state for undo/redo
  saveState: () => {
    const state = get();
    const { canvas, history, _shouldSave } = state;
    
    // Check if we should save
    if (!canvas || !_shouldSave) return;
    
    const currentState = JSON.stringify(canvas.toJSON());
    
    // Don't save if state hasn't changed
    if (history.past.length > 0 && history.past[history.past.length - 1] === currentState) {
      return;
    }

    set({
      history: {
        past: [...history.past, currentState],
        future: []
      }
    });
    
    console.log('💾 State saved. History length:', history.past.length + 1);
  },
  
  // Undo
  undo: () => {
    const { canvas, history } = get();
    
    if (!canvas || history.past.length === 0) {
      console.log('⚠️ Nothing to undo');
      return;
    }
    
    // Lock history saving
    set({ _shouldSave: false });

    const currentState = JSON.stringify(canvas.toJSON());
    const previousState = history.past[history.past.length - 1];
    
    canvas.loadFromJSON(previousState, () => {
      canvas.renderAll();
      // Unlock history saving
      set({ _shouldSave: true });
      console.log('⏪ Undo applied');
    });
    
    set({
      history: {
        past: history.past.slice(0, -1),
        future: [currentState, ...history.future]
      }
    });
  },
  
  // Redo
  redo: () => {
    const { canvas, history } = get();
    
    if (!canvas || history.future.length === 0) {
      console.log('⚠️ Nothing to redo');
      return;
    }
    
    // Lock history saving
    set({ _shouldSave: false });

    const currentState = JSON.stringify(canvas.toJSON());
    const nextState = history.future[0];
    
    canvas.loadFromJSON(nextState, () => {
      canvas.renderAll();
      // Unlock history saving
      set({ _shouldSave: true });
      console.log('⏩ Redo applied');
    });
    
    set({
      history: {
        past: [...history.past, currentState],
        future: history.future.slice(1)
      }
    });
  },

  // Select element
  setSelectedElement: (element) => set({ selectedElement: element }),

  // Set zoom
  setZoom: (zoom) => set({ zoom }),
}));

export default useCanvasStore;