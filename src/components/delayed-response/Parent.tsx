"use client";
import React, { useState } from "react";
import Child from "./Child";

interface ParentProps {}

const Parent = ({}: ParentProps) => {
  const [message, setMessage] = useState<string>();
  const [child, setChild] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-3 w-full ">
      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setChild(true);
        }}
      >
        <input
          type="text"
          name="message"
          className="text-black px-2 py-1 rounded max-w-[400px]"
          placeholder="input multiple words"
          onChange={(e) => {
            setChild(false);
            setMessage(e.target.value);
          }}
        />
        <button
          type="submit"
          className="border border-white rounded px-2 py-1 max-w-[400px]"
        >
          {" "}
          Pass to child{" "}
        </button>
      </form>

      {child && message && <Child message={message} />}
    </div>
  );
};

export default Parent;
