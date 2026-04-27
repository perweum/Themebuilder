import React from "react";

// Data Display Components

export const Badge: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, color = "neutral", style }) => {
  let bg = "var(--color-border-subtle)"; // Neutral default
  let text = "var(--color-text-default)";

  if (color !== "neutral") {
    bg = `var(--color-surface-${color}-default)`;
    text = `var(--color-text-${color}-default)`;
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.25rem 0.75rem",
        borderRadius: "var(--geometry-radius-full)",
        fontSize: "0.75rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        backgroundColor: bg,
        color: text,
        ...style,
      }}
    >
      {children}
    </span>
  );
};
