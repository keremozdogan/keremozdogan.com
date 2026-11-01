import { useEffect, useRef } from "react";
import { Palette, sprite } from "../game/sprites";

export function PixelSprite({
  rows,
  palette,
  cacheKey,
  size = 64,
  className,
}: {
  rows: string[];
  palette: Palette;
  cacheKey: string;
  size?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const spr = sprite(cacheKey, rows, palette);
    c.width = spr.width;
    c.height = spr.height;
    const g = c.getContext("2d")!;
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, c.width, c.height);
    g.drawImage(spr, 0, 0);
  }, [rows, palette, cacheKey]);
  const ratio = rows.length / rows[0].length;
  return <canvas ref={ref} className={className} style={{ width: size, height: Math.round(size * ratio) }} aria-hidden="true" />;
}
