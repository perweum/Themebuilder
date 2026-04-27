# Palette Generation: The 12-Step Engine

To ensure visual consistency and WCAG compliance, all palettes (Brand, Accent, Global) are generated using a Perceptual Color Space (OKLCH or CIELAB) rather than HSL/RGB.

## 1. The Generation Algorithm

When a user provides a `base-color` (Step 7), the engine must calculate the remaining 11 steps based on the following luminosity ($L$) targets:

| Step  | Luminosity ($L$) | Role                        |
| :---- | :--------------- | :-------------------------- |
| 1     | 98%              | Main Background             |
| 2     | 95%              | Subtle Background           |
| 3     | 90%              | Surface Rest                |
| 4     | 82%              | Surface Hover / Border      |
| 5     | 74%              | Surface Press               |
| 6     | 62%              | Mid-range / Disabled        |
| **7** | **50%**          | **Base Brand (User Input)** |
| 8     | 42%              | Interactive Hover           |
| 9     | 34%              | Interactive Press           |
| 10    | 24%              | Subdued Text                |
| 11    | 12%              | Deep Text                   |
| 12    | 14%              | Maximum Contrast Text       |

## 2. Saturation & Hue "Chroma" Scaling

- **Pure Neutral:** If the user selects a neutral, Chroma ($C$) remains at 0.
- **Vibrant:** To keep colors from looking "washed out" in light steps or "muddy" in dark steps, the Chroma should slightly peak at Step 7 and taper off toward Steps 1 and 12.

## 3. WCAG Guardrail Logic

The generator must perform a "Collision Check":

1.  **Foreground/Background Pairing:** If `Step 7` (Interactive) and `Step 1` (Text-Inverse) do not meet a 4.5:1 ratio, the engine must nudge the $L$ value of Step 7 or Step 1 until they pass.
2.  **Visual Badge Trigger:** - Compare $L$ of `Step X` vs `Step Y`.
    - Render badge in the UI: `🟢 Pass`, `🟡 AA`, or `🔴 Fail`.
