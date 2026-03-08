import { useMemo } from "react";
import { useAppStore } from "../../stores/useAppStore";
import { TIMELINE_Z_SPACING } from "../../animations/config";
import TimelineNode from "./TimelineNode";
import TimelineConnector from "./TimelineConnector";
import TimelineCamera from "./TimelineCamera";
import type { TimelineStep, Branch } from "../../types";

interface TimelineSceneProps {
  onNodeClick: (step: TimelineStep, isBranch?: boolean, branchId?: string) => void;
  modalOpen: boolean;
}

const BRANCH_X_OFFSET = 3.2;
const BRANCH_Z_SPACING = TIMELINE_Z_SPACING; // Same spacing as main — branches are peers

export default function TimelineScene({ onNodeClick, modalOpen }: TimelineSceneProps) {
  const { currentGoal, nav, navigateTo } = useAppStore();
  const steps = currentGoal?.steps ?? [];
  const branches = currentGoal?.branches ?? [];

  // Map parent step index → branch
  const branchByParentIndex = useMemo(() => {
    const map = new Map<number, Branch[]>();
    for (const branch of branches) {
      const idx = steps.findIndex((s) => s.id === branch.parentStepId);
      if (idx !== -1) {
        const existing = map.get(idx) ?? [];
        existing.push(branch);
        map.set(idx, existing);
      }
    }
    return map;
  }, [branches, steps]);

  // Main-line positions (unchanged)
  const mainPositions = useMemo<[number, number, number][]>(() => {
    const positions: [number, number, number][] = [];
    let z = 0;
    for (let i = 0; i < steps.length; i++) {
      positions.push([0, 0, -z]);
      z += TIMELINE_Z_SPACING;
    }
    return positions;
  }, [steps]);

  // Branch positions — diverge and never reconverge
  const branchPositions = useMemo(() => {
    const result = new Map<string, [number, number, number][]>();
    for (const [parentIdx, branchList] of branchByParentIndex.entries()) {
      branchList.forEach((branch, branchOffset) => {
        const parentZ = mainPositions[parentIdx]?.[2] ?? 0;
        // Stack multiple branches from the same parent horizontally
        const xOffset = BRANCH_X_OFFSET * (branchOffset + 1);
        const positions: [number, number, number][] = branch.steps.map((_, i) => [
          xOffset,
          0,
          parentZ - (i + 1) * BRANCH_Z_SPACING,
        ]);
        result.set(branch.id, positions);
      });
    }
    return result;
  }, [branchByParentIndex, mainPositions]);

  // Is a given node the active one?
  const isNodeActive = (branchId: "main" | string, stepIndex: number) =>
    nav.location.branchId === branchId && nav.location.stepIndex === stepIndex;

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -3, -10]} intensity={0.3} color="#4466ff" />

      <TimelineCamera activeIndex={nav.location.stepIndex} />

      {/* ── Main-line connectors ── */}
      {mainPositions.map((pos, i) => {
        if (i === mainPositions.length - 1) return null;
        return (
          <TimelineConnector
            key={`main-conn-${i}`}
            from={pos}
            to={mainPositions[i + 1]}
            active={
              nav.location.branchId === "main" && i < nav.location.stepIndex
            }
          />
        );
      })}

      {/* ── Main-line nodes ── */}
      {steps.map((step: TimelineStep, i: number) => (
        <TimelineNode
          key={step.id}
          step={step}
          position={mainPositions[i]}
          isActive={isNodeActive("main", i)}
          modalOpen={modalOpen}
          isBranch={false}
          onClick={() => {
            navigateTo({ branchId: "main", stepIndex: i });
            onNodeClick(step, false);
          }}
        />
      ))}

      {/* ── Branches — diverge only, same styling as main ── */}
      {branches.map((branch) => {
        const parentIdx = steps.findIndex((s) => s.id === branch.parentStepId);
        const bPositions = branchPositions.get(branch.id) ?? [];
        const parentPos = mainPositions[parentIdx];

        return (
          <group key={branch.id}>
            {/* Connector from parent to first branch node — curved */}
            {parentPos && bPositions[0] && (
              <TimelineConnector
                from={parentPos}
                to={bPositions[0]}
                active={nav.location.branchId === branch.id}
                isCurved={true}
              />
            )}

            {/* Intra-branch connectors — same style as main */}
            {bPositions.map((pos, i) => {
              if (i === bPositions.length - 1) return null;
              return (
                <TimelineConnector
                  key={`b-conn-${branch.id}-${i}`}
                  from={pos}
                  to={bPositions[i + 1]}
                  active={
                    nav.location.branchId === branch.id &&
                    i < nav.location.stepIndex
                  }
                />
              );
            })}

            {/* NO reconnect connector — branches diverge forever */}

            {/* Branch nodes — same visual as main */}
            {branch.steps.map((step, i) => (
              <TimelineNode
                key={step.id}
                step={step}
                position={bPositions[i]}
                isActive={isNodeActive(branch.id, i)}
                modalOpen={modalOpen}
                isBranch={false} // ← same styling as main nodes
                onClick={() => {
                  navigateTo({ branchId: branch.id, stepIndex: i });
                  onNodeClick(step, true, branch.id);
                }}
              />
            ))}
          </group>
        );
      })}

      <fog attach="fog" args={["#000000", 15, 60]} />
    </>
  );
}