import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import TopLoadingBar from "@/components/TopLoadingBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "React Component Library",
  description: "A collection of reusable React components.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TopLoadingBar />
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <main className="flex flex-col lg:flex-row container mx-auto">
            <div className="lg:sticky lg:top-0 lg:h-screen lg:w-[320px] px-3 lg:py-6 lg:border-r lg:border-slate-200 dark:lg:border-slate-700 overflow-y-auto">
              <Navigation />
            </div>
            <div className="w-full px-3 py-12">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
