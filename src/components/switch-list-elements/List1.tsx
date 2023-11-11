import React from "react";
import { ListProps } from "./List2";

const List1 = ({ items, handleSelect}: ListProps) => {
  return (
    <div>
      <ul className=" list-none px-6 py-3 border w-fit rounded">
        {items.map((item, index) => {
          return (
            <li key={item}>
              <input
                type="checkbox"
                name="item"
                id={`li-${index}`}
                value={item}
                onChange={(e) => {
                 handleSelect(e.target.value);
                }}
              />
              <label htmlFor={`li-${index}`}> {item} </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default List1;
