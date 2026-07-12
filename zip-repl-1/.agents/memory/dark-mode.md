---
name: DurianFarm Dark Mode Implementation
description: How dark mode is implemented in the web app
---
- ThemeContext in src/contexts/ThemeContext.tsx manages light/dark state + localStorage persistence
- Toggling adds/removes .dark class on document.documentElement
- CSS variables for dark mode already defined in index.css under .dark selector
- Toggle button present in both Sidebar (bottom) and Topbar
- @custom-variant dark (&:is(.dark *)) configured in index.css

**Why:** Tailwind dark: variants require class="dark" on html element.
**How to apply:** Use `dark:` Tailwind variants in components. Use `useTheme()` to read/toggle.
