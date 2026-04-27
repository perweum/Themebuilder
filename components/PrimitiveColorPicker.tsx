import React, { useState, useEffect } from "react";
import { Dialog, DialogTrigger, Button, Popover } from "react-aria-components";
import { HexColorPicker } from "react-colorful";

interface PrimitiveColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  isDarkMode?: boolean;
  children: React.ReactNode;
}

export const PrimitiveColorPicker: React.FC<PrimitiveColorPickerProps> = ({
  color,
  onChange,
  isDarkMode,
  children,
}) => {
  const [tempColor, setTempColor] = useState(color);

  // Update local state if external color changes (e.g. reverted)
  useEffect(() => {
    setTempColor(color);
  }, [color]);

  const bgColor = isDarkMode ? "#1a1f26" : "#ffffff";
  const textColor = isDarkMode ? "#ffffff" : "#000000";
  const borderColor = isDarkMode ? "#333b4d" : "#e2e8f0";
  const inputBg = isDarkMode ? "#252b36" : "#f8fafc";

  return (
    <DialogTrigger>
      <Button
        style={{
          background: "none",
          border: "none",
          padding: 0,
          margin: 0,
          cursor: "pointer",
          display: "block",
          width: "100%",
          height: "100%",
          outline: "none",
        }}
      >
        {children}
      </Button>
      <Popover
        placement="bottom"
        style={{
          background: bgColor,
          border: `1px solid ${borderColor}`,
          borderRadius: "8px",
          padding: "16px",
          boxShadow: "var(--color-shadow-3)",
          zIndex: 100,
        }}
      >
        <Dialog style={{ outline: "none" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "200px" }}>
            <div className="custom-primitive-color-picker">
              <style>{`
                                .custom-primitive-color-picker .react-colorful { width: 100%; height: 200px; }
                                .custom-primitive-color-picker .react-colorful__pointer { width: 16px; height: 16px; }
                            `}</style>
              <HexColorPicker
                color={tempColor}
                onChange={(newHex) => {
                  setTempColor(newHex);
                  onChange(newHex); // Live update
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <input
                value={tempColor}
                onChange={(e) => {
                  const val = e.target.value;
                  setTempColor(val);
                  if (/^#[0-9A-F]{6}$/i.test(val) || /^#[0-9A-F]{3}$/i.test(val)) {
                    onChange(val);
                  }
                }}
                style={{
                  background: inputBg,
                  border: `1px solid ${borderColor}`,
                  color: textColor,
                  padding: "0.5rem",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontFamily: "monospace",
                  width: "100%",
                  textAlign: "center",
                  outline: "none",
                }}
              />
              <span
                style={{
                  fontSize: "0.7rem",
                  color: isDarkMode ? "#888" : "#666",
                  marginTop: "0.25rem",
                }}
              >
                HEX
              </span>
            </div>
          </div>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
};
