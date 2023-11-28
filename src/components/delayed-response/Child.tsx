'use client'
import { useEffect, useState } from "react";

interface ChildProps {
  message: string;
}
const Child = ({ message }: ChildProps) => {
  const data = message.split(" "); // converting the message into an array of words
  const [words, setWords] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    if (data.length > 1) {
      // operate at each second of interval
      const interval = setInterval(() => {
        if (currentIndex < data.length) {
          setCurrentIndex(currentIndex + 1); // increment of the current index of the array
          setWords(words + " " + data[currentIndex]); // appending each item from array into the words to display
        }
      }, 1000);
      return () => clearInterval(interval); // clearing the interval after completion
    }
  }, [currentIndex, words, data]);

  return <div className="flex gap-2">{words}</div>;
};

export default Child;
