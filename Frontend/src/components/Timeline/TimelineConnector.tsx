import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, Float32BufferAttribute, CatmullRomCurve3, Vector3, TubeGeometry } from "three";

interface TimelineConnectorProps {
  from: [number, number, number];
  to: [number, number, number];
  active: boolean;
  isBranchConnector?: boolean;
  isCurved?: boolean;
}

export default function TimelineConnector({
  from,
  to,
  active,
  isBranchConnector = false,
  isCurved = false,
}: TimelineConnectorProps) {
  const sparkRef = useRef<any>(null);
  const coreRef = useRef<any>(null);
  const midRef = useRef<any>(null);
  const tickRef = useRef(0);
  const jitterOffsets = useRef<number[]>([]);
  const jitterTargets = useRef<number[]>([]);

  const baseGeometry = useMemo(() => {
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(new Float32Array([...from, ...to]), 3));
    return geo;
  }, [from, to]);

  const curvedTubeGeo = useMemo(() => {
    if (!isCurved) return null;

    const start = new Vector3(...from);
    const end = new Vector3(...to);

    const dx = end.x - start.x;
    const dz = end.z - start.z;

    let cp1: Vector3, cp2: Vector3;

    if (Math.abs(dx) > 0.1) {
      cp1 = new Vector3(start.x, start.y, start.z + dz * 0.35);
      cp2 = new Vector3(end.x, end.y, end.z - dz * 0.35);
    } else {
      const mid = new Vector3().addVectors(start, end).multiplyScalar(0.5);
      cp1 = mid.clone();
      cp2 = mid.clone();
    }

    const curve = new CatmullRomCurve3([start, cp1, cp2, end], false, "catmullrom", 0.5);
    return new TubeGeometry(curve, 32, 0.012, 6, false);
  }, [from, to, isCurved]);

  const curvedLineGeo = useMemo(() => {
    if (!isCurved) return null;

    const start = new Vector3(...from);
    const end = new Vector3(...to);
    const dx = end.x - start.x;
    const dz = end.z - start.z;

    const segments = 20;
    const points: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const smoothT = t * t * (3 - 2 * t);
      const x = from[0] + dx * smoothT;
      const y = from[1] + (to[1] - from[1]) * t;
      const z = from[2] + dz * t;
      points.push(x, y, z);
    }

    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(new Float32Array(points), 3));
    return geo;
  }, [from, to, isCurved]);

  const electricGeometry = useMemo(() => new BufferGeometry(), []);

  useFrame(() => {
    if (isCurved) {
      if (sparkRef.current) {
        sparkRef.current.opacity = 0.06 + Math.random() * 0.08;
      }
      if (coreRef.current) {
        coreRef.current.opacity = 0.15 + Math.sin(Date.now() * 0.003) * 0.05;
      }
      return;
    }

    const segments = 10;

    if (jitterOffsets.current.length === 0) {
      jitterOffsets.current = new Array(segments + 1).fill(0);
      jitterTargets.current = new Array(segments + 1).fill(0);
    }

    tickRef.current++;

    if (tickRef.current % 4 === 0) {
      for (let i = 1; i < segments; i++) {
        jitterTargets.current[i] = (Math.random() - 0.5) * (isBranchConnector ? 0.06 : 0.1);
      }
    }

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
        from[2] + (to[2] - from[2]) * t
      );
    }

    electricGeometry.setAttribute(
      "position",
      new Float32BufferAttribute(new Float32Array(points), 3)
    );
    electricGeometry.attributes.position.needsUpdate = true;

    if (sparkRef.current) {
      sparkRef.current.opacity = active
        ? 0.3 + Math.random() * 0.3
        : isBranchConnector
        ? 0.04 + Math.random() * 0.06
        : 0.08 + Math.random() * 0.1;
    }
    if (coreRef.current) {
      coreRef.current.opacity = active
        ? 0.5 + Math.random() * 0.2
        : isBranchConnector
        ? 0.06 + Math.random() * 0.06
        : 0.1 + Math.random() * 0.08;
    }
    if (midRef.current) {
      midRef.current.opacity = active
        ? 0.1 + Math.random() * 0.1
        : 0.03 + Math.random() * 0.03;
    }
  });

  const sparkColor = isBranchConnector ? "#a78bfa" : "#67e8f9";
  const coreColor = isBranchConnector
    ? "#c4b5fd"
    : active ? "#ecfeff" : "#0891b2";
  const midColor = isBranchConnector ? "#7c3aed" : "#06b6d4";

  if (isCurved && curvedTubeGeo) {
    return (
      <group>
        <mesh geometry={curvedTubeGeo}>
          <meshStandardMaterial
            ref={coreRef}
            color={coreColor}
            emissive={midColor}
            emissiveIntensity={0.6}
            transparent
            opacity={0.15}
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>

        <mesh geometry={curvedTubeGeo} scale={[2.2, 2.2, 1]}>
          <meshStandardMaterial
            ref={sparkRef}
            color={sparkColor}
            emissive={midColor}
            emissiveIntensity={0.4}
            transparent
            opacity={0.06}
            roughness={0.5}
          />
        </mesh>

        {curvedLineGeo && (
          <line geometry={curvedLineGeo}>
            {/* @ts-ignore */}
            <lineBasicMaterial color={sparkColor} transparent opacity={0.12} linewidth={1} />
          </line>
        )}
      </group>
    );
  }

  return (
    <group>
      <line geometry={baseGeometry}>
        {/* @ts-ignore */}
        <lineBasicMaterial color={isBranchConnector ? "#2e1065" : "#164e63"} transparent opacity={0.06} linewidth={6} />
      </line>
      <line geometry={baseGeometry}>
        {/* @ts-ignore */}
        <lineBasicMaterial ref={midRef} color={midColor} transparent opacity={active ? 0.2 : 0.05} linewidth={3} />
      </line>
      <line geometry={electricGeometry}>
        {/* @ts-ignore */}
        <lineBasicMaterial ref={sparkRef} color={sparkColor} transparent opacity={isBranchConnector ? 0.08 : active ? 0.85 : 0.25} linewidth={2} />
      </line>
      <line geometry={electricGeometry}>
        {/* @ts-ignore */}
        <lineBasicMaterial ref={coreRef} color={coreColor} transparent opacity={isBranchConnector ? 0.12 : active ? 1 : 0.35} linewidth={1} />
      </line>
    </group>
  );
}