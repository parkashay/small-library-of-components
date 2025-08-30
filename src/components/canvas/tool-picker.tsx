"use client";

import { Tools, ToolType } from "@/@types/canvas";
import { useCanvasStore } from "@/stores/canvas-store";
import { Circle, Square } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "../ui/button";

export function ToolPicker() {
  const tools: ToolType[] = ["circle", "rect"];

  const activeTool = useCanvasStore((s) => s.activeTool);
  const setActiveTool = useCanvasStore((s) => s.setActiveTool);

  const handleChangeTool = (tool: ToolType) => {
    setActiveTool(tool);
  };

  const toolIconMapper: { [key in Exclude<Tools, null>]: ReactNode } = {
    circle: <Circle />,
    rect: <Square />,
  };

  return (
    <div className="flex items-center justify-center flex-wrap gap-3">
      {tools.map((tool) => (
        <Button
          key={tool}
          variant={activeTool === tool ? "destructive" : "outline"}
          size="icon"
          onClick={() => handleChangeTool(tool)}
          disabled={activeTool === tool}
        >
          {toolIconMapper[tool]}
        </Button>
      ))}
    </div>
  );
}
