"use client";
import React, { useEffect, useRef, useState } from "react";

// ====== Types ======
type Matrix = number[][];

type PieceKey = "I" | "J" | "L" | "O" | "S" | "T" | "Z";

interface Player {
  pos: { x: number; y: number };
  matrix: Matrix;
  next: PieceKey;
  alive: boolean;
}

// ====== Constants ======
const COLS = 10;
const ROWS = 20;
const BLOCK = 32; // logical block size; canvas is scaled for DPR

const PIECES: Record<PieceKey, Matrix> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [2, 0, 0],
    [2, 2, 2],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 3],
    [3, 3, 3],
    [0, 0, 0],
  ],
  O: [
    [4, 4],
    [4, 4],
  ],
  S: [
    [0, 5, 5],
    [5, 5, 0],
    [0, 0, 0],
  ],
  T: [
    [0, 6, 0],
    [6, 6, 6],
    [0, 0, 0],
  ],
  Z: [
    [7, 7, 0],
    [0, 7, 7],
    [0, 0, 0],
  ],
};

const COLORS: Record<number, string> = {
  1: "#5eead4", // I — teal
  2: "#60a5fa", // J — blue
  3: "#f59e0b", // L — amber
  4: "#fde047", // O — yellow
  5: "#34d399", // S — green
  6: "#a78bfa", // T — violet
  7: "#f87171", // Z — red
};

function createMatrix(w: number, h: number): Matrix {
  return Array.from({ length: h }, () => Array(w).fill(0));
}

function rotate(matrix: Matrix, dir: 1 | -1): Matrix {
  const m = matrix.map((row, y) => row.map((_, x) => matrix[matrix.length - 1 - x][y]));
  return dir === 1 ? m : m.map((row) => row.reverse());
}

function randomPiece(): PieceKey {
  const keys: PieceKey[] = ["I", "J", "L", "O", "S", "T", "Z"];
  return keys[(Math.random() * keys.length) | 0];
}

// Speed curve: base ms * 0.85^level (snappy but controllable)
function dropIntervalFor(level: number) {
  const base = 1000; // ms
  return Math.max(70, Math.floor(base * Math.pow(0.85, level)));
}

// Scoring (Tetris Guideline-ish)
const LINE_SCORES = { 1: 100, 2: 300, 3: 500, 4: 800 } as const;

export default function TetrisCanvas() {
  const boardRef = useRef<HTMLCanvasElement | null>(null);
  const nextRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [lines, setLines] = useState(0);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const arena = useRef<Matrix>(createMatrix(COLS, ROWS));
  const player = useRef<Player>({
    pos: { x: 0, y: 0 },
    matrix: PIECES[randomPiece()],
    next: randomPiece(),
    alive: true,
  });

  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  // ====== Canvas setup ======
  useEffect(() => {
    const canvas = boardRef.current!;
    const ctx = canvas.getContext("2d")!;

    const styleW = COLS * BLOCK;
    const styleH = ROWS * BLOCK;

    // Style size (CSS pixels)
    canvas.style.width = `${styleW}px`;
    canvas.style.height = `${styleH}px`;

    // Actual size (device pixels)
    canvas.width = Math.floor(styleW * dpr);
    canvas.height = Math.floor(styleH * dpr);
    ctx.scale(dpr, dpr);

    // Next canvas
    if (nextRef.current) {
      const n = nextRef.current;
      const nctx = n.getContext("2d")!;
      const nBlocks = 6; // 6x6 preview grid
      const nbSize = 22;
      n.style.width = `${nBlocks * nbSize}px`;
      n.style.height = `${nBlocks * nbSize}px`;
      n.width = Math.floor(nBlocks * nbSize * dpr);
      n.height = Math.floor(nBlocks * nbSize * dpr);
      nctx.scale(dpr, dpr);
    }
  }, [dpr]);

  // ====== Game helpers ======
  const collide = (arenaM: Matrix, playerM: Player) => {
    const m = playerM.matrix;
    const o = playerM.pos;
    for (let y = 0; y < m.length; y++) {
      for (let x = 0; x < m[y].length; x++) {
        if (m[y][x] !== 0 && (arenaM[y + o.y]?.[x + o.x] ?? 1) !== 0) {
          return true;
        }
      }
    }
    return false;
  };

  const merge = (arenaM: Matrix, playerM: Player) => {
    playerM.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          arenaM[y + playerM.pos.y][x + playerM.pos.x] = value;
        }
      });
    });
  };

  const sweep = (arenaM: Matrix) => {
    let rowCount = 0;
    outer: for (let y = arenaM.length - 1; y >= 0; --y) {
      for (let x = 0; x < arenaM[y].length; ++x) {
        if (arenaM[y][x] === 0) continue outer;
      }
      const row = arenaM.splice(y, 1)[0].fill(0);
      arenaM.unshift(row);
      ++y; // check same row again after unshift
      rowCount++;
    }
    if (rowCount > 0) {
      setLines((l) => {
        const total = l + rowCount;
        setLevel(Math.floor(total / 10));
        return total;
      });
      const add = (LINE_SCORES as any)[rowCount] || 0;
      setScore((s) => s + add * (level + 1));
    }
  };

  const resetPlayer = () => {
    const p = player.current;
    const nextKey = p.next;
    p.matrix = PIECES[nextKey].map((row) => row.slice());
    p.pos.y = 0;
    p.pos.x = ((COLS / 2) | 0) - ((p.matrix[0].length / 2) | 0);
    p.next = randomPiece();
    if (collide(arena.current, p)) {
      // Game over
      p.alive = false;
      setGameOver(true);
      setPaused(true);
    }
    drawNext();
  };

  const drawCell = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    value: number,
    size = BLOCK
  ) => {
    if (value === 0) return;
    const color = COLORS[value];

    // Block background with subtle gradient + glossy highlight
    const g = ctx.createLinearGradient(x, y, x + size, y + size);
    g.addColorStop(0, shade(color, -18));
    g.addColorStop(0.5, color);
    g.addColorStop(1, shade(color, 18));

    // soft shadow
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    roundRect(ctx, x + 2, y + 2, size - 4, size - 4, 6);
    ctx.fillStyle = g;
    ctx.fill();

    // inner gloss
    const gloss = ctx.createLinearGradient(x, y, x, y + size);
    gloss.addColorStop(0, "rgba(255,255,255,0.35)");
    gloss.addColorStop(0.25, "rgba(255,255,255,0.12)");
    gloss.addColorStop(1, "rgba(255,255,255,0)");
    roundRect(ctx, x + 2, y + 2, size - 4, (size - 4) * 0.5, 6);
    ctx.fillStyle = gloss;
    ctx.fill();

    ctx.restore();
  };

  const drawMatrix = (
    ctx: CanvasRenderingContext2D,
    matrix: Matrix,
    offset: { x: number; y: number },
    ghost = false
  ) => {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          if (ghost) {
            // ghost piece outline
            ctx.save();
            ctx.globalAlpha = 0.25;
            ctx.strokeStyle = COLORS[value];
            ctx.lineWidth = 2;
            roundRect(
              ctx,
              (x + offset.x) * BLOCK + 2,
              (y + offset.y) * BLOCK + 2,
              BLOCK - 4,
              BLOCK - 4,
              6
            );
            ctx.stroke();
            ctx.restore();
          } else {
            drawCell(ctx, (x + offset.x) * BLOCK, (y + offset.y) * BLOCK, value);
          }
        }
      });
    });
  };

  const clearCanvas = (ctx: CanvasRenderingContext2D) => {
    // Subtle grid background
    ctx.clearRect(0, 0, COLS * BLOCK, ROWS * BLOCK);

    const bg = ctx.createLinearGradient(0, 0, 0, ROWS * BLOCK);
    bg.addColorStop(0, "#0f172a");
    bg.addColorStop(1, "#020617");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, COLS * BLOCK, ROWS * BLOCK);

    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    for (let x = 1; x < COLS; x++) {
      const xx = x * BLOCK;
      ctx.beginPath();
      ctx.moveTo(xx + 0.5, 0);
      ctx.lineTo(xx + 0.5, ROWS * BLOCK);
      ctx.stroke();
    }
    for (let y = 1; y < ROWS; y++) {
      const yy = y * BLOCK;
      ctx.beginPath();
      ctx.moveTo(0, yy + 0.5);
      ctx.lineTo(COLS * BLOCK, yy + 0.5);
      ctx.stroke();
    }
  };

  const draw = () => {
    const canvas = boardRef.current!;
    const ctx = canvas.getContext("2d")!;

    clearCanvas(ctx);

    // draw arena
    arena.current.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) drawCell(ctx, x * BLOCK, y * BLOCK, value);
      });
    });

    // ghost position
    const ghostPos = { ...player.current.pos };
    while (!collide(arena.current, { ...player.current, pos: { ...ghostPos } })) {
      ghostPos.y++;
    }
    ghostPos.y--; // last valid

    drawMatrix(ctx, player.current.matrix, ghostPos, true);
    drawMatrix(ctx, player.current.matrix, player.current.pos);
  };

  const drawNext = () => {
    const canvas = nextRef.current!;
    const ctx = canvas.getContext("2d")!;
    const nbSize = 22; // preview block size
    const grid = 6;

    ctx.clearRect(0, 0, grid * nbSize, grid * nbSize);

    // background
    const bg = ctx.createLinearGradient(0, 0, 0, grid * nbSize);
    bg.addColorStop(0, "#0b1220");
    bg.addColorStop(1, "#0a0f1a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, grid * nbSize, grid * nbSize);

    const m = PIECES[player.current.next];

    const offset = {
      x: Math.floor((grid - m[0].length) / 2),
      y: Math.floor((grid - m.length) / 2),
    };

    m.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          drawCell(ctx as any, (x + offset.x) * nbSize, (y + offset.y) * nbSize, value, nbSize);
        }
      });
    });
  };

  // ====== Controls ======
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (gameOver) return;

      if (e.key === "p" || e.key === "P") {
        setPaused((p) => !p);
        return;
      }

      if (paused) return;

      const p = player.current;
      if (e.key === "ArrowLeft") {
        p.pos.x--;
        if (collide(arena.current, p)) p.pos.x++;
      } else if (e.key === "ArrowRight") {
        p.pos.x++;
        if (collide(arena.current, p)) p.pos.x--;
      } else if (e.key === "ArrowDown") {
        playerDrop();
      } else if (e.key === "ArrowUp" || e.key === "x" || e.key === "X") {
        playerRotate(1);
      } else if (e.key === "z" || e.key === "Z") {
        playerRotate(-1);
      } else if (e.key === " ") {
        // hard drop
        let dropped = 0;
        while (!collide(arena.current, p)) {
          p.pos.y++;
          dropped++;
        }
        p.pos.y--; // last valid
        setScore((s) => s + 2 * dropped);
        merge(arena.current, p);
        sweep(arena.current);
        resetPlayer();
      }
      draw();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paused, gameOver]);

  const playerRotate = (dir: 1 | -1) => {
    const p = player.current;
    const pos = p.pos.x;
    let offset = 1;
    p.matrix = rotate(p.matrix, dir);
    while (collide(arena.current, p)) {
      p.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > p.matrix[0].length) {
        // give up
        p.matrix = rotate(p.matrix, -dir as 1 | -1);
        p.pos.x = pos;
        return;
      }
    }
  };

  const playerDrop = () => {
    const p = player.current;
    p.pos.y++;
    if (collide(arena.current, p)) {
      p.pos.y--;
      merge(arena.current, p);
      sweep(arena.current);
      resetPlayer();
      return true;
    }
    return false;
  };

  // ====== Loop ======
  useEffect(() => {
    let lastTime = 0;
    let dropCounter = 0;
    let raf = 0;

    const update = (time = 0) => {
      raf = requestAnimationFrame(update);
      if (paused || gameOver) return; // freeze visuals while paused/over

      const delta = time - lastTime;
      lastTime = time;
      dropCounter += delta;

      const interval = dropIntervalFor(level);
      if (dropCounter >= interval) {
        const locked = playerDrop();
        if (locked) {
          dropCounter = 0; // lock reset handled inside playerDrop via reset
        } else {
          dropCounter = 0;
        }
      }

      draw();
    };

    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [level, paused, gameOver]);

  // ====== Init / Reset ======
  const newGame = () => {
    arena.current = createMatrix(COLS, ROWS);
    player.current = {
      pos: { x: 0, y: 0 },
      matrix: PIECES[randomPiece()],
      next: randomPiece(),
      alive: true,
    };
    player.current.pos.x = ((COLS / 2) | 0) - ((player.current.matrix[0].length / 2) | 0);
    player.current.pos.y = 0;
    setScore(0);
    setLevel(0);
    setLines(0);
    setPaused(false);
    setGameOver(false);
    draw();
    drawNext();
  };

  useEffect(() => {
    // First mount
    newGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep container focused for keyboard
  useEffect(() => {
    containerRef.current?.focus();
  });

  // ====== UI ======
  return (
    <div className="h-full w-full text-white flex items-center justify-center py-10 px-4">
      <div
        ref={containerRef}
        tabIndex={0}
        className="grid grid-cols-1 lg:grid-cols-[auto_280px] gap-6 lg:gap-10 items-start outline-none"
      >
        {/* Game Panel */}
        <div className="relative">
          {/* Glow */}
          <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-cyan-400/20 to-emerald-500/20 blur-2xl" />

          <div className="relative rounded-2xl p-4 bg-slate-900/70 ring-1 ring-white/10 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-semibold tracking-tight">Tetris</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaused((p) => !p)}
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition active:scale-[.98]"
                >
                  {paused ? "Resume (P)" : "Pause (P)"}
                </button>
                <button
                  onClick={newGame}
                  className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 transition active:scale-[.98]"
                >
                  Restart
                </button>
              </div>
            </div>

            <div className="relative">
              <canvas ref={boardRef} className="block mx-auto rounded-xl ring-1 ring-white/10" />

              {/* Overlays */}
              {paused && !gameOver && <Overlay label="Paused" sub="Press P to resume" />}
              {gameOver && <Overlay label="Game Over" sub="Press Restart to play again" />}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <Stat label="Score" value={score.toLocaleString()} />
              <Stat label="Level" value={level} />
              <Stat label="Lines" value={lines} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl p-4 bg-slate-900/70 ring-1 ring-white/10 shadow-xl backdrop-blur">
            <h2 className="text-sm uppercase tracking-wider text-slate-300/80 mb-2">Next</h2>
            <canvas ref={nextRef} className="rounded-lg ring-1 ring-white/10" />
          </div>

          <div className="rounded-2xl p-4 bg-slate-900/70 ring-1 ring-white/10 shadow-xl backdrop-blur">
            <h2 className="text-sm uppercase tracking-wider text-slate-300/80 mb-3">Controls</h2>
            <ul className="space-y-1.5 text-slate-300/90 text-sm">
              <li>
                <kbd className="kbd">←</kbd> / <kbd className="kbd">→</kbd> Move
              </li>
              <li>
                <kbd className="kbd">↓</kbd> Soft Drop
              </li>
              <li>
                <kbd className="kbd">↑</kbd> / <kbd className="kbd">X</kbd> Rotate Right
              </li>
              <li>
                <kbd className="kbd">Z</kbd> Rotate Left
              </li>
              <li>
                <kbd className="kbd">Space</kbd> Hard Drop
              </li>
              <li>
                <kbd className="kbd">P</kbd> Pause / Resume
              </li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        .kbd {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 1.6rem;
          padding: .125rem .375rem;
          border-radius: .5rem;
          background: rgba(255,255,255,.06);
          box-shadow: inset 0 -1px 0 rgba(255,255,255,.15), 0 1px 2px rgba(0,0,0,.25);
          font-size: .75rem;
          line-height: 1rem;
          font-weight: 600;
          border: 1px solid rgba(255,255,255,.15);
        }
      `}</style>
    </div>
  );
}

// ====== Small UI Components ======
function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wider text-slate-300/80">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function Overlay({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center rounded-xl bg-slate-900/70 backdrop-blur-sm">
      <div className="text-center">
        <div className="text-3xl font-bold tracking-tight mb-1">{label}</div>
        <div className="text-slate-300">{sub}</div>
      </div>
    </div>
  );
}

// ====== Canvas utils ======
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const min = Math.min(w, h) / 2;
  r = Math.min(r, min);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function shade(hex: string, percent: number) {
  // simple hex shade adjustment
  const num = parseInt(hex.replace("#", ""), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const t = (p: number) => Math.min(255, Math.max(0, Math.round(p)));
  const rr = t(r + (percent / 100) * 255);
  const gg = t(g + (percent / 100) * 255);
  const bb = t(b + (percent / 100) * 255);
  return `#${((1 << 24) + (rr << 16) + (gg << 8) + bb).toString(16).slice(1)}`;
}
