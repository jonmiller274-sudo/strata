"use client";

import { useState, useEffect } from "react";

const HINT_KEY = "strata-edit-hint-shown";

export function FirstEditHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(HINT_KEY)) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        localStorage.setItem(HINT_KEY, "1");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="absolute -top-8 left-0 animate-pulse">
      <span className="text-[10px] text-accent bg-accent/10 border border-accent/20 rounded px-2 py-0.5">
        Click any text to edit
      </span>
    </div>
  );
}
