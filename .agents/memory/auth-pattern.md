---
name: DurianFarm Auto-Login Pattern
description: How auth works now that login page is removed
---
The app no longer shows a login page. useAuth.ts automatically:
1. Checks /api/auth/me on mount
2. If 401, tries POST /api/auth/login with username=farmowner, password=durian2024
3. If login fails (first time), tries POST /api/auth/register to create the account
4. Sets user state once authenticated

**Why:** User wanted to remove login/registration UI but keep the API secure.
**How to apply:** Any new page queries should use `enabled: !!user?.id` from AuthContext to avoid firing before auth completes.
