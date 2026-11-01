import { useCallback, useEffect, useRef, useState } from "react";
import { audio } from "./game/audio";
import { Game, GameEvent, Stats } from "./game/engine";
import { Hud } from "./components/Hud";
import { Dialog, PanelContent } from "./components/Panel";
import { GameOverOverlay, PauseOverlay, WinOverlay } from "./components/Overlays";
import { ResumeMode } from "./components/ResumeMode";
import { TitleScreen } from "./components/TitleScreen";
import { TouchControls } from "./components/TouchControls";

const isTouchDevice = () =>
  typeof window !== "undefined" && (window.matchMedia?.("(pointer: coarse)").matches || "ontouchstart" in window);

const EMPTY_STATS: Stats = {
  lives: 3,
  commits: 0,
  commitsTotal: 0,
  bugs: 0,
  bugsTotal: 0,
  skills: 0,
  skillsTotal: 0,
  time: 0,
  progress: 0,
  world: "1-1",
  zoneLabel: "START",
};

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);

  const [screen, setScreen] = useState<"title" | "playing">("title");
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [panel, setPanel] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState<Stats | null>(null);
  const [win, setWin] = useState<Stats | null>(null);
  const [toast, setToast] = useState<{ text: string; sub?: string } | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [muted, setMuted] = useState(audio.muted);
  const [resumeMode, setResumeMode] = useState(false);
  const [isTouch] = useState(isTouchDevice);
  const toastTimer = useRef<number>(0);

  // refs mirroring state for keyboard handler
  const stateRef = useRef({ screen, panel, paused, gameOver, win, resumeMode, prompt });
  stateRef.current = { screen, panel, paused, gameOver, win, resumeMode, prompt };

  const handleEvent = useCallback((e: GameEvent) => {
    switch (e.type) {
      case "stats":
        setStats(e.stats);
        break;
      case "panel":
        setPanel(e.id);
        break;
      case "toast":
        setToast({ text: e.text, sub: e.sub });
        window.clearTimeout(toastTimer.current);
        toastTimer.current = window.setTimeout(() => setToast(null), 3000);
        break;
      case "prompt":
        setPrompt(e.text);
        break;
      case "gameover":
        setGameOver(e.stats);
        audio.sfx("gameover");
        break;
      case "win":
        setWin(e.stats);
        break;
    }
  }, []);

  // create engine once
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const game = new Game(canvas, handleEvent);
    gameRef.current = game;
    if (window.location.search.includes("debug")) (window as any).__game = game;
    const fit = () => game.resize(stage.clientWidth, stage.clientHeight);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    window.addEventListener("orientationchange", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", fit);
      game.stop();
      gameRef.current = null;
    };
  }, [handleEvent]);

  const startGame = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;
    audio.resume();
    audio.startMusic();
    setScreen("playing");
    setPanel(null);
    setPaused(false);
    setGameOver(null);
    setWin(null);
    game.restart();
    game.start();
  }, []);

  const closePanel = useCallback(() => {
    setPanel(null);
    const s = stateRef.current;
    if (!s.paused && !s.gameOver && !s.win && !s.resumeMode) gameRef.current?.setPaused(false);
  }, []);

  const pauseGame = useCallback(() => {
    if (stateRef.current.screen !== "playing") return;
    setPaused(true);
    gameRef.current?.setPaused(true);
    audio.sfx("pause");
  }, []);

  const resumeGame = useCallback(() => {
    setPaused(false);
    const s = stateRef.current;
    if (!s.panel && !s.gameOver && !s.win && !s.resumeMode) gameRef.current?.setPaused(false);
  }, []);

  const openResumeMode = useCallback(() => {
    setResumeMode(true);
    gameRef.current?.setPaused(true);
  }, []);

  const closeResumeMode = useCallback(() => {
    setResumeMode(false);
    const s = stateRef.current;
    if (s.screen === "playing" && !s.panel && !s.paused && !s.gameOver && !s.win) gameRef.current?.setPaused(false);
  }, []);

  const toggleMute = useCallback(() => {
    audio.resume();
    const m = !audio.muted;
    audio.setMuted(m);
    setMuted(m);
  }, []);

  const triggerAction = useCallback(() => gameRef.current?.triggerAction(), []);

  // keyboard
  useEffect(() => {
    const game = () => gameRef.current;
    const onDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      const k = e.key;
      const code = e.code;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(code)) e.preventDefault();

      if (s.resumeMode) {
        if (k === "Escape") closeResumeMode();
        return;
      }
      if (s.screen === "title") {
        if (k === "Enter" || code === "Space") startGame();
        return;
      }
      if (k === "m" || k === "M") {
        toggleMute();
        return;
      }
      if (s.panel) {
        if (k === "Enter" || k === "Escape" || code === "Space" || k === "e" || k === "E") closePanel();
        return;
      }
      if (s.gameOver) {
        if (k === "Enter" || code === "Space") startGame();
        return;
      }
      if (s.win) {
        if (k === "Enter") openResumeMode();
        return;
      }
      if (s.paused) {
        if (k === "Escape" || k === "p" || k === "P" || k === "Enter") resumeGame();
        return;
      }
      if (k === "Escape" || k === "p" || k === "P") {
        pauseGame();
        return;
      }
      const g = game();
      if (!g) return;
      switch (code) {
        case "ArrowLeft":
        case "KeyA":
          g.input.left = true;
          break;
        case "ArrowRight":
        case "KeyD":
          g.input.right = true;
          break;
        case "ArrowUp":
        case "KeyW":
          if (s.prompt) g.input.action = true;
          else g.input.jump = true;
          break;
        case "Space":
        case "KeyZ":
        case "KeyX":
          g.input.jump = true;
          break;
        case "Enter":
        case "KeyE":
          g.input.action = true;
          break;
      }
    };
    const onUp = (e: KeyboardEvent) => {
      const g = game();
      if (!g) return;
      switch (e.code) {
        case "ArrowLeft":
        case "KeyA":
          g.input.left = false;
          break;
        case "ArrowRight":
        case "KeyD":
          g.input.right = false;
          break;
        case "ArrowUp":
        case "KeyW":
          g.input.jump = false;
          g.input.action = false;
          break;
        case "Space":
        case "KeyZ":
        case "KeyX":
          g.input.jump = false;
          break;
        case "Enter":
        case "KeyE":
          g.input.action = false;
          break;
      }
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [startGame, closePanel, pauseGame, resumeGame, toggleMute, closeResumeMode, openResumeMode]);

  // pause when tab hidden
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        const s = stateRef.current;
        if (s.screen === "playing" && !s.panel && !s.gameOver && !s.win && !s.resumeMode) pauseGame();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [pauseGame]);

  const playing = screen === "playing";
  const showTouch = playing && isTouch && !panel && !paused && !gameOver && !win && !resumeMode;

  return (
    <div className="app">
      <div className="stage scanlines" ref={stageRef}>
        <canvas ref={canvasRef} className="game" />
        {playing && (
          <Hud stats={stats} muted={muted} onToggleMute={toggleMute} onPause={pauseGame} onResumeMode={openResumeMode} />
        )}
        {playing && prompt && !panel && (
          <button className="prompt" onClick={triggerAction}>
            ▲ {prompt} {isTouch ? "" : "· ENTER"}
          </button>
        )}
        {toast && (
          <div className="toast">
            ★ {toast.text}
            {toast.sub && <small>{toast.sub}</small>}
          </div>
        )}
        {showTouch && gameRef.current && <TouchControls input={gameRef.current.input} onAction={triggerAction} />}

        {screen === "title" && !resumeMode && (
          <TitleScreen onStart={startGame} onResume={openResumeMode} muted={muted} onToggleMute={toggleMute} isTouch={isTouch} />
        )}

        {playing && panel && (
          <Dialog onClose={closePanel}>
            <PanelContent id={panel} />
          </Dialog>
        )}
        {playing && paused && !panel && !gameOver && !win && !resumeMode && (
          <PauseOverlay
            onResume={resumeGame}
            onRestart={startGame}
            onResumeMode={openResumeMode}
            muted={muted}
            onToggleMute={toggleMute}
          />
        )}
        {playing && gameOver && !resumeMode && <GameOverOverlay stats={gameOver} onRestart={startGame} onResumeMode={openResumeMode} />}
        {playing && win && !resumeMode && <WinOverlay stats={win} onRestart={startGame} onResumeMode={openResumeMode} />}

        {resumeMode && <ResumeMode onBack={closeResumeMode} />}
      </div>
    </div>
  );
}
