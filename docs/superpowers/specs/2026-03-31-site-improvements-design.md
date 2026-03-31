# Isla ng Salong-Salong — Site Improvements Design

**Date:** 2026-03-31
**Author:** Alfonso (with Claude)
**Status:** Review

---

## Overview

Three-phase improvement plan for the Isla ng Salong-Salong static D&D lore site. Goals: faster load times (especially mobile), visual polish without changing the site's identity, and a new Bestiary page with placeholder content.

**Target audience:** Current and past D&D group members (primary), broader TTRPG community (secondary).
**Access pattern:** Both phone and desktop, roughly equal priority.

---

## Approach

**"Foundation First, Then Build"** — fix performance and technical debt first (Phase 1), then layer on visual polish (Phase 2), then add the Bestiary page (Phase 3). This order ensures each phase builds on a stable, faster foundation.

---

## Phase 1: Performance & Technical Foundations

### 1.1 Map Image Optimization

**Problem:** `images/map.png` is 4.0MB — the single largest asset on the site. On mobile connections, this dominates load time.

**Solution:**
- Convert `map.png` to WebP format (target: ~300-500KB). Use `cwebp -q 80 images/map.png -o images/map.webp` (adjust quality to hit target), or an online converter like Squoosh.
- Use `<picture>` element with WebP source and PNG fallback for older browsers
- Add explicit `width` and `height` attributes to prevent cumulative layout shift
- Add `loading="lazy"` since the map section is below the hero fold

**Files changed:** `index.html`, `images/` (new WebP file)

### 1.2 Font Loading Fix

**Problem:** Google Fonts loaded via `@import` in CSS is render-blocking. Text is invisible until fonts download.

**Solution:**
- Remove the `@import url(...)` line from `css/style.css`
- Add the following `<link>` tags to `<head>` of all HTML pages:
  - `<link rel="preconnect" href="https://fonts.googleapis.com">`
  - `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`
  - `<link href="https://fonts.googleapis.com/css2?family=Inknut+Antiqua:wght@400;600;700&family=Gentium+Plus:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">`
- Note: The current `@import` URL already includes `&display=swap`, so `font-display: swap` is already in effect. The fix here is moving from render-blocking `@import` to non-render-blocking `<link>` tags.

**Files changed:** `css/style.css`, all 11 HTML pages (`<head>` section)

### 1.3 Image Lazy Loading

**Problem:** All images load eagerly on page load, even those far below the viewport.

**Solution:**
- Add `loading="lazy"` to all images below the fold (character portraits, loading icon, marker images)
- Hero canvas and above-fold content remain eager-loaded
- Character portrait placeholders (empty `src=""`) are unaffected — they're already placeholders

**Files changed:** `characters.html`, `pc.html`, `index.html`

### 1.4 SEO & Sharing Meta Tags

**Problem:** No `<meta name="description">`, no Open Graph tags. When shared in Discord or group chats, the site shows no preview.

**Solution:**
- Add `<meta name="description">` to all 11 pages with page-specific descriptions
- Add Open Graph tags (`og:title`, `og:description`, `og:image`) to all pages — use the map image as the default `og:image`
- Add `<meta name="author" content="DM Avips">`
- Keep it minimal — no sitemap, no robots.txt, no structured data (overkill for a personal lore site)

**Files changed:** All 11 HTML pages (`<head>` section)

### 1.5 Emoji Nav Icon Fix

**Problem:** 7 pages (locations, timeline, epic, chronicles, glossary, search, 404) use emoji characters for search/DM buttons in the navbar instead of SVG icons. This is inconsistent with the rest of the site and renders differently across platforms.

**Solution:**
- Replace emoji icons with inline SVG icons matching the style used on other pages (the search magnifying glass and DM lock/unlock icons)

**Files changed:** `locations.html`, `timeline.html`, `epic.html`, `chronicles.html`, `glossary.html`, `search.html`, `404.html`

---

## Phase 2: Visual Polish (Identity-Preserving)

### 2.1 Mobile Experience Polish

**Problem:** Map markers are small on mobile, tooltips can clip off-screen, filter nav buttons may overflow on narrow viewports.

**Solution:**
- Increase map marker touch targets on mobile (min 48x48px, up from 44x44px)
- Reposition marker tooltips to stay within viewport bounds (detect edge proximity)
- Make character/pc filter nav buttons wrap or horizontally scroll on small screens instead of overflowing
- Review and adjust spacing/padding at mobile breakpoints across all pages

**Files changed:** `css/style.css` (media queries). Note: map marker tooltips are likely CSS-only (using `::after` or `title` attributes). Verify during implementation whether tooltip repositioning needs CSS-only or JS-based solution before modifying `js/dm.js`.

### 2.2 Animation Improvements

**Problem:** Scroll-reveal animations pop in abruptly. Nav card hover states are minimal.

**Solution:**
- Smooth scroll-reveal: change from opacity snap to a gentler fade + subtle translateY (8-12px slide up)
- Nav card hover: add subtle scale(1.02) lift with box-shadow increase on hover
- Map marker hover: add a soft pulse or glow effect for better discoverability
- All animations respect existing `prefers-reduced-motion` support

**Files changed:** `css/style.css`

### 2.3 Typography Fine-Tuning

**Problem:** Line-height and letter-spacing may need adjustment for mobile readability after the recent font size bumps (lore text at 1.25rem).

**Solution:**
- Review line-height on lore text (target 1.6-1.7 for readability)
- Ensure heading/body size hierarchy is consistent across all pages
- No font family changes — Inknut Antiqua (display) and Gentium Plus (body) stay
- Adjust only if visual inspection reveals issues

**Files changed:** `css/style.css`

### 2.4 Quality-of-Life Fixes

**Problem:** Several small UX friction points.

**Solution:**
- Verify existing `scroll-behavior: smooth` (already in `style.css` line 39) works correctly on timeline and glossary anchor links
- Improve loading screen: the current code (dm.js lines 152-162) waits for `window.load` then adds a hard 1800ms `setTimeout`. Change to a minimum 800ms display time instead (so it doesn't flash on fast connections but doesn't hold for nearly 2 seconds on fast loads). Preserve the existing `loadingScreen.classList.add('done')` trigger and 750ms `display:none` followup — only change the delay value.
- Verify back-to-top button is consistently visible and accessible on all pages

**Files changed:** `css/style.css`, `js/dm.js`

---

## Phase 3: Bestiary Page

### 3.1 Page Structure

**Template:** Follow the same page structure as `characters.html` — page header with bilingual title, sticky filter nav, card grid, footer, DM modal.

**Title:**
- Tagalog: "Mga Nilalang ng Salong-Salong"
- English subtitle: "The creatures encountered across the islands."

**Files created:** `bestiary.html`

### 3.2 Creature Cards

Reuse the existing NPC card component (`.npc-card` with `.npc-grid`).

**Card fields:**
- **Name** — creature name (Tagalog or fantasy name)
- **Type** — creature category (displayed as a status badge)
- **Threat Level** — descriptive tier (e.g., "Mapanganib · Dangerous")
- **Description** — lore text about the creature
- **Portrait** — placeholder with shimmer animation (same as character cards, empty `src=""`)

**Badge classes** (new, type-oriented — distinct from the existing status-oriented badges like `--alive`, `--kia`, `--deceased`):
- `.status-badge--creature` — amber/brown for beasts
- `.status-badge--spirit` — teal for spirits
- `.status-badge--elemental` — blue for elementals
- `.status-badge--demon` — red for demons

**Files changed:** `css/style.css` (new badge colors), `bestiary.html`

### 3.3 Filter Navigation

Sticky filter nav matching `characters.html` pattern:

```
Lahat · All | Nilalang · Creatures | Espiritu · Spirits | Elementals | Demonyo · Demons
```

Uses the same `filterSection()` JS pattern from `characters.html` and `pc.html`. No new JS file needed — the function is defined inline on each page.

### 3.4 Site Integration

- **Navbar:** Add "Bestiary" under the "World" dropdown (alongside Locations, History, Codex). Placed under "World" because the bestiary describes creatures of the world setting, not individual story characters ("People") or narrative content ("Lore").
  - Label: "Bestiaryo · Bestiary"
  - Update navbar on all 11 existing pages
- **Homepage nav cards:** Add a Bestiary nav card (total: 7 main cards + 2 secondary)
  - Icon glyph: dragon/beast themed
  - Description: "The creatures encountered across the islands."
- **Search index:** Add bestiary entries to `SEARCH_INDEX` in `search.html`. Each entry follows the existing format: `{ title: "Name", url: "bestiary.html", category: "Bestiaryo", keywords: ["keyword1", "keyword2"] }`

**Files changed:** All 11 existing HTML pages (navbar), `index.html` (nav card), `search.html` (search index)

### 3.5 Placeholder Content

6-8 lorem ipsum creature entries:
- 2-3 Nilalang (Creatures/Beasts)
- 1-2 Espiritu (Spirits)
- 1-2 Elementals
- 1 Demonyo (Demon)

Each entry has: a fantasy-sounding Filipino name, a type badge, a threat level, and 2-3 sentences of lorem ipsum description. All portrait slots are empty placeholders.

---

## Files Impact Summary

| File | Phase | Changes |
|------|-------|---------|
| `index.html` | 1, 2, 3 | Map `<picture>`, meta tags, font preload, nav card, navbar |
| `css/style.css` | 1, 2, 3 | Font-display, animations, mobile polish, bestiary badges |
| `js/dm.js` | 2 | Loading screen timing, tooltip positioning |
| `characters.html` | 1, 3 | Meta tags, lazy loading, font preload, navbar |
| `pc.html` | 1, 3 | Meta tags, lazy loading, font preload, navbar |
| `locations.html` | 1, 3 | Meta tags, emoji fix, font preload, navbar |
| `timeline.html` | 1, 3 | Meta tags, emoji fix, font preload, navbar |
| `codex.html` | 1, 3 | Meta tags, font preload, navbar |
| `epic.html` | 1, 3 | Meta tags, emoji fix, font preload, navbar |
| `chronicles.html` | 1, 3 | Meta tags, emoji fix, font preload, navbar |
| `glossary.html` | 1, 3 | Meta tags, emoji fix, font preload, navbar |
| `search.html` | 1, 3 | Meta tags, emoji fix, font preload, navbar, search index |
| `404.html` | 1, 3 | Meta tags, emoji fix, font preload, navbar |
| `bestiary.html` | 3 | New file |
| `images/map.webp` | 1 | New file (compressed map) |

---

## Out of Scope

- No font family changes
- No color palette changes
- No layout restructuring of existing pages
- No build system or framework introduction
- No server-side functionality
- No sitemap.xml or robots.txt (unnecessary for personal lore site)
- No structured data / JSON-LD schema markup

---

## Success Criteria

1. **Performance:** Map image under 500KB. No render-blocking font loads. Lighthouse performance score improvement on mobile.
2. **Mobile:** Map markers easily tappable on phone. Filter nav doesn't overflow. Tooltips stay in viewport.
3. **Sharing:** Site shows proper preview card when shared in Discord/group chat.
4. **Bestiary:** New page loads, filters work, card layout matches existing NPC cards, accessible from navbar on all pages.
5. **Identity:** Site looks and feels the same — improvements are felt, not seen.
