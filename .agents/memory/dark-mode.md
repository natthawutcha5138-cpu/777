---
name: DurianFarm Dark Mode
description: How dark mode is implemented
---
Dark mode uses a CSS class toggle on `document.documentElement`:
- ThemeContext in src/contexts/ThemeContext.tsx manages state + localStorage
- CSS variables for .dark are in src/index.css
- Toggle button is in both Sidebar (bottom) and Topbar
- @custom-variant dark (&:is(.dark *)) is already set up in index.css

**Why:** Tailwind dark: variants require .dark class on html element.
**How to apply:** Use `dark:` Tailwind variants. Use `useTheme()` hook to read/toggle.
