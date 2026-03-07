// ============================================================
// Ripple – PhaseTransition  (full-screen transition overlay)
// ============================================================

import { useEffect, useState } from "react";
import { useAppStore } from "../../stores/useAppStore";

export default function PhaseTransition() {
  const phase = useAppStore((s) => s.phase);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (phase === "transitioning") {
      setShow(true);
    } else {
      // Fade out after transition completes
      const t = setTimeout(() => setShow(false), 600);
      return () => clearTimeout(t);
    }
  }, [phase]);

  if (!show && phase !== "transitioning") return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-black
        transition-opacity duration-700
        ${phase === "transitioning" ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
    >
      {/* Ripple rings animation */}
      <div className="relative w-32 h-32">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full border border-white/20"
            style={{
              animation: `ripple-expand 1.8s ease-out ${i * 0.3}s infinite`,
            }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm text-white/50 tracking-widest uppercase">
            Mapping
          </span>
        </div>
      </div>
    </div>
  );
}
