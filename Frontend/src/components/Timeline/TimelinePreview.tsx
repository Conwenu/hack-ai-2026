// ============================================================
// Ripple – TimelinePreview (empty z-axis lines on dashboard)
// ------------------------------------------------------------
// Shows faint perspective lines extending into the center of
// the screen so the user can see where the timeline will appear.
// ============================================================

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";

function PreviewLines() {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += delta * 0.02;
    }
  });

  // Create faint dots extending into the z-axis
  const dots = Array.from({ length: 12 }, (_, i) => i);

  return (
    <group ref={groupRef}>
      {/* Central vanishing line */}
      {dots.map((i) => {
        const z = -(i * 3.5);
        const opacity = Math.max(0.03, 0.2 - i * 0.015);
        const scale = Math.max(0.02, 0.08 - i * 0.005);
        return (
          <mesh key={i} position={[0, 0, z]}>
            <sphereGeometry args={[scale, 8, 8]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={opacity}
            />
          </mesh>
        );
      })}

      {/* Faint connecting line */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, 0, 0, -42])}
            itemSize={3}
          />
        </bufferGeometry>
        {/* @ts-ignore */}
        <lineBasicMaterial color="#ffffff" transparent opacity={0.04} />
      </line>
    </group>
  );
}

interface TimelinePreviewProps {
  visible: boolean;
}

export default function TimelinePreview({ visible }: TimelinePreviewProps) {
  return (
    <div
      className={`
        absolute inset-0 transition-opacity duration-1000
        ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
    >
      <Canvas
        camera={{ position: [0, 0.3, 5], fov: 55 }}
        style={{ position: "absolute", inset: 0 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#000000"]} />
        <PreviewLines />
        <fog attach="fog" args={["#000000", 2, 45]} />
      </Canvas>
    </div>
  );
}
