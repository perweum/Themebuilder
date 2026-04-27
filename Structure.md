# Theme Engine: Universal Token Blueprint

This document defines the mapping logic for Primary (Brand), Accent, and Global colors.

## 🔄 The Mirror Logic (Dynamic Generation)

When a user adds an **Accent** or **Global** color, the engine must not require manual entry of 12 shades. The engine takes the single "Seed Color" (Step 7) and applies the **Palette-Logic.md** algorithm to generate the full 12-step ramp automatically.

### 1. Master Token Blueprint

The following tokens are instantiated for every palette type (`brand`, `accent`, `success`, `error`, `warning`).

| Functional Token           | Mapping Logic | Component Usage                                          |
| :------------------------- | :------------ | :------------------------------------------------------- |
| `bg-[type]`                | Step 1        | Soft tinted background for sections/hero areas.          |
| `surface-[type]-rest`      | Step 3        | Container backgrounds (Cards, Modals).                   |
| `surface-[type]-hover`     | Step 4        | Interaction state for containers.                        |
| `surface-[type]-press`     | Step 5        | Active state for containers.                             |
| `interactive-[type]-rest`  | Step 7        | Main action color (Buttons, Toggles, Branded icons).     |
| `interactive-[type]-hover` | Step 8        | Hover state for primary actions.                         |
| `interactive-[type]-press` | Step 9        | Pressed state for primary actions.                       |
| `text-[type]-default`      | Step 1        | **Inverse Text:** Used ONLY on top of Step 7, 8, or 9.   |
| `text-[type]-contrast`     | Step 7        | **Tinted Text:** Used for outlined buttons or subtitles. |

## 🌍 Automated Global Semantic Generation

To keep the theme builder efficient, Global colors follow a "Single Seed" workflow.

1. **User Action:** User picks a "Success Green."
2. **Engine Action:** - Generates the 12-step "Success" ramp.
   - Maps `surface-globalSuccess-rest` to Success-Step 3.
   - Maps `interactive-globalSuccess-rest` to Success-Step 7.
   - Maps `border-globalSuccess` to Success-Step 7.
3. **WCAG Validation:** The engine automatically checks if the generated `text-success-default` (Step 1) passes against the `interactive-success-rest` (Step 7).

## 🛠 Static Neutrals & Shared Tokens

These tokens do not mirror the brand/accent colors and are pulled from a shared **Neutral** scale:

- `surface-default`: Hardcoded to White (#FFFFFF) or Neutral-Step 1.
- `interactive-disabled`: Neutral-Step 4.
- `text-disabled`: Neutral-Step 6.
- `border-subtle`: Neutral-Step 3.
