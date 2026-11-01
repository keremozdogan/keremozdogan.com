# keremozdogan.com

Playable 8-bit platformer portfolio of Kerem Özdoğan. React + Vite, no game engine, no audio files —
the level, sprites and chiptune are all code.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/
npm run preview
```

## Deploy

Production runs on a shared server with Docker (nginx serving the Vite build) behind the server's Caddy (automatic HTTPS).
Server access details are with the project owner.

1. Push to `main` from your machine.
2. On the server: `cd /opt/keremozdogan.com && ./deploy.sh`
   (git pull → docker compose build → up → health check). If `deploy/Caddyfile` changed, run it as root.

Files: `Dockerfile`, `docker-compose.yml` (binds `127.0.0.1:8780`), `deploy/nginx.conf`, `deploy/Caddyfile`, `deploy.sh`.

## Edit the content

Everything written on the site lives in `src/data/content.ts` (profile, experience, skills, projects, education).
Change that file, rebuild, done.

- `src/game/sprites.ts` – pixel art (player, bugs, coins, blocks). Edit the strings to re-skin.
- `src/game/level.ts` – the level layout (ground, pits, signs, doors, blocks, coins, bugs).
- `src/game/audio.ts` – chiptune loop + sound effects (Web Audio).
- `src/game/engine.ts` – physics, collisions, camera, rendering.
- `src/components/` – title screen, HUD, dialogs, touch controls, recruiter mode.

## Scripts

- `python3 scripts/playtest.py` – headless playtest that teleports through every zone and takes screenshots (needs Playwright + Chrome).
- `python3 scripts/og.py` – re-renders `public/og.png` from the title screen.
- `node scripts/artifact.mjs` – builds a claude.ai-artifact-friendly copy of `dist/` for previews.

## Controls

| Key | Action |
| --- | --- |
| ← → / A D | Move |
| Space / ↑ / W | Jump |
| X / Shift / F | Throw code at bugs and pigeons |
| Enter / E | Read sign · open door |
| Esc / P | Pause |
| M | Mute |

On phones the controls are on screen. About me shows the CV as a plain scrollable page.
