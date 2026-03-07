// ============================================================
// Ripple – PromptInput Component
// ============================================================

import { useState, useRef, useEffect } from "react";

interface PromptInputProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  compact?: boolean; // true when input is docked at bottom during timeline view
}

export default function PromptInput({
  onSubmit,
  disabled = false,
  placeholder = "What goal do you want to achieve?",
  compact = false,
}: PromptInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, compact ? 80 : 200) + "px";
  }, [value, compact]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={`
        w-full max-w-2xl mx-auto
        rounded-2xl border border-white/10
        bg-white/5 backdrop-blur-md
        transition-all duration-300
        ${compact ? "px-4 py-2" : "px-6 py-4"}
        ${disabled ? "opacity-50 pointer-events-none" : ""}
      `}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className={`
          w-full bg-transparent resize-none outline-none
          text-white/90 placeholder-white/30
          ${compact ? "text-sm" : "text-base"}
        `}
      />

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-white/20">
          {compact ? "" : "Shift + Enter for new line"}
        </span>
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || disabled}
          className={`
            px-4 py-1.5 rounded-lg text-sm font-medium
            transition-colors duration-200
            ${
              value.trim() && !disabled
                ? "bg-white/10 text-white hover:bg-white/20"
                : "bg-white/5 text-white/20 cursor-not-allowed"
            }
          `}
        >
          Send
        </button>
      </div>
    </div>
  );
}
