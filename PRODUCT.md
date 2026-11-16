# Personal workout tracker

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + TypeScript with Vite, explicitly selected by the user. Static deployment on GitHub Pages; no backend. Publishing is not authorized by the current implementation request.

## Users

The owner, tracking personal training primarily on a mobile phone.

## Product Purpose

Create workouts, follow them during exercise, and understand actual recorded progress in a clear personal tracker.

## Operating Context

Mobile browser, including interrupted sessions and offline use after an initial online load. All personal training data persists only in this browser on this device. Export/import provides manual backups, not synchronization.

## Capabilities and Constraints

- Create, edit, duplicate and delete workout templates; select goals and available equipment.
- Exercise library based on hasaneyldrm/exercises-dataset, with search, equipment/muscle filters, instructions and GIF demonstrations. The user explicitly confirmed permission to use the GIFs. Retain upstream attribution and notices; do not assert the media is MIT-licensed.
- Goals: muscle growth, strength, conditioning, general fitness and mobility.
- Log sets, repetitions and weight; duration/distance; or completion without measurements. Complete a whole workout.
- Bring forward previous values without pretending they are new completed results.
- Replace exercises; retain the identity and measurements of results already recorded.
- Adjustable rest timer between sets; date-based weekly scheduling and rest days.
- Factual last-trained muscle-group information, not medical recovery claims.
- Actual history and exercise-specific progress charts with compatible units.
- Locally saved unfinished sessions and resume after reload.
- Validated JSON backup export/import with explicit replacement confirmation.
- Offline shell, exercise catalog and logging; uncached external GIFs may require internet and must never block logging.
- No GPT integration in this phase. No login, cloud sync, subscriptions or social features.
- Clearing browser data or browser eviction can remove local records. Browser-closed alarms are not guaranteed.
- Dataset exercise names/instructions may be English; do not claim a Dutch translation exists. Application controls and explanations are Dutch.

## Brand Commitments

The user supplied the six Stitch screens in `stitch_liquid_glass_workout_tracker/` and requested Impeccable and matching design documentation. Those references fix the visual direction. Preserve the supplied files unchanged. Root `DESIGN.md` documents the implemented common system; the nested export's `DESIGN.md` remains source evidence, not a file to overwrite.

## Evidence on Hand

Six `screen.png` images, their paired `code.html` files, and a nested design specification. No real personal training history, profile identity, records or recovery measurements were supplied. Reference dates, charts and achievements are illustrative, not user data. Example templates must be labeled as examples.

## Product Principles

1. Workout logging stays legible, fast and usable without a network.
2. Persist completed writes honestly; never silently reset failed or incompatible storage.
3. Historical exercise snapshots survive template changes.
4. Empty and incomplete data are represented honestly.
5. Import failure must leave existing training data intact.
