import { useCanvasStore } from "@/stores/canvas-store";
import { useEffect } from "react";

export function CanvasLine() {
  const canvas = useCanvasStore((s) => s.canvas);

  useEffect(() => {
    if (!canvas) return;
    console.log("first");
    canvas.drawLine();
  }, [canvas]);

  return null;
}
