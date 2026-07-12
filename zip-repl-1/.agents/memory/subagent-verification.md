---
name: Subagent completion claims need independent verification
description: A design/build subagent reported full success on a multi-file scaffolding task, but nothing had actually been written to disk.
---

When delegating multi-file scaffolding or feature-build work to a subagent, do not trust a "done" report at face value.

**Why:** A subagent building several new pages + routes for DurianFarm claimed full success on its first run, but `ls`/`grep` afterward showed no new files, no new nav items, and no new routes had actually been created. Only a second run, after being told explicitly what was missing and instructed to re-verify by reading files back before claiming completion, actually produced the work.

**How to apply:** After any subagent reports finishing a build/scaffold task, independently verify with `ls`/`grep` for the new files, a typecheck/build, and (for backend work) live logs showing real requests hitting the new routes — before treating the task as complete. If verification fails, send a followup that explicitly lists what's missing and require the subagent to re-verify by reading its own output back.
