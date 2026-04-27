import React from "react";
import { Check } from "lucide-react";

export interface DemoProps {
  primaryColorName?: string;
  accentColorName?: string;
}

export const StepperDemo: React.FC<DemoProps> = ({
  primaryColorName = "brand",
  accentColorName = "accent",
}) => {
  // 1: Completed, 2: Active, 3: Upcoming
  const steps = [
    { id: 1, label: "Account Details", status: "completed" },
    { id: 2, label: "Profile Setup", status: "active" },
    { id: 3, label: "Review & Submit", status: "upcoming" },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        maxWidth: "600px",
        fontFamily: "inherit",
      }}
    >
      {steps.map((step, index) => {
        const isCompleted = step.status === "completed";
        const isActive = step.status === "active";
        const isUpcoming = step.status === "upcoming";
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step.id}>
            {/* Step Item */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              {/* Step Indicator */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: isCompleted
                    ? "var(--color-base-success-default)"
                    : isActive
                      ? `var(--color-base-${primaryColorName}-default)`
                      : "transparent",
                  border: isUpcoming
                    ? "2px solid var(--color-border-subtle)"
                    : "2px solid transparent",
                  color: isCompleted
                    ? "var(--color-text-success-contrast, #fff)"
                    : isActive
                      ? `var(--color-text-${primaryColorName}-contrast, #fff)`
                      : "var(--color-text-subtle)",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  transition: "all 0.3s ease",
                }}
              >
                {isCompleted ? <Check size={16} strokeWidth={3} /> : step.id}
              </div>

              {/* Step Label */}
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: isActive ? 600 : 500,
                  color:
                    isActive || isCompleted
                      ? "var(--color-text-default)"
                      : "var(--color-text-subtle)",
                  whiteSpace: "nowrap",
                }}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div
                style={{
                  flex: 1,
                  height: "2px",
                  background: isCompleted
                    ? "var(--color-base-success-default)"
                    : "var(--color-border-subtle)",
                  margin: "0 16px",
                  transition: "all 0.3s ease",
                  opacity: isUpcoming ? 0.5 : 1,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
