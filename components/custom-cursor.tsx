"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const arrowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    const cursor = cursorRef.current;
    const arrow = arrowRef.current;
    if (!cursor || !arrow) {
      return;
    }

    document.documentElement.classList.add("custom-cursor-active");

    const SMOOTHING = 0.32;
    const MIN_DELTA = 0.05;
    const FADE_OUT_DURATION = "300ms";
    const REST_ANGLE = -135;
    const ROTATION_SMOOTHING = 0.18;
    const MIN_TRAVEL = 12;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let anchorX = 0;
    let anchorY = 0;
    let angle = REST_ANGLE;
    let renderedAngle = REST_ANGLE;
    let hasPosition = false;
    let needsSnap = false;
    let visible = false;
    let frame = 0;

    const render = () => {
      cursor.style.transform = `translate(${currentX}px, ${currentY}px)`;
      arrow.style.transform = `rotate(${renderedAngle - REST_ANGLE}deg)`;
    };

    const tick = () => {
      const deltaX = targetX - currentX;
      const deltaY = targetY - currentY;

      let angleDelta = ((angle - renderedAngle + 540) % 360) - 180;
      renderedAngle += angleDelta * ROTATION_SMOOTHING;
      angleDelta = ((angle - renderedAngle + 540) % 360) - 180;

      if (
        Math.abs(deltaX) < MIN_DELTA &&
        Math.abs(deltaY) < MIN_DELTA &&
        Math.abs(angleDelta) < 0.5
      ) {
        currentX = targetX;
        currentY = targetY;
        renderedAngle = angle;
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
      if (!hasPosition) {
        return;
      }
      visible = true;
      cursor.style.transitionDuration = "";
      cursor.style.opacity = "1";
    };

    const hide = () => {
      visible = false;
      needsSnap = true;
      cursor.style.transitionDuration = FADE_OUT_DURATION;
      cursor.style.opacity = "0";
    };

    const snapTo = (x: number, y: number) => {
      targetX = x;
      targetY = y;
      currentX = x;
      currentY = y;
      anchorX = x;
      anchorY = y;
      renderedAngle = angle;
      render();
    };

    const handleMove = (event: MouseEvent) => {
      if (!event.isTrusted || (event.clientX === 0 && event.clientY === 0)) {
        return;
      }

      targetX = event.clientX;
      targetY = event.clientY;

      if (!hasPosition || needsSnap) {
        hasPosition = true;
        needsSnap = false;
        snapTo(targetX, targetY);
      } else {
        const travelX = targetX - anchorX;
        const travelY = targetY - anchorY;

        if (Math.hypot(travelX, travelY) >= MIN_TRAVEL) {
          angle = (Math.atan2(travelY, travelX) * 180) / Math.PI;
          anchorX = targetX;
          anchorY = targetY;
        }

        startLoop();
      }

      if (!visible) {
        show();
      }
    };

    const handleEnter = (event: MouseEvent) => {
      handleMove(event);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        hide();
      }
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseleave", hide);
    document.addEventListener("mouseenter", handleEnter);
    window.addEventListener("blur", hide);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", hide);
      document.removeEventListener("mouseenter", handleEnter);
      window.removeEventListener("blur", hide);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (frame !== 0) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="custom-cursor"
      aria-hidden="true"
      style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
    >
      <div
        ref={arrowRef}
        className="custom-cursor-arrow"
        style={{ transformOrigin: "3.75px 3.75px" }}
      >
        <svg
          width="25"
          height="25"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
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
    </div>
  );
}
