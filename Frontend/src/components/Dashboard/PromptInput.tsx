import { useState, useRef, useEffect } from "react";

interface PromptInputProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  compact?: boolean;
}

export default function PromptInput({
  onSubmit,
  disabled = false,
  placeholder = "What goal do you want to achieve?",
  compact = false,
}: PromptInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, compact ? 56 : 200) + "px";
  }, [value, compact]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit = Boolean(value.trim()) && !disabled;

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        borderRadius: "9999px",
        border: "1px solid rgba(255,255,255,0.15)",
        background: "#1a1a1a",
        padding: compact ? "0.5rem 1rem" : "0.75rem 1.25rem",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 8px 40px rgba(255,255,255,0.07), 0 16px 60px rgba(255,255,255,0.04), 0 2px 12px rgba(0,0,0,0.9)",
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? "none" : "auto",
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        style={{
          flex: 1,
          background: "transparent",
          resize: "none",
          outline: "none",
          border: "none",
          color: "rgba(255,255,255,0.9)",
          fontFamily: "Saira, sans-serif",
          fontSize: "0.875rem",
          lineHeight: "1.6",
          minHeight: "24px",
          maxHeight: "200px",
        }}
        className="placeholder-white/30"
      />

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        aria-label="Send"
        style={{
          flexShrink: 0,
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: canSubmit ? "white" : "rgba(255,255,255,0.1)",
          color: canSubmit ? "black" : "rgba(255,255,255,0.2)",
          cursor: canSubmit ? "pointer" : "not-allowed",
          border: "none",
          transition: "background 0.2s",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 11.5V2.5M7 2.5L3 6.5M7 2.5L11 6.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}