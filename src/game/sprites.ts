// Pixel-art sprites defined as strings. '.' = transparent.
// Edit PLAYER_PALETTE / PLAYER frames to re-skin the character.

export type Palette = Record<string, string>;

export const PLAYER_PALETTE: Palette = {
  h: "#2b1a10", // hair
  s: "#f3c99a", // skin
  e: "#17181f", // eyes
  t: "#2dd4bf", // hoodie
  d: "#0f766e", // hoodie shadow / pocket
  j: "#1e3a8a", // jeans
  k: "#f8fafc", // sneakers
  g: "#64748b", // sneaker sole
};

const P_HEAD = [
  "......hhhhh.....",
  ".....hhhhhhh....",
  ".....hhhhhhh....",
  ".....hsssssh....",
  ".....sessse.....",
  ".....ssssss.....",
  "......ssss......",
];

export const PLAYER = {
  idle: [
    ...P_HEAD,
    "....tttttttt....",
    "...tttttttttt...",
    "...tttddddttt...",
    "...stttttttts...",
    "....tttttttt....",
    "....jjjjjjjj....",
    "....jjj..jjj....",
    "....jjj..jjj....",
    "...kkkk..kkkk...",
  ],
  walk1: [
    ...P_HEAD,
    "....tttttttt....",
    "...tttttttttt...",
    "...tttddddttt...",
    "..s.tttttttt.s..",
    "....tttttttt....",
    "....jjjjjjjj....",
    "...jjj....jjj...",
    "...jjj....jjj...",
    "..kkkk....kkkk..",
  ],
  walk2: [
    ...P_HEAD,
    "....tttttttt....",
    "...tttttttttt...",
    "...tttddddttt...",
    "...stttttttts...",
    "....tttttttt....",
    "....jjjjjjjj....",
    ".....jjjjjj.....",
    ".....jjj.jj.....",
    "....kkkk.kkk....",
  ],
  jump: [
    "......hhhhh.....",
    ".....hhhhhhh....",
    ".....hhhhhhh....",
    ".....hsssssh....",
    ".....sessse.....",
    ".....ssssss.....",
    "..s...ssss...s..",
    "..s.tttttttt.s..",
    "...tttttttttt...",
    "...tttddddttt...",
    "....tttttttt....",
    "....tttttttt....",
    "....jjjjjjjj....",
    "...jjj....jjj...",
    "..kkkk....kkkk..",
    "................",
  ],
};

export const BUG_PALETTE: Palette = {
  b: "#ef4444",
  B: "#7f1d1d",
  w: "#ffffff",
  e: "#111111",
  l: "#111111",
  a: "#111111",
};

export const BUG = {
  walk1: [
    "...a........a...",
    "....a......a....",
    ".....BBBBBB.....",
    "....BbbbbbbB....",
    "...BbwebbwebB...",
    "...BbbbbbbbbB...",
    "...BbbBbbBbbB...",
    "...BbbbbbbbbB...",
    "....BbbbbbbB....",
    ".....BBBBBB.....",
    "...l..l..l..l...",
    "..l..l....l..l..",
  ],
  walk2: [
    "...a........a...",
    "....a......a....",
    ".....BBBBBB.....",
    "....BbbbbbbB....",
    "...BbwebbwebB...",
    "...BbbbbbbbbB...",
    "...BbbBbbBbbB...",
    "...BbbbbbbbbB...",
    "....BbbbbbbB....",
    ".....BBBBBB.....",
    "..l..l....l..l..",
    "...l..l..l..l...",
  ],
  squish: [
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "....BBBBBBBB....",
    "...BbwebbwebB...",
    "...BbbbbbbbbB...",
    "....BBBBBBBB....",
    "..l.l.l..l.l.l..",
    "................",
  ],
};

export const COIN_PALETTE: Palette = {
  o: "#fbbf24",
  O: "#b45309",
  y: "#fef3c7",
};

export const COIN = [
  [
    "..oooo..",
    ".oyyyoo.",
    "oyyOOyoo",
    "oyOOOOoo",
    "oyOOOOoo",
    "oyyOOyoo",
    ".ooooOo.",
    "..OOOO..",
  ],
  [
    "...oo...",
    "..oyyo..",
    "..oyOo..",
    "..oyOo..",
    "..oyOo..",
    "..oyOo..",
    "..oooo..",
    "...OO...",
  ],
  [
    "...oo...",
    "...yo...",
    "...yo...",
    "...yo...",
    "...yo...",
    "...yo...",
    "...oo...",
    "...OO...",
  ],
];

export const BLOCK_PALETTE: Palette = {
  C: "#0369a1",
  h: "#bae6fd",
  c: "#38bdf8",
  w: "#ffffff",
};

const BLOCK_INNER = [
  "hhhhhhhhhhhh",
  "cccccccccccc",
  "cc.ww..ww.cc",
  "cc.w....w.cc",
  "cc.w....w.cc",
  "ccww....wwcc",
  "cc.w....w.cc",
  "cc.w....w.cc",
  "cc.ww..ww.cc",
  "cccccccccccc",
  "cccccccccccc",
  "cccccccccccc",
  "CCCCCCCCCCCC",
];

export const BLOCK = [
  "CCCCCCCCCCCCCCCC",
  ...BLOCK_INNER.map((r) => "Ch" + r + "CC"),
  "CCCCCCCCCCCCCCCC",
  "CCCCCCCCCCCCCCCC",
];

export const BLOCK_USED_PALETTE: Palette = {
  C: "#1e293b",
  h: "#64748b",
  c: "#475569",
  w: "#475569",
};

export const STAR_PALETTE: Palette = { y: "#fde047", Y: "#ca8a04" };
export const STAR = [
  "...yy...",
  "...yy...",
  "yyyyyyyy",
  ".yyyyyy.",
  "..yyyy..",
  ".yyyyyy.",
  ".yy..yy.",
  "Y......Y",
];

export const CLOUD_PALETTE: Palette = { w: "#ffffff", s: "#dbeafe" };
export const CLOUD = [
  "........wwww............",
  "......wwwwwwww..........",
  "...wwwwwwwwwwwww........",
  "..wwwwwwwwwwwwwwwww.....",
  ".wwwwwwwwwwwwwwwwwwww...",
  "wwwwwwwwwwwwwwwwwwwwwww.",
  "wwwwwwwwwwwwwwwwwwwwwwww",
  ".ssssssssssssssssssssss.",
];

// ---- rasterizer -----------------------------------------------------------

const cache = new Map<string, HTMLCanvasElement>();

export function sprite(key: string, rows: string[], palette: Palette): HTMLCanvasElement {
  const hit = cache.get(key);
  if (hit) return hit;
  const w = rows[0].length;
  const h = rows.length;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < w; x++) {
      const ch = row[x];
      if (ch === "." || ch === undefined) continue;
      const col = palette[ch];
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(x, y, 1, 1);
    }
  }
  cache.set(key, c);
  return c;
}

export function flipped(key: string, src: HTMLCanvasElement): HTMLCanvasElement {
  const k = key + ":flip";
  const hit = cache.get(k);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = src.width;
  c.height = src.height;
  const g = c.getContext("2d")!;
  g.translate(src.width, 0);
  g.scale(-1, 1);
  g.drawImage(src, 0, 0);
  cache.set(k, c);
  return c;
}

export function clearSpriteCache() {
  cache.clear();
}
