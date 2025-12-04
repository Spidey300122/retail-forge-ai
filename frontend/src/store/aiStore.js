import { create } from 'zustand';

const useAIStore = create((set) => ({
  generatedLayouts: [],
  generatedCopy: [],
  
  setGeneratedLayouts: (layouts) => set({ generatedLayouts: layouts }),
  setGeneratedCopy: (copy) => set({ generatedCopy: copy }),
}));

export default useAIStore;