# ANGEL CLASH v9.6 — Identity-safe HD images and tested rendering (2026-11-06)

**Implemented on the `queue` branch.** This update keeps established character faces/outfits consistent across the runtime UI and blocks obsolete promotional imagery from coming back if HD image loading fails.

- In-fight HUD, large cut-ins, result and story screens load the approved solo HD artwork first. Large cut-ins never enlarge a cropped four-person compressed JPEG.
- Removed loading of the old `original-characters.jpg` and low-resolution `portraits/*.webp` that are not used by the live renderer and can show rejected previous appearances. Their files remain in the repository for historical purposes; they are no longer loaded into gameplay.
- When a character's HD artwork is unavailable, the fallback is a crisp character-name vector emblem instead of inventing or resurfacing a rejected face.
- The 12-pose original combat atlases still use one source-locked uniform scale; the experimental alpha-cleanup attempts to preserve thin hair strands, and any CORS failure leaves original art unchanged.

**Automated verification:** `node angel-clash/tests/asset-integrity.test.cjs` — 8/8 source consistency checks passed in simulated execution. Mock Canvas2D test: all 12 ordered fighter pairings passed in both simulated HD-asset and fallback modes; **540 total draw calls / 216 atlas calls / 0 invalid coordinate errors** with HD, **108 draw calls / 0 errors** in fallback. No claim is made about the physical browser or current Cloudflare production build.

**Remaining source-illustration defects:** AKARI's white/blank idle iris and other pixel/pose anatomy defects cannot be repaired by runtime cropping or color cleanup alone; the originating 1600×1200 sprite master must be retouched and the revised atlas visually checked. Rejected v10 promotional concepts remain unapproved and unused. The source/alpha inspection page is [sprite-audit.html](sprite-audit.html), including a local PNG/WebP loader for CORS-free review.

---

# ANGEL CLASH v9.5 — Character source lock & visual regression QA (2026-11-06)

**GitHub queue branch only; production deployment is not independently verified.** Previous generated v10 poster variants were repeatedly wrong (swapped character identities and proportions) and are explicitly rejected. **No v10 release is being claimed.**

### Implementation
- v9.4 undoes an unsafe v9.3 automatic per-pose head normalization. An inspection of a 12-pose candidate sheet showed the heuristic misidentifying punching arms and kicks as head width, giving highly inconsistent factors of 0.86–1.14. The runtime draws each source tile intact from one fixed center/bottom canvas layout instead.
- v9.5 uses one character size factor for ITO, AKARI, TAMAKI, and NOX until validated source geometry can replace it. No stretching, squashing or hair-length reassignment.
- Old rejected blond ITO portraits are no longer used as runtime fallbacks. Large portraits prefer the independently stored high-resolution solo images; if unavailable, they display a sharp identity-safe vector card. A cropped 920×552 four-person concept strip is never enlarged for a large cut-in.
- Conservative alpha cleanup now preserves thinner hair details. It still requires CDN CORS readback and does **not** fix the incorrectly painted AKARI idle eye. No generated replacement atlas has been published.
- New [sprite-audit.html](sprite-audit.html) provides per-character 12-frame views, fixed-ratio side-by-side comparison with idle, light/dark/checker backgrounds, zoom, pixel-alpha measurement when CORS allows, comparison with source-profile references, and local PNG/WebP import. Local files are handled in the browser only.

### Regression checks executed
- JavaScript parsed successfully after each source update.
- Headless Canvas2D mock: 12 of 12 ITO/AKARI/TAMAKI/NOX pairings, 8 attempted move types per match, **540 total draw calls**, **216 source-atlas draw calls** with **0 invalid coordinates/rectangle bounds** and **0 exceptions**. These are structural smoke tests, not pixel-level visual approval or actual Safari performance tests.
- `AngelClashDebug.spriteIntegrity()` reports cleanup availability and estimates; head metrics remain **diagnostics only**, never runtime pose scaling.
- Visual source master QA and original art repainting remain incomplete. In particular AKARI's incorrect iris requires a new approved source frame. Avoid marking all 48 poses as visually corrected.

### Canon
See [CHARACTER_CANON.md](CHARACTER_CANON.md) for protected identities. In short: ITO long light-brown hair, AKARI dark short bob, TAMAKI dark short hair and glasses, NOX silver hair with wings. Do not use mistaken v10 generated promotional imagery as character reference.

---

# ANGEL CLASH v9.3 — Sprite integrity pass (2026-11-06)

**Committed in `queue` — not yet confirmed deployed.** This is a **non-destructive rendering and transparency repair pass**, not a claim that all original illustrations have been manually repainted. The original four 1600×1200 sprite WebPs remain intact and are still used if processing fails.

## Implementation
- For each of **4 characters × 12 existing source frames**: builds an optional in-memory RGBA atlas from the original artwork when same-origin/CORS pixel readback is permitted.
- Drops nearly transparent matte residue, removes tiny disconnected opacity islands, and neutralizes colored antialiasing halos against nearby opaque source colors. Does **not** fill genuine transparency gaps in hair.
- Estimates head size and foot position per frame and applies **a single identical X/Y scaling factor** to align poses; never compresses crouching, attacks, or airborne sprites on one axis. Limits scale corrections to 0.86–1.14 to prevent unstable pose detection from warping silhouette.
- Applies the same pose calibration to floor reflections without violating source aspect.
- Original atlases are retained as fail-safe and are not overwritten. Debug: `AngelClashDebug.spriteIntegrity()` returns per-character measurements and cleanup counts after images have finished loading.

## Limitations / next source artwork requirements
- **AKARI idle eye**: White or malformed painted eye pixels cannot be reconstructed reliably through alpha-only cleanup. This still requires precise source-frame retouching with the original atlas open. It is not marked fixed.
- If CDN CORS disallows readback, the original WebP still renders, but the in-memory cleanup does not run. The web image host response and live Chrome/Safari behavior have not been directly verified.
- Generated draft art in this conversation is **not** used in the game; it has not been verified against character canon or animation consistency.
- 400×400 source tiles limit true HD detail. To improve beyond source resolution, repaint consistent 12-pose source frames and then replace each approved atlas as a whole.

## QA checkpoints
1. Desktop Chrome: idle, walking, crouch, LP/HP, LK/HK, jumps, special, hurt and victory for all four fighters; check consistent face size and original X/Y aspect.
2. On-screen transparent backgrounds: inspect hair gaps, hands, heels and suit edges against bright and dark stage colors.
3. Compare AKARI idle pose eyes to walk A/B; ensure neither becomes opaque white or loses an iris before source artwork approval.
4. Open the browser console to check `AngelClashDebug.spriteIntegrity()`. Empty output means no completed pixel processing — do not interpret this as a pass.
5. Confirm mobile Safari frame pacing and original artwork fallback, plus PC cut-in and round/result high-resolution rendering.

---

# ANGEL CLASH v9.2 — Original-aspect character rendering and HD cinematics

**Changes committed in `queue` on 2026-11-06.** Original character artwork must not be stretched in any pose. The combat renderer draws an intact source animation cell at one uniform scale for both axes. Removed crouch/landing vertical compression and multi-band walking deformation; movement, lean rotation and crossfade remain without changing each source cell's proportions. The visible floor reflection is mirror-flipped and clipped rather than squashed; NOX's legacy image and static action overlays now derive display width from the original image ratio.

Large **super cut-ins, story panels, victory/defeat and ending portraits** prefer the individually approved full-resolution `HD_ART_URLS` (or dedicated costume art if registered), instead of enlarging each cropped figure from the combined 920×552 stage-board JPEG. Small HUD portraits may retain stage-specific board previews; stage-board artwork is a fallback when HD sources have not loaded. `drawImageCover` crops images to fit without altering the original aspect. HD loading is optional and does not block combat.

**QA:** JavaScript syntax validation passed, and source-level invariants verified: no `scale(1,stretch)`, no strip-based drawPose warping, uniform X/Y frame scaling, native-ratio action/cinematic fallback, and HD-first large-panel selection. This is *not* a physical PC/Safari visual test, and no Cloudflare Pages deployment status was independently verified. The approved sprite sheets contain 400×400 frames; resampling cannot add painting detail not present in the source. If a particular source animation pose itself has distorted proportions or unusually small head art, it must be corrected in the source atlas, not fixed by nonuniform display scaling.

---

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
