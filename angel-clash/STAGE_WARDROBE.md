# ANGEL CLASH — Stage Wardrobe Plan (v8.4)

## Implemented since v8.4: lightweight stage outfit portraits

Five stage concept boards have now been archived in the creator's Wix Media Manager, and **cropped character costume strips** are separately hosted for actual in-game story, battle HUD, and victory portraits. The cropped 920×552 JPEG files are fetched **only on stage demand**, and at most two stage images are retained in the JavaScript cache. There are no extra initial-stage downloads on game startup.

| Stage | Optimized costume strip | Image bytes |
|---|---|---:|
| Sakura Terrace | https://static.wixstatic.com/media/c3c31e_97cc144b331546bb81f5ff482a64b457~mv2.jpg | 158,955 |
| Sky Harbor | https://static.wixstatic.com/media/c3c31e_579ffacb11e94b9682e7ba4cefdf8ae0~mv2.jpg | 178,840 |
| Moonlit City | https://static.wixstatic.com/media/c3c31e_312212b0cb4e4096b1a08baf8978a04a~mv2.jpg | 183,265 |
| Crystal Sanctum | https://static.wixstatic.com/media/c3c31e_92623cd205bc41e388693fb465fd1792~mv2.jpg | 175,931 |
| Eclipse Castle | https://static.wixstatic.com/media/c3c31e_e76e2130653e4b65be484a91fa3b8611~mv2.jpg | 176,309 |

Total JPEG payload = 873,300 bytes, versus approximately 14.34 MB for the five original full-size PNG boards (about **94% less**). The original boards are preserved at Wix as source references. These images are **upper-body concept portrait crops**, not full animation sprite atlases; animated characters still use the existing combat atlas until matching fitted-mini costumes and movement poses are finished.

In Training Mode, press **C** on PC or tap **STAGE ↻** on a touch device to cycle stages and inspect costume changes. The 5-stage cycle and 10 combat moves passed mocked Canvas2D QA, including event-triggered PC/touch stage changes. This is not yet a real iPhone Safari field test.

---


## Approved direction

Characters can change battle outfits **when a stage changes**; costumes are not randomized every frame. Keep the original creator's identities and the current (lighter) visual-effects setting. The primary outfit follows the user's reference of a tailored, fitted miniskirt suit, **without stockings**, in darker variants of each character's identifying color.

**Character design canon**: https://miyakota3.wixsite.com/my-site-1/post/about-three-new

**Old elaborate/frilled costume ideas are preserved**: see [ART_CONCEPT_ARCHIVE.md](ART_CONCEPT_ARCHIVE.md). They are not to be destroyed or silently replaced.

### Color consistency

- ITO / 衣都 — dark rose skirt `#76334D`; warm brown long hair, energetic smile, rose-pink ribbon accents.
- AKARI / 灯 — deep navy skirt `#1C3359`; dark brown short bob, calm mature expression, blue details.
- TAMAKI / 環 — deep violet skirt `#432952`; dark short bob, glasses **always**, gentle feminine character, violet details, first-person 「ぼく」, final particles 「のだ」「なのだ」.
- NOX — eclipse plum `#321A30` when wearing tailored suit; preserve approved silver hair and wings/dark angel boss identity.

### Outfit variations by stage

| Index | Stage | Wardrobe key | Appearance |
|---|---|---|---|
| 0 | SAKURA TERRACE / 天空の桜庭園 | `sakura` | Standard fitted miniskirt with cropped jacket and white blouse, minimal frill |
| 1 | SKY HARBOR / 蒼空の港 | `harbor` | Light short or rolled-sleeve sporty jacket, fitted miniskirt, minimal straps |
| 2 | MOONLIT CITY / 月影の街 | `moonlit` | Dark elegant fitted blazer, mini skirt, minimal metallic accessories |
| 3 | CRYSTAL SANCTUM / 結晶の聖域 | `crystal` | Narrow formal silhouette, subtle gemstone/technical detail, no bulky fabric |
| 4 | ECLIPSE CASTLE / 日蝕の城 | `eclipse` | Boss-stage special costume; preserved ornate look may serve as a rare alternative without increasing VFX |

This list is a **production art plan**, not a claim that the new complete sprites exist.

## Runtime integration done (code in `queue/angel-clash/index.html`)

- Added `WARDROBE`, `CHARACTER_DARK_SKIRTS`, `wardrobeFor`, and `ensureStageWardrobe`.
- Stage assignment triggers a check for optional, already-registered stage-specific images.
- The combat sprite, menu/portrait and special-attack art can each be switched **independently** after their files exist.
- Only load images explicitly registered in `COSTUME_SOURCES`. The default manifest is currently **empty**—no nonexistent URLs, 404 flood, or altered existing textures.
- Animated costume sprite must match the current atlas geometry: **396×336 px frames, 12 columns, 2 rows** (4752×672 px image) and stage-independent frame map.
- The renderer rejects incompatible sprite atlas dimensions and falls back to the approved prior sprite sheet. Preserve all feet/faces inside tile bounds.
- Existing hitbox, hitstop, round rules, frame interpolation, and controls are not changed by wardrobe selection.
- Visuals remain sharp in high-DPI desktop rendering; VFX preset defaults to CLEAN.
- Battle HUD and story screen show the current wardrobe theme.
- Manual QA hooks: `AngelClashDebug.wardrobe()` and `AngelClashDebug.wardrobeStage(0…4)`.

## Asset work still necessary

1. Create approved *full-body* fitted miniskirt character turnaround for ITO, AKARI, TAMAKI, and boss version of NOX. Hairstyles, glasses, face identities are not negotiable. No stockings.
2. Create 12-column multi-pose combat atlas for each character/stage combination. Use existing pose/frame layout for compatible timing.
3. Create portrait crops and optional special-move key art per outfit; **not every attack requires a separate image**.
4. Compress to high-quality alpha WebP when source art is approved, without blurring linework.
5. Insert actual URLs into `COSTUME_SOURCES` once published and verify all 5 stages on PC and iPhone Safari. Until then the code must keep the existing game art, not pretend the costume is changed.

## Technical warning

An image concept board, an outfit sketch, or one static illustration is **not** a substitute for a true combat atlas. Rendering a single static full-body illustration for every move would destroy the smooth motion and pose variety from v7. Stage wardrobes must be introduced only when the complete compatible animation assets are available.

## Verification

Mock rendering covered four fighter pairings, all five stage values, and all ten combat moves with zero invalid Canvas image coordinates (mock test only). Actual browser visual checks and published deployment remain outstanding.
