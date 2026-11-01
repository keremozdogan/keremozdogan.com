import asyncio, subprocess, sys, time
from playwright.async_api import async_playwright

async def main():
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "4173", "--bind", "127.0.0.1", "-d", "dist"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(executable_path="/usr/bin/google-chrome", headless=True)
            page = await b.new_page(viewport={"width": 1280, "height": 720})
            page.on("console", lambda m: print("console:", m.text))
            await page.goto("http://127.0.0.1:4173/?debug")
            await page.wait_for_timeout(1000)
            await page.click("text=Press Start")
            await page.wait_for_timeout(400)
            await page.evaluate("window.__game.teleport(185)")
            await page.wait_for_timeout(200)
            await page.keyboard.down("ArrowRight")
            for i in range(12):
                await page.wait_for_timeout(80)
                st = await page.evaluate("({pos: window.__game.getPlayerPos(), paused: window.__game.paused, dialogs: document.querySelectorAll('.dialog').length})")
                print(i, st)
            await page.keyboard.up("ArrowRight")
            await b.close()
    finally:
        srv.terminate()

asyncio.run(main())
