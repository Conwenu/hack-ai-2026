import { useEffect, useRef } from "react";
import type { ChatMessage } from "../../types";

interface ChatMessagesProps {
  messages: ChatMessage[];
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <div className="w-full max-w-2xl flex flex-col gap-4 overflow-y-auto max-h-[52vh] px-1 pb-2 scroll-smooth">
      {messages.map((msg, i) => (
        <div
          key={msg.id}
          className={`flex animate-fade-in ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          style={{ animationDelay: `${i * 40}ms` }}
        >
          {msg.role === "assistant" && (
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500/60 to-purple-800/60 border border-purple-500/20 mr-2 mt-1 self-start" />
          )}
          <div
            className={`
              max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed font-body
              ${
                msg.role === "user"
                  ? "bg-[#2a2a2a] text-white/85 rounded-br-sm border border-white/[0.07]"
                  : "bg-transparent text-white/60 rounded-bl-sm"
              }
            `}
          >
            {msg.content}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}