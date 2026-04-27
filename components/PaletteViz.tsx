import React from "react";
import { useTheme } from "../theme-context";
import { generateRamp, getColorName, getHueDistance } from "../lib/palette-generator";
import { PrimitiveColorPicker } from "./PrimitiveColorPicker";
import { RotateCcw } from "lucide-react";

const RampRow = ({
  title,
  seed,
  cssPrefix,
  mappedName,
  isDarkMode,
  overrides,
  onOverride,
  isAliasedTo,
}: {
  title: string;
  seed: string;
  cssPrefix?: string;
  mappedName?: string;
  isDarkMode?: boolean;
  overrides?: Record<string, string>;
  onOverride?: (path: string, hex: string | undefined) => void;
  isAliasedTo?: string;
}) => {
  const gen = generateRamp(seed);

  let displayPrefix = cssPrefix;
  if (!displayPrefix) {
    const lower = title.toLowerCase().replace(/\s+/g, "-");
    if (["neutral", "success", "error"].includes(lower)) {
      displayPrefix = `color-${lower}`;
    } else {
      displayPrefix = `color-global-${lower}`;
    }
  }

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h3
        style={{
          fontSize: "0.875rem",
          textTransform: "uppercase",
          marginBottom: "0.5rem",
          color: isDarkMode ? "#aaa" : "#666",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {title}{" "}
        <span
          style={{
            fontWeight: "normal",
            color: isDarkMode ? "#666" : "#999",
            fontSize: "11px",
            textTransform: "none",
          }}
        >
          {mappedName ? `(color.${mappedName}.*)` : `(var(--${displayPrefix}-*))`}
          {!isAliasedTo && ` - Mapped to: ${gen.closestStep}`}
        </span>
        {isAliasedTo && (
          <span
            style={{
              fontSize: "10px",
              background: isDarkMode ? "#333" : "#eee",
              color: isDarkMode ? "#aaa" : "#666",
              padding: "2px 6px",
              borderRadius: "4px",
              textTransform: "none",
            }}
          >
            Aliased to <strong>{isAliasedTo}</strong>
          </span>
        )}
      </h3>
      <div className="palette-grid" style={{ gap: "6px" }}>
        {Object.entries(gen.ramp).map(([step, hex]) => {
          const path = mappedName ? `${mappedName}.${step}` : `${title.toLowerCase()}.${step}`;
          const overrideHex = overrides?.[path];
          const displayHex = overrideHex || hex;

          return (
            <div
              key={step}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {overrideHex && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOverride && onOverride(path, undefined);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                    padding: "2px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "4px",
                    position: "absolute",
                    top: "-2px",
                    right: "-2px",
                    zIndex: 10,
                  }}
                  title="Revert to generated color"
                >
                  <RotateCcw size={14} />
                </button>
              )}
              <PrimitiveColorPicker
                color={displayHex}
                onChange={(hex) => onOverride && onOverride(path, hex)}
                isDarkMode={isDarkMode}
              >
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    backgroundColor: displayHex,
                    borderRadius: "4px",
                    border:
                      step === String(gen.closestStep)
                        ? `2px solid ${isDarkMode ? "#FFF" : "#000"}`
                        : `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                  }}
                  title={`Step ${step}: var(--${displayPrefix}-${step})`}
                />
              </PrimitiveColorPicker>
              <span
                style={{
                  fontSize: "10px",
                  color:
                    step === String(gen.closestStep)
                      ? isDarkMode
                        ? "#FFF"
                        : "#000"
                      : isDarkMode
                        ? "#666"
                        : "#999",
                  fontWeight: step === String(gen.closestStep) ? "bold" : "normal",
                  marginTop: "4px",
                }}
              >
                {step}
                {overrideHex ? "*" : ""}
              </span>
              <span style={{ fontSize: "10px", color: isDarkMode ? "#aaa" : "#000" }}>
                {displayHex}
              </span>
              <span
                style={{
                  fontSize: "8px",
                  color: isDarkMode ? "#666" : "#aaa",
                  marginTop: "2px",
                  whiteSpace: "nowrap",
                }}
              >
                var(--{displayPrefix}-{step})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const PaletteViz: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode }) => {
  const { themes, globalColors, updateThemePrimitiveOverride } = useTheme();

  if (themes.length === 0) return null;

  return (
    <div
      className="palette-viz-container"
      style={{
        padding: "2rem",
        background: isDarkMode ? "#1a1a1a" : "#fff",
        borderRadius: "8px",
        boxShadow: "var(--theme-shadow-3)",
        transition: "background-color 0.3s",
      }}
    >
      <style>{`
                .palette-grid {
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                }
                @media (max-width: 860px) {
                    .palette-grid {
                        grid-template-columns: repeat(6, 1fr);
                        row-gap: 16px;
                    }
                }
                @media (max-width: 480px) {
                    .palette-grid {
                        grid-template-columns: repeat(4, 1fr);
                        row-gap: 16px;
                    }
                }
            `}</style>
      {themes.map((theme, index) => (
        <div key={theme.id} style={{ marginBottom: index < themes.length - 1 ? "3rem" : "0" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "bold",
              marginBottom: "1.5rem",
              borderBottom: `1px solid ${isDarkMode ? "#333" : "#eee"}`,
              paddingBottom: "0.5rem",
              color: isDarkMode ? "#FFF" : "#000",
            }}
          >
            Core Palette Engine ({theme.id})
          </h2>
          {theme.colors.map((color) => {
            const safeName = color.name.toLowerCase().replace(/\s+/g, "-");

            // Check if this seed is aliased to a global color
            const aliasedGlobal = globalColors.find(
              (gc) => gc.seed.toLowerCase() === color.seed.toLowerCase(),
            );
            const isAliasedTo = aliasedGlobal ? aliasedGlobal.name : undefined;

            return (
              <RampRow
                key={color.id}
                title={color.name}
                seed={color.seed}
                cssPrefix={`color-${safeName}`}
                mappedName={safeName}
                isDarkMode={isDarkMode}
                overrides={theme.primitiveOverrides}
                onOverride={(path, hex) => updateThemePrimitiveOverride(theme.id, path, hex)}
                isAliasedTo={isAliasedTo}
              />
            );
          })}
        </div>
      ))}

      <h2
        style={{
          fontSize: "1.25rem",
          fontWeight: "bold",
          marginBottom: "1.5rem",
          marginTop: "3rem",
          borderBottom: `1px solid ${isDarkMode ? "#333" : "#eee"}`,
          paddingBottom: "0.5rem",
          color: isDarkMode ? "#FFF" : "#000",
        }}
      >
        Global & Semantic Colors
      </h2>
      {globalColors.map((color) => (
        <RampRow
          key={color.id}
          title={color.name}
          seed={color.seed}
          isDarkMode={isDarkMode}
          overrides={themes[0]?.primitiveOverrides}
          onOverride={(path, hex) =>
            themes[0] && updateThemePrimitiveOverride(themes[0].id, path, hex)
          }
        />
      ))}
    </div>
  );
};
