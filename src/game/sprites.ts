// Pixel-art sprites defined as strings. '.' = transparent.
// Edit PLAYER_PALETTE / PLAYER frames to re-skin the character.

export type Palette = Record<string, string>;

export const PLAYER_PALETTE: Palette = {
  H: "#f9dfc4", // shiny bald highlight
  s: "#f0c3a0", // skin
  S: "#d9a27a", // skin shadow (nose, neck)
  u: "#b98a68", // stubble
  b: "#3a2a1e", // eyebrows
  e: "#1a1410", // eyes
  r: "#c0392b", // lips
  t: "#ffffff", // teeth
  T: "#cbd5e1", // teeth gaps
  j: "#23272f", // jacket
  J: "#0f1115", // jacket shadow
  z: "#9ca3af", // zipper
  p: "#1e3a8a", // jeans
  w: "#f8fafc", // sneakers
};

// 16x20 caricature: bald, thick eyebrows, giant toothy grin, stubble, black jacket.
const P_HEAD = [
  ".....HHHHHH.....",
  "....sHHHHHHs....",
  "...ssssssssss...",
  "...ssssssssss...",
  "...sbbbssbbbs...",
  "...sseesseess...",
  "...ssssSSssss...",
  "...rssssssssr...",
  "...srttttttrs...",
  "....rtTtTtTr....",
  ".....uuuuuu.....",
  "......uuuu......",
];

export const PLAYER = {
  idle: [
    ...P_HEAD,
    "....jjjjjjjj....",
    "...jjjjzzjjjj...",
    "..sjjjjzzjjjjs..",
    "...jJjjzzjjJj...",
    "....pppppppp....",
    "....ppp..ppp....",
    "....ppp..ppp....",
    "...wwww..wwww...",
  ],
  walk1: [
    ...P_HEAD,
    "....jjjjjjjj....",
    "...jjjjzzjjjj...",
    "..s.jjjzzjjj.s..",
    "...jJjjzzjjJj...",
    "....pppppppp....",
    "...ppp....ppp...",
    "...ppp....ppp...",
    "..wwww....wwww..",
  ],
  walk2: [
    ...P_HEAD,
    "....jjjjjjjj....",
    "...jjjjzzjjjj...",
    "..sjjjjzzjjjjs..",
    "...jJjjzzjjJj...",
    "....pppppppp....",
    ".....pppppp.....",
    ".....ppp.pp.....",
    "....wwww.www....",
  ],
  jump: [
    ".....HHHHHH.....",
    "....sHHHHHHs....",
    "...ssssssssss...",
    "...ssssssssss...",
    "...sbbbssbbbs...",
    "...sseesseess...",
    "...ssssSSssss...",
    "...rssssssssr...",
    "...srttttttrs...",
    "..s.rtTtTtTr.s..",
    "..s..uuuuuu..s..",
    "..s...uuuu...s..",
    "..sjjjjjjjjjjs..",
    "...jjjjzzjjjj...",
    "...jjjjzzjjjj...",
    "...jJjjzzjjJj...",
    "....pppppppp....",
    "...ppp....ppp...",
    "..wwww....wwww..",
    "................",
  ],
  throw: [
    ...P_HEAD,
    "....jjjjjjjj....",
    "...jjjjzzjjjjss.",
    "..sjjjjzzjjjjjs.",
    "...jJjjzzjjJj...",
    "....pppppppp....",
    "....ppp..ppp....",
    "....ppp..ppp....",
    "...wwww..wwww...",
  ],
};

export const BIRD_PALETTE: Palette = {
  g: "#6b7280", // body grey (NYC pigeon)
  G: "#374151", // wing / shadow
  w: "#f9fafb", // belly
  e: "#111827", // eye
  o: "#f59e0b", // beak
  i: "#7c3aed", // neck iridescence
};

export const BIRD = {
  up: [
    "......GGGG......",
    ".....GGGGGG.....",
    "....GGGG.GGG....",
    "...gggggggggg...",
    "..gigggggggggeo.",
    "..ggwwwwwwggggo.",
    "...wwwwwwwwgg...",
    "....wwwwww......",
    ".....ww.ww......",
    "................",
  ],
  down: [
    "................",
    "................",
    "....ggggggggg...",
    "...gggggggggg...",
    "..gigggggggggeo.",
    "..ggwwwwwwggggo.",
    "...wwGGGGwwwg...",
    "....GGGGGG......",
    ".....GGGG.......",
    "......GG........",
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
