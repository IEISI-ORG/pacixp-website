# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the static website for **PACIXP** (Pacific Islands Internet Exchange Incorporated), a New Zealand-registered non-profit promoting internet exchange points (IXPs) across Pacific Island nations. The site is purely static HTML/CSS with no build system, package manager, or JavaScript framework.

## Files

- `index.html` — Primary website using an older green/yellow/blue color scheme (dark ocean blue header, dark green primary)
- `alt_index.html` — Alternate design with a refined brand style guide: navy/teal/gold/coral palette, Montserrat + Open Sans fonts from Google Fonts, pill-shaped buttons, and an SVG "swoosh" wave motif at the bottom of the hero section
- `attribution.md` — Methodology behind the projected economic and performance impact figures (sources: ISOC, APNIC, KIXP/IXPN case studies)
- `branding.md` — Full brand guide: logo description, color palette, typography, motifs, and asset inventory
- `images/transparent_logo.png` — Official logo (1536×1024 RGBA PNG, transparent background). Teal wave/arc icon with orange-gold glow arc, dark navy wordmark. Use on dark/navy backgrounds.
- `images/cb_signature.png`, `images/ts_signature.png` — Private; gitignored, do not commit

## Design System (alt_index.html / current brand direction)

CSS custom properties defined in `:root`:
- `--color-navy: #0B1829` — primary dark background
- `--color-teal: #2BC0B5` — accent/CTA
- `--color-blue: #0073B1` — headings
- `--color-gold: #FFCE60` — island accent, footer CTA
- `--color-coral: #FF6B6B` — defined but not yet used
- Fonts: `Montserrat` (headings/buttons, 600/700) + `Open Sans` (body, 300/400)
- Button radius: `50px` (pill shape); card radius: `12px`

## Content Structure

Both pages share the same section structure: hero → about (challenge/solution) → impact (stats) → benefits (ISPs + content providers) → get-involved/footer. Key facts to preserve when editing:
- Initial deployment targets: **Samoa and Fiji**
- Latency goal: **< 80ms** (down from 180–250ms)
- Traffic localization target: **> 35%**
- Economic savings projection: **$1.2M–$1.8M USD annually**
- Supporters: APNIC, ISOC, Internet Association of Australia, NZIX

## No Build Process

Open any `.html` file directly in a browser to preview. There is no compilation, bundling, linting, or test suite.
