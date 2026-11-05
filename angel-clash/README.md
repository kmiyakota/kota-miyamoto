# ANGEL CLASH v9.0 — 4-character HD combat animation

**Playable-source implementation completed in queue.** All 4 fighters now use 12-action (48 total) transparent high-detail WebP combat atlases cropped from the creator-approved character model boards. New sprite sheets use 400px source cells (1600×1200 per character), retain the standard fitted miniskirt suit without stockings, and integrate directly with the live fighting animation state machine and subframe interpolation. NOX is now animated, not only a static pose. Code includes a resilient original-sprite fallback.

Wix Media Manager reports all four new sprite sheets READY, totalling ~1.28 MB. 4 matchups × 10 attack types passed mock Canvas2D checks, 0 invalid image draw coordinates and 0 out-of-bounds source rectangles. The Cloudflare Pages live release and real iPhone Safari frame rate are **not independently verified**. See [HD_COMBAT_ANIMATION.md](HD_COMBAT_ANIMATION.md) for exact image URLs, pose mappings, debugging hooks and known illustration-resolution limitations.

**Outfit scope:** The user explicitly requested the BASIC fitted miniskirt suit first. The stage-themed costume variants remain portrait-only until dedicated combat atlases are ready. Ornate/frilly alternatives remain safely archived at [ART_CONCEPT_ARCHIVE.md](ART_CONCEPT_ARCHIVE.md).

---

# ANGEL CLASH v8.4 — Optimized Costume Previews

- All **5 stage-specific outfit concept portraits** now show in story, in-fight HUD and result screens using lazy-loaded stage artwork. Character identities, dark fitted miniskirt palettes and lack of stockings are preserved.
- Only one small image is downloaded per stage (~160–183 KB) instead of the original multi-megabyte concept board. Total 873 KB across all stages; images are loaded on demand and the image cache keeps two stage strips.
- PC Training: **C** changes the stage; smartphone Training: **STAGE ↻** changes the stage.
- **Live combat movement sprites remain unchanged** until matching multi-pose fitted-mini outfit sheets exist. See [STAGE_WARDROBE.md](STAGE_WARDROBE.md).
- Original ornate costumes and source boards are retained in Wix; see [ART_CONCEPT_ARCHIVE.md](ART_CONCEPT_ARCHIVE.md).
- JavaScript syntax and mock Canvas2D training/asset/keyboard/touch test passed; published deployment and device performance remain unverified.

---

# ANGEL CLASH v8.2 — Stage Wardrobe System

Stage-specific outfit selection is now implemented at the **design/mapping and optional-asset loading level**. Five stage themes are registered; stage HUD/story screen shows the outfit theme; existing artwork is preserved until actual per-stage animated sprite atlases are completed. No claim of finished stage-specific battle art. See [STAGE_WARDROBE.md](STAGE_WARDROBE.md) for canonical character details, no-stockings, dark-tone fitted miniskirts, palette, atlas format, and testing requirements. Existing ornate versions are archived in [ART_CONCEPT_ARCHIVE.md](ART_CONCEPT_ARCHIVE.md).

The v8.2 branch has passed JavaScript parse and mocked Canvas 2D QA for 20 stage/character combinations and attack sequences. **No phone/desktop browser visual performance or Cloudflare Pages deployment has been independently confirmed**.

---

# ANGEL CLASH v8.1 — Clean performance and protected costume archive

## Now implemented in the queue branch
- **Clean VFX by default**; the options menu exposes **VISUAL EFFECTS: CLEAN / CLASSIC**.
- CLEAN reduces animated background particles, attack particles, floor grid density, projectiles, aura glow, reflection blur, and cut-in speed lines. Keeps combat timing, character image resolution, and hitboxes unchanged.
- The former high-detail, frilled-costume illustrations are preserved in the user's Wix Media Manager as 8 independent PNG assets; the reference URLs and an additional composite archive design board are listed in [ART_CONCEPT_ARCHIVE.md](ART_CONCEPT_ARCHIVE.md).
- The original character profiles from [３人について](https://miyakota3.wixsite.com/my-site-1/post/about-three-new) remain authoritative for faces, hair, glasses, personalities, and ages.
- **Production target (pending artwork):** fitted miniskirt costumes with minimal frills; retain pink/blue/purple color identity, approved NOX appearance, and existing animations until replacements are verified. The actual in-game costume art has **not yet been replaced** by the new slim designs.

## Test note
JavaScript parsing and a mocked Canvas2D smoke test passed for 4 matchups including NOX, 10 attack types and the CLEAN / CLASSIC mode switch. This is **not** proof of physical iPhone Safari performance or of the live Cloudflare deployment. Test on real devices before release.

---

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
