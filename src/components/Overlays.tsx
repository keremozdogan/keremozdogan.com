import { Stats } from "../game/engine";
import { SKILLS } from "../data/content";
import { ContactLinks, Dialog } from "./Panel";

const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (t: number) => `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;

export function PauseOverlay({
  onResume,
  onRestart,
  onResumeMode,
  muted,
  onToggleMute,
}: {
  onResume: () => void;
  onRestart: () => void;
  onResumeMode: () => void;
  muted: boolean;
  onToggleMute: () => void;
}) {
  return (
    <Dialog onClose={onResume} hint={null}>
      <p className="kicker">GAME PAUSED</p>
      <h2>Taking a coffee break.</h2>
      <p>The bugs are waiting. They are very patient.</p>
      <div className="btnrow">
        <button className="btn primary" onClick={onResume} autoFocus>
          Resume
        </button>
        <button className="btn" onClick={onRestart}>
          Restart
        </button>
        <button className="btn" onClick={onResumeMode}>
          About me
        </button>
        <button className="btn ghost" onClick={onToggleMute}>
          Sound: {muted ? "OFF" : "ON"}
        </button>
      </div>
    </Dialog>
  );
}

export function GameOverOverlay({ stats, onRestart, onResumeMode }: { stats: Stats; onRestart: () => void; onResumeMode: () => void }) {
  return (
    <Dialog hint={null}>
      <p className="big-title red center">SEGMENTATION FAULT</p>
      <p className="center">(core dumped)</p>
      <div className="statgrid">
        <div className="s">
          <b>{stats.commits}</b>
          <span>COMMITS</span>
        </div>
        <div className="s">
          <b>{stats.bugs}</b>
          <span>BUGS FIXED</span>
        </div>
        <div className="s">
          <b>{stats.skills}</b>
          <span>SKILLS</span>
        </div>
        <div className="s">
          <b>{fmt(stats.time)}</b>
          <span>TIME</span>
        </div>
      </div>
      <p className="center">Out of coffee. Continue?</p>
      <div className="btnrow" style={{ justifyContent: "center" }}>
        <button className="btn primary" onClick={onRestart} autoFocus>
          Continue
        </button>
        <button className="btn" onClick={onResumeMode}>
          Skip to About me
        </button>
      </div>
    </Dialog>
  );
}

export function WinOverlay({ stats, onRestart, onResumeMode }: { stats: Stats; onRestart: () => void; onResumeMode: () => void }) {
  const allSkills = stats.skills >= SKILLS.length;
  return (
    <Dialog hint={null}>
      <p className="kicker">BUILD #1 · main → production</p>
      <p className="big-title">DEPLOYED TO PRODUCTION</p>
      <p>
        Thanks for playing. You reached the end of the level — and the end of my CV. Zero downtime,{" "}
        {stats.bugs > 0 ? `${stats.bugs} bugs fixed` : "0 bugs fixed (they're features now)"}, no rollback needed.
      </p>
      <div className="statgrid">
        <div className="s">
          <b>
            {stats.commits}/{stats.commitsTotal}
          </b>
          <span>COMMITS</span>
        </div>
        <div className="s">
          <b>
            {stats.bugs}/{stats.bugsTotal}
          </b>
          <span>BUGS FIXED</span>
        </div>
        <div className="s">
          <b>
            {stats.skills}/{stats.skillsTotal}
          </b>
          <span>SKILLS</span>
        </div>
        <div className="s">
          <b>{fmt(stats.time)}</b>
          <span>TIME</span>
        </div>
      </div>
      {allSkills ? (
        <p className="xp">ACHIEVEMENT: FULL STACK — every skill block unlocked.</p>
      ) : (
        <p className="xp">Missed some skill blocks? The real stack is listed under About me.</p>
      )}
      <h3>LET'S BUILD SOMETHING</h3>
      <ContactLinks />
      <div className="btnrow">
        <button className="btn primary" onClick={onResumeMode} autoFocus>
          About me (full CV)
        </button>
        <button className="btn" onClick={onRestart}>
          Play again
        </button>
      </div>
    </Dialog>
  );
}
