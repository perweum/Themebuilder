import React from "react";
import { Button } from "./Button";
import { Toggle } from "./Form";
import { Badge } from "./DataDisplay";

export const ThemeComponentCard: React.FC<{
  colorName: string;
  primaryColorName?: string;
  isDarkMode?: boolean;
}> = ({ colorName, primaryColorName = "neutral", isDarkMode }) => {
  return (
    <div
      style={{
        background: `var(--color-surface-${colorName}-default)`,
        border: `1px solid var(--color-border-${colorName}-default)`,
        borderRadius: "var(--geometry-radius-3, 12px)",
        padding: "1.5rem",
        color: `var(--color-text-${colorName}-default, inherit)`,
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        boxShadow: "var(--color-shadow-2)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              margin: 0,
              color: `var(--color-text-${colorName}-bold, inherit)`,
              textTransform: "capitalize",
            }}
          >
            {colorName}
          </h3>
          <p style={{ margin: 0, opacity: 0.8, fontSize: "0.875rem" }}>
            Farger gjør livet mer fargerikt
          </p>
        </div>
        <Badge color="neutral" style={{ textTransform: "capitalize" }}>
          {colorName} Badge
        </Badge>
      </div>

      <div
        style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Toggle checked={true} colorName={colorName} />
          <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Toggle 1</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Toggle checked={false} colorName={colorName} />
          <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Toggle 2</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
        <Button variant="primary" color={colorName as any}>
          Primary
        </Button>
        <Button variant="outline" color={colorName as any}>
          Outline
        </Button>
        <Button variant="ghost" color={colorName as any}>
          Ghost
        </Button>
      </div>
    </div>
  );
};
