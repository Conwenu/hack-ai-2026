// ============================================================
// Ripple – ChatMessages Component
// ============================================================

import type { ChatMessage } from "../../types";

interface ChatMessagesProps {
  messages: ChatMessage[];
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  if (messages.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-3 mb-6">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`
            px-4 py-3 rounded-xl text-sm leading-relaxed
            animate-fade-in
            ${
              msg.role === "user"
                ? "bg-white/10 text-white/80 self-end ml-12"
                : "bg-white/5 text-white/60 self-start mr-12 border border-white/5"
            }
          `}
        >
          {msg.content}
        </div>
      ))}
    </div>
  );
}
