# Distance Measuring Tool — Design

**Date:** 2026-04-23
**Author:** Alfonso (with Claude)
**Status:** Review passed — pending user review

---

## Overview

Interactive distance measuring tool for the Isla ng Salong-Salong map. Users click waypoints on the map, see polyline distances (both path and straight-line), and can share routes via URL. Lives on a new page `distances.html` linked under the World navbar dropdown.

**Target audience:** Campaign players and DM Avips, for estimating travel times during sessions and sharing route plans.

---

## Approach

Pure HTML/CSS/JS, no build system — fits the existing site architecture. An SVG overlay sits on top of the map image inside a positioned container. A small JS module handles waypoint management, distance math, and URL encoding.

---

## Calibration

**Anchor:** Sitio Tambis ↔ Lawang Kamagong = **140 km**

Rationale: During a previous campaign, a party traveled this route in 7 days. At a realistic jungle/volcanic-terrain pace of 20 km/day on foot, this gives 140 km. This sets the pixel-to-km ratio for all measurements.

Map image dimensions: 1408 × 1993 px. Marker positions (updated after 2026-04-23 recalibration so markers sit correctly on their island features across desktop and mobile):
- Tambis: 15.9% left, 13.3% top → (224px, 265px)
- Lawang Kamagong: 66% left, 70.7% top → (929px, 1409px)
- Straight-line pixel distance: √((929-224)² + (1409-265)²) ≈ 1344 px

**Scale constant:** `PX_PER_KM = 9.60` on the 1408×1993 native map space. This is a fixed constant. Distances are always computed in native map pixel space (not rendered pixels), so no resize recalculation is needed — waypoints stored as % coords convert deterministically.

---

## Travel Paces (foot only, all terrain)

- **Normal:** 20 km/day (default — matches the calibration assumption)
- **Fast:** 30 km/day (forced march)

No "slow" pace, no boat travel.

---

## UI Components

### Page structure (matches other pages)

- Navbar with new Distances link under World dropdown. On `distances.html`:
  - The World `<button class="nav-dropdown__trigger">` gets `class="active"` (same pattern as `search.html`)
  - The Distances `<a>` gets `class="active"`
- Page header: "Mga Layo" Tagalog title, "Distances" English subtitle. ("Layo" is the native Tagalog for "distance/farness"; fits the pre-colonial theme better than the Spanish loanword "Distansya".)
- Main content: map + controls panel
- Footer (same as other pages)
- DM modal (exact same HTML block as used on `characters.html` — `#dm-modal-overlay`, `#dm-password-input`, `#dm-confirm-btn`, `#dm-cancel-btn`)

### Map area

- Same map image as homepage (uses WebP + PNG fallback)
- SVG overlay positioned absolutely over the image (same positioning pattern as `.map-frame__image` from mobile fix)
- Existing 12 map markers visible (so users see snap targets)

### Controls panel (above or beside the map depending on viewport)

**Readout display** (always visible, wrapped in `<div aria-live="polite">` so screen readers announce updates):
```
Path: 180 km · 9 days (normal) · 6 days (fast)
Direct: 115 km
```

When the unit toggle is set to `Days`, show days values prominently and km as secondary. When set to `KM`, show km prominently and days as secondary. Pace toggle only swaps which "days" value is highlighted.

**Toggle buttons:**
- Unit: `Days` (default) | `KM`
- Pace: `Normal` (default) | `Fast` — affects the days readout only

**Action buttons:**
- `Clear` — removes all waypoints
- `Copy Link` — copies shareable URL with route encoded. On success: button label briefly swaps to "Copied!" for 1.5s, then reverts. On failure (clipboard API blocked): falls back to showing the URL in a small dismissable input for manual copy.

**Hint text:**
```
Tap to add points · Tap a marker to snap · Tap a point to remove
```

### Waypoint rendering

- Snapped waypoints: gold dot + the marker's label ("Sitio Tambis")
- Free-form waypoints: gold dot + number label ("Point 1", "Point 2")
- Path polyline: solid gold stroke (≈2px), low opacity
- Straight-line polyline: dashed cream stroke (≈1px), lower opacity
- Per-segment distance labels along the path, positioned at segment midpoint with small perpendicular offset (≈8px) to avoid overlapping the line. Labels always show km (never days — days only makes sense for totals). Hide labels when a segment is shorter than 15 rendered px to prevent crowding on short segments.

### Interaction priority (click/tap behavior)

When the user clicks/taps on the map, priority order:

1. **Remove existing waypoint:** If the click is within 20px (rendered) of an existing waypoint, remove that waypoint. (Shown on desktop via a "✕" hover hint on the waypoint dot.)
2. **Snap to marker:** Else if the click is within 30px (rendered) of one of the 12 map markers, add a waypoint snapped to that marker's canonical position, labeled with the marker's name.
3. **Free-form waypoint:** Otherwise, add a waypoint at the exact click position, labeled "Point N" where N is the sequence number.

Both hit-test radii use **rendered pixel space** — computed via `e.clientX/Y` against marker/waypoint screen positions (using `getBoundingClientRect()` on the image container). They stay constant at ~30px on both mobile and desktop; users tap/click the same visual size regardless of viewport.

---

## URL Encoding (shareable routes)

Format: `distances.html?r=<x1,y1;x2,y2;...>`

Coordinates are percentages (0-100) of the map width/height, matching the existing marker format.

- **Snapped waypoints:** use the marker's canonical position from `index.html` inline coords (e.g., Tambis = `15.9,13.3`, Lawang Kamagong = `66,70.7`; 1 decimal). Implementation reads markers at runtime from the DOM rather than hardcoding — keeps things in sync if positions are tweaked later.
- **Free-form waypoints:** encoded with 2 decimals (e.g., `42.37,58.21`)

**Example:** `distances.html?r=15.9,13.3;39.6,26.5;66,70.7`

**Limits:**
- Max 50 waypoints per route. If the URL contains more, the first 50 are parsed and the rest silently dropped.
- On malformed input (invalid numbers, missing commas, out-of-range 0-100): the bad segment is skipped, and a small "Some waypoints from the URL were invalid and skipped" notice appears at the top for 3s.
- URL length cap: with 50 waypoints at ~12 chars each, max URL is ~650 chars — well within any practical limit.

When the page loads with a `?r=` query param, JS parses it, reconstructs the waypoints, and renders the route immediately.

---

## Files Impact Summary

| File | Change |
|------|--------|
| `distances.html` | New file |
| `js/distances.js` | New file (~200 lines) |
| `css/style.css` | Add distance tool UI styles (~80-100 lines) |
| `index.html` | Add "Distances" to World dropdown |
| `characters.html` | Add "Distances" to World dropdown |
| `pc.html` | Add "Distances" to World dropdown |
| `locations.html` | Add "Distances" to World dropdown |
| `timeline.html` | Add "Distances" to World dropdown |
| `codex.html` | Add "Distances" to World dropdown |
| `bestiary.html` | Add "Distances" to World dropdown |
| `epic.html` | Add "Distances" to World dropdown |
| `chronicles.html` | Add "Distances" to World dropdown |
| `glossary.html` | Add "Distances" to World dropdown |
| `search.html` | Add to navbar + add search index entry (see below) |
| `404.html` | Add "Distances" to World dropdown |

Total: 1 new HTML page, 1 new JS file, 13 existing files modified.

### Search index entry (in `search.html` SEARCH_INDEX array)

```js
{ title: 'Distances · Mga Layo', category: 'Tool', url: 'distances.html',
  keywords: 'distance measure layo travel days route path km kilometer tool',
  excerpt: 'Measure distances between locations on the map — path, straight-line, and days of travel.' },
```

---

## Technical Approach

### SVG overlay structure

```html
<div class="distance-map">
  <picture>
    <source srcset="images/map.webp" type="image/webp">
    <img src="images/map.png" ...>
  </picture>
  <svg class="distance-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
    <!-- polylines, dots, labels rendered as % coords -->
  </svg>
  <!-- existing 12 map markers for snap targets -->
</div>
```

Using `viewBox="0 0 100 100"` with `preserveAspectRatio="none"` lets us use percentage coordinates that stretch with the image. Simpler than pixel math.

### Waypoint data model

```js
// Each waypoint is {x: 0-100, y: 0-100, snappedTo?: 'marker-id'}
var waypoints = [];
```

### Distance math

Uses fixed native map dimensions — no resize listener needed:

```js
var MAP_W = 1408;
var MAP_H = 1993;
var PX_PER_KM = 9.60;

function distanceKm(a, b) {
  var dx = (b.x - a.x) / 100 * MAP_W;
  var dy = (b.y - a.y) / 100 * MAP_H;
  return Math.sqrt(dx*dx + dy*dy) / PX_PER_KM;
}
```

Since waypoints are stored as % coords and the map image preserves aspect ratio at any rendered size, native-pixel-space math is stable across all viewports without recomputation.

### Path vs straight-line

- Path distance = sum of all segment distances
- Straight-line distance = distance from first waypoint to last waypoint

### URL encoding/decoding

```js
// Encode: snapped markers use their canonical position (1 decimal),
// free-form waypoints use 2 decimals for precision
var encoded = waypoints.map(function(w) {
  var decimals = w.snappedTo ? 1 : 2;
  return w.x.toFixed(decimals) + ',' + w.y.toFixed(decimals);
}).join(';');

// Decode with validation: skip bad segments, cap at 50 waypoints
function decodeRoute(str) {
  var segments = str.split(';').slice(0, 50);
  var result = [];
  var skipped = 0;
  segments.forEach(function(seg) {
    var parts = seg.split(',');
    if (parts.length !== 2) { skipped++; return; }
    var x = parseFloat(parts[0]);
    var y = parseFloat(parts[1]);
    if (isNaN(x) || isNaN(y) || x < 0 || x > 100 || y < 0 || y > 100) {
      skipped++;
      return;
    }
    result.push({x: x, y: y});
  });
  return {waypoints: result, skipped: skipped};
}
```

If `skipped > 0`, show a temporary notice.

---

## Out of Scope (v1)

- Named custom waypoints (free-form points are just "Point 1, 2, 3")
- Multiple saved routes with names
- Elevation/terrain speed modifiers
- Great-circle/map projection math (unnecessary at this island scale)
- Preset "classic routes" shown by default
- Drag-to-reorder waypoints
- Undo/redo history
- Pan/zoom on the map (current static overlay assumes map stays put — revisit if pan/zoom is added later)
- Keyboard-only waypoint creation (keyboard can still toggle pace/unit/clear buttons; adding points requires pointer)
- Screen-reader summary of the full SVG route (v1 covers readout via `aria-live`; richer description is v2)

---

## Success Criteria

1. **Functional:** User can click waypoints, see distances, toggle units/paces
2. **Calibrated:** Tambis ↔ Kamagong reads as 140 km (±2 km rounding tolerance)
3. **Shareable:** URL encoding works — paste a URL with `?r=` and the route renders
4. **Mobile-friendly:** Works on 360-430px widths, tap targets 44px+, no horizontal overflow
5. **Integrated:** Distances link visible under World dropdown on all 13 existing pages + new page
6. **No regressions:** All existing pages load without errors after navbar update
7. **CSS isolation:** All new CSS uses `.distance-*` class prefix — no collisions with existing rules
