import { create } from "zustand";
import Konva from "konva";

export type AspectRatio = "1:1" | "4:5";

export interface CanvasElement {
  id: string;
  type: "image" | "video";
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
}

interface EditorState {
  slidesCount: number;
  aspectRatio: AspectRatio;
  elements: CanvasElement[];
  selectedElementId: string | null;
  stageRef: Konva.Stage | null;
  showGrid: boolean;

  setSlidesCount: (count: number) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  addElement: (element: Omit<CanvasElement, "id" | "zIndex">) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  setStageRef: (ref: Konva.Stage | null) => void;
  toggleGrid: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  slidesCount: 3,
  aspectRatio: "1:1",
  elements: [],
  selectedElementId: null,
  stageRef: null,
  showGrid: false,

  setSlidesCount: (count) =>
    set({ slidesCount: Math.max(1, Math.min(10, count)) }),

  setAspectRatio: (ratio) => set({ aspectRatio: ratio }),

  addElement: (element) =>
    set((state) => {
      const id = Math.random().toString(36).substring(2, 9);
      const zIndex =
        state.elements.length > 0
          ? Math.max(...state.elements.map((e) => e.zIndex)) + 1
          : 0;

      return {
        elements: [...state.elements, { ...element, id, zIndex }],
        selectedElementId: id,
      };
    }),

  updateElement: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el,
      ),
    })),

  removeElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElementId:
        state.selectedElementId === id ? null : state.selectedElementId,
    })),

  selectElement: (id) => set({ selectedElementId: id }),

  bringToFront: (id) =>
    set((state) => {
      const maxZ = Math.max(...state.elements.map((e) => e.zIndex));
      return {
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, zIndex: maxZ + 1 } : el,
        ),
      };
    }),

  sendToBack: (id) =>
    set((state) => {
      const minZ = Math.min(...state.elements.map((e) => e.zIndex));
      return {
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, zIndex: minZ - 1 } : el,
        ),
      };
    }),

  setStageRef: (ref) => set({ stageRef: ref }),

  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
}));
