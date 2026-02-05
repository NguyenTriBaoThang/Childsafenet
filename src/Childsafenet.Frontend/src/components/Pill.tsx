import React from "react";

export function Pill({ text, kind = "neutral" }: { text: string; kind?: "ok" | "warn" | "bad" | "neutral" }) {
  return <span className={`pill ${kind}`}>{text}</span>;
}