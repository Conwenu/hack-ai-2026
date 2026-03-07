import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import TimelineScene from "../components/Timeline/TimelineScene";
import TimelineHUD from "../components/Timeline/TimelineHUD";
import NodeModal from "../components/Timeline/NodeModal";
import type { TimelineStep } from "../types";

export default function TimelinePage() {
  const [activeModal, setActiveModal] = useState<TimelineStep | null>(null);

  return (
    <div
      className="relative w-full h-screen bg-black overflow-hidden"
      tabIndex={0}
      onKeyDown={(e) => e.preventDefault()}
    >
      {" "}
      <Canvas
        camera={{ position: [0, 1.5, 20], fov: 60 }}
        style={{ position: "absolute", inset: 0 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#000000"]} />
        <TimelineScene onNodeClick={(step) => setActiveModal(step)} />
      </Canvas>
      <TimelineHUD />
      <NodeModal step={activeModal} onClose={() => setActiveModal(null)} />
    </div>
  );
}
