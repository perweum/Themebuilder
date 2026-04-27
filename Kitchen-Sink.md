# Component Kitchen Sink: Theme Validation

This document lists the essential components required to "stress-test" the generated theme. Every component here must use Functional Tokens, never raw hex codes.

## 1. Action Suite

| Component          | Tokens Used                                      | Validation Goal                                     |
| :----------------- | :----------------------------------------------- | :-------------------------------------------------- |
| **Primary Button** | `interactive-brand-rest`, `text-brand-default`   | Check AAA contrast for inverse text.                |
| **Outline Button** | `border-brand-rest`, `text-brand-contrast`       | Ensure border and text are perceptually identical.  |
| **Accent Action**  | `interactive-accent-rest`, `text-accent-default` | Verify accent palette doesn't clash with brand.     |
| **Disabled State** | `interactive-disabled`, `text-disabled`          | Ensure it looks non-interactive on all backgrounds. |

## 2. Feedback & Status (Global)

| Component         | Tokens Used                           | Validation Goal                         |
| :---------------- | :------------------------------------ | :-------------------------------------- |
| **Error Message** | `border-error`, `text-error-contrast` | Test "Danger" visibility.               |
| **Success Toast** | `bg-success`, `text-success-contrast` | Test soft-tinted background legibility. |

## 3. Layout & Depth

| Component          | Tokens Used                        | Validation Goal                         |
| :----------------- | :--------------------------------- | :-------------------------------------- |
| **App Shell**      | `bg-default`                       | Base workspace contrast.                |
| **Surface Card**   | `surface-default`, `border-subtle` | Test "elevation" without using shadows. |
| **Accent Section** | `bg-accent`                        | Verify "Secondary" area prominence.     |
