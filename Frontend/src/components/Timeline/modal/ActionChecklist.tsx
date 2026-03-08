import { useState } from "react";

interface ActionChecklistProps {
  text: string;
}

function parseIntoItems(text: string): string[] {
  return text
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);
}

export default function ActionChecklist({ text }: ActionChecklistProps) {
  const items = parseIntoItems(text);
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const toggle = (i: number) =>
    setChecked((prev) => ({ ...prev, [i]: !prev[i] }));

  const completedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
          Action Items
        </p>
        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", margin: 0 }}>
          {completedCount} / {items.length}
        </p>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: "100%",
          height: "2px",
          background: "rgba(255,255,255,0.06)",
          borderRadius: "9999px",
          marginBottom: "16px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${items.length ? (completedCount / items.length) * 100 : 0}%`,
            background: "rgba(255,255,255,0.4)",
            borderRadius: "9999px",
            transition: "width 0.4s ease",
          }}
        />
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {items.map((item, i) => (
          <div
            key={i}
            onClick={() => toggle(i)}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              cursor: "pointer",
              padding: "10px 12px",
              borderRadius: "10px",
              background: checked[i] ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
              border: checked[i] ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.04)",
              transition: "all 0.2s",
            }}
          >
            <div
              style={{
                flexShrink: 0,
                marginTop: "2px",
                width: "16px",
                height: "16px",
                borderRadius: "4px",
                border: checked[i] ? "1px solid rgba(255,255,255,0.5)" : "1px solid rgba(255,255,255,0.2)",
                background: checked[i] ? "rgba(255,255,255,0.15)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              {checked[i] && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5L3.5 6L8 1" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <p
              style={{
                fontSize: "13px",
                color: checked[i] ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)",
                lineHeight: "1.7",
                margin: 0,
                textDecoration: checked[i] ? "line-through" : "none",
                transition: "all 0.2s",
              }}
            >
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}