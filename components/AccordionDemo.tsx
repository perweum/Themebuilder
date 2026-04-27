import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface DemoProps {
  primaryColorName?: string;
  accentColorName?: string;
}

export const AccordionDemo: React.FC<DemoProps> = ({
  primaryColorName = "brand",
  accentColorName = "accent",
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const items = [
    {
      title: "Semantic Tokens",
      content:
        "Semantic tokens map design intent right into your UI, making it easy to create adaptive themes without hardcoding.",
    },
    {
      title: "Global Feedback Colors",
      content:
        "Use the global success, error, info, and warning states to provide consistent feedback across your entire application regardless of the active theme.",
    },
    {
      title: "Accessible Contrast",
      content:
        "Our palette generator ensures that all text maintains a high contrast ratio against its background, guaranteeing WCAG compliance.",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "600px",
        fontFamily: "inherit",
        border: "var(--geometry-borderWidth-default, 1px) solid var(--color-border-subtle)",
        borderRadius: "var(--geometry-radius-2, 8px)",
        overflow: "hidden",
        background: "var(--color-surface-default)",
      }}
    >
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const isLast = index === items.length - 1;

        return (
          <div
            key={index}
            style={{
              borderBottom: isLast
                ? "none"
                : "var(--geometry-borderWidth-default, 1px) solid var(--color-border-subtle)",
            }}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              style={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem",
                background: isOpen
                  ? `var(--color-surface-${primaryColorName}-default)`
                  : "transparent",
                border: "none",
                cursor: "pointer",
                color: isOpen
                  ? `var(--color-text-${primaryColorName}-default)`
                  : "var(--color-text-default)",
                fontSize: "1rem",
                fontWeight: 500,
                textAlign: "left",
                fontFamily: "inherit",
                transition: "background-color 0.2s ease, color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!isOpen) {
                  e.currentTarget.style.backgroundColor = `var(--color-surface-${primaryColorName}-hover)`;
                  e.currentTarget.style.color = `var(--color-text-${primaryColorName}-default)`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isOpen) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--color-text-default)";
                }
              }}
            >
              <span>{item.title}</span>
              <ChevronDown
                size={20}
                style={{
                  color: "var(--color-icon-subtle)",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.3s ease",
                }}
              />
            </button>

            <div
              style={{
                maxHeight: isOpen ? "200px" : "0",
                overflow: "hidden",
                transition: "all 0.3s ease-in-out",
                opacity: isOpen ? 1 : 0,
              }}
            >
              <div
                style={{
                  padding: "0 1rem 1rem 1rem",
                  color: "var(--color-text-subtle)",
                  fontSize: "0.875rem",
                  lineHeight: 1.6,
                }}
              >
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
