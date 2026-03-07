// ============================================================
// Ripple – TimelineConnector (line between nodes on z-axis)
// ============================================================

import { useMemo } from "react";
import { Vector3, BufferGeometry, Float32BufferAttribute } from "three";

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
  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const verts = new Float32Array([...from, ...to]);
    geo.setAttribute("position", new Float32BufferAttribute(verts, 3));
    return geo;
  }, [from, to]);

  return (
    <line geometry={geometry}>
      {/* @ts-ignore — r3f line material typing */}
      <lineBasicMaterial
        color={active ? "#ffffff" : "#333333"}
        transparent
        opacity={active ? 0.6 : 0.2}
      />
    </line>
  );
}
