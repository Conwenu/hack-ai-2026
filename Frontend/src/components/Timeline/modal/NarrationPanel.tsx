interface NarrationPanelProps {
  text: string;
}

export default function NarrationPanel({ text }: NarrationPanelProps) {
  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "14px 16px",
        background: "rgba(103,232,249,0.04)",
        border: "1px solid rgba(103,232,249,0.1)",
        borderRadius: "12px",
      }}
    >
      <p
        style={{
          fontSize: "10px",
          color: "rgba(103,232,249,0.5)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          margin: "0 0 8px 0",
          fontWeight: 600,
        }}
      >
        Narration
      </p>
      <p
        style={{
          fontSize: "13px",
          color: "rgba(255,255,255,0.6)",
          lineHeight: "1.7",
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}