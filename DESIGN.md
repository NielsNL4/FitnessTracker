---
name: Liquid Glass Workout Tracker
description: A focused Dutch personal workout tracker in dark navy glass and icy cyan.
colors:
  canvas: '#0d1320'
  canvas-session: '#0b111e'
  well: '#080e1b'
  surface-low: '#161b29'
  surface: '#1a1f2d'
  surface-raised: '#242a38'
  surface-highest: '#2f3543'
  text: '#dde2f5'
  text-strong: '#f1f5f9'
  text-secondary: '#bdc8d1'
  text-muted: '#94a3b8'
  accent: '#8ed5ff'
  action: '#38bdf8'
  action-blue: '#3198dc'
  action-deep: '#0284c7'
  on-action: '#00354a'
  error: '#ffb4ab'
  error-surface: '#93000a'
typography:
  headline:
    fontFamily: 'Space Grotesk, sans-serif'
    fontSize: '24px'
    fontWeight: 700
    lineHeight: '32px'
  title:
    fontFamily: 'Space Grotesk, sans-serif'
    fontSize: '20px'
    fontWeight: 600
    lineHeight: '28px'
  body:
    fontFamily: 'Inter, sans-serif'
    fontSize: '14px'
    fontWeight: 400
    lineHeight: '22px'
  secondary:
    fontFamily: 'Inter, sans-serif'
    fontSize: '14px'
    fontWeight: 400
    lineHeight: '20px'
  label:
    fontFamily: 'Space Grotesk, sans-serif'
    fontSize: '12px'
    fontWeight: 600
    lineHeight: '16px'
  micro:
    fontFamily: 'Space Grotesk, sans-serif'
    fontSize: '10px'
    fontWeight: 600
    lineHeight: '15px'
  metric:
    fontFamily: 'Space Grotesk, sans-serif'
    fontSize: '27px'
    fontWeight: 600
    lineHeight: '38px'
rounded:
  field: '8px'
  inset: '12px'
  card: '16px'
  card-large: '24px'
  capsule: '999px'
  session: '1px'
  media: '14px'
spacing:
  xs: '4px'
  sm: '8px'
  md: '16px'
  lg: '24px'
  xl: '32px'
components:
  button-primary:
    backgroundColor: '{colors.action}'
    textColor: '{colors.on-action}'
    rounded: '{rounded.capsule}'
    height: '52px'
  input:
    backgroundColor: '{colors.well}'
    textColor: '{colors.text-strong}'
    rounded: '{rounded.field}'
    height: '44px'
---

# Design System: Liquid Glass Workout Tracker

## Overview

**Creative North Star: "Cold precision, clear training."**

This is an established visual world extracted from the user-supplied Stitch screenshots and their HTML, not a fresh theme selection. The screenshots govern composition and material; paired HTML supplies supporting dimensions, font identities and colors. The exported nested design document is secondary where it contradicts a screenshot.

**Key characteristics:** blue-black canvas; restrained frosted panels; icy high-contrast text; cyan operational emphasis; compact mobile single-column screens. This is an Operate interface, not a promotional dashboard.

## Colors

Canvas, inset wells and raised surfaces create the structural layers. Today and active-session screens use the slightly darker session canvas. Accent text is icy blue; cyan marks primary actions, selected dates, completed sets and the rest timer. Deep blue supports gradients without creating a separate color theme. Error colors are reserved for real failures and destructive warnings.

**The Evidence Rule.** Reference statistics and recovery colors are not evidence of the owner's achievements or physiology. Keep their visual slots, but populate them only with real records or honest empty states.

## Typography

Space Grotesk carries headings, controls and tabular metrics. Inter carries explanations, instructions and supporting metadata. Self-host both for offline use. The supplied design deliberately uses these faces; do not substitute a new font direction.

Header titles are compact, approximately 18–20px. Most section headings are 20–24px. Dense metadata is 12px; navigation may use 10–12px. The selected exercise title may reach 32px when space allows. Use tabular numerals for timers and logs. Retain the reference's small uppercase cyan labels where shown rather than inventing more of them.

The implementation uses a 14px Inter base with 12px supporting copy; explicit dense labels run 9–11px in source-derived navigation, source attribution and matrix headers. The greeting is 25px, selected library title 30px and compact session title 24px. These per-region sizes intentionally preserve the varying reference densities rather than impose a new uniform type ramp.

## Layout

Mobile single column with 16px side gutters, a roughly 64px header and 4/8/16/24px spacing rhythm. Fixed elements must respect device safe areas and reserve content space. Preserve screen-specific order:

- Today: greeting → seven-day tray → primary session/start card → factual muscle history → paired quick actions.
- Workouts: heading/new action → weekly summary → personal/example tabs → workout cards → inline editor.
- Exercises: search → muscle/equipment chips → result rows → inline selected-exercise detail.
- Session: summary → current exercise/demo → work-set matrix → previous/next controls → floating horizontal timer.
- Progress: period selector → training-frequency matrix → exercise trend → recent history → export action.
- Settings: privacy → export/import → preferences → app information.

Desktop conservatively centers the same narrow app structure. Do not introduce an unshown sidebar or dashboard grid. Source screenshots use differing capture scales; their exact CSS viewport widths/DPR are unknown. Compare named regions and proportions, not full-page height or fabricated pixel coordinates.

The shipped shell caps at 520px, with the floating controls capped at 488px. At 760px and above, the same column gains conservative numeric spacing; below 360px, only compact control spacing changes. The sticky 64px header, reserved bottom padding and safe-area insets keep content scrollable around fixed controls. Full-page evidence captures place fixed controls at the captured viewport edge, not at the document's final pixel.

## Elevation & Depth

Use dark translucent panels, subtle pale/cyan 1px edges, restrained black drop shadows and 16–24px background blur. The source combines tonal layering with real shadows; do not reduce it to flat blocks or bright transparent glass. Restrained cyan illumination is concentrated on primary controls and the timer. Numeric inputs remain readable over mostly opaque wells. Supply an opaque fallback without backdrop-filter support.

Implemented panel shadow: `0 8px 28px rgba(0,0,0,.25)`; floating navigation: `0 10px 30px rgba(0,0,0,.5)`. The alpha navy wells, edge mixtures, lighter focus/hover tints and error mixtures are extensions of the normative palette, not additional semantic accents. See `.impeccable/design.json` for extension-only shadow, motion and component samples.

## Shapes

Cards are softly rounded, with larger radii for Today/detail regions and full capsules for navigation and major CTAs. The active session is intentionally more rectangular: compact outer panels, tabular rows and previous/next controls. Do not round every session element into pills. Visible check controls may be small, but hit areas must remain usable without overlap.

## Components

### Navigation and headers

Four tabs in the exact order **Vandaag / Trainingen / Oefeningen / Voortgang**. The bottom bar is a floating glass capsule; the selected tab has a tinted inner capsule and cyan icon/text. Stack screens Settings and Session have a back header and no tab bar; Session instead has its timer bar. Keep the workout icon and title grouping. Replace broken reference avatar images with a neutral local-person glyph in the same footprint; there is no account feature.

### Workout cards and editor

Retain the three-stat strip and Starten/edit/duplicate/delete action order. The workout editor stays inline, with goals and equipment chips, ordered exercises and a full-width save action. Provide accessible up/down controls in addition to any drag affordance.

### Exercise details

Filters precede the list; selecting a result opens the large inline detail panel. Use approved dataset media rather than reference stock photographs. Preserve media dimensions on failure. GIF playback is deliberate, not autoplay across the library. Numbered steps and alternative chips use the same cyan vocabulary.

### Session matrix and timer

Strength columns are Set / Vorige / kg / Reps / Klaar. Completed rows have filled blue checks; the active row has a cyan outline; future rows are muted but editable. Do not reproduce the export's overlapping numeric steppers. Other tracking modes replace only the measurement fields, not the screen hierarchy. The floating rest bar has a horizontal progress strip, countdown, duration adjustment and +30s/pause/skip controls—not the circular gauge suggested by the nested prose.

### Inputs, dialogs and feedback

Fields have dark inset surfaces, explicit labels and visible cyan focus rings. Use compact styled dialogs for destructive confirmations, backup preview and timer editing; contain focus and restore it on close. Preserve typed values on validation errors. Never display a permanent example import error or claim saving succeeded before persistence completes.

### Charts and empty states

Use subtle grids and icy-blue lines/markers with equivalent readable values. Keep measurements and units distinct. Show empty history/trend states until real records exist. Example workouts are labeled; they do not create fake completed sessions. Recovery slots show last-trained dates or elapsed days rather than physiological certainty.

The implemented trend displays the actual maximum logged weight, time or distance per session, or the number of completed sets for completion-only tracking. It never estimates 1RM. Single observations show a marker without an invented trend area. Frequency and last-trained regions derive only from recorded sessions/sets. Dataset thumbnails replace the reference's unlicensed illustrative photos; they come from the same pinned source as the deliberately played GIFs and preserve a fixed media footprint on failure. The neutral workout glyph fills the Today artwork slot when there is no workout-specific image. There are no shipping raster files from the private references.

## Do's and Don'ts

- **Do** preserve the supplied six screen structures, control placement and visual hierarchy.
- **Do** provide keyboard access, readable contrast, reduced-motion support, safe-area spacing and non-blur fallback.
- **Do** use local fonts and bundled SVG icons consistent with the outlined reference icons.
- **Do** keep missing media and network failure separate from workout logging.
- **Don't** copy broken avatars, clipped titles, overlapping inputs, disabled browser zoom or placeholder charts as intentional design.
- **Don't** add GPT, accounts, cloud sync, estimated recovery guarantees or an unrelated desktop redesign.
- **Don't** package private reference screenshots/exports into the public app build.
