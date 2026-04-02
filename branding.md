# PACIXP Brand Guide

## Logo

File: `images/transparent_logo.png` (1536×1024 px, RGBA PNG, transparent background)

The logo features a stylised teal wave/arc (evoking the letter C and ocean motion) with a warm orange-to-gold gradient arc above it and two small glowing dots (teal and orange). The wordmark "PACIXP" appears below the icon in a deep navy/dark teal, with a teal highlight bar beneath it. The overall feel is oceanic, digital, and forward-moving.

**Usage notes:**
- Use on dark or navy backgrounds where the glow effect reads best.
- The transparent background allows placement over the hero image or navy `#0B1829` sections.
- Do not place on white or light backgrounds without testing contrast — the dark wordmark may be hard to read.

## Color Palette

| Token | Hex | Use |
|---|---|---|
| `--color-navy` | `#0B1829` | Primary dark background, body copy inverse |
| `--color-teal` | `#2BC0B5` | Primary accent, CTA buttons, h3 headings |
| `--color-blue` | `#0073B1` | Section headings (h2), stat numbers |
| `--color-gold` | `#FFCE60` | Island accent, footer CTA button, logo glow |
| `--color-coral` | `#FF6B6B` | Reserved — defined but not yet used |
| `--color-bg-light` | `#F8F9FA` | Page background |
| `--color-text-main` | `#333333` | Body text |
| `--color-white` | `#FFFFFF` | Card backgrounds, nav on dark |

The logo's warm arc gradient runs approximately `#FF6B35` (orange) → `#FFCE60` (gold), consistent with the coral/gold tokens.

## Typography

| Role | Family | Weight |
|---|---|---|
| Headings, nav, buttons | Montserrat | 600 (semi-bold), 700 (bold) |
| Body copy | Open Sans | 300 (light), 400 (regular) |

Source: Google Fonts (`https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@300;400&display=swap`)

## Spacing & Shape

- **Button radius:** `50px` (full pill shape)
- **Card radius:** `12px`
- **Container:** `width: 90%; max-width: 1200px; margin: auto`

## Motifs

**Swoosh wave** — the bottom of the hero section in `alt_index.html` uses a layered SVG wave transitioning through four colors: gold (`#FFCE60` at 0.8 opacity) → ocean blue (`#0073B1` at 0.9 opacity) → reef teal (`#2BC0B5`) → page background (`#F8F9FA`). This mirrors the wave/arc form in the logo and should be preserved in any redesign.

## Legal Identity

| | |
|---|---|
| Registered Name | PACIFIC ISLANDS INTERNET EXCHANGE INCORPORATED |
| Incorporation Number | 50210954 |
| NZBN | 9429052168000 |
| Date of Incorporation | 17 June 2024 |
| Governing Act | Incorporated Societies Act 2022 (NZ) |
| Status | Registered |

Use "Pacific Islands Internet Exchange Incorporated" in full legal contexts (footer, documents). Use "PACIXP" in all other communications.

## Tone & Voice

- Organisation type: non-profit, Pacific-region focus, technical but accessible
- Register: confident and collaborative, not corporate
- Key phrases to preserve: "digital sovereignty", "local traffic local", "direct peering"

## Assets

| File | Status | Notes |
|---|---|---|
| `images/transparent_logo.png` | Public | Safe to commit and deploy |
| `images/cb_signature.png` | Private | Gitignored — do not commit |
| `images/ts_signature.png` | Private | Gitignored — do not commit |
