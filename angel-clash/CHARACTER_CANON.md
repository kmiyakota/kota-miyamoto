# 2026-11-06: identity-lock / rejected v10 poster

A generated "ANGEL CLASH v10.0" promotional composition presented the wrong character identities and **must never be treated as an approved asset or as proof that a v10 game release exists**. The proportions and names were repeatedly mismatched. Those generated images are not listed in the runtime asset manifest.

For every art or sprite production task, require the following ID ↔ identity mapping:

| Internal key | Correct character | Appearance that must remain consistent | Explicitly reject |
|---|---|---|---|
| `ito` | 衣都 / ITO | Light-brown **long hair**, warm-toned face, character's pink identity | Short dark bob, blonde legacy promotional hair, another character's glasses |
| `akari` | 灯 / AKARI | Dark-brown **short bob**, the same eyes in idle and all action poses, blue identity | Purple-haired glasses wearer; mismatched/blank-white iris |
| `tamaki` | 環 / TAMAKI | Dark short/bob hair, **eyeglasses**, violet identity, "ぼく"/"のだ" voice | Silver-haired twin-tail character; missing glasses |
| `nox` | NOX | Previously approved **silver-haired winged boss** design; dark eclipse costume | Blue/black-haired unrelated human fighter without the approved wings |

Do not confuse the 2026-11-06 generated promotional posters with the original v8 art/reference montage, and do not use **`angel-clash/assets/portraits/ito.webp`** or `assets/original-characters.jpg` to regenerate ITO's face: those historical fallbacks still show a discontinued blond-haired depiction. The canon descriptions above take precedence. If source art is unavailable, display an identity-safe vector placeholder instead of inventing a face. The gameplay renderer follows this fallback policy in v9.5.

The 12 original source frames remain source-locked, with **no per-pose X/Y scale changes or automatic head recentering**. Image repair and character redraw are separately tracked: cleanup of fringe/alpha noise is not evidence of corrected eye drawing, anatomy, hair design, or identity. A corrected master atlas must pass visual review of all 12 frames and transparency against both light and dark backgrounds before activation.

---

# ANGEL CLASH — Character canon (original cast)

**Source of truth:** [３人について](https://miyakota3.wixsite.com/my-site-1/post/about-three-new) on the creator's Wix site.
Wix Blog post ID: `a3bb7fd8-09fc-4c10-84ff-643ed503cd25` (slug: `about-three-new`).

## Character profile image IDs, confirmed from Wix Blog rich-content

- AKARI (灯): `c3c31e_64bd4c4c4ac14ef69cd41c70e6eab44c~mv2.png` — original 1024 × 1536 px.
- ITO (衣都): `c3c31e_2c83bcf6d31e43da96fe813f5f588d00~mv2.png` — original 1106 × 1422 px.
- TAMAKI (環): `c3c31e_94c725ed0bf849b3a66f00e22fce0c0e~mv2.png` — original 1055 × 1491 px.
- Group introduction image: `c3c31e_0ae3e69cbfa34a419f31709562cba9c6~mv2.png` — original 1122 × 1402 px.

The original profiles are authoritative for faces, hairstyles, glasses, age presentation, body proportions, personalities and manner of speech. **Do not invent or change those character-defining features.** The creator initially approved the **ornate ANGEL CLASH battle costumes** on 2026-11-05, then specifically requested **fitted miniskirt battle outfits with minimal ruffles and reduced fabric bulk** as the new standard on the same date. Preserve the ornate versions separately as optional, archived costume concepts (see `ART_CONCEPT_ARCHIVE.md`); do NOT delete or overwrite their source media. Keep the established original face, hair, glasses, age impression, personality and character-identifying pink/blue/purple accents, while changing only clothing complexity. These are fictional fighting-game costumes, distinct from the everyday outfits depicted in Wix's profiles; do NOT replace them with profile streetwear. In particular, costume approval is NOT permission to replace ITO's light-brown hair with blonde, change AKARI's dark-brown short bob, or remove TAMAKI's dark short hair and glasses. Work from the actual profile image files; do not treat unrelated promotional mockups as equivalent references. For new poses, preserve identity first and battle costume second; review each against the sources before adoption.

## Fourth character

- **NOX**: exception expressly approved by the creator on November 5, 2026. The newly proposed eclipse-winged design is permitted for NOX only, and cannot be used to redesign the original three protagonists.

## Graphic-production rules

1. Preserve existing source images and game appearance unless a *verified* reference-faithful replacement is prepared.
2. Improve clarity with high-resolution source assets rather than stretching small thumbnails or generating unrelated redesigns.
3. Produce separate poses for idle, walking, crouch, jump, hit, six normal attacks, specials, and victory, consistent with all character-defining traits in the authoritative profile image.
4. Preserve image aspect ratio; require review of each sprite atlas before replacing live files.
5. Maintain game compatibility on PC and iPhone 13 mini Safari; keep collision and move timing unchanged during purely visual updates.
6. Earlier speculative four-character promotional mockups are **not** approved as protagonist designs.

## Source precedence

1. Original Wix **３人について** article and its embedded images.
2. Earlier creator-supplied original image references.
3. New **fitted miniskirt, minimal-ruffle** battle costume is the primary target; keep the original ornate costume as a preserved alternate version (see `ART_CONCEPT_ARCHIVE.md`). Faces, hair, glasses and age must still match 1–2.
4. NOX-approved exceptional design, limited to NOX.
