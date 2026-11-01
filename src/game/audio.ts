// Original chiptune + SFX synthesized with the Web Audio API. No audio files.

type Note = [step: number, midi: number, len: number]; // len in 16th steps

const A: Note[] = [
  [0, 72, 1], [2, 72, 1], [4, 67, 1], [6, 69, 1], [8, 71, 2], [11, 69, 1], [12, 67, 1], [14, 64, 2],
  [16, 74, 1], [18, 74, 1], [20, 69, 1], [22, 71, 1], [24, 72, 2], [27, 71, 1], [28, 69, 1], [30, 67, 2],
];
const B: Note[] = [
  [0, 76, 1], [2, 74, 1], [4, 72, 1], [6, 71, 1], [8, 69, 2], [11, 71, 1], [12, 72, 1], [14, 74, 2],
  [16, 76, 3], [20, 79, 3], [24, 76, 1], [26, 74, 1], [28, 72, 4],
];
const C: Note[] = [
  [0, 67, 1], [2, 69, 1], [4, 71, 1], [6, 72, 1], [8, 74, 1], [10, 76, 1], [12, 77, 1], [14, 79, 2],
  [16, 76, 1], [18, 72, 1], [20, 76, 1], [22, 79, 1], [24, 81, 2], [26, 79, 1], [28, 76, 1], [30, 72, 2],
];
const BASS_A = [48, 48, 43, 43, 45, 45, 40, 40, 41, 41, 43, 43, 48, 48, 43, 43];
const BASS_B = [45, 45, 40, 40, 41, 41, 43, 43, 48, 48, 43, 43, 48, 48, 43, 43];
const BASS_C = [43, 43, 45, 45, 47, 47, 48, 48, 52, 52, 50, 50, 48, 48, 43, 43];

const SONG: { lead: Note[]; bass: number[] }[] = [
  { lead: A, bass: BASS_A },
  { lead: A, bass: BASS_A },
  { lead: B, bass: BASS_B },
  { lead: C, bass: BASS_C },
];

const midiHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

export class ChipAudio {
  ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  muted = false;
  private timer: number | null = null;
  private nextTime = 0;
  private pattern = 0;
  private step = 0;
  private bpm = 152;

  constructor() {
    try {
      this.muted = localStorage.getItem("ko_muted") === "1";
    } catch {
      /* ignore */
    }
  }

  init() {
    if (this.ctx) return;
    const AC = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.6;
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.55;
    this.musicGain.connect(this.master);
    const len = this.ctx.sampleRate * 0.5;
    this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  resume() {
    this.init();
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
  }

  setMuted(m: boolean) {
    this.muted = m;
    try {
      localStorage.setItem("ko_muted", m ? "1" : "0");
    } catch {
      /* ignore */
    }
    if (this.master && this.ctx) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.setTargetAtTime(m ? 0 : 0.6, this.ctx.currentTime, 0.02);
    }
  }

  // ---------------- music ----------------
  startMusic() {
    this.resume();
    if (!this.ctx || this.timer !== null) return;
    this.nextTime = this.ctx.currentTime + 0.1;
    this.pattern = 0;
    this.step = 0;
    this.timer = window.setInterval(() => this.schedule(), 25);
  }

  stopMusic() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private schedule() {
    if (!this.ctx) return;
    const stepDur = 60 / this.bpm / 4;
    while (this.nextTime < this.ctx.currentTime + 0.15) {
      this.playStep(this.pattern, this.step, this.nextTime, stepDur);
      this.step++;
      if (this.step >= 32) {
        this.step = 0;
        this.pattern = (this.pattern + 1) % SONG.length;
      }
      this.nextTime += stepDur;
    }
  }

  private playStep(p: number, s: number, t: number, dur: number) {
    const pat = SONG[p];
    for (const [st, midi, len] of pat.lead) {
      if (st === s) this.tone("square", midiHz(midi), t, dur * len * 0.85, 0.07, this.musicGain!);
    }
    if (s % 2 === 0) {
      const b = pat.bass[s / 2];
      this.tone("triangle", midiHz(b), t, dur * 1.7, 0.16, this.musicGain!);
    }
    if (s % 4 === 0) this.kick(t, this.musicGain!);
    if (s % 8 === 4) this.noise(t, 0.07, 0.07, 1800, this.musicGain!);
    if (s % 2 === 1) this.noise(t, 0.03, 0.03, 6000, this.musicGain!);
  }

  // ---------------- primitives ----------------
  private tone(type: OscillatorType, freq: number, t: number, dur: number, vol: number, out: AudioNode, slideTo?: number) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  private noise(t: number, dur: number, vol: number, cutoff: number, out: AudioNode) {
    if (!this.ctx || !this.noiseBuf) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = this.ctx.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = cutoff;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f).connect(g).connect(out);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  private kick(t: number, out: AudioNode) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 0.16);
  }

  // ---------------- SFX ----------------
  sfx(name: string) {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const out = this.master;
    switch (name) {
      case "jump":
        this.tone("square", 260, t, 0.14, 0.12, out, 640);
        break;
      case "throw":
        this.tone("square", 900, t, 0.08, 0.09, out, 1600);
        this.noise(t, 0.05, 0.05, 3000, out);
        break;
      case "coin":
        this.tone("square", 988, t, 0.06, 0.1, out);
        this.tone("square", 1319, t + 0.06, 0.18, 0.1, out);
        break;
      case "stomp":
        this.noise(t, 0.1, 0.18, 400, out);
        this.tone("square", 180, t, 0.12, 0.12, out, 60);
        break;
      case "bump":
        this.tone("square", 140, t, 0.08, 0.12, out, 90);
        break;
      case "hurt":
        this.tone("square", 420, t, 0.3, 0.14, out, 80);
        this.noise(t, 0.2, 0.1, 300, out);
        break;
      case "unlock":
        [523, 659, 784, 1047].forEach((f, i) => this.tone("square", f, t + i * 0.07, 0.12, 0.1, out));
        break;
      case "door":
        this.tone("triangle", 200, t, 0.22, 0.14, out, 420);
        break;
      case "sign":
        this.tone("square", 660, t, 0.05, 0.08, out);
        this.tone("square", 880, t + 0.05, 0.08, 0.08, out);
        break;
      case "flag":
        [523, 587, 659, 698, 784, 880, 988, 1047].forEach((f, i) => this.tone("square", f, t + i * 0.08, 0.16, 0.1, out));
        this.tone("triangle", 131, t, 0.8, 0.14, out);
        break;
      case "gameover":
        [392, 349, 330, 294, 262].forEach((f, i) => this.tone("square", f, t + i * 0.16, 0.22, 0.1, out));
        break;
      case "pause":
        this.tone("square", 440, t, 0.05, 0.08, out);
        this.tone("square", 330, t + 0.05, 0.05, 0.08, out);
        break;
      case "life":
        [659, 784, 1319].forEach((f, i) => this.tone("square", f, t + i * 0.07, 0.12, 0.1, out));
        break;
    }
  }
}

export const audio = new ChipAudio();
