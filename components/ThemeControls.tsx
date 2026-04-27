import React from "react";
import { X } from "lucide-react";
import { ColorsTab } from "./controls/ColorsTab";
import { GeometryTab } from "./controls/GeometryTab";
import { SemanticTab } from "./controls/SemanticTab";

type ControlTab = "colors" | "geometry" | "semantic";

export const ThemeControls: React.FC<{
  isDarkMode?: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}> = ({ isDarkMode = false, isMobile = false, onClose }) => {
  const [activeTab, setActiveTab] = React.useState<ControlTab>("colors");

  const tabBtn = (tab: ControlTab, label: string) => (
    <button
      onClick={() => setActiveTab(tab)}
      style={{
        background: "transparent",
        border: "none",
        color:
          activeTab === tab ? (isDarkMode ? "#C3E835" : "#0142FE") : isDarkMode ? "#888" : "#666",
        borderBottom:
          activeTab === tab
            ? `2px solid ${isDarkMode ? "#C3E835" : "#0142FE"}`
            : "2px solid transparent",
        padding: "0.5rem 0.25rem",
        fontSize: "0.875rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
        marginBottom: "-1px",
        whiteSpace: isMobile ? "normal" : "nowrap",
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        width: isMobile ? "100%" : "320px",
        height: "100vh",
        borderRight: `1px solid ${isDarkMode ? "#333" : "#eee"}`,
        padding: "2rem 1.5rem",
        overflowY: "auto",
        backgroundColor: isDarkMode ? "#111" : "#fff",
        color: isDarkMode ? "#F8F8F8" : "#1F1F1F",
        display: "flex",
        flexDirection: "column",
      }}
      className="no-scrollbar"
    >
      <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .btn-remove { transition: color 0.2s ease; color: inherit !important; }
                .btn-remove:hover { color: #ef4444 !important; }
                .btn-action { transition: all 0.2s ease; }
                .btn-action:hover {
                    border-color: ${isDarkMode ? "#C3E835" : "#0142FE"} !important;
                    color: ${isDarkMode ? "#C3E835" : "#0142FE"} !important;
                }
            `}</style>

      {/* Logo + mobile close button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 626.59 180"
          style={{ height: "40px", width: "auto", display: "block" }}
        >
          <g>
            <path
              d="M 91.8 81.6 c 4.9 6 7.3 13.6 7.3 22.8 c 0 6.6 -1.5 12.7 -4.4 18.5 c -3 5.8 -7.9 10.5 -14.8 14.3 c -6.9 3.7 -15.9 5.6 -27.1 5.6 H 0 V 3 h 48.6 c 16.7 0 28.6 3.7 35.8 11 c 7.2 7.3 10.7 16.1 10.7 26.2 c 0 7 -2 13.2 -6 18.7 c -4 5.5 -9.8 9.4 -17.4 11.6 c 8.5 1.4 15.2 5.2 20.1 11.1 Z M 18.7 18.7 v 44.9 h 29.9 c 18.6 0 28 -7.3 28 -22.1 c 0 -6.6 -2.1 -12 -6.2 -16.4 c -4.1 -4.3 -11.4 -6.5 -21.8 -6.5 h -29.9 Z m 33.1 108.3 c 10.1 0 17.4 -2.3 22 -6.9 c 4.5 -4.6 6.8 -10.4 6.8 -17.5 s -2.2 -12.6 -6.6 -16.8 c -4.4 -4.3 -11.1 -6.4 -20.2 -6.4 H 18.7 v 47.7 h 33.1 Z"
              fill={isDarkMode ? "#F8F8F8" : "#1F1F1F"}
            ></path>
            <path
              d="M 205.3 98.5 h -69.9 c 0.1 9.6 2.9 17.3 8.2 23.1 c 5.3 5.8 12.4 8.8 21.2 8.8 c 6.3 0 11.7 -1.6 16.1 -4.8 c 4.5 -3.2 7.8 -7.8 10.1 -13.9 l 13.8 6.1 c -3.4 8.9 -8.6 15.7 -15.7 20.4 c -7 4.7 -15.5 7 -25.5 7 c -14.2 0 -25.2 -4.4 -33.1 -13.1 c -7.9 -8.7 -11.8 -21.2 -11.8 -37.3 s 3.9 -29.5 11.8 -38.8 c 7.9 -9.3 18.8 -14 32.9 -14 s 23.7 3.8 31 11.4 c 7.3 7.6 10.9 18.7 10.9 33.3 v 11.8 Z m -16.9 -13.6 v -2.2 c 0 -8.9 -2.2 -15.8 -6.6 -20.5 c -4.4 -4.7 -10.7 -7.1 -18.8 -7.1 c -8.5 0 -15.2 2.6 -20 7.9 c -4.8 5.3 -7.3 12.5 -7.6 21.9 h 53 Z"
              fill={isDarkMode ? "#F8F8F8" : "#1F1F1F"}
            ></path>
            <path
              d="M 316.3 142.8 h -20.7 l -29.7 -48.3 l -17.9 18.1 v 30.1 h -16.7 V 0 h 16.7 v 92.8 l 44.1 -48.5 h 21.9 l -36 38 l 38.4 60.5 Z"
              fill={isDarkMode ? "#F8F8F8" : "#1F1F1F"}
            ></path>
            <path
              d="M 421.2 142.8 h -20.7 l -29.7 -48.3 l -17.9 18.1 v 30.1 h -16.7 V 0 h 16.7 v 92.8 l 44.1 -48.5 h 21.9 l -36 38 l 38.4 60.5 Z"
              fill={isDarkMode ? "#F8F8F8" : "#1F1F1F"}
            ></path>
          </g>
        </svg>
        {isMobile && (
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: isDarkMode ? "#F8F8F8" : "#1F1F1F",
              cursor: "pointer",
              padding: "0.5rem",
              display: "flex",
            }}
          >
            <X size={24} />
          </button>
        )}
      </div>

      {/* Tab navigation */}
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          marginBottom: "1.5rem",
          borderBottom: `1px solid ${isDarkMode ? "#333" : "#eee"}`,
          paddingBottom: "0",
        }}
      >
        {tabBtn("colors", "Colors")}
        {tabBtn("geometry", "Type & Size")}
        {tabBtn("semantic", "Customize")}
      </div>

      {activeTab === "colors" && <ColorsTab isDarkMode={isDarkMode} isMobile={isMobile} />}
      {activeTab === "geometry" && <GeometryTab isDarkMode={isDarkMode} />}
      {activeTab === "semantic" && <SemanticTab isDarkMode={isDarkMode} />}
    </div>
  );
};
