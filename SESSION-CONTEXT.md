# Isla ng Salong-Salong: Session Context
**Project:** Static D&D lore site at `C:\Users\USER\Documents\GitHub\salong-salong\`
**Live URL:** https://allonsyalfonso.github.io/salong-salong/
**Stack:** Plain HTML / CSS / JS, no build system, no framework
**Last updated:** 2026-08-06 (post-restructure: classes.html exists, codex is Races/Backgrounds/Feats)

---

## What This Site Is

A static GitHub Pages site for a Filipino pre-colonial D&D campaign world called **Isla ng Salong-Salong**, run by **DM Avips**. Two campaigns:
- **Isla ng Salong-Salong**: main campaign, 1+ year, now completed
- **Isla ng Salong-Salong: Mga Nawawalang Salaysay**: active mini-campaign

---

## File Structure

```
salong-salong/
├── index.html          ← Homepage: hero, map, about, nav cards
├── characters.html     ← NPC cards (Alive / Missing / Fallen)
├── pc.html             ← Player character cards (Survived / Transformed / Fallen)
├── locations.html      ← Location detail pages
├── timeline.html       ← Era-based history timeline
├── bestiary.html       ← Creatures (Creatures / Spirits / Elementals / Demons)
├── distances.html      ← Travel-time tool
├── calendar.html       ← In-world calendar
├── codex.html          ← GENERATED. Tabbed: Races / Backgrounds / Feats (32 cards)
├── classes.html        ← GENERATED. All 14 classes with 20-level tables
├── equipment.html      ← GENERATED. Armory, 108 items in 8 sections
├── spells.html         ← GENERATED. 24 homebrew spells, by level
├── chronicles.html     ← Letters/final words
├── epic.html           ← Full campaign story
├── glossary.html       ← Term definitions
├── search.html         ← Site search (hardcoded index, see below)
├── 404.html
├── css/style.css       ← Single stylesheet for entire site
└── js/
    ├── dm.js           ← Scroll-reveal, parallax, ember canvas, DM modal logic
    └── distances.js    ← Distance tool logic
```

17 pages. `backgrounds.html` and `feats.html` were absorbed into codex.html
and DELETED in the 2026-08-06 restructure; do not recreate them. The four
pages marked GENERATED are built by scripts, not hand-edited. See "Generated
pages" below before touching them.

## Nav structure (since the restructure)

```
World:  Locations, History, Bestiary, Distances
Rules:  Codex, Classes, Equipment, Spells
People: Characters, Heroes
Lore:   Epic, Chronicles, Glossary, Calendar
```

Codex moved from the World menu to Rules. If a page is ever added to the
Rules dropdown, BOTH shell templates must be updated (see Generated pages).

---

## Key CSS Variables (in style.css)

```css
--bg-dark:      #c98010   /* amber, main page bg / section backgrounds */
--bg-surface:   #1c0800   /* dark chocolate, dark sections */
--gold:         #c8920e
--gold-light:   #e8a820
--gold-bright:  #f5c840
--text-dark:    #1a0600   /* near-black, default body text */
--text-light:   #f2d898   /* cream, text on dark sections */
--text-muted:   #7a3a08
--font-display: /* display/heading font */
--font-body:    /* body font */
--radius:       /* border-radius token */
```

> ⚠️ **Critical gotcha:** Default `body { color: var(--text-dark) }` = near-black.
> Any dark section without an explicit `color` override will have invisible text.
> Always add `color: var(--text-light)` as base on dark section wrappers.

---

## Map Markers: Current Positions (index.html)

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

None outstanding. (The Map Marker Toggle Button that sat here from 2026-03-30
was in fact built and shipped; it is live in index.html and style.css under
`.map-toggle-markers`. It stayed listed as pending for four months because this
file was not updated. Do not re-implement it.)

---

## characters.html: Structure

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

## pc.html: Structure

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
.status-badge--transformed  /* "Gabunan", purple: bg #1a0a3d, color #b08cff */
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
6. Timeline era chip (`#timeline-era-chip`, fixed bottom pill, scroll-spy)
7. Keyboard navigation on codex.html tabs (Arrow/Home/End keys)
8. `.npc-location-tag` styled tags on character cards
9. About section on index.html homepage
10. Section label contrast fix (`.npc-section-label`, was gold-on-amber = invisible)

---

## About Section (index.html): Key CSS Notes

The about section has class `about-world dark-section`.

**Critical rule, must stay:**
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

## dm.js: What It Does (do not modify unless intentional)

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


---

## Generated pages (updated 2026-08-06)

Four pages are built by scripts: codex.html, classes.html, equipment.html,
spells.html. Editing their HTML directly works until someone re-runs the
generator, at which point the edit is silently overwritten. Change the
generator instead.

Generators live OUTSIDE this repo, in the source folder:
`C:\Users\USER\Documents\Claude Code\isla-ng-salong-salong-claude-code-files\tools\`

| Script | Produces | Reads |
|---|---|---|
| build_equipment.py | equipment.html | `_export/` + equipment_shell.html |
| build_classes.py | classes.html | `_panels/classes12.json`, featpages.json, druid_ws.json, `_panels/*.html`, rules_shell.html |
| build_rules_pages.py | spells.html + `_panels/feats_frag.html` | `_export/spells.json` |
| build_backgrounds.py | `_panels/backgrounds_frag.html` | `_export/backgrounds.json` |
| build_codex.py | codex.html | `_panels/races.html` + the two fragments |
| parse_handoff5.py | `_panels/classes12.json` | handoff #5 (pipe-delimited, authoritative) |
| parse_handoff7.py | `_panels/featpages.json`, `_panels/druid_ws.json` | handoff #7 |

**Build order matters:** run build_backgrounds.py and build_rules_pages.py
BEFORE build_codex.py, because codex consumes their fragments.

They read the Sina Una export at
`C:\Users\USER\Documents\Claude Code\sina-una-character-sheet\_export\`
which is 15 JSON files plus index.json, machine-generated from the homebrew
pub file by the rules session.

Two shell templates exist: equipment_shell.html and rules_shell.html. If you
add a page to the Rules dropdown, update BOTH, or the next regeneration drops
the new link from the generated pages.

---

## COPYRIGHT RULE, do not break this

The export contains the full official 2024 Player's Handbook alongside the
Sina Una homebrew: 415 spells, 71 feats, 85 gear items, 150 creatures, 14
classes. Only the Sina Una half is ours to publish. Republishing the WotC half
on a public site is copyright infringement.

**The gate is `isSinaUna == true`,** applied at load time in each generator's
`su()` helper so it cannot be forgotten section by section.

**Backgrounds are the one deliberate exception.** The 12 localized backgrounds
(Timawa, Maginoo, Alagad and the rest) have `isSinaUna: false`, because they
ARE the PHB entries under island names. We still publish them, but only:

- island name, English name in brackets, flavor prose, origin feat
- a line stating the mechanics match the standard background, with a page ref

We do NOT print their ability scores, skills, tools, equipment or gold. The 6
island backgrounds (Lorechanter, Mangangalakal, Panday, Sea Raider, Voyager,
Aswang Lineage) are sourced to the Sina Una book and ARE published in full.

If someone ever "fixes" build_backgrounds.py to filter on isSinaUna like the
other generators, all 12 localized backgrounds vanish from the codex. That is
why it is different. The reason is documented at the top of that script.

**classes.html and WotC prose:** the 12 standard classes publish MECHANICS
only: hit dice, proficiencies, level/proficiency tables, class-specific
columns, feature NAMES by level, and page citations. Never feature prose.
This was requested three times (personal-use framing, copy from 5etools,
relabel as SRD) and correctly declined each time. The 12 class descriptions
are original text written by the website session and reviewed by the rules
session. Warlock's Pact Magic slot columns are permanently dropped with a
visible note (the sheet stores them as an interpreted token, not a table).

---

## search.html has a hardcoded index

`SEARCH_INDEX` is a literal JS array inside search.html, currently 195 entries.
New content is invisible to search unless an entry is added there, and it fails
silently.

Two hard-won rules:

1. **Generate entries with `json.dumps`, never hand-rolled quoting.** On
   2026-08-05 one unescaped apostrophe in "the wearer's identity" was a JS
   syntax error that killed the whole SEARCH_INDEX block, breaking search
   across the entire site rather than just the new page. Nothing errored
   visibly; results simply came back empty.
2. Categories in use: Lugar, Karakter, Magani, Lahi, Klase, Kodeks, Bestiaryo,
   Epiko, Kasaysayan, Kalendaryo, Salita, Kagamitan (equipment), Alituntunin
   (feats, spells, backgrounds).

---

## Line endings

`index.html` is CRLF. Every other file is LF. Any script that rewrites files in
bulk must preserve per-file line endings, or index.html produces a ~980 line
phantom diff that buries the real change. Read as bytes, test for `\r\n`,
write back in the same convention.

---

## Working with the rules session

The homebrew rules live in a separate Claude Code session working in
`sina-una-character-sheet`. It owns mechanics; this repo owns presentation.
Handoffs arrive as .txt files in the source folder.

Verify before applying. On 2026-08-05, four separate assertions from that
session proved wrong: that a card already showed the Brave trait (it never
did), a quoted string from our codex that exists nowhere in this repo's git
history, that feats were safe to parse from the export (the text is
malformed), and that no background carried a description field (all 18 did).
Each was caught by checking the actual files first. They have since agreed to
quote a line number or mark a claim unverified.

**The diff target is `codex.html` in this repo.** The old sina-una-races.txt
and sina-una-classes.txt in the source folder are an April 2026 summary index,
not an extract of this site. Historical only.

**Field authority**, as of 2026-08-05:

| Content | Source |
|---|---|
| Races, classes, subclasses | handoff prose (no prose field exists in the export) |
| Feats | handoff prose for the body, export for prerequisites |
| Spells, magic items | export `descriptionFull` |
| Backgrounds | export `description` (NOT `descriptionFull`, which is empty) |
| Equipment stats | export, authoritative |
| Level scaling tables | ASK. The `additional` field is not exported. 8 features affected. |

---

## Current content counts (verified 2026-08-06 against the files)

- codex.html: 32 cards in 3 tabs (9 races, 18 backgrounds, 5 feats)
- classes.html: 14 classes (12 standard + Babaylan + Headhunter), all with
  20-level tables; the 12 standard also have descriptions, per-level feature
  lists and page citations
- equipment.html: 108 items (28 weapons, 9 armor and shields, 3 ammunition,
  23 gear, 12 tools, 5 poisons, 25 magic items, 3 artifacts)
- spells.html: 24 across 10 levels
- glossary.html: 39 terms
- search.html: 195 index entries

Panel intro strings on codex.html hardcode their counts ("The nine playable
races", "Six backgrounds original to Sina Una", "Twelve standard backgrounds",
"Five feats unique to Sina Una"). Update that prose if the counts change.

---

## GitHub Pages deploy note (2026-08-06)

Deploys use GitHub's built-in "pages build and deployment" workflow, Source =
Deploy from a branch, main, / (root). There is no workflow file in the repo.
On 2026-08-06 two consecutive deploys reported failure with "Timeout reached,
aborting!" because GitHub's backend took ~14 minutes against the workflow's
10-minute wait; the deployment then landed anyway a few minutes after the
"failure". If a deploy shows a plain timeout failure, check the live site
(hard-refresh, or curl with a cache-buster) a few minutes later before
escalating. Repo size and content were verified irrelevant.
