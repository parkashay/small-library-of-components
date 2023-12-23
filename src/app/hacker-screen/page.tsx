"use client";
import React, { useEffect, useState } from "react";
import { string } from "./data";

const Page = () => {
  const data: string = string;
  const [show, setShow] = useState(true);
  useEffect(() => {
    if (window.innerWidth < 720) {
      setShow(false);
    }
  }, []);
  const randomValues = data.split("");
  const [array, setArray] = useState(randomValues);
  const handleMove = () => {
    setArray(
      array.map(
        (item) => randomValues[Math.floor(Math.random() * array.length)]
      )
    );
  };
  return show ? (
    <div>
      <div className="flex flex-wrap text-green-600" onMouseMove={handleMove}>
        {array.map((item, index) => {
          return <span className="text-lg" key={index}>{item}</span>;
        })}
      </div>
    </div>
  ) : (
    "Not available on mobile devices"
  );
};

export default Page;
