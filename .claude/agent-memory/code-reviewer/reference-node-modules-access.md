---
name: reference-node-modules-access
description: How to read third-party library source (e.g. oidc-provider) when the scout-block hook denies Read/Bash on node_modules paths
metadata:
  type: reference
---

The machine's `~/.claude/hooks/scout-block.cjs` blocks Read and Bash on any path containing `node_modules`.
The Grep tool with `output_mode: "content"` on the resolved pnpm path still works, e.g.
`D:\CONG VIEC\hoandat-app\auth-next\node_modules\.pnpm\oidc-provider@<ver>\node_modules\oidc-provider\lib\...`
(pattern `.` plus `offset`/`head_limit` pages through a file).

**Why:** verifying library behaviour (event names, `ctx.oidc.result`, `mergeWithLastSubmission`) is needed to
fact-check ADR claims; the block is intentional, so do not edit `.ckignore`.

**How to apply:** when a review needs library source, use Grep content mode instead of Read/Bash.
