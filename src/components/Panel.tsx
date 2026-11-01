import { ReactNode } from "react";
import { EDUCATION, EXPERIENCE, LANGUAGES, PROFILE, PROJECTS, SKILLS } from "../data/content";
import { PLAYER, PLAYER_PALETTE } from "../game/sprites";
import { PixelSprite } from "./PixelSprite";

export function Dialog({
  children,
  onClose,
  hint = "PRESS ENTER / TAP TO CONTINUE",
}: {
  children: ReactNode;
  onClose?: () => void;
  hint?: string | null;
}) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="dialog px-box" onClick={(e) => e.stopPropagation()} role="dialog">
        {onClose && (
          <button className="x" onClick={onClose} aria-label="Close">
            ×
          </button>
        )}
        {children}
        {hint && onClose && (
          <div className="close-hint" onClick={onClose}>
            ▼ {hint}
          </div>
        )}
      </div>
    </div>
  );
}

export function ContactLinks() {
  return (
    <div className="links">
      <a href={`mailto:${PROFILE.email}`}>
        <span>EMAIL</span>
        <b>{PROFILE.email}</b>
      </a>
      <a href={PROFILE.github} target="_blank" rel="noreferrer">
        <span>GITHUB</span>
        <b>{PROFILE.githubLabel}</b>
      </a>
      <a href={PROFILE.linkedin} target="_blank" rel="noreferrer">
        <span>LINKEDIN</span>
        <b>{PROFILE.linkedinLabel}</b>
      </a>
    </div>
  );
}

export function PanelContent({ id }: { id: string }) {
  if (id === "about") {
    return (
      <>
        <p className="kicker">WORLD 1-1 · PLAYER SELECT</p>
        <div className="about-head">
          <PixelSprite rows={PLAYER.idle} palette={PLAYER_PALETTE} cacheKey="p-idle" size={64} />
          <div>
            <h2>{PROFILE.name}</h2>
            <div className="meta">
              {PROFILE.title}
              <br />
              {PROFILE.stack}
              <br />
              {PROFILE.location}
            </div>
          </div>
        </div>
        <p>{PROFILE.summary}</p>
        <div className="statgrid">
          <div className="s">
            <b>1</b>
            <span>STARTUP CO-FOUNDED</span>
          </div>
          <div className="s">
            <b>3</b>
            <span>INTERNSHIPS CLEARED</span>
          </div>
          <div className="s">
            <b>{SKILLS.length}</b>
            <span>SKILLS TO UNLOCK</span>
          </div>
          <div className="s">
            <b>∞</b>
            <span>COFFEE</span>
          </div>
        </div>
        <h3>// HOW TO PLAY</h3>
        <ul>
          <li>Walk right. Read the signs — each one is a chapter of the CV.</li>
          <li>Stomp the bugs. Collect commits. Hit the {"{ }"} blocks to unlock skills.</li>
          <li>Open the containers in World 4 to inspect projects.</li>
          <li>Reach the flag to deploy to production. No rollbacks.</li>
        </ul>
        <p className="xp">+100 XP · Tutorial complete</p>
      </>
    );
  }

  const exp = EXPERIENCE.find((e) => e.id === id);
  if (exp) {
    const kind =
      exp.type === "founder" ? "BOSS LEVEL · FOUNDER" : exp.type === "freelance" ? "SIDE QUEST · FREELANCE" : "LEVEL · INTERNSHIP";
    return (
      <>
        <p className="kicker">
          {exp.level} · {kind}
        </p>
        <h2>{exp.role}</h2>
        <div className="meta">
          {exp.companyUrl ? (
            <a href={exp.companyUrl} target="_blank" rel="noreferrer">
              {exp.company} ↗
            </a>
          ) : (
            exp.company
          )}
          <br />
          {exp.period}
        </div>
        <ul>
          {exp.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
        <div className="tags">
          {exp.tags.map((t) => (
            <span className="tag" key={t}>
              {t}
            </span>
          ))}
        </div>
        <p className="xp">{exp.xp}</p>
      </>
    );
  }

  if (id === "skills-intro") {
    const groups = ["Frontend", "Backend", "Tools"] as const;
    return (
      <>
        <p className="kicker">WORLD 3 · SKILL BLOCKS</p>
        <h2>Jump. Hit the blocks.</h2>
        <p>
          Every <b>{"{ }"}</b> block hides a skill. Bump it from below to unlock it. There are {SKILLS.length} of them, sorted by
          row: frontend, backend, tools. Stand on a block to grab the commits above.
        </p>
        {groups.map((g) => (
          <div key={g}>
            <h3>{g.toUpperCase()}</h3>
            <div className="tags">
              {SKILLS.filter((s) => s.group === g).map((s) => (
                <span className="tag" key={s.id}>
                  ???
                </span>
              ))}
            </div>
          </div>
        ))}
        <p className="xp">Hint: rarity goes LEGENDARY › EPIC › RARE. Yes, React is legendary here.</p>
      </>
    );
  }

  if (id === "projects-intro") {
    return (
      <>
        <p className="kicker">WORLD 4 · THE SERVER ROOM</p>
        <h2>{PROJECTS.length} containers are running.</h2>
        <p>Each blue container is a shipped project. Walk up to a door and press ▲ (or tap OPEN) to inspect it.</p>
        <p>Mind the gaps — the pits are where the undocumented features live.</p>
        <div className="tags">
          {PROJECTS.map((p) => (
            <span className="tag" key={p.id}>
              {p.container}
            </span>
          ))}
        </div>
      </>
    );
  }

  const proj = PROJECTS.find((p) => p.id === id);
  if (proj) {
    return (
      <>
        <p className="kicker">docker inspect {proj.container}</p>
        <h2>
          {proj.name}
          <span className={`status ${proj.status.split(" ")[0]}`}>{proj.status}</span>
        </h2>
        <div className="meta">{proj.short}</div>
        <p>{proj.description}</p>
        <div className="tags">
          {proj.stack.map((t) => (
            <span className="tag" key={t}>
              {t}
            </span>
          ))}
        </div>
        {proj.url && (
          <div className="btnrow">
            <a className="btn primary" href={proj.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none", textAlign: "center" }}>
              Visit {proj.urlLabel} ↗
            </a>
          </div>
        )}
      </>
    );
  }

  if (id === "education") {
    return (
      <>
        <p className="kicker">WORLD 5 · UNIVERSITY</p>
        <h2>{EDUCATION.degree}</h2>
        <div className="meta">
          {EDUCATION.school}
          <br />
          {EDUCATION.period}
        </div>
        <p>{EDUCATION.quip}</p>
        <h3>LANGUAGES</h3>
        {LANGUAGES.map((l) => (
          <div key={l.name}>
            <div className="skillrow">
              <span>{l.name}</span>
              <em>{l.level}</em>
            </div>
            <div className="bar">
              <i style={{ width: `${l.bar}%` }} />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (id === "deploy-intro") {
    return (
      <>
        <p className="kicker">FINAL WORLD · RELEASE DAY</p>
        <h2>Deploy to production.</h2>
        <p>Climb the stairs, touch the flag. Friday, 17:58. What could go wrong?</p>
        <p className="xp">Checklist: tests green ✓ · coffee refilled ✓ · rollback plan: no</p>
      </>
    );
  }

  return (
    <>
      <h2>404</h2>
      <p>Panel not found. That's a real bug, go stomp it.</p>
    </>
  );
}
