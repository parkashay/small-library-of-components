"use client";

import { Canvas } from "@/components/canvas/canvas";
import { useCanvasStore } from "@/stores/canvas-store";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/shallow";
import { CanvasLine } from "./elements/canvas-line";
import { CanvasCircle } from "./elements/canvas-circle";
import { CanvasRectangle } from "./elements/canvas-rectangle";

export function DrawCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { canvas, setCanvas } = useCanvasStore(
    useShallow((s) => ({
      canvas: s.canvas,
      setCanvas: s.setCanvas,
    }))
  );

  useEffect(() => {
    if (containerRef.current && canvasRef.current && !canvas) {
      const canvas = new Canvas(containerRef.current, canvasRef.current);
      setCanvas(canvas);
    }

    return () => {
      canvas?.clear();
    };
  }, [containerRef, canvasRef, canvas, setCanvas]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[calc(100vh-20rem)] bg-slate-200 dark:bg-slate-800 rounded-lg mt-6"
    >
      <canvas ref={canvasRef} />
      <CanvasLine />
      <CanvasCircle />
      <CanvasRectangle />
    </div>
  );
}
