import { useCanvasStore } from "@/stores/canvas-store";
import { useEffect } from "react";

export function CanvasCircle() {
  const canvas = useCanvasStore((s) => s.canvas);
  useEffect(() => {
    if (!canvas) return;
    canvas.drawCircle();
  }, [canvas]);
  return null;
}
