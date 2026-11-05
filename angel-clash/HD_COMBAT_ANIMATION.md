# ANGEL CLASH v9.0 — High Definition Combat Sprites

## Implemented (queue branch)

**The old low-resolution combat sprites are now replaced in the actual Canvas2D fighter renderer** by new standard tight-miniskirt-suit action atlases. The artwork is derived from the four approved original ANGEL CLASH action concept boards, **not the rejected blonde-ITO promotional mockup**. Every atlas uses a 4×3 grid of transparent WebP poses. Faces, brown ITO long hair, AKARI's dark-brown bob, TAMAKI's glasses/dark bob, NOX's silver hair and wings, clothing identity and dark character palette are retained. There are no stockings.

| Character | Media asset (PNG-safe WebP) | Size |
|---|---|---:|
| ITO | https://static.wixstatic.com/media/c3c31e_f84c2687cabd4c6e93fc0849d6d7e912~mv2.webp | 326,604 bytes |
| AKARI | https://static.wixstatic.com/media/c3c31e_1b14461d63c84e919162bc2f9fa1e688~mv2.webp | 249,272 bytes |
| TAMAKI | https://static.wixstatic.com/media/c3c31e_7325a9b9a4cf463c998b729f7ab9dbe1~mv2.webp | 247,324 bytes |
| NOX | https://static.wixstatic.com/media/c3c31e_7a96f82aa5634f8d9e1e2ffc768520d7~mv2.webp | 452,264 bytes |

All four files were verified READY by Wix Media Manager: **1600×1200**, RGBA transparent WebP, **400×400 each pose**. Total asset bytes: 1,275,464 (approximately 1.28 MB). Portraits, stage costumes, and previous v5 sprite files are preserved for fallback and future alternative outfits.

## Frame positions (0-based, 4 columns × 3 rows)

| Index | Pose | In-game trigger |
|---:|---|---|
| 0 | Idle | neutral and attacks' windup |
| 1 | Walk A | walk phase 1 |
| 2 | Walk B | walk phase 2 |
| 3 | Crouch/guard | crouch or block |
| 4 | Jump | grounded launch / airborne |
| 5 | Light punch | LP/MP |
| 6 | Heavy punch / rush | HP / throw / rush |
| 7 | Light kick | LK / MK |
| 8 | Heavy kick | HK |
| 9 | Special / super windup | pulse / super / riser |
| 10 | Hit | damage / stun |
| 11 | Victory | winning stance |

A key-pose atlas **is not 12 video frames per move**: the game interpolates positions with the v7 motion rig, two walking keyframes, stance blends and procedural secondary movement. The source boards themselves supply individual still poses; additional in-between illustrations would make the animation smoother in a later art pass.

## Runtime implementation

- `FIGHT9_URLS` + `fighterAtlas9()` load and validate 1600×1200 images.
- `spriteFrame9()` maps the 12 actual action poses onto the fighter state machine.
- The existing Canvas character renderer now dynamically handles 4-column 400×400 tiles with subframe position interpolation.
- NOX uses the same animated rendering path (formerly primarily one static boss image).
- When a v9 asset fails or its dimensions differ, the renderer retains the existing v5 fighter / NOX fallback rather than displaying broken cells.
- Static full-body action overlays are suppressed during combat when real action poses are available (super cut-in remains).
- `AngelClashDebug.combatHD()`, `toggleCombatHD(true/false)`, and `poseIndex(playerIndex)` enable diagnostics and quick rollback.
- The basic fitted miniskirt suit is the **only combat costume in v9**. Five stage-specific costume portraits remain in the menu/HUD, but full stage-by-stage combat costume animation is postponed as requested.
- `CLEAN` remains the default VFX preset for good PC image clarity and mobile speed.

## QA

JS parsing passed. A mocked Canvas2D engine exercised four fighter matchups, 10 move inputs, changing walking and crouch/jump state, and the fallback toggle. Results: **7162 new-atlas sprite draws, zero nonfinite draw coordinates, zero out-of-bounds source rectangles**, legacy sprites correctly displayed when HD disabled. All four Wix files reported READY. Full real-browser Safari/PC game-playthrough and Cloudflare Pages production deployment cannot yet be independently verified from the available tools. Avoid claiming official release or device performance until tested on target devices.

## Production artwork limitation

The transparent 400×400 frames were carefully extracted from the approved 1122×1402 multi-pose illustration boards and upsampled with edge-aware alpha and high-quality resampling. The data contains each board's real painted detail, **but cannot create additional original detail beyond those source poses**. For UHD close-ups or exceptionally smooth multi-frame martial arts motion, commission/generate individually higher-resolution source poses in a consistent character rig and repack in the same 4×3 layout.

