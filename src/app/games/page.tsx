import { GAMES } from "@/data/games";
import Link from "next/link";

export default function GamesPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-12">Arcade Games</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {GAMES.map((game) => (
            <Link
              key={game.href}
              href={`/games${game.href}`}
              className="group relative bg-gray-800 rounded-xl overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-5xl">{game.icon}</span>
                  <div className="h-8 w-8 rounded-full bg-gray-700 group-hover:bg-blue-600 transition-colors duration-300" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">
                  {game.title}
                </h2>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  {game.description}
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
import Tetris from "@/components/games/tetris";
