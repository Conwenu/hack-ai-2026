interface StepBadgeProps {
  index: number;
}

export default function StepBadge({ index }: StepBadgeProps) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: "9999px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        marginBottom: "14px",
        lineHeight: 1,
      }}
    >
      <span
        style={{
          fontSize: "10px",
          color: "rgba(255,255,255,0.35)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          display: "block",
        }}
      >
        Step {index + 1}
      </span>
    </div>
  );
}