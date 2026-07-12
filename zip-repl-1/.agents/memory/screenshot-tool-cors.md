---
name: Screenshot tool triggers expected 401/500s, not real bugs
description: Why appPreview screenshots of authenticated apps show CORS/auth errors in the browser console that don't affect real users.
---

The `Screenshot` tool (appPreview) loads the app from `http://127.0.0.1`, which is not in a typical CORS allowlist (dev domain + `REPLIT_DOMAINS`). Any app that rejects unknown origins in its CORS middleware will show:
- 401s on authenticated GET endpoints (no session cookie survives the different origin)
- 500s on POST endpoints whose CORS middleware calls `next(err)` on a rejected origin, which Express turns into an unhandled 500 without a dedicated error handler

**Why:** Seen repeatedly on DurianFarm — real users hit the app through the proxied domain (which is allowlisted) and get correct 200/401-only-when-logged-out behavior; only the screenshot tool's origin trips this.

**How to apply:** When a screenshot shows 401/500 console errors on an app with origin-based CORS, check whether the error is a `CORS: origin '...' not allowed` from `127.0.0.1` in the workflow logs before treating it as a regression. If so, it's expected and not worth fixing (or, optionally, add a proper CORS error handler that returns a clean 403 instead of a bare 500, for tidiness).
