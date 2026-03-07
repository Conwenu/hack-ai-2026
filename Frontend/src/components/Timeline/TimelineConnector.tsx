import { useMemo } from "react";
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
  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const verts = new Float32Array([...from, ...to]);
    geo.setAttribute("position", new Float32BufferAttribute(verts, 3));
    return geo;
  }, [from, to]);

  return (
    <group>
      {/* Outer glow — thick, very transparent */}
      <line geometry={geometry}>
        {/* @ts-ignore */}
        <lineBasicMaterial
          color="#ff0000"
          transparent
          opacity={0.08}
          linewidth={8}
        />
      </line>

      {/* Mid glow — medium thickness */}
      <line geometry={geometry}>
        {/* @ts-ignore */}
        <lineBasicMaterial
          color="#ff2020"
          transparent
          opacity={active ? 0.25 : 0.08}
          linewidth={4}
        />
      </line>

      {/* Core line — bright and sharp */}
      <line geometry={geometry}>
        {/* @ts-ignore */}
        <lineBasicMaterial
          color={active ? "#ff4444" : "#660000"}
          transparent
          opacity={active ? 1 : 0.4}
          linewidth={2}
        />
      </line>
    </group>
  );
}