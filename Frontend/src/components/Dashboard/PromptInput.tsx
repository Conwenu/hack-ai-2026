import { useState, useRef, useEffect } from "react";

interface PromptInputProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  compact?: boolean;
}

// ── Speech Recognition setup ──
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function PromptInput({
  onSubmit,
  disabled = false,
  placeholder = "What goal do you want to achieve?",
  compact = false,
}: PromptInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

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

  const toggleListening = () => {
    if (!SpeechRecognition) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setValue((prev) => {
        // If there was already text, append after a space
        const base = prev.trim();
        return base ? base + " " + transcript : transcript;
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const canSubmit = Boolean(value.trim()) && !disabled;
  const hasSpeech = Boolean(SpeechRecognition);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        borderRadius: "9999px",
        border: isListening
          ? "1px solid rgba(239,68,68,0.4)"
          : "1px solid rgba(255,255,255,0.15)",
        background: "#1a1a1a",
        padding: compact ? "0.5rem 1rem" : "0.75rem 1.25rem",
        boxShadow: isListening
          ? "0 0 0 1px rgba(239,68,68,0.2), 0 0 20px rgba(239,68,68,0.1), 0 8px 40px rgba(255,255,255,0.04), 0 2px 12px rgba(0,0,0,0.9)"
          : "0 0 0 1px rgba(255,255,255,0.08), 0 8px 40px rgba(255,255,255,0.07), 0 16px 60px rgba(255,255,255,0.04), 0 2px 12px rgba(0,0,0,0.9)",
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
        placeholder={isListening ? "Listening..." : placeholder}
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

      {/* Mic button */}
      {hasSpeech && (
        <button
          onClick={toggleListening}
          disabled={disabled}
          aria-label={isListening ? "Stop recording" : "Voice input"}
          style={{
            flexShrink: 0,
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isListening
              ? "rgba(239,68,68,0.2)"
              : "rgba(255,255,255,0.06)",
            color: isListening
              ? "#ef4444"
              : "rgba(255,255,255,0.35)",
            cursor: "pointer",
            border: isListening
              ? "1px solid rgba(239,68,68,0.3)"
              : "1px solid rgba(255,255,255,0.1)",
            transition: "all 0.2s",
            animation: isListening ? "mic-pulse 1.5s ease-in-out infinite" : "none",
          }}
        >
          {isListening ? (
            /* Stop icon */
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <rect x="1" y="1" width="8" height="8" rx="1" />
            </svg>
          ) : (
            /* Mic icon */
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <rect x="5.5" y="1" width="5" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 7.5a5 5 0 0010 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M8 13.5v1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </button>
      )}

      {/* Send button */}
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