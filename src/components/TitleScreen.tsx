import { CONTROLS, PROFILE } from "../data/content";
import { PLAYER, PLAYER_PALETTE } from "../game/sprites";
import { PixelSprite } from "./PixelSprite";

export function TitleScreen({
  onStart,
  onResume,
  muted,
  onToggleMute,
  isTouch,
}: {
  onStart: () => void;
  onResume: () => void;
  muted: boolean;
  onToggleMute: () => void;
  isTouch: boolean;
}) {
  return (
    <div className="title" onClick={(e) => e.stopPropagation()}>
      <div className="hero">
        <PixelSprite rows={PLAYER.idle} palette={PLAYER_PALETTE} cacheKey="p-idle" size={96} className="sprite-preview" />
        <h1>
          {PROFILE.name.toUpperCase()}
          <small>{PROFILE.title.toUpperCase()}</small>
        </h1>
      </div>
      <p className="sub">
        A PLAYABLE 8-BIT PORTFOLIO. COLLECT COMMITS, FIX BUGS, UNLOCK SKILLS AND DEPLOY TO PRODUCTION.
        <br />
        NO BUGS WERE HARMED… THEY WERE FIXED.
      </p>
      <div className="actions">
        <button className="btn primary" onClick={onStart} autoFocus>
          ▶ Press Start
        </button>
        <button className="btn" onClick={onResume}>
          Recruiter mode
        </button>
        <button className="btn ghost" onClick={onToggleMute}>
          Sound: {muted ? "OFF" : "ON"}
        </button>
      </div>
      {!isTouch && (
        <div className="controls">
          {CONTROLS.map((c) => (
            <span key={c.keys} style={{ display: "contents" }}>
              <b>{c.keys}</b>
              <span>{c.action}</span>
            </span>
          ))}
        </div>
      )}
      {isTouch && <div className="controls"><b>◀ ▶</b><span>Move</span><b>A</b><span>Jump</span><b>▲</b><span>Read / open</span></div>}
      <div className="foot">
        © {new Date().getFullYear()} KEREM ÖZDOĞAN · ISTANBUL · ALL BUGS RESERVED
        <br />
        1 PLAYER GAME · TOP SCORE: SHIPPING
      </div>
      <div className="ground-strip" />
    </div>
  );
}
