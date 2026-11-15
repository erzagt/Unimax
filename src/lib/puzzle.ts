/**
 * Геометрия пазла для hero: генерирует SVG-контуры деталей с «ушками».
 * Детерминированно (сид), чтобы сервер и браузер рисовали одно и то же.
 */

export const CELL = 100;

/** Простой детерминированный ГПСЧ. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Pt = [number, number];

/**
 * Форма ушка в нормированных координатах: t — вдоль ребра (0..1),
 * h — от ребра наружу (в долях ребра). Последовательность кубических кривых.
 */
const KNOB: [Pt, Pt, Pt][] = [
  [[0.42, 0], [0.44, 0.06], [0.39, 0.12]],
  [[0.33, 0.2], [0.4, 0.27], [0.5, 0.27]],
  [[0.6, 0.27], [0.67, 0.2], [0.61, 0.12]],
  [[0.56, 0.06], [0.58, 0], [0.65, 0]],
];

const f = (n: number) => Math.round(n * 10) / 10;

/** Ребро от A к B; sign: 1 — ушко наружу, -1 — выемка, 0 — прямое. */
function edge(a: Pt, b: Pt, sign: number, jitter: number) {
  if (sign === 0) return `L${f(b[0])} ${f(b[1])}`;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  // Внешняя нормаль при обходе по часовой стрелке (ось y вниз)
  const nx = dy;
  const ny = -dx;
  const p = (t: number, h: number): string => {
    const tt = t + jitter;
    return `${f(a[0] + dx * tt + nx * h * sign)} ${f(a[1] + dy * tt + ny * h * sign)}`;
  };
  const start = p(0.35, 0);
  const curves = KNOB.map(([c1, c2, e]) => `C${p(...c1)} ${p(...c2)} ${p(...e)}`).join(" ");
  return `L${start} ${curves} L${f(b[0])} ${f(b[1])}`;
}

export type PuzzleGrid = {
  rows: number;
  cols: number;
  /** Знаки ушек на вертикальных рёбрах [r][c] между c и c+1 */
  v: number[][];
  /** Знаки ушек на горизонтальных рёбрах [r][c] между r и r+1 */
  h: number[][];
  /** Небольшие сдвиги ушек вдоль ребра, чтобы детали не были одинаковыми */
  vj: number[][];
  hj: number[][];
};

export function createGrid(rows: number, cols: number, seed = 7): PuzzleGrid {
  const rnd = mulberry32(seed);
  const sign = () => (rnd() > 0.5 ? 1 : -1);
  const jit = () => (rnd() - 0.5) * 0.1;
  const v = Array.from({ length: rows }, () => Array.from({ length: cols + 1 }, sign));
  const h = Array.from({ length: rows + 1 }, () => Array.from({ length: cols }, sign));
  const vj = Array.from({ length: rows }, () => Array.from({ length: cols + 1 }, jit));
  const hj = Array.from({ length: rows + 1 }, () => Array.from({ length: cols }, jit));
  return { rows, cols, v, h, vj, hj };
}

/**
 * Контур детали (r, c). Рёбра решётки индексируются так, что внешние
 * края тоже получают ушки — как у деталей, вынутых из большого пазла.
 */
export function piecePath(g: PuzzleGrid, r: number, c: number) {
  const x0 = c * CELL;
  const y0 = r * CELL;
  const x1 = x0 + CELL;
  const y1 = y0 + CELL;
  // Знак ребра: «+» — ушко принадлежит детали сверху/слева и торчит вниз/вправо
  const top = -g.h[r][c];
  const right = g.v[r][c + 1];
  const bottom = g.h[r + 1][c];
  const left = -g.v[r][c];
  return [
    `M${x0} ${y0}`,
    edge([x0, y0], [x1, y0], top, g.hj[r][c]),
    edge([x1, y0], [x1, y1], right, g.vj[r][c + 1]),
    edge([x1, y1], [x0, y1], bottom, -g.hj[r + 1][c]),
    edge([x0, y1], [x0, y0], left, -g.vj[r][c]),
    "Z",
  ].join(" ");
}

/** Псевдослучайные чернильные брызги вокруг пазла. */
export function splatters(count: number, seed: number, area: { x: number; y: number; w: number; h: number }) {
  const rnd = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    cx: f(area.x + rnd() * area.w),
    cy: f(area.y + rnd() * area.h),
    r: f(0.6 + rnd() * rnd() * 4.5),
    o: f(0.35 + rnd() * 0.6),
  }));
}
