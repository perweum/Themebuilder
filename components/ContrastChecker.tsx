import React, { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
// @ts-ignore
import { parse, wcagContrast } from "culori";
import { useTheme } from "../theme-context";
import { SystemicModal } from "./SystemicModal";

interface ContrastCheckerProps {
  onClose?: () => void;
  isDarkMode: boolean;
  inline?: boolean;
}

const getBlendedContrast = (bgCss: string, fgCss: string, isDarkMode: boolean): number | null => {
  try {
    let parsedBgCss = bgCss;

    // Handle browsers that return raw `color-mix` from getComputedStyle instead of rgba
    if (bgCss.startsWith("color-mix")) {
      const match = bgCss.match(/color-mix\(in srgb,\s*(.*?)\s*(\d+(?:\.\d+)?)%,\s*transparent\)/);
      if (match) {
        const baseColor = parse(match[1]);
        const alpha = parseFloat(match[2]) / 100;
        if (baseColor) {
          baseColor.alpha = alpha;
          const r = (baseColor as any).r !== undefined ? (baseColor as any).r : 0;
          const g = (baseColor as any).g !== undefined ? (baseColor as any).g : 0;
          const b = (baseColor as any).b !== undefined ? (baseColor as any).b : 0;
          parsedBgCss = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`;
        }
      }
    }

    const bg = parse(parsedBgCss);
    const fg = parse(fgCss);

    if (!bg || !fg) return wcagContrast(bgCss, fgCss) as number | null;

    const canvasBg = isDarkMode ? parse("#1a1a1a") : parse("#fafafa");

    const getChan = (c: any, chan: string) => (c[chan] !== undefined ? c[chan] : 0);
    const getAlpha = (c: any) => (c.alpha !== undefined ? c.alpha : 1);

    const bgA = getAlpha(bg);
    const outR = getChan(bg, "r") * bgA + getChan(canvasBg, "r") * (1 - bgA);
    const outG = getChan(bg, "g") * bgA + getChan(canvasBg, "g") * (1 - bgA);
    const outB = getChan(bg, "b") * bgA + getChan(canvasBg, "b") * (1 - bgA);

    const fgA = getAlpha(fg);
    const finR = getChan(fg, "r") * fgA + outR * (1 - fgA);
    const finG = getChan(fg, "g") * fgA + outG * (1 - fgA);
    const finB = getChan(fg, "b") * fgA + outB * (1 - fgA);

    const blendedBgStr = `rgb(${Math.round(outR * 255)}, ${Math.round(outG * 255)}, ${Math.round(outB * 255)})`;
    const blendedFgStr = `rgb(${Math.round(finR * 255)}, ${Math.round(finG * 255)}, ${Math.round(finB * 255)})`;

    return wcagContrast(blendedBgStr, blendedFgStr) as number;
  } catch (e) {
    return wcagContrast(bgCss, fgCss) as number | null;
  }
};

const ContrastRow: React.FC<{
  label: string;
  fgVar: string;
  bgVar: string;
  isDarkMode: boolean;
  isLast?: boolean;
}> = ({ label, fgVar, bgVar, isDarkMode, isLast }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState<number | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const timer = requestAnimationFrame(() => {
      if (!ref.current) return;
      const style = getComputedStyle(ref.current);
      const bgColor = style.backgroundColor;
      const fgColor = style.color;
      if (bgColor && fgColor && bgColor !== "rgba(0, 0, 0, 0)") {
        // wait for CSS to apply
        const r = getBlendedContrast(bgColor, fgColor, isDarkMode);
        if (typeof r === "number") {
          setRatio(r);
        }
      }
    });
    return () => cancelAnimationFrame(timer);
  }, [bgVar, fgVar, isDarkMode]);

  const getBadgeInfo = (r: number) => {
    if (r >= 7)
      return {
        label: "AAA",
        color: "var(--color-success-600)",
        bg: "var(--color-surface-success-default)",
      };
    if (r >= 4.5)
      return {
        label: "AA",
        color: "var(--color-success-600)",
        bg: "var(--color-surface-success-default)",
      };
    if (r >= 3)
      return { label: "AA18", color: "var(--color-warning-600)", bg: "rgba(234, 179, 8, 0.1)" };
    return {
      label: "FAIL",
      color: "var(--color-error-600)",
      bg: "var(--color-surface-error-default)",
    };
  };

  const badge = ratio ? getBadgeInfo(ratio) : null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 2fr 100px",
        borderBottom: isLast ? "none" : `1px solid ${isDarkMode ? "#333" : "#eee"}`,
        alignItems: "stretch",
      }}
    >
      {/* Label */}
      <div
        style={{
          padding: "1.25rem 1.5rem",
          borderRight: `1px solid ${isDarkMode ? "#333" : "#eee"}`,
          display: "flex",
          alignItems: "center",
          fontSize: "0.875rem",
          fontWeight: 600,
          color: "var(--color-text-subtle)",
        }}
      >
        {label}
      </div>

      {/* Rendered Preview */}
      <div
        ref={ref}
        style={{
          padding: "1.25rem 1.5rem",
          background: `var(${bgVar})`,
          color: `var(${fgVar})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          fontWeight: 600,
          fontSize: "1rem",
          borderRight: `1px solid ${isDarkMode ? "#333" : "#eee"}`,
        }}
      >
        Preview Text
      </div>

      {/* Score & Badge */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "0.5rem",
          padding: "1.25rem 1rem",
        }}
      >
        {ratio !== null && badge ? (
          <>
            <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-text-default)" }}>
              {ratio.toFixed(2)}
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: badge.color,
                background: badge.bg,
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
              }}
            >
              {badge.label}
            </span>
          </>
        ) : (
          <span style={{ opacity: 0.5, fontSize: "0.875rem" }}>...</span>
        )}
      </div>
    </div>
  );
};

export const ContrastChecker: React.FC<ContrastCheckerProps> = ({ onClose, isDarkMode, inline }) => {
  const { themes } = useTheme();
  const activeTheme = themes[0];
  const [forceRender, setForceRender] = useState(0);

  // Initial delay to ensure DOM styles paint so `getComputedStyle` resolves variables.
  useEffect(() => {
    const timer = setTimeout(() => setForceRender(1), 50);
    return () => clearTimeout(timer);
  }, []);

  const header = (
    <div
      style={{
        padding: "1.5rem 2rem",
        borderBottom: `1px solid ${isDarkMode ? "#333" : "#eee"}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "var(--color-text-default)",
            margin: 0,
          }}
        >
          Contrast Checker
        </h2>
        <p
          style={{
            margin: "0.25rem 0 0 0",
            fontSize: "0.875rem",
            color: "var(--color-text-subtle)",
          }}
        >
          WCAG 2.1 pairings mapped to components
        </p>
      </div>
      {!inline && onClose && (
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: isDarkMode ? "#94a3b8" : "#64748b",
            cursor: "pointer",
          }}
        >
          <X size={24} />
        </button>
      )}
    </div>
  );

  const body = (
    <div
      style={{
        overflow: "auto",
        maxHeight: inline ? "none" : "70vh",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "3rem",
      }}
    >
      {activeTheme?.colors.map((color) => {
        const cName = color.name.toLowerCase().replace(/\s+/g, "-");
        const pairings = [
          {
            label: "Solid Button",
            bgVar: `--color-base-${cName}-default`,
            fgVar: `--color-text-${cName}-contrast`,
          },
          {
            label: "Primary Text on Surface",
            bgVar: `--color-surface-${cName}-default`,
            fgVar: `--color-text-${cName}-default`,
          },
          {
            label: "Primary Text on Subtle",
            bgVar: `--color-surface-${cName}-subtle`,
            fgVar: `--color-text-${cName}-default`,
          },
        ];

        return (
          <div key={color.id}>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                margin: "0 0 1rem 0",
                textTransform: "capitalize",
              }}
            >
              {color.name}
            </h3>
            <div
              style={{
                border: `1px solid ${isDarkMode ? "#333" : "#eee"}`,
                borderRadius: "8px",
                background: isDarkMode ? "#1a1a1a" : "#fafafa",
                overflow: "hidden",
              }}
            >
              {pairings.map((p, i) => (
                <ContrastRow
                  key={i}
                  {...p}
                  isDarkMode={isDarkMode}
                  isLast={i === pairings.length - 1}
                />
              ))}
            </div>
          </div>
        );
      })}

      <div>
        <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: "0 0 1rem 0" }}>Global</h3>
        <div
          style={{
            border: `1px solid ${isDarkMode ? "#333" : "#eee"}`,
            borderRadius: "8px",
            background: isDarkMode ? "#1a1a1a" : "#fafafa",
            overflow: "hidden",
          }}
        >
          <ContrastRow
            label="Canvas bg + Text default"
            bgVar="--color-background-default"
            fgVar="--color-text-default"
            isDarkMode={isDarkMode}
          />
          <ContrastRow
            label="Canvas bg + Text subtle"
            bgVar="--color-background-default"
            fgVar="--color-text-subtle"
            isDarkMode={isDarkMode}
          />
          <ContrastRow
            label="Surface bg + Text default"
            bgVar="--color-surface-default"
            fgVar="--color-text-default"
            isDarkMode={isDarkMode}
          />
          <ContrastRow
            label="Surface bg + Text subtle"
            bgVar="--color-surface-default"
            fgVar="--color-text-subtle"
            isDarkMode={isDarkMode}
            isLast
          />
        </div>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div
        style={{
          border: `1px solid ${isDarkMode ? "#333" : "#eee"}`,
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: isDarkMode ? "#1a1a1a" : "#fff",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {header}
          {body}
        </div>
      </div>
    );
  }

  return (
    <SystemicModal
      variant="centered"
      isDarkMode={isDarkMode}
      onClose={onClose}
      maxWidth="800px"
      noPadding
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {header}
        {body}
      </div>
    </SystemicModal>
  );
};
