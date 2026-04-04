# Strata — Lessons Learned

Project-specific lessons. Check this file at the start of every session before doing work.

---

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
