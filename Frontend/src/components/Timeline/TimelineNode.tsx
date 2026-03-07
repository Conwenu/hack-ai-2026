// ============================================================
// Ripple – TimelineNode (R3F mesh)
// ============================================================

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { Mesh } from "three";
import type { TimelineStep } from "../../types";

interface TimelineNodeProps {
  step: TimelineStep;
  position: [number, number, number];
  isActive: boolean;
  onClick: () => void;
}

export default function TimelineNode({
  step,
  position,
  isActive,
  onClick,
}: TimelineNodeProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Gentle idle animation
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.3;
    // Pulse scale when active
    const target = isActive ? 1.3 : hovered ? 1.1 : 1;
    meshRef.current.scale.lerp(
      { x: target, y: target, z: target } as any,
      0.08
    );
  });

  return (
    <group position={position}>
      {/* The 3D node */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial
          color={isActive ? "#ffffff" : "#555555"}
          emissive={isActive ? "#ffffff" : "#222222"}
          emissiveIntensity={isActive ? 0.4 : 0.1}
          wireframe={!isActive}
          transparent
          opacity={isActive ? 1 : 0.6}
        />
      </mesh>

      {/* Connecting line to next node (drawn from parent scene) */}

      {/* HTML overlay label */}
      {(isActive || hovered) && (
        <Html
          position={[1.2, 0, 0]}
          center={false}
          style={{ pointerEvents: "none", whiteSpace: "nowrap" }}
        >
          <div
            className={`
              px-4 py-2 rounded-lg backdrop-blur-md
              border border-white/10 bg-black/60
              transition-opacity duration-300
              ${isActive ? "opacity-100" : "opacity-70"}
            `}
          >
            <p className="text-xs font-medium text-white/90">{step.title}</p>
            {isActive && (
              <p className="text-[11px] text-white/40 mt-1 max-w-[220px]">
                {step.description}
              </p>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
