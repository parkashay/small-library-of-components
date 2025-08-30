import { DrawCanvas } from "@/components/canvas/draw-canvas";
import { ToolPicker } from "@/components/canvas/tool-picker";

export default function Page() {
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6 text-center">Canvas Playground</h1>
      <ToolPicker />
      <DrawCanvas />
    </div>
  );
}
