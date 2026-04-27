import React from "react";

type CardProps = {
  children: React.ReactNode;
  variant?: string;
  title?: string;
  style?: React.CSSProperties;
};

export const Card: React.FC<CardProps> = ({ children, variant = "default", title, style }) => {
  let bg = "var(--color-surface-default)";
  let border = "var(--geometry-borderWidth-default) solid var(--color-border-subtle)";
  let textColor = "var(--color-text-default)";
  let subTextColor = "var(--color-text-subtle)";

  if (variant !== "default") {
    bg = `var(--color-surface-${variant}-default)`;
    border = "none"; // Tinted surfaces often don't need borders
    textColor = `var(--color-text-${variant}-default)`;
    subTextColor = `var(--color-text-${variant}-default)`; // Opacity handled in CSS usually, here we just use same color
  }

  return (
    <div
      style={{
        background: bg,
        border: border,
        borderRadius: "var(--geometry-radius-lg)",
        padding: "1.5rem",
        boxShadow: variant === "default" ? "var(--color-shadow-2)" : "none",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        ...style,
      }}
    >
      {title && (
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: textColor,
            marginBottom: "0.25rem",
          }}
        >
          {title}
        </h3>
      )}
      <div style={{ fontSize: "0.875rem", color: subTextColor, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
};
