# DESIGN_SYSTEM.md — Winnow

## Identity
- **World statement:** A grain elevator at night: an industrial instrument that separates wheat from chaff at scale, calm and certain, where every number glows because it was just measured.
- **Accent:** `#34d399` (emerald-400) — the "verified live" signal. One hue only; interactive states use emerald-500/600/700 steps of the same hue.
- **Signature element:** the live measurement counter — tabular-numeral mono figures that tick up to their DB-derived value on load, paired with a pulsing emerald "measuring" dot. Every number on screen is recomputable; the tick says "just measured".

## Tokens

### Color
| Token | Value | Use |
|---|---|---|
| `bg-base` | `#09090b` (zinc-950) | page background (level 0) |
| `surface-1` | `rgba(24,24,27,0.4)` (zinc-900/40) | cards at rest |
| `surface-2` | `rgba(24,24,27,0.7)` (zinc-900/70) | cards on hover, pre/code wells |
| `border-hairline` | `#27272a` (zinc-800) | resting borders |
| `border-raised` | `#52525b` (zinc-600) | hover borders |
| `ink` | `#f4f4f5` (zinc-100) | primary text |
| `ink-muted` | `#a1a1aa` (zinc-400) | secondary text |
| `ink-faint` | `#71717a` / `#52525b` (zinc-500/600) | captions, footers |
| `brand` | `#34d399` (emerald-400) | links, verified, signature |
| `brand-solid` | `#047857` (emerald-700, hover 600) | primary buttons |
| Semantic | success `#34d399`, warning `#fbbf24` (amber-400), danger `#f87171` (red-400) | grade colors A→F ride emerald/lime/amber/orange/red 600-700 solids |

### Type
- **Display/body:** Geist Sans (local, `--font-geist-sans`). **Numbers/addresses/hashes:** Geist Mono (`--font-geist-mono`) with `font-variant-numeric: tabular-nums` (`.tnum`).
- Hero uses fluid `clamp()`: `text-[clamp(2rem,5vw,3.25rem)]`. Section labels: `text-sm uppercase tracking-widest`.

### Spacing
Tailwind 4px base. Page rhythm: `px-6`, hero `py-12`, section gaps `mt-8`/`mt-12`, card padding `p-4`/`p-6`, grid gaps `gap-3`/`gap-4`.

### Radius (CF-1)
`--radius-sm: 4px` (focus rings, badges via `rounded`), `--radius-md: 6px` (buttons, `rounded-md`), `--radius-lg: 8px` (cards, `rounded-lg`). No ad-hoc literals; Tailwind classes map 1:1 to this scale.

## Craft
- **Elevation ladder (CF-2):** level 0 = `bg-base`; level 1 = `.card` (surface-1 + hairline border + inset top highlight); level 2 = hover (surface-2 + border-raised + glow shadow) and `.well` (pre/transcript surfaces). Dark world: elevation = lighter bg steps + glow, never border alone.
- **Shadow philosophy (CF-5): pure-glow.** Dark/luminous world. Resting cards carry `inset 0 1px 0 rgba(255,255,255,0.03)`; raised state adds `0 0 0 1px rgba(52,211,153,0.07), 0 4px 24px -8px rgba(0,0,0,0.6)` (brand-alpha ring + ambient). No soft-elevation ladders, no pixel offsets.
- **Glass recipe (CF-3):** nav only — `backdrop-blur` + `bg-zinc-950/85` + mandatory `inset 0 -1px 0 rgba(255,255,255,0.04)` bottom-edge highlight in the same shadow stack.
- **Hover recipe (CF-4):** `.card-hover` = `transform: translateY(-1px)` + surface-2 + border-raised + glow step-up, inside `@media (hover: hover)`. Never color alone on surface-level interactives; text links may shift to brand hue.
- **Focus-visible recipe:** `outline: 2px solid #10b981; outline-offset: 2px; border-radius: var(--radius-sm)` on `a, button, summary, input` app-wide.
- **Signature element placement:** landing hero counters (ticking `.tnum` mono) + the pulsing "index growing live" dot; grade bars on agent detail reuse the same measured-glow language.

## Primitives
- **Card:** `.card` = `rounded-lg border border-zinc-800 bg-zinc-900/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]`; interactive cards add `.card-hover`.
- **Well:** `.well` = surface-2 + hairline + `rounded-lg` for transcripts/errors (`pre`).
- **Button (primary):** `px-4 py-2 rounded-md bg-emerald-700 hover:bg-emerald-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed` (danger: red-800/700, caution: amber-700/600).
- **Badge (grade):** `px-2 py-0.5 rounded text-xs font-bold` on grade-color solid; ungraded = zinc-800/zinc-400 "not yet probed".
- **Meter:** `.meter` track (zinc-800, `rounded-full`, h-1.5) + `.meter-fill` (emerald-500, width = value, 400ms ease-out).

## Motion
- Default transition: `150ms ease` on color/background/border/box-shadow/transform (global `a, button`; cards inherit via `.card-hover`).
- Counter tick: rAF count-up ~700ms ease-out to the real value (never a fake number; final frame = API value).
- Meter fills animate width 400ms ease-out on mount. Pulse dot: `animate-pulse` (Tailwind default 2s).
- Skeletons: `animate-pulse` zinc-900 blocks. No parallax, no scroll-triggered motion; instrument calm.

## Honest-copy law (binding)
Never claim the full corpus is graded ("we grade all" banned). Counters and grades render only DB-derived values; degraded states say so instead of faking. No em dashes in UI copy. Chain labels stay per-row honest (BSC vs BSC testnet).
