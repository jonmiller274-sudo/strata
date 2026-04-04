# Strata Editor Design System

This document defines the visual reference spec for the Strata editor. The autonomous quality agent uses this as the single source of truth for what "correct" looks like. All changes must conform to these patterns.

---

## Colors

All colors come from CSS variables in `globals.css`. Never use raw hex in components.

### Semantic Palette (Dark Theme — Default)
| Token | Value | Use |
|-------|-------|-----|
| `background` | `#0a0b10` | Page background |
| `surface` | `#12141d` | Elevated surfaces |
| `card` | `#181b27` | Card backgrounds |
| `card-hover` | `#1f2333` | Card hover state |
| `border` | `#2a2e3f` | Named border color |
| `foreground` | `#e8eaf0` | Primary text |
| `muted` | `#8b92a8` | Secondary text |
| `muted-foreground` | `#6b7280` | Tertiary/hint text |
| `accent` | `#6366f1` | Primary brand/action color |
| `accent-hover` | `#818cf8` | Accent hover state |
| `accent-muted` | `#4f46e520` | Subtle accent fill |

### Status Colors
| Color | Value | Use |
|-------|-------|-----|
| Success | `#34d399` | Confirmations, "keep" actions |
| Warning | `#fbbf24` | Caution states |
| Danger | `#f87171` | Delete, errors, destructive actions |

---

## Opacity System

Backgrounds and borders use white/accent + opacity for depth layering. This IS the transparency system — do not introduce new opacity values.

### Backgrounds
| Class | Use |
|-------|-----|
| `bg-white/5` | Default container/input background |
| `bg-white/10` | Hover state on white/5, or standalone darker container |
| `bg-white/20` | Hover escalation (rare) |
| `bg-accent/5` | Subtle accent container |
| `bg-accent/10` | Badge/highlight background |
| `bg-accent/20` | Selected/active toggle state |

### Borders
| Class | Use |
|-------|-----|
| `border-white/10` | Default quiet border (dividers, cards, panels) |
| `border-white/20` | Hover state on bordered elements |
| `border-white/30` | Deep hover (upload zones, interactive borders) |
| `border-accent` | Active/focused selection |
| `border-accent/30` | Soft focus ring |
| `border-accent/50` | Focus ring on inputs |

**Rule:** Default borders are ALWAYS `white/10`. Only escalate on hover/focus. Never use `white/15` — normalize to `white/10`.

---

## Typography

### Scale (ONLY these sizes in editor components)
| Class | Use |
|-------|-----|
| `text-[10px]` | Labels, metadata, hints, uppercase tracking fields |
| `text-xs` (12px) | Descriptions, secondary info, error messages |
| `text-sm` (14px) | Body text, buttons, form inputs, primary UI text |
| `text-base` (16px) | Section titles in sidebar |
| `text-lg` (18px) | Large metric values |
| `text-2xl` (24px) | Editable section titles |

**Kill list:** `text-[11px]` (normalize to `text-xs`), `text-[9px]` (normalize to `text-[10px]`)

### Label Pattern
```
text-[10px] font-medium text-muted-foreground uppercase tracking-wide
```
This is the standard "label voice" for form fields and metadata.

### Weights
| Weight | Use |
|--------|-----|
| `font-medium` | Buttons, labels, sidebar items |
| `font-bold` | Section titles, headings |
| Normal (no class) | Body text, descriptions |

---

## Buttons

Three patterns. Every button in the editor must be one of these.

### Primary (main action)
```
bg-accent text-white hover:bg-accent/80 transition-colors
```
Use for: Generate, Apply, Confirm, Keep, Add Selected

### Secondary (cancel, alternative)
```
bg-white/10 text-muted-foreground hover:bg-white/20 transition-colors
```
Use for: Cancel, Discard, Change, Back

### Destructive (delete, remove)
```
bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors
```
Use for: Delete, Remove (after confirmation)

### Disabled State (all buttons)
```
disabled:opacity-30 disabled:cursor-not-allowed
```

### Button Sizing
```
px-3 py-1 rounded text-xs font-medium    // Small (inline actions)
px-3 py-2 rounded-lg text-sm font-medium  // Standard (form buttons)
w-full px-3 py-2.5 rounded-lg text-sm font-medium  // Full-width (panel actions)
```

---

## Interactive States

### The 4-State Rule
Every interactive element MUST have all 4 states:
1. **Default** — resting appearance
2. **Hover** — visual feedback on mouse-over (`transition-colors` required)
3. **Loading/Active** — spinner or visual change when processing
4. **Disabled** — `opacity-30 cursor-not-allowed` when unavailable

### Async Operation States
Every operation that calls an API MUST show:
1. **Loading** — `Loader2` spinner + descriptive text ("Structuring... (15-30s)")
2. **Success** — result display or confirmation
3. **Error** — red pill: `text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2`

### Error Message Pattern
```jsx
<p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
  {error}
</p>
```
This is the ONE error pattern. No inline red text, no other formats.

---

## Form Inputs

### Text Input
```
w-full bg-white/5 rounded px-2 py-1.5 text-sm outline-none
placeholder:text-muted-foreground/50
focus:ring-1 focus:ring-accent/50
```

### Textarea
```
w-full bg-white/5 rounded-lg px-3 py-2 text-sm outline-none resize-none
placeholder:text-muted-foreground/50
focus:ring-1 focus:ring-accent/50
```

### Inline Editor (click-to-edit)
```
// Display mode
hover:ring-1 hover:ring-accent/30 hover:bg-accent/5 rounded transition-all cursor-pointer

// Edit mode
bg-white/10 ring-1 ring-accent/50 rounded
```

---

## Spacing

### Standard Padding
| Size | Class | Use |
|------|-------|-----|
| Tight | `p-2` | Small cards, compact sections |
| Default | `p-3` or `p-4` | Panel content, form sections |
| Breathing | `p-6` | Editor main content area |
| Large | `p-8` | Upload zones, empty states |

### Standard Gaps
| Size | Class | Use |
|------|-------|-----|
| Tight | `gap-1.5` | Icon + text, inline elements |
| Default | `gap-2` | Form fields, button groups |
| Breathing | `gap-3` | Section stacks, panel content |

---

## Animations

### Durations
| Speed | Var | Use |
|-------|-----|-----|
| Fast | `150ms` | Hover states, color transitions |
| Normal | `300ms` | Panel slides, content transitions |
| Slow | `500ms` | Page-level animations |

### Required Transitions
- All color changes: `transition-colors`
- Layout changes: `transition-all`
- Framer Motion for: sidebar slide, modal enter/exit, panel toggle

---

## Accessibility Minimums

### Required ARIA
- All icon-only buttons: `aria-label="[action]"`
- Dynamic status changes: `aria-live="polite"`
- Form inputs: associated `<label>` or `aria-label`

### Keyboard
- All interactive elements: focusable via Tab
- Escape: close/cancel current context
- Enter: confirm/submit
- Custom shortcuts: show in `title` attribute tooltip

---

*This document is the agent's reference spec. Changes require a planning session with Jon.*
