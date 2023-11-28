"use client";
import Question from "@/components/Question";
import React, { useState } from "react";

type Point = {
  x: number;
  y: number;
};
const Page = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [poppedPoints, setPoppedPoints] = useState<Point[]>([]);
  const addPoints = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { pageX, pageY } = e;
    setPoints([...points, { x: pageX, y: pageY }]);
    setPoppedPoints([]);
  };

  const undo = () => {
    const tempPoints = [...points];
    if (!tempPoints.length) return;
    const poppedPoint = tempPoints.pop();
    if (!poppedPoint) return;
    setPoppedPoints([...poppedPoints, poppedPoint]);
    setPoints(tempPoints);
  };

  const redo = () => {
    if (!poppedPoints.length) return;
    const newPoppedPoints = [...poppedPoints];
    const poppedPoint = newPoppedPoints.pop();
    setPoppedPoints(newPoppedPoints);
    if (!poppedPoint) return;
    setPoints([...points, poppedPoint]);
  };

  return (
    <>
      <Question>
        When user clicks on the area, then points appear on the screen. The
        points can be erased using the UNDO button and can be redrawn using the
        REDO button.
      </Question>
      <div className="flex gap-3 my-3">
        <button className="p-3 rounded-lg border" onClick={undo}>
          UNDO
        </button>
        <button className="p-3 rounded-lg border" onClick={redo}>
          REDO
        </button>
      </div>
      <div
        className=" w-full h-[70vh] border-2 rounded-lg"
        onClick={(e) => addPoints(e)}
      >
        {points.map((point, index) => (
          <span
            key={index}
            className="absolute h-[15px] w-[15px] rounded-full bg-gray-400"
            style={{
              left: point.x + "px",
              top: point.y + "px",
            }}
          ></span>
        ))}
      </div>
    </>
  );
};

export default Page;
