"""Headless playtest: drives the game with the keyboard and takes screenshots of every zone.
Run after `npm run build`:  python3 scripts/playtest.py
"""
import asyncio, os, subprocess, sys, time
from playwright.async_api import async_playwright

OUT = os.environ.get("OUT", "/tmp/claude-0/-home-claude/7d772f05-1d77-53bd-b1bf-1ac5c91002c2/scratchpad/shots")
os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    os.remove(os.path.join(OUT, f))
URL = os.environ.get("URL", "http://127.0.0.1:4173/?debug")
MOBILE = os.environ.get("MOBILE") == "1"


async def main():
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "4173", "--bind", "127.0.0.1", "-d", "dist"],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(executable_path="/usr/bin/google-chrome", headless=True,
                                              args=["--autoplay-policy=no-user-gesture-required"])
            ctx_kw = {"viewport": {"width": 390, "height": 760}, "has_touch": True, "is_mobile": True} if MOBILE else {"viewport": {"width": 1280, "height": 720}}
            page = await browser.new_page(**ctx_kw)
            errors = []
            page.on("console", lambda m: errors.append(f"[{m.type}] {m.text}") if m.type in ("error", "warning") else None)
            page.on("pageerror", lambda e: errors.append(f"[pageerror] {e}"))
            await page.goto(URL)
            await page.wait_for_timeout(1500)
            await page.screenshot(path=f"{OUT}/00-title.png")
            await page.click("text=Press Start")
            await page.wait_for_timeout(500)

            async def close_panels():
                if await page.locator(".dialog").count():
                    await page.keyboard.press("Enter")
                    await page.wait_for_timeout(250)

            async def shot(name):
                await page.screenshot(path=f"{OUT}/{name}.png")

            async def hold(key, ms):
                await page.keyboard.down(key)
                await page.wait_for_timeout(ms)
                await page.keyboard.up(key)

            async def tp(col):
                await close_panels()
                await page.evaluate(f"window.__game.teleport({col})")
                await page.wait_for_timeout(200)

            async def pos():
                return await page.evaluate("window.__game.getPlayerPos()")

            # --- throw code + bird
            await tp(22)
            await page.keyboard.press("x")
            await page.wait_for_timeout(120)
            await page.keyboard.press("x")
            await page.wait_for_timeout(200)
            await shot("00b-throw")
            await hold("ArrowRight", 700)
            await page.keyboard.press("x")
            await page.wait_for_timeout(350)
            await shot("00c-bird")
            await tp(3)

            # --- start: walk to the sign, panel auto-opens
            await hold("ArrowRight", 900)
            await page.wait_for_timeout(300)
            await shot("01-about-panel")
            await close_panels()
            await hold("ArrowRight", 1200)
            await shot("02-start-zone")

            # --- experience: teleport before dData sign
            await tp(56)
            await hold("ArrowRight", 600)
            await shot("03-ddata-panel")
            await close_panels()
            await hold("ArrowRight", 500)
            await shot("04-experience")

            # --- bug stomp test: teleport near bug at col 64 and jump onto it
            await tp(61)
            await page.keyboard.down("ArrowRight")
            await page.wait_for_timeout(250)
            await hold("Space", 150)
            await page.wait_for_timeout(600)
            await page.keyboard.up("ArrowRight")
            await shot("05-after-bug")

            # --- skills: bump blocks
            await tp(124)
            await hold("ArrowRight", 400)
            await close_panels()
            await tp(127)
            for i in range(5):
                await hold("Space", 150)
                await page.wait_for_timeout(400)
                await hold("ArrowRight", 330)
            await shot("06-skills-bumped")
            # click skills-intro? already closed

            # --- projects: door auto-open
            await tp(184)
            await hold("ArrowRight", 500)
            await shot("07-projects-sign")
            await close_panels()
            await hold("ArrowRight", 450)
            await page.wait_for_timeout(300)
            await shot("08-door-panel")
            await close_panels()
            await hold("ArrowLeft", 300)
            await shot("09-projects-zone")

            # --- education
            await tp(241)
            await hold("ArrowRight", 500)
            await close_panels()
            await hold("ArrowRight", 600)
            await shot("10-education")

            # --- deploy: stairs + flag
            await tp(260)
            await hold("ArrowRight", 400)
            await close_panels()
            await tp(274)
            await hold("ArrowRight", 1700)
            await page.wait_for_timeout(1200)
            await shot("11-flag")
            await page.wait_for_timeout(2500)
            await shot("12-win")

            # --- pause overlay + game over path
            await close_panels()
            await page.keyboard.press("Enter")  # recruiter mode from win
            await page.wait_for_timeout(400)
            await shot("13-recruiter")
            await page.keyboard.press("Escape")
            await page.wait_for_timeout(300)

            stats = await page.evaluate("document.querySelector('.hud')?.innerText")
            print("HUD:", (stats or "").replace("\n", " | "))
            print("ERRORS:", "\n".join(e for e in errors if "fonts.g" not in e and "ERR_TUNNEL" not in e) or "none")
            await browser.close()
    finally:
        srv.terminate()


asyncio.run(main())
