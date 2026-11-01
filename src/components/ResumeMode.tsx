import { EDUCATION, EXPERIENCE, LANGUAGES, PROFILE, PROJECTS, SKILLS } from "../data/content";
import { PLAYER, PLAYER_PALETTE } from "../game/sprites";
import { ContactLinks } from "./Panel";
import { PixelSprite } from "./PixelSprite";

export function ResumeMode({ onBack }: { onBack: () => void }) {
  const groups = ["Frontend", "Backend", "Tools"] as const;
  return (
    <div className="resume">
      <div className="wrap">
        <div className="top">
          <div className="px" style={{ color: "var(--teal)" }}>
            ABOUT ME · NO JUMPING REQUIRED
          </div>
          <button className="btn small" onClick={onBack}>
            ◀ Back to game
          </button>
        </div>

        <section className="px-box">
          <div className="about-head">
            <PixelSprite rows={PLAYER.idle} palette={PLAYER_PALETTE} cacheKey="p-idle" size={64} />
            <div>
              <h1 className="name">{PROFILE.name}</h1>
              <div className="meta">
                {PROFILE.title}
                <br />
                {PROFILE.stack}
                <br />
                {PROFILE.location}
              </div>
            </div>
          </div>
          <p style={{ marginTop: 12 }}>{PROFILE.summary}</p>
          <ContactLinks />
        </section>

        <section className="px-box">
          <h2>EXPERIENCE</h2>
          {EXPERIENCE.map((e) => (
            <div key={e.id}>
              <h3>
                {e.role} — {e.companyUrl ? (
                  <a href={e.companyUrl} target="_blank" rel="noreferrer">
                    {e.company}
                  </a>
                ) : (
                  e.company
                )}
              </h3>
              <div className="meta">{e.period}</div>
              <ul>
                {e.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="px-box">
          <h2>PROJECTS</h2>
          {PROJECTS.map((p) => (
            <div key={p.id}>
              <h3>
                {p.name}
                <span className={`status ${p.status.split(" ")[0]}`}>{p.status}</span>
              </h3>
              <p>
                {p.description}{" "}
                {p.url && (
                  <a href={p.url} target="_blank" rel="noreferrer">
                    {p.urlLabel} ↗
                  </a>
                )}
              </p>
              <div className="tags">
                {p.stack.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="px-box">
          <h2>SKILLS</h2>
          {groups.map((g) => (
            <div key={g}>
              <h3>{g.toUpperCase()}</h3>
              {SKILLS.filter((s) => s.group === g).map((s) => (
                <div key={s.id}>
                  <div className="skillrow">
                    <span>{s.name}</span>
                    <em>{s.rarity}</em>
                  </div>
                  <div className="bar">
                    <i style={{ width: `${s.level}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </section>

        <section className="px-box">
          <h2>EDUCATION & LANGUAGES</h2>
          <h3>{EDUCATION.degree}</h3>
          <div className="meta">
            {EDUCATION.school} · {EDUCATION.period}
          </div>
          <div style={{ marginTop: 12 }}>
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
          </div>
        </section>

        <div className="center">
          <button className="btn primary" onClick={onBack}>
            ◀ Back to game
          </button>
        </div>
      </div>
    </div>
  );
}
