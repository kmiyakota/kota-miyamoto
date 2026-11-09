# ANGEL CLASH v9.14 — AKARI natural-face combat sprites (2026-11-09)

**Implemented on GitHub `queue`:** The new 12-pose AKARI action sheet based on the user's supplied natural-face portrait has replaced the previous eye pixel-retouch master in the actual combat renderer. The 1448×1086 4×3 generated composition was converted into a **genuinely transparent 1600×1200 lossless WebP atlas** with twelve **400×400 cells**, fixed source scale and origin in every pose, and matte decontamination to remove the image's false checkerboard background. The game chooses it for AKARI in matches, including idle, walking, crouching, jumping, punches, kicks, specials, hurt, and victory.

- Current AKARI combat atlas: https://static.wixstatic.com/media/c3c31e_465e674d2bf2438ba00e9073377bfdb9~mv2.webp (READY, confirmed 1600×1200 RGBA WebP, 522,876 bytes)
- Former v9.13 retouched atlas retained for rollback, **no longer used in the game**: https://static.wixstatic.com/media/c3c31e_16cac0b756874f78863a1b0cf7145efe~mv2.png
- This image is extracted from a 12-pose composite, not a new individually redrawn 4K per-pose set: the original art detail is limited by each original 362×362 source cell.
- No edits to ITO/TAMAKI/NOX character combat images, hitboxes, physics or stage-related outfits.
- AKARI skips the older in-browser alpha/color fixer because the asset was already matted once offline; this avoids white/dirty edges being reprocessed. Diagnostic: `AngelClashDebug.akariBattleArtwork()`.
- QA: tested transparent atlas cells for nonzero character alpha, zero opaque borders and no pose clipped at the cell edge. Mock Canvas2D smoke exercised 12 matchups and 120 move requests with 69 draw calls using AKARI's new combat asset, **zero nonfinite or out-of-range sprite draws**.
- Production Cloudflare Pages deployment / iPhone Safari appearance have not been independently verified; `deployment.json` marker is updated to v9.14.

---

# ANGEL CLASH v9.13 — AKARI white-iris correction (2026-11-09)

**Completed in GitHub `queue`:** Only AKARI's first combat idle pose has been updated. The previous six-pixel color patch was not sufficiently visible at battle scale, so the eye/iris contrast was adjusted in a **13-pixel local RGB region** (tile x=207–211, y=74–77), without resizing or modifying the character. The other 11 poses, all alpha pixels, and the ITO/TAMAKI/NOX atlases are unchanged.

- Active new 1600×1200 RGBA source: https://static.wixstatic.com/media/c3c31e_16cac0b756874f78863a1b0cf7145efe~mv2.png (Wix Media Manager, READY, verified 1600×1200).
- Original production reference retained: https://static.wixstatic.com/media/c3c31e_1b14461d63c84e919162bc2f9fa1e688~mv2.webp.
- Previous v9.12 six-pixel master retained for rollback: https://static.wixstatic.com/media/c3c31e_c38bf273b0924fbe85f98e8aefc51bc6~mv2.png.
- The final corrected atlas is the original production 12-pose master with only 13 edited RGB pixels inside the idle eye. This is a deliberate small eye detail repair, not a replacement of other art, game mechanics, or outfits.
- Code and mock Canvas2D QA: four matchup scenarios, 40 move inputs, 96 valid modern-atlas draws, zero invalid draw coordinates. A real Chrome/Safari visual and Cloudflare Pages rollout are **not** yet independently verified.
- Publication smoke marker: [deployment.json](deployment.json). On supported GitHub Actions runs, the queue workflow also polls the deployed marker.
- Diagnostic: `AngelClashDebug.akariIdleEyeRepair()` reports the updated 13-pixel master and whether the image is loaded.

---

# ANGEL CLASH v9.11 — AKARI idle iris repair (2026-11-06)

**AKARI's blank-white iris now has a verified pixel-level correction layer integrated into the game renderer.** The approved original 1600×1200 Wix WebP is kept intact; this change is a non-destructive sprite source *overlay*, not a completely regenerated atlas.

- Source: `c3c31e_1b14461d63c84e919162bc2f9fa1e688~mv2.webp` (1600×1200, 4×3 source frames).
- Correction layer: [AKARI idle iris RGB fix](https://static.wixstatic.com/media/c3c31e_7a87a744b19f463d965e3e1681dbca51~mv2.png), uploaded in READY state to the ANGEL CLASH Wix Media Manager.
- Layer size: 400×400, fully transparent except for **6 opaque RGB pixels**, at local idle tile coordinates `x=208–210, y=75–76`. A verified read-back confirmed its pixel bounds, PNG dimensions, and that no translucent fringe was introduced.
- The original WebP, its transparency, the other 11 AKARI poses, and all ITO/TAMAKI/NOX assets are unchanged.
- `drawFighter() / drawPose()` applies the correction **only when `f.id === 'akari'`, the real base `akariFight9` atlas is selected, and pose index is 0**. Ground reflection receives the same retouch. Both X and Y share the original uniform scale. Other costume atlases and fallback sprites are untouched.
- `AngelClashDebug.akariIdleEyeRepair()` reports whether the PNG image is loaded. The correction has no hitbox, input or physics changes.
- The first coarse 13-pixel test was rejected upon visual inspection; the active 6-pixel patch uses a smaller, subtler eye-shaped correction.
- Source integrity checks: **15/15 pass**. Mock Canvas2D gameplay: **24 matchups; 192 move attempts; 16 keyboard macro checks; 0 invalid sprite rectangles/aspect ratios; 20 iris patch draws** in simulated HD mode and no patch draws in fallback.
- This is **not yet a flattened WebP master replacement**, nor proof of Cloudflare Pages deployment. The game-side patch was committed to GitHub `queue` as v9.11; public deployment and physical desktop/iPhone appearance remain to verify.

## Remaining visual tasks
- Review the repaired eye at live game size, not only a zoomed PNG comparison; if needed, refine the 6 source-color pixels after an actual Safari/Chrome screenshot.
- Other 47 poses still need inspection for head/height consistency and alpha-fringe defects; these are tracked separately in [issue #1](https://github.com/kmiyakota/kota-miyamoto/issues/1).

---

# Source artwork repair workbench — 2026-11-06

The unfinished part of ANGEL CLASH is **the underlying 4×12 character artwork** (incorrect AKARI idle iris, silhouettes/head sizes, hair transparency/edge fringes). Screen rendering, high-DPI cut-ins and aspect-preserving Canvas2D code alone cannot repaint broken source pixels.

## Source-accurate editing now available
A separate, non-destructive [sprite-retouch.html](sprite-retouch.html) has been added to the `queue` branch:
- Loads the current character-specific 1600×1200 (4×3) transparent Wix atlas with CORS and also accepts a local PNG/WebP master when CORS prohibits editing.
- Rejects 1600×1200 images whose first cell is effectively fully opaque, to avoid editing flattened preview images in place of the original RGBA source.
- Preserves the exact 400×400 source-frame proportions. No generated character replacement, automatic head zoom, canvas slice warp or costume substitution.
- Provides paint, alpha erase, color sampling and same-pose clone source brush (Alt+click), undo/redo with per-frame snapshots, zoom, 12-frame selection, checker/light/dark/purple transparency checks, and original-vs-edited comparison.
- Has **per-pose alpha fringe RGB restoration** from nearby opaque pixels. It leaves the original alpha untouched, so real gaps between hair strands remain transparent.
- Exports a separate 1600×1200 transparent PNG or WebP. The original source and live game remain unchanged until a corrected master is inspected and approved.

## Still required before release
- Actually repaint **AKARI's white/blank idle iris** using the correct source original, and inspect every pose of all four characters. The mere existence of the editor does NOT mean this work has happened.
- Check same-character eye/hair/height consistency in 48 poses, and verify alpha edges against multiple backgrounds. Do not approve a generated image featuring wrong identities.
- Stage the approved corrected atlases with a safe asset rollout, then test in real PC Chrome and iPhone Safari. Cloudflare public deployment remains unverified.
- Source integrity tests now cover the retouch workbench and pass 15/15 simulated checks. They do not replace human image-by-image visual approval.

---

# ANGEL CLASH v9.10 — Final source-safe tuning pass (2026-11-06)

**Implemented on GitHub `queue`, not confirmed deployed on Cloudflare Pages.** The creator rejected prior v10 promotional posters because character identities were swapped or redesigned. No generated poster has entered the game's source-asset manifest.

## Final changes this pass

1. **Native proportions.** All four 4×3 HD sprite sheets remain fixed at 400×400 cells, with a single uniform X/Y render scale and no per-pose head-zoom, vertical compression, strip warp, or face recentering.
2. **HD/legacy costume compatibility.** Animation pose indices, tile size and source selection now derive from the *actual chosen atlas* (HD 1600×1200 vs legacy), not the mere existence of an optional v9 image. Original alpha repairs cannot be applied accidentally to a different costume atlas.
3. **Higher-resolution cinematics.** Source-resolution choice uses actual pixels surviving the cover crop. Large cut-ins and round results reject low-resolution stage-composite fallbacks; the best eligible HD image is chosen. If no image passes, a canon-safe vector label is used.
4. **Identity and dialogue.** ITO (light-brown long hair), AKARI (dark-brown bob), TAMAKI (dark short hair, glasses), and NOX (silver hair, wings) remain distinct. TAMAKI's quote has been corrected to use "ぼく" with "なのだ".
5. **Input usability.** One-key specials remain Q (pulse), E (riser), F (rush), T (super with 100 meter); P2 uses Numpad7/8/9/Divide. The help screen now documents these controls.
6. **Visual A/B diagnostics.** F9 switches between original HD sprite cells and the optional non-destructive transparent-edge cleaned bitmap (where CORS allows pixel readback). Game physics, collision and animation state are unchanged. Debug hooks: `AngelClashDebug.spriteCleanup()`, `toggleSpriteCleanup(true|false)`, `spriteIntegrity()`.
7. **Pose inspection.** `sprite-audit.html` shows each fighter's 12 original cells, a selectable same-pose before/after comparison, light/dark/checker backgrounds, zoom, RGBA alpha metrics where readable and optional local PNG/WebP uploads.
8. **Regression suite and CI.** `tests/asset-integrity.test.cjs` checks 13 source invariants. `tests/runtime-smoke.test.cjs` runs 24 simulated matchups, 192 attack attempts, 16 P1/P2 keyboard macro checks and two F9 toggles across HD/fallback Canvas2D modes. Zero invalid sprite coordinates and aspect violations in the simulations. A GitHub Actions workflow (`.github/workflows/angel-clash-integrity.yml`) runs both tests for relevant pushes and PRs.

## Important limitations

- **Actual source-level visual repair remains unfinished.** AKARI's mispainted/white idle iris, inconsistent painted anatomy, hairline alpha artifacts and other 48-frame illustration defects cannot be proven repaired by Canvas code. No unapproved generation has been substituted into the runtime.
- The existing Wix-hosted 1600×1200 atlases are the current truth. High-DPI interpolation cannot invent details not painted in the original 400px poses.
- All test numbers above are source/Canvas mocks, not screenshots from desktop Chrome or iPhone Safari. No CI completed run was observable at documentation time, despite the workflow source being committed.
- Attempts to fetch the public Cloudflare URL were unsuccessful, including a second attempt made after a one-minute interval. This does **not** establish that the site is down; live deploy status remains unverified.
- The `queue` and `work` branches have diverged significantly in the known repository history; do not force merge or overwrite the work branch to publish this game without a reconciled deployment plan.

**Runtime safety rule:** do not mark a character master fixed until the correct 12 source poses pass identity, same-character head scale, alpha cutout, both-irises, attack silhouette and dark/light background visual comparison.

---

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
