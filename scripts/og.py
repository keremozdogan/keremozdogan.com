"""Renders public/og.png (1200x630) from the title screen. Run after `npm run build`."""
import asyncio, subprocess, sys, time
from playwright.async_api import async_playwright

async def main():
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "4173", "--bind", "127.0.0.1", "-d", "dist"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(executable_path="/usr/bin/google-chrome", headless=True)
            page = await b.new_page(viewport={"width": 1200, "height": 630})
            await page.goto("http://127.0.0.1:4173/")
            await page.wait_for_timeout(1200)
            await page.evaluate("document.fonts.ready")
            await page.screenshot(path="public/og.png")
            await b.close()
    finally:
        srv.terminate()

asyncio.run(main())
