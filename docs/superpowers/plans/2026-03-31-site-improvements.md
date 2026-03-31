# Site Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve site performance, add visual polish, and create a Bestiary page — all without changing the site's visual identity.

**Architecture:** Static HTML/CSS/JS site with no build system. Single stylesheet at `css/style.css`, single script at `js/dm.js`. All pages share the same navbar, footer, and DM modal. Changes are made directly to HTML files and deployed via GitHub Pages.

**Tech Stack:** Plain HTML5, CSS3, vanilla JavaScript. Google Fonts (Inknut Antiqua + Gentium Plus). Hosted on GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-03-31-site-improvements-design.md`

---

## Phase 1: Performance & Technical Foundations

### Task 1: Map Image Optimization

**Files:**
- Modify: `index.html:96-99` (map `<img>` to `<picture>`)
- Create: `images/map.webp`

- [ ] **Step 1: Convert map.png to WebP**

Run: `cwebp -q 80 images/map.png -o images/map.webp`

If `cwebp` is not installed, use: `npm install -g cwebp-bin` or download from https://developers.google.com/speed/webp/download

Verify output is under 500KB:
```bash
ls -lh images/map.webp
```
If over 500KB, lower quality: `cwebp -q 70 images/map.png -o images/map.webp`

- [ ] **Step 2: Replace `<img>` with `<picture>` in index.html**

In `index.html`, find the map image (around line 96-99):
```html
<img
  src="images/map.png"
  alt="Ang Mapa ng Isla ng Salong-Salong"
  style="width:100%; display:block; filter: brightness(0.84) contrast(1.06) saturate(0.88);"
>
```

Replace with:
```html
<picture>
  <source srcset="images/map.webp" type="image/webp">
  <img
    src="images/map.png"
    alt="Ang Mapa ng Isla ng Salong-Salong"
    width="2048" height="2048"
    loading="lazy"
    style="width:100%; display:block; filter: brightness(0.84) contrast(1.06) saturate(0.88);"
  >
</picture>
```

Note: Check actual map dimensions with `identify images/map.png` or open in image viewer. Replace `2048` with actual pixel dimensions.

- [ ] **Step 3: Verify in browser**

Open `index.html` locally. Check:
- Map displays correctly
- Marker positions are unchanged
- Toggle button still works

- [ ] **Step 4: Commit**

```bash
git add images/map.webp index.html
git commit -m "perf: convert map to WebP with PNG fallback"
```

---

### Task 2: Font Loading Fix

**Files:**
- Modify: `css/style.css:7` (remove `@import`)
- Modify: All 11 HTML files (`<head>` section) — `index.html`, `characters.html`, `pc.html`, `locations.html`, `timeline.html`, `codex.html`, `epic.html`, `chronicles.html`, `glossary.html`, `search.html`, `404.html`
  - Note: `bestiary.html` (Task 10) already includes the correct font `<link>` tags in its template. No revisit needed.

- [ ] **Step 1: Remove @import from style.css**

In `css/style.css` line 7, remove:
```css
@import url('https://fonts.googleapis.com/css2?family=Inknut+Antiqua:wght@400;600;700;800&family=Gentium+Plus:ital,wght@0,400;0,700;1,400&display=swap');
```

- [ ] **Step 2: Add font `<link>` tags to all HTML pages**

In every HTML file's `<head>`, immediately after the `<meta name="viewport">` line and before the `<title>` tag, add:

```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inknut+Antiqua:wght@400;600;700;800&family=Gentium+Plus:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
```

Apply to all 11 existing HTML files:
1. `index.html`
2. `characters.html`
3. `pc.html`
4. `locations.html`
5. `timeline.html`
6. `codex.html`
7. `epic.html`
8. `chronicles.html`
9. `glossary.html`
10. `search.html`
11. `404.html`

- [ ] **Step 3: Verify fonts load correctly**

Open `index.html` in browser. Check:
- Inknut Antiqua renders on headings
- Gentium Plus renders on body text
- No flash of invisible text (FOIT) — text should appear in fallback font immediately, then swap

- [ ] **Step 4: Commit**

```bash
git add css/style.css index.html characters.html pc.html locations.html timeline.html codex.html epic.html chronicles.html glossary.html search.html 404.html
git commit -m "perf: move Google Fonts from @import to link preload"
```

---

### Task 3: Image Lazy Loading

**Files:**
- Modify: `characters.html` (portrait images)
- Modify: `pc.html` (portrait images)

- [ ] **Step 1: Add loading="lazy" to character portrait images**

In `characters.html`, find all `<img>` tags inside `.npc-card` elements. They look like:
```html
<img src="" alt="Portrait of ..." class="npc-card__portrait">
```

Add `loading="lazy"` to each:
```html
<img src="" alt="Portrait of ..." class="npc-card__portrait" loading="lazy">
```

Note: Images with empty `src=""` won't make network requests anyway, but adding `loading="lazy"` prepares for when real portrait images are added.

- [ ] **Step 2: Add loading="lazy" to PC portrait images**

Same change in `pc.html` — add `loading="lazy"` to all portrait `<img>` tags.

- [ ] **Step 3: Note on index.html images**

The map image in `index.html` already gets `loading="lazy"` via Task 1 (map optimization). The loading icon (`images/loading-icon.png` at line 15) is above-fold content shown during page load — it should NOT be lazy-loaded. No changes needed for `index.html` in this task.

- [ ] **Step 4: Commit**

```bash
git add characters.html pc.html
git commit -m "perf: add lazy loading to character portrait images"
```

---

### Task 4: SEO & Sharing Meta Tags

**Files:**
- Modify: All 11 HTML files (`<head>` section)

- [ ] **Step 1: Add meta tags to index.html**

In `index.html` `<head>`, after the `<title>` tag, add:

```html
  <meta name="description" content="A Filipino pre-colonial D&D campaign world. Explore the islands, meet the characters, and discover the lore of Salong-Salong.">
  <meta name="author" content="DM Avips">
  <meta property="og:title" content="Isla ng Salong-Salong: A Sina Una D&D Campaign World">
  <meta property="og:description" content="A Filipino pre-colonial D&D campaign world. Explore the islands, meet the characters, and discover the lore of Salong-Salong.">
  <meta property="og:image" content="https://allonsyalfonso.github.io/salong-salong/images/map.png">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://allonsyalfonso.github.io/salong-salong/">
```

- [ ] **Step 2: Add meta tags to remaining 10 pages**

Add the same pattern to each page, with page-specific `description` and `og:title`. Use these descriptions:

| Page | Description |
|------|-------------|
| `characters.html` | "The NPCs of Salong-Salong — allies, enemies, and the missing. Meet the figures who shaped the journey." |
| `pc.html` | "The player characters of Sina Una. Their stories are finished, but their footprints remain on the land." |
| `locations.html` | "Explore every corner of Salong-Salong, from its sitios and sacred groves to its volcanic highlands." |
| `timeline.html` | "The chronological tale of Sina Una, from the first session to the final battle." |
| `codex.html` | "The world codex of Salong-Salong — races, classes, factions, and lore reference." |
| `epic.html` | "The full story of Sina Una from beginning to end, told as it unfolded at the table." |
| `chronicles.html` | "Letters and final words of the heroes of Salong-Salong, written in their own voices." |
| `glossary.html` | "Terms and concepts of the world of Salong-Salong — a guide to the language and lore." |
| `search.html` | "Search the lore of Salong-Salong — find names, places, events, and more." |
| `404.html` | "Page not found — return to the world of Salong-Salong." |

Each page gets:
```html
  <meta name="description" content="[page-specific description]">
  <meta name="author" content="DM Avips">
  <meta property="og:title" content="[page title]">
  <meta property="og:description" content="[page-specific description]">
  <meta property="og:image" content="https://allonsyalfonso.github.io/salong-salong/images/map.png">
  <meta property="og:type" content="website">
```

- [ ] **Step 3: Commit**

```bash
git add index.html characters.html pc.html locations.html timeline.html codex.html epic.html chronicles.html glossary.html search.html 404.html
git commit -m "seo: add meta descriptions and Open Graph tags to all pages"
```

---

### Task 5: Emoji Nav Icon Fix

**Files:**
- Modify: `locations.html:48-49`, `timeline.html`, `epic.html`, `chronicles.html`, `glossary.html`, `search.html`, `404.html` (navbar search + DM button)

- [ ] **Step 1: Identify the emoji pattern**

The 7 affected pages have this in their navbar:
```html
<li><a href="search.html" class="navbar__icon-link" title="Maghanap">🔍</a></li>
<li><button id="dm-toggle" class="dm-btn" title="DM Mode">🔒</button></li>
```

The correct SVG pattern (from `index.html` and `characters.html`):
```html
<li>
  <a href="search.html" class="navbar__icon-link" title="Search" aria-label="Search">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.5" y1="15.5" x2="21" y2="21"/></svg>
  </a>
</li>
<li>
  <button id="dm-toggle" class="dm-btn" title="DM Mode" aria-label="DM Mode">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none"/></svg>
  </button>
</li>
```

- [ ] **Step 2: Replace emoji with SVG in all 7 pages**

In each of the 7 files (`locations.html`, `timeline.html`, `epic.html`, `chronicles.html`, `glossary.html`, `search.html`, `404.html`), find the emoji search/DM lines and replace with the full SVG versions shown above.

- [ ] **Step 3: Verify**

Open each page and confirm:
- Search icon renders as SVG magnifying glass (not 🔍)
- DM button renders as SVG lock (not 🔒)
- Both are clickable and functional

- [ ] **Step 4: Commit**

```bash
git add locations.html timeline.html epic.html chronicles.html glossary.html search.html 404.html
git commit -m "fix: replace emoji nav icons with SVG on all pages"
```

---

## Phase 2: Visual Polish

### Task 6: Animation Improvements

**Files:**
- Modify: `css/style.css` (scroll-reveal transition, nav-card hover, map marker hover)

- [ ] **Step 1: Verify existing scroll-reveal animation**

The scroll-reveal already exists at `css/style.css:2663-2673` using `.reveal` / `.reveal.revealed` classes with `translateY(20px)` and a 0.4s cubic-bezier transition. This is already a smooth fade + slide-up effect. No changes needed here — the existing animation is good.

If you want a subtler slide distance, change `translateY(20px)` to `translateY(12px)` at line 2665. Otherwise, skip this step.

- [ ] **Step 2: Enhance existing nav-card hover effect**

The nav-card already has a polished hover at `css/style.css:731-741` with `transform: translateY(-4px)`, glow border, and shadow increase. To add a subtle scale, merge it into the existing transform. In `style.css` line 739, change:

```css
  transform: translateY(-4px);
```
to:
```css
  transform: translateY(-4px) scale(1.02);
```

Do NOT create a new `.nav-card:hover` rule — modify the existing one.

- [ ] **Step 3: Add map marker hover glow**

Add to `style.css`:
```css
.map-marker__pin {
  transition: filter 0.2s ease;
}
.map-marker:hover .map-marker__pin,
.map-marker.tapped .map-marker__pin {
  filter: drop-shadow(0 0 4px currentColor);
}
```

- [ ] **Step 4: Ensure prefers-reduced-motion is respected**

Add to the existing `@media (prefers-reduced-motion: reduce)` block:
```css
@media (prefers-reduced-motion: reduce) {
  .nav-card { transition: none; }
  .nav-card:hover { transform: none; }
  .map-marker__pin { transition: none; }
}
```

- [ ] **Step 5: Verify and commit**

Open site, test:
- Cards fade+slide up on scroll
- Nav cards lift on hover
- Map markers glow on hover
- Disable animations in OS settings and verify they're suppressed

```bash
git add css/style.css
git commit -m "style: improve scroll-reveal, hover, and marker animations"
```

---

### Task 7: Mobile Experience Polish

**Files:**
- Modify: `css/style.css` (media queries)

- [ ] **Step 1: Increase map marker touch targets on mobile**

Add to the mobile media query section (around `@media (max-width: 768px)`):
```css
@media (max-width: 768px) {
  .map-marker {
    min-width: 48px;
    min-height: 48px;
  }
}
```

Check existing `.map-marker` sizing rules first — merge if needed.

- [ ] **Step 2: Fix filter nav overflow on small screens**

Add horizontal scroll for the character filter nav on mobile:
```css
@media (max-width: 640px) {
  .char-section-nav {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    flex-wrap: nowrap;
    gap: 0.5rem;
    padding-bottom: 0.5rem;
  }
  .char-section-nav__btn {
    white-space: nowrap;
    flex-shrink: 0;
  }
}
```

- [ ] **Step 3: Verify on mobile viewport**

Use browser dev tools to test at 375px, 414px, and 768px widths:
- Map markers are easily tappable
- Filter nav scrolls horizontally without breaking layout
- No content overflows

- [ ] **Step 4: Commit**

```bash
git add css/style.css
git commit -m "style: improve mobile touch targets and filter nav scroll"
```

---

### Task 8: Loading Screen Timing Fix

**Files:**
- Modify: `js/dm.js:155-161`

- [ ] **Step 1: Change loading screen delay from 1800ms to 800ms**

In `js/dm.js`, find lines 155-161:
```js
    window.addEventListener('load', function () {
      setTimeout(function () {
        loadingScreen.classList.add('done');
        setTimeout(function () {
          loadingScreen.style.display = 'none';
        }, 750);
      }, 1800);
    });
```

Change `1800` to `800`:
```js
    window.addEventListener('load', function () {
      setTimeout(function () {
        loadingScreen.classList.add('done');
        setTimeout(function () {
          loadingScreen.style.display = 'none';
        }, 750);
      }, 800);
    });
```

- [ ] **Step 2: Verify**

Reload the site. Loading screen should disappear noticeably faster but not flash.

- [ ] **Step 3: Commit**

```bash
git add js/dm.js
git commit -m "ux: reduce loading screen hold time from 1800ms to 800ms"
```

---

### Task 9: Typography Review

**Files:**
- Modify: `css/style.css` (if adjustments needed)

- [ ] **Step 1: Inspect lore text line-height**

Open `index.html` in browser, inspect the about section lore text. Check computed `line-height`. Target: 1.6-1.7 for body text at 1.25rem.

If current line-height is below 1.6, update the relevant rule in `style.css`:
```css
.about-world__lore {
  line-height: 1.65;
}
```

- [ ] **Step 2: Spot-check heading hierarchy across pages**

Open each page and verify the heading sizes create a clear visual hierarchy. Look for:
- h1 > h2 > h3 sizing is consistent
- No headings look the same size as body text
- Mobile sizes maintain hierarchy

Only make changes if issues are found.

- [ ] **Step 3: Commit (if changes made)**

```bash
git add css/style.css
git commit -m "style: fine-tune typography line-height for readability"
```

---

## Phase 3: Bestiary Page

### Task 10: Create Bestiary Page Structure

**Files:**
- Create: `bestiary.html`

- [ ] **Step 1: Create bestiary.html**

Create `bestiary.html` using the same structure as `characters.html`. Include:
- Full `<head>` with font preload links, meta tags, favicon (matching other pages)
- Navbar with Bestiary link active under World dropdown (see Task 11 for navbar update)
- Page header with bilingual title
- Sticky filter nav
- Card grid with placeholder creatures
- Footer
- DM modal
- Inline `filterSection()` JS and `dm.js` script tag

```html
<!DOCTYPE html>
<html lang="fil">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inknut+Antiqua:wght@400;600;700;800&family=Gentium+Plus:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
  <title>Bestiaryo | Sina Una: Isla ng Salong-Salong</title>
  <meta name="description" content="The creatures of Salong-Salong — beasts, spirits, elementals, and demons encountered across the islands.">
  <meta name="author" content="DM Avips">
  <meta property="og:title" content="Bestiaryo | Isla ng Salong-Salong">
  <meta property="og:description" content="The creatures of Salong-Salong — beasts, spirits, elementals, and demons encountered across the islands.">
  <meta property="og:image" content="https://allonsyalfonso.github.io/salong-salong/images/map.png">
  <meta property="og:type" content="website">
  <link rel="stylesheet" href="css/style.css">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='12' fill='%230a0704'/%3E%3Crect x='45' y='50' width='10' height='36' rx='3' fill='%23c49a1a'/%3E%3Cline x1='43' y1='62' x2='30' y2='88' stroke='%23c49a1a' stroke-width='3' stroke-linecap='round'/%3E%3Cline x1='57' y1='62' x2='70' y2='88' stroke='%23c49a1a' stroke-width='3' stroke-linecap='round'/%3E%3Ccircle cx='50' cy='34' r='26' fill='%231f3a08'/%3E%3Ccircle cx='36' cy='44' r='14' fill='%231f3a08'/%3E%3Ccircle cx='64' cy='44' r='14' fill='%231f3a08'/%3E%3Ccircle cx='50' cy='34' r='25' fill='none' stroke='%23c49a1a' stroke-width='1.5' opacity='0.45'/%3E%3C/svg%3E">
</head>
<body>

  <!-- ── NAVBAR ── -->
  <nav class="navbar" role="navigation" aria-label="Main navigation">
    <a href="index.html" class="navbar__logo">SINA UNA</a>
    <button class="nav-toggle" aria-label="Menu" onclick="this.closest('nav').querySelector('.navbar__links').classList.toggle('open')">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </button>
    <ul class="navbar__links">
      <li><a href="index.html" class="navbar__home-link">Home <span class="tagalog">Tahanan</span></a></li>
      <li class="nav-dropdown">
        <button class="nav-dropdown__trigger active" aria-haspopup="true">World <span class="nav-dropdown__caret">&#9662;</span><span class="tagalog">Mundo</span></button>
        <ul class="nav-dropdown__menu">
          <li><a href="locations.html">Locations <span class="tagalog">Mga Lugar</span></a></li>
          <li><a href="timeline.html">History <span class="tagalog">Kasaysayan</span></a></li>
          <li><a href="codex.html">Codex <span class="tagalog">Aklatan</span></a></li>
          <li><a href="bestiary.html" class="active">Bestiary <span class="tagalog">Bestiaryo</span></a></li>
        </ul>
      </li>
      <li class="nav-dropdown">
        <button class="nav-dropdown__trigger" aria-haspopup="true">People <span class="nav-dropdown__caret">&#9662;</span><span class="tagalog">Mga Tao</span></button>
        <ul class="nav-dropdown__menu">
          <li><a href="characters.html">Characters <span class="tagalog">Mga NPC</span></a></li>
          <li><a href="pc.html">Heroes <span class="tagalog">Mga Magani</span></a></li>
        </ul>
      </li>
      <li class="nav-dropdown">
        <button class="nav-dropdown__trigger" aria-haspopup="true">Lore <span class="nav-dropdown__caret">&#9662;</span><span class="tagalog">Kaalaman</span></button>
        <ul class="nav-dropdown__menu">
          <li><a href="epic.html">The Epic <span class="tagalog">Ang Epiko</span></a></li>
          <li><a href="chronicles.html">Chronicles <span class="tagalog">Mga Kronika</span></a></li>
          <li><a href="glossary.html">Glossary <span class="tagalog">Talasalitaan</span></a></li>
        </ul>
      </li>
      <li>
        <a href="search.html" class="navbar__icon-link" title="Search" aria-label="Search">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.5" y1="15.5" x2="21" y2="21"/></svg>
        </a>
      </li>
      <li>
        <button id="dm-toggle" class="dm-btn" title="DM Mode" aria-label="DM Mode">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none"/></svg>
        </button>
      </li>
    </ul>
  </nav>

  <main>

    <!-- ── PAGE HEADER ── -->
    <header class="page-header">
      <div class="page-header__inner">
        <h1>MGA NILALANG NG SALONG-SALONG</h1>
        <div class="page-header__divider">◆ ✦ ◆</div>
        <p class="page-header__subtitle">The creatures encountered across the islands.</p>
      </div>
    </header>

    <!-- ── FILTER NAV ── -->
    <nav class="char-section-nav" aria-label="Jump to section" id="char-nav">
      <button class="char-section-nav__btn active" onclick="filterSection('all', this)">Lahat · All</button>
      <button class="char-section-nav__btn" onclick="filterSection('creature', this)">Nilalang · Creatures</button>
      <button class="char-section-nav__btn" onclick="filterSection('spirit', this)">Espiritu · Spirits</button>
      <button class="char-section-nav__btn" onclick="filterSection('elemental', this)">Elementals</button>
      <button class="char-section-nav__btn" onclick="filterSection('demon', this)">Demonyo · Demons</button>
    </nav>

    <!-- ── CREATURE GRID ── -->
    <section aria-label="Listahan ng mga Nilalang">
      <div class="section-container">

        <!-- Section: Creatures -->
        <h3 class="npc-section-label" data-section="creature">Nilalang · Creatures</h3>
        <div class="npc-grid npc-grid--with-badge" data-section="creature">

          <div class="npc-card">
            <div class="npc-card__header">
              <div class="npc-card__avatar-frame">
                <img src="" alt="Portrait of Bakunawa" class="npc-card__portrait" loading="lazy">
              </div>
              <h4 class="npc-card__name">Bakunawa</h4>
              <p class="npc-card__title">Serpent of the Deep</p>
              <span class="status-badge status-badge--creature">Nilalang</span>
            </div>
            <div class="npc-card__body">
              <p class="npc-card__threat"><strong>Mapanganib · Dangerous</strong></p>
              <p class="npc-card__description">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </div>
          </div>

          <div class="npc-card">
            <div class="npc-card__header">
              <div class="npc-card__avatar-frame">
                <img src="" alt="Portrait of Tikbalang" class="npc-card__portrait" loading="lazy">
              </div>
              <h4 class="npc-card__name">Tikbalang</h4>
              <p class="npc-card__title">Stalker of the Trails</p>
              <span class="status-badge status-badge--creature">Nilalang</span>
            </div>
            <div class="npc-card__body">
              <p class="npc-card__threat"><strong>Mapanganib · Dangerous</strong></p>
              <p class="npc-card__description">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            </div>
          </div>

          <div class="npc-card">
            <div class="npc-card__header">
              <div class="npc-card__avatar-frame">
                <img src="" alt="Portrait of Sarangay" class="npc-card__portrait" loading="lazy">
              </div>
              <h4 class="npc-card__name">Sarangay</h4>
              <p class="npc-card__title">Bull Guardian of the Mountains</p>
              <span class="status-badge status-badge--creature">Nilalang</span>
            </div>
            <div class="npc-card__body">
              <p class="npc-card__threat"><strong>Napakatindi · Severe</strong></p>
              <p class="npc-card__description">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
            </div>
          </div>

        </div>

        <!-- Section: Spirits -->
        <h3 class="npc-section-label" data-section="spirit">Espiritu · Spirits</h3>
        <div class="npc-grid npc-grid--with-badge" data-section="spirit">

          <div class="npc-card">
            <div class="npc-card__header">
              <div class="npc-card__avatar-frame">
                <img src="" alt="Portrait of Diwata ng Ilog" class="npc-card__portrait" loading="lazy">
              </div>
              <h4 class="npc-card__name">Diwata ng Ilog</h4>
              <p class="npc-card__title">River Guardian Spirit</p>
              <span class="status-badge status-badge--spirit">Espiritu</span>
            </div>
            <div class="npc-card__body">
              <p class="npc-card__threat"><strong>Hindi Tiyak · Uncertain</strong></p>
              <p class="npc-card__description">Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            </div>
          </div>

          <div class="npc-card">
            <div class="npc-card__header">
              <div class="npc-card__avatar-frame">
                <img src="" alt="Portrait of Santelmo" class="npc-card__portrait" loading="lazy">
              </div>
              <h4 class="npc-card__name">Santelmo</h4>
              <p class="npc-card__title">Wandering Flame</p>
              <span class="status-badge status-badge--spirit">Espiritu</span>
            </div>
            <div class="npc-card__body">
              <p class="npc-card__threat"><strong>Katamtaman · Moderate</strong></p>
              <p class="npc-card__description">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
            </div>
          </div>

        </div>

        <!-- Section: Elementals -->
        <h3 class="npc-section-label" data-section="elemental">Elementals</h3>
        <div class="npc-grid npc-grid--with-badge" data-section="elemental">

          <div class="npc-card">
            <div class="npc-card__header">
              <div class="npc-card__avatar-frame">
                <img src="" alt="Portrait of Apoy na Buhay" class="npc-card__portrait" loading="lazy">
              </div>
              <h4 class="npc-card__name">Apoy na Buhay</h4>
              <p class="npc-card__title">Living Flame of Betis</p>
              <span class="status-badge status-badge--elemental">Elemental</span>
            </div>
            <div class="npc-card__body">
              <p class="npc-card__threat"><strong>Napakatindi · Severe</strong></p>
              <p class="npc-card__description">Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni.</p>
            </div>
          </div>

        </div>

        <!-- Section: Demons -->
        <h3 class="npc-section-label" data-section="demon">Demonyo · Demons</h3>
        <div class="npc-grid npc-grid--with-badge" data-section="demon">

          <div class="npc-card">
            <div class="npc-card__header">
              <div class="npc-card__avatar-frame">
                <img src="" alt="Portrait of Aswang ng Dilim" class="npc-card__portrait" loading="lazy">
              </div>
              <h4 class="npc-card__name">Aswang ng Dilim</h4>
              <p class="npc-card__title">Shadow Devourer</p>
              <span class="status-badge status-badge--demon">Demonyo</span>
            </div>
            <div class="npc-card__body">
              <p class="npc-card__threat"><strong>Nakamamatay · Lethal</strong></p>
              <p class="npc-card__description">Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.</p>
            </div>
          </div>

        </div>

      </div>
    </section>

  </main>

  <!-- ── FOOTER ── -->
  <footer class="site-footer" role="contentinfo">
    <p class="site-footer__text">
      Lore content for the past and present players
      <span class="site-footer__divider">·</span>
      Last updated: March 2026
    </p>
  </footer>

  <!-- ── DM MODAL ── -->
  <div id="dm-modal" class="dm-modal" role="dialog" aria-modal="true" aria-label="DM Mode" style="display:none;">
    <div class="dm-modal__box">
      <h3 class="dm-modal__title">DM Mode</h3>
      <p class="dm-modal__desc">Enter the DM password to unlock hidden content.</p>
      <input type="password" id="dm-password" class="dm-modal__input" placeholder="Password" aria-label="DM password">
      <p id="dm-error" class="dm-modal__error" aria-live="polite"></p>
      <div class="dm-modal__actions">
        <button id="dm-confirm" class="dm-modal__btn dm-modal__btn--confirm">Enter</button>
        <button id="dm-cancel" class="dm-modal__btn dm-modal__btn--cancel">Cancel</button>
      </div>
    </div>
  </div>

  <script>
    // ── FILTER SECTION ──
    function filterSection(section, btn) {
      document.querySelectorAll('.char-section-nav__btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      document.querySelectorAll('[data-section]').forEach(function(el) {
        if (section === 'all' || el.dataset.section === section) {
          el.style.display = '';
        } else {
          el.style.display = 'none';
        }
      });
    }
  </script>
  <script src="js/dm.js"></script>

</body>
</html>
```

- [ ] **Step 2: Verify page loads**

Open `bestiary.html` in browser. Check:
- Page renders with correct styling
- All 8 creature cards display
- Filter nav works (clicking each button shows/hides correct sections)
- Navbar, footer, and DM modal are functional

- [ ] **Step 3: Commit**

```bash
git add bestiary.html
git commit -m "feat: add Bestiary page with placeholder creatures"
```

---

### Task 11: Add Bestiary Badge Styles

**Files:**
- Modify: `css/style.css`

- [ ] **Step 1: Add new badge color classes**

Find the existing status badge section in `style.css` (search for `.status-badge--alive`). Add the new type-oriented badges nearby:

```css
/* Bestiary type badges */
.status-badge--creature { background: #3d2b0a; color: #d4a017; }
.status-badge--spirit { background: #0a2d1f; color: #52b788; }
.status-badge--elemental { background: #0a1e2d; color: #74b3ce; }
.status-badge--demon { background: #2d0a0a; color: #e63946; }
```

- [ ] **Step 2: Add threat level styling**

```css
.npc-card__threat {
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}
```

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -m "style: add bestiary creature type badges and threat level styling"
```

---

### Task 12: Update Navbar on All Existing Pages

**Files:**
- Modify: All 11 existing HTML files (navbar World dropdown)

- [ ] **Step 1: Add Bestiary link to World dropdown on all pages**

In every existing HTML file, find the World dropdown menu:
```html
<ul class="nav-dropdown__menu">
  <li><a href="locations.html">Locations <span class="tagalog">Mga Lugar</span></a></li>
  <li><a href="timeline.html">History <span class="tagalog">Kasaysayan</span></a></li>
  <li><a href="codex.html">Codex <span class="tagalog">Aklatan</span></a></li>
</ul>
```

Add the Bestiary link as the 4th item:
```html
<ul class="nav-dropdown__menu">
  <li><a href="locations.html">Locations <span class="tagalog">Mga Lugar</span></a></li>
  <li><a href="timeline.html">History <span class="tagalog">Kasaysayan</span></a></li>
  <li><a href="codex.html">Codex <span class="tagalog">Aklatan</span></a></li>
  <li><a href="bestiary.html">Bestiary <span class="tagalog">Bestiaryo</span></a></li>
</ul>
```

Apply to: `index.html`, `characters.html`, `pc.html`, `locations.html`, `timeline.html`, `codex.html`, `epic.html`, `chronicles.html`, `glossary.html`, `search.html`, `404.html`

- [ ] **Step 2: Verify navigation works**

Click through several pages and confirm:
- Bestiary appears in World dropdown on every page
- Link navigates to `bestiary.html`
- Active state shows correctly when on bestiary page

- [ ] **Step 3: Commit**

```bash
git add index.html characters.html pc.html locations.html timeline.html codex.html epic.html chronicles.html glossary.html search.html 404.html
git commit -m "nav: add Bestiary link to World dropdown on all pages"
```

---

### Task 13: Add Bestiary Nav Card to Homepage

**Files:**
- Modify: `index.html` (nav cards section, around line 357-395)

- [ ] **Step 1: Add Bestiary nav card**

In `index.html`, find the secondary nav cards section (around line 361). Move Glossary to the main 6-card grid, and put Bestiary + Search in the secondary row. Or simpler: add Bestiary as a 3rd secondary card.

Add after the Search nav card (around line 391) and before the empty placeholder div:

```html
          <a href="bestiary.html" class="nav-card" style="opacity:0.85;">
            <span class="nav-card__glyph" aria-hidden="true">
              <!-- Dragon / beast -->
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 4c-2 0-4 2-4 4s2 4 2 6c0 1-1 2-1 2h6s-1-1-1-2c0-2 2-4 2-6s-2-4-4-4z"/>
                <path d="M9 16c-2 1-4 2-4 4h14c0-2-2-3-4-4"/>
                <circle cx="10" cy="8" r="0.5" fill="currentColor"/>
                <path d="M14 6c1-1 3-1 4 0"/>
                <path d="M10 6c-1-1-3-1-4 0"/>
              </svg>
            </span>
            <span class="nav-card__title" style="font-size:0.97rem;">Bestiary <span class="tagalog">Bestiaryo</span></span>
            <span class="nav-card__desc">The creatures encountered across the islands.</span>
            <span class="nav-card__arrow">Explore →</span>
          </a>
```

Remove the empty placeholder `<div class="nav-card" style="opacity:0; pointer-events:none;"></div>` since there are now 3 secondary cards.

- [ ] **Step 2: Verify**

Open homepage. Check:
- Bestiary card appears in secondary row
- Card links to `bestiary.html`
- Layout is balanced

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add Bestiary nav card to homepage"
```

---

### Task 14: Add Bestiary Entries to Search Index

**Files:**
- Modify: `search.html` (SEARCH_INDEX array)

- [ ] **Step 1: Add bestiary entries to SEARCH_INDEX**

In `search.html`, find the `SEARCH_INDEX` array (around line 114). Add bestiary entries at the end of the array:

```js
      // BESTIARY
      { title: 'Bakunawa', category: 'Bestiaryo', url: 'bestiary.html',
        keywords: 'bakunawa serpent deep creature beast sea dragon',
        excerpt: 'A massive serpent said to dwell in the deepest waters surrounding the islands.' },
      { title: 'Tikbalang', category: 'Bestiaryo', url: 'bestiary.html',
        keywords: 'tikbalang stalker trails creature beast horse',
        excerpt: 'A creature that stalks the forest trails, leading travelers astray.' },
      { title: 'Sarangay', category: 'Bestiaryo', url: 'bestiary.html',
        keywords: 'sarangay bull guardian mountains creature beast',
        excerpt: 'A bull-like guardian said to protect the volcanic highlands.' },
      { title: 'Diwata ng Ilog', category: 'Bestiaryo', url: 'bestiary.html',
        keywords: 'diwata ilog river spirit guardian water',
        excerpt: 'A river guardian spirit, both protector and judge of those who cross.' },
      { title: 'Santelmo', category: 'Bestiaryo', url: 'bestiary.html',
        keywords: 'santelmo flame wandering spirit fire',
        excerpt: 'A wandering flame spirit seen near volcanic vents and marshlands.' },
      { title: 'Apoy na Buhay', category: 'Bestiaryo', url: 'bestiary.html',
        keywords: 'apoy buhay living flame betis elemental fire volcano',
        excerpt: 'A living flame elemental born from the fires of Bulkang Betis.' },
      { title: 'Aswang ng Dilim', category: 'Bestiaryo', url: 'bestiary.html',
        keywords: 'aswang dilim shadow devourer demon darkness',
        excerpt: 'A shadow-dwelling demon that feeds on fear and darkness.' },
```

- [ ] **Step 2: Verify search**

Open `search.html` and search for "Bakunawa", "spirit", "bestiary". Confirm results appear.

- [ ] **Step 3: Commit**

```bash
git add search.html
git commit -m "feat: add bestiary creature entries to search index"
```

---

## Final Verification

### Task 15: Full Site Check

- [ ] **Step 1: Check all pages load without errors**

Open browser console, visit each page:
1. `index.html` — hero, map, about, nav cards, bestiary card
2. `characters.html` — filter nav, cards, SVG icons
3. `pc.html` — filter nav, cards, SVG icons
4. `locations.html` — SVG icons in navbar
5. `timeline.html` — SVG icons in navbar
6. `codex.html` — tabs, SVG icons
7. `epic.html` — SVG icons in navbar
8. `chronicles.html` — SVG icons in navbar
9. `glossary.html` — SVG icons in navbar
10. `search.html` — search works, bestiary results appear
11. `bestiary.html` — filters, cards, badges
12. `404.html` — SVG icons in navbar

Check: No console errors, no broken images, no layout issues.

- [ ] **Step 2: Test mobile viewport**

In browser dev tools, test at 375px width:
- Navbar hamburger works on all pages
- Map markers are tappable
- Filter nav scrolls on bestiary/characters/pc pages
- Cards stack properly

- [ ] **Step 3: Verify WebP map loads**

In browser Network tab, confirm `map.webp` loads (not `map.png`) on supported browsers.

- [ ] **Step 4: Test OG tags**

Use https://www.opengraph.xyz/ or share a link in a Discord test channel. Confirm preview shows title, description, and map image.
