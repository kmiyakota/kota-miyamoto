# ANGEL CLASH — Music & Voice Design (v9.15)

## In-game audio state

- The soundtrack is **nine original WebAudio cue arrangements**. No third-party copyrighted song is distributed or played.
- WebAudio runs only after keyboard/mouse/touch interaction, complying with Safari/Chrome autoplay restrictions.
- The music engine uses small lookahead scheduling windows in the existing animation loop. It plays melody, chords, bass and light percussion. Source code lives in `angel-clash/index.html`, and source test lives in `tests/audio-smoke.test.cjs`.
- The character voice prototype uses the device's **Japanese speechSynthesis voice**, **not** fixed professionally recorded acting. Voices will vary across operating systems and available Japanese TTS voices. If none are available, the game continues without speech.
- All existing hit, block, fire, win, jump, and navigation sound effects remain.

## Music map

| Cue | Scene | Arrangement direction | Tempo |
|---|---|---|---|
| title | Title and main menu | Warm heroic, A minor and rising motif | 117 BPM |
| select | Character select / story | Bright tension and short rhythmic choices | 136 BPM |
| sakura | Sakura Terrace | Energetic major-key theme | 147 BPM |
| sea | Sky Harbor | Open, fast, melodic major-key theme | 142 BPM |
| city | Moonlit City | Sleek, slightly darker minor-key theme | 132 BPM |
| crystal | Crystal Sanctum | Airy, reflective, sustained minor-key motif | 126 BPM |
| eclipse | Eclipse Castle | Fast, foreboding boss theme | 156 BPM |
| victory | Result screen | Uplifting resolution and victory motif | 112 BPM |
| ending | Arcade ending | Gentle concluding theme | 96 BPM |

These cues are **temporary original synthesized arrangements**, not commercial music masters. The game intentionally keeps `MUSIC_EXTERNAL_FILES` empty until supplied or cleared recordings are available. When the final produced tracks are ready, map the desired cue keys to hosted OGG/MP3 files and keep the WebAudio patterns as fallback.

## Character voice guide

| Character | Vocal direction | Source text policy |
|---|---|---|
| 衣都 / ITO | Bright, energetic, positive, slightly higher | Use `META.ito.intro`, `SPECIAL_SHOUTS.ito`, `SUPER_LINES.ito`, `META.ito.win` |
| 灯 / AKARI | Kind, calm, composed, mature | Use `META.akari.intro`, `SPECIAL_SHOUTS.akari`, `SUPER_LINES.akari`, `META.akari.win` |
| 環 / TAMAKI | Intelligent, composed, clear pronunciation | Keep first-person `ぼく` and canonical `のだ・なのだ` endings |
| NOX | Low, solemn, imposing, understated | Preserve the silver-haired winged boss identity and original dialogue |

Existing original script lines are used rather than inventing new character lore. Prototype voice pitches/rates differ per character, but a device's default Japanese voice may not have the requested timbre or gender.

## Playback events and controls

- **Entrance:** after a match begins. For the NOX boss, NOX's introduction is given priority.
- **Specials:** pulse / riser / rush lines, with a 1.5-second rate limit to avoid speech overlaps.
- **Super:** higher priority, cancels a prior phrase if needed.
- **Winner:** canonical victory line at the results screen.
- **Options:** MUSIC VOLUME, EFFECT VOLUME, VOICE VOLUME are independent.
- **Shortcuts:** M toggles music and V toggles character dialogue.
- **Training:** change stage with C (keyboard) or STAGE ↻ (touch), and the music changes with the stage.

## Recording replacements (later production pass)

For polished character acting, record independent line files per identity and event:
`assets/voices/{ito,akari,tamaki,nox}/{intro,pulse,riser,rush,super,win}.ogg`.
Keep consistent gain, limited peak level and short silence padding. Normalize after mixing; avoid clipping over fight effects. Prefer a Japanese script and one fixed voice actor or approved synthetic character voice per identity. When these recordings exist, add an explicit URL map and have `voiceLine` play clips before the current TTS fallback; don't invent or request missing files during ordinary play.

## QA limits and next checks

- **Automated:** `node angel-clash/tests/audio-smoke.test.cjs` — simulated AudioContext, title theme notes, five stage switches, voice line dispatch, muting.
- **Physical tests required:** Safari iPhone 13 mini in landscape and desktop Chrome; first tap unlock, background/resume, Bluetooth latency, stable stage loop, overlapping attack SFX, and clarity/intelligibility of each Japanese voice.
- GitHub code on `queue` is not proof that Cloudflare Pages has deployed this version. Check `angel-clash/deployment.json` for `ANGEL-CLASH-V9.15-AUDIO-20261109`.
