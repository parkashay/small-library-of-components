import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import TopLoadingBar from "@/components/TopLoadingBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "React Coding Interview Questions",
  description: "Some interview questions with their source code.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TopLoadingBar />
        <main className="flex flex-col lg:flex-row mt-12">
          <div className=" lg:w-[270px] px-3 border-r">
            <Navigation />
          </div>
          <div className=" w-full px-3">{children}</div>
        </main>
      </body>
    </html>
  );
}
