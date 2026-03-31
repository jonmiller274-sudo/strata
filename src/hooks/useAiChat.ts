"use client";

import { useState, useCallback } from "react";
import type { Section, SectionType } from "@/types/artifact";

export interface ChatSuggestion {
  type: "section" | "document";
  sectionId?: string;
  data: unknown;
  status: "pending" | "applied" | "discarded";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  suggestion?: ChatSuggestion;
}

export type ChatScope = "section" | "document";

export interface AiChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  scope: ChatScope;
  activeSectionId: string | null;
}

// Quick-action chips keyed by section type
const SECTION_CHIPS: Partial<Record<SectionType, { label: string; instruction: string }[]>> = {
  "rich-text": [
    { label: "More concise", instruction: "Make this section more concise" },
    { label: "More persuasive", instruction: "Make this more persuasive and impactful" },
    { label: "Add evidence", instruction: "Add supporting evidence or data points" },
  ],
  timeline: [
    { label: "Add a step", instruction: "Add a new step to this timeline" },
    { label: "Reorder chronologically", instruction: "Reorder the steps in chronological order" },
    { label: "Add more detail", instruction: "Add more detail to each step description" },
  ],
  "expandable-cards": [
    { label: "Add a card", instruction: "Add a new card to this section" },
    { label: "Merge similar cards", instruction: "Merge any cards with overlapping content" },
    { label: "Punchier summaries", instruction: "Make each card summary more punchy and direct" },
  ],
  "guided-journey": [
    { label: "Add an event", instruction: "Add a new event to this journey" },
    { label: "Compress timeline", instruction: "Compress this journey into a shorter timeframe" },
    { label: "Adjust metrics", instruction: "Adjust the counter values to be more realistic" },
  ],
  "metric-dashboard": [
    { label: "Add a metric", instruction: "Add a new metric to this dashboard" },
    { label: "Stronger descriptions", instruction: "Make the metric descriptions more impactful" },
    { label: "Add context", instruction: "Add change indicators or comparison context" },
  ],
  "tier-table": [
    { label: "Add a tier", instruction: "Add a new pricing tier column" },
    { label: "Differentiate more", instruction: "Make the tiers more clearly differentiated" },
    { label: "Add features", instruction: "Add more feature rows to the comparison" },
  ],
};

const GENERIC_CHIPS = [
  { label: "More concise", instruction: "Make this more concise" },
  { label: "More detailed", instruction: "Add more detail and specifics" },
  { label: "Simplify", instruction: "Simplify the language" },
  { label: "More persuasive", instruction: "Make this more persuasive" },
];

export function getQuickChips(sectionType: SectionType | null): { label: string; instruction: string }[] {
  if (sectionType && SECTION_CHIPS[sectionType]) {
    return SECTION_CHIPS[sectionType];
  }
  return GENERIC_CHIPS;
}

let messageIdCounter = 0;
function generateMessageId(): string {
  return `msg_${Date.now()}_${++messageIdCounter}`;
}

export function useAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [scope, setScope] = useState<ChatScope>("document");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const addUserMessage = useCallback((content: string): ChatMessage => {
    const message: ChatMessage = {
      id: generateMessageId(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, message]);
    return message;
  }, []);

  const addAssistantMessage = useCallback(
    (content: string, suggestion?: ChatSuggestion): ChatMessage => {
      const message: ChatMessage = {
        id: generateMessageId(),
        role: "assistant",
        content,
        timestamp: Date.now(),
        suggestion,
      };
      setMessages((prev) => [...prev, message]);
      return message;
    },
    []
  );

  const updateSuggestionStatus = useCallback(
    (messageId: string, status: "applied" | "discarded") => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId && m.suggestion
            ? { ...m, suggestion: { ...m.suggestion, status } }
            : m
        )
      );
    },
    []
  );

  const clearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  const setScopeAndSection = useCallback(
    (newScope: ChatScope, sectionId: string | null) => {
      setScope(newScope);
      setActiveSectionId(sectionId);
    },
    []
  );

  return {
    messages,
    isLoading,
    setIsLoading,
    scope,
    activeSectionId,
    addUserMessage,
    addAssistantMessage,
    updateSuggestionStatus,
    clearHistory,
    setScopeAndSection,
  };
}
