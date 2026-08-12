"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    const cursor = cursorRef.current;
    if (!cursor) {
      return;
    }

    document.documentElement.classList.add("custom-cursor-active");

    const SMOOTHING = 0.32;
    const MIN_DELTA = 0.05;
    const FADE_OUT_DURATION = "300ms";

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let hasPosition = false;
    let visible = false;
    let frame = 0;

    const render = () => {
      cursor.style.transform = `translate(${currentX}px, ${currentY}px)`;
    };

    const tick = () => {
      const deltaX = targetX - currentX;
      const deltaY = targetY - currentY;

      if (Math.abs(deltaX) < MIN_DELTA && Math.abs(deltaY) < MIN_DELTA) {
        currentX = targetX;
        currentY = targetY;
        render();
        frame = 0;
        return;
      }

      currentX += deltaX * SMOOTHING;
      currentY += deltaY * SMOOTHING;
      render();
      frame = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (frame === 0) {
        frame = requestAnimationFrame(tick);
      }
    };

    const show = () => {
      visible = true;
      cursor.style.transitionDuration = "";
      cursor.style.opacity = "1";
    };

    const handleMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;

      if (hasPosition) {
        startLoop();
      } else {
        hasPosition = true;
        currentX = targetX;
        currentY = targetY;
        render();
      }

      if (!visible) {
        show();
      }
    };

    const handleLeave = () => {
      visible = false;
      cursor.style.transitionDuration = FADE_OUT_DURATION;
      cursor.style.opacity = "0";
    };

    const handleEnter = () => {
      show();
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseleave", handleLeave);
    document.addEventListener("mouseenter", handleEnter);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("mouseenter", handleEnter);
      if (frame !== 0) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <div ref={cursorRef} className="custom-cursor" aria-hidden="true">
      <svg
        width="25"
        height="25"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
      >
        <path
          d="M3 3L3 17L8 12L13 12L3 3Z"
          fill="var(--mousecolor)"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
