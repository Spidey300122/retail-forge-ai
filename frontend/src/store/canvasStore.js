import { create } from 'zustand';

const useCanvasStore = create((set, get) => ({
  // Canvas instance
  canvas: null,
  
  // Canvas state
  elements: [],
  selectedElement: null,
  history: {
    past: [],
    future: [],
  },
  zoom: 100,
  
  // Actions
  setCanvas: (canvas) => set({ canvas }),
  
  addElement: (element) => set((state) => ({
    elements: [...state.elements, element]
  })),
  
  removeElement: (elementId) => set((state) => ({
    elements: state.elements.filter(el => el.id !== elementId)
  })),
  
  selectElement: (elementId) => set({ selectedElement: elementId }),
  
  clearCanvas: () => {
    const { canvas } = get();
    if (canvas) {
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      canvas.renderAll();
    }
    set({ elements: [], selectedElement: null });
  },
  
  setZoom: (zoom) => set({ zoom }),
  
  // FIXED: Save state for undo/redo
  saveState: () => {
    const { canvas, history } = get();
    if (!canvas) return;
    
    const currentState = JSON.stringify(canvas.toJSON());
    
    set({
      history: {
        past: [...history.past, currentState],
        future: [] // Clear future when new action happens
      }
    });
    
    console.log('💾 State saved. History length:', history.past.length + 1);
  },
  
  // FIXED: Undo implementation
  undo: () => {
    const { canvas, history } = get();
    
    if (!canvas || history.past.length === 0) {
      console.log('⚠️ Nothing to undo');
      return;
    }
    
    // Save current state to future
    const currentState = JSON.stringify(canvas.toJSON());
    
    // Get previous state
    const previousState = history.past[history.past.length - 1];
    
    // Load previous state
    canvas.loadFromJSON(previousState, () => {
      canvas.renderAll();
      console.log('⏪ Undo applied');
    });
    
    // Update history
    set({
      history: {
        past: history.past.slice(0, -1), // Remove last item
        future: [currentState, ...history.future] // Add current to future
      }
    });
  },
  
  // FIXED: Redo implementation
  redo: () => {
    const { canvas, history } = get();
    
    if (!canvas || history.future.length === 0) {
      console.log('⚠️ Nothing to redo');
      return;
    }
    
    // Save current state to past
    const currentState = JSON.stringify(canvas.toJSON());
    
    // Get next state
    const nextState = history.future[0];
    
    // Load next state
    canvas.loadFromJSON(nextState, () => {
      canvas.renderAll();
      console.log('⏩ Redo applied');
    });
    
    // Update history
    set({
      history: {
        past: [...history.past, currentState], // Add current to past
        future: history.future.slice(1) // Remove first item
      }
    });
  },
}));

export default useCanvasStore;