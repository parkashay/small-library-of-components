import { useCanvasStore } from "@/stores/canvas-store";
import { useEffect } from "react";

export function CanvasRectangle() {
  const canvas = useCanvasStore((s) => s.canvas);
  useEffect(() => {
    if (!canvas) return;
    canvas.drawRect(500, 500, 100, 100);
  }, [canvas]);
  return null;
}
