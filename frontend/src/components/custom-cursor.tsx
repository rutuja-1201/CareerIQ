"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const INTERACTIVE = "a, button, [role='button'], input, select, textarea, label, [data-cursor-hover]";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    document.body.classList.add("custom-cursor-active");

    const moveDot = (x: number, y: number) => {
      dotRef.current?.style.setProperty("transform", `translate(calc(${x}px - 50%), calc(${y}px - 50%))`);
    };

    const moveRing = (x: number, y: number) => {
      ringRef.current?.style.setProperty("transform", `translate(calc(${x}px - 50%), calc(${y}px - 50%))`);
    };

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      moveDot(e.clientX, e.clientY);
      setVisible(true);
    };

    const tick = () => {
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.18;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.18;
      moveRing(ringPos.current.x, ringPos.current.y);
      raf.current = requestAnimationFrame(tick);
    };

    const onOver = (e: MouseEvent) => {
      setHovering(!!(e.target as HTMLElement).closest(INTERACTIVE));
    };

    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);
    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    raf.current = requestAnimationFrame(tick);

    return () => {
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className={cn(
          "custom-cursor-dot pointer-events-none fixed left-0 top-0 z-[9999] opacity-0 transition-opacity duration-200",
          visible && "opacity-100",
          hovering && "is-hover",
          clicking && "is-click"
        )}
      />
      <div
        ref={ringRef}
        className={cn(
          "custom-cursor-ring pointer-events-none fixed left-0 top-0 z-[9998] opacity-0 transition-[opacity,transform] duration-300",
          visible && "opacity-100",
          hovering && "is-hover",
          clicking && "is-click"
        )}
      />
    </>
  );
}
