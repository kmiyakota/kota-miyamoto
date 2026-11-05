# ANGEL CLASH v7 — Fluid Character Animation

Playable entry: /angel-clash/index.html over HTTP(S). Pure Canvas2D; no runtime dependency or external CDN.

## Changes in v7
- Visual-only sub-frame position interpolation between fixed 60 Hz physics steps, improving motion on high-refresh screens without moving hitboxes or changing input timing.
- Per-character secondary-motion rig: idle breathing, fluid walk cycle, gradual crouch/guard changes, air stretch, landing compression, and attack anticipation/follow-through.
- Replaced the old two-piece walking image cut with a smooth multi-band deformation that uses the original complete artwork. On touch devices, 12 bands keep the workload lower; desktop uses 16.
- Short, subtle sprite-frame crossfades reduce abrupt pose changes while retaining a crisp primary character silhouette.
- All 3 playable fighters (ITO, AKARI, TAMAKI) and NOX use interpolated screen positions. Cinematic sprites remain aspect-preserved and are only shown after successful image loading.
- No changes to move frame data, collision/hitboxes, combat inputs, stages, or HORIZON RUSH.

## QA checklist
1. Open /angel-clash/ on desktop Chrome and iPhone Safari in landscape.
2. Start Training with ITO, AKARI, and TAMAKI in turn. Verify breathing, walking, turning, crouch, jump/land, punch, kick, special, cinematic and super transitions. Check the hitboxes with H on desktop.
3. On iPhone, test four-button and six-button touch layouts, rotations, pause/resume, and frame pacing.
4. AngelClashDebug.assetStatus() should report 16 assets, all ready.
5. AngelClashDebug.animationState() exposes current visual-only blend values to help diagnose transitions.

## Automated checks completed
- JavaScript syntax parse passed.
- Mock Canvas 2D simulation exercised four fighter combinations and attack sequences without rendering exceptions.
- Physical iPhone Safari and Cloudflare Pages deployment remain unverified.

---

# ANGEL CLASH v6 — Mobile & Graphics

The playable entry is `index.html` under `/angel-clash/`. Open through HTTP(S). No runtime dependencies or external CDN.

## Changes from v5
- Migrated 16 graphics from base64 JavaScript packs to separately cacheable binary JPEG/WebP assets.
- Corrected WebP content previously named .png to accurate .webp filenames, improving MIME compatibility on Safari.
- Added asset loading progress and fallback, plus landscape orientation advice on phones.
- Added high-resolution special attack light effects without distorting original art or changing collisions.
- Preserved the old `v5-assets/` packs for rollback only; they are no longer downloaded at runtime.
- Unrelated sites, including HORIZON RUSH, were not changed.

## QA
1. Open `/angel-clash/` in desktop Chrome and iPhone 13 mini Safari, preferably landscape.
2. In desktop devtools: `AngelClashDebug.assetStatus()` should report `total:16, ready:16, failed:0`.
3. Check ITO, AKARI and TAMAKI sprites/portraits, NOX boss, all five stage backgrounds and cinematic cut-ins.
4. Test Arcade / VS CPU / Training, pause, four/six-button touch controls and screen rotation.

Audio files are optional. No analytics or trackers have been added.
