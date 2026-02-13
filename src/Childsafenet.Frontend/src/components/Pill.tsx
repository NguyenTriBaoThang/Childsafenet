import type { ReactNode } from "react";

type PillKind = "ok" | "warn" | "bad" | "neutral";

export function Pill({
  kind = "neutral",
  text,
  children,
}: {
  kind?: PillKind;
  text?: string;
  children?: ReactNode;
}) {
  const content = text ?? children;

  return <span className={`pill ${kind}`}>{content}</span>;
}