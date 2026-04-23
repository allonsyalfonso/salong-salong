# Distance Measuring Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an interactive distance-measuring tool to a new `distances.html` page that lets users click waypoints on the Salong-Salong map and see path + straight-line distances in days or kilometers.

**Architecture:** New standalone page under the "World" dropdown. SVG overlay on top of the existing map image. A dedicated `js/distances.js` module handles waypoints, distance math (using fixed 1408×1993 native pixel space + `PX_PER_KM = 9.60` constant), URL encode/decode, clipboard sharing, and DOM updates. No build system — plain HTML/CSS/JS following the existing site patterns.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, SVG for overlay. Reuses the existing `map.webp` + `map.png` images and the same 12 colored-pin markers (which act as snap targets).

**Spec:** `docs/superpowers/specs/2026-04-23-distance-measuring-tool-design.md`

**IMPORTANT — Do NOT modify colored marker positions in `index.html` or anywhere else.** The 12 marker `top`/`left` values are locked. This plan adds a NEW page with a COPY of the same markers (for snap targets) — existing pages are untouched except for navbar updates.

---

## File Structure

| File | Purpose |
|------|---------|
| `distances.html` (new) | Page skeleton, map + SVG overlay, controls panel, DM modal |
| `js/distances.js` (new) | Waypoint state, distance math, SVG render, click/tap handling, URL encode/decode, clipboard, toggle wiring |
| `css/style.css` (modify) | Add `.distance-*` styles — container, SVG overlay, waypoint dots, polylines, labels, controls, readout, buttons, mobile overrides |
| `search.html` (modify) | Add Distances entry to `SEARCH_INDEX` + add to navbar World dropdown |
| `index.html`, `characters.html`, `pc.html`, `locations.html`, `timeline.html`, `codex.html`, `bestiary.html`, `epic.html`, `chronicles.html`, `glossary.html`, `404.html` (modify) | Add Distances link to World dropdown |

---

## Task 1: Create `distances.html` skeleton

**Files:**
- Create: `distances.html`

Follow the exact pattern from `characters.html` for `<head>`, navbar, footer, and DM modal. The page structure has a page header, a map container with SVG overlay ready for markers, and a controls panel.

- [ ] **Step 1: Create the file with full contents**

Write this exact content to `distances.html`:

```html
<!DOCTYPE html>
<html lang="fil">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inknut+Antiqua:wght@400;600;700;800&family=Gentium+Plus:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
  <title>Mga Layo | Sina Una: Isla ng Salong-Salong</title>
  <meta name="description" content="Measure distances between locations on the map of Salong-Salong — path, straight-line, and days of travel.">
  <meta name="author" content="DM Avips">
  <meta property="og:title" content="Mga Layo · Distances | Isla ng Salong-Salong">
  <meta property="og:description" content="Measure distances between locations on the map of Salong-Salong — path, straight-line, and days of travel.">
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
          <li><a href="bestiary.html">Bestiary <span class="tagalog">Bestiaryo</span></a></li>
          <li><a href="distances.html" class="active">Distances <span class="tagalog">Mga Layo</span></a></li>
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
        <h1>MGA LAYO</h1>
        <div class="page-header__divider">◆ ✦ ◆</div>
        <p class="page-header__subtitle">Measure distances between locations — path, straight-line, and days of travel.</p>
      </div>
    </header>

    <!-- ── DISTANCE MEASURING TOOL ── -->
    <section aria-label="Distance measuring tool">
      <div class="section-container">

        <!-- Readout panel (above map) -->
        <div class="distance-controls">
          <div class="distance-readout" aria-live="polite" id="distance-readout">
            <p class="distance-readout__hint">Tap the map to add points. Tap a marker to snap. Tap a point to remove.</p>
          </div>

          <div class="distance-toggles">
            <div class="distance-toggle-group" role="group" aria-label="Unit">
              <button class="distance-toggle active" data-unit="days" id="distance-unit-days">Days</button>
              <button class="distance-toggle" data-unit="km" id="distance-unit-km">KM</button>
            </div>
            <div class="distance-toggle-group" role="group" aria-label="Pace">
              <button class="distance-toggle active" data-pace="normal" id="distance-pace-normal">Normal</button>
              <button class="distance-toggle" data-pace="fast" id="distance-pace-fast">Fast</button>
            </div>
          </div>

          <div class="distance-actions">
            <button class="distance-btn" id="distance-clear">Clear</button>
            <button class="distance-btn distance-btn--primary" id="distance-copy">Copy Link</button>
          </div>
        </div>

        <!-- Map with SVG overlay for waypoints -->
        <div class="distance-map" id="distance-map">
          <picture>
            <source srcset="images/map.webp" type="image/webp">
            <img
              src="images/map.png"
              alt="Ang Mapa ng Isla ng Salong-Salong"
              width="1408" height="1993"
              style="width:100%; display:block; filter: brightness(0.84) contrast(1.06) saturate(0.88);"
            >
          </picture>

          <!-- Snap-target markers (copy from index.html — keep positions identical) -->
          <a href="#" class="map-marker map-marker--sitio distance-snap-target" data-marker-id="tambis" data-marker-name="Sitio Tambis" style="left:15.9%;top:13.3%">
            <span class="map-marker__pin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3L4 11v10h5v-6h6v6h5V11z"/></svg></span>
            <span class="map-marker__stem" aria-hidden="true"></span>
            <span class="map-marker__tooltip">Sitio Tambis · Purok</span>
          </a>
          <a href="#" class="map-marker map-marker--sitio distance-snap-target" data-marker-id="pasang" data-marker-name="Sitio Pasang" style="left:39.6%;top:26.5%">
            <span class="map-marker__pin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3L4 11v10h5v-6h6v6h5V11z"/></svg></span>
            <span class="map-marker__stem" aria-hidden="true"></span>
            <span class="map-marker__tooltip">Sitio Pasang · Purok</span>
          </a>
          <a href="#" class="map-marker map-marker--sitio distance-snap-target" data-marker-id="anilau" data-marker-name="Sitio Anilau" style="left:15.1%;top:37%">
            <span class="map-marker__pin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3L4 11v10h5v-6h6v6h5V11z"/></svg></span>
            <span class="map-marker__stem" aria-hidden="true"></span>
            <span class="map-marker__tooltip">Sitio Anilau · Purok</span>
          </a>
          <a href="#" class="map-marker map-marker--sitio distance-snap-target" data-marker-id="amalciga" data-marker-name="Sitio Amalciga" style="left:50%;top:60.9%">
            <span class="map-marker__pin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3L4 11v10h5v-6h6v6h5V11z"/></svg></span>
            <span class="map-marker__stem" aria-hidden="true"></span>
            <span class="map-marker__tooltip">Sitio Amalciga · Purok</span>
          </a>
          <a href="#" class="map-marker map-marker--sitio distance-snap-target" data-marker-id="pagangpang" data-marker-name="Sitio Pagangpang" style="left:83.7%;top:72.9%">
            <span class="map-marker__pin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3L4 11v10h5v-6h6v6h5V11z"/></svg></span>
            <span class="map-marker__stem" aria-hidden="true"></span>
            <span class="map-marker__tooltip">Sitio Pagangpang · Purok</span>
          </a>
          <a href="#" class="map-marker map-marker--sacred distance-snap-target" data-marker-id="punong-balete" data-marker-name="Punong Balete" style="left:15.4%;top:24.1%">
            <span class="map-marker__pin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3l3.5 6H13v3l3 5h-3v4h-2v-4H8l3-5v-3H8.5z"/></svg></span>
            <span class="map-marker__stem" aria-hidden="true"></span>
            <span class="map-marker__tooltip">Punong Balete · Sagrado</span>
          </a>
          <a href="#" class="map-marker map-marker--ashland distance-snap-target" data-marker-id="abong-bukid" data-marker-name="Abong Bukid" style="left:26.5%;top:34.8%">
            <span class="map-marker__pin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 4L3 19h18zm0 4.5L17.5 19h-11z"/></svg></span>
            <span class="map-marker__stem" aria-hidden="true"></span>
            <span class="map-marker__tooltip">Abong Bukid · Ashland</span>
          </a>
          <a href="#" class="map-marker map-marker--volcano distance-snap-target" data-marker-id="bulkang-betis" data-marker-name="Bulkang Betis" style="left:35%;top:45.7%">
            <span class="map-marker__pin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2s-6 7-6 12a6 6 0 0 0 12 0c0-5-6-12-6-12zm0 15a2.5 2.5 0 0 1-2.5-2.5c0-2.5 2.5-4 2.5-4s2.5 1.5 2.5 4A2.5 2.5 0 0 1 12 17z"/></svg></span>
            <span class="map-marker__stem" aria-hidden="true"></span>
            <span class="map-marker__tooltip">Bulkang Betis · Bulkan</span>
          </a>
          <a href="#" class="map-marker map-marker--volcano distance-snap-target" data-marker-id="bulkang-kamuning" data-marker-name="Bulkang Kamuning" style="left:68.5%;top:60.9%">
            <span class="map-marker__pin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2s-6 7-6 12a6 6 0 0 0 12 0c0-5-6-12-6-12zm0 15a2.5 2.5 0 0 1-2.5-2.5c0-2.5 2.5-4 2.5-4s2.5 1.5 2.5 4A2.5 2.5 0 0 1 12 17z"/></svg></span>
            <span class="map-marker__stem" aria-hidden="true"></span>
            <span class="map-marker__tooltip">Bulkang Kamuning · Bulkan</span>
          </a>
          <a href="#" class="map-marker map-marker--water distance-snap-target" data-marker-id="itinadhanang-ilog" data-marker-name="Itinadhanang Ilog" style="left:24%;top:44.6%">
            <span class="map-marker__pin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2s-7 9-7 13a7 7 0 0 0 14 0c0-4-7-13-7-13z"/></svg></span>
            <span class="map-marker__stem" aria-hidden="true"></span>
            <span class="map-marker__tooltip">Itinadhanang Ilog · Tubig</span>
          </a>
          <a href="#" class="map-marker map-marker--water distance-snap-target" data-marker-id="hinulugang-abuno" data-marker-name="Hinulugang Abuno" style="left:31%;top:43.5%">
            <span class="map-marker__pin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2s-7 9-7 13a7 7 0 0 0 14 0c0-4-7-13-7-13z"/></svg></span>
            <span class="map-marker__stem" aria-hidden="true"></span>
            <span class="map-marker__tooltip">Hinulugang Abuno · Tubig</span>
          </a>
          <a href="#" class="map-marker map-marker--water distance-snap-target" data-marker-id="lawang-kamagong" data-marker-name="Lawang Kamagong" style="left:66%;top:70.7%">
            <span class="map-marker__pin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2s-7 9-7 13a7 7 0 0 0 14 0c0-4-7-13-7-13z"/></svg></span>
            <span class="map-marker__stem" aria-hidden="true"></span>
            <span class="map-marker__tooltip">Lawang Kamagong · Tubig</span>
          </a>

          <!-- SVG overlay for polylines, dots, labels (JS renders into this) -->
          <svg class="distance-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg>
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
  <div class="dm-modal-overlay" id="dm-modal-overlay" role="dialog" aria-modal="true" aria-label="DM Mode">
    <div class="dm-modal">
      <p class="dm-modal__title">DM Mode</p>
      <input class="dm-modal__input" type="password" id="dm-password-input" placeholder="Password..." autocomplete="off">
      <p class="dm-modal__error" id="dm-error"></p>
      <div class="dm-modal__buttons">
        <button class="dm-modal__btn dm-modal__btn--confirm" id="dm-confirm-btn">Enter</button>
        <button class="dm-modal__btn dm-modal__btn--cancel" id="dm-cancel-btn">Cancel</button>
      </div>
    </div>
  </div>

  <script src="js/dm.js"></script>
  <script src="js/distances.js"></script>

</body>
</html>
```

- [ ] **Step 2: Verify**

Open `distances.html` in a browser. Check:
- Page loads without console errors
- Navbar shows, World dropdown has "Distances · Mga Layo" highlighted active
- Page header shows "MGA LAYO" + subtitle
- Map image renders with markers at correct positions (same as homepage)
- Controls panel shows readout hint + Days/KM toggles + Normal/Fast toggles + Clear/Copy Link buttons
- SVG overlay exists but is empty (no waypoints yet)
- Footer renders
- DM modal exists (hidden initially)

(`js/distances.js` doesn't exist yet — expect a 404 on that script. That's fine, will be created in Task 3.)

---

## Task 2: Add CSS for the distance tool

**Files:**
- Modify: `css/style.css` (append new `.distance-*` rules at end of file, before any `@media` blocks at EOF if present)

All new class names are prefixed `.distance-*` to avoid collisions.

- [ ] **Step 1: Append the distance tool CSS**

Append this CSS at the end of `css/style.css`:

```css
/* ============================================================
   DISTANCE MEASURING TOOL — .distance-* prefix throughout
   ============================================================ */

/* Map container — relatively positioned so SVG overlay + markers stack */
.distance-map {
  position: relative;
  border: 1px solid rgba(196,154,26,0.18);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 8px 42px rgba(0,0,0,0.78), 0 0 0 1px rgba(196,154,26,0.05);
  background: #080f08;
  margin-top: 1.5rem;
  cursor: crosshair;
  touch-action: manipulation;
  user-select: none;
}

.distance-map picture,
.distance-map > picture img {
  display: block;
  width: 100%;
}

/* SVG overlay fills the image, uses 0-100 viewBox so coords are % */
.distance-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 4;
}

/* Path polyline: solid gold. Stroke-width is in viewBox units (0-100), so it
   stretches non-uniformly with the image — but map is 1408×1993, ratio ≈ 0.71,
   so a 0.6 unit stroke renders as ~4-6 px CSS. Visually good; slight aspect
   skew on stroke thickness is acceptable. */
.distance-overlay__path {
  fill: none;
  stroke: var(--gold-bright);
  stroke-width: 0.6;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.9;
}

/* Straight-line polyline: dashed cream */
.distance-overlay__direct {
  fill: none;
  stroke: var(--text-light);
  stroke-width: 0.35;
  stroke-dasharray: 1.2 0.9;
  stroke-linecap: round;
  opacity: 0.6;
}

/* Waypoint dot */
.distance-overlay__dot {
  fill: var(--gold-bright);
  stroke: #1a0600;
  stroke-width: 1.2;
  cursor: pointer;
  pointer-events: auto;
}
.distance-overlay__dot:hover { fill: #ffe080; }

/* Segment distance label. font-size is in CSS px (fixed regardless of viewBox);
   stroke-width is in viewBox units — paint-order ensures dark outline behind the
   fill for readability over any map color. */
.distance-overlay__label {
  font-family: var(--font-display);
  font-size: 11px;
  fill: var(--gold-bright);
  stroke: #1a0600;
  stroke-width: 0.4;
  paint-order: stroke fill;
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle;
  pointer-events: none;
}

/* Controls panel */
.distance-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--bg-surface);
  color: var(--text-light);
  border: 1px solid rgba(196,154,26,0.18);
  border-radius: var(--radius);
  margin-top: 1rem;
}

.distance-readout {
  flex: 1 1 260px;
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.55;
  min-height: 2.8em;
}
.distance-readout p {
  margin: 0;
}
.distance-readout__hint {
  color: rgba(242,216,152,0.7);
  font-style: italic;
  font-size: 0.9rem;
}
.distance-readout__primary {
  color: var(--gold-bright);
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 0.04em;
}
.distance-readout__secondary {
  color: rgba(242,216,152,0.75);
  font-size: 0.92rem;
}

/* Toggle groups */
.distance-toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.distance-toggle-group {
  display: inline-flex;
  border: 1px solid rgba(196,154,26,0.3);
  border-radius: var(--radius);
  overflow: hidden;
  background: rgba(10,7,4,0.4);
}
.distance-toggle {
  font-family: var(--font-display);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 0.5rem 0.9rem;
  background: transparent;
  color: rgba(242,216,152,0.65);
  border: none;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;
}
.distance-toggle:hover { color: var(--gold-light); }
.distance-toggle.active {
  background: rgba(196,154,26,0.15);
  color: var(--gold-bright);
}
.distance-toggle + .distance-toggle {
  border-left: 1px solid rgba(196,154,26,0.2);
}

/* Action buttons */
.distance-actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.distance-btn {
  font-family: var(--font-display);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 0.55rem 1rem;
  background: transparent;
  color: rgba(242,216,152,0.8);
  border: 1px solid rgba(196,154,26,0.35);
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
}
.distance-btn:hover {
  background: rgba(196,154,26,0.08);
  color: var(--gold-light);
  border-color: rgba(196,154,26,0.55);
}
.distance-btn--primary {
  background: rgba(196,154,26,0.12);
  color: var(--gold-bright);
}
.distance-btn--primary:hover {
  background: rgba(196,154,26,0.22);
}

/* Mobile: stack controls vertically */
@media (max-width: 640px) {
  .distance-controls {
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
  }
  .distance-toggles {
    justify-content: space-between;
  }
  .distance-toggle-group {
    flex: 1;
  }
  .distance-toggle {
    flex: 1;
    text-align: center;
  }
  .distance-actions {
    justify-content: space-between;
  }
  .distance-actions .distance-btn {
    flex: 1;
  }
}

/* Transient notice for URL decode warnings / Copy Link feedback */
.distance-notice {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(10,7,4,0.92);
  color: var(--gold-light);
  border: 1px solid rgba(196,154,26,0.4);
  padding: 0.6rem 1.1rem;
  border-radius: var(--radius);
  font-family: var(--font-body);
  font-size: 0.92rem;
  z-index: 200;
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}
.distance-notice.visible { opacity: 1; }
```

- [ ] **Step 2: Verify**

Reload `distances.html`. Controls should now have proper styling: dark panel with gold toggles and buttons, map container with border. No markers yet because markers depend on existing `.map-marker` styles — those should already work from the base CSS.

---

## Task 3: Create `js/distances.js` skeleton with constants and state

**Files:**
- Create: `js/distances.js`

- [ ] **Step 1: Create the file with base module structure**

Write this to `js/distances.js`:

```js
(function () {
  'use strict';

  // ── CONSTANTS ──
  var MAP_W = 1408;            // Native map width in px
  var MAP_H = 1993;            // Native map height in px
  var PX_PER_KM = 9.60;        // Calibrated: Tambis ↔ Lawang Kamagong = 140 km (1344 px)
  var PACE = { normal: 20, fast: 30 };  // km/day
  var SNAP_RADIUS = 30;        // pixels (rendered space)
  var REMOVE_RADIUS = 20;      // pixels (rendered space)
  var MAX_WAYPOINTS = 50;

  // ── STATE ──
  // Each waypoint: {x, y (0-100 % of image), name (optional), snappedTo (marker-id or null)}
  var waypoints = [];
  var currentPace = 'normal';
  var currentUnit = 'days';

  // ── DOM REFS (populated on init) ──
  var mapEl, overlayEl, readoutEl;
  var unitDaysBtn, unitKmBtn, paceNormalBtn, paceFastBtn;
  var clearBtn, copyBtn;

  // ── INIT ──
  function init() {
    mapEl = document.getElementById('distance-map');
    if (!mapEl) return;
    overlayEl = mapEl.querySelector('.distance-overlay');
    readoutEl = document.getElementById('distance-readout');
    unitDaysBtn = document.getElementById('distance-unit-days');
    unitKmBtn = document.getElementById('distance-unit-km');
    paceNormalBtn = document.getElementById('distance-pace-normal');
    paceFastBtn = document.getElementById('distance-pace-fast');
    clearBtn = document.getElementById('distance-clear');
    copyBtn = document.getElementById('distance-copy');

    // Wire up events (filled in later tasks)
    mapEl.addEventListener('click', onMapClick);
    unitDaysBtn.addEventListener('click', function () { setUnit('days'); });
    unitKmBtn.addEventListener('click', function () { setUnit('km'); });
    paceNormalBtn.addEventListener('click', function () { setPace('normal'); });
    paceFastBtn.addEventListener('click', function () { setPace('fast'); });
    clearBtn.addEventListener('click', clearWaypoints);
    copyBtn.addEventListener('click', copyRouteLink);

    // Load from URL if present
    loadFromUrl();
    render();
  }

  // ── DISTANCE MATH ──
  function distanceKm(a, b) {
    var dx = (b.x - a.x) / 100 * MAP_W;
    var dy = (b.y - a.y) / 100 * MAP_H;
    return Math.sqrt(dx*dx + dy*dy) / PX_PER_KM;
  }

  function pathDistanceKm() {
    var total = 0;
    for (var i = 1; i < waypoints.length; i++) {
      total += distanceKm(waypoints[i-1], waypoints[i]);
    }
    return total;
  }

  function directDistanceKm() {
    if (waypoints.length < 2) return 0;
    return distanceKm(waypoints[0], waypoints[waypoints.length - 1]);
  }

  // ── PLACEHOLDERS (filled in later tasks) ──
  function onMapClick(e) {
    // Task 4 fills this in
  }
  function setUnit(u) {
    currentUnit = u;
    unitDaysBtn.classList.toggle('active', u === 'days');
    unitKmBtn.classList.toggle('active', u === 'km');
    render();
  }
  function setPace(p) {
    currentPace = p;
    paceNormalBtn.classList.toggle('active', p === 'normal');
    paceFastBtn.classList.toggle('active', p === 'fast');
    render();
  }
  function clearWaypoints() {
    waypoints = [];
    render();
  }
  function copyRouteLink() {
    // Task 8 fills this in
  }
  function loadFromUrl() {
    // Task 9 fills this in
  }
  function render() {
    // Task 5 + 6 fill this in
  }

  // ── BOOTSTRAP ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
```

- [ ] **Step 2: Verify**

Reload `distances.html`. Open browser console. There should be:
- No errors from `distances.js`
- Clicking Days/KM/Normal/Fast toggle buttons changes which one has the `.active` class (verify in dev tools)
- Clicking Clear does nothing visible (no waypoints yet)
- Clicking Copy Link does nothing (empty function body)

---

## Task 4: Implement click handling — add / remove / snap

**Files:**
- Modify: `js/distances.js`

Priority order per spec: remove existing waypoint (within 20px) → snap to marker (within 30px) → add free-form.

- [ ] **Step 1: Replace `onMapClick` with the full implementation**

Replace the empty `onMapClick` function with this:

```js
  function onMapClick(e) {
    // Only respond to left clicks / taps (not right-click etc.)
    if (e.button !== undefined && e.button !== 0) return;

    // Don't handle clicks that originated from markers — we'll intercept markers below
    var imgEl = mapEl.querySelector('picture img');
    if (!imgEl) return;
    var rect = imgEl.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right ||
        e.clientY < rect.top || e.clientY > rect.bottom) {
      return;
    }

    e.preventDefault();

    var clickX = e.clientX;
    var clickY = e.clientY;

    // 1. Check if click is near an existing waypoint (REMOVE)
    for (var i = 0; i < waypoints.length; i++) {
      var wpX = rect.left + waypoints[i].x / 100 * rect.width;
      var wpY = rect.top + waypoints[i].y / 100 * rect.height;
      if (Math.hypot(clickX - wpX, clickY - wpY) < REMOVE_RADIUS) {
        waypoints.splice(i, 1);
        render();
        return;
      }
    }

    // 2. Check if click is near a snap marker (SNAP)
    //    Use the inline left%/top% as the canonical marker position — this is the
    //    same reference the SVG dot will render at, so click-point and render-point
    //    stay in sync. Robust to any CSS transform / cascade weirdness on .map-marker.
    var snapTargets = mapEl.querySelectorAll('.distance-snap-target');
    var closestMarker = null;
    var closestDist = SNAP_RADIUS;
    snapTargets.forEach(function (marker) {
      var mxPct = parseFloat(marker.style.left);
      var myPct = parseFloat(marker.style.top);
      var mx = rect.left + mxPct / 100 * rect.width;
      var my = rect.top + myPct / 100 * rect.height;
      var dist = Math.hypot(clickX - mx, clickY - my);
      if (dist < closestDist) {
        closestDist = dist;
        closestMarker = marker;
      }
    });

    if (closestMarker) {
      if (waypoints.length >= MAX_WAYPOINTS) return;
      var left = parseFloat(closestMarker.style.left);
      var top = parseFloat(closestMarker.style.top);
      waypoints.push({
        x: left,
        y: top,
        name: closestMarker.dataset.markerName,
        snappedTo: closestMarker.dataset.markerId
      });
      render();
      return;
    }

    // 3. Otherwise, free-form waypoint at click position
    if (waypoints.length >= MAX_WAYPOINTS) return;
    var x = (clickX - rect.left) / rect.width * 100;
    var y = (clickY - rect.top) / rect.height * 100;
    waypoints.push({
      x: x,
      y: y,
      name: 'Point ' + (waypoints.length + 1),
      snappedTo: null
    });
    render();
  }
```

Also: prevent marker anchor tags from navigating when clicked. Update the existing marker click handler inside `init()` — after the existing `mapEl.addEventListener('click', onMapClick);`, add:

```js
    // Prevent marker <a> default navigation (distance page markers are snap targets only)
    mapEl.querySelectorAll('.distance-snap-target').forEach(function (m) {
      m.addEventListener('click', function (ev) { ev.preventDefault(); });
    });
```

- [ ] **Step 2: Verify**

Reload `distances.html`. Open browser console to watch `waypoints` array (use `window.waypoints = waypoints;` temporarily during debugging if needed, or just inspect via the SVG overlay rendering in Task 5).

For now, add `console.log('waypoints:', waypoints);` inside `render()` temporarily so you can observe:
- Click empty sea → adds free-form waypoint (name "Point 1")
- Click near a marker → adds snapped waypoint with the marker's name
- Click near an existing waypoint → removes it

Remove the `console.log` before moving on.

---

## Task 5: Implement SVG rendering

**Files:**
- Modify: `js/distances.js`

Render waypoints as dots, path as solid polyline, straight-line as dashed polyline, per-segment labels as text.

- [ ] **Step 1: Replace the empty `render` function**

Replace the empty `render` function with:

```js
  function render() {
    renderOverlay();
    renderReadout();
  }

  function renderOverlay() {
    if (!overlayEl) return;
    // Clear SVG
    while (overlayEl.firstChild) overlayEl.removeChild(overlayEl.firstChild);

    if (waypoints.length === 0) return;

    var SVG = 'http://www.w3.org/2000/svg';

    // 1. Straight-line (if 2+ points): dashed
    if (waypoints.length >= 2) {
      var first = waypoints[0];
      var last = waypoints[waypoints.length - 1];
      var direct = document.createElementNS(SVG, 'line');
      direct.setAttribute('x1', first.x);
      direct.setAttribute('y1', first.y);
      direct.setAttribute('x2', last.x);
      direct.setAttribute('y2', last.y);
      direct.setAttribute('class', 'distance-overlay__direct');
      overlayEl.appendChild(direct);
    }

    // 2. Path polyline
    if (waypoints.length >= 2) {
      var pathStr = waypoints.map(function (w) { return w.x + ',' + w.y; }).join(' ');
      var pathEl = document.createElementNS(SVG, 'polyline');
      pathEl.setAttribute('points', pathStr);
      pathEl.setAttribute('class', 'distance-overlay__path');
      overlayEl.appendChild(pathEl);
    }

    // 3. Per-segment distance labels (only when segment >= 15px rendered)
    var imgEl = mapEl.querySelector('picture img');
    var rect = imgEl ? imgEl.getBoundingClientRect() : null;
    for (var i = 1; i < waypoints.length; i++) {
      var a = waypoints[i-1], b = waypoints[i];
      if (rect) {
        var ax = a.x / 100 * rect.width;
        var ay = a.y / 100 * rect.height;
        var bx = b.x / 100 * rect.width;
        var by = b.y / 100 * rect.height;
        if (Math.hypot(bx-ax, by-ay) < 15) continue;
      }
      var mx = (a.x + b.x) / 2;
      var my = (a.y + b.y) / 2;
      var km = distanceKm(a, b);
      var label = document.createElementNS(SVG, 'text');
      label.setAttribute('x', mx);
      label.setAttribute('y', my);
      label.setAttribute('class', 'distance-overlay__label');
      label.textContent = km.toFixed(1) + ' km';
      overlayEl.appendChild(label);
    }

    // 4. Waypoint dots (on top, clickable for removal). r=1.4 viewBox units ≈
    //    10-14px CSS diameter at typical rendered widths — easy to tap on mobile.
    waypoints.forEach(function (w) {
      var dot = document.createElementNS(SVG, 'circle');
      dot.setAttribute('cx', w.x);
      dot.setAttribute('cy', w.y);
      dot.setAttribute('r', 1.4);
      dot.setAttribute('class', 'distance-overlay__dot');
      overlayEl.appendChild(dot);
    });
  }
```

- [ ] **Step 2: Verify**

Reload `distances.html`, click a few spots on the map. You should see:
- Gold dots at each click point
- Gold solid polyline connecting consecutive points
- Dashed line from first to last (when 3+ points exist and it differs from path)
- Small km labels at midpoints of segments
- Clicking near an existing dot removes it + re-renders

---

## Task 6: Implement readout display

**Files:**
- Modify: `js/distances.js`

Show total path km, days (normal + fast), and direct km. `aria-live` auto-announces updates.

- [ ] **Step 1: Add `renderReadout` function**

Add this function (right after `renderOverlay`):

```js
  function renderReadout() {
    if (!readoutEl) return;

    if (waypoints.length === 0) {
      readoutEl.innerHTML = '<p class="distance-readout__hint">Tap the map to add points. Tap a marker to snap. Tap a point to remove.</p>';
      return;
    }

    if (waypoints.length === 1) {
      readoutEl.innerHTML = '<p class="distance-readout__hint">Add another point to measure a distance.</p>';
      return;
    }

    var pathKm = pathDistanceKm();
    var directKm = directDistanceKm();
    var pathDaysNormal = pathKm / PACE.normal;
    var pathDaysFast = pathKm / PACE.fast;

    var primaryText, secondaryText;
    if (currentUnit === 'days') {
      var activeDays = currentPace === 'normal' ? pathDaysNormal : pathDaysFast;
      var activePaceLabel = currentPace === 'normal' ? 'normal' : 'fast';
      primaryText = 'Path: ' + formatDays(activeDays) + ' (' + activePaceLabel + ')';
      var otherDays = currentPace === 'normal' ? pathDaysFast : pathDaysNormal;
      var otherPaceLabel = currentPace === 'normal' ? 'fast' : 'normal';
      secondaryText = pathKm.toFixed(1) + ' km · ' + formatDays(otherDays) + ' (' + otherPaceLabel + ') · Direct: ' + directKm.toFixed(1) + ' km';
    } else {
      primaryText = 'Path: ' + pathKm.toFixed(1) + ' km';
      secondaryText = formatDays(pathDaysNormal) + ' (normal) · ' + formatDays(pathDaysFast) + ' (fast) · Direct: ' + directKm.toFixed(1) + ' km';
    }

    readoutEl.innerHTML =
      '<p class="distance-readout__primary">' + primaryText + '</p>' +
      '<p class="distance-readout__secondary">' + secondaryText + '</p>';
  }

  function formatDays(d) {
    if (d < 1) {
      var hours = d * 24;
      return hours.toFixed(1) + ' hrs';
    }
    if (d < 10) return d.toFixed(1) + ' days';
    return Math.round(d) + ' days';
  }
```

- [ ] **Step 2: Verify**

Reload `distances.html`. Click a couple of markers (e.g., Tambis then Lawang Kamagong). Expected readout:
- `Path: 7.0 days (normal)` on top
- `140.0 km · 4.7 days (fast) · Direct: 140.0 km` below

Click Fast toggle — primary line swaps to show fast pace value. Click KM toggle — primary shows km, days moves to secondary.

**Sanity check:** Tambis ↔ Lawang Kamagong should read ~140 km. If it reads very different, the calibration is off.

---

## Task 7: Implement Clear + Copy Link

**Files:**
- Modify: `js/distances.js`

- [ ] **Step 1: Replace `copyRouteLink` function**

The `clearWaypoints` function already works (from Task 3 skeleton). Now implement `copyRouteLink`:

```js
  function copyRouteLink() {
    if (waypoints.length === 0) {
      showNotice('Add some points first.');
      return;
    }
    var encoded = waypoints.map(function (w) {
      var decimals = w.snappedTo ? 1 : 2;
      return w.x.toFixed(decimals) + ',' + w.y.toFixed(decimals);
    }).join(';');
    var url = window.location.origin + window.location.pathname + '?r=' + encoded;

    var originalLabel = copyBtn.textContent;
    var restoreLabel = function () { copyBtn.textContent = originalLabel; };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        copyBtn.textContent = 'Copied!';
        setTimeout(restoreLabel, 1500);
      }).catch(function () {
        fallbackCopy(url);
      });
    } else {
      fallbackCopy(url);
    }
  }

  function fallbackCopy(url) {
    // Create a temporary input so the user can manually copy
    var input = document.createElement('input');
    input.value = url;
    input.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:300;width:80%;max-width:520px;padding:0.5rem;';
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      copyBtn.textContent = 'Copied!';
      setTimeout(function () {
        copyBtn.textContent = 'Copy Link';
        document.body.removeChild(input);
      }, 1500);
    } catch (e) {
      showNotice('Press Ctrl+C to copy this link.');
      setTimeout(function () {
        if (input.parentNode) document.body.removeChild(input);
      }, 5000);
    }
  }

  function showNotice(text) {
    var n = document.createElement('div');
    n.className = 'distance-notice';
    n.textContent = text;
    document.body.appendChild(n);
    // Trigger CSS transition
    setTimeout(function () { n.classList.add('visible'); }, 10);
    setTimeout(function () {
      n.classList.remove('visible');
      setTimeout(function () { if (n.parentNode) document.body.removeChild(n); }, 300);
    }, 2500);
  }
```

- [ ] **Step 2: Verify**

- Click Clear with waypoints on map → all waypoints vanish, readout reverts to hint
- Click Copy Link with no waypoints → notice "Add some points first" appears at top for ~2.5s
- Click Copy Link with 2+ waypoints → button briefly says "Copied!" and URL is in clipboard. Paste into a text editor to verify format (e.g. `http://localhost:8765/distances.html?r=15.9,13.3;66,70.7`)

---

## Task 8: Implement URL decoding (load from `?r=` query param)

**Files:**
- Modify: `js/distances.js`

- [ ] **Step 1: Replace `loadFromUrl` function**

```js
  function loadFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var r = params.get('r');
    if (!r) return;

    var segments = r.split(';').slice(0, MAX_WAYPOINTS);
    var skipped = 0;
    segments.forEach(function (seg) {
      var parts = seg.split(',');
      if (parts.length !== 2) { skipped++; return; }
      var x = parseFloat(parts[0]);
      var y = parseFloat(parts[1]);
      if (isNaN(x) || isNaN(y) || x < 0 || x > 100 || y < 0 || y > 100) {
        skipped++;
        return;
      }
      // Try to match to a snap target (by closest position within 0.5%)
      var snappedMarker = findMarkerAt(x, y);
      if (snappedMarker) {
        waypoints.push({
          x: parseFloat(snappedMarker.style.left),
          y: parseFloat(snappedMarker.style.top),
          name: snappedMarker.dataset.markerName,
          snappedTo: snappedMarker.dataset.markerId
        });
      } else {
        waypoints.push({
          x: x,
          y: y,
          name: 'Point ' + (waypoints.length + 1),
          snappedTo: null
        });
      }
    });

    if (skipped > 0) {
      showNotice(skipped + ' invalid waypoint' + (skipped === 1 ? '' : 's') + ' skipped.');
    }
  }

  function findMarkerAt(x, y) {
    var snapTargets = mapEl.querySelectorAll('.distance-snap-target');
    var match = null;
    snapTargets.forEach(function (marker) {
      var mx = parseFloat(marker.style.left);
      var my = parseFloat(marker.style.top);
      if (Math.abs(mx - x) < 0.5 && Math.abs(my - y) < 0.5) {
        match = marker;
      }
    });
    return match;
  }
```

- [ ] **Step 2: Verify**

- Place 2-3 waypoints, click Copy Link, copy the URL
- Paste URL in a new tab — the route should render automatically
- Try a malformed URL manually: `distances.html?r=foo;15.9,13.3;bar` — route renders with only the valid waypoint, notice says "2 invalid waypoints skipped"
- Snapped waypoints should show their original marker names (e.g., "Sitio Tambis") not "Point 1"

---

## Task 9: Add Distances to the World dropdown on all 12 existing HTML pages

**Files:**
- Modify: `index.html`, `characters.html`, `pc.html`, `locations.html`, `timeline.html`, `codex.html`, `bestiary.html`, `epic.html`, `chronicles.html`, `glossary.html`, `search.html`, `404.html`

In every file, the World dropdown looks like:

```html
        <ul class="nav-dropdown__menu">
          <li><a href="locations.html">Locations <span class="tagalog">Mga Lugar</span></a></li>
          <li><a href="timeline.html">History <span class="tagalog">Kasaysayan</span></a></li>
          <li><a href="codex.html">Codex <span class="tagalog">Aklatan</span></a></li>
          <li><a href="bestiary.html">Bestiary <span class="tagalog">Bestiaryo</span></a></li>
        </ul>
```

Add a 5th `<li>` immediately after the Bestiary line:

```html
          <li><a href="distances.html">Distances <span class="tagalog">Mga Layo</span></a></li>
```

- [ ] **Step 1: Apply the edit in each of the 12 files**

For each file, find the exact block:

```html
          <li><a href="bestiary.html">Bestiary <span class="tagalog">Bestiaryo</span></a></li>
        </ul>
```

Replace with:

```html
          <li><a href="bestiary.html">Bestiary <span class="tagalog">Bestiaryo</span></a></li>
          <li><a href="distances.html">Distances <span class="tagalog">Mga Layo</span></a></li>
        </ul>
```

**Important — `bestiary.html` has a different target line.** On `bestiary.html`, the Bestiary link marks itself active, so the target is:

```html
          <li><a href="bestiary.html" class="active">Bestiary <span class="tagalog">Bestiaryo</span></a></li>
        </ul>
```

Replace with:

```html
          <li><a href="bestiary.html" class="active">Bestiary <span class="tagalog">Bestiaryo</span></a></li>
          <li><a href="distances.html">Distances <span class="tagalog">Mga Layo</span></a></li>
        </ul>
```

**Note:** Do NOT add `class="active"` to the new Distances link on any existing page — the active class belongs only to `distances.html` itself (which was set up in Task 1).

- [ ] **Step 2: Verify**

Open each page in a browser. Hover the World dropdown. Distances should appear as the 5th item under Bestiary. Clicking it should navigate to `distances.html`.

---

## Task 10: Add Distances to the search index

**Files:**
- Modify: `search.html`

Find the `SEARCH_INDEX` array (around line 114). Add this entry to the end, just before the closing `];`:

- [ ] **Step 1: Add the search entry**

```js
      // DISTANCES TOOL
      { title: 'Distances · Mga Layo', category: 'Tool', url: 'distances.html',
        keywords: 'distance measure layo travel days route path km kilometer tool map',
        excerpt: 'Measure distances between locations on the map — path, straight-line, and days of travel.' },
```

- [ ] **Step 2: Verify**

Open `search.html`. Search for "distance" → should return the Distances tool entry. Search for "layo" → should also return it. Click the result → navigates to `distances.html`.

---

## Task 11: Final cross-viewport verification

- [ ] **Step 1: Desktop flow (1200px width)**
1. Open `distances.html`
2. Click Sitio Tambis marker → should snap, waypoint labeled "Sitio Tambis"
3. Click Lawang Kamagong marker → snap, readout shows `Path: 7 days (normal)` and `140.0 km · 4.7 days (fast) · Direct: 140.0 km`
4. Click Fast toggle → primary line updates to "Path: 4.7 days (fast)"
5. Click KM toggle → primary shows `Path: 140.0 km`
6. Click Copy Link → button says "Copied!" briefly
7. Paste URL in new tab → route reloads with both markers named correctly
8. Click one of the waypoint dots → it disappears, readout updates
9. Click Clear → empty state

- [ ] **Step 2: Mobile flow (390px width)**
1. Resize to 390px
2. Controls stack vertically: readout on top, toggles below, buttons below that
3. All toggle buttons touch targets are ≥44px tall
4. Tapping markers on phone viewport works (snap succeeds)
5. No horizontal overflow

- [ ] **Step 3: No regressions on existing pages**
1. Visit homepage (`index.html`) — map markers still land correctly on their islands
2. Visit `bestiary.html`, `characters.html`, `search.html` — all load without console errors
3. World dropdown shows Distances on every page

---

## Out of Scope (v1)

- Named custom waypoints beyond "Point N" (v2 could add rename)
- Multiple saved routes with names
- Elevation/terrain speed modifiers
- Pan/zoom on the map (breaks the current static overlay model)
- Keyboard-only waypoint creation (pace/unit/clear are still keyboard-accessible via Tab+Enter)
- Undo/redo

---

## Success Criteria

1. **Calibration correct:** Tambis ↔ Lawang Kamagong = 140.0 km ± 1 km
2. **Snap works:** Tapping within 30px of any of the 12 markers snaps
3. **Remove works:** Tapping within 20px of an existing waypoint removes it
4. **Toggles update readout:** Days/KM and Normal/Fast toggles immediately re-render
5. **Copy Link round-trip:** URL from Copy Link rebuilds the exact route on reload
6. **Malformed URL handling:** Invalid segments skipped with notice, good segments render
7. **Navbar integration:** Distances link visible on all 13 pages (12 existing + new one)
8. **Mobile:** 0 horizontal overflow at 360/375/390/412/430px; all controls tappable
9. **No regressions:** Existing page markers unchanged; no new console errors on any page
