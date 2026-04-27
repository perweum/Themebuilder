# Design System Guidelines: Theming & Accessibility

## 1. Defining Your Palettes

Our system relies on a **12-step Perceptual Ramp**. This ensures that "Step 7" has the same visual weight whether it is blue, pink, or green.

### Brand vs. Accent

- **Brand Color:** Use this for your primary actions and identity. It should be the most recognizable color in your UI.
- **Accent Color:** Use sparingly for "Secondary" actions, tags, or to draw attention to specific UI features (e.g., a "New" badge or a "Sale" banner).
- **Global Colors:** Reserved for semantic meaning (Error = Red, Success = Green). Do not use Brand colors for system status messages.

## 2. Accessibility & Contrast (WCAG 2.1)

The theme builder enforces readability through **Step-Pairing**.

- **AA Standard (4.5:1):** Any text used on `surface-default` must be at least **Step 10** or higher.
- **Inverse Contrast:** When using a filled button (`interactive-brand-rest`), the system automatically sets the text to **Step 1** to ensure a safe contrast ratio against the dark background.
- **Interactive Targets:** Focus rings (`border-focus`) must always use **Step 8** to ensure they are visible to users with visual impairments.

## 3. Best Practices for Theme Building

- **Avoid "Near-Neutrals":** If your Accent color is too close to your Brand color (Delta-E < 5), the system will flag a warning. Choose colors that are distinct.
- **Dark Mode:** When building a dark theme, the 12-step scale is simply inverted. **Step 1** becomes the darkest color, and **Step 12** becomes the lightest.
