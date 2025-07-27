import { components } from "@/data";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[url('/vercel.svg')] opacity-5 bg-repeat-space"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            React Component Library
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
            A collection of reusable, customizable React components for modern web applications
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="#components"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Explore Components
            </Link>
            <Link
              href="https://github.com/parkashay"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Components Section */}
      <section id="components" className="py-16 px-6 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-center">Featured Components</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-12 text-center max-w-2xl mx-auto">
            Explore our collection of reusable React components that can be integrated into your
            projects
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {components.map((component) => (
              <Link
                key={`featured-${component.title}`}
                href={component.href}
                className="group bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
              >
                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-2xl">
                  {component.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {component.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">{component.description}</p>
                <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 font-medium">
                  View Component
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-6 bg-white dark:bg-slate-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">About This Library</h2>
          <p className="text-lg text-slate-700 dark:text-slate-300 mb-6 text-center">
            This collection showcases reusable React components that can be easily integrated into
            your projects. Each component is designed to be customizable, accessible, and
            performance-optimized.
          </p>
          <div className="flex justify-center">
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
              <span>Created by</span>
              <span className="font-semibold">Prakash Poudel</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
