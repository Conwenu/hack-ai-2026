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

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.3;
    const target = isActive ? 1.3 : hovered ? 1.1 : 1;
    meshRef.current.scale.lerp(
      { x: target, y: target, z: target } as any,
      0.08
    );
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
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

      {/* Hover label only — no click detail here */}
      {hovered && !isActive && (
        <Html
          position={[0.6, 0.4, 0]}
          center={false}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              width: "130px",
              padding: "6px 10px",
              borderRadius: "8px",
              background: "rgba(0,0,0,0.85)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.9)",
                margin: 0,
                lineHeight: "1.4",
                wordBreak: "break-word",
                whiteSpace: "normal",
              }}
            >
              {step.title}
            </p>
          </div>
        </Html>
      )}

      {/* Active indicator label */}
      {isActive && (
        <Html
          position={[0.6, 0.4, 0]}
          center={false}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              width: "130px",
              padding: "6px 10px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.2)",
              backdropFilter: "blur(8px)",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "rgba(255,255,255,1)",
                margin: 0,
                lineHeight: "1.4",
                wordBreak: "break-word",
                whiteSpace: "normal",
              }}
            >
              {step.title}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}