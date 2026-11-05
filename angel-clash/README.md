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
