import React from "react";
import { useTheme, FULL_GLOBAL_PRESET } from "../../theme-context";
import { ColorPickerMenu } from "../ColorPickerMenu";
import { Pencil } from "lucide-react";

// --- ThemeNameEditor ---
// Inline editable theme name field, used in the colors tab only.
const ThemeNameEditor: React.FC<{
  initialName: string;
  themeId: string;
  onRename: (id: string, newName: string) => void;
  isDarkMode: boolean;
}> = ({ initialName, themeId, onRename, isDarkMode }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempName, setTempName] = React.useState(initialName);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  const submit = () => {
    setIsEditing(false);
    const finalName = tempName.trim() || themeId;
    setTempName(finalName);
    if (finalName !== initialName) onRename(themeId, finalName);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={tempName}
        onChange={(e) => setTempName(e.target.value)}
        onBlur={submit}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") {
            setTempName(initialName);
            setIsEditing(false);
          }
        }}
        style={{
          background: isDarkMode ? "#333" : "#fff",
          border: `1px solid ${isDarkMode ? "#555" : "#ccc"}`,
          color: "inherit",
          fontSize: "1rem",
          fontWeight: 600,
          outline: "none",
          padding: "0.25rem 0.5rem",
          borderRadius: "4px",
          width: "100%",
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
        }}
      />
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        cursor: "pointer",
        padding: "0.25rem 0",
      }}
      onClick={() => setIsEditing(true)}
      title="Edit Theme Name"
    >
      <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0, color: "inherit" }}>
        {initialName}
      </h2>
      <Pencil size={14} style={{ opacity: 0.5, color: "inherit" }} />
    </div>
  );
};

// --- ColorsTab ---
export const ColorsTab: React.FC<{ isDarkMode: boolean; isMobile: boolean }> = ({
  isDarkMode,
  isMobile,
}) => {
  const {
    themes,
    addTheme,
    updateThemeName,
    removeTheme,
    addThemeColor,
    updateThemeColor,
    removeThemeColor,
    globalColors,
    addRandomGlobalColor,
    updateGlobalColor,
    removeGlobalColor,
    addGlobalColorsPreset,
  } = useTheme();

  const hasAllPresets = FULL_GLOBAL_PRESET.every((fp) =>
    globalColors.some((gc) => gc.id === fp.id),
  );

  const allExistingColors = [
    ...themes.flatMap((t) =>
      t.colors.map((c) => ({ id: c.id, name: c.name, seed: c.seed, themeName: t.name || t.id })),
    ),
    ...globalColors.map((c) => ({ id: c.id, name: c.name, seed: c.seed, themeName: "Global" })),
  ];

  const label: React.CSSProperties = {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: isDarkMode ? "#C3E835" : "#0142FE",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    display: "flex",
    justifyContent: "space-between",
  };

  const group: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    marginBottom: "1rem",
  };

  const themeBox: React.CSSProperties = {
    border: "none",
    borderRadius: "8px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    backgroundColor: isDarkMode ? "#1a1a1a" : "#f9fafb",
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: "1rem",
    fontWeight: 400,
    borderBottom: `1px solid ${isDarkMode ? "#333" : "#eee"}`,
    paddingBottom: "0.5rem",
    marginBottom: "1rem",
    color: isDarkMode ? "#eee" : "#111",
  };

  const actionBtn: React.CSSProperties = {
    background: "transparent",
    color: isDarkMode ? "#F8F8F8" : "#1F1F1F",
    border: `1px solid ${isDarkMode ? "#F8F8F8" : "#1F1F1F"}`,
    padding: "0.5rem",
    borderRadius: "0px",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    transition: "all 0.2s ease",
    width: "100%",
  };

  const removeBtn: React.CSSProperties = {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "0.25rem",
    fontSize: "0.875rem",
    color: "inherit",
  };

  return (
    <>
      {/* Theme color rows */}
      {themes.map((theme, index) => (
        <div key={theme.id} style={themeBox}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <ThemeNameEditor
              initialName={theme.name || theme.id}
              themeId={theme.id}
              onRename={updateThemeName}
              isDarkMode={isDarkMode}
            />
            {index > 0 && (
              <button
                className="btn-remove"
                onClick={() => removeTheme(theme.id)}
                style={removeBtn}
              >
                Remove
              </button>
            )}
          </div>
          {theme.colors.map((color) => (
            <div key={color.id} style={group}>
              <label style={label}>
                {color.name} Color
                <button
                  className="btn-remove"
                  onClick={() => removeThemeColor(theme.id, color.id)}
                  style={{ ...removeBtn, padding: "0 0.25rem" }}
                >
                  ✕
                </button>
              </label>
              <ColorPickerMenu
                name={color.name}
                seed={color.seed}
                isDarkMode={isDarkMode}
                existingColors={allExistingColors}
                onUpdate={(newName, newSeed) =>
                  updateThemeColor(theme.id, color.id, newName, newSeed)
                }
              />
            </div>
          ))}
          <button
            className="btn-action"
            onClick={() => addThemeColor(theme.id)}
            style={{ ...actionBtn, marginTop: "0.5rem" }}
          >
            + Add theme color
          </button>
        </div>
      ))}
      <button
        className="btn-action"
        onClick={addTheme}
        style={{ ...actionBtn, marginBottom: "1.5rem" }}
      >
        + Add New Theme
      </button>

      {/* Global States */}
      <div style={themeBox}>
        <h3 style={{ ...sectionTitle, borderBottom: "none", paddingBottom: 0, marginTop: 0 }}>
          Global States
        </h3>
        {globalColors.map((color) => (
          <div key={color.id} style={group}>
            <label style={label}>
              {color.name}
              {!["neutral", "success", "error"].includes(color.id) && (
                <button
                  className="btn-remove"
                  onClick={() => removeGlobalColor(color.id)}
                  style={removeBtn}
                >
                  Remove
                </button>
              )}
            </label>
            <ColorPickerMenu
              name={color.name}
              seed={color.seed}
              isDarkMode={isDarkMode}
              existingColors={allExistingColors}
              onUpdate={(newName, newSeed) => updateGlobalColor(color.id, newName, newSeed)}
            />
          </div>
        ))}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <button
            className="btn-action"
            onClick={addRandomGlobalColor}
            style={{ ...actionBtn, flex: 1 }}
          >
            + Add color
          </button>
          {!hasAllPresets && (
            <button
              className="btn-action"
              onClick={addGlobalColorsPreset}
              style={{ ...actionBtn, flex: 2 }}
            >
              + Add standard set
            </button>
          )}
        </div>
      </div>
    </>
  );
};
