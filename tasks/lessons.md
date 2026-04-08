# Strata — Lessons Learned

Project-specific lessons. Check this file at the start of every session before doing work.

---

### 2026-04-08 — Standalone script directories need tsconfig exclusion too
- **What happened:** Added `scripts/pm-briefing/` and `scripts/competitive-research/` with their own `package.json` and TypeScript configs. Vercel's build picked up the scripts' TypeScript files (including an ES2018 regex flag) and failed.
- **Rule:** When adding standalone script directories, add them to the root `tsconfig.json` `exclude` array. Currently: `"exclude": ["node_modules", "tests", "scripts"]`.

### 2026-04-08 — Vercel serverless timeout causes HTML responses instead of JSON
- **What happened:** AI structure endpoint switched from OpenAI to Anthropic Claude Opus (30-90s response time). Vercel's default 10s timeout killed the function and returned an HTML 502/504 page. Frontend called `res.json()` on HTML and got `SyntaxError: Unexpected token '<'`.
- **Rule:** Always add `export const maxDuration = 60;` to any API route that calls an AI model. Vercel defaults to 10s (Hobby) or 15s (Pro) without this.

### 2026-04-08 — removeConsole strips ALL logging in production builds
- **What happened:** `next.config.ts` had `removeConsole: process.env.NODE_ENV === "production"` which stripped `console.error` too, making Vercel function logs completely empty. The PDF upload bug was invisible in production.
- **Rule:** Use `removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false` to keep error/warn logging in production.

### 2026-04-06 — Vercel build fails when tests/ directory has its own TypeScript
- **What happened:** Added `tests/usability/` with its own `package.json` and Playwright dependency. Vercel's TypeScript check picked up `playwright.config.ts` and couldn't find `@playwright/test` (only installed in `tests/usability/node_modules/`, not the root).
- **Rule:** When adding standalone test directories with their own dependencies, always add the directory to the root `tsconfig.json` `exclude` array. Currently: `"exclude": ["node_modules", "tests"]`.

### 2026-04-05 — Tailwind v4 translate utilities silently broken in Chrome
- **What happened:** Mobile sidebar appeared "stuck" — `-translate-x-full` and `lg:translate-x-0` classes were applied but `getComputedStyle(aside).transform` returned `"none"`. Sidebar never moved off-screen on mobile, overlapping content site-wide.
- **Root cause:** Tailwind v4 generates translate utilities using the CSS `translate` property (not `transform`) composed from `var(--tw-translate-x) var(--tw-translate-y)`. The default values are registered inside a `@supports` block Chrome doesn't match, so `--tw-translate-y` is never initialized, the declaration is invalid, and Chrome silently ignores it.
- **Rule:** For sliding UI (drawers, sidebars, slide-ins) in this codebase, NEVER use Tailwind translate utilities. Use a CSS class in `globals.css` with raw `translate: -100% 0` values, toggled by a data attribute. See `SidebarNav.tsx` + `.sidebar-nav` class in globals.css for the working pattern.
- **Fix reference:** commit introducing `.sidebar-nav` class + `data-mobile-open` attribute pattern.

### 2026-04-05 — Review against local dev server, not live deploy
- **What happened:** Design review of sharestrata.com/demo flagged "Pipeline Coverage shows 4x" and "Klosio SOC 2 shows green checkmark" as bugs. Both were phantom — the repo already had the correct values. Sharestrata.com was running a stale deploy because GitHub auto-deploy isn't connected.
- **Rule:** For any visual/design review, run `NODE_ENV=production npm run dev` locally and point Puppeteer at `http://localhost:3000`. Only review against the live URL when specifically validating the deployed state. Strata deploys manually with `NODE_ENV=production vercel --prod` — always assume the live URL lags behind `main`.

### 2026-04-04 — Tailwind v4 `@theme inline` bakes CSS variables as static values
- **What happened:** Light theme CSS variable overrides weren't taking effect. `@theme inline` compiled the dark theme values as static hex in the class utilities, so the `[data-theme="light"]` overrides had nothing to override.
- **Rule:** Use `@theme` (not `@theme inline`) in `globals.css` when any CSS variable needs runtime overrides (theme switching, branding palette, user-set colors).

---

*Append new lessons at the top. Format: date + short description, then "What happened" and "Rule" bullets.*
