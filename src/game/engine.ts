import {
  buildLevel,
  COLS,
  GROUND_ROW,
  idx,
  isSolid,
  LEVEL_H,
  LEVEL_W,
  LevelData,
  ROWS,
  T_BLOCK,
  T_BLOCK_USED,
  T_BRICK,
  T_EMPTY,
  T_GROUND,
  T_STAIR,
  TILE,
  zoneAt,
  Zone,
  ZONES,
} from "./level";
import {
  BIRD,
  BIRD_PALETTE,
  BLOCK,
  BLOCK_PALETTE,
  BLOCK_USED_PALETTE,
  BUG,
  BUG_PALETTE,
  CLOUD,
  CLOUD_PALETTE,
  COIN,
  COIN_PALETTE,
  flipped,
  PLAYER,
  PLAYER_PALETTE,
  sprite,
  STAR,
  STAR_PALETTE,
} from "./sprites";
import { audio } from "./audio";
import { SKILLS } from "../data/content";

export interface Input {
  left: boolean;
  right: boolean;
  jump: boolean;
  action: boolean;
  fire: boolean;
}

export interface Stats {
  lives: number;
  commits: number;
  commitsTotal: number;
  bugs: number;
  bugsTotal: number;
  skills: number;
  skillsTotal: number;
  time: number;
  progress: number;
  world: string;
  zoneLabel: string;
}

export type GameEvent =
  | { type: "stats"; stats: Stats }
  | { type: "panel"; id: string }
  | { type: "toast"; text: string; sub?: string }
  | { type: "prompt"; text: string | null }
  | { type: "gameover"; stats: Stats }
  | { type: "win"; stats: Stats };

interface Player {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1;
  animT: number;
  invincible: number;
  dead: boolean;
  deadT: number;
  coyote: number;
  jumpBuffer: number;
  jumpHeld: boolean;
  autoWalk: boolean;
  throwT: number;
  fireCooldown: number;
}

interface Bird {
  x: number;
  y: number;
  w: number;
  h: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  t: number;
  alive: boolean;
  gone: boolean;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  glyph: number;
}

const GLYPHS = ["<", ">", "#", ";", "{", "}", "/", "="];

interface Bug {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  alive: boolean;
  squishT: number;
  animT: number;
  onGround: boolean;
  gone: boolean;
}

interface Coin {
  x: number;
  y: number;
  taken: boolean;
}

interface Sign {
  x: number;
  id: string;
  label: string;
  auto: boolean;
  seen: boolean;
}

interface Door {
  x: number;
  id: string;
  label: string;
  seen: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  text?: string;
}

interface Badge {
  x: number;
  y: number;
  t: number;
  label: string;
}

const GRAV = 0.3;
const MAX_FALL = 6.5;
const WALK = 1.7;
const JUMP = -6.1;
const JUMP_CUT = -2.2;
const STOMP_BOUNCE = -4.6;

type SkyPal = { top: string; bot: string; far: string; win: string; mid: string; midWin: string; night: boolean };
// far = distant skyscrapers, mid = closer low-rise blocks, win/midWin = window lights
const SKY: Record<Zone, SkyPal> = {
  start: { top: "#4ea8ff", bot: "#c9ecff", far: "#4f8fdc", win: "#8cc0ff", mid: "#2f5aa8", midWin: "#6f9be6", night: false },
  experience: { top: "#4ea8ff", bot: "#c9ecff", far: "#4f8fdc", win: "#8cc0ff", mid: "#2f5aa8", midWin: "#6f9be6", night: false },
  skills: { top: "#0e9aa7", bot: "#9ff2e2", far: "#157a74", win: "#5fd6c8", mid: "#0b4f4b", midWin: "#2fb3a4", night: false },
  projects: { top: "#0b1026", bot: "#33307f", far: "#1b1848", win: "#ffd166", mid: "#120f33", midWin: "#ffb347", night: true },
  education: { top: "#4ea8ff", bot: "#ffe9a8", far: "#4f8fdc", win: "#8cc0ff", mid: "#2f5aa8", midWin: "#6f9be6", night: false },
  deploy: { top: "#ff7a3d", bot: "#ffe08a", far: "#7a2e12", win: "#ffb28a", mid: "#4a1a0a", midWin: "#ff9a5c", night: false },
};

function hexToRgb(h: string) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function lerpColor(a: string, b: string, t: number) {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  const r = Math.round(A[0] + (B[0] - A[0]) * t);
  const g = Math.round(A[1] + (B[1] - A[1]) * t);
  const bl = Math.round(A[2] + (B[2] - A[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

// deterministic pseudo-random
function hash(n: number) {
  let x = (n | 0) * 374761393 + 668265263;
  x = (x ^ (x >>> 13)) * 1274126177;
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  W = 400;
  H = LEVEL_H;
  input: Input = { left: false, right: false, jump: false, action: false, fire: false };
  paused = false;
  running = false;
  won = false;
  over = false;
  onEvent: (e: GameEvent) => void;

  private level!: LevelData;
  private player!: Player;
  private bugs: Bug[] = [];
  private birds: Bird[] = [];
  private projectiles: Projectile[] = [];
  private coins: Coin[] = [];
  private signs: Sign[] = [];
  private doors: Door[] = [];
  private particles: Particle[] = [];
  private badges: Badge[] = [];
  private bumps = new Map<number, number>(); // tile idx -> bump timer
  private cam = { x: 0 };
  private checkpointX = 0;
  private frames = 0;
  private stats!: Stats;
  private skillsCollected = new Set<string>();
  private flagX = 0;
  private flagT = 0; // 0..1 raised
  private winT = 0;
  private nearSign: Sign | null = null;
  private nearDoor: Door | null = null;
  private actionPrev = false;
  private jumpPrev = false;
  private firePrev = false;
  private lastPrompt: string | null = null;
  private raf = 0;
  private last = 0;
  private acc = 0;
  private fontReady = false;

  constructor(canvas: HTMLCanvasElement, onEvent: (e: GameEvent) => void) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    this.ctx = ctx;
    this.onEvent = onEvent;
    this.reset();
    if (document.fonts && document.fonts.load) {
      document.fonts.load('8px "Press Start 2P"').then(() => (this.fontReady = true)).catch(() => (this.fontReady = true));
    } else this.fontReady = true;
  }

  // ---------------------------------------------------------------- setup
  reset() {
    this.level = buildLevel();
    const L = this.level;
    const gy = GROUND_ROW * TILE;
    this.player = {
      x: L.playerCol * TILE + 3,
      y: gy - 15,
      w: 10,
      h: 15,
      vx: 0,
      vy: 0,
      onGround: false,
      facing: 1,
      animT: 0,
      invincible: 0,
      dead: false,
      deadT: 0,
      coyote: 0,
      jumpBuffer: 0,
      jumpHeld: false,
      autoWalk: false,
      throwT: 0,
      fireCooldown: 0,
    };
    this.bugs = L.bugs.map((b) => ({
      x: b.col * TILE + 2,
      y: gy - 10,
      w: 12,
      h: 10,
      vx: -0.45,
      vy: 0,
      alive: true,
      squishT: 0,
      animT: hash(b.col) * 100,
      onGround: false,
      gone: false,
    }));
    this.birds = L.birds.map((b) => ({
      x: b.col * TILE,
      y: b.row * TILE,
      w: 12,
      h: 8,
      baseX: b.col * TILE,
      baseY: b.row * TILE,
      vx: hash(b.col * 3) > 0.5 ? 0.7 : -0.7,
      vy: 0,
      t: hash(b.col) * 100,
      alive: true,
      gone: false,
    }));
    this.projectiles = [];
    this.coins = L.coins.map((c) => ({ x: c.col * TILE + 4, y: c.row * TILE + 4, taken: false }));
    this.signs = L.signs.map((s) => ({ x: s.col * TILE, id: s.id, label: s.label, auto: s.auto, seen: false }));
    this.doors = L.doors.map((d) => ({ x: d.col * TILE, id: d.id, label: d.label, seen: false }));
    this.particles = [];
    this.badges = [];
    this.bumps.clear();
    this.checkpointX = this.player.x;
    this.frames = 0;
    this.skillsCollected.clear();
    this.flagX = L.flagCol * TILE;
    this.flagT = 0;
    this.winT = 0;
    this.won = false;
    this.over = false;
    this.nearSign = null;
    this.nearDoor = null;
    this.lastPrompt = null;
    this.stats = {
      lives: 3,
      commits: 0,
      commitsTotal: this.coins.length,
      bugs: 0,
      bugsTotal: this.bugs.length + this.birds.length,
      skills: 0,
      skillsTotal: SKILLS.length,
      time: 0,
      progress: 0,
      world: "1-1",
      zoneLabel: "START",
    };
    this.cam.x = 0;
    this.emitStats();
  }

  restart() {
    this.reset();
    this.paused = false;
  }

  resize(cssW: number, cssH: number) {
    const aspect = cssW / Math.max(1, cssH);
    this.W = Math.max(256, Math.min(480, Math.round(this.H * aspect)));
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    const scale = Math.min(cssW / this.W, cssH / this.H);
    this.canvas.style.width = `${Math.floor(this.W * scale)}px`;
    this.canvas.style.height = `${Math.floor(this.H * scale)}px`;
    this.ctx.imageSmoothingEnabled = false;
    this.render();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.acc = 0;
    const loop = (t: number) => {
      if (!this.running) return;
      const dt = Math.min(100, t - this.last);
      this.last = t;
      this.acc += dt;
      let steps = 0;
      while (this.acc >= 1000 / 60 && steps < 4) {
        if (!this.paused) this.step();
        this.acc -= 1000 / 60;
        steps++;
      }
      this.render();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  setPaused(p: boolean) {
    const wasPaused = this.paused;
    this.paused = p;
    if (!p) {
      this.last = performance.now();
      // short grace period after reading a panel so a nearby bug can't cheap-shot the player
      if (wasPaused && !this.player.dead && !this.won) this.player.invincible = Math.max(this.player.invincible, 50);
    }
  }

  /** Called by UI (tap on prompt) to trigger the interact action. */
  triggerAction() {
    this.doAction();
  }

  getStats(): Stats {
    return { ...this.stats };
  }

  /** Debug helper (only exposed with ?debug): jump to a column. */
  teleport(col: number) {
    const p = this.player;
    p.x = col * TILE + 3;
    p.y = GROUND_ROW * TILE - p.h;
    p.vx = 0;
    p.vy = 0;
    p.dead = false;
    p.invincible = 60;
    this.checkpointX = p.x;
    this.updateCamera(true);
  }

  getPlayerPos() {
    return { x: this.player.x, y: this.player.y, col: Math.floor(this.player.x / TILE) };
  }

  // ---------------------------------------------------------------- helpers
  private emit(e: GameEvent) {
    this.onEvent(e);
  }
  private emitStats() {
    this.emit({ type: "stats", stats: { ...this.stats } });
  }
  private tileAt(c: number, r: number) {
    if (c < 0 || c >= COLS) return T_GROUND; // walls at level edges
    if (r < 0 || r >= ROWS) return T_EMPTY;
    return this.level.grid[idx(c, r)];
  }

  private text(p: Particle["text"], x: number, y: number, color: string, vy = -0.6, life = 50) {
    this.particles.push({ x, y, vx: 0, vy, life, maxLife: life, color, text: p });
  }
  private dust(x: number, y: number, color: string, n = 6) {
    for (let i = 0; i < n; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 2.4,
        vy: -Math.random() * 2.2,
        life: 24 + Math.random() * 12,
        maxLife: 36,
        color,
      });
    }
  }

  // ---------------------------------------------------------------- simulation
  private step() {
    this.frames++;
    const p = this.player;
    const inp = this.input;

    if (this.won) {
      this.stepWin();
      this.stepWorld();
      return;
    }

    if (p.dead) {
      p.deadT++;
      p.vy += GRAV;
      p.y += p.vy;
      if (p.deadT > 75) {
        if (this.stats.lives > 0) this.respawn();
        else {
          this.over = true;
          this.paused = true;
          this.emit({ type: "gameover", stats: { ...this.stats } });
        }
      }
      this.stepWorld();
      return;
    }

    // ---- horizontal
    const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
    const target = dir * WALK;
    const accel = p.onGround ? 0.2 : 0.11;
    p.vx += (target - p.vx) * accel;
    if (Math.abs(p.vx) < 0.02) p.vx = 0;
    if (dir !== 0) p.facing = dir as 1 | -1;

    // ---- jump (with coyote time + buffer)
    if (p.onGround) p.coyote = 6;
    else if (p.coyote > 0) p.coyote--;
    const jumpPressed = inp.jump && !this.jumpPrev;
    this.jumpPrev = inp.jump;
    if (jumpPressed) p.jumpBuffer = 7;
    else if (p.jumpBuffer > 0) p.jumpBuffer--;
    if (p.jumpBuffer > 0 && p.coyote > 0) {
      p.vy = JUMP;
      p.onGround = false;
      p.coyote = 0;
      p.jumpBuffer = 0;
      p.jumpHeld = true;
      audio.sfx("jump");
      this.dust(p.x + p.w / 2, p.y + p.h, "#e2e8f0", 3);
    }
    if (!inp.jump && p.vy < JUMP_CUT) p.vy = JUMP_CUT;

    // ---- gravity
    p.vy = Math.min(MAX_FALL, p.vy + GRAV);

    // ---- move + collide
    this.moveX(p);
    const wasGround = p.onGround;
    p.onGround = false;
    this.moveY(p, true);
    if (p.onGround && !wasGround && p.vy >= 0) this.dust(p.x + p.w / 2, p.y + p.h, "#cbd5e1", 3);

    // ---- pit
    if (p.y > LEVEL_H + 24) this.die(false);

    // ---- animation
    if (p.onGround && Math.abs(p.vx) > 0.2) p.animT += Math.abs(p.vx) * 0.12;
    else if (p.onGround) p.animT = 0;
    if (p.invincible > 0) p.invincible--;
    if (p.throwT > 0) p.throwT--;
    if (p.fireCooldown > 0) p.fireCooldown--;

    // ---- throw code
    const firePressed = inp.fire && !this.firePrev;
    this.firePrev = inp.fire;
    if (firePressed && p.fireCooldown === 0) this.throwCode();

    // ---- interactions
    this.checkCoins();
    this.checkBugs();
    this.checkBirds();
    this.checkSignsAndDoors();
    this.checkFlag();

    // ---- action key
    const actionPressed = inp.action && !this.actionPrev;
    this.actionPrev = inp.action;
    if (actionPressed) this.doAction();

    this.stepWorld();
    this.updateCamera(false);

    // ---- stats
    if (this.frames % 60 === 0) {
      this.stats.time = Math.floor(this.frames / 60);
      this.stats.progress = Math.min(1, p.x / this.flagX);
      const z = zoneAt(Math.floor((p.x + p.w / 2) / TILE));
      this.stats.world = z.world;
      this.stats.zoneLabel = z.label;
      this.emitStats();
    } else {
      const z = zoneAt(Math.floor((p.x + p.w / 2) / TILE));
      if (z.label !== this.stats.zoneLabel) {
        this.stats.world = z.world;
        this.stats.zoneLabel = z.label;
        this.stats.progress = Math.min(1, p.x / this.flagX);
        this.emitStats();
      }
    }
  }

  private stepWorld() {
    // bugs
    for (const b of this.bugs) {
      if (b.gone) continue;
      if (!b.alive) {
        b.squishT--;
        if (b.squishT <= 0) b.gone = true;
        continue;
      }
      // only simulate near the camera
      if (b.x < this.cam.x - 96 || b.x > this.cam.x + this.W + 96) continue;
      b.animT += 0.15;
      b.vy = Math.min(MAX_FALL, b.vy + GRAV);
      const hitWall = this.moveX(b);
      if (hitWall) b.vx = -b.vx;
      b.onGround = false;
      this.moveY(b, false);
      if (b.onGround) {
        // turn at ledges
        const aheadX = b.vx > 0 ? b.x + b.w + 1 : b.x - 1;
        const belowRow = Math.floor((b.y + b.h + 1) / TILE);
        const aheadCol = Math.floor(aheadX / TILE);
        if (!isSolid(this.tileAt(aheadCol, belowRow))) b.vx = -b.vx;
      }
      if (b.y > LEVEL_H + 32) b.gone = true;
    }
    // birds: patrol around their spawn point with a sine bob
    for (const b of this.birds) {
      if (b.gone) continue;
      if (!b.alive) {
        b.vy = Math.min(MAX_FALL, b.vy + GRAV);
        b.y += b.vy;
        b.x += b.vx * 0.5;
        if (b.y > LEVEL_H + 32) b.gone = true;
        continue;
      }
      if (b.x < this.cam.x - 140 || b.x > this.cam.x + this.W + 140) continue;
      b.t += 1;
      b.x += b.vx;
      if (b.x > b.baseX + 90) b.vx = -Math.abs(b.vx);
      if (b.x < b.baseX - 90) b.vx = Math.abs(b.vx);
      b.y = b.baseY + Math.sin(b.t * 0.07) * 9;
    }
    // projectiles: thrown code glyphs, bounce along the ground like a fireball
    for (const pr of this.projectiles) {
      pr.life--;
      pr.vy = Math.min(5, pr.vy + 0.18);
      pr.x += pr.vx;
      pr.y += pr.vy;
      const c = Math.floor((pr.x + 4) / TILE);
      const rBelow = Math.floor((pr.y + 8) / TILE);
      if (pr.vy > 0 && isSolid(this.tileAt(c, rBelow))) {
        pr.y = rBelow * TILE - 8;
        pr.vy = -2.6;
      }
      const rMid = Math.floor((pr.y + 4) / TILE);
      if (isSolid(this.tileAt(c, rMid))) pr.life = 0;
      if (pr.life % 5 === 0) pr.glyph = (pr.glyph + 1) % GLYPHS.length;
      if (pr.life <= 0) this.dust(pr.x + 4, pr.y + 4, "#fde047", 3);
      // hit enemies
      for (const b of this.bugs) {
        if (!b.alive || b.gone || pr.life <= 0) continue;
        if (pr.x < b.x + b.w && pr.x + 8 > b.x && pr.y < b.y + b.h && pr.y + 8 > b.y) {
          this.squish(b);
          pr.life = 0;
        }
      }
      for (const b of this.birds) {
        if (!b.alive || b.gone || pr.life <= 0) continue;
        if (pr.x < b.x + b.w && pr.x + 8 > b.x && pr.y < b.y + b.h && pr.y + 8 > b.y) {
          this.killBird(b);
          pr.life = 0;
        }
      }
    }
    this.projectiles = this.projectiles.filter((pr) => pr.life > 0);
    // particles
    for (const pt of this.particles) {
      pt.life--;
      pt.x += pt.vx;
      pt.y += pt.vy;
      if (!pt.text) pt.vy += 0.12;
    }
    this.particles = this.particles.filter((pt) => pt.life > 0);
    // badges
    for (const bd of this.badges) bd.t++;
    this.badges = this.badges.filter((bd) => bd.t < 70);
    // block bump timers
    for (const [k, v] of this.bumps) {
      if (v <= 1) this.bumps.delete(k);
      else this.bumps.set(k, v - 1);
    }
  }

  private moveX(e: { x: number; y: number; w: number; h: number; vx: number }): boolean {
    e.x += e.vx;
    let hit = false;
    const r0 = Math.floor(e.y / TILE);
    const r1 = Math.floor((e.y + e.h - 0.01) / TILE);
    if (e.vx > 0) {
      const c = Math.floor((e.x + e.w - 0.01) / TILE);
      for (let r = r0; r <= r1; r++) {
        if (isSolid(this.tileAt(c, r))) {
          e.x = c * TILE - e.w;
          e.vx = 0;
          hit = true;
          break;
        }
      }
    } else if (e.vx < 0) {
      const c = Math.floor(e.x / TILE);
      for (let r = r0; r <= r1; r++) {
        if (isSolid(this.tileAt(c, r))) {
          e.x = (c + 1) * TILE;
          e.vx = 0;
          hit = true;
          break;
        }
      }
    }
    if (e.x < 0) {
      e.x = 0;
      hit = true;
    }
    return hit;
  }

  private moveY(e: { x: number; y: number; w: number; h: number; vy: number; onGround: boolean }, isPlayer: boolean) {
    e.y += e.vy;
    const c0 = Math.floor(e.x / TILE);
    const c1 = Math.floor((e.x + e.w - 0.01) / TILE);
    if (e.vy > 0) {
      const r = Math.floor((e.y + e.h - 0.01) / TILE);
      for (let c = c0; c <= c1; c++) {
        if (isSolid(this.tileAt(c, r))) {
          e.y = r * TILE - e.h;
          e.vy = 0;
          e.onGround = true;
          break;
        }
      }
    } else if (e.vy < 0) {
      const r = Math.floor(e.y / TILE);
      let best = -1;
      let bestD = 1e9;
      for (let c = c0; c <= c1; c++) {
        if (isSolid(this.tileAt(c, r))) {
          const d = Math.abs(c * TILE + 8 - (e.x + e.w / 2));
          if (d < bestD) {
            bestD = d;
            best = c;
          }
        }
      }
      if (best >= 0) {
        e.y = (r + 1) * TILE;
        e.vy = 0;
        if (isPlayer) this.headBump(best, r);
      }
    }
  }

  private headBump(c: number, r: number) {
    const i = idx(c, r);
    const t = this.level.grid[i];
    if (t === T_BLOCK) {
      this.level.grid[i] = T_BLOCK_USED;
      this.bumps.set(i, 12);
      const skillId = this.level.blocks.get(i);
      const skill = SKILLS.find((s) => s.id === skillId);
      if (skill && !this.skillsCollected.has(skill.id)) {
        this.skillsCollected.add(skill.id);
        this.stats.skills = this.skillsCollected.size;
        this.badges.push({ x: c * TILE, y: r * TILE, t: 0, label: skill.name });
        this.emit({ type: "toast", text: `${skill.name.toUpperCase()} UNLOCKED`, sub: `${skill.rarity} · ${skill.quip}` });
        this.emitStats();
      }
      audio.sfx("unlock");
      this.dust(c * TILE + 8, r * TILE, "#bae6fd", 5);
      // squash any bug standing on the block
      for (const b of this.bugs) {
        if (b.alive && Math.abs(b.y + b.h - r * TILE) < 2 && b.x + b.w > c * TILE && b.x < c * TILE + TILE) this.squish(b);
      }
    } else if (t === T_BRICK || t === T_BLOCK_USED || t === T_STAIR || t === T_GROUND) {
      this.bumps.set(i, 8);
      audio.sfx("bump");
      this.dust(c * TILE + 8, r * TILE + TILE, "#94a3b8", 3);
    }
  }

  private checkCoins() {
    const p = this.player;
    for (const c of this.coins) {
      if (c.taken) continue;
      if (p.x < c.x + 8 && p.x + p.w > c.x && p.y < c.y + 8 && p.y + p.h > c.y) {
        c.taken = true;
        this.stats.commits++;
        audio.sfx("coin");
        this.text("+1", c.x, c.y - 4, "#fde047");
        this.emitStats();
      }
    }
  }

  private squish(b: Bug) {
    b.alive = false;
    b.squishT = 28;
    this.stats.bugs++;
    audio.sfx("stomp");
    this.text("BUG FIXED!", b.x - 14, b.y - 10, "#4ade80", -0.7, 55);
    this.dust(b.x + b.w / 2, b.y + b.h, "#ef4444", 6);
    this.emitStats();
  }

  private throwCode() {
    const p = this.player;
    p.fireCooldown = 16;
    p.throwT = 12;
    this.projectiles.push({
      x: p.facing > 0 ? p.x + p.w : p.x - 8,
      y: p.y + 4,
      vx: p.facing * 3.4 + p.vx * 0.4,
      vy: -1.2,
      life: 75,
      glyph: Math.floor(Math.random() * GLYPHS.length),
    });
    audio.sfx("throw");
  }

  private killBird(b: Bird) {
    b.alive = false;
    b.vy = -2;
    this.stats.bugs++;
    audio.sfx("stomp");
    this.text("FLAKY TEST FIXED!", b.x - 30, b.y - 12, "#86efac", -0.7, 55);
    this.dust(b.x + b.w / 2, b.y + b.h / 2, "#9ca3af", 6);
    this.emitStats();
  }

  private checkBirds() {
    const p = this.player;
    for (const b of this.birds) {
      if (!b.alive || b.gone) continue;
      if (p.x < b.x + b.w && p.x + p.w > b.x && p.y < b.y + b.h && p.y + p.h > b.y) {
        const fromAbove = p.vy > 0 && p.y + p.h - b.y < 7;
        if (fromAbove) {
          this.killBird(b);
          p.vy = STOMP_BOUNCE;
        } else if (p.invincible === 0) {
          this.die(true);
          return;
        }
      }
    }
  }

  private checkBugs() {
    const p = this.player;
    for (const b of this.bugs) {
      if (!b.alive || b.gone) continue;
      if (p.x < b.x + b.w && p.x + p.w > b.x && p.y < b.y + b.h && p.y + p.h > b.y) {
        const fromAbove = p.vy > 0 && p.y + p.h - b.y < 7;
        if (fromAbove) {
          this.squish(b);
          p.vy = STOMP_BOUNCE;
          p.y = b.y - p.h;
        } else if (p.invincible === 0) {
          this.die(true);
          return;
        }
      }
    }
  }

  private checkSignsAndDoors() {
    const p = this.player;
    const cx = p.x + p.w / 2;
    let near: Sign | null = null;
    for (const s of this.signs) {
      if (cx > s.x - 10 && cx < s.x + TILE + 10) {
        near = s;
        break;
      }
    }
    let nearDoor: Door | null = null;
    if (!near) {
      for (const d of this.doors) {
        if (cx > d.x - 2 && cx < d.x + 24 + 2) {
          nearDoor = d;
          break;
        }
      }
    }
    this.nearSign = near;
    this.nearDoor = nearDoor;

    // checkpoints
    if (near && near.x > this.checkpointX) this.checkpointX = near.x;

    // auto-open first time (also mid-air, so a jump can't skip a chapter)
    if (near && near.auto && !near.seen) {
      near.seen = true;
      this.openPanel(near.id, "sign");
      return;
    }
    if (nearDoor && !nearDoor.seen && p.onGround) {
      nearDoor.seen = true;
      this.openPanel(nearDoor.id, "door");
      return;
    }

    const prompt = near ? "READ" : nearDoor ? "OPEN" : null;
    if (prompt !== this.lastPrompt) {
      this.lastPrompt = prompt;
      this.emit({ type: "prompt", text: prompt });
    }
  }

  private doAction() {
    if (this.paused || this.won || this.player.dead) return;
    if (this.nearSign) this.openPanel(this.nearSign.id, "sign");
    else if (this.nearDoor) this.openPanel(this.nearDoor.id, "door");
  }

  private openPanel(id: string, kind: "sign" | "door") {
    audio.sfx(kind === "door" ? "door" : "sign");
    this.player.vx = 0;
    this.input.left = this.input.right = this.input.jump = this.input.action = this.input.fire = false;
    this.paused = true;
    if (this.lastPrompt !== null) {
      this.lastPrompt = null;
      this.emit({ type: "prompt", text: null });
    }
    this.emit({ type: "panel", id });
  }

  private checkFlag() {
    const p = this.player;
    if (p.x + p.w > this.flagX + 4 && p.onGround) {
      this.won = true;
      this.winT = 0;
      p.vx = 0;
      audio.sfx("flag");
      this.stats.time = Math.floor(this.frames / 60);
      this.stats.progress = 1;
      this.emitStats();
      if (this.lastPrompt !== null) {
        this.lastPrompt = null;
        this.emit({ type: "prompt", text: null });
      }
    }
  }

  private stepWin() {
    const p = this.player;
    this.winT++;
    if (this.winT < 70) {
      this.flagT = Math.min(1, this.winT / 60);
      p.x = this.flagX + 12;
    } else if (this.winT < 150) {
      // walk into production
      p.vx = WALK * 0.8;
      p.facing = 1;
      p.vy = Math.min(MAX_FALL, p.vy + GRAV);
      this.moveX(p);
      p.onGround = false;
      this.moveY(p, false);
      p.animT += 0.2;
      if (this.winT % 20 === 0) this.dust(this.flagX + 60 + Math.random() * 40, 60 + Math.random() * 60, "#fde047", 4);
    } else if (this.winT === 150) {
      this.paused = true;
      this.emit({ type: "win", stats: { ...this.stats } });
    }
    this.updateCamera(false);
  }

  private die(hurt: boolean) {
    const p = this.player;
    if (p.dead) return;
    p.dead = true;
    p.deadT = 0;
    p.vx = 0;
    p.vy = hurt ? -5.5 : -3;
    if (p.y > LEVEL_H) p.y = LEVEL_H + 40; // keep off screen if fell
    this.stats.lives--;
    audio.sfx("hurt");
    this.text(hurt ? "SEGFAULT" : "NULL REFERENCE", p.x - 20, Math.min(p.y, LEVEL_H - 40) - 12, "#f87171", -0.5, 70);
    this.emitStats();
  }

  private respawn() {
    const p = this.player;
    p.dead = false;
    p.x = this.checkpointX + 3;
    p.y = GROUND_ROW * TILE - p.h;
    p.vx = 0;
    p.vy = 0;
    p.invincible = 110;
    p.facing = 1;
    this.updateCamera(true);
    // revive bugs near the checkpoint so it's not trivially empty? no — fixed bugs stay fixed.
  }

  private updateCamera(snap: boolean) {
    const p = this.player;
    const target = Math.max(0, Math.min(LEVEL_W - this.W, p.x + p.w / 2 - this.W * 0.42));
    if (snap) this.cam.x = target;
    else this.cam.x += (target - this.cam.x) * 0.18;
    if (Math.abs(target - this.cam.x) < 0.3) this.cam.x = target;
  }

  // ---------------------------------------------------------------- rendering
  render() {
    const g = this.ctx;
    const W = this.W;
    const H = this.H;
    const camX = Math.round(this.cam.x);
    g.imageSmoothingEnabled = false;

    const pal = this.skyPalette();

    // sky
    const grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, pal.top);
    grad.addColorStop(1, pal.bot);
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);

    // stars (night)
    if (pal.nightT > 0) {
      g.globalAlpha = pal.nightT;
      g.fillStyle = "#ffffff";
      for (let i = 0; i < 40; i++) {
        const sx = (hash(i * 7) * 2000 - camX * 0.1) % (W + 20);
        const sy = hash(i * 13) * 120;
        const tw = (Math.sin(this.frames * 0.05 + i) + 1) * 0.5;
        if (tw > 0.3) g.fillRect(Math.floor(sx < 0 ? sx + W + 20 : sx), Math.floor(sy), 1, 1);
      }
      g.globalAlpha = 1;
    }

    // far skyline (NYC skyscrapers)
    this.drawSkyline(camX, pal.far, pal.win, pal.nightT);
    // clouds
    this.drawClouds(camX, pal.nightT);
    // mid low-rise blocks
    this.drawHills(camX, pal.mid, pal.midWin);

    g.save();
    g.translate(-camX, 0);

    this.drawTiles(camX);
    this.drawProduction();
    for (const s of this.signs) if (s.x > camX - 80 && s.x < camX + W + 80) this.drawSign(s);
    for (const d of this.doors) if (d.x > camX - 80 && d.x < camX + W + 80) this.drawDoor(d);
    this.drawFlag();
    this.drawCoins(camX);
    this.drawBadges();
    this.drawBugs(camX);
    this.drawBirds(camX);
    this.drawPlayer();
    this.drawProjectiles();
    this.drawParticles();

    g.restore();
  }

  private skyPalette() {
    const cx = this.cam.x + this.W / 2;
    const col = cx / TILE;
    const z = zoneAt(Math.floor(col));
    const zi = ZONES.indexOf(z);
    let a = SKY[z.zone];
    let b = a;
    let t = 0;
    const band = 6; // tiles
    if (zi < ZONES.length - 1 && col > z.to - band) {
      b = SKY[ZONES[zi + 1].zone];
      t = (col - (z.to - band)) / band;
    } else if (zi > 0 && col < z.from + band) {
      b = a;
      a = SKY[ZONES[zi - 1].zone];
      t = (col - z.from) / band;
    }
    const nightT = (a.night ? 1 : 0) * (1 - t) + (b.night ? 1 : 0) * t;
    return {
      top: lerpColor(a.top, b.top, t),
      bot: lerpColor(a.bot, b.bot, t),
      far: lerpColor(a.far, b.far, t),
      win: lerpColor(a.win, b.win, t),
      mid: lerpColor(a.mid, b.mid, t),
      midWin: lerpColor(a.midWin, b.midWin, t),
      nightT,
    };
  }

  /** Far layer: Manhattan-style skyscrapers with window grids, a spire tower and an antenna tower. */
  private drawSkyline(camX: number, color: string, win: string, nightT: number) {
    const g = this.ctx;
    const seg = 520;
    const off = camX * 0.2;
    const base = GROUND_ROW * TILE;
    const first = Math.floor(off / seg) - 1;
    for (let s = first; s <= first + Math.ceil(this.W / seg) + 2; s++) {
      const sx = s * seg - off;
      let x = 0;
      let i = 0;
      while (x < seg - 20) {
        const w = 18 + Math.floor(hash(s * 97 + i) * 28);
        const h = 48 + Math.floor(hash(s * 31 + i * 7) * 110);
        const bx = Math.floor(sx + x);
        const by = base - h;
        g.fillStyle = color;
        g.fillRect(bx, by, w, h);
        const kind = hash(s * 13 + i * 5);
        if (kind > 0.8) {
          // stepped art-deco crown + spire
          g.fillRect(bx + 4, by - 10, w - 8, 10);
          g.fillRect(bx + Math.floor(w / 2) - 2, by - 26, 4, 16);
          g.fillRect(bx + Math.floor(w / 2) - 1, by - 40, 2, 14);
        } else if (kind > 0.65) {
          // antenna tower
          g.fillRect(bx + Math.floor(w / 2) - 1, by - 22, 2, 22);
          g.fillRect(bx + Math.floor(w / 2) - 3, by - 14, 6, 2);
        } else if (kind > 0.5) {
          // flat roof with water tank
          g.fillRect(bx + 3, by - 6, 7, 6);
        }
        // window grid (hash-stable, some lit)
        g.fillStyle = win;
        for (let wy = by + 6; wy < base - 6; wy += 6) {
          for (let wx = bx + 3; wx < bx + w - 3; wx += 5) {
            const lit = hash(wx * 7 + wy * 13 + s) > (nightT > 0.5 ? 0.58 : 0.66);
            if (lit) g.fillRect(wx, wy, 2, 3);
          }
        }
        x += w + 3 + Math.floor(hash(s * 11 + i) * 6);
        i++;
      }
    }
  }

  /** Mid layer: closer low-rise blocks (brownstones, rooftops with water towers). */
  private drawHills(camX: number, color: string, win: string) {
    const g = this.ctx;
    const base = GROUND_ROW * TILE;
    const off = camX * 0.5;
    const seg = 320;
    const first = Math.floor(off / seg) - 1;
    for (let s = first; s <= first + Math.ceil(this.W / seg) + 2; s++) {
      const sx = s * seg - off;
      let x = 0;
      let i = 0;
      while (x < seg - 10) {
        const w = 26 + Math.floor(hash(s * 41 + i * 3) * 40);
        const h = 18 + Math.floor(hash(s * 23 + i * 9) * 42);
        const bx = Math.floor(sx + x);
        const by = base - h;
        g.fillStyle = color;
        g.fillRect(bx, by, w, h);
        // parapet
        g.fillRect(bx - 1, by, w + 2, 2);
        if (hash(s * 7 + i) > 0.7) {
          // water tower on legs
          const tx = bx + 4 + Math.floor(hash(s + i * 17) * (w - 14));
          g.fillRect(tx + 1, by - 8, 8, 6);
          g.fillRect(tx, by - 2, 1, 2);
          g.fillRect(tx + 9, by - 2, 1, 2);
          g.fillRect(tx + 2, by - 10, 6, 2);
        }
        // windows
        g.fillStyle = win;
        for (let wy = by + 5; wy < base - 5; wy += 7) {
          for (let wx = bx + 3; wx < bx + w - 3; wx += 6) {
            if (hash(wx * 3 + wy * 11 + s * 5) > 0.55) g.fillRect(wx, wy, 3, 3);
          }
        }
        x += w + 2 + Math.floor(hash(s * 3 + i) * 5);
        i++;
      }
    }
  }

  private drawClouds(camX: number, nightT: number) {
    const g = this.ctx;
    const spr = sprite("cloud", CLOUD, CLOUD_PALETTE);
    const off = camX * 0.3;
    const period = 200;
    const first = Math.floor(off / period) - 1;
    g.globalAlpha = 1 - nightT * 0.7;
    for (let i = first; i <= first + Math.ceil(this.W / period) + 2; i++) {
      const cx = Math.floor(i * period - off + hash(i * 41) * 120);
      const cy = Math.floor(16 + hash(i * 59) * 70);
      const sc = hash(i * 71) > 0.5 ? 1 : 2;
      g.drawImage(spr, cx, cy, spr.width * sc, spr.height * sc);
    }
    g.globalAlpha = 1;
  }

  private groundStyle(col: number): "grass" | "pcb" | "server" {
    const z = zoneAt(col).zone;
    if (z === "skills") return "pcb";
    if (z === "projects") return "server";
    return "grass";
  }

  private drawTiles(camX: number) {
    const g = this.ctx;
    const c0 = Math.max(0, Math.floor(camX / TILE) - 1);
    const c1 = Math.min(COLS - 1, Math.ceil((camX + this.W) / TILE) + 1);
    const blockSpr = sprite("block", BLOCK, BLOCK_PALETTE);
    const usedSpr = sprite("blockused", BLOCK, BLOCK_USED_PALETTE);
    for (let c = c0; c <= c1; c++) {
      const style = this.groundStyle(c);
      for (let r = 0; r < ROWS; r++) {
        const t = this.level.grid[idx(c, r)];
        if (t === T_EMPTY) continue;
        const x = c * TILE;
        let y = r * TILE;
        const bump = this.bumps.get(idx(c, r));
        if (bump) y -= Math.round(Math.sin((bump / 12) * Math.PI) * 5);
        if (t === T_GROUND) {
          const topOpen = r === 0 || this.level.grid[idx(c, r - 1)] === T_EMPTY;
          this.drawGroundTile(x, y, c, r, topOpen, style);
        } else if (t === T_BRICK) {
          g.fillStyle = "#334155";
          g.fillRect(x, y, TILE, TILE);
          g.fillStyle = "#94a3b8";
          g.fillRect(x + 1, y + 1, 6, 6);
          g.fillRect(x + 9, y + 1, 6, 6);
          g.fillRect(x + 1, y + 9, 2, 6);
          g.fillRect(x + 5, y + 9, 6, 6);
          g.fillRect(x + 13, y + 9, 2, 6);
          g.fillStyle = "#cbd5e1";
          g.fillRect(x + 1, y + 1, 6, 1);
          g.fillRect(x + 9, y + 1, 6, 1);
        } else if (t === T_BLOCK) {
          g.drawImage(blockSpr, x, y);
        } else if (t === T_BLOCK_USED) {
          g.drawImage(usedSpr, x, y);
        } else if (t === T_STAIR) {
          g.fillStyle = "#1e293b";
          g.fillRect(x, y, TILE, TILE);
          g.fillStyle = "#475569";
          g.fillRect(x + 1, y + 1, TILE - 2, TILE - 2);
          g.fillStyle = "#64748b";
          g.fillRect(x + 1, y + 1, TILE - 2, 2);
          g.fillStyle = "#334155";
          g.fillRect(x + 4, y + 7, 8, 1);
          g.fillRect(x + 4, y + 11, 8, 1);
        }
      }
    }
  }

  private drawGroundTile(x: number, y: number, c: number, r: number, top: boolean, style: "grass" | "pcb" | "server") {
    const g = this.ctx;
    if (style === "grass") {
      g.fillStyle = "#8a4b22";
      g.fillRect(x, y, TILE, TILE);
      g.fillStyle = "#6b3615";
      const h1 = hash(c * 131 + r * 17);
      const h2 = hash(c * 71 + r * 29);
      g.fillRect(x + Math.floor(h1 * 12), y + 6 + Math.floor(h2 * 8), 3, 2);
      g.fillRect(x + Math.floor(h2 * 13), y + 2 + Math.floor(h1 * 6), 2, 2);
      if (top) {
        g.fillStyle = "#3fbf4f";
        g.fillRect(x, y, TILE, 5);
        g.fillStyle = "#7ee787";
        g.fillRect(x, y, TILE, 1);
        g.fillRect(x + Math.floor(h1 * 10), y + 1, 2, 1);
        g.fillStyle = "#2a9a3a";
        g.fillRect(x + Math.floor(h2 * 14), y + 4, 2, 2);
      }
    } else if (style === "pcb") {
      g.fillStyle = "#166534";
      g.fillRect(x, y, TILE, TILE);
      g.fillStyle = "#14532d";
      g.fillRect(x, y, TILE, 1);
      g.fillRect(x, y, 1, TILE);
      const h1 = hash(c * 131 + r * 17);
      g.fillStyle = "#4ade80";
      if (h1 > 0.5) {
        g.fillRect(x + 3, y + 8, 10, 1);
        g.fillRect(x + 12, y + 3, 1, 6);
      } else {
        g.fillRect(x + 8, y + 2, 1, 9);
        g.fillRect(x + 3, y + 10, 6, 1);
      }
      g.fillStyle = "#bbf7d0";
      g.fillRect(x + Math.floor(h1 * 12) + 2, y + 4 + Math.floor(hash(c + r) * 8), 2, 2);
      if (top) {
        g.fillStyle = "#22c55e";
        g.fillRect(x, y, TILE, 3);
        g.fillStyle = "#86efac";
        g.fillRect(x, y, TILE, 1);
      }
    } else {
      g.fillStyle = "#1e293b";
      g.fillRect(x, y, TILE, TILE);
      g.fillStyle = "#0f172a";
      g.fillRect(x, y, TILE, 1);
      g.fillRect(x, y + 8, TILE, 1);
      g.fillRect(x + 7, y, 1, TILE);
      const h1 = hash(c * 131 + r * 17);
      const blink = Math.floor(this.frames / 20 + h1 * 7) % 3 === 0;
      g.fillStyle = h1 > 0.8 ? (blink ? "#ef4444" : "#7f1d1d") : blink ? "#22c55e" : "#166534";
      g.fillRect(x + 3, y + 3, 2, 2);
      g.fillStyle = "#334155";
      g.fillRect(x + 10, y + 3, 4, 2);
      g.fillRect(x + 2, y + 11, 4, 2);
      if (top) {
        g.fillStyle = "#475569";
        g.fillRect(x, y, TILE, 3);
        g.fillStyle = "#94a3b8";
        g.fillRect(x, y, TILE, 1);
      }
    }
  }

  private label(text: string, cx: number, y: number, bg = "#0f172a", fg = "#ffffff") {
    const g = this.ctx;
    g.font = '8px "Press Start 2P", monospace';
    g.textBaseline = "top";
    const w = text.length * 8 + 8;
    const x = Math.round(cx - w / 2);
    g.fillStyle = bg;
    g.fillRect(x, y, w, 14);
    g.fillStyle = "#ffffff";
    g.fillRect(x, y, w, 1);
    g.fillRect(x, y + 13, w, 1);
    g.fillRect(x, y, 1, 14);
    g.fillRect(x + w - 1, y, 1, 14);
    g.fillStyle = fg;
    g.textAlign = "left";
    g.fillText(text, x + 4, y + 3);
  }

  private drawSign(s: Sign) {
    const g = this.ctx;
    const gy = GROUND_ROW * TILE;
    const x = s.x;
    // post
    g.fillStyle = "#5c3310";
    g.fillRect(x + 7, gy - 12, 3, 12);
    // board
    g.fillStyle = "#b45309";
    g.fillRect(x, gy - 22, 16, 11);
    g.fillStyle = "#fbbf24";
    g.fillRect(x + 1, gy - 21, 14, 9);
    g.fillStyle = "#92400e";
    g.fillRect(x + 3, gy - 19, 10, 1);
    g.fillRect(x + 3, gy - 16, 10, 1);
    g.fillRect(x + 3, gy - 14, 6, 1);
    const bob = Math.round(Math.sin(this.frames * 0.08) * 1.5);
    this.label(s.label, x + 8, gy - 42 + bob, s.seen ? "#0f172a" : "#7c2d12");
  }

  private drawDoor(d: Door) {
    const g = this.ctx;
    const gy = GROUND_ROW * TILE;
    const x = d.x;
    const w = 24;
    const h = 32;
    const y = gy - h;
    g.fillStyle = "#1e3a8a";
    g.fillRect(x, y, w, h);
    g.fillStyle = "#2563eb";
    g.fillRect(x + 2, y + 2, w - 4, h - 2);
    g.fillStyle = "#3b82f6";
    for (let i = 4; i < w - 2; i += 4) g.fillRect(x + i, y + 2, 1, h - 2);
    g.fillStyle = "#1e3a8a";
    g.fillRect(x + 2, y + 8, w - 4, 1);
    g.fillRect(x + 2, y + 24, w - 4, 1);
    // handle + led
    g.fillStyle = "#fbbf24";
    g.fillRect(x + w - 6, y + 15, 2, 5);
    const on = Math.floor(this.frames / 25) % 2 === 0;
    g.fillStyle = on ? "#4ade80" : "#166534";
    g.fillRect(x + 4, y + 4, 2, 2);
    const bob = Math.round(Math.sin(this.frames * 0.08 + 1) * 1.5);
    this.label(d.label, x + w / 2, y - 20 + bob, d.seen ? "#0f172a" : "#1e3a8a");
  }

  private drawFlag() {
    const g = this.ctx;
    const gy = GROUND_ROW * TILE;
    const x = this.flagX;
    const poleH = 84;
    g.fillStyle = "#e2e8f0";
    g.fillRect(x + 7, gy - poleH, 2, poleH);
    g.fillStyle = "#fbbf24";
    g.fillRect(x + 5, gy - poleH - 4, 6, 4);
    g.fillStyle = "#64748b";
    g.fillRect(x + 2, gy - 4, 12, 4);
    // flag position
    const fy = gy - 24 - (poleH - 40) * this.flagT;
    const wave = Math.round(Math.sin(this.frames * 0.2) * 1);
    g.fillStyle = this.flagT >= 1 ? "#22c55e" : "#16a34a";
    g.fillRect(x + 9, fy, 16 + wave, 12);
    g.fillStyle = "#ffffff";
    // check mark
    g.fillRect(x + 13, fy + 6, 2, 2);
    g.fillRect(x + 15, fy + 8, 2, 2);
    g.fillRect(x + 17, fy + 6, 2, 2);
    g.fillRect(x + 19, fy + 4, 2, 2);
    this.label(this.flagT >= 1 ? "DEPLOYED!" : "DEPLOY", x + 8, gy - poleH - 24);
  }

  private drawProduction() {
    const g = this.ctx;
    const gy = GROUND_ROW * TILE;
    const x = this.flagX + 70;
    const w = 56;
    const h = 64;
    const y = gy - h;
    g.fillStyle = "#0f172a";
    g.fillRect(x, y, w, h);
    g.fillStyle = "#1e293b";
    g.fillRect(x + 3, y + 3, w - 6, h - 3);
    // racks
    for (let i = 0; i < 6; i++) {
      const ry = y + 6 + i * 9;
      g.fillStyle = "#334155";
      g.fillRect(x + 6, ry, w - 12, 7);
      g.fillStyle = "#0f172a";
      g.fillRect(x + 6, ry + 6, w - 12, 1);
      const on = Math.floor(this.frames / 15 + i) % 3 !== 0;
      g.fillStyle = on ? "#22c55e" : "#166534";
      g.fillRect(x + 9, ry + 2, 2, 2);
      g.fillStyle = Math.floor(this.frames / 10 + i * 2) % 4 === 0 ? "#38bdf8" : "#075985";
      g.fillRect(x + 13, ry + 2, 2, 2);
    }
    // door opening
    g.fillStyle = "#020617";
    g.fillRect(x + w / 2 - 7, gy - 22, 14, 22);
    this.label("PRODUCTION", x + w / 2, y - 22, "#14532d");
  }

  private drawCoins(camX: number) {
    const g = this.ctx;
    const frame = Math.floor(this.frames / 7) % 4;
    const rows = COIN[frame === 3 ? 1 : frame];
    const spr = sprite("coin" + (frame === 3 ? 1 : frame), rows, COIN_PALETTE);
    for (const c of this.coins) {
      if (c.taken) continue;
      if (c.x < camX - 16 || c.x > camX + this.W + 16) continue;
      g.drawImage(spr, c.x, c.y);
    }
  }

  private drawBadges() {
    const g = this.ctx;
    const star = sprite("star", STAR, STAR_PALETTE);
    for (const b of this.badges) {
      const rise = Math.min(1, b.t / 18);
      const y = b.y - 10 - rise * 14 - (b.t > 18 ? Math.sin((b.t - 18) * 0.15) * 2 : 0);
      g.globalAlpha = b.t > 55 ? 1 - (b.t - 55) / 15 : 1;
      g.drawImage(star, b.x + 4, y);
      this.label(b.label.toUpperCase(), b.x + 8, y - 18, "#1e3a8a", "#fde047");
      g.globalAlpha = 1;
    }
  }

  private drawBugs(camX: number) {
    const g = this.ctx;
    for (const b of this.bugs) {
      if (b.gone) continue;
      if (b.x < camX - 24 || b.x > camX + this.W + 24) continue;
      let rows: string[];
      let key: string;
      if (!b.alive) {
        rows = BUG.squish;
        key = "bug-squish";
      } else if (Math.floor(b.animT) % 2 === 0) {
        rows = BUG.walk1;
        key = "bug1";
      } else {
        rows = BUG.walk2;
        key = "bug2";
      }
      let spr = sprite(key, rows, BUG_PALETTE);
      if (b.vx > 0) spr = flipped(key, spr);
      g.drawImage(spr, Math.round(b.x - 2), Math.round(b.y - 2));
    }
  }

  private drawPlayer() {
    const g = this.ctx;
    const p = this.player;
    if (p.invincible > 0 && Math.floor(p.invincible / 4) % 2 === 0) return;
    let rows: string[];
    let key: string;
    if (p.throwT > 0 && p.onGround) {
      rows = PLAYER.throw;
      key = "p-throw";
    } else if (p.dead || !p.onGround) {
      rows = PLAYER.jump;
      key = "p-jump";
    } else if (Math.abs(p.vx) > 0.2) {
      const f = Math.floor(p.animT) % 3;
      rows = f === 0 ? PLAYER.walk1 : f === 1 ? PLAYER.idle : PLAYER.walk2;
      key = f === 0 ? "p-w1" : f === 1 ? "p-idle" : "p-w2";
    } else {
      rows = PLAYER.idle;
      key = "p-idle";
    }
    let spr = sprite(key, rows, PLAYER_PALETTE);
    if (p.facing < 0) spr = flipped(key, spr);
    // sprite is 16x20; the hitbox is 10x15 — the big head sticks out above it
    g.drawImage(spr, Math.round(p.x - 3), Math.round(p.y - 5));
  }

  private drawBirds(camX: number) {
    const g = this.ctx;
    for (const b of this.birds) {
      if (b.gone) continue;
      if (b.x < camX - 24 || b.x > camX + this.W + 24) continue;
      const up = Math.floor(b.t / 8) % 2 === 0;
      const key = up ? "bird-up" : "bird-down";
      let spr = sprite(key, up ? BIRD.up : BIRD.down, BIRD_PALETTE);
      if (b.vx < 0) spr = flipped(key, spr);
      if (!b.alive) {
        g.save();
        g.translate(Math.round(b.x + 8), Math.round(b.y + 5));
        g.scale(1, -1);
        g.drawImage(spr, -8, -5);
        g.restore();
      } else {
        g.drawImage(spr, Math.round(b.x - 2), Math.round(b.y - 1));
      }
    }
  }

  private drawProjectiles() {
    const g = this.ctx;
    g.font = '8px "Press Start 2P", monospace';
    g.textBaseline = "top";
    g.textAlign = "left";
    for (const pr of this.projectiles) {
      const ch = GLYPHS[pr.glyph];
      const x = Math.round(pr.x);
      const y = Math.round(pr.y);
      g.fillStyle = "#0f172a";
      g.fillText(ch, x + 1, y + 1);
      g.fillStyle = "#fde047";
      g.fillText(ch, x, y);
    }
  }

  private drawParticles() {
    const g = this.ctx;
    for (const pt of this.particles) {
      const a = Math.min(1, pt.life / 15);
      g.globalAlpha = a;
      if (pt.text) {
        g.font = '8px "Press Start 2P", monospace';
        g.textBaseline = "top";
        g.textAlign = "left";
        g.fillStyle = "#0f172a";
        g.fillText(pt.text, Math.round(pt.x) + 1, Math.round(pt.y) + 1);
        g.fillStyle = pt.color;
        g.fillText(pt.text, Math.round(pt.x), Math.round(pt.y));
      } else {
        g.fillStyle = pt.color;
        g.fillRect(Math.round(pt.x), Math.round(pt.y), 2, 2);
      }
    }
    g.globalAlpha = 1;
  }
}
