# MIRAI repository workflow

- After completing a user-requested code or content modification, run the relevant checks, commit only the files that belong to that request, and push the commit to `origin/main` before the final handoff.
- Do not push to `main` when the user explicitly requests a test branch, preview-only work, or asks not to publish yet; in those cases, follow the requested branch and deployment workflow.
- Never include unrelated working-tree changes in a commit or push.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
