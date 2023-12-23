"use client";
import Link from "next/link";
import React from "react";

interface Problems {
  title: string;
  href: string;
}
const problems: Problems[] = [
  {
    title: "Delayed Response",
    href: "/delayed-response",
  },
  {
    title: "Switch list elements",
    href: "/switch-list-elements",
  },
  {
    title: "Footprints",
    href: "/footprints",
  },
  {
    title: "Hacker Screen",
    href: "/hacker-screen",
  },
];

const Navigation = () => {
  return (
    <div className="flex flex-col gap-3 items-start">
      <Link href={"/"} className="text-lg font-semibold hover:text-slate-300">
        {" "}
        &larr; Home
      </Link>
      {problems.map((problem, index) => {
        return (
          <Link
            href={problem.href}
            className="hover:text-slate-300"
            key={index}
          >
            {index + 1}. {problem.title}{" "}
          </Link>
        );
      })}
    </div>
  );
};

export default Navigation;
