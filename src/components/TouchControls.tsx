import { useCallback } from "react";
import { Input } from "../game/engine";

type Key = keyof Input;

export function TouchControls({ input, onAction }: { input: Input; onAction: () => void }) {
  const bind = useCallback(
    (key: Key) => ({
      onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
        e.preventDefault();
        (e.currentTarget as HTMLButtonElement).setPointerCapture?.(e.pointerId);
        input[key] = true;
        e.currentTarget.classList.add("down");
      },
      onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
        e.preventDefault();
        input[key] = false;
        e.currentTarget.classList.remove("down");
      },
      onPointerCancel: (e: React.PointerEvent<HTMLButtonElement>) => {
        input[key] = false;
        e.currentTarget.classList.remove("down");
      },
      onPointerLeave: (e: React.PointerEvent<HTMLButtonElement>) => {
        input[key] = false;
        e.currentTarget.classList.remove("down");
      },
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    }),
    [input],
  );

  return (
    <div className="touch">
      <div className="pad left">
        <button {...bind("left")} aria-label="Left">
          ◀
        </button>
        <button {...bind("right")} aria-label="Right">
          ▶
        </button>
      </div>
      <div className="pad right">
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            onAction();
          }}
          aria-label="Read / open"
        >
          ▲
        </button>
        <button className="big fire" {...bind("fire")} aria-label="Throw code">
          B
        </button>
        <button className="big" {...bind("jump")} aria-label="Jump">
          A
        </button>
      </div>
    </div>
  );
}
