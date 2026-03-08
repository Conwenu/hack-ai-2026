import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { TIMELINE_Z_SPACING, CAMERA_Z_OFFSET } from "../../animations/config";
import { useAppStore } from "../../stores/useAppStore";

interface TimelineCameraProps {
  activeIndex: number;
}

const LEFT_DRAG_SPEED = 0.04;
const MIDDLE_DRAG_SPEED = 0.015;
const LERP_POS = 0.08;
const LERP_Z = 0.06;
const DRAG_THRESHOLD = 3;
const Z_PADDING = 8; // how far past the first/last node you can travel

export default function TimelineCamera({ activeIndex }: TimelineCameraProps) {
  const { camera, gl } = useThree();

  const isLeftDragging = useRef(false);
  const leftDragStart = useRef({ x: 0, y: 0 });
  const leftLastMouse = useRef({ x: 0, y: 0 });
  const leftDidDrag = useRef(false);

  const isMiddleDragging = useRef(false);
  const middleLastMouse = useRef({ x: 0, y: 0 });

  const baseZ = useRef(-(activeIndex * TIMELINE_Z_SPACING) + CAMERA_Z_OFFSET);
  const panOffset = useRef({ x: 0, y: 0, z: 0 });
  const fovTarget = useRef(60);

  const current = useRef({
    x: 0,
    y: 1.5,
    z: baseZ.current,
  });

  useEffect(() => {
    baseZ.current = -(activeIndex * TIMELINE_Z_SPACING) + CAMERA_Z_OFFSET;
  }, [activeIndex]);

  useEffect(() => {
    const onRefocus = () => {
      panOffset.current = { x: 0, y: 0, z: 0 };
      fovTarget.current = 60;
    };
    window.addEventListener("timeline-refocus", onRefocus);
    return () => window.removeEventListener("timeline-refocus", onRefocus);
  }, []);

  // Clamp the Z pan offset so you can't fly infinitely past the timeline
  const clampZ = () => {
    const totalSteps = useAppStore.getState().nav.totalSteps;
    const timelineLength = (totalSteps - 1) * TIMELINE_Z_SPACING;
    // Max forward (positive Z) = can't go much past the first node
    // Max backward (negative Z) = can't go much past the last node
    const maxForward = Z_PADDING;
    const maxBackward = -(timelineLength + Z_PADDING) + baseZ.current - CAMERA_Z_OFFSET;
    // panOffset.z shifts the camera: positive = forward, negative = backward
    // We need to figure bounds relative to baseZ
    const minZ = -(timelineLength + Z_PADDING) - baseZ.current + CAMERA_Z_OFFSET;
    const maxZ = Z_PADDING - baseZ.current + CAMERA_Z_OFFSET;
    panOffset.current.z = Math.max(minZ, Math.min(maxZ, panOffset.current.z));
  };

  useEffect(() => {
    const canvas = gl.domElement;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      fovTarget.current = Math.min(100, Math.max(20, fovTarget.current + e.deltaY * 0.05));
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button === 0) {
        isLeftDragging.current = true;
        leftDidDrag.current = false;
        leftDragStart.current = { x: e.clientX, y: e.clientY };
        leftLastMouse.current = { x: e.clientX, y: e.clientY };
      } else if (e.button === 1) {
        isMiddleDragging.current = true;
        middleLastMouse.current = { x: e.clientX, y: e.clientY };
        e.preventDefault();
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isLeftDragging.current) {
        const totalDx = e.clientX - leftDragStart.current.x;
        const totalDy = e.clientY - leftDragStart.current.y;
        if (!leftDidDrag.current && Math.hypot(totalDx, totalDy) > DRAG_THRESHOLD) {
          leftDidDrag.current = true;
          canvas.style.pointerEvents = "none";
          canvas.setPointerCapture(e.pointerId);
        }

        if (leftDidDrag.current) {
          const dy = (e.clientY - leftLastMouse.current.y) * LEFT_DRAG_SPEED;
          panOffset.current.z -= dy;
          clampZ();
        }
        leftLastMouse.current = { x: e.clientX, y: e.clientY };
      }

      if (isMiddleDragging.current) {
        const dx = (e.clientX - middleLastMouse.current.x) * MIDDLE_DRAG_SPEED;
        const dy = (e.clientY - middleLastMouse.current.y) * MIDDLE_DRAG_SPEED;
        panOffset.current.x -= dx;
        panOffset.current.y += dy;
        middleLastMouse.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.button === 0) {
        if (leftDidDrag.current) {
          try { canvas.releasePointerCapture(e.pointerId); } catch { /* ok */ }
          requestAnimationFrame(() => {
            canvas.style.pointerEvents = "auto";
          });
        }
        isLeftDragging.current = false;
      } else if (e.button === 1) {
        isMiddleDragging.current = false;
      }
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [gl]);

  useFrame(() => {
    const targetX = panOffset.current.x;
    const targetY = 1.5 + panOffset.current.y;
    const targetZ = baseZ.current + panOffset.current.z;

    current.current.x += (targetX - current.current.x) * LERP_POS;
    current.current.y += (targetY - current.current.y) * LERP_POS;
    current.current.z += (targetZ - current.current.z) * LERP_Z;

    const cam = camera as any;
    cam.fov += (fovTarget.current - cam.fov) * 0.1;
    cam.updateProjectionMatrix();

    camera.position.set(
      current.current.x,
      current.current.y,
      current.current.z,
    );

    camera.lookAt(
      current.current.x,
      0,
      current.current.z - CAMERA_Z_OFFSET,
    );
  });

  return null;
}