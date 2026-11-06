# ANGEL CLASH — Original-source sprite repair QA (2026-11-06)

> **Status: inspection drafts only. NO GAME ASSET WAS REPLACED.**
> This work starts from the **exact four production Wix FIGHT9 WebPs** rather than a generated promotional image or unrelated 12-pose alternative.

## Original production sources and separate transparency drafts

| Character | Production FIGHT9 original (READY) | Source-derived alpha candidate (READY, NOT APPROVED) | Translucent pixels whose RGBA changed |
|---|---|---|---:|
| ITO | [original](https://static.wixstatic.com/media/c3c31e_f84c2687cabd4c6e93fc0849d6d7e912~mv2.webp) | [alpha QA draft](https://static.wixstatic.com/media/c3c31e_18335341248043bd941a1e1b02809367~mv2.png) | 46,605 |
| AKARI | [original](https://static.wixstatic.com/media/c3c31e_1b14461d63c84e919162bc2f9fa1e688~mv2.webp) | [alpha QA draft](https://static.wixstatic.com/media/c3c31e_d6996052e8b9463ebc9436ea4f7be442~mv2.png) | 42,610 |
| TAMAKI | [original](https://static.wixstatic.com/media/c3c31e_7325a9b9a4cf463c998b729f7ab9dbe1~mv2.webp) | [alpha QA draft](https://static.wixstatic.com/media/c3c31e_27b7ee6750954f1bbc5d4440664d4461~mv2.png) | 37,991 |
| NOX | [original](https://static.wixstatic.com/media/c3c31e_7a96f82aa5634f8d9e1e2ffc768520d7~mv2.webp) | [alpha QA draft](https://static.wixstatic.com/media/c3c31e_cd46dafed2a84a81bce45ed53a997d0c~mv2.png) | 36,524 |

All sources were downloaded through the connected Wix Media Manager and decoded as **1600×1200 RGBA**, containing **4 columns × 3 rows**, each cell **400×400**. SHA-256 checksums and byte counts were recorded in the local QA manifest. The four separate Wix uploads returned **READY** status.

## What the technical repair actually changes

- Gradually removes white-background matte contamination from translucent RGB boundary pixels by comparing to adjacent nearly opaque art from the **same pose cell**.
- For ITO, AKARI and TAMAKI only, attenuates highly suspicious pale low-alpha fringes near dark interior contours. NOX's light silver hair and wing boundaries are deliberately treated more conservatively.
- **Does not stretch, crop, shift, resize or redraw any source pose.** Source-pixel alpha ≥245 and every corresponding opaque RGB value are unchanged. No new animation frames, costume or character designs were generated for these candidate uploads.
- Fully transparent RGB bytes may be normalized during lossless WebP encoding; such invisible RGB differences are deliberately excluded from visible-pixel counts.

## AKARI's white / missing eye — separate unresolved visual-art issue

The production AKARI idle pose has a pale/partly missing eye area, unlike the unrelated earlier local candidate. A full 12-pose generative revision was attempted and rejected due to severe new color speckle, identity and alpha inconsistencies.

A *very small iris-only pixel transfer* was tested on the actual production idle pose. A separate [experimental iris draft](https://static.wixstatic.com/media/c3c31e_b5039ed0b76a41578307da8f56fce88a~mv2.png) is stored in Wix as **NOT APPROVED**. The transfer is restricted to the upper-left source cell eye region, with no body pixels changed outside the eye and alpha edge corrections; however, the expression and eye proportions still need artistic visual approval. The production FIGHT9 URL is unchanged.

**Do not use** the earlier [local alt-pose draft](https://static.wixstatic.com/media/c3c31e_a47b22f4bdaa43a1b2aeef84ed3591be~mv2.png) as the replacement: it was drawn from a different candidate atlas, not from exact production Wix pixels.

## Reproducible inspection

Use [sprite-audit.html](sprite-audit.html) on `queue` to compare any of the 4 source-derived alpha candidates against their original, pose by pose, on checker/white/dark backgrounds, and to inspect AKARI's separate iris prototype. The audit UI is independent from the gameplay entrypoint.

Release gate: **do not change `FIGHT9_URLS` in `index.html`** until the head-size/height and all 12 original character faces have been reviewed, hair gap transparency passes black/white backgrounds, and the original visual canon remains intact across all four characters. Current code smoke tests validate rendering/layout but not artistic identity or facial correctness.
