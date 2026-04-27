import React from "react";
import {
  TextField,
  Label,
  Input as AriaInput,
  Text,
  TextFieldProps,
  Switch,
  SwitchProps,
  Checkbox,
  CheckboxProps,
  RadioGroup,
  RadioGroupProps,
  Radio,
  RadioProps,
} from "react-aria-components";

export interface CustomInputProps extends TextFieldProps {
  label?: string;
  placeholder?: string;
  error?: boolean;
  errorMessage?: string;
  colorName?: string;
}

export const Input: React.FC<CustomInputProps> = ({
  label,
  placeholder,
  error,
  errorMessage,
  colorName = "neutral",
  ...props
}) => {
  return (
    <TextField
      {...props}
      isInvalid={error}
      style={{ display: "flex", flexDirection: "column", gap: "0.25rem", width: "100%" }}
    >
      {label && (
        <Label
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--color-text-subtle)",
            marginBottom: "0.25rem",
          }}
        >
          {label}
        </Label>
      )}
      <AriaInput
        placeholder={placeholder}
        style={({ isFocused, isFocusVisible, isInvalid, isHovered }) => {
          let borderColor =
            colorName === "neutral"
              ? "var(--color-border-default)"
              : `var(--color-border-${colorName}-default)`;
          let addInnerShadow = false;

          if (isInvalid) {
            borderColor = "var(--color-border-error-default)";
            addInnerShadow = true;
          } else if (isFocused || isFocusVisible) {
            borderColor = "var(--color-border-focus)";
            addInnerShadow = true;
          } else if (isHovered) {
            borderColor =
              colorName === "neutral"
                ? "var(--color-border-focus)"
                : `var(--color-border-${colorName}-hover)`;
            addInnerShadow = true;
          }

          let shadowItems = [];
          if (addInnerShadow) shadowItems.push(`inset 0 0 0 1px ${borderColor}`);
          if (isFocusVisible)
            shadowItems.push(
              "0 0 0 2px var(--color-background-default), 0 0 0 4px var(--color-border-focus)",
            );
          const shadow = shadowItems.length > 0 ? shadowItems.join(", ") : "none";

          return {
            padding: "0.75rem 1rem",
            borderRadius: "var(--geometry-radius-sm)",
            border: `var(--geometry-borderWidth-default) solid ${borderColor}`,
            background: "var(--color-surface-default)",
            color: "var(--color-text-default)",
            fontSize: "1rem",
            outline: "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
            width: "100%",
            boxSizing: "border-box",
            boxShadow: shadow,
          };
        }}
      />
      {error && errorMessage && (
        <Text
          slot="errorMessage"
          style={{ fontSize: "0.75rem", color: "var(--color-text-error)", marginTop: "0.25rem" }}
        >
          {errorMessage}
        </Text>
      )}
    </TextField>
  );
};

export interface CustomToggleProps extends Omit<SwitchProps, "children"> {
  checked?: boolean;
  colorName?: string;
}

export const Toggle: React.FC<CustomToggleProps> = ({
  checked: initialChecked = false,
  colorName = "brand",
  ...props
}) => {
  return (
    <Switch
      defaultSelected={initialChecked}
      {...props}
      style={{ position: "relative", outline: "none", cursor: "pointer", margin: 0 }}
    >
      {({ isSelected, isFocusVisible, isHovered }) => {
        const trackBg = isSelected
          ? `var(--color-base-${colorName}-default)`
          : "var(--color-base-disabled)";

        const trackHoverBg = isSelected
          ? `var(--color-base-${colorName}-hover)`
          : "var(--color-border-subtle)";

        const thumbColor = isSelected
          ? `var(--color-text-${colorName}-contrast)`
          : "var(--color-text-subtle)";

        return (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "52px",
                height: "32px",
                borderRadius: "var(--geometry-radius-full)",
                background: isHovered ? trackHoverBg : trackBg,
                position: "relative",
                transition: "background-color 0.2s",
                boxShadow: isFocusVisible
                  ? "0 0 0 2px var(--color-background-default), 0 0 0 4px var(--color-border-focus)"
                  : "none",
                outline: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: isSelected ? "4px" : "8px",
                  left: isSelected ? "24px" : "8px",
                  width: isSelected ? "24px" : "16px",
                  height: isSelected ? "24px" : "16px",
                  borderRadius: "50%",
                  background: thumbColor,
                  transition: "all 0.2s cubic-bezier(0.2, 0, 0, 1)",
                  boxShadow: "var(--color-shadow-1)",
                }}
              />
            </div>
          </div>
        );
      }}
    </Switch>
  );
};

export interface CustomCheckboxProps extends Omit<CheckboxProps, "children"> {
  label: string;
  colorName?: string;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  label,
  colorName = "brand",
  ...props
}) => {
  return (
    <Checkbox
      {...props}
      style={{ position: "relative", outline: "none", cursor: "pointer", margin: 0 }}
    >
      {({ isSelected, isFocusVisible, isInvalid, isHovered, isPressed }) => {
        const bg = isPressed
          ? isSelected
            ? `var(--color-base-${colorName}-active)`
            : "var(--color-surface-hover)"
          : isHovered
            ? isSelected
              ? `var(--color-base-${colorName}-hover)`
              : "var(--color-surface-hover)"
            : isSelected
              ? `var(--color-base-${colorName}-default)`
              : "transparent";
        const borderColor = isInvalid
          ? "var(--color-border-error-default)"
          : isHovered
            ? isSelected
              ? `var(--color-base-${colorName}-hover)`
              : `var(--color-base-${colorName}-hover)`
            : isSelected
              ? `var(--color-base-${colorName}-default)`
              : "var(--color-border-default)";
        const borderWidth = isSelected || isInvalid ? "2px" : "1px";
        const shadow = isFocusVisible
          ? "0 0 0 2px var(--color-background-default), 0 0 0 4px var(--color-border-focus)"
          : "none";

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--color-text-default)",
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "var(--geometry-radius-sm)",
                background: bg,
                border: `var(--geometry-borderWidth-default) solid ${borderColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: shadow,
                boxSizing: "border-box",
                transition: "all 0.2s",
              }}
            >
              {isSelected && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 3L4.5 8.5L2 6"
                    stroke={`var(--color-text-${colorName}-contrast)`}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            {label}
          </div>
        );
      }}
    </Checkbox>
  );
};

export interface CustomRadioProps extends Omit<RadioProps, "children"> {
  label: string;
  colorName?: string;
}

export const CustomRadio: React.FC<CustomRadioProps> = ({
  label,
  colorName = "brand",
  ...props
}) => {
  return (
    <Radio
      {...props}
      style={{ position: "relative", outline: "none", cursor: "pointer", margin: 0 }}
    >
      {({ isSelected, isFocusVisible, isInvalid, isHovered, isPressed }) => {
        const bg = isPressed
          ? "var(--color-surface-hover)"
          : isHovered && !isSelected
            ? "var(--color-surface-hover)"
            : "transparent";
        const borderColor = isInvalid
          ? "var(--color-border-error-default)"
          : isHovered
            ? `var(--color-base-${colorName}-hover)`
            : isSelected
              ? `var(--color-base-${colorName}-default)`
              : "var(--color-border-default)";
        const borderWidth = isSelected || isInvalid ? "2px" : "1px";
        const shadow = isFocusVisible
          ? "0 0 0 2px var(--color-background-default), 0 0 0 4px var(--color-border-focus)"
          : "none";

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--color-text-default)",
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: bg,
                border: `var(--geometry-borderWidth-default) solid ${borderColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: shadow,
                boxSizing: "border-box",
                transition: "all 0.2s",
              }}
            >
              {isSelected && (
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: `var(--color-base-${colorName}-default)`,
                  }}
                />
              )}
            </div>
            {label}
          </div>
        );
      }}
    </Radio>
  );
};

export const CustomRadioGroup: React.FC<RadioGroupProps & { label: string }> = ({
  label,
  children,
  style,
  ...props
}) => {
  return (
    <RadioGroup
      {...props}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        ...(typeof style === "object" ? style : {}),
      }}
    >
      <Label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-subtle)" }}>
        {label}
      </Label>
      {children as any}
    </RadioGroup>
  );
};
