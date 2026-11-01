import { EXPERIENCE, PROJECTS, SKILLS } from "../data/content";

export const TILE = 16;
export const ROWS = 14;
export const COLS = 296;
export const LEVEL_W = COLS * TILE;
export const LEVEL_H = ROWS * TILE;
export const GROUND_ROW = 11; // first solid ground row (y = 176)

export const T_EMPTY = 0;
export const T_GROUND = 1;
export const T_BRICK = 2;
export const T_BLOCK = 3;
export const T_BLOCK_USED = 4;
export const T_STAIR = 5;

export type Zone = "start" | "experience" | "skills" | "projects" | "education" | "deploy";

export const ZONES: { zone: Zone; from: number; to: number; label: string; world: string }[] = [
  { zone: "start", from: 0, to: 31, label: "START", world: "1-1" },
  { zone: "experience", from: 31, to: 119, label: "EXPERIENCE", world: "2-1" },
  { zone: "skills", from: 119, to: 179, label: "SKILLS", world: "3-1" },
  { zone: "projects", from: 179, to: 239, label: "PROJECTS", world: "4-1" },
  { zone: "education", from: 239, to: 259, label: "EDUCATION", world: "5-1" },
  { zone: "deploy", from: 259, to: COLS, label: "DEPLOY", world: "6-1" },
];

export function zoneAt(col: number) {
  for (const z of ZONES) if (col >= z.from && col < z.to) return z;
  return ZONES[ZONES.length - 1];
}

export type SignSpawn = { col: number; id: string; label: string; sub?: string; auto: boolean };
export type DoorSpawn = { col: number; id: string; label: string };
export type CoinSpawn = { col: number; row: number };
export type BugSpawn = { col: number };
export type BirdSpawn = { col: number; row: number };

export interface LevelData {
  grid: Uint8Array;
  blocks: Map<number, string>; // tile index -> skill id
  signs: SignSpawn[];
  doors: DoorSpawn[];
  coins: CoinSpawn[];
  bugs: BugSpawn[];
  birds: BirdSpawn[];
  flagCol: number;
  playerCol: number;
}

export function idx(col: number, row: number) {
  return row * COLS + col;
}

export function buildLevel(): LevelData {
  const grid = new Uint8Array(COLS * ROWS);
  const blocks = new Map<number, string>();
  const signs: SignSpawn[] = [];
  const doors: DoorSpawn[] = [];
  const coins: CoinSpawn[] = [];
  const bugs: BugSpawn[] = [];
  const birds: BirdSpawn[] = [];
  const bird = (col: number, row: number) => birds.push({ col, row });

  const set = (c: number, r: number, t: number) => {
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return;
    grid[idx(c, r)] = t;
  };
  const ground = (from: number, to: number) => {
    for (let c = from; c <= to; c++) for (let r = GROUND_ROW; r < ROWS; r++) set(c, r, T_GROUND);
  };
  const bricks = (from: number, to: number, row: number) => {
    for (let c = from; c <= to; c++) set(c, row, T_BRICK);
  };
  const block = (c: number, r: number, skillId: string) => {
    set(c, r, T_BLOCK);
    blocks.set(idx(c, r), skillId);
  };
  const coinRow = (from: number, to: number, row: number) => {
    for (let c = from; c <= to; c++) coins.push({ col: c, row });
  };
  const coinArc = (from: number, rows: number[]) => {
    rows.forEach((r, i) => coins.push({ col: from + i, row: r }));
  };
  const stairs = (from: number, steps: number) => {
    for (let i = 0; i < steps; i++) {
      for (let h = 0; h <= i; h++) set(from + i, GROUND_ROW - 1 - h, T_STAIR);
    }
  };

  // ---------------- START (0-30) ----------------
  ground(0, 30);
  signs.push({ col: 9, id: "about", label: "ABOUT ME", sub: "START", auto: true });
  bricks(18, 20, 8);
  coinRow(18, 20, 6);
  coinArc(13, [8, 7, 8]);
  bugs.push({ col: 25 });
  bird(28, 6);

  // ---------------- EXPERIENCE (31-118) ----------------
  ground(31, 47);
  // pit 48-49
  ground(50, 79);
  // pit 80-82
  ground(83, 118);

  const exp = EXPERIENCE;
  signs.push({ col: 38, id: exp[0].id, label: exp[0].company.toUpperCase(), sub: exp[0].level, auto: true });
  bugs.push({ col: 44 });
  bird(50, 5);
  coinArc(46, [8, 7, 7, 8]); // over the pit
  bricks(52, 55, 8);
  coinRow(52, 55, 6);
  signs.push({ col: 59, id: exp[1].id, label: exp[1].company.toUpperCase(), sub: exp[1].level, auto: true });
  bugs.push({ col: 64 });
  bugs.push({ col: 67 });
  bricks(69, 71, 7);
  coinRow(69, 71, 5);
  signs.push({ col: 75, id: exp[2].id, label: "RIGOSIS", sub: exp[2].level, auto: true });
  bugs.push({ col: 78 });
  bird(72, 4);
  bird(86, 6);
  coinArc(79, [8, 7, 6, 7, 8]); // over the 3-wide pit
  signs.push({ col: 88, id: exp[3].id, label: "FREELANCE", sub: exp[3].level, auto: true });
  bricks(92, 94, 8);
  coinRow(92, 94, 6);
  bugs.push({ col: 98 });
  signs.push({ col: 103, id: exp[4].id, label: exp[4].company.toUpperCase(), sub: exp[4].level, auto: true });
  bugs.push({ col: 108 });
  bird(100, 5);
  bird(114, 6);
  coinArc(110, [8, 7, 6, 7, 8]);

  // ---------------- SKILLS (119-178) ----------------
  ground(119, 178);
  signs.push({ col: 122, id: "skills-intro", label: "SKILLS", sub: "WORLD 3", auto: true });
  const frontend = SKILLS.filter((s) => s.group === "Frontend");
  const backend = SKILLS.filter((s) => s.group === "Backend");
  const tools = SKILLS.filter((s) => s.group === "Tools");
  frontend.forEach((s, i) => block(127 + i * 2, 8, s.id));
  bugs.push({ col: 132 });
  backend.forEach((s, i) => block(141 + i * 2, 8, s.id));
  bugs.push({ col: 145 });
  bird(137, 3);
  bird(152, 4);
  tools.forEach((s, i) => block(155 + i * 2, 8, s.id));
  coinRow(127, 135, 5);
  coinRow(141, 149, 5);
  coinRow(155, 159, 5);
  bricks(165, 168, 8);
  coinRow(165, 168, 6);
  bugs.push({ col: 171 });
  bird(168, 6);

  // ---------------- PROJECTS (179-238) ----------------
  ground(179, 190);
  // pit 191-192
  ground(193, 203);
  // pit 204-206
  ground(207, 216);
  // pit 217-218
  ground(219, 238);
  signs.push({ col: 182, id: "projects-intro", label: "PROJECTS", sub: "WORLD 4", auto: true });
  doors.push({ col: 187, id: PROJECTS[0].id, label: PROJECTS[0].container });
  coinArc(190, [8, 7, 7, 8]);
  doors.push({ col: 199, id: PROJECTS[1].id, label: PROJECTS[1].container });
  bugs.push({ col: 196 });
  bird(194, 5);
  bird(208, 4);
  coinArc(203, [8, 7, 6, 7, 8]);
  doors.push({ col: 211, id: PROJECTS[2].id, label: PROJECTS[2].container });
  coinArc(216, [8, 7, 7, 8]);
  doors.push({ col: 224, id: PROJECTS[3].id, label: PROJECTS[3].container });
  bugs.push({ col: 229 });
  bugs.push({ col: 234 });
  bird(220, 6);
  bird(236, 3);
  bricks(230, 233, 8);
  coinRow(230, 233, 6);

  // ---------------- EDUCATION (239-258) ----------------
  ground(239, 258);
  signs.push({ col: 244, id: "education", label: "UNIVERSITY", sub: "WORLD 5", auto: true });
  coinArc(248, [8, 7, 6, 6, 7, 8]);
  bugs.push({ col: 252 });
  bird(247, 5);
  bird(256, 6);

  // ---------------- DEPLOY (259-295) ----------------
  ground(259, COLS - 1);
  stairs(266, 8);
  coinArc(266, [9, 8, 7, 6, 5, 4, 3, 2]);
  const flagCol = 282;
  bird(263, 6);
  bird(272, 2);
  bird(279, 5);
  signs.push({ col: 262, id: "deploy-intro", label: "DEPLOY", sub: "FINAL", auto: true });

  return { grid, blocks, signs, doors, coins, bugs, birds, flagCol, playerCol: 3 };
}

export function isSolid(t: number) {
  return t === T_GROUND || t === T_BRICK || t === T_BLOCK || t === T_BLOCK_USED || t === T_STAIR;
}
