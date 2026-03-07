import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { TIMELINE_Z_SPACING } from "../../animations/config";

interface TimelineCameraProps {
  activeIndex: number;
}

export default function TimelineCamera({ activeIndex }: TimelineCameraProps) {
  const { camera, gl } = useThree();

  const isOrbiting = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const target = useRef({ x: 0, y: 1.5, z: 6 });
  const current = useRef({ x: 0, y: 1.5, z: 6 });
  const fovTarget = useRef(60);

  useEffect(() => {
    const targetZ = -(activeIndex * TIMELINE_Z_SPACING) + 6;
    target.current.z = targetZ;
  }, [activeIndex]);

  useEffect(() => {
    const canvas = gl.domElement;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      fovTarget.current = Math.min(100, Math.max(20, fovTarget.current + e.deltaY * 0.05));
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 1) {
        isOrbiting.current = true;
        lastMouse.current = { x: e.clientX, y: e.clientY };
        e.preventDefault();
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isOrbiting.current) return;
      const dx = (e.clientX - lastMouse.current.x) * 0.015;
      const dy = (e.clientY - lastMouse.current.y) * 0.015;
      target.current.x -= dx;
      target.current.y += dy;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 1) isOrbiting.current = false;
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [gl]);

  useFrame(() => {
    if (!isOrbiting.current) {
      const xLimit = 8;
      const yLimitMin = -2;
      const yLimitMax = 6;

      if (Math.abs(target.current.x) > xLimit) {
        const overshoot = target.current.x - Math.sign(target.current.x) * xLimit;
        target.current.x -= overshoot * 0.06;
      }
      if (target.current.y < yLimitMin) {
        const overshoot = target.current.y - yLimitMin;
        target.current.y -= overshoot * 0.06;
      }
      if (target.current.y > yLimitMax) {
        const overshoot = target.current.y - yLimitMax;
        target.current.y -= overshoot * 0.06;
      }
    }

    current.current.x += (target.current.x - current.current.x) * 0.08;
    current.current.y += (target.current.y - current.current.y) * 0.08;
    current.current.z += (target.current.z - current.current.z) * 0.06;

    // Smooth FOV zoom
    const cam = camera as any;
    cam.fov += (fovTarget.current - cam.fov) * 0.1;
    cam.updateProjectionMatrix();

    camera.position.set(current.current.x, current.current.y, current.current.z);
    const lookZ = current.current.z - 6;
    camera.lookAt(current.current.x, 0, lookZ);
  });

  return null;
}