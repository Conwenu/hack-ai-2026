// ============================================================
// Ripple – TimelinePage
// ============================================================

import { useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { useAppStore } from "../stores/useAppStore";
import TimelineScene from "../components/Timeline/TimelineScene";
import TimelineHUD from "../components/Timeline/TimelineHUD";

export default function TimelinePage() {
  const { nextStep, prevStep } = useAppStore();

  // Scroll / click navigation
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (e.deltaY > 0) nextStep();
      else prevStep();
    },
    [nextStep, prevStep]
  );

  const handleClick = useCallback(
    (e: MouseEvent) => {
      // Left click on the canvas background → advance
      // We ignore clicks that originated from UI buttons (pointer-events-auto)
      const target = e.target as HTMLElement;
      if (target.tagName === "CANVAS") {
        nextStep();
      }
    },
    [nextStep]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") nextStep();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") prevStep();
    },
    [nextStep, prevStep]
  );

  useEffect(() => {
    // Debounce scroll to prevent rapid-fire step changes
    let timeout: ReturnType<typeof setTimeout>;
    const debouncedWheel = (e: WheelEvent) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => handleWheel(e), 120);
    };

    window.addEventListener("wheel", debouncedWheel, { passive: true });
    window.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("wheel", debouncedWheel);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timeout);
    };
  }, [handleWheel, handleClick, handleKeyDown]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 1.5, 6], fov: 60 }}
        style={{ position: "absolute", inset: 0 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#000000"]} />
        <TimelineScene />
      </Canvas>

      {/* 2D Overlay */}
      <TimelineHUD />
    </div>
  );
}
