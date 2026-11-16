# Workout Tracker

A Dutch, personal, local-first workout log built with React, TypeScript and Vite. The six supplied Stitch screens define its visual system; see `PRODUCT.md`, `DESIGN.md` and `.impeccable/briefs/workout-tracker.md`.

## Run

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview -- --host 127.0.0.1 --port 4177 --strictPort --base /fitness/
```

Open `http://127.0.0.1:4177/fitness/` for the production/non-root preview. Port 4177 must be free, or choose another port. The test runner uses the esbuild already installed with Vite and Node's built-in test runner (this environment's Node binary lacks native TypeScript stripping).

## Static hosting

The default Vite base is **`./`**. Copy **only the contents of `dist/`** to the hosting site's `/fitness/` directory (or a GitHub Pages project site's root). No root-absolute asset paths, server rewrite, router backend or environment secrets are required. Navigation uses hashes, e.g. `/fitness/#trainingen`. Keep the trailing slash on the app directory. The generated service worker is `/fitness/sw.js`, scoped to `/fitness/`. Serve over HTTPS, or localhost for development. Do not copy the repository root, Stitch exports, `.impeccable/`, backups or screenshots into the published directory.

### GitHub Pages

Set the repository's **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. `.github/workflows/deploy.yml` automatically deploys pushes to `main` and can also be started manually from the Actions tab. It uses Node.js 22, `npm ci` and `npm run build`, uploading **only `dist/`** with the standard `GITHUB_TOKEN` and OIDC; no custom PAT or deployment secrets are needed.

The expected URL after a successful deployment is **https://nielsnl4.github.io/FitnessTracker/** (case-sensitive path, trailing slash required). Relative assets, hash navigation and service-worker registration use that project directory without a separate base override. Workflow configuration alone does not confirm publication; check the Actions deployment result and live URL.

`npm run build` typechecks, builds, then generates a fingerprinted offline-shell cache containing local JS/CSS/fonts/catalog/notices. Standard installs/builds use the prepared catalog and do **not** contact upstream. Fonts are self-hosted. No runtime Tailwind or font/icon CDN is used.

Runtime library and font licenses are copied from the installed packages to `dist/licenses/` during shell generation. Keep that directory in static deployments.

## What works

- Personal template create/edit/duplicate/delete, goals, equipment, accessible ordering and configurable strength/time/distance/completion slots. Three optional, labeled example templates do not create history.
- All 1,324 source exercises, muscle/equipment filters, English instructions, inline details and alternatives. Nearby editor GIFs auto-play unless motion is reduced; Library and Session keep manual playback. Failure keeps editing/instructions/logging available.
- One durable active session. Blank measurements remain blank. Previous values require compatible exercise/mode/unit and are copied without marking a set complete. Replacement retains completed results on the original exercise snapshot. Finishing retains the same session ID and cannot duplicate history.
- Deadline-based rest timers (pause/resume/+30/skip/configure), local-date scheduling and rest days, factual last-trained muscle rows, actual history and compatible-metric trends with a readable values table.
- JSON export/import includes templates, preferences, scheduling, history and the active session/timer. Import validates before showing an explicit **VERVANGEN** confirmation. No merge or automatic reset.

## Data integrity and privacy

IndexedDB is authoritative (`workout-tracker`, database version 1, document schema version 1). User data never goes to a backend. Writes are serialized and committed transactionally. Monotonic revisions reject stale-tab writes; BroadcastChannel and focus checks warn about other tabs. Failed commits keep the visible draft and expose a draft export plus an explicit latest-data reload. Nothing claims to be saved before the transaction commits. Invalid/incompatible/corrupt storage is not silently reset.

Templates and history are independent: deleting a template does not delete session snapshots. Imported objects are strict, with ID uniqueness, catalog references, date/metric validation, finite values and collection limits. Import maximum is 10 MiB, 500 templates, 5,000 completed sessions, 100 slots/template, 200 entries/session, 100 sets/entry and 3,660 scheduled dates. Future schema versions are rejected. IDs and original names are strings. Historical kg/lb are never silently converted; new default units only apply to new sessions. Backup files contain no catalog, media payloads or cache. Arbitrary imported media URLs are not accepted or rendered.

New session entries separately snapshot planned sets/reps/time/distance in an optional `plan` field; actual measurement inputs still start blank. Schema-v1 backups without this field remain valid and show “doel niet vastgelegd” rather than inferring a prescription from a changed template. Replacing an exercise preserves the original plan/results and retains only the slot's intended set count for the alternative; numeric targets are explicitly unset because no prescription for that alternative was supplied. History volume is displayed in the recorded unit, with separate kg/lb totals for mixed-unit records and a dash when no strength volume applies.

Media comes only from trusted, commit-pinned upstream paths. The service worker caches at most 40 requested media files, not the GIF repository. Media requests reveal ordinary network request metadata to that upstream host. Shell, catalog, saved templates, logging and resuming work offline after a successful initial online installation; uncached demonstrations/thumbnails need internet and have a fallback.

Images use anonymous CORS requests (the pinned raw GitHub host allows `Access-Control-Allow-Origin: *`) so successful, readable responses actually enter the service-worker media cache rather than remaining opaque. Cache writes/pruning are serialized; the media cache is scoped to the app registration path and restricted to the exact trusted commit's image/video filenames, with no query parameters.

Browser clearing/eviction can remove data. Requesting persistent storage is optional and not a guarantee. Make private backups. Sound/vibration and browser-closed alarms are not guaranteed; deadline arithmetic remains correct when the app resumes. There is no account, synchronization, GPT, calorie model or medical recovery estimate. JSON backups are not encrypted.

## Catalog provenance

Source: [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset), pinned revision **7455efae41b330c265e7cd4b78dfa848e7ce5ebd**. `public/catalog.json` is the reproducible English-field extraction; regenerate only deliberately:

```sh
npm run catalog
```

The preparation script downloads the source JSON and notices, not the media repository. All 1,324 exercises retain original IDs, English instruction steps, equipment/muscle metadata, media references and attribution. Upstream thumbnails are used as posters; no unrelated stock images or supplied screenshots are shipped. GIFs/images are © Gym visual; the dataset's text MIT license does **not** relicense them. User permission for GIF use was explicitly confirmed. Original upstream `LICENSE` and `NOTICE.md`, plus extraction provenance, ship in `public/dataset/`.

## Evidence

Builder's scoped domain tests live in `tests/domain.test.ts`. Private, ignored browser scripts/results and the six-screen mobile/desktop captures are in `.impeccable/review/`. Synthetic records are explicitly `TEST · …`, created only in isolated test browser contexts, never startup fixtures or production defaults. See `.impeccable/implementation.md` for exact results and limitations. Independent review is owned by the coordinator, not a nested builder reviewer.
# Planned weight compatibility

Optional weight targets in schema-v1 templates and session plans retain their own kg/lb unit; they never prefill logged results. Older backups remain valid without invented targets. Backups containing these new fields require this app version or later (older strict readers reject them).
