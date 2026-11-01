import { Stats } from "../game/engine";

const pad = (n: number, w = 2) => String(n).padStart(w, "0");

export function Hud({
  stats,
  muted,
  onToggleMute,
  onPause,
  onResumeMode,
}: {
  stats: Stats;
  muted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onResumeMode: () => void;
}) {
  const m = Math.floor(stats.time / 60);
  const s = stats.time % 60;
  return (
    <>
      <div className="hud">
        <div className="group">
          <div className="stat">
            <small>KEREM</small>
            {"☕".repeat(Math.max(0, stats.lives))}
            {stats.lives <= 0 ? "—" : ""}
          </div>
          <div className="stat">
            <small>COMMITS</small>
            {pad(stats.commits)}/{stats.commitsTotal}
          </div>
          <div className="stat">
            <small>BUGS FIXED</small>
            {pad(stats.bugs)}/{stats.bugsTotal}
          </div>
          <div className="stat">
            <small>SKILLS</small>
            {pad(stats.skills)}/{stats.skillsTotal}
          </div>
          <div className="stat">
            <small>WORLD</small>
            {stats.world}
          </div>
          <div className="stat">
            <small>TIME</small>
            {pad(m)}:{pad(s)}
          </div>
        </div>
        <div className="right">
          <button className="icon-btn" onClick={onToggleMute} aria-label="Toggle sound">
            {muted ? "♪ OFF" : "♪ ON"}
          </button>
          <button className="icon-btn" onClick={onResumeMode} aria-label="Recruiter mode">
            CV
          </button>
          <button className="icon-btn" onClick={onPause} aria-label="Pause">
            II
          </button>
        </div>
      </div>
      <div className="progress">
        <b>{stats.zoneLabel}</b>
        <i style={{ width: `${Math.round(stats.progress * 100)}%` }} />
      </div>
    </>
  );
}
