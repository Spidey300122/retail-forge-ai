import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

const useCanvasStore = create(
  immer((set) => ({
    canvas: null,
    elements: [],
    selectedElement: null,
    
    setCanvas: (canvas) => set((state) => {
      state.canvas = canvas;
    }),
    
    addElement: (element) => set((state) => {
      state.elements.push(element);
    }),
    
    removeElement: (elementId) => set((state) => {
      state.elements = state.elements.filter(el => el.id !== elementId);
    }),
    
    selectElement: (elementId) => set((state) => {
      state.selectedElement = elementId;
    }),
    
    clearCanvas: () => set((state) => {
      state.elements = [];
      state.selectedElement = null;
    })
  }))
);

export default useCanvasStore;