// ============================================================
// Ripple – TimelineCamera (smooth z-axis follow)
// ============================================================

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { TIMELINE_Z_SPACING, CAMERA_Z_OFFSET } from "../../animations/config";

interface TimelineCameraProps {
  activeIndex: number;
}

export default function TimelineCamera({ activeIndex }: TimelineCameraProps) {
  const { camera } = useThree();
  const targetZ = useRef(0);

  useFrame(() => {
    // Target z position: the active node's z minus a comfortable offset
    targetZ.current = -(activeIndex * TIMELINE_Z_SPACING) + CAMERA_Z_OFFSET;

    // Smooth lerp toward target
    camera.position.z += (targetZ.current - camera.position.z) * 0.06;

    // Keep camera looking slightly ahead
    const lookZ = camera.position.z - CAMERA_Z_OFFSET;
    camera.lookAt(0, 0, lookZ);
  });

  return null;
}
