import { create } from 'zustand';

const MAX_HISTORY = 50; // Limit history to prevent memory issues
let saveTimeout = null;

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
  _isLoadingState: false, // Better flag name to indicate loading state

  // Set canvas instance
  setCanvas: (canvas) => {
    set({ canvas });
    
    // CRITICAL: Save initial empty state so first action can be undone
    setTimeout(() => {
      const state = get();
      if (state.canvas && state.history.past.length === 0) {
        console.log('💾 Saving initial canvas state');
        state.saveState();
      }
    }, 500); // Give canvas time to fully initialize
  },

  // Clear entire canvas
  clearCanvas: () => {
    const { canvas } = get();
    if (!canvas) return;
    
    // Mark as loading to prevent save during clear
    set({ _isLoadingState: true });
    
    // Clear all objects
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    canvas.renderAll();
    
    // Reset history completely
    set({
      history: {
        past: [],
        future: []
      },
      _isLoadingState: false
    });
    
    // Save the cleared state as initial state
    setTimeout(() => {
      get().saveState();
    }, 100);
    
    console.log('🗑️ Canvas cleared and history reset');
  },

  // Save state for undo/redo with debouncing
  saveState: () => {
    const state = get();
    const { canvas, history, _isLoadingState } = state;
    
    // Don't save if canvas doesn't exist or we're loading a state
    if (!canvas || _isLoadingState) {
      return;
    }

    // Clear any pending save
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Debounce saves to avoid too many history entries
    saveTimeout = setTimeout(() => {
      try {
        const currentState = JSON.stringify(canvas.toJSON(['isValueTile', 'tileType', 'excludeFromLayers', 'imageType', 'isLead']));
        
        // Don't save if state hasn't changed
        if (history.past.length > 0) {
          const lastState = history.past[history.past.length - 1];
          if (lastState === currentState) {
            return;
          }
        }

        // Limit history size
        const newPast = [...history.past, currentState];
        if (newPast.length > MAX_HISTORY) {
          newPast.shift(); // Remove oldest entry
        }

        set({
          history: {
            past: newPast,
            future: [] // Clear future on new action
          }
        });
        
        console.log('💾 State saved. History:', newPast.length, 'past');
      } catch (error) {
        console.error('❌ Failed to save state:', error);
      }
    }, 300); // 300ms debounce
  },
  
  // Undo
  undo: () => {
    const state = get();
    const { canvas, history } = state;
    
    if (!canvas) {
      console.log('⚠️ Canvas not available');
      return;
    }

    if (history.past.length === 0) {
      console.log('⚠️ Nothing to undo (no previous states)');
      return;
    }
    
    console.log('⏪ Undoing... (Past:', history.past.length, 'Future:', history.future.length, ')');
    
    // Save current state to future
    try {
      const currentState = JSON.stringify(canvas.toJSON(['isValueTile', 'tileType', 'excludeFromLayers', 'imageType', 'isLead']));
      
      // Get previous state
      const previousState = history.past[history.past.length - 1];
      
      // Mark as loading to prevent saveState from triggering
      set({ _isLoadingState: true });

      canvas.loadFromJSON(previousState, () => {
        // Force render all objects
        canvas.renderAll();
        
        // Clear selection after undo
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        
        // Update history AFTER successful load
        const newPast = history.past.slice(0, -1);
        const newFuture = [currentState, ...history.future];
        
        set({
          history: {
            past: newPast,
            future: newFuture
          },
          _isLoadingState: false
        });
        
        console.log('✅ Undo complete. New state - Past:', newPast.length, 'Future:', newFuture.length);
      });
    } catch (error) {
      console.error('❌ Undo failed:', error);
      set({ _isLoadingState: false });
    }
  },
  
  // Redo
  redo: () => {
    const state = get();
    const { canvas, history } = state;
    
    if (!canvas) {
      console.log('⚠️ Canvas not available');
      return;
    }

    if (history.future.length === 0) {
      console.log('⚠️ Nothing to redo (no future states)');
      return;
    }
    
    console.log('⏩ Redoing... (Past:', history.past.length, 'Future:', history.future.length, ')');
    
    // Save current state to past
    try {
      const currentState = JSON.stringify(canvas.toJSON(['isValueTile', 'tileType', 'excludeFromLayers', 'imageType', 'isLead']));
      
      // Get next state
      const nextState = history.future[0];
      
      // Mark as loading to prevent saveState from triggering
      set({ _isLoadingState: true });

      canvas.loadFromJSON(nextState, () => {
        // Force render
        canvas.renderAll();
        
        // Clear selection after redo
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        
        // Update history AFTER successful load
        const newPast = [...history.past, currentState];
        const newFuture = history.future.slice(1);
        
        set({
          history: {
            past: newPast,
            future: newFuture
          },
          _isLoadingState: false
        });
        
        console.log('✅ Redo complete. New state - Past:', newPast.length, 'Future:', newFuture.length);
      });
    } catch (error) {
      console.error('❌ Redo failed:', error);
      set({ _isLoadingState: false });
    }
  },

  // Select element
  setSelectedElement: (element) => set({ selectedElement: element }),

  // Set zoom
  setZoom: (zoom) => set({ zoom }),
}));

export default useCanvasStore;