"use client";

import { useState, useRef, useEffect } from "react";
import { FormattedText } from "@/components/viewer/FormattedText";

interface InlineEditorProps {
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
  /** Render **bold** markdown in the non-editing display */
  renderFormatted?: boolean;
}

export function InlineEditor({
  value,
  onChange,
  multiline = false,
  className = "",
  placeholder = "Click to edit...",
  renderFormatted = false,
}: InlineEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Sync external value changes
  useEffect(() => {
    if (!isEditing) setDraft(value);
  }, [value, isEditing]);

  // Auto-focus when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Move cursor to end
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  const commit = () => {
    setIsEditing(false);
    if (draft !== value) {
      onChange(draft);
    }
  };

  const cancel = () => {
    setIsEditing(false);
    setDraft(value);
  };

  if (!isEditing) {
    return (
      <span
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        className={`cursor-text rounded transition-all hover:ring-1 hover:ring-accent/30 hover:bg-accent/5 ${
          !value ? "text-muted-foreground italic" : ""
        } ${className}`}
      >
        {!value ? placeholder : renderFormatted ? <FormattedText text={value} /> : value}
      </span>
    );
  }

  const sharedProps = {
    value: draft,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft(e.target.value),
    onBlur: commit,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Escape") cancel();
      if (e.key === "Enter" && !multiline) commit();
    },
    className: `bg-white/10 rounded px-1 -mx-1 outline-none ring-1 ring-accent/50 ${className}`,
  };

  if (multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        rows={3}
        {...sharedProps}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      {...sharedProps}
    />
  );
}
