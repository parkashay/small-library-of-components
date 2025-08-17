import { cn } from "@/utils";
import Link from "next/link";

export function NavigateBack({
  text,
  href,
  classsName,
}: {
  text: string;
  href: string;
  classsName?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 text-lg font-semibold px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
        classsName
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      {text}
    </Link>
  );
}
