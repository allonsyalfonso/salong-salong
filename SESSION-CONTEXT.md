# Isla ng Salong-Salong — Session Context
**Project:** Static D&D lore site — `C:\Users\USER\Documents\GitHub\salong-salong\`
**Live URL:** https://allonsyalfonso.github.io/salong-salong/
**Stack:** Plain HTML / CSS / JS — no build system, no framework
**Last updated:** 2026-03-30

---

## What This Site Is

A static GitHub Pages site for a Filipino pre-colonial D&D campaign world called **Isla ng Salong-Salong**, run by **DM Avips**. Two campaigns:
- **Isla ng Salong-Salong** — main campaign, 1+ year, now completed
- **Isla ng Salong-Salong: Mga Nawawalang Salaysay** — active mini-campaign

---

## File Structure

```
salong-salong/
├── index.html          ← Homepage: hero, map, about, nav cards
├── characters.html     ← NPC cards (Alive / Missing / Fallen)
├── pc.html             ← Player character cards (Survived / Transformed / Fallen)
├── locations.html      ← Location detail pages
├── timeline.html       ← Era-based history timeline
├── codex.html          ← Tabbed lore reference
├── chronicles.html     ← Letters/final words
├── epic.html           ← Full campaign story
├── glossary.html       ← Term definitions
├── search.html         ← Site search
├── css/style.css       ← Single stylesheet for entire site
└── js/dm.js            ← Scroll-reveal, parallax, ember canvas, DM modal logic
```

---

## Key CSS Variables (in style.css)

```css
--bg-dark:      #c98010   /* amber — main page bg / section backgrounds */
--bg-surface:   #1c0800   /* dark chocolate — dark sections */
--gold:         #c8920e
--gold-light:   #e8a820
--gold-bright:  #f5c840
--text-dark:    #1a0600   /* near-black — default body text */
--text-light:   #f2d898   /* cream — text on dark sections */
--text-muted:   #7a3a08
--font-display: /* display/heading font */
--font-body:    /* body font */
--radius:       /* border-radius token */
```

> ⚠️ **Critical gotcha:** Default `body { color: var(--text-dark) }` = near-black.
> Any dark section without an explicit `color` override will have invisible text.
> Always add `color: var(--text-light)` as base on dark section wrappers.

---

## Map Markers — Current Positions (index.html)

All markers are `position: absolute` inside `.map-frame`. The image is `width: 100%`.

| Location | Type | CSS Class | left | top |
|---|---|---|---|---|
| Sitio Tambis | Sitio | `map-marker--sitio` | 15.9% | 12.2% |
| Sitio Pasang | Sitio | `map-marker--sitio` | 39.6% | 24.4% |
| Punong Balete | Sacred | `map-marker--sacred` | 15.4% | 22.2% |
| Sitio Anilau | Sitio | `map-marker--sitio` | 15.1% | 34% |
| Sitio Amalciga | Sitio | `map-marker--sitio` | 50% | 56% |
| Sitio Pagangpang | Sitio | `map-marker--sitio` | 83.7% | 67% |
| Abong Bukid | Ashland | `map-marker--ashland` | 26.5% | 32% |
| Bulkang Betis | Volcano | `map-marker--volcano` | 35% | 42% |
| Bulkang Kamuning | Volcano | `map-marker--volcano` | 68.5% | 56% |
| Itinadhanang Ilog | Water | `map-marker--water` | 24% | 41% |
| Hinulugang Abuno | Water | `map-marker--water` | 31% | 40% |
| Lawang Kamagong | Water | `map-marker--water` | 66% | 65% |

### Map Legend Labels (in index.html)
```html
Purok · Sagrado · Bulkan · Tubig · Ashland
```
Tooltip for Itinadhanang Ilog: `"Itinadhanang Ilog · Tubig"` (NOT River)

### Map Marker Color Classes
```css
.map-marker--sitio    { color: #d4a017 }   /* amber */
.map-marker--sacred   { color: #52b788 }   /* teal */
.map-marker--volcano  { color: #e63946 }   /* red */
.map-marker--water    { color: #74b3ce }   /* blue */
.map-marker--ashland  { color: #a09580 }   /* grey-tan */
```

---

## Pending Tasks

### 1. Map Marker Toggle Button
Add an on/off toggle button overlaid on the map so players can hide all markers.

**HTML** — insert inside `.map-frame`, after the last marker `</a>` and before `<p class="map-caption">`:
```html
<button
  class="map-toggle-markers"
  id="map-toggle-markers"
  aria-label="Toggle map markers"
  aria-pressed="true"
  onclick="
    const frame = this.closest('.map-frame');
    const hidden = frame.classList.toggle('markers-hidden');
    this.setAttribute('aria-pressed', String(!hidden));
    this.querySelector('.map-toggle-markers__label').textContent = hidden ? 'Ipakita' : 'Itago';
  "
>
  <svg class="map-toggle-markers__icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3"/><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/>
  </svg>
  <span class="map-toggle-markers__label">Itago</span>
</button>
```

**CSS** — add to `style.css`:
```css
/* Map marker toggle button */
.map-toggle-markers {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  z-index: 20;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.65rem 0.3rem 0.5rem;
  background: rgba(10,7,4,0.72);
  border: 1px solid rgba(196,154,26,0.28);
  border-radius: 3px;
  font-family: var(--font-display);
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(232,168,32,0.85);
  cursor: pointer;
  backdrop-filter: blur(6px);
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
}
.map-toggle-markers:hover {
  background: rgba(196,154,26,0.14);
  border-color: rgba(196,154,26,0.5);
  color: var(--gold-light);
}
.map-toggle-markers:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 2px;
}
/* Hidden state */
.map-frame.markers-hidden .map-marker {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}
.map-frame:not(.markers-hidden) .map-marker {
  transition: opacity 0.25s ease;
}
```

---

## characters.html — Structure

**Grid class:** `npc-grid npc-grid--with-badge`

**Sticky filter nav:**
```html
<nav class="char-section-nav" aria-label="Jump to section" id="char-nav">
  <button class="char-section-nav__btn active" onclick="filterSection('all', this)">Lahat · All</button>
  <button class="char-section-nav__btn" onclick="filterSection('alive', this)">Buhay · Alive</button>
  <button class="char-section-nav__btn" onclick="filterSection('missing', this)">Nawawala · Missing</button>
  <button class="char-section-nav__btn" onclick="filterSection('fallen', this)">Namatay · Fallen</button>
</nav>
```

**Card sections + data-section values:**
- `data-section="alive"` → Babaylan Liham, Ang Balatiti, Ibod
- `data-section="missing"` → Maginoo Hain, Datu Cardo, Gabunan
- `data-section="fallen"` → Datu Laya, Maginoo Adlawan, Babaylan Dalisay, Pian

**Status badge classes:**
```css
.status-badge--alive      /* green */
.status-badge--missing    /* amber */
.status-badge--kia        /* muted red */
```

---

## pc.html — Structure

**Grid class:** `npc-grid npc-grid--pc npc-grid--with-badge`

**Sticky filter nav:**
```html
<nav class="char-section-nav" aria-label="Jump to section" id="char-nav">
  <button class="char-section-nav__btn active" onclick="filterSection('all', this)">Lahat · All</button>
  <button class="char-section-nav__btn" onclick="filterSection('alive', this)">Buhay · Survived</button>
  <button class="char-section-nav__btn" onclick="filterSection('missing', this)">Iba Pa · Other</button>
  <button class="char-section-nav__btn" onclick="filterSection('fallen', this)">Namatay · Fallen</button>
</nav>
```

**Card sections:**
- `data-section="alive"` → Santel, Ynio, Dapithapon, Mang Tomas
- `data-section="missing"` → Maria Clara *(Transformed)*
- `data-section="fallen"` → Tsinta, Rea Labrador, Balanoy, Ahbo, Sikatuna, Ponce

**Status badge classes:**
```css
.status-badge--alive        /* "Survived" */
.status-badge--deceased     /* "Deceased" */
.status-badge--transformed  /* "Gabunan" — purple: bg #1a0a3d, color #b08cff */
```

**CSS specificity fix for card header height:**
```css
.npc-grid--with-badge .npc-card__header         { min-height: 9rem; }
.npc-grid--pc .npc-card__header                 { min-height: 6rem; }
.npc-grid--pc.npc-grid--with-badge .npc-card__header { min-height: 9.5rem; } /* wins */
```

---

## Visual Improvements Applied (this session series)

1. Avatar shimmer animation (`@keyframes avatarShimmer`)
2. Page entry fade-in (`@keyframes pageEnter` on `main`)
3. Drop-cap on `.npc-card__description::first-letter` (gold, 1.65em, float left)
4. Gold left-border accent on `.npc-card:hover`
5. Sticky filter nav on characters.html and pc.html
6. Timeline era chip (`#timeline-era-chip` — fixed bottom pill, scroll-spy)
7. Keyboard navigation on codex.html tabs (Arrow/Home/End keys)
8. `.npc-location-tag` styled tags on character cards
9. About section on index.html homepage
10. Section label contrast fix (`.npc-section-label` — was gold-on-amber = invisible)

---

## About Section (index.html) — Key CSS Notes

The about section has class `about-world dark-section`.

**Critical rule — must stay:**
```css
.about-world { color: var(--text-light); }
```
Without this, all text inherits `body { color: var(--text-dark) }` = `#1a0600`
on dark bg `#1c0800` = invisible.

**Title structure** (does NOT use h2-wrap pattern):
```html
<h2 class="about-world__title">Ang Mundo ng Sina Una</h2>
<p class="about-world__subtitle-en">The World of Sina Una</p>
```
The h2 has `display: block` and `::before/::after { display: none }` to suppress
the decorative side-lines from `.section-container h2`.

---

## Filter JS Pattern (characters.html & pc.html)

```js
function filterSection(section, btn) {
  // Update active button
  document.querySelectorAll('.char-section-nav__btn')
    .forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Show/hide cards and section labels
  document.querySelectorAll('[data-section]').forEach(el => {
    if (section === 'all' || el.dataset.section === section) {
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  });
}
```

---

## dm.js — What It Does (do not modify unless intentional)

- IntersectionObserver scroll-reveal (watches elements for fade-in)
- Back-to-top button
- Parallax on hero
- Ember/particle canvas on hero
- DM Mode modal + `localStorage` persistence for DM password state

---

## Common Pitfalls

| Pitfall | Fix |
|---|---|
| Text invisible on dark section | Add `color: var(--text-light)` to the section wrapper |
| `em` text invisible on dark bg | `em { color: var(--text-muted) }` global rule = dark brown. Override per section |
| CSS specificity on npc-grid | Combined selector `.npc-grid--pc.npc-grid--with-badge` wins over both single-class rules |
| Map markers placed wrong | Positions are `%` of image width/height. Adjust in small increments (1–3%) |
| h2 gets decorative side-lines | Comes from `.section-container h2::before/::after`. Suppress with `display:none` on the pseudo-elements |
| Section label yellow-on-yellow | `.npc-section-label` bg is amber. Text must be `var(--text-dark)` not gold |
