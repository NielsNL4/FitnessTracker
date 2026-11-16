# Workout tracker surface brief

Scope: six connected mobile screens based on the supplied Stitch exports; functional app with local persistence. Mode: Operate. Global product truth is in PRODUCT.md; shared visual rules are in DESIGN.md.

## Direction contract

**THESIS:** A readable training log within the supplied cold navy glass interface, not a newly themed dashboard.

**OWN-WORLD:** Inherit the actual screen.png composition, then paired code.html values, then supporting nested DESIGN.md. Dark translucent layers, Space Grotesk/Inter, outlined SVG icons and concentrated cyan actions.

**STORY:** Plan a real workout, log it without friction, return to an unfinished session and inspect actual recorded progress. No fabricated history, account identity or recovery measurements.

**FIRST VIEWPORT:** Compact app header, Today date/greeting, seven-day tray and dominant session/start card. Active session instead places back header, session summary, current exercise/media and the beginning of the five-column set matrix above its floating rest bar. Keep mobile 16px gutters, reference control order and navigation footprint.

**FORM:** User-supplied polished references; no random direction seed or new concept round. Source directory: stitch_liquid_glass_workout_tracker. Its six screen.png files were actually opened and interpreted by the read-only designer before implementation. Capture scale/CSS viewport uncertainty is recorded in DESIGN.md. Desktop is a centered conservative adaptation.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Must-match checklist

- Four-tab capsule order and selected tint match references; no tabs on Session/Settings.
- Today retains week tray, dominant card, recovery rows and paired actions.
- Workouts retain three-stat strip, start/edit/duplicate/delete order and inline editor.
- Library retains filters, thumbnail rows and inline detailed exercise panel.
- Session retains summary → demo → set matrix → previous/next → horizontal floating timer.
- Progress retains frequency matrix → trend → history → export.
- Settings retains privacy → backup → preferences → status.
- Keep original supplied files unchanged and out of public build artifacts.

## Verification budget

Builder owns focused domain/persistence/import/timer checks, TypeScript/production build and one integrated browser scenario under a non-root base path. Include snapshot preservation, reload/resume, timer expiry without wall-clock waiting, valid backup round trip, invalid import preservation, actual history, offline reload and uncached-media fallback. Capture the reference layouts at mobile size plus one conservative desktop viewport in a single batch, with at most one confirming fix round. Temporary example records must be isolated test data, never the owner's initial state. Run Impeccable's mechanical detector once after implementation. Independent read-only review uses that evidence rather than repeating checks. Real-phone storage eviction, suspended-browser alarms and platform-specific haptics remain limitations unless directly tested.
