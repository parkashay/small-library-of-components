'use client'
import Question from "@/components/Question";
import List1 from "@/components/switch-list-elements/List1";
import List2 from "@/components/switch-list-elements/List2";
import { useState } from "react";

const Page = () => {
  const [list1, setList1] = useState(["one", "two", "three", "four"]); // initializing the first list
  const [list2, setList2] = useState(["this", "that", "these", "those"]); // initializing the second list
  const [selected, setSelected] = useState<string[]>([]); // track the selected items from both lists

  // handle the checking and unchecking of the elements in the list
  const handleSelect = async (selectedItem: string) => {
    if (selected.includes(selectedItem)) {
      setSelected(selected.filter((item) => item !== selectedItem)); // remove from the selected list when unchecking
    } else setSelected([...selected, selectedItem]);
  };

  // move the selected items from the first list to the second list
  const moveToRight = () => {
    selected.map((item) => {
      if (!list2.includes(item)) {
        setList2((prevList2) => [...prevList2, item]); // adding the item to second list
        setList1((prevList1) => prevList1.filter((i) => i !== item)); // removing the item from first list
        setSelected((prevSelected) => prevSelected.filter((i) => i !== item)); // removing the item from the selected list
      }
    });
  };

  // move the selected items from the second list to the first list
  const moveToLeft = () => {
    selected.map((item) => {
      if (!list1.includes(item)) {
        setList1((prevList1) => [...prevList1, item]); // adding the item to the first list
        setList2((prevList2) => prevList2.filter((i) => i !== item)); // removing the item from the second list
        setSelected((prevSelected) => prevSelected.filter((i) => i !== item)); // removing the item from the selected list
      }
    });
  };

  return (
    <div className="my-3 max-w-[1000px] mx-auto">
      <Question>
        When any of the items is checked in the list, then it/they can be
        migrated to another list after clicking the directional buttons.
      </Question>
      <div className="flex gap-3 items-center">
        <List1 items={list1} handleSelect={handleSelect} />
        <div className="flex flex-col gap-3">
          <button className="bg-slate-700 px-2 rounded" onClick={moveToRight}>
            {" "}
            &rarr;{" "}
          </button>

          <button className="bg-slate-700 px-2 rounded" onClick={moveToLeft}>
            {" "}
            &larr;{" "}
          </button>
        </div>
        <List2 items={list2} handleSelect={handleSelect} />
      </div>
    </div>
  );
};

export default Page;
