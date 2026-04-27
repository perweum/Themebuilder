import React from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

export interface FeedbackCardProps {
  colorName: string; // e.g., 'error', 'success', 'warning', 'info'
  isDarkMode?: boolean;
  children: React.ReactNode;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({ colorName, isDarkMode, children }) => {
  // Sanitize the global color name for the CSS var prefix
  const safeName = colorName.toLowerCase().replace(/\s+/g, "-");

  // Use Semantic Tokens when available (success, error)
  // Fallback to subtle neutral geometry if it's a generic info card or unrecognized color
  const isSemantic = ["success", "error"].includes(safeName);

  // Determine the exact CSS prefix for primitive fallbacks
  let cssPrefix = `color-global-${safeName}`;
  if (safeName === "neutral") {
    cssPrefix = `color-${safeName}`;
  }

  const bgStep = isDarkMode ? "900" : "50";
  const textStep = isDarkMode ? "300" : "700";

  const style: React.CSSProperties = {
    background: isSemantic
      ? `var(--color-background-${safeName})`
      : `var(--${cssPrefix}-${bgStep})`,
    color: isSemantic ? `var(--color-text-${safeName}-default)` : `var(--${cssPrefix}-${textStep})`,
    border: isSemantic
      ? `var(--geometry-borderWidth-default, 1px) solid var(--color-border-${safeName}-default)`
      : `var(--geometry-borderWidth-default, 1px) solid var(--color-border-subtle)`,
    padding: "0.875rem 1rem",
    borderRadius: "var(--geometry-radius-2, 6px)",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: 1.5,
  };

  const iconStyle: React.CSSProperties = {
    flexShrink: 0,
    color: isSemantic ? `var(--color-icon-${safeName}-default)` : `var(--${cssPrefix}-${textStep})`,
  };

  // Determine a rudimentary icon based on the name strings
  let IconComponent = Info;
  if (
    safeName.includes("error") ||
    safeName.includes("critical") ||
    safeName.includes("warning") ||
    safeName.includes("caution")
  ) {
    IconComponent = AlertCircle;
  } else if (safeName.includes("success")) {
    IconComponent = CheckCircle2;
  }

  return (
    <div style={style}>
      <IconComponent size={20} strokeWidth={2} style={iconStyle} />
      <div>{children}</div>
    </div>
  );
};
