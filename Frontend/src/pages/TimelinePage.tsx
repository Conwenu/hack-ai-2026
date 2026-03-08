import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import TimelineScene from "../components/Timeline/TimelineScene";
import TimelineHUD from "../components/Timeline/TimelineHUD";
import NodeModal from "../components/Timeline/NodeModal";
import type { TimelineStep } from "../types";

export default function TimelinePage() {
  const [activeModal, setActiveModal] = useState<TimelineStep | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Canvas — fades and scales in */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transition: "opacity 1.2s ease-out, transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
          opacity: entered ? 1 : 0,
          transform: entered ? "scale(1)" : "scale(0.92)",
        }}
      >
        <Canvas
          camera={{ position: [0, 1.5, 20], fov: 60 }}
          style={{ position: "absolute", inset: 0 }}
          gl={{ antialias: true, alpha: false }}
        >
          <color attach="background" args={["#000000"]} />
          <TimelineScene
            onNodeClick={(step) => setActiveModal(step)}
            modalOpen={activeModal !== null}
          />
        </Canvas>
      </div>

      {/* HUD — fades in with slight delay */}
      <div
        style={{
          transition: "opacity 0.8s ease-out 0.4s",
          opacity: entered ? 1 : 0,
        }}
      >
        <TimelineHUD />
      </div>

      <NodeModal step={activeModal} onClose={() => setActiveModal(null)} />
    </div>
  );
}