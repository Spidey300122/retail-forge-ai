import { create } from 'zustand';

const useCanvasStore = create((set, get) => ({
  // ... existing state ...
  canvas: null,
  elements: [],
  selectedElement: null,
  history: {
    past: [],
    future: [],
  },
  zoom: 100,
  
  // ADD THIS FLAG
  shouldSave: true, 

  // ... existing actions ...
  setCanvas: (canvas) => set({ canvas }),
  // ... other actions ...

  // UPDATE saveState
  saveState: () => {
    const { canvas, history, shouldSave } = get();
    // Check shouldSave flag
    if (!canvas || !shouldSave) return;
    
    const currentState = JSON.stringify(canvas.toJSON());
    
    // Don't save if state hasn't changed (optional optimization)
    if (history.past.length > 0 && history.past[history.past.length - 1] === currentState) {
      return;
    }

    set({
      history: {
        past: [...history.past, currentState],
        future: [] // This is why Redo was breaking
      }
    });
    
    console.log('💾 State saved. History length:', history.past.length + 1);
  },
  
  // UPDATE undo
  undo: () => {
    const { canvas, history } = get();
    
    if (!canvas || history.past.length === 0) return;
    
    // 1. Lock history saving
    set({ shouldSave: false });

    const currentState = JSON.stringify(canvas.toJSON());
    const previousState = history.past[history.past.length - 1];
    
    canvas.loadFromJSON(previousState, () => {
      canvas.renderAll();
      // 2. Unlock history saving after rendering is done
      set({ shouldSave: true });
      console.log('⏪ Undo applied');
    });
    
    set({
      history: {
        past: history.past.slice(0, -1),
        future: [currentState, ...history.future]
      }
    });
  },
  
  // UPDATE redo
  redo: () => {
    const { canvas, history } = get();
    
    if (!canvas || history.future.length === 0) return;
    
    // 1. Lock history saving
    set({ shouldSave: false });

    const currentState = JSON.stringify(canvas.toJSON());
    const nextState = history.future[0];
    
    canvas.loadFromJSON(nextState, () => {
      canvas.renderAll();
      // 2. Unlock history saving
      set({ shouldSave: true });
      console.log('⏩ Redo applied');
    });
    
    set({
      history: {
        past: [...history.past, currentState],
        future: history.future.slice(1)
      }
    });
  },
}));

export default useCanvasStore;