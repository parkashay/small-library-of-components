"use client";

import { cn } from "@/utils";
import { useEffect, useRef, useState } from "react";

const MIN_HEIGHT = 200;
const MIN_WIDTH = 200;
type DraggableItems = "tl" | "tr" | "bl" | "br" | "pan" | null;

export function DraggableContainer() {
  const containerRef = useRef<HTMLDivElement>(null);

  const activeItemRef = useRef<DraggableItems>(null);
  const [activeItem, setActiveItem] = useState<DraggableItems>(null);

  const [box, setBox] = useState({
    top: 10,
    left: 10,
    width: MIN_WIDTH,
    height: MIN_HEIGHT,
  });

  const defaultCornerStyles = "absolute size-3 bg-white";

  const handleMouseMove = (e: MouseEvent) => {
    const { movementX, movementY } = e;
    setBox((prev) => {
      let { width, height, top, left } = prev;

      switch (activeItemRef.current) {
        case "pan":
          top += movementY;
          left += movementX;
          break;
        case "tl":
          width -= movementX;
          height -= movementY;
          top += movementY;
          left += movementX;
          break;
        case "tr":
          width += movementX;
          height -= movementY;
          top += movementY;
          break;
        case "bl":
          width -= movementX;
          height += movementY;
          left += movementX;
          break;
        case "br":
          width += movementX;
          height += movementY;
          break;
        default:
          break;
      }

      if (width < MIN_WIDTH) return prev;
      if (height < MIN_HEIGHT) return prev;

      return { width, height, top, left };
    });
  };

  const handleMouseUp = () => {
    activeItemRef.current = null;
    setActiveItem(null);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown = (id: DraggableItems) => {
    activeItemRef.current = id;
    setActiveItem(id);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <section className="relative size-full">
      <div id="drag-overlay-root" className="absolute size-full overflow-hidden">
        <div
          id="draggable-container"
          ref={containerRef}
          className="absolute size-52"
          style={{
            top: box.top,
            left: box.left,
            width: box.width,
            height: box.height,
          }}
        >
          <div
            id="contents"
            className="box-border outline outline-1 rounded overflow-hidden size-full p-6 select-none"
          >
            <div
              id="pan"
              className={cn(
                "absolute top-0 left-1/2 -translate-x-1/2 bg-yellow-400 h-3 w-6 rounded-b cursor-move",
                {
                  "bg-emerald-500": activeItem === "pan",
                }
              )}
              onMouseDown={() => handleMouseDown("pan")}
            ></div>
            <div
              id="tl"
              className={cn(
                defaultCornerStyles,
                "top-0 left-0 rounded-br cursor-nw-resize",
                {
                  "bg-emerald-500": activeItem === "tl",
                }
              )}
              onMouseDown={() => handleMouseDown("tl")}
            ></div>
            <div
              id="tr"
              className={cn(
                defaultCornerStyles,
                "top-0 right-0 rounded-bl cursor-ne-resize",
                {
                  "bg-emerald-500": activeItem === "tr",
                }
              )}
              onMouseDown={() => handleMouseDown("tr")}
            ></div>
            <div
              id="bl"
              className={cn(
                defaultCornerStyles,
                "bottom-0 left-0 rounded-tr cursor-ne-resize",
                {
                  "bg-emerald-500": activeItem === "bl",
                }
              )}
              onMouseDown={() => handleMouseDown("bl")}
            ></div>
            <div
              id="br"
              className={cn(
                defaultCornerStyles,
                "bottom-0 right-0 rounded-tl cursor-nw-resize",
                {
                  "bg-emerald-500": activeItem === "br",
                }
              )}
              onMouseDown={() => handleMouseDown("br")}
            ></div>
            <div id="children" className="text-center">
              Some children can also be rendered inside the container
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
