import { Tools } from "@/@types/canvas";
import { Canvas } from "@/components/canvas/canvas";
import { create } from "zustand";

interface CanvasStore {
  canvas: Canvas | null;
  activeTool: Tools;
}

interface CanvasStoreActions {
  setCanvas: (canvas: Canvas) => void;
  setActiveTool: (activeTool: Tools) => void;
}

const initialState: CanvasStore = {
  canvas: null,
  activeTool: null,
};

export const canvasStore = create<CanvasStore & CanvasStoreActions>()((set, get) => ({
  ...initialState,

  // ACTIONS
  setCanvas: (canvas: Canvas) => set({ canvas }),
  setActiveTool: (activeTool: Tools) => set({ activeTool }),
}));

export const useCanvasStore = canvasStore;
