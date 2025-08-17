"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";

/**
 * Snake (React + TypeScript + Canvas)
 * - Smooth animation with requestAnimationFrame + interpolation
 * - Wrap-around edges (FIXED: Visual continuity across boundaries)
 * - Prevent 180° instant reversal
 * - One active powerup at a time
 * - Powerups: speed, slow, frenzy (lots of food), shrink
 * - Game Over modal with Restart
 * - Visually polished: rounded "tube" snake, glowing food, rotating powerups
 */

// ===== Global, easy-to-tune powerup windows (ms) =====
export const POWERUP_DURATION: Record<PowerupType, number> = {
  speed: 8000,
  slow: 8000,
  frenzy: 6000,
  shrink: 0, // Shrink is instant/permanent, no duration
};

// ===== Board config =====
const CANVAS_SIZE = 560; // px (square)
const CELL = 20; // px per grid cell
const COLS = CANVAS_SIZE / CELL;
const ROWS = CANVAS_SIZE / CELL;

// Movement timing (ms per cell) — modified by powerups
const BASE_INTERVAL = 120; // lower = faster (feels smooth at ~120)

// Types
type Point = { x: number; y: number };
type Dir = { x: number; y: number };
type PowerupType = "speed" | "slow" | "frenzy" | "shrink";

const DIRS = {
  Up: { x: 0, y: -1 },
  Down: { x: 0, y: 1 },
  Left: { x: -1, y: 0 },
  Right: { x: 1, y: 0 },
} as const satisfies Record<string, Dir>;

function equal(a: Point, b: Point) {
  return a.x === b.x && a.y === b.y;
}

function wrap(p: Point): Point {
  return {
    x: (p.x + COLS) % COLS,
    y: (p.y + ROWS) % ROWS,
  };
}

function randomEmptyCell(blocked: Point[], attempts = 200): Point {
  for (let i = 0; i < attempts; i++) {
    const p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    if (!blocked.some((b) => equal(b, p))) return p;
  }
  // Fallback (shouldn't happen in normal play)
  return { x: 0, y: 0 };
}

function isOpposite(a: Dir, b: Dir) {
  return a.x + b.x === 0 && a.y + b.y === 0;
}

export default function SnakeGame() {
  // Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game state
  const [snake, setSnake] = useState<Point[]>([
    { x: 8, y: 8 },
    { x: 7, y: 8 },
    { x: 6, y: 8 },
  ]);
  const [foods, setFoods] = useState<Point[]>([{ x: 14, y: 10 }]);
  const [powerup, setPowerup] = useState<{ type: PowerupType; pos: Point } | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);

  // Timing
  const [intervalMs, setIntervalMs] = useState(BASE_INTERVAL);
  const lastTimeRef = useRef(0);
  const accRef = useRef(0);
  const lastStepSnakeRef = useRef<Point[]>(snake); // for interpolation

  // Direction handling (prevents instant 180° reversals)
  const currentDirRef = useRef<Dir>(DIRS.Right);
  const nextDirRef = useRef<Dir>(DIRS.Right);
  const inputLockedRef = useRef(false);

  // Powerup tracking
  const activePowerupRef = useRef<PowerupType | null>(null);
  const [activePowerup, setActivePowerup] = useState<PowerupType | null>(null);
  const powerupExpireRef = useRef<number | null>(null);
  const [powerupTimeLeft, setPowerupTimeLeft] = useState(0);
  const [pickupToast, setPickupToast] = useState<string | null>(null);

  // Add at the top with other state
  const [powerupSpawnTime, setPowerupSpawnTime] = useState<number | null>(null);

  // Restart / New game
  const restart = useCallback(() => {
    setSnake([
      { x: 8, y: 8 },
      { x: 7, y: 8 },
      { x: 6, y: 8 },
    ]);
    lastStepSnakeRef.current = [
      { x: 8, y: 8 },
      { x: 7, y: 8 },
      { x: 6, y: 8 },
    ];
    snakeRef.current = [
      { x: 8, y: 8 },
      { x: 7, y: 8 },
      { x: 6, y: 8 },
    ];
    setFoods([{ x: 14, y: 10 }]);
    setScore(0);
    setPowerup(null);
    clearPowerupEffect();
    setIntervalMs(BASE_INTERVAL);
    currentDirRef.current = DIRS.Right;
    nextDirRef.current = DIRS.Right;
    inputLockedRef.current = false;
    setGameOver(false);
    setPaused(false);
    setPowerupSpawnTime(null);
  }, []);

  // Refs to sync state -> refs for logic loop
  const snakeRef = useRef(snake);
  const foodsRef = useRef(foods);
  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);
  useEffect(() => {
    foodsRef.current = foods;
  }, [foods]);

  // Direction / Controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (e.key === "p" || e.key === "P") setPaused((p) => !p);
      let d: Dir | null = null;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") d = DIRS.Up;
      else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") d = DIRS.Down;
      else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") d = DIRS.Left;
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") d = DIRS.Right;

      if (d) {
        // Allow one turn per step and disallow 180° reversal
        if (!inputLockedRef.current && !isOpposite(d, currentDirRef.current)) {
          nextDirRef.current = d;
          inputLockedRef.current = true;
        }
      }

      if (e.key === " ") restart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gameOver, restart]);

  // Step logic (advance one cell)
  const step = () => {
    // apply queued direction
    currentDirRef.current = nextDirRef.current;

    const prev = snakeRef.current;
    lastStepSnakeRef.current = prev.map((p) => ({ ...p }));

    const headNext = wrap({
      x: prev[0].x + currentDirRef.current.x,
      y: prev[0].y + currentDirRef.current.y,
    });

    // build next snake
    const nextSnake = [headNext, ...prev];

    // eat food (check any)
    let ate = false;
    let foodsNow = foodsRef.current.slice();
    const idx = foodsNow.findIndex((f) => equal(f, headNext));
    if (idx >= 0) {
      ate = true;
      foodsNow.splice(idx, 1);
      setScore((s) => s + 10);

      // Randomly spawn a powerup (only if none on board and none active)
      if (!powerup && !activePowerupRef.current && Math.random() < 0.25) {
        spawnPowerup(nextSnake);
      }
    }

    if (!ate) nextSnake.pop();

    // self collision -> game over
    for (let i = 1; i < nextSnake.length; i++) {
      if (equal(nextSnake[i], headNext)) {
        setGameOver(true);
        return; // don't update snake further
      }
    }

    // pick up powerup
    if (powerup && equal(powerup.pos, headNext)) {
      // Handle shrink powerup before updating nextSnake
      if (powerup.type === "shrink") {
        // Apply shrink to current snake before continuing
        const shrinkAmount = 4;
        const newLength = Math.max(3, nextSnake.length - shrinkAmount);
        nextSnake.splice(newLength); // Trim the snake to new length

        // Show toast
        setPickupToast(getPowerupMessage(powerup.type));
        setTimeout(() => setPickupToast(null), 900);

        setPowerup(null);
        setPowerupSpawnTime(null);
      } else {
        // Handle other powerups normally
        triggerPowerup(powerup.type, nextSnake, foodsNow);
        setPowerup(null);
        setPowerupSpawnTime(null);
        // Don't update foodsNow here since triggerPowerup handles it
        setFoods(foodsRef.current); // Use the updated ref value
        setSnake(nextSnake);
        inputLockedRef.current = false;
        return; // Early return to avoid double food update
      }
    }

    // ensure at least one food always exists (but don't interfere with frenzy foods)
    if (foodsNow.length === 0) {
      foodsNow.push(randomEmptyCell(nextSnake));
    }

    setFoods(foodsNow);
    setSnake(nextSnake);
    inputLockedRef.current = false; // allow turn for next step
  };

  // Spawn powerup (avoid snake cells)
  function spawnPowerup(blockedBySnake: Point[]) {
    const types: PowerupType[] = ["speed", "slow", "frenzy", "shrink"];
    const type = types[Math.floor(Math.random() * types.length)];
    const pos = randomEmptyCell([...blockedBySnake, ...foodsRef.current]);
    setPowerup({ type, pos });
    setPowerupSpawnTime(performance.now());
  }

  // Add powerup expiration check in the main loop
  useEffect(() => {
    const checkPowerupExpiry = () => {
      if (powerup && powerupSpawnTime) {
        const elapsed = performance.now() - powerupSpawnTime;
        if (elapsed > 10000) {
          // 10 seconds to collect powerup
          setPowerup(null);
          setPowerupSpawnTime(null);
        }
      }
    };

    const timer = setInterval(checkPowerupExpiry, 100);
    return () => clearInterval(timer);
  }, [powerup, powerupSpawnTime]);

  // Activate a powerup (replaces existing) - now excludes shrink since it's handled inline
  function triggerPowerup(type: PowerupType, blockedBySnake: Point[], currentFoods: Point[]) {
    // reset existing effect
    clearPowerupEffect();

    activePowerupRef.current = type;
    setActivePowerup(type);
    powerupExpireRef.current = performance.now() + POWERUP_DURATION[type];
    setPowerupTimeLeft(Math.ceil(POWERUP_DURATION[type] / 1000));

    // toast
    setPickupToast(getPowerupMessage(type));
    setTimeout(() => setPickupToast(null), 900);

    // apply effect
    if (type === "speed") setIntervalMs(Math.max(60, BASE_INTERVAL * 0.55));
    if (type === "slow") setIntervalMs(BASE_INTERVAL * 1.8);
    if (type === "frenzy") {
      // Frenzy: spawn lots of extra food that persists until eaten or powerup expires
      const burstCount = 12;
      const blocked = [...blockedBySnake, ...currentFoods];
      const extraFoods: Point[] = [];

      for (let i = 0; i < burstCount; i++) {
        const pos = randomEmptyCell([...blocked, ...extraFoods]);
        extraFoods.push(pos);
      }

      // Update ref immediately and synchronously
      const newFoods = [...currentFoods, ...extraFoods];
      foodsRef.current = newFoods; // Update ref synchronously
      // Don't call setFoods here - let the caller handle it
    }
    // Note: shrink is now handled directly in the step() function
  }

  function clearPowerupEffect() {
    if (!activePowerupRef.current) return;

    const powerupType = activePowerupRef.current;

    // Only reset speed for speed/slow powerups
    if (powerupType === "speed" || powerupType === "slow") {
      setIntervalMs(BASE_INTERVAL);
    }

    // Clear frenzy foods when frenzy powerup expires
    if (powerupType === "frenzy") {
      // Remove all but one food when frenzy ends
      if (foodsRef.current.length > 1) {
        const remainingFood = foodsRef.current[0]; // Keep the first food
        setFoods([remainingFood]);
        foodsRef.current = [remainingFood];
      }
    }

    // Note: shrink powerup is handled immediately in triggerPowerup and doesn't need cleanup

    // Clear powerup tracking
    activePowerupRef.current = null;
    setActivePowerup(null);
    powerupExpireRef.current = null;
    setPowerupTimeLeft(0);
  }

  // Countdown + expiry check
  useEffect(() => {
    const timer = setInterval(() => {
      if (powerupExpireRef.current && activePowerupRef.current) {
        const rem = powerupExpireRef.current - performance.now();
        if (rem <= 0) {
          clearPowerupEffect();
        } else {
          setPowerupTimeLeft(Math.ceil(rem / 1000));
        }
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Main loop (rAF)
  useEffect(() => {
    let raf = 0;
    const loop = (t: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = t;
      const dt = t - lastTimeRef.current;
      lastTimeRef.current = t;

      if (!gameOver && !paused) {
        accRef.current += dt;
        while (accRef.current >= intervalMs) {
          accRef.current -= intervalMs;
          step();
        }
      }

      draw(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, gameOver, powerup, paused]);

  // FIXED: Drawing with proper wrap-around visibility
  function draw(time: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    const g = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE);
    g.addColorStop(0, "#0b1220");
    g.addColorStop(1, "#0a0f1a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Subtle grid
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let x = 1; x < COLS; x++) {
      const xx = x * CELL + 0.5;
      ctx.beginPath();
      ctx.moveTo(xx, 0);
      ctx.lineTo(xx, CANVAS_SIZE);
      ctx.stroke();
    }
    for (let y = 1; y < ROWS; y++) {
      const yy = y * CELL + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, yy);
      ctx.lineTo(CANVAS_SIZE, yy);
      ctx.stroke();
    }

    // Interpolation fraction [0..1]
    const frac = Math.min(1, accRef.current / Math.max(1, intervalMs));

    // Draw foods (glow + pulse)
    const pulse = 2 + Math.sin(time * 0.006) * 1.5;
    for (const f of foodsRef.current) {
      const cx = f.x * CELL + CELL / 2;
      const cy = f.y * CELL + CELL / 2;
      const r = CELL * 0.35 + pulse * 0.2;
      const rg = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
      rg.addColorStop(0, "#ffe08a");
      rg.addColorStop(1, "#fbbf24");
      ctx.save();
      ctx.shadowColor = "#facc15";
      ctx.shadowBlur = 18;
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw powerup (rotating diamond)
    if (powerup) {
      const cx = powerup.pos.x * CELL + CELL / 2;
      const cy = powerup.pos.y * CELL + CELL / 2;
      const size = CELL * 0.8;
      const angle = (time * 0.005) % (Math.PI * 2);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.fillStyle = getPowerupColor(powerup.type);
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(size / 2, 0);
      ctx.lineTo(0, size / 2);
      ctx.lineTo(-size / 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // ===== FIXED: Snake drawing with proper wrap-around =====
    drawSnake(ctx, time, frac);
  }

  // FIXED: New snake drawing function that handles wrap-around properly
  function drawSnake(ctx: CanvasRenderingContext2D, time: number, frac: number) {
    // Build interpolated positions without wrapping individually
    const interpolatedPoints: { x: number; y: number }[] = [];
    const prev = lastStepSnakeRef.current;
    const curr = snakeRef.current;
    const len = Math.max(prev.length, curr.length);

    for (let i = 0; i < len; i++) {
      const pa = prev[Math.min(i, prev.length - 1)] || prev[prev.length - 1];
      const pb = curr[Math.min(i, curr.length - 1)] || curr[curr.length - 1];

      // Convert to unwrapped pixel coordinates
      let ax = pa.x * CELL;
      let ay = pa.y * CELL;
      let bx = pb.x * CELL;
      let by = pb.y * CELL;

      // Handle wrapping by finding shortest path
      const canvasWidth = CELL * COLS;
      const canvasHeight = CELL * ROWS;

      const dx = bx - ax;
      const dy = by - ay;

      // Adjust for wrapping - choose shortest path
      if (Math.abs(dx) > canvasWidth / 2) {
        if (dx > 0) bx -= canvasWidth;
        else bx += canvasWidth;
      }
      if (Math.abs(dy) > canvasHeight / 2) {
        if (dy > 0) by -= canvasHeight;
        else by += canvasHeight;
      }

      // Interpolate
      const ix = ax + (bx - ax) * frac;
      const iy = ay + (by - ay) * frac;

      interpolatedPoints.push({
        x: ix + CELL / 2,
        y: iy + CELL / 2,
      });
    }

    if (interpolatedPoints.length === 0) return;

    // Find continuous segments of the snake
    const segments = [];
    let currentSegment = [interpolatedPoints[0]];

    const canvasWidth = CANVAS_SIZE;
    const canvasHeight = CANVAS_SIZE;

    for (let i = 1; i < interpolatedPoints.length; i++) {
      const prev = interpolatedPoints[i - 1];
      const curr = interpolatedPoints[i];

      // Check if there's a large jump (wrap-around)
      const dx = Math.abs(curr.x - prev.x);
      const dy = Math.abs(curr.y - prev.y);

      if (dx > CELL * 2 || dy > CELL * 2) {
        // Large jump detected - finish current segment and start new one
        if (currentSegment.length > 1) {
          segments.push(currentSegment);
        }
        currentSegment = [curr];
      } else {
        // Continue current segment
        currentSegment.push(curr);
      }
    }

    // Add the final segment
    if (currentSegment.length > 1) {
      segments.push(currentSegment);
    }

    // Draw each continuous segment, wrapping as needed
    for (let segIndex = 0; segIndex < segments.length; segIndex++) {
      const segment = segments[segIndex];
      if (segment.length < 2) continue;

      // For each segment, we may need to draw it in wrapped positions
      const wrapOffsets = [
        { x: 0, y: 0 }, // Original position
        { x: canvasWidth, y: 0 }, // Wrapped right
        { x: -canvasWidth, y: 0 }, // Wrapped left
        { x: 0, y: canvasHeight }, // Wrapped down
        { x: 0, y: -canvasHeight }, // Wrapped up
        { x: canvasWidth, y: canvasHeight }, // Wrapped right-down
        { x: -canvasWidth, y: canvasHeight }, // Wrapped left-down
        { x: canvasWidth, y: -canvasHeight }, // Wrapped right-up
        { x: -canvasWidth, y: -canvasHeight }, // Wrapped left-up
      ];

      for (const offset of wrapOffsets) {
        const wrappedSegment = segment.map((p) => ({
          x: p.x + offset.x,
          y: p.y + offset.y,
        }));

        // Check if any part of this wrapped segment is visible
        const isVisible = wrappedSegment.some(
          (p) =>
            p.x >= -CELL && p.x <= canvasWidth + CELL && p.y >= -CELL && p.y <= canvasHeight + CELL
        );

        if (!isVisible) continue;

        // Clip to canvas bounds
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, canvasWidth, canvasHeight);
        ctx.clip();

        // Draw segment outer stroke
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.lineWidth = CELL * 0.9;
        const lg = ctx.createLinearGradient(
          wrappedSegment[0].x,
          wrappedSegment[0].y,
          wrappedSegment[wrappedSegment.length - 1].x,
          wrappedSegment[wrappedSegment.length - 1].y
        );
        lg.addColorStop(0, "#34d399");
        lg.addColorStop(1, "#0ea5e9");
        ctx.strokeStyle = lg;
        ctx.beginPath();
        ctx.moveTo(wrappedSegment[0].x, wrappedSegment[0].y);
        for (let i = 1; i < wrappedSegment.length; i++) {
          ctx.lineTo(wrappedSegment[i].x, wrappedSegment[i].y);
        }
        ctx.stroke();

        // Draw segment inner core
        ctx.lineWidth = CELL * 0.5;
        ctx.strokeStyle = "rgba(255,255,255,0.22)";
        ctx.beginPath();
        ctx.moveTo(wrappedSegment[0].x, wrappedSegment[0].y);
        for (let i = 1; i < wrappedSegment.length; i++) {
          ctx.lineTo(wrappedSegment[i].x, wrappedSegment[i].y);
        }
        ctx.stroke();

        ctx.restore();
      }
    }

    // Draw head details (eyes and highlight) - only once for the actual head position
    const headSegment = segments[0];
    if (headSegment && headSegment.length > 0) {
      const head = headSegment[0];

      // Find the correct wrapped position for the head
      const wrapOffsets = [
        { x: 0, y: 0 },
        { x: canvasWidth, y: 0 },
        { x: -canvasWidth, y: 0 },
        { x: 0, y: canvasHeight },
        { x: 0, y: -canvasHeight },
      ];

      for (const offset of wrapOffsets) {
        const wrappedHead = {
          x: head.x + offset.x,
          y: head.y + offset.y,
        };

        // Check if this wrapped head position is visible and within bounds
        if (
          wrappedHead.x >= 0 &&
          wrappedHead.x <= canvasWidth &&
          wrappedHead.y >= 0 &&
          wrappedHead.y <= canvasHeight
        ) {
          ctx.save();

          // Small highlight circle
          const hr = CELL * 0.42;
          const hrg = ctx.createRadialGradient(
            wrappedHead.x - hr * 0.3,
            wrappedHead.y - hr * 0.3,
            2,
            wrappedHead.x,
            wrappedHead.y,
            hr
          );
          hrg.addColorStop(0, "rgba(255,255,255,0.35)");
          hrg.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = hrg;
          ctx.beginPath();
          ctx.arc(wrappedHead.x, wrappedHead.y, hr, 0, Math.PI * 2);
          ctx.fill();

          // Eyes based on current direction
          const d = currentDirRef.current;
          const ex = wrappedHead.x + d.x * CELL * 0.18;
          const ey = wrappedHead.y + d.y * CELL * 0.18;
          const offX = -d.y * CELL * 0.18;
          const offY = d.x * CELL * 0.18;
          const rEye = CELL * 0.12;
          const pupil = CELL * 0.07;

          // Left eye
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(ex + offX, ey + offY, rEye, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#111827";
          ctx.beginPath();
          ctx.arc(ex + offX, ey + offY, pupil, 0, Math.PI * 2);
          ctx.fill();

          // Right eye
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(ex - offX, ey - offY, rEye, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#111827";
          ctx.beginPath();
          ctx.arc(ex - offX, ey - offY, pupil, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
          break; // Only draw head once
        }
      }
    }
  }

  return (
    <div className="h-full w-full text-white flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-[900px] grid grid-cols-1 lg:grid-cols-[auto_260px] gap-6">
        {/* Game Card */}
        <div className="relative rounded-2xl p-4 bg-slate-900/70 ring-1 ring-white/10 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-semibold tracking-tight">Snake</h1>
            <div className="flex gap-2">
              <button
                onClick={restart}
                className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 transition active:scale-[.98]"
              >
                Restart
              </button>
            </div>
          </div>

          <div className="relative">
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="block mx-auto rounded-xl ring-1 ring-white/10 bg-slate-900"
            />

            {/* Toast for pickups */}
            {pickupToast && (
              <div className="pointer-events-none absolute inset-x-0 -top-6 flex justify-center">
                <div className="px-3 py-1 rounded-full bg-amber-400/90 text-slate-900 font-semibold shadow">
                  {pickupToast}
                </div>
              </div>
            )}

            {/* Game Over modal */}
            {gameOver && (
              <div className="absolute inset-0 grid place-items-center rounded-xl bg-slate-900/80 backdrop-blur-sm">
                <div className="w-full max-w-sm rounded-2xl bg-slate-800 ring-1 ring-white/10 p-6 text-center shadow-2xl">
                  <div className="text-2xl font-bold mb-2">Game Over</div>
                  <div className="text-slate-300 mb-4">Score: {score}</div>
                  <button
                    onClick={restart}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold shadow active:scale-[.98]"
                  >
                    Restart
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* PAUSE MODAL */}
          {paused && (
            <div className="absolute inset-0 grid place-items-center rounded-xl bg-slate-900/80 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-2xl bg-slate-800 ring-1 ring-white/10 p-6 text-center shadow-2xl">
                <div className="text-2xl font-bold mb-2">Paused</div>
                <div className="text-slate-300 mb-4">Score: {score}</div>
                <button
                  onClick={() => setPaused(false)}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold shadow active:scale-[.98]"
                >
                  Resume
                </button>
              </div>
            </div>
          )}

          {/* HUD */}
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <Stat label="Score" value={score.toLocaleString()} />
            <Stat label="Speed" value={`${Math.round(1000 / intervalMs)} /s`} />
            <Stat
              label="Powerup"
              value={
                activePowerup ? (
                  <div className="flex items-center gap-2 w-full">
                    <span>{getPowerupLabel(activePowerup)}</span>
                    <div className="relative h-2 flex-1 rounded bg-white/10 overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-amber-400"
                        style={{
                          width: `${
                            (powerupTimeLeft / (POWERUP_DURATION[activePowerup] / 1000)) * 100
                          }%`,
                          transition: "width 100ms linear",
                        }}
                      />
                    </div>
                    <span className="tabular-nums">{powerupTimeLeft}s</span>
                  </div>
                ) : (
                  <span className="text-slate-400">—</span>
                )
              }
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl p-4 bg-slate-900/70 ring-1 ring-white/10 shadow-xl backdrop-blur">
            <h2 className="text-sm uppercase tracking-wider text-slate-300/80 mb-2">How to Play</h2>
            <ul className="space-y-1.5 text-slate-300/90 text-sm">
              <li>
                <kbd className="kbd">W</kbd>/<kbd className="kbd">↑</kbd> Up
              </li>
              <li>
                <kbd className="kbd">S</kbd>/<kbd className="kbd">↓</kbd> Down
              </li>
              <li>
                <kbd className="kbd">A</kbd>/<kbd className="kbd">←</kbd> Left
              </li>
              <li>
                <kbd className="kbd">D</kbd>/<kbd className="kbd">→</kbd> Right
              </li>
              <li>
                <kbd className="kbd">Space</kbd> Restart
              </li>
              <li>
                <kbd className="kbd">P</kbd> Pause/Resume
              </li>
            </ul>
          </div>

          <div className="rounded-2xl p-4 bg-slate-900/70 ring-1 ring-white/10 shadow-xl backdrop-blur">
            <h2 className="text-sm uppercase tracking-wider text-slate-300/80 mb-2">Powerups</h2>
            <ul className="space-y-1.5 text-slate-300/90 text-sm">
              <li>
                <span
                  className="inline-block w-3 h-3 align-middle rounded-sm mr-2"
                  style={{ backgroundColor: getPowerupColor("speed") }}
                />
                ⚡ Speed — faster snake
              </li>
              <li>
                <span
                  className="inline-block w-3 h-3 align-middle rounded-sm mr-2"
                  style={{ backgroundColor: getPowerupColor("slow") }}
                />
                🐌 Slow — slower snake
              </li>
              <li>
                <span
                  className="inline-block w-3 h-3 align-middle rounded-sm mr-2"
                  style={{ backgroundColor: getPowerupColor("frenzy") }}
                />
                🍏 Frenzy — lots of food
              </li>
              <li>
                <span
                  className="inline-block w-3 h-3 align-middle rounded-sm mr-2"
                  style={{ backgroundColor: getPowerupColor("shrink") }}
                />
                ✂️ Shrink — trims the tail
              </li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        .kbd {display:inline-flex;align-items:center;justify-content:center;min-width:1.6rem;padding:.125rem .375rem;border-radius:.5rem;background:rgba(255,255,255,.06);box-shadow:inset 0 -1px 0 rgba(255,255,255,.15), 0 1px 2px rgba(0,0,0,.25);font-size:.75rem;line-height:1rem;font-weight:600;border:1px solid rgba(255,255,255,.15)}
      `}</style>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wider text-slate-300/80">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

// Helpers (visual + labels)
function getPowerupColor(type: PowerupType) {
  switch (type) {
    case "speed":
      return "#3b82f6";
    case "slow":
      return "#a78bfa";
    case "frenzy":
      return "#ef4444";
    case "shrink":
      return "#f472b6";
  }
}

function getPowerupLabel(type: PowerupType) {
  switch (type) {
    case "speed":
      return "⚡ Speed";
    case "slow":
      return "🐌 Slow";
    case "frenzy":
      return "🍏 Frenzy";
    case "shrink":
      return "✂️ Shrink";
  }
}

function getPowerupMessage(type: PowerupType) {
  switch (type) {
    case "speed":
      return "⚡ Speed Up!";
    case "slow":
      return "🐌 Slowed Down!";
    case "frenzy":
      return "🍏 Food Frenzy!";
    case "shrink":
      return "✂️ Shrink Snake!";
  }
}
