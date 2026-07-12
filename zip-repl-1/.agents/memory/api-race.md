---
name: DurianFarm API Query Race Condition
description: Dashboard queries must wait for auth before firing
---
Dashboard.tsx uses AuthContext to get `user`. All React Query hooks use:
  enabled: !!user?.id
This prevents 401 errors during the brief window between page load and auto-login completion.
The dummy user (when auth fails) has id=0, which is falsy, so queries don't fire.

**Why:** Auto-login takes ~200ms. Without enabled flag, queries fire immediately and return 401.
**How to apply:** All pages with authenticated API calls should use `enabled: !!user?.id` pattern.
