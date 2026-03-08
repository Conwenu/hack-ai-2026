import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, Float32BufferAttribute } from "three";

interface TimelineConnectorProps {
  from: [number, number, number];
  to: [number, number, number];
  active: boolean;
}

export default function TimelineConnector({
  from,
  to,
  active,
}: TimelineConnectorProps) {
  const sparkRef = useRef<any>(null);
  const coreRef = useRef<any>(null);
  const midRef = useRef<any>(null);
  const tickRef = useRef(0);

  const baseGeometry = useMemo(() => {
    const geo = new BufferGeometry();
    geo.setAttribute(
      "position",
      new Float32BufferAttribute(new Float32Array([...from, ...to]), 3),
    );
    return geo;
  }, [from, to]);

  const electricGeometry = useMemo(() => new BufferGeometry(), []);

  const jitterOffsets = useRef<number[]>([]);
  const jitterTargets = useRef<number[]>([]);

  useFrame(() => {
    const segments = 10;

    // Initialize on first run
    if (jitterOffsets.current.length === 0) {
      jitterOffsets.current = new Array(segments + 1).fill(0);
      jitterTargets.current = new Array(segments + 1).fill(0);
    }

    tickRef.current++;

    // Pick new random targets every 4 frames
    if (tickRef.current % 4 === 0) {
      for (let i = 1; i < segments; i++) {
        jitterTargets.current[i] = (Math.random() - 0.5) * 0.1;
      }
    }

    // Always lerp toward targets — this runs every frame so movement is continuous
    for (let i = 0; i < jitterOffsets.current.length; i++) {
      jitterOffsets.current[i] +=
        (jitterTargets.current[i] - jitterOffsets.current[i]) * 0.35;
    }

    const points: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const isEndpoint = i === 0 || i === segments;
      const offset = isEndpoint ? 0 : jitterOffsets.current[i];

      points.push(
        from[0] + (to[0] - from[0]) * t + offset,
        from[1] + (to[1] - from[1]) * t + offset * 0.5,
        from[2] + (to[2] - from[2]) * t,
      );
    }

    electricGeometry.setAttribute(
      "position",
      new Float32BufferAttribute(new Float32Array(points), 3),
    );
    electricGeometry.attributes.position.needsUpdate = true;

    if (sparkRef.current) {
      sparkRef.current.opacity = active
        ? 0.3 + Math.random() * 0.3
        : 0.08 + Math.random() * 0.1;
    }
    if (coreRef.current) {
      coreRef.current.opacity = active
        ? 0.5 + Math.random() * 0.2
        : 0.1 + Math.random() * 0.08;
    }
    if (midRef.current) {
      midRef.current.opacity = active
        ? 0.1 + Math.random() * 0.1
        : 0.03 + Math.random() * 0.03;
    }
  });

  return (
    <group>
      {/* Soft ambient glow — static straight line */}
      <line geometry={baseGeometry}>
        {/* @ts-ignore */}
        <lineBasicMaterial
          color="#164e63"
          transparent
          opacity={0.08}
          linewidth={6}
        />
      </line>

      {/* Mid glow — static, flickering opacity */}
      <line geometry={baseGeometry}>
        {/* @ts-ignore */}
        <lineBasicMaterial
          ref={midRef}
          color="#06b6d4"
          transparent
          opacity={active ? 0.2 : 0.06}
          linewidth={3}
        />
      </line>

      {/* Electric bolt — jagged, fast flicker */}
      <line geometry={electricGeometry}>
        {/* @ts-ignore */}
        <lineBasicMaterial
          ref={sparkRef}
          color="#67e8f9"
          transparent
          opacity={active ? 0.85 : 0.25}
          linewidth={2}
        />
      </line>

      {/* Core — brightest, white-cyan */}
      <line geometry={electricGeometry}>
        {/* @ts-ignore */}
        <lineBasicMaterial
          ref={coreRef}
          color={active ? "#ecfeff" : "#0891b2"}
          transparent
          opacity={active ? 1 : 0.35}
          linewidth={1}
        />
      </line>
    </group>
  );
}
