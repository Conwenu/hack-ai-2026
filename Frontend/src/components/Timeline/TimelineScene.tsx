// ============================================================
// Ripple – TimelineScene (R3F Canvas content)
// ============================================================

import { useMemo } from "react";
import { useAppStore } from "../../stores/useAppStore";
import { TIMELINE_Z_SPACING } from "../../animations/config";
import TimelineNode from "./TimelineNode";
import TimelineConnector from "./TimelineConnector";
import TimelineCamera from "./TimelineCamera";
import type { TimelineStep } from "../../types";

export default function TimelineScene() {
  const { currentGoal, nav, goToStep } = useAppStore();
  const steps = currentGoal?.steps ?? [];

  // Pre-compute positions along the z-axis (extending into the screen)
  const positions = useMemo<[number, number, number][]>(
    () => steps.map((_, i) => [0, 0, -(i * TIMELINE_Z_SPACING)]),
    [steps.length]
  );

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -3, -10]} intensity={0.3} color="#4466ff" />

      {/* Camera driver */}
      <TimelineCamera activeIndex={nav.currentStepIndex} />

      {/* Connectors */}
      {positions.map((pos, i) => {
        if (i === positions.length - 1) return null;
        return (
          <TimelineConnector
            key={`conn-${i}`}
            from={pos}
            to={positions[i + 1]}
            active={i <= nav.currentStepIndex}
          />
        );
      })}

      {/* Nodes */}
      {steps.map((step: TimelineStep, i: number) => (
        <TimelineNode
          key={step.id}
          step={step}
          position={positions[i]}
          isActive={i === nav.currentStepIndex}
          onClick={() => goToStep(i)}
        />
      ))}

      {/* Fog for depth perception */}
      <fog attach="fog" args={["#000000", 5, 40]} />
    </>
  );
}
