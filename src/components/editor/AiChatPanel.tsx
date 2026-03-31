"use client";

import { useState, useRef, useEffect } from "react";
import type { Section, SectionType } from "@/types/artifact";
import type { ChatMessage, ChatSuggestion, ChatScope } from "@/hooks/useAiChat";
import { getQuickChips } from "@/hooks/useAiChat";
import { Sparkles, Send, Loader2, Check, X, RotateCcw } from "lucide-react";

interface AiChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  scope: ChatScope;
  activeSectionId: string | null;
  activeSectionTitle: string | null;
  activeSectionType: SectionType | null;
  onSend: (content: string) => void;
  onApplySuggestion: (messageId: string) => void;
  onDiscardSuggestion: (messageId: string) => void;
  onClearHistory: () => void;
}

export function AiChatPanel({
  messages,
  isLoading,
  scope,
  activeSectionId,
  activeSectionTitle,
  activeSectionType,
  onSend,
  onApplySuggestion,
  onDiscardSuggestion,
  onClearHistory,
}: AiChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeSectionId]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    onSend(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const chips = getQuickChips(activeSectionType);

  return (
    <div className="flex flex-col h-full">
      {/* Scope indicator */}
      <div className="px-3 py-2 border-b border-white/10">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {scope === "section" && activeSectionTitle ? (
              <>
                Editing: <span className="text-foreground font-medium">{activeSectionTitle}</span>
              </>
            ) : (
              <>Editing: <span className="text-foreground font-medium">Entire Document</span></>
            )}
          </p>
          {messages.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              title="Clear chat history"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <Sparkles className="w-6 h-6 text-accent/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              Ask the AI co-editor to refine your content.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              It can ask clarifying questions before making changes.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onApply={() => onApplySuggestion(message.id)}
            onDiscard={() => onDiscardSuggestion(message.id)}
          />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-3 h-3 text-accent" />
            </div>
            <div className="bg-white/5 rounded-lg px-3 py-2">
              <div className="flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick-action chips */}
      {!isLoading && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <button
              key={chip.label}
              onClick={() => onSend(chip.instruction)}
              className="px-2.5 py-1 rounded-full text-xs bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="px-3 pb-3">
        <div className="flex items-end gap-2 bg-white/5 rounded-lg border border-white/10 focus-within:border-accent/30 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what to change..."
            rows={1}
            className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/50 resize-none max-h-24 overflow-y-auto"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 text-muted-foreground hover:text-accent disabled:opacity-30 disabled:hover:text-muted-foreground transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground/50 mt-1 px-1">
          Enter to send &middot; Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}

// --- Message bubble ---

function MessageBubble({
  message,
  onApply,
  onDiscard,
}: {
  message: ChatMessage;
  onApply: () => void;
  onDiscard: () => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-3 h-3 text-accent" />
        </div>
      )}

      <div className={`max-w-[85%] space-y-2 ${isUser ? "items-end" : ""}`}>
        {/* Message content */}
        <div
          className={`rounded-lg px-3 py-2 text-sm ${
            isUser
              ? "bg-accent/15 text-foreground"
              : "bg-white/5 text-foreground"
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Suggestion actions */}
        {message.suggestion && message.suggestion.status === "pending" && (
          <div className="flex items-center gap-2 px-1">
            <span className="text-[10px] text-accent font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Suggestion ready
            </span>
            <button
              onClick={onApply}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-accent text-white hover:bg-accent/80 transition-colors"
            >
              <Check className="w-3 h-3" />
              Apply
            </button>
            <button
              onClick={onDiscard}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-white/10 text-muted-foreground hover:bg-white/20 transition-colors"
            >
              <X className="w-3 h-3" />
              Discard
            </button>
          </div>
        )}

        {message.suggestion && message.suggestion.status === "applied" && (
          <p className="text-[10px] text-green-400 px-1 flex items-center gap-1">
            <Check className="w-3 h-3" />
            Applied
          </p>
        )}

        {message.suggestion && message.suggestion.status === "discarded" && (
          <p className="text-[10px] text-muted-foreground px-1">Discarded</p>
        )}
      </div>
    </div>
  );
}
