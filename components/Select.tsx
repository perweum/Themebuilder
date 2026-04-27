import React from "react";
import {
  Select as AriaSelect,
  SelectProps as AriaSelectProps,
  Label,
  Button,
  SelectValue,
  Popover,
  ListBox,
  ListBoxItem,
  SelectRenderProps,
} from "react-aria-components";
import { ChevronDown } from "lucide-react";

export interface SelectProps<T extends object> extends Omit<AriaSelectProps<T>, "children"> {
  label?: string;
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
  color?: string;
  variant?: "primary" | "outline" | "ghost";
  isDarkMode?: boolean;
}

export function Select<T extends object>({
  label,
  items,
  children,
  color = "neutral",
  variant = "outline",
  isDarkMode,
  ...props
}: SelectProps<T>) {
  return (
    <AriaSelect {...props} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      {label && (
        <Label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-subtle)" }}>
          {label}
        </Label>
      )}

      <Button
        style={({ isHovered, isPressed, isFocusVisible }) => {
          const baseStyle: React.CSSProperties = {
            padding: "0.5rem 1rem",
            borderRadius: "var(--geometry-radius-sm)",
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: "pointer",
            transition:
              "background-color 0.2s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s cubic-bezier(0.2, 0, 0, 1)",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
            outline: "none",
            minWidth: "140px",
            textAlign: "left",
          };

          let bg = "transparent";
          let textColor = "inherit";
          let borderColor = "transparent";
          let shadow = "none";

          if (variant === "primary") {
            textColor = `var(--color-text-${color}-contrast)`;
            bg = `var(--color-base-${color}-default)`;

            if (isPressed) {
              bg = `var(--color-base-${color}-active)`;
            } else if (isHovered) {
              bg = `var(--color-base-${color}-hover)`;
            }
          } else if (variant === "outline") {
            textColor = `var(--color-text-${color}-default)`;
            borderColor = `var(--color-border-${color}-default)`;
            bg = "transparent";

            if (isPressed) {
              bg = `var(--color-surface-${color}-active)`;
            } else if (isHovered) {
              bg = `var(--color-surface-${color}-hover)`;
            }
          } else if (variant === "ghost") {
            textColor = `var(--color-text-${color}-default)`;
            bg = "transparent";

            if (isPressed) {
              bg = `var(--color-surface-${color}-active)`;
            } else if (isHovered) {
              bg = `var(--color-surface-${color}-hover)`;
            }
          }

          if (isFocusVisible) {
            shadow = `0 0 0 2px var(--color-background-default), 0 0 0 4px var(--color-border-focus)`;
          }

          return {
            ...baseStyle,
            background: bg,
            color: textColor,
            borderColor,
            borderStyle: "solid",
            borderWidth: "var(--geometry-borderWidth-default)",
            boxShadow: shadow,
          };
        }}
      >
        <SelectValue />
        <span style={{ display: "flex", alignItems: "center" }}>
          <ChevronDown size={14} style={{ opacity: 0.7 }} />
        </span>
      </Button>

      <Popover
        style={{
          background:
            isDarkMode !== undefined
              ? isDarkMode
                ? "#1f2128"
                : "#ffffff"
              : "var(--color-surface-default)",
          border: "var(--geometry-borderWidth-default) solid var(--color-border-default)",
          borderRadius: "var(--geometry-radius-sm)",
          boxShadow: "var(--color-shadow-3)",
          minWidth: "var(--trigger-width)",
          zIndex: 9999,
        }}
      >
        <ListBox
          items={items}
          style={{
            padding: "0.25rem",
            outline: "none",
            maxHeight: "300px",
            overflow: "auto",
          }}
        >
          {children}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}

export function SelectItem(props: any) {
  return (
    <ListBoxItem
      {...props}
      style={({ isHovered, isSelected, isFocusVisible }) => ({
        padding: "0.5rem 0.75rem",
        borderRadius: "var(--geometry-radius-none)",
        cursor: "pointer",
        fontSize: "0.875rem",
        background: isSelected
          ? "var(--color-base-brand-default)"
          : isFocusVisible || isHovered
            ? "var(--color-surface-hover)"
            : "transparent",
        color: isSelected ? "var(--color-text-brand-contrast)" : "var(--color-text-default)",
        outline: "none",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      })}
    />
  );
}
