import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { TIMELINE_Z_SPACING } from "../../animations/config";

interface TimelineCameraProps {
  totalSteps: number;
}

export default function TimelineCamera({ totalSteps }: TimelineCameraProps) {
  const { camera, gl } = useThree();
  const isPanning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const targetPosition = useRef({ x: 0, y: 1.5, z: 0 });
  const currentPosition = useRef({ x: 0, y: 1.5, z: 0 });

  useEffect(() => {
    // Pull camera back to see all nodes
    const totalDepth = (totalSteps - 1) * TIMELINE_Z_SPACING;
    const midZ = -totalDepth / 2;
    const pullBack = Math.max(10, totalSteps * 2.5);
    targetPosition.current = { x: 0, y: 1.5, z: midZ + pullBack };
    currentPosition.current = { x: 0, y: 1.5, z: midZ + pullBack };
    camera.position.set(0, 1.5, midZ + pullBack);
    camera.lookAt(0, 0, midZ);
  }, [totalSteps]);

  useEffect(() => {
    const canvas = gl.domElement;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetPosition.current.z += e.deltaY * 0.01;
    };

    const onMiddleDown = (e: MouseEvent) => {
      if (e.button === 1) {
        isPanning.current = true;
        lastMouse.current = { x: e.clientX, y: e.clientY };
        e.preventDefault();
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isPanning.current) return;
      const dx = (e.clientX - lastMouse.current.x) * 0.01;
      const dy = (e.clientY - lastMouse.current.y) * 0.01;
      targetPosition.current.x -= dx;
      targetPosition.current.y += dy;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 1) isPanning.current = false;
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("mousedown", onMiddleDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("mousedown", onMiddleDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [gl]);

  useFrame(() => {
    const t = targetPosition.current;
    const c = currentPosition.current;
    c.x += (t.x - c.x) * 0.08;
    c.y += (t.y - c.y) * 0.08;
    c.z += (t.z - c.z) * 0.08;
    camera.position.set(c.x, c.y, c.z);

    const totalDepth = (totalSteps - 1) * TIMELINE_Z_SPACING;
    camera.lookAt(c.x, 0, -totalDepth / 2);
  });

  return null;
}