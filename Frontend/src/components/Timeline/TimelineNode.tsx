import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { Mesh } from "three";
import type { TimelineStep } from "../../types";

interface TimelineNodeProps {
  step: TimelineStep;
  position: [number, number, number];
  isActive: boolean;
  modalOpen: boolean;
  onClick: () => void;
}

export default function TimelineNode({
  step,
  position,
  isActive,
  modalOpen,
  onClick,
}: TimelineNodeProps) {
  const meshRef = useRef<Mesh>(null);
  const ringRef = useRef<Mesh>(null);
  const innerRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    meshRef.current.rotation.y += delta * (isActive ? 0.8 : 0.3);
    meshRef.current.rotation.x += delta * (isActive ? 0.3 : 0.1);

    const target = isActive ? 1.35 : hovered ? 1.15 : 1;
    meshRef.current.scale.lerp({ x: target, y: target, z: target } as any, 0.1);

    if (ringRef.current) {
      ringRef.current.rotation.z += delta * (isActive ? -1.2 : -0.5);
      ringRef.current.rotation.x =
        Math.PI / 2 + Math.sin(Date.now() * 0.001) * 0.3;
      const ringTarget = isActive ? 1.5 : hovered ? 1.2 : 0.85;
      ringRef.current.scale.lerp(
        { x: ringTarget, y: ringTarget, z: ringTarget } as any,
        0.08,
      );
    }

    if (innerRef.current) {
      const pulse = 0.85 + Math.sin(Date.now() * 0.003) * 0.15;
      innerRef.current.scale.setScalar(pulse);
    }
  });

  const showHoverLabel = hovered && !isActive && !modalOpen;
  const showActiveLabel = isActive && !modalOpen;

  const nodeColor = isActive ? "#ffffff" : hovered ? "#67e8f9" : "#0891b2";
  const emissiveColor = isActive ? "#ffffff" : hovered ? "#22d3ee" : "#0e7490";
  const emissiveIntensity = isActive ? 0.6 : hovered ? 0.9 : 0.4;

  return (
    <group position={position}>
      {/* Outer wireframe octahedron */}
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
        <octahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          wireframe={true}
          transparent
          opacity={isActive ? 0.9 : hovered ? 0.7 : 0.4}
        />
      </mesh>

      {/* Solid inner core */}
      <mesh ref={innerRef}>
        <octahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity * 1.5}
          transparent
          opacity={isActive ? 1 : hovered ? 0.85 : 0.55}
          roughness={0.1}
          metalness={0.6}
        />
      </mesh>

      {/* Orbiting torus ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.38, 0.018, 6, 48]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={isActive ? 0.75 : hovered ? 0.5 : 0.25}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Gold glow shell */}
      <mesh>
        <octahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#b45309"
          emissiveIntensity={isActive ? 1.8 : hovered ? 1.2 : 0.5}
          wireframe={true}
          transparent
          opacity={isActive ? 0.35 : hovered ? 0.25 : 0.15}
        />
      </mesh>

      {showHoverLabel && (
        <Html
          position={[0.7, 0.45, 0]}
          center={false}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              width: "130px",
              padding: "6px 10px",
              borderRadius: "8px",
              background: "rgba(0,0,0,0.88)",
              border: "1px solid rgba(255,255,255,0.12)",
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

      {showActiveLabel && (
        <Html
          position={[0.7, 0.45, 0]}
          center={false}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              width: "130px",
              padding: "6px 10px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.09)",
              border: "1px solid rgba(255,255,255,0.22)",
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
