import { site } from "@content/site";
import { CELL, createGrid, piecePath, splatters } from "@/lib/puzzle";
import { cn } from "@/lib/utils";

/**
 * «Пазл поступления» в hero: чернильные детали, на каждой — элемент заявки.
 * В центре не хватает последней детали — она парит рядом: «Оффер».
 * Всё нарисовано в SVG, подписи берутся из content/site.ts.
 */

const { pieces: labels, missing, loose: looseLabels } = site.hero.puzzle;

const ROWS = 6;
const COLS = 6;
const grid = createGrid(ROWS, COLS, 11);

/** Какие клетки 6×6 заняты деталями (кольцо с дырой в центре). */
const MASK = [
  ".XXXX.",
  "XXXXXX",
  "XX..XX",
  "XX..XX",
  "XXXXXX",
  ".XX.X.",
];

/**
 * Клетка для каждой подписи (в порядке content/site.ts → hero.puzzle.pieces).
 * Длинные слова стоят на деталях без выемок по бокам — там больше места.
 */
const LABEL_CELLS: [number, number][] = [
  [1, 2], [1, 3], [2, 1], [2, 4], [3, 1], [3, 4], [4, 3], [4, 2],
  [0, 2], [3, 0], [2, 5], [5, 2], [1, 5], [4, 0], [0, 3], [1, 0],
];

/**
 * Выпавшие детали: клетка-образец (форма), сдвиг, поворот, тон.
 * Стоят у пустых углов пазла — так они видны и на телефоне.
 * Подписи — content/site.ts → hero.puzzle.loose (по порядку).
 */
const LOOSE = [
  { r: 0, c: 4, x: 108, y: -58, rot: 13, light: true },
  { r: 5, c: 2, x: 66, y: 142, rot: -12, light: false },
  { r: 3, c: 0, x: -6, y: 232, rot: -20, light: true },
];

/** Парящая деталь «Оффер» — форма центральной клетки. */
const OFFER = { r: 2, c: 2, x: 52, y: 44, rot: -9 };

type Placed = { r: number; c: number; d: string; label?: { title: string; sub?: string } };

const placed: Placed[] = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    if (MASK[r][c] === "X") placed.push({ r, c, d: piecePath(grid, r, c) });
  }
}
LABEL_CELLS.forEach(([r, c], i) => {
  const piece = placed.find((p) => p.r === r && p.c === c);
  if (piece && labels[i]) piece.label = labels[i];
});

const SIZE = ROWS * CELL;
const PAD = 90;
const VIEW = `${-PAD} ${-PAD} ${SIZE + PAD * 2} ${SIZE + PAD * 2}`;
const dots = splatters(46, 5, { x: -PAD, y: -PAD, w: SIZE + PAD * 2, h: SIZE + PAD * 2 }).filter(
  // брызги только по краям, не поверх пазла
  (d) => d.cx < -10 || d.cx > SIZE + 10 || d.cy < -10 || d.cy > SIZE + 10,
);

/** Подпись без переносов — для aria-label. */
const plain = (title: string) => title.replace(/-\n/g, "").replace(/\n/g, " ");

/** Глубина выемки соседней детали и боковой отступ текста (в единицах клетки). */
const BLANK = 27;
const MARGIN = 7;
/** Средняя ширина символа Inter (полужирный) в долях кегля. */
const CHAR = 0.65;

function PieceLabel({
  r,
  c,
  label,
  color = "var(--color-canvas)",
}: {
  r: number;
  c: number;
  label: { title: string; sub?: string };
  color?: string;
}) {
  // Выемки слева/справа «съедают» место — сдвигаем и при необходимости уменьшаем текст
  const leftBlank = grid.v[r][c] === 1;
  const rightBlank = grid.v[r][c + 1] === -1;
  const x0 = c * CELL + (leftBlank ? BLANK : MARGIN);
  const x1 = (c + 1) * CELL - (rightBlank ? BLANK : MARGIN);
  const cx = (x0 + x1) / 2;
  const cy = r * CELL + CELL / 2;
  const avail = x1 - x0;
  const lines = label.title.split("\n");
  const longest = Math.max(...lines.map((l) => l.length));
  const fit = (base: number) => Math.min(base, avail / (longest * CHAR));

  if (label.sub) {
    const size = fit(21);
    return (
      <g textAnchor="middle" fill={color}>
        <text x={cx} y={cy + 1} fontSize={size} fontWeight={700} letterSpacing="-0.01em">
          {label.title}
        </text>
        <text x={cx} y={cy + 18} fontSize={11.5} fontWeight={500} opacity={0.85} className="max-lg:hidden">
          {label.sub}
        </text>
      </g>
    );
  }

  const size = fit(lines.length > 1 || longest > 6 ? 14.5 : 19);
  const lineHeight = size * 1.15;
  const firstY = cy + size * 0.36 - ((lines.length - 1) * lineHeight) / 2;
  return (
    <g textAnchor="middle" fill={color}>
      <text fontSize={size} fontWeight={700} letterSpacing="-0.01em">
        {lines.map((line, i) => (
          <tspan key={i} x={cx} y={firstY + i * lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

export function AdmissionPuzzle({ className }: { className?: string }) {
  const description = `Пазл поступления: ${labels.map((l) => plain(l.title)).join(", ")}. Рядом — ${looseLabels.map(plain).join(", ").toLowerCase()}. Не хватает последней детали — «${missing}».`;

  return (
    <svg viewBox={VIEW} overflow="visible" className={cn("h-auto w-full overflow-visible font-sans", className)} role="img" aria-label={description}>
      <defs>
        {/* Чернильная текстура: светлые размывы + мелкое зерно */}
        <filter id="pz-wash" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="4" seed="4" />
          <feColorMatrix values="0 0 0 0 0.96  0 0 0 0 0.96  0 0 0 0 0.94  0 0 0 2.1 -1.05" />
        </filter>
        <filter id="pz-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="9" />
          <feColorMatrix values="0 0 0 0 0.07  0 0 0 0 0.07  0 0 0 0 0.07  0 0 0 1.6 -0.62" />
        </filter>
        <filter id="pz-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="18" stdDeviation="16" style={{ floodColor: "var(--color-ink)", floodOpacity: 0.28 }} />
        </filter>
        <clipPath id="pz-clip">
          {placed.map((p) => (
            <path key={`${p.r}-${p.c}`} d={p.d} />
          ))}
        </clipPath>
      </defs>

      {/* Брызги */}
      <g fill="var(--color-ink)">
        {dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.r} opacity={d.o} />
        ))}
      </g>

      {/* Основное поле: заливка + текстура, обрезанные по контурам деталей */}
      <g clipPath="url(#pz-clip)">
        <rect x={-PAD} y={-PAD} width={SIZE + PAD * 2} height={SIZE + PAD * 2} fill="var(--color-ink-soft)" />
        <rect x={-PAD} y={-PAD} width={SIZE + PAD * 2} height={SIZE + PAD * 2} filter="url(#pz-wash)" opacity={0.55} />
        <rect x={-PAD} y={-PAD} width={SIZE + PAD * 2} height={SIZE + PAD * 2} filter="url(#pz-grain)" />
      </g>

      {/* Швы между деталями */}
      <g fill="none" stroke="var(--color-canvas)" strokeWidth={2.4} strokeLinejoin="round">
        {placed.map((p) => (
          <path key={`${p.r}-${p.c}`} d={p.d} />
        ))}
      </g>

      {/* Подписи */}
      {placed.map((p) => (p.label ? <PieceLabel key={`${p.r}-${p.c}`} r={p.r} c={p.c} label={p.label} /> : null))}

      {/* Выпавшие детали с личными качествами */}
      {LOOSE.map((l, i) => {
        const cx = l.c * CELL + CELL / 2;
        const cy = l.r * CELL + CELL / 2;
        const title = looseLabels[i];
        return (
          <g key={i} transform={`translate(${l.x} ${l.y})`}>
            <g className="animate-float motion-reduce:animate-none" style={{ animationDelay: `${-i * 2.3}s` }}>
              <g transform={`rotate(${l.rot} ${cx} ${cy})`}>
                <path
                  d={piecePath(grid, l.r, l.c)}
                  fill={l.light ? "var(--color-line-strong)" : "var(--color-ink-soft)"}
                  stroke={l.light ? "var(--color-subtle)" : "none"}
                  strokeWidth={1}
                />
                {title && (
                  <PieceLabel
                    r={l.r}
                    c={l.c}
                    label={{ title }}
                    color={l.light ? "var(--color-ink)" : "var(--color-canvas)"}
                  />
                )}
              </g>
            </g>
          </g>
        );
      })}

      {/* Недостающая деталь: «Оффер» */}
      <g transform={`translate(${OFFER.x} ${OFFER.y})`}>
        <g className="animate-float motion-reduce:animate-none">
          <g
            transform={`rotate(${OFFER.rot} ${OFFER.c * CELL + CELL / 2} ${OFFER.r * CELL + CELL / 2})`}
            filter="url(#pz-shadow)"
          >
            <path d={piecePath(grid, OFFER.r, OFFER.c)} fill="var(--color-surface)" stroke="var(--color-line)" strokeWidth={1} />
            <text
              x={OFFER.c * CELL + CELL / 2}
              y={OFFER.r * CELL + CELL / 2 + 8}
              textAnchor="middle"
              fontSize={25}
              fontStyle="italic"
              fontWeight={600}
              fill="var(--color-ink)"
              className="font-serif"
            >
              {missing}
            </text>
            <path
              transform={`translate(${OFFER.c * CELL + CELL / 2 - 6} ${OFFER.r * CELL + 14}) scale(0.5)`}
              d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z"
              fill="var(--color-ink)"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}
