---
name: Farm photos for DurianFarm AI
description: Where real farm/durian photos are stored and how they were sourced
---

Real (non-AI) photos are stored in `artifacts/durian-farm/public/images/`:
- `farm-wide.jpg` — wide lush farm landscape (304KB) — used as Login page left-panel BG
- `tropical2.jpg` — large tropical green scene (598KB) — used as Dashboard hero banner
- `durian-close.jpg` — tropical fruit close-up (208KB) — decorative strip
- `thai-farm.jpg` — Thailand landscape (117KB) — decorative strip
- `tropical-farm.jpg` — tropical plant (191KB)
- `fruit2.jpg` — fruit shot (110KB)

**Source:** Unsplash CDN (`https://images.unsplash.com/photo-{id}?w=1200&q=80`)
**Why:** Wikimedia Commons and Pixabay return 403/blocked from this sandbox; Unsplash CDN returns HTTP 200 and downloads correctly.
**How to add more:** Use `curl -sL "https://images.unsplash.com/photo-{id}?w=1200&q=80" -o public/images/name.jpg` and verify file size > 50KB.
