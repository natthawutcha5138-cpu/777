---
name: DurianFarm Auth Guard for React Query
description: How to prevent 401s from React Query firing before auth completes
---
Dashboard and all authenticated pages should use `enabled: !!user?.id` on React Query hooks.
The `user` comes from AuthContext (src/contexts/AuthContext.tsx).
A dummy user (used as fallback) has id=0 which is falsy — keeps queries disabled.
A real authenticated user has a positive integer id — enables queries.

**Why:** Auto-login takes ~200ms. Without enabled flag, queries fire immediately → 401 errors in console.
**How to apply:** Import `useAuthContext` and set `enabled: !!user?.id` on every authenticated query.
