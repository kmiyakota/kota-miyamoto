/* HORIZON RUSH: ITO'S SKY JOURNEY
 * An original, self-contained pseudo-3D arcade shooter.
 * No game ROM, copyrighted music, or third-party game graphics are used.
 * ITO's character artwork is provided by the user.
 */
(() => {
    'use strict';
    const W = 960, H = 720, HORIZON = 310, NEAR = 12, FAR = 160, FIXED = 1 / 60;
    const $ = id => document.getElementById(id);
    const canvas = $('game'), ctx = canvas.getContext('2d', { alpha: false });
    const overlay = $('overlay'), hud = $('hud'), hudScore = $('score'), hudHi = $('highscore'), hudStage = $('stage'), hudLives = $('lives');
    const bossUi = $('boss-ui'), bossName = $('boss-name'), bossFill = $('boss-fill'), notice = $('notice'), pauseBtn = $('pause-btn');
    const ito = new Image();
    ito.decoding = 'async';
    ito.src = 'assets/ito.png';
    // Original animation atlases: 24 rear-view flight/run, 20 additional movement,
    // and 20 forward-facing AKARI boss poses. All frames use a 320px square cell.
    const atlases = {};
    for (const [key,src,columns] of [
        ['flight','assets/ito_flight.webp',6],
        ['actions','assets/ito_actions.webp',5],
        ['akari','assets/akari_boss.webp',5]
    ]) {
        const image = new Image(); image.decoding = 'async'; image.src = src;
        atlases[key] = { image, columns, loaded: false };
        image.addEventListener('load',()=>{atlases[key].loaded=true;});
    }
    function atlasFrame(key, index, x, y, size, opacity=1) {
        const atlas=atlases[key];
        if (!atlas?.image.complete || !atlas.image.naturalWidth) return false;
        const col=index%atlas.columns, row=Math.floor(index/atlas.columns);
        ctx.save();ctx.globalAlpha*=clamp(opacity,0,1);
        ctx.drawImage(atlas.image,col*320,row*320,320,320,x-size*.5,y-size*.68,size,size);
        ctx.restore();
        return true;
    }
    // Discrete painted poses combined with fractional motion and fast frame blending.
    // This achieves continuously smooth gameplay while retaining original costumes.
    const poseSequences={
        hover:[['flight',0],['flight',1],['flight',2],['flight',1],['actions',0],['actions',1],['actions',2],['flight',0]],
        bankLeft:[['flight',3],['flight',4],['flight',5],['flight',4],['actions',10],['flight',3]],
        bankRight:[['flight',6],['flight',7],['flight',8],['flight',7],['actions',14],['flight',6]],
        shoot:[['flight',10],['flight',11],['flight',12],['flight',13],['flight',14],['flight',11]],
        rise:[['actions',5],['actions',6],['actions',7],['flight',0]],
        descend:[['actions',8],['actions',9],['flight',0]],
        land:[['flight',16],['flight',17],['flight',18]],
        run:[['flight',18],['flight',19],['flight',20],['flight',21],['flight',22],['flight',23]],
        damage:[['actions',15],['actions',16],['actions',17]],
        victory:[['actions',18],['actions',19]]
    };
    function currentItoPose(p,t) {
        const moving=Math.abs(p.vx)>85, landed=p.y>=H*.78;
        if(game?.phase==='clear')return 'victory';
        if(p.hitAnim>0)return 'damage';
        if(landed){if(p.lastGround===false && p.landingTime>0)return 'land';return 'run';}
        if(p.firing && p.fireCd>.015) return 'shoot';
        if(p.vx < -85)return 'bankLeft';
        if(p.vx > 85)return 'bankRight';
        if(p.vy < -115)return 'rise';
        if(p.vy > 115)return 'descend';
        return 'hover';
    }

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const smooth = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
    const rnd = (a = 0, b = 1) => a + Math.random() * (b - a);
    const dist2 = (x, y, x2, y2) => (x - x2) ** 2 + (y - y2) ** 2;
    const pad = (n, l = 8) => String(Math.max(0, Math.floor(n))).padStart(l, '0');
    const rgb = h => { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
    function colorMix(a, b, t) { return `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`; }
    const STAGES = [
        ['AZURE PLAIN', '#4ac8f8', '#c8e9fd', '#424ac4', '#c5a3ff', '#78b8ff', '#122d87', 'TWIN HORN', 0],
        ['SCARLET DESERT', '#fe6d8f', '#ffd6af', '#a33c8b', '#f1a96c', '#f9a75b', '#6e296f', 'SCARLET SPHINX', 1],
        ['CRYSTAL HOLLOW', '#8c72ee', '#f1c5ff', '#6133a7', '#5af1e6', '#b87dfe', '#402466', 'CRYSTAL CORE', 2],
        ['SKY TEMPLE', '#4baad9', '#e5f4fd', '#3858ab', '#fbe0b2', '#8dd1ff', '#263473', 'SKY SERPENT', 3],
        ['BONUS FLIGHT I', '#ec8dd1', '#ffead0', '#bb66aa', '#f9dd87', '#ffbfdf', '#714098', '', -1],
        ['TWILIGHT FOREST', '#487cac', '#f9bbf9', '#304a86', '#5df0b0', '#6caf9c', '#283961', 'FOREST TITAN', 4],
        ['CRIMSON ORBIT', '#e862a3', '#ffbbb9', '#863274', '#ff9e67', '#ee71a3', '#43246a', 'ORBIT GUARDIAN', 5],
        ['IRON CITADEL', '#7491b3', '#d0d9eb', '#404c81', '#abb9d5', '#8299b8', '#1e324c', 'GEAR DRAGON', 6],
        ['PHANTOM SEA', '#3f9cda', '#b5fff3', '#31568c', '#61dbdf', '#85bdd9', '#1c365c', 'DEEP PHANTOM', 7],
        ['GOLDEN HORIZON', '#faaf64', '#fff5b9', '#a3696c', '#ffdf89', '#edbc6b', '#654067', 'GOLD GOLEM', 8],
        ['VOID CORRIDOR', '#2f3976', '#947cbb', '#1d2356', '#a67dff', '#4b51a7', '#0d103e', 'VOID WATCHER', 9],
        ['BONUS FLIGHT II', '#f588c5', '#ffd7e6', '#7c53b2', '#f3e294', '#f2a4ed', '#44316f', '', -1],
        ['CELESTIAL GARDEN', '#8ed5f0', '#fef2fc', '#7283bc', '#f8b2de', '#a0e8f5', '#4d5796', 'CELESTIAL BEAST', 0],
        ['STORM FRONTIER', '#3f6e9f', '#accced', '#253c73', '#ffe9a2', '#5c9fd6', '#22265a', 'THUNDER WORM', 3],
        ['FROZEN MIRAGE', '#81d4e7', '#e5faff', '#519ec7', '#c0faff', '#99d9fa', '#244875', 'FROST TITAN', 4],
        ['ASTRAL FORTRESS', '#6247a7', '#e3a9e5', '#3b2b85', '#fc8cae', '#8b74d4', '#24204c', 'ASTRAL CORE', 2],
        ['FINAL FRONTIER', '#be417e', '#ffc9bc', '#622d79', '#f7c076', '#e26bba', '#211a4a', 'DIMENSION GUARD', 9],
        ['ENDLESS CONFRONTATION', '#3b3277', '#f2a7be', '#161e4c', '#ed95e3', '#a86bff', '#080f33', 'VOID SOVEREIGN', 9]
    ].map((d, i) => ({ id: i + 1, name: d[0], skyTop: d[1], skyBottom: d[2], groundA: d[3], groundB: d[4], accent: d[5], groundDark: d[6], bossName: d[7], bossType: d[8], bonus: i === 4 || i === 11, gauntlet: i === 17, bossTime: 48 + Math.min(12, Math.floor(i / 3) * 3) }));
    const ENEMY_TYPES = ['orb', 'manta', 'gear', 'eye', 'crystal', 'golem', 'bird', 'seeker', 'ring', 'worm'];
    // Curated stage themes. Enemy and obstacle pools deliberately vary by world.
    const STAGE_RULES = [
        { enemies: [0, 1, 6], obstacles: [0, 1, 2, 4] },
        { enemies: [0, 3, 7], obstacles: [1, 5, 8] },
        { enemies: [4, 2, 8], obstacles: [3, 9, 11] },
        { enemies: [1, 6, 8], obstacles: [4, 7, 8] },
        { enemies: [], obstacles: [0, 2, 3, 5, 10] },
        { enemies: [1, 5, 9], obstacles: [0, 2, 4, 10] },
        { enemies: [0, 3, 8], obstacles: [5, 9, 11] },
        { enemies: [2, 5, 7, 8], obstacles: [6, 7, 9] },
        { enemies: [1, 6, 9], obstacles: [3, 5, 9] },
        { enemies: [4, 5, 7], obstacles: [1, 4, 8] },
        { enemies: [3, 7, 8, 9], obstacles: [5, 7, 9] },
        { enemies: [], obstacles: [2, 3, 5, 9, 11] },
        { enemies: [1, 4, 6, 8], obstacles: [0, 3, 10] },
        { enemies: [2, 7, 8, 9], obstacles: [5, 6, 9] },
        { enemies: [3, 4, 5], obstacles: [1, 3, 11] },
        { enemies: [2, 5, 7, 8], obstacles: [6, 7, 8] },
        { enemies: [3, 5, 8, 9], obstacles: [1, 4, 7, 9] },
        { enemies: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], obstacles: [1, 3, 5, 7, 9] }
    ];
    const BOSS_COLORS = [['#fa94d8', '#fff3af'], ['#ff8c80', '#ffd9ac'], ['#a997ff', '#8dfff2'], ['#76e7fd', '#fff1ad'], ['#7affbc', '#d6b0ff'], ['#f7a4fb', '#ffdf8a'], ['#aec8ff', '#e7fdff'], ['#69e6db', '#f8beec'], ['#ffcb79', '#fcede3'], ['#d093ff', '#ff8ed7']];
    const DEFAULTS = { difficulty: 'arcade', visual: 'modern', master: .68, music: .50, effects: .72, shake: true, flash: false, autoAim: true, autoFire: false, scanlines: false, reducedParticles: false };
    const SAVEKEY = 'horizon-rush-ito-v1';
    function loadSave() { try {
        let x = JSON.parse(localStorage.getItem(SAVEKEY) || '{}');
        return { version: 1, hi: x.hi || 0, casualHi: x.casualHi || 0, unlocked: clamp(x.unlocked || 1, 1, 18), clears: x.clears || 0, stageHi: x.stageHi || {}, settings: { ...DEFAULTS, ...(x.settings || {}) } };
    }
    catch {
        return { version: 1, hi: 0, casualHi: 0, unlocked: 1, clears: 0, stageHi: {}, settings: { ...DEFAULTS } };
    } }
    let save = loadSave(), settings = save.settings;
    function persist() { try {
        localStorage.setItem(SAVEKEY, JSON.stringify(save));
    }
    catch { /* private-browsing fallback */ } }
    let state = 'TITLE', lastFrame = 0, accumulator = 0, clock = 0, game = null, shake = 0, backgroundStage = STAGES[0];
    let keys = new Set(), mouseHeld = false, touchId = null, touchX = 0, touchY = 0, mouseX = W * .5, mouseY = H * .65, mouseMoved = false, lastPad = false, gamepadMove = { x: 0, y: 0, fire: false };
    let particles = [], stars = [], bannerUntil = 0, noticeUntil = 0;
    for (let i = 0; i < 90; i++)
        stars.push({ x: rnd(0, W), y: rnd(0, HORIZON), r: rnd(.4, 2), s: rnd(.3, 1.5) });
    /* Original fully-composed multi-instrument soundtrack (8 tracks) + procedural SFX.
       BGM is delivered as actual audio, never short step-by-step melody loops. */
    const MUSIC_TRACKS = {
        title: 'assets/music/title.mp3',
        main: 'assets/music/main.m4a',
        even: 'assets/music/even.mp3',
        boss: 'assets/music/boss.mp3',
        final: 'assets/music/final.m4a',
        bonus: 'assets/music/bonus.m4a',
        ending: 'assets/music/ending.m4a'
    };
    class AudioEngine {
        constructor() { this.ac = null; this.master = null; this.musicBus = null; this.sfxBus = null; this.track = ''; this.enabled = true; this.noise = null; this.unlocked = false; this.pausedByGame = false; this.musicAudio = new Audio(); this.musicAudio.preload = 'none'; this.musicAudio.loop = true; this.musicAudio.addEventListener('error', () => { const fallback = { title: 'assets/music/title.m4a', even: 'assets/music/main.m4a', boss: 'assets/music/boss.m4a' }[this.track]; if (fallback && !this.musicAudio.src.endsWith(fallback)) { this.musicAudio.src = fallback; if (this.unlocked && !this.pausedByGame) this.musicAudio.play().catch(() => {}); } else console.warn('BGM could not be loaded:', this.track); }); }
        unlock() {
            if (!this.ac) {
                const AC = window.AudioContext || window.webkitAudioContext;
                if (!AC)
                    return;
                try {
                    this.ac = new AC();
                    this.master = this.ac.createGain();
                    this.musicBus = this.ac.createGain();
                    this.sfxBus = this.ac.createGain();
                    this.master.connect(this.ac.destination);
                    this.musicBus.connect(this.master);
                    this.sfxBus.connect(this.master);
                    const buf = this.ac.createBuffer(1, Math.floor(this.ac.sampleRate * .20), this.ac.sampleRate), data = buf.getChannelData(0);
                    let seed = 173;
                    for (let i = 0; i < data.length; i++) {
                        seed = (seed * 1664525 + 1013904223) >>> 0;
                        data[i] = (seed / 4294967295) * 2 - 1;
                    }
                    this.noise = buf;
                    this.setVolumes();
                }
                catch {
                    this.enabled = false;
                }
            }
            if (this.ac && this.ac.state === 'suspended')
                this.ac.resume().catch(() => { });
            // Called inside an explicit user gesture (button/key/touch).
            this.unlocked = true;
            if (this.track && !this.pausedByGame) this.musicAudio.play().catch(() => {});
        }
        setVolumes() { if (!this.ac)
            return; this.master.gain.value = settings.master; this.musicBus.gain.value = settings.music; this.sfxBus.gain.value = settings.effects; this.musicAudio.volume = clamp(settings.master * settings.music, 0, 1); }
        play(type = 'shot', volume = 1) { if (!this.ac || !this.enabled)
            return; const t = this.ac.currentTime; switch (type) {
            case 'shot':
                this.tone(690, 'square', .071, .056 * volume, t, -360, this.sfxBus);
                break;
            case 'hit':
                this.tone(310, 'triangle', .10, .11 * volume, t, -110, this.sfxBus);
                break;
            case 'destroy':
                this.tone(210, 'sawtooth', .23, .19 * volume, t, -185, this.sfxBus);
                this.noiseBurst(t, .14, .13 * volume);
                break;
            case 'hurt':
                this.tone(470, 'sawtooth', .48, .22 * volume, t, -410, this.sfxBus);
                break;
            case 'boss':
                this.tone(136, 'sawtooth', .58, .22 * volume, t, +70, this.sfxBus);
                this.tone(93, 'square', .42, .08, t + .16, -15, this.sfxBus);
                break;
            case 'clear':
                this.fanfare([72, 76, 79, 84], t, .17, volume);
                break;
            case 'extra':
                this.fanfare([79, 84, 88], t, .13, volume);
                break;
            case 'ui':
                this.tone(760, 'sine', .055, .065 * volume, t, +80, this.sfxBus);
                break;
            case 'bonus':
                this.tone(800, 'triangle', .11, .08 * volume, t, +340, this.sfxBus);
                break;
            case 'blast':
                this.noiseBurst(t, .5, .24 * volume);
                this.tone(115, 'sawtooth', .44, .26 * volume, t, -85, this.sfxBus);
                break;
            case 'warning':
                this.tone(540, 'square', .18, .07 * volume, t, -220, this.sfxBus);
                break;
        } }
        tone(freq, type, dur, vol, when, slide = 0, bus = this.musicBus) { if (!this.ac)
            return; const osc = this.ac.createOscillator(), gain = this.ac.createGain(); osc.type = type; osc.frequency.setValueAtTime(Math.max(22, freq), when); if (slide)
            osc.frequency.exponentialRampToValueAtTime(Math.max(22, freq + slide), when + dur); gain.gain.setValueAtTime(.0001, when); gain.gain.exponentialRampToValueAtTime(Math.max(.0002, vol), when + .009); gain.gain.exponentialRampToValueAtTime(.0001, when + dur); osc.connect(gain); gain.connect(bus); osc.start(when); osc.stop(when + dur + .025); }
        noiseBurst(when, dur, vol) { if (!this.ac || !this.noise)
            return; const src = this.ac.createBufferSource(), gain = this.ac.createGain(), filter = this.ac.createBiquadFilter(); src.buffer = this.noise; filter.type = 'lowpass'; filter.frequency.value = 1100; gain.gain.setValueAtTime(vol, when); gain.gain.exponentialRampToValueAtTime(.0001, when + dur); src.connect(filter); filter.connect(gain); gain.connect(this.sfxBus); src.start(when); src.stop(when + dur); }
        fanfare(notes, t, dur, vol = 1) { notes.forEach((n, i) => this.tone(440 * 2 ** ((n - 69) / 12), 'square', dur * 1.6, .10 * vol, t + i * dur, 0, this.sfxBus)); }
        changeTrack(name) {
            if (this.track === name) return;
            this.musicAudio.pause();
            this.track = name;
            if (!name || !MUSIC_TRACKS[name]) {
                this.musicAudio.removeAttribute('src');
                this.musicAudio.load();
                return;
            }
            this.musicAudio.src = MUSIC_TRACKS[name];
            this.musicAudio.currentTime = 0;
            this.musicAudio.volume = clamp(settings.master * settings.music, 0, 1);
            if (this.unlocked && !this.pausedByGame) this.musicAudio.play().catch(() => {});
        }
        pauseTrack() { this.pausedByGame = true; this.musicAudio.pause(); }
        resumeTrack() {
            this.pausedByGame = false;
            if (this.unlocked && this.track) this.musicAudio.play().catch(() => {});
        }
        update() { /* Browser audio playback runs independently of frame rate. */ }
        getInfo() { return { track: this.track, playing: !this.musicAudio.paused, time: this.musicAudio.currentTime || 0 }; }
    }
    const audio = new AudioEngine();
    /* Perspective ground shader in portable ImageData (no external packages). */
    class GroundRenderer {
        constructor() { this.c = document.createElement('canvas'); this.c.width = 480; this.c.height = 205; this.g = this.c.getContext('2d', { alpha: false }); this.image = this.g.createImageData(480, 205); this.pixels = new Uint32Array(this.image.data.buffer); this.rowZ = new Float32Array(205); this.rowX = new Float32Array(205); for (let y = 0; y < 205; y++) {
            let yy = HORIZON + y * 2;
            this.rowZ[y] = 8 * 340 / Math.max(1, yy - HORIZON);
            this.rowX[y] = this.rowZ[y] / 340 * 2;
        } this.palette = ''; this.cache = []; }
        paletteFor(stage) { if (this.palette === stage.id)
            return; this.palette = stage.id; const colors = [rgb(stage.groundA), rgb(stage.groundB), rgb(stage.groundDark), rgb(stage.skyBottom)]; this.cache = []; for (let fog = 0; fog < 32; fog++) {
            let f = fog / 31;
            this.cache.push([0, 1].map(n => { let c = colors[n], target = colors[3], cc = c.map((x, i) => Math.round(lerp(x, target[i], f * .96))); return (255 << 24) | (cc[2] << 16) | (cc[1] << 8) | cc[0]; }));
        } }
        render(stage, scroll, shift) { this.paletteFor(stage); let p = this.pixels, k = 0; const tileX = 2.75, tileZ = 5.5; for (let y = 0; y < 205; y++) {
            const z = this.rowZ[y], factor = this.rowX[y], tileRow = Math.floor((z + scroll) / tileZ), fog = clamp(Math.floor((z - 13) / 4.5), 0, 31), pal = this.cache[fog], base = 240 * factor + shift;
            for (let x = 0; x < 480; x++) {
                const tileCol = Math.floor(((x - 240) * factor + shift) / tileX);
                p[k++] = pal[(tileCol + tileRow) & 1];
            }
        } this.g.putImageData(this.image, 0, 0); return this.c; }
    }
    const ground = new GroundRenderer();
    function fillRound(x, y, w, h, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); }
    function poly(points, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(points[0][0], points[0][1]); for (let i = 1; i < points.length; i++)
        ctx.lineTo(points[i][0], points[i][1]); ctx.closePath(); ctx.fill(); }
    function glow(x, y, r, color, alpha = .7) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, color); g.addColorStop(1, 'transparent'); ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    function projection(x, y, z) { const f = NEAR / Math.max(NEAR * .65, z); return { x: W / 2 + (x - W / 2) * f, y: HORIZON + (y - HORIZON) * f, s: f }; }
    function sky(stage, t, subtle = false) {
        const a = rgb(stage.skyTop), b = rgb(stage.skyBottom);
        let grad = ctx.createLinearGradient(0, 0, 0, HORIZON + 90);
        grad.addColorStop(0, colorMix(a, [5, 12, 46], .48));
        grad.addColorStop(.55, stage.skyTop);
        grad.addColorStop(1, stage.skyBottom);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
        if (stage.id >= 10 || stage.bonus) {
            for (const star of stars) {
                ctx.globalAlpha = .16 + .6 * (.5 + .5 * Math.sin(t * star.s + star.x));
                ctx.fillStyle = '#fff';
                ctx.fillRect(star.x, star.y, star.r, star.r);
            }
            ctx.globalAlpha = 1;
        }
        const sunX = 745 + Math.sin(stage.id * 3.1) * 110, sunY = 125 + Math.sin(stage.id) * 32;
        glow(sunX, sunY, 138, stage.accent, .18);
        ctx.fillStyle = stage.accent;
        ctx.globalAlpha = .31;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 48, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        for (let layer = 0; layer < 3; layer++) {
            let base = HORIZON - 44 + layer * 28;
            ctx.beginPath();
            ctx.moveTo(-5, HORIZON);
            for (let x = -20; x <= W + 35; x += 20) {
                let curve = Math.sin(x * .009 + stage.id * 1.71 + layer * .72 + t * .002) * 22 + Math.sin(x * .021 + stage.id * .61 - layer) * 10;
                ctx.lineTo(x, base + curve * (.35 + layer * .28));
            }
            ctx.lineTo(W + 5, HORIZON);
            ctx.closePath();
            ctx.fillStyle = colorMix(rgb(stage.groundDark), rgb(stage.skyBottom), .36 + layer * .24);
            ctx.globalAlpha = .40 + layer * .12;
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        let haze = ctx.createLinearGradient(0, HORIZON - 48, 0, HORIZON + 38);
        haze.addColorStop(0, '#fff0');
        haze.addColorStop(.60, '#ffffff45');
        haze.addColorStop(1, '#fff0');
        ctx.fillStyle = haze;
        ctx.fillRect(0, HORIZON - 48, W, 85);
        ctx.imageSmoothingEnabled = settings.visual !== 'classic';
        ctx.drawImage(ground.render(stage, game?.distance || t * 12, (game?.player.x - W / 2 || 0) * .008), 0, HORIZON, W, H - HORIZON);
        ctx.imageSmoothingEnabled = true;
        if (!settings.reducedParticles && !subtle) {
            ctx.save();
            ctx.globalAlpha = .12;
            ctx.strokeStyle = stage.accent;
            ctx.lineWidth = 1.5;
            for (let i = 0; i < 15; i++) {
                let x = (i * 197 + Math.floor(t * 19) * 11) % 1200 - 120;
                let y = HORIZON + ((i * 29 + t * 95) % 390);
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + (x - W / 2) * .028, y + 10);
                ctx.stroke();
            }
            ctx.restore();
        }
    }
    function addParticle(x, y, color, amount = 12, power = 140) { const n = settings.reducedParticles ? Math.ceil(amount * .35) : amount; for (let i = 0; i < n; i++) {
        const ang = rnd(0, Math.PI * 2), sp = rnd(power * .18, power), life = rnd(.25, .9);
        particles.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life, max: life, color, size: rnd(1.5, 5.5) });
    } if (particles.length > 550)
        particles.splice(0, particles.length - 550); }
    function updateParticles(dt) { for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= .97;
        p.vy = p.vy * .98 + 12 * dt;
        p.life -= dt;
        if (p.life <= 0)
            particles.splice(i, 1);
    } }
    function drawParticles() { ctx.save(); ctx.globalCompositeOperation = settings.visual === 'modern' ? 'screen' : 'source-over'; for (const p of particles) {
        ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
        ctx.fillStyle = p.color;
        let size = p.size * p.life / p.max;
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
    } ctx.restore(); }
    function drawEnemy(e, t) {
        let p = projection(e.x, e.y, e.z);
        if (p.s < .045 || p.s > 4 || p.x < -220 || p.x > W + 220)
            return;
        let sc = e.size * p.s / 82;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(sc, sc);
        let wobble = Math.sin(t * 4 + e.seed);
        ctx.rotate(Math.sin(t * 2 + e.seed) * .1);
        const c = e.color || '#fa80dc', d = e.inner || '#ffe9ac';
        ctx.shadowColor = c;
        ctx.shadowBlur = settings.visual === 'modern' ? 13 : 0;
        switch (e.type) {
            case 'orb': {
                let g = ctx.createRadialGradient(-14, -19, 2, 0, 0, 46);
                g.addColorStop(0, '#fff');
                g.addColorStop(.22, d);
                g.addColorStop(.70, c);
                g.addColorStop(1, '#2b1d79');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(0, 0, 39, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#fff9';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(0, 0, 31, .35, 2.5);
                ctx.stroke();
                break;
            }
            case 'manta': {
                poly([[-69, -6], [-37, -23], [0, -3], [37, -23], [69, -6], [24, 25], [0, 15], [-24, 25]], c);
                poly([[-37, -16], [0, -2], [37, -16], [8, 20], [-8, 20]], d);
                ctx.fillStyle = '#172e72';
                ctx.fillRect(-15, 0, 8, 6);
                ctx.fillRect(7, 0, 8, 6);
                break;
            }
            case 'gear': {
                ctx.save();
                ctx.rotate(t * 1.4);
                for (let i = 0; i < 8; i++) {
                    ctx.rotate(Math.PI / 4);
                    fillRound(-10, -49, 20, 27, 3, c);
                }
                ctx.restore();
                ctx.fillStyle = '#26306c';
                ctx.beginPath();
                ctx.arc(0, 0, 36, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = d;
                ctx.lineWidth = 8;
                ctx.stroke();
                glow(0, 0, 25, d, .9);
                break;
            }
            case 'eye': {
                ctx.fillStyle = c;
                ctx.beginPath();
                ctx.ellipse(0, 0, 52, 36, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff3d9';
                ctx.beginPath();
                ctx.ellipse(0, 0, 37, 27, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#34256d';
                ctx.beginPath();
                ctx.arc(9 + wobble * 6, 0, 16, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = d;
                ctx.beginPath();
                ctx.arc(12 + wobble * 6, -6, 6, 0, Math.PI * 2);
                ctx.fill();
                break;
            }
            case 'crystal': {
                poly([[0, -64], [30, -21], [47, 11], [15, 58], [-28, 31], [-47, -13]], c);
                poly([[0, -64], [3, 20], [-28, 31], [-47, -13]], d);
                poly([[3, 20], [47, 11], [15, 58]], '#ffffffa0');
                break;
            }
            case 'golem': {
                poly([[-37, -42], [29, -51], [51, -10], [34, 49], [-32, 49], [-55, -7]], '#253a72');
                poly([[-37, -42], [29, -51], [35, -10], [-25, -8]], c);
                fillRound(-27, -5, 54, 33, 7, d);
                ctx.fillStyle = '#1b245b';
                ctx.fillRect(-22, 7, 13, 9);
                ctx.fillRect(9, 7, 13, 9);
                break;
            }
            case 'bird': {
                let wing = 12 + wobble * 15;
                poly([[0, -8], [-40, -wing], [-68, -6], [-25, 18], [0, 11], [25, 18], [68, -6], [40, -wing]], c);
                poly([[-15, -12], [0, -29], [15, -12], [0, 41]], d);
                ctx.fillStyle = '#fefcff';
                ctx.beginPath();
                ctx.arc(0, -17, 8, 0, Math.PI * 2);
                ctx.fill();
                break;
            }
            case 'seeker': {
                poly([[0, -62], [20, -12], [58, 0], [18, 13], [0, 57], [-19, 13], [-58, 0], [-20, -12]], c);
                poly([[0, -46], [13, 0], [0, 26], [-13, 0]], d);
                ctx.strokeStyle = '#ffffffaa';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-45, 0);
                ctx.lineTo(45, 0);
                ctx.stroke();
                break;
            }
            case 'ring': {
                ctx.strokeStyle = c;
                ctx.lineWidth = 15;
                ctx.beginPath();
                ctx.arc(0, 0, 41, 0, Math.PI * 2);
                ctx.stroke();
                ctx.rotate(t * 1.5);
                ctx.strokeStyle = d;
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.arc(0, 0, 25, .2, 3.6);
                ctx.stroke();
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(0, 0, 8, 0, Math.PI * 2);
                ctx.fill();
                break;
            }
            case 'worm': {
                for (let i = 5; i >= 0; i--) {
                    ctx.fillStyle = i % 2 ? c : d;
                    ctx.beginPath();
                    ctx.ellipse(Math.sin(t * 4 + e.seed - i * .7) * 12, i * 13 - 25, 29 - i * 2, 18, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.fillStyle = '#20306a';
                ctx.fillRect(-14, -31, 8, 7);
                ctx.fillRect(6, -31, 8, 7);
                break;
            }
            default: break;
        }
        ctx.restore();
    }
    function drawObstacle(o, t) {
        let p = projection(o.x, o.y, o.z);
        if (p.s < .036 || p.s > 4 || p.x < -240 || p.x > W + 240)
            return;
        const sc = o.size * p.s / 100;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(sc, sc);
        ctx.lineJoin = 'round';
        let k = o.kind % 12, base = ['#8f65ba', '#78bcc6', '#d9a0dc', '#8fe9d8'][k % 4];
        const color = backgroundStage.accent;
        if (k === 0 || k === 4 || k === 7) {
            ctx.fillStyle = '#423672';
            ctx.fillRect(-13, -8, 26, 110);
            poly([[-42, 12], [0, -118], [46, 12]], k === 4 ? '#eab6de' : '#5ccfb5');
            poly([[-36, -21], [0, -143], [40, -21]], k === 7 ? color : '#b2f6e2');
            ctx.fillStyle = '#fff7';
            ctx.fillRect(-8, -85, 5, 35);
        }
        else if (k === 1 || k === 8) {
            poly([[-29, 60], [-34, -60], [-9, -120], [30, -56], [31, 60]], '#352f69');
            poly([[-34, -60], [-9, -120], [13, -62]], color);
            ctx.strokeStyle = '#fff9';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(-9, -120);
            ctx.lineTo(-5, 60);
            ctx.stroke();
        }
        else if (k === 2 || k === 10) {
            fillRound(-16, -6, 32, 70, 6, '#63619b');
            ctx.fillStyle = k === 10 ? '#f6a4d6' : '#e7b7f5';
            ctx.beginPath();
            ctx.ellipse(0, -15, 67, 35, 0, Math.PI, 0);
            ctx.lineTo(-64, -15);
            ctx.fill();
            ctx.fillStyle = '#fff9';
            ctx.beginPath();
            ctx.arc(-13, -30, 12, 0, Math.PI * 2);
            ctx.fill();
        }
        else if (k === 3 || k === 11) {
            poly([[-38, 56], [-24, -90], [7, -135], [33, -79], [44, 56]], '#6a70a5');
            poly([[-24, -90], [7, -135], [8, 56]], '#a4f4e9');
            poly([[8, 56], [33, -79], [44, 56]], base);
        }
        else if (k === 5) {
            ctx.fillStyle = '#6766a7';
            ctx.beginPath();
            ctx.ellipse(0, 0, 68, 42, .2, 0, Math.PI * 2);
            ctx.fill();
            poly([[-50, -2], [-16, -49], [43, -41], [62, -2], [23, 30]], '#b0ccfa');
        }
        else if (k === 6) {
            fillRound(-29, -115, 58, 168, 3, '#4c5a89');
            fillRound(-37, -125, 74, 18, 3, color);
            for (let i = 0; i < 6; i++) {
                ctx.fillStyle = '#b4fffa';
                ctx.fillRect(-19, -102 + i * 22, 39, 5);
            }
        }
        else if (k === 9) {
            ctx.save();
            ctx.rotate(t * 1.7);
            ctx.strokeStyle = color;
            ctx.lineWidth = 19;
            ctx.beginPath();
            ctx.ellipse(0, 0, 52, 61, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = '#fff8';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.ellipse(0, 0, 48, 58, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    }
    function drawAkari(b,t){
        const p=projection(b.x,b.y,b.z);
        // AKARI and ITO are human-scale: her sprites are not inflated into a monster.
        const size=210*Math.pow(35/Math.max(35,b.z),.62);
        const ratio=b.hp/Math.max(1,b.maxHp);
        const rage=ratio<.34;
        const pulse=Math.sin(t*4)*3;
        const bx=p.x,by=p.y+12+pulse;
        ctx.save();ctx.strokeStyle=rage?'#ff5069aa':'#ffd69b6b';ctx.lineWidth=3;
        ctx.shadowColor=rage?'#ff526e':'#ffce83';ctx.shadowBlur=20;
        ctx.beginPath();ctx.ellipse(bx,by+4,size*.43,size*.45,0,0,Math.PI*2);ctx.stroke();
        ctx.globalAlpha=.48;
        ctx.beginPath();ctx.arc(bx,by+5,size*.47,t*.7,t*.7+2.7);ctx.stroke();
        ctx.restore();
        if(rage)glow(bx,by,size*.62,'#ff4779',.17);
        else glow(bx,by,size*.55,'#ffdf91',.10);
        let i=0;
        if(b.defeated){i=b.defeatTime>1.05?18:19;}
        else if(b.flash>.01){i=b.flash>.07?13:14;}
        else if(b.attackAnim>0){
            // NEVER select atlas frames 9, 10 or 11: their baked-in long beam
            // extends outside a 320px cell and looks visibly cut off.
            // Use full-body, uncropped poses; animate the energy separately.
            i=b.attackAnim>.37?8:b.attackAnim>.19?6:3;
        }
        else if(b.fireCd<.55){i=[5,6,7,8][Math.min(3,Math.floor((.55-b.fireCd)*7.5))];}
        else if(rage){i=15+Math.floor(t*7)%3;}
        else {i=[0,1,2,3,4,3,2,1][Math.floor(t*6)%8];}
        ctx.save();ctx.translate(bx,by);
        ctx.rotate(Math.sin(t*1.35)*.028);
        if(b.defeated){ctx.translate(0,Math.max(0,2.1-b.defeatTime)*13);}
        if(b.flash>.01){ctx.globalAlpha=.77;}
        if(!atlasFrame('akari',i,0,0,size)){
            fillRound(-35,-65,70,140,14,'#9d2546');
            ctx.fillStyle='#29202e';ctx.beginPath();ctx.arc(0,-78,28,0,7);ctx.fill();
        }
        ctx.restore();
        if(!b.defeated && b.fireCd<.50){
            const warm=1-clamp(b.fireCd/.5,0,1);
            glow(bx+size*.22,by-size*.19,11+warm*38,rage?'#ff527c':'#ffde95',.36+warm*.29);
            ctx.save();ctx.strokeStyle=rage?'#ffb3c5':'#ffe9b0';ctx.lineWidth=2.2;
            ctx.beginPath();ctx.arc(bx+size*.22,by-size*.19,12+warm*19,t*3,t*3+Math.PI*1.6);ctx.stroke();ctx.restore();
        }
        if(b.attackAnim>.18){
            const k=clamp((b.attackAnim-.18)/.38,0,1);
            const handX=bx+size*.21, handY=by-size*.18;
            glow(handX,handY,21+k*29,rage?'#ff809d':'#ffe9b5',.19+k*.39);
            // Detachable beam, no baked-in horizontal sprite or clipped art.
            if(b.attackAnim<.45 && b.attackAnim>.25){
                const power=Math.min(1,(.45-b.attackAnim)/.09,(b.attackAnim-.25)/.07);
                const beamEndX=lerp(handX,game.player.x,.32);
                const beamEndY=lerp(handY,game.player.y,.33);
                ctx.save(); ctx.globalAlpha=clamp(power,0,1)*.72;
                ctx.globalCompositeOperation='lighter';
                const beam=ctx.createLinearGradient(handX,handY,beamEndX,beamEndY);
                beam.addColorStop(0,'#fff7d1');beam.addColorStop(.55,rage?'#ff7198':'#ffdc87');beam.addColorStop(1,'#ffc7e500');
                ctx.strokeStyle=beam;ctx.lineWidth=3+power*13;ctx.lineCap='round';
                ctx.beginPath();ctx.moveTo(handX,handY);ctx.lineTo(beamEndX,beamEndY);ctx.stroke();
                ctx.restore();
            }
        }
    }
    function drawBoss(b, t) {
        if (!b) return;
        if (b.isAkari) { drawAkari(b,t); return; }
        const p = projection(b.x, b.y, b.z), sc = (2.65 + (b.hp <= b.maxHp * .33 ? .15 : 0)) * p.s;
        const c = b.colors[0], d = b.colors[1];
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(sc, sc);
        ctx.rotate(Math.sin(t * 1.4 + b.kind) * .045);
        ctx.shadowBlur = settings.visual === 'modern' ? 23 : 0;
        ctx.shadowColor = c;
        // Massive energy wings and decorative rotating halo
        ctx.save();
        ctx.rotate(t * .37);
        ctx.strokeStyle = c;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.ellipse(0, 0, 103, 103, 0, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < 8; i++) {
            let a = i * Math.PI / 4;
            ctx.fillStyle = d;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 100, Math.sin(a) * 100);
            ctx.lineTo(Math.cos(a - .14) * 121, Math.sin(a - .14) * 121);
            ctx.lineTo(Math.cos(a + .14) * 121, Math.sin(a + .14) * 121);
            ctx.fill();
        }
        ctx.restore();
        const wing = Math.sin(t * 3) * 12;
        if (b.kind % 3 === 0) {
            poly([[-20, -20], [-132, -75 - wing], [-111, 6], [-57, 40]], c);
            poly([[20, -20], [132, -75 - wing], [111, 6], [57, 40]], c);
            poly([[-17, -36], [0, -94], [17, -36]], d);
        }
        else if (b.kind % 3 === 1) {
            poly([[-45, -28], [-110, -58], [-142, 6], [-74, 51]], c);
            poly([[45, -28], [110, -58], [142, 6], [74, 51]], c);
            for (let j of [-1, 1]) {
                ctx.fillStyle = d;
                ctx.fillRect(j * 75 - 15, -12, 30, 14);
            }
        }
        else {
            for (let i = 0; i < 4; i++) {
                let a = i * Math.PI / 2 + t * .3;
                ctx.save();
                ctx.rotate(a);
                poly([[-10, -34], [0, -135], [10, -34]], c);
                ctx.restore();
            }
        }
        let grad = ctx.createRadialGradient(-20, -23, 0, 0, 0, 83);
        grad.addColorStop(0, d);
        grad.addColorStop(.5, c);
        grad.addColorStop(1, '#28275e');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 75, 67, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff9f';
        ctx.lineWidth = 4;
        ctx.stroke();
        if (b.kind === 3 || b.kind === 6) {
            ctx.fillStyle = '#25235c';
            poly([[-40, -23], [-36, -63], [-17, -43], [0, -86], [23, -38], [41, -61], [43, -12]], d);
            fillRound(-34, -12, 68, 37, 12, '#23205d');
            ctx.fillStyle = '#eefdff';
            ctx.fillRect(-24, 0, 15, 9);
            ctx.fillRect(10, 0, 15, 9);
        }
        else if (b.kind === 4 || b.kind === 8) {
            ctx.fillStyle = '#201f60';
            ctx.beginPath();
            ctx.ellipse(0, -12, 41, 28, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = d;
            ctx.fillRect(-24, -15, 14, 11);
            ctx.fillRect(10, -15, 14, 11);
            poly([[-34, 28], [0, 64], [34, 28]], '#3b2a73');
        }
        else if (b.kind === 9) {
            ctx.strokeStyle = '#fff9';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(0, 0, 50, t * 1.3, t * 1.3 + 4.8);
            ctx.stroke();
            glow(0, 0, 52, d, .78);
        }
        else {
            ctx.fillStyle = '#262460';
            ctx.beginPath();
            ctx.ellipse(0, -6, 43, 28, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = d;
            ctx.beginPath();
            ctx.ellipse(0, -6, 25, 16, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#25155d';
            ctx.beginPath();
            ctx.arc(Math.sin(t * 3) * 8, -6, 10, 0, Math.PI * 2);
            ctx.fill();
        }
        // Boss weak core pulsing, readable target
        ctx.shadowBlur = 24;
        ctx.shadowColor = '#fff';
        ctx.fillStyle = '#ffffffc9';
        ctx.beginPath();
        ctx.arc(0, 39, 13 + Math.sin(t * 7) * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = d;
        ctx.lineWidth = 4;
        ctx.stroke();
        if (b.flash > 0) {
            ctx.globalAlpha = clamp(b.flash * 4, 0, .6);
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.ellipse(0, 0, 80, 72, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
    function drawBullet(b, t) { let p = projection(b.x, b.y, b.z); if (p.s < .04 || p.s > 3)
        return; let sz = b.kind === 'friendly' ? Math.max(2.5, 11 * p.s) : Math.max(3.5, (b.r || 14) * p.s); ctx.save(); ctx.globalCompositeOperation = 'screen'; let c = b.kind === 'friendly' ? '#fff6c3' : b.color || '#ff547b'; if (settings.visual === 'modern')
        glow(p.x, p.y, sz * 3, c, .6); ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(p.x, p.y, sz, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(1.5, sz * .35), 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    function drawPlayer(t) {
        if(!game)return;
        const p=game.player;
        let px=p.x,py=p.y+Math.sin(t*7.5)*2.6;
        const groundMode=p.y>=H*.78;
        if(settings.shake&&shake>0){px+=rnd(-shake,shake)*.24;py+=rnd(-shake,shake)*.24;}
        glow(px,py+15,groundMode?55:90,'#ffb8e8',.16);
        ctx.save();ctx.translate(px,py+23);ctx.scale(1,.26);
        ctx.fillStyle='#1a174666';ctx.beginPath();ctx.arc(0,0,groundMode?32:45,0,Math.PI*2);ctx.fill();ctx.restore();
        if(!groundMode){ctx.save();ctx.strokeStyle='#ffb8f788';ctx.lineWidth=2.5;
          ctx.beginPath();ctx.ellipse(px,py+30,39+Math.sin(t*4)*4,13,0,0,7);ctx.stroke();ctx.restore();}
        if(game.stage.bonus){
            ctx.save();ctx.translate(px,py+43);
            poly([[-85,2],[-32,-29],[0,0],[32,-29],[85,2],[25,27],[-25,27]],'#baf5ff');
            ctx.beginPath();ctx.fillStyle='#ff9bcf';ctx.ellipse(0,8,36,20,0,0,7);ctx.fill();ctx.restore();
        }
        ctx.save();ctx.translate(px,py);
        const smoothBank=clamp(p.vx/1250,-.18,.18);
        const pitch=clamp(p.vy/2700,-.06,.06);
        ctx.rotate(smoothBank+Math.sin(t*3)*.009);
        ctx.translate(0,Math.sin(t*12)*1.5+pitch*11);
        ctx.scale(1+Math.abs(smoothBank)*.07,1-Math.abs(smoothBank)*.08);
        if(p.invuln>0 && Math.floor(p.invuln*8)%2===0)ctx.globalAlpha=.47;
        ctx.shadowColor='#ff8cce';ctx.shadowBlur=settings.visual==='modern'?13:0;
        const pose=currentItoPose(p,t);
        if(p.pose!==pose){p.pose=pose;p.poseTimer=0;p.poseBlend=.085;p.oldPose=p.lastFrame||['flight',0];}
        const sequence=poseSequences[pose]||poseSequences.hover;
        let speed=pose==='run'?13:pose==='shoot'?17:pose==='damage'?9:pose==='victory'?5:pose==='hover'?5.5:9;
        const frame=sequence[Math.floor((p.poseTimer||0)*speed)%sequence.length];
        p.lastFrame=frame;
        if(p.poseBlend>0 && p.oldPose){atlasFrame(p.oldPose[0],p.oldPose[1],0,0,219,p.poseBlend/.085*.52);}
        const drawn=atlasFrame(frame[0],frame[1],0,0,219);
        if(!drawn && ito.complete && ito.naturalWidth){const h=165,w=h*ito.naturalWidth/ito.naturalHeight;ctx.drawImage(ito,-w/2,-h*.65,w,h);}
        ctx.restore();
        // Shot bloom follows the animation; painted firing frames provide the physical pose.
        if(p.firing && (p.fireCd>.012 || settings.autoFire)){
            const fx=px+28+smoothBank*65,fy=py-45;
            glow(fx,fy,14+Math.sin(t*50)*5,'#ff8bee',.44);
            ctx.save();ctx.strokeStyle='#fff3ee';ctx.globalAlpha=.66;ctx.lineWidth=1.7;
            ctx.beginPath();ctx.arc(fx,fy,10+Math.sin(t*45)*2,0,7);ctx.stroke();ctx.restore();
        }
    }
    function drawScanlines() { if (!settings.scanlines)
        return; ctx.save(); ctx.globalAlpha = .09; ctx.fillStyle = '#07091e'; for (let y = 0; y < H; y += 4)
        ctx.fillRect(0, y, W, 2); ctx.restore(); }
    // Foreground weather gives selected worlds a distinct visual identity.
    // Deterministic movement avoids allocations and changes no collision rules.
    function drawAtmosphere(stage, t) {
        const id = stage.id;
        if (![2, 3, 6, 9, 13, 14, 15, 16, 18].includes(id)) return;
        ctx.save();
        const count = settings.reducedParticles ? 12 : 38;
        for (let i = 0; i < count; i++) {
            let x = (i * 239.73 + t * (id === 14 ? -65 : 13) + Math.sin(i * 3) * 33) % (W + 80);
            if (x < 0) x += W + 80;
            let y = (i * 103.4 + t * (id === 14 ? 190 : id === 15 ? 38 : -22)) % (H + 60);
            if (y < 0) y += H + 60;
            if (id === 14) {
                ctx.strokeStyle = '#e5f7ff4b'; ctx.lineWidth = 1.4;
                ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y + 22); ctx.stroke();
            } else if (id === 15) {
                ctx.fillStyle = '#eaffffd0'; ctx.beginPath(); ctx.arc(x, y, 1.2 + i % 3, 0, Math.PI * 2); ctx.fill();
            } else if (id === 2 || id === 9) {
                ctx.fillStyle = '#ffe5a859'; ctx.fillRect(x, y, 2 + i % 4, 2 + i % 3);
            } else {
                ctx.globalAlpha = .23 + .24 * Math.sin(t * 2 + i);
                ctx.fillStyle = id === 6 || id === 13 ? '#aaffdc' : '#e9bcff';
                ctx.beginPath(); ctx.arc(x, y, 1.3 + i % 3, 0, Math.PI * 2); ctx.fill();
            }
        }
        ctx.restore();
    }
    function vignette() { const g = ctx.createRadialGradient(W / 2, H * .48, H * .18, W / 2, H * .52, H * .78); g.addColorStop(0, '#0000'); g.addColorStop(1, '#07102e72'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    function render(t) { const st = game?.stage || backgroundStage; ctx.save(); ctx.clearRect(0, 0, W, H); sky(st, t, state === 'TITLE'); drawAtmosphere(st, t); if (state === 'TITLE') {
        for (let i = 0; i < 11; i++) {
            let tt = (t * .27 + i * .18) % 1, z = 140 - tt * 127;
            drawEnemy({ type: ENEMY_TYPES[i % 10], x: 150 + (i * 173) % 720, y: 260 + (i * 61) % 250, z, size: 75, seed: i, color: st.accent, inner: '#fff2c7' }, t);
        }
    }
    else if (game) {
        if (settings.shake && shake > 0) {
            ctx.translate(rnd(-shake, shake), rnd(-shake, shake));
            shake = Math.max(0, shake - .42);
        }
        const objects = [...game.enemies.map(o => ({ o, k: 0 })), ...game.obstacles.map(o => ({ o, k: 1 }))].sort((a, b) => b.o.z - a.o.z);
        for (let ent of objects)
            ent.k ? drawObstacle(ent.o, t) : drawEnemy(ent.o, t);
        if (game.boss)
            drawBoss(game.boss, t);
        for (let b of game.projectiles)
            drawBullet(b, t);
        drawParticles();
        drawPlayer(t);
        if (game.player.invuln > 0 && settings.visual === 'modern')
            glow(game.player.x, game.player.y, 57, '#ffffff', .06);
    } vignette(); drawScanlines(); ctx.restore(); }
    /* Gameplay / progression */
    function seeded(seed) { let v = seed >>> 0; return () => { v ^= v << 13; v ^= v >>> 17; v ^= v << 5; return (v >>> 0) / 4294967296; }; }
    function makeGame(mode = 'arcade', startAt = 0) { const casual = mode === 'casual', practice = mode === 'practice'; return { mode, casual, practice, scoreAttack: mode === 'scoreAttack', score: 0, lives: casual ? 5 : 3, extends: 0, continues: 0, stageIndex: startAt, stage: STAGES[startAt], player: { x: W * .5, y: H * .65, vx: 0, vy: 0, invuln: 0, fireCd: 0, firing:false, pose:'hover',poseTimer:0,poseBlend:0,hitAnim:0,landingTime:0,lastGround:false }, enemies: [], obstacles: [], projectiles: [], boss: null, time: 0, stageTime: 0, distance: 0, phase: 'intro', intro: 2.4, clearTime: 0, spawnTime: 4, obstacleTime: 5, bonusCount: 0, gauntletIdx: 0, rng: seeded(startAt * 11987 + 2729), bossSpawned: false, shots: 0, hits: 0, kills: 0 }; }
    function begin(mode = 'arcade', stage = 0) { audio.unlock(); audio.play('ui'); game = makeGame(mode, stage); particles = []; state = 'PLAYING'; overlay.innerHTML = ''; hud.classList.remove('hidden'); pauseBtn.classList.remove('hidden'); save.settings.difficulty = (mode === 'practice' || mode === 'scoreAttack') ? 'arcade' : mode; settings = save.settings; persist(); updateHud(); stageIntro(); canvas.focus({ preventScroll: true }); }
    function stageIntro() { game.stage = STAGES[game.stageIndex]; backgroundStage = game.stage; game.phase = 'intro'; game.intro = 2.4; game.stageTime = 0; game.spawnTime = 3.6; game.obstacleTime = 5; game.enemies = []; game.obstacles = []; game.projectiles = []; game.boss = null; game.bossSpawned = false; game.gauntletIdx = 0; game.bonusCount = 0; game.rng = seeded(game.stageIndex * 11987 + 2729); game.player.invuln = 1.5; game.player.fireCd = .04; bossUi.classList.add('hidden'); audio.changeTrack(game.stageIndex % 2 === 0 ? 'main' : 'even'); showNotice(`STAGE ${String(game.stageIndex + 1).padStart(2, '0')} · ${game.stage.name}`, 2.25); updateHud(); }
    function showNotice(message, duration = 2) { notice.textContent = message; notice.classList.add('active'); noticeUntil = clock + duration; }
    function updateHud() { if (!game)
        return; hudScore.textContent = pad(game.score); hudHi.textContent = pad(Math.max(save.hi, save.casualHi, game.score)); hudStage.textContent = pad(game.stageIndex + 1, 2) + ' / 18'; hudLives.textContent = '× ' + pad(game.lives, 2); if (game.boss) {
        bossUi.classList.remove('hidden');
        bossName.textContent = game.boss.name;
        bossFill.style.width = (Math.max(0, game.boss.hp) / game.boss.maxHp * 100).toFixed(1) + '%';
    }
    else
        bossUi.classList.add('hidden'); }
    function scorePoints(n) { if (!game)
        return; game.score += n; if (!game.practice) {
        const next = Math.floor(game.score / 200000);
        if (next > game.extends) {
            let count = Math.min(3, next - game.extends);
            game.lives = Math.min(9, game.lives + count);
            game.extends = next;
            showNotice('EXTRA LIFE ✦', 1.3);
            audio.play('extra');
        }
    } if (game.mode === 'arcade')
        save.hi = Math.max(save.hi, game.score);
    else if (game.mode === 'casual')
        save.casualHi = Math.max(save.casualHi, game.score); updateHud(); }
    function damage() { const p = game.player; if (p.invuln > 0 || game.phase === 'clear' || game.phase === 'intro' || game.phase === 'bossDefeat')
        return; if (game.practice) {
        p.hitAnim=.46; p.invuln = 1.5;
        audio.play('hurt', .7);
        addParticle(p.x, p.y, '#ff8ecd', 18);
        return;
    } p.hitAnim=.50; game.lives--; p.invuln = 2.1; shake = 18; audio.play('hurt'); addParticle(p.x, p.y, '#ff8ecd', 35, 250); updateHud(); if (game.lives <= 0) {
        gameOver();
    } }
    function gameOver() { state = 'GAMEOVER'; save.unlocked = Math.max(save.unlocked, game.stageIndex + 1); persist(); audio.changeTrack(''); pauseBtn.classList.add('hidden'); let canContinue = game.continues < 2 && !game.scoreAttack; overlay.innerHTML = `<div class="panel-wrapper"><section class="panel"><h2>GAME OVER</h2><p>ITOの冒険はここでいったん終了。もう一度、空へ！</p><div class="results"><div class="result"><small>SCORE</small><strong>${pad(game.score)}</strong></div><div class="result"><small>STAGE</small><strong>${pad(game.stageIndex + 1, 2)} / 18</strong></div><div class="result"><small>DEFEATED</small><strong>${game.kills}</strong></div><div class="result"><small>CONTINUES</small><strong>${game.continues}</strong></div></div><div class="panel-actions">${canContinue ? '<button class="menu-btn primary" data-action="continue">CONTINUE</button>' : ''}<button class="menu-btn" data-action="restart">RETRY</button><button class="menu-btn ghost" data-action="title">TITLE</button></div></section></div>`; }
    function continueGame() { if (!game || game.continues >= 2)
        return; audio.unlock(); game.continues++; game.lives = 3; state = 'PLAYING'; overlay.innerHTML = ''; pauseBtn.classList.remove('hidden'); stageIntro(); }
    function stageClear() { if (game.phase === 'clear')
        return; game.phase = 'clear'; game.clearTime = 2.8; game.projectiles = []; game.enemies = []; game.obstacles = []; game.boss = null; bossUi.classList.add('hidden'); scorePoints(game.stage.bonus ? game.bonusCount * 250 : 12000 + (game.stageIndex * 1600)); showNotice(game.stage.bonus ? 'BONUS COMPLETE!' : 'STAGE CLEAR!', 2.25); audio.play('clear'); audio.changeTrack(''); }
    function advanceStage() { if (game.scoreAttack) { finishScoreAttack(); return; } if (game.stageIndex >= 17) {
        endGame();
        return;
    } game.stageIndex++; save.unlocked = Math.max(save.unlocked, game.stageIndex + 1); persist(); stageIntro(); }
    function finishScoreAttack() {
        state = 'RESULT';
        const id = game.stageIndex + 1, previous = Number(save.stageHi[id] || 0);
        save.stageHi[id] = Math.max(previous, game.score); persist();
        audio.changeTrack('ending'); pauseBtn.classList.add('hidden');
        overlay.innerHTML = `<div class="panel-wrapper"><section class="panel"><h2>SCORE ATTACK COMPLETE</h2><p>STAGE ${pad(id, 2)} · ${game.stage.name}</p><div class="results"><div class="result"><small>SCORE</small><strong>${pad(game.score)}</strong></div><div class="result"><small>BEST</small><strong>${pad(save.stageHi[id])}</strong></div></div><div class="panel-actions"><button class="menu-btn primary" data-action="retry-score">RETRY STAGE</button><button class="menu-btn" data-action="score-menu">STAGE SELECT</button><button class="menu-btn ghost" data-action="title">TITLE</button></div></section></div>`;
    }
    function endGame() { state = 'ENDING'; if (!game.practice && !game.scoreAttack) save.clears++; save.unlocked = 18; persist(); audio.changeTrack('ending'); pauseBtn.classList.add('hidden'); hud.classList.add('hidden'); overlay.innerHTML = `<div class="hero-layout"><div class="hero-copy"><div class="eyebrow">MISSION COMPLETE · 18 / 18</div><h1 class="logo">THANK<br>YOU, ITO!</h1><p class="subtitle">空の果てに、光が戻った。</p><div class="results"><div class="result"><small>FINAL SCORE</small><strong>${pad(game.score)}</strong></div><div class="result"><small>ENEMIES</small><strong>${game.kills}</strong></div></div><div class="menu-buttons"><button class="menu-btn primary" data-action="restart">PLAY AGAIN</button><button class="menu-btn ghost" data-action="title">TITLE SCREEN</button></div></div><img class="hero-ito" alt="ITO" src="assets/ito.png"></div>`; }
    function renderPauseMenu() { overlay.innerHTML = `<div class="panel-wrapper"><section class="panel"><h2>PAUSED</h2><p>STAGE ${pad(game.stageIndex + 1, 2)} — ${game.stage.name}</p><div class="panel-actions"><button class="menu-btn primary" data-action="resume">RESUME</button><button class="menu-btn" data-action="options">SETTINGS</button><button class="menu-btn" data-action="confirm-restart">RESTART</button><button class="menu-btn ghost" data-action="confirm-title">TITLE</button></div></section></div>`; }
    function pause() { if (state !== 'PLAYING')
        return; state = 'PAUSED'; audio.pauseTrack(); renderPauseMenu(); }
    function resume() { if (state !== 'PAUSED')
        return; state = 'PLAYING'; overlay.innerHTML = ''; audio.unlock(); audio.resumeTrack(); canvas.focus({ preventScroll: true }); }
    function getDifficulty() { return game.casual ? { speed: .78, bullet: .75, density: .8, hp: .80 } : { speed: 1, bullet: 1, density: 1, hp: 1 }; }
    function spawnEnemy(type, x, y, z = FAR) { let num = ENEMY_TYPES.indexOf(type); const diff = getDifficulty(), r = game.rng; let size = 76 + (num === 5 ? 35 : 0) + (num === 7 ? 17 : 0); let hp = [1, 1, 2, 2, 2, 3, 1, 2, 3, 2][num]; let e = { type, x, y, baseX: x, baseY: y, z, size, hp, maxHp: hp, hitRadius: ([35, 44, 36, 42, 34, 40, 30, 33, 40, 35][num]), seed: r() * 100, age: 0, shotCount: 0, fireAt: .8 + r() * .6, movement: num % 5, points: (num + 1) * 900, color: game.stage.accent, inner: ['#fff4bb', '#fff4e8', '#b0fcff', '#ffccda'][num % 4], phase: 0 }; game.enemies.push(e); }
    function spawnWave() {
        if (game.enemies.length > 35)
            return;
        const r = game.rng, stage = game.stageIndex, pool = STAGE_RULES[stage].enemies, n = 2 + Math.floor(r() * Math.min(5, 3 + stage / 4)), type = ENEMY_TYPES[pool[Math.floor(r() * pool.length)]], form = Math.floor(r() * 5);
        for (let i = 0; i < n; i++) {
            const middle = (n - 1) / 2, shift = i - middle;
            let x = W * .5 + shift * 135 + (r() - .5) * 35, y = 390 + (r() - .5) * 165;
            if (form === 1) {
                x = 130 + i * (700 / Math.max(1, n - 1));
                y = 370 + Math.abs(shift) * 33;
            }
            if (form === 2) {
                x = 480 + Math.sin((i / n) * Math.PI * 2) * 320;
                y = 350 + Math.cos((i / n) * Math.PI * 2) * 170;
            }
            if (form === 3) {
                x = 160 + Math.floor(i / 2) * 180 + (i % 2) * 35;
                y = 250 + (i % 2) * 255;
            }
            if (form === 4) {
                x = 180 + r() * 600;
                y = 290 + r() * 250;
            }
            spawnEnemy(type, clamp(x, 70, 890), clamp(y, 170, 615), FAR + r() * 8 + i * (form === 3 ? 12 : 2));
        }
    }
    function spawnObstacle() { const r = game.rng; if (game.obstacles.length > 28)
        return; const n = r() < .35 ? 3 : 1; let lane = Math.floor(r() * 5); for (let i = 0; i < n; i++) {
        let x = (n === 1 ? 150 + r() * 660 : 150 + ((i + lane) % 4) * 210 + (r() - .5) * 60);
        let y = 620 + r() * 28;
        let choices = STAGE_RULES[game.stageIndex].obstacles;
        let kind = choices[Math.floor(r() * choices.length)];
        if (kind === 5 || kind === 9)
            y = 270 + r() * 160;
        let obs = { x, y, z: FAR + r() * 24, kind, size: 82 + r() * 36, hitRadius: kind === 9 ? 38 : kind === 5 ? 48 : 31, age: 0 };
        game.obstacles.push(obs);
    } }
    function firePlayer() { if (!game || game.phase === 'clear' || game.phase === 'intro' || game.phase === 'bossDefeat')
        return; const p = game.player; let aimX = p.x + 15, aimY = p.y - 22; if (settings.autoAim) {
        let candidates = game.enemies.filter(e => e.z < 85 && e.z > 16).map(e => ({ x: e.x, y: e.y, d: dist2(e.x, e.y, p.x, p.y) }));
        if (game.boss && game.boss.z < 60)
            candidates.push({ x: game.boss.x, y: game.boss.y, d: dist2(game.boss.x, game.boss.y, p.x, p.y) });
        candidates.sort((a, b) => a.d - b.d);
        if (candidates.length && candidates[0].d < 175 ** 2) {
            aimX = lerp(aimX, candidates[0].x, .32);
            aimY = lerp(aimY, candidates[0].y, .32);
        }
    } const b = { kind: 'friendly', x: aimX, y: aimY, z: NEAR + 1, prevZ: NEAR, age: 0, speed: 217 }; game.projectiles.push(b); game.shots++; if (game.projectiles.length > 110)
        game.projectiles.shift(); audio.play('shot', .6); if (!settings.reducedParticles)
        addParticle(p.x + 14, p.y - 31, '#f9fcff', 3, 45); }
    function fireEnemy(e, spread = 0, angle = 0) { if (game.projectiles.length > 105)
        return; let p = game.player; const aimX = clamp(p.x + p.vx * .28 + spread, 50, 910), aimY = clamp(p.y + p.vy * .22, 110, 650); let b = { kind: 'hostile', x: e.x, y: e.y, z: e.z, prevZ: e.z, originX: e.x, originY: e.y, aimX, aimY, initialZ: e.z, speed: (42 + game.stageIndex * .9) * getDifficulty().bullet, r: e.type === 'golem' ? 21 : 15, color: e.type === 'crystal' ? '#fda6f1' : '#ff9279', age: 0 }; game.projectiles.push(b); }
    function createBoss(kind, name = '', scaled = 1) { const diff = getDifficulty(), n = game.stageIndex; const maxHp = Math.round((26 + n * 2.5 + (game.stage.gauntlet ? 4 : 0)) * scaled * diff.hp); return { kind, colors: BOSS_COLORS[kind % 10], name: name || game.stage.bossName, x: W * .5, y: 360, z: 88, age: 0, hp: maxHp, maxHp, flash: 0, fireCd: 1.8, attackAnim:0, defeated:false, defeatTime:0, isAkari:false, phase: 0, hitRadius: game.stage.gauntlet ? 92 : 110, spawn: 0, pattern: 0 }; }
    function spawnBoss() { game.bossSpawned = true; game.phase = 'boss'; game.enemies = []; game.obstacles = []; game.projectiles = game.projectiles.filter(b => b.kind === 'friendly'); const type = game.stage.bossType; game.boss = createBoss(type, game.stage.bossName); audio.play('boss'); audio.changeTrack('boss'); showNotice('WARNING · ' + game.stage.bossName, 2); updateHud(); }
    function spawnGauntletBoss() { const kinds=[0,3,6,2,8,4,9],idx=game.gauntletIdx,kind=kinds[idx],isFinal=idx===6;
        game.boss=createBoss(kind,isFinal?'AKARI · FINAL COMMANDER':`GUARDIAN ${idx+1} / 7`,isFinal?2.05:.74);
        game.boss.isAkari=isFinal;
        if(isFinal){game.boss.hitRadius=95;game.boss.x=480;game.boss.y=365;}
        game.boss.spawn=0;game.phase='boss';audio.changeTrack(isFinal?'final':'boss');audio.play('boss');
        showNotice(isFinal?'AKARI · THE FINAL ENCOUNTER':'BOSS '+(idx+1)+' / 7',2.2);updateHud();
    }
    function bossAttack(b) {
        b.attackAnim=.56;
        if(b.isAkari){
            const phase=b.hp/b.maxHp<.33?2:b.hp/b.maxHp<.66?1:0;
            const pattern=(b.pattern++)%4;
            const emitter={x:b.x,y:b.y,z:b.z,type:'ring'};
            const num=pattern===0?3+phase*2:pattern===1?5+phase*2:pattern===2?7+phase:3+phase;
            for(let i=0;i<num;i++){
                if(game.projectiles.length>95)break;
                const spread=pattern===0?(i-(num-1)/2)*76:pattern===1?Math.sin(i*Math.PI*2/num)*190:pattern===2?(i-(num-1)/2)*56:Math.sin(i*3.5)*105;
                const oldLen=game.projectiles.length;
                fireEnemy(emitter,spread);
                const bullet=game.projectiles[game.projectiles.length-1];
                if(game.projectiles.length===oldLen||!bullet)break;
                bullet.color=phase===2?'#ff477c':pattern===2?'#ffd37b':'#ffb3d7';
                bullet.r=15+phase*2;
                bullet.aimY=clamp(game.player.y+(pattern===1?Math.cos(i*Math.PI*2/num)*160:pattern===2?(i%2?85:-85):0),115,640);
                bullet.speed=39+phase*5+(pattern===3?9:0);
            }
            audio.play('warning',.42);
            return;
        }
        const phase = b.hp / b.maxHp < .33 ? 2 : b.hp / b.maxHp < .66 ? 1 : 0, pattern = (b.pattern++) % 5;
        let count = (pattern === 3 ? 7 : 3) + (phase >= 1 ? 2 : 0) + (phase >= 2 ? 2 : 0);
        const fake = { x: b.x, y: b.y, z: b.z, type: 'ring' };
        if (pattern === 1 || pattern === 4) {
            for (let i = 0; i < count; i++) {
                fireEnemy(fake, (i - (count - 1) / 2) * 90);
                const bb = game.projectiles.at(-1);
                bb.speed = 35 + game.stageIndex * 1.2 + phase * 6;
                bb.color = b.colors[0];
            }
        }
        else {
            for (let i = 0; i < count; i++) {
                fireEnemy(fake, Math.sin(i / count * Math.PI * 2) * 220);
                let bullet = game.projectiles.at(-1);
                bullet.aimY = clamp(game.player.y + Math.cos(i / count * Math.PI * 2) * 145, 100, 645);
                bullet.color = b.colors[1];
                bullet.speed = 43 + phase * 7 + game.stageIndex * .8;
            }
        }
        audio.play('warning', .24);
    }
    function destroyEnemy(e) { let p = projection(e.x, e.y, e.z); addParticle(p.x, p.y, e.color, 18, 125); audio.play('destroy', .6); scorePoints(e.points); game.kills++; const i = game.enemies.indexOf(e); if (i >= 0)
        game.enemies.splice(i, 1); }
    function destroyBoss() { const b=game.boss;if(!b)return;
        if(b.isAkari){
            b.hp=0;b.defeated=true;b.defeatTime=2.45;game.phase='bossDefeat';
            game.projectiles=[];game.enemies=[];game.obstacles=[];
            scorePoints(140000);game.kills++;shake=8;audio.play('clear');
            addParticle(projection(b.x,b.y,b.z).x,projection(b.x,b.y,b.z).y,'#ffd6ee',45,170);
            showNotice('AKARI DEFEATED',2.0);updateHud();return;
        }
        let p = projection(b.x, b.y, b.z); shake = 23; addParticle(p.x, p.y, b.colors[0], 90, 370); addParticle(p.x, p.y, b.colors[1], 70, 280); audio.play('blast'); scorePoints(60000 + game.stageIndex * 6500); game.kills++; game.boss = null; bossUi.classList.add('hidden'); if (game.stage.gauntlet) {
        game.gauntletIdx++;
        if (game.gauntletIdx < 7) {
            game.phase = 'intermission';
            game.clearTime = 2.7;
            showNotice('GUARDIAN DEFEATED', 2);
            audio.play('clear');
            return;
        }
    } stageClear(); }
    function updatePlayer(dt) {
        const p = game.player;
        if(p.invuln>0)p.invuln=Math.max(0,p.invuln-dt);
        p.poseTimer=(p.poseTimer||0)+dt;
        p.poseBlend=Math.max(0,(p.poseBlend||0)-dt);
        p.hitAnim=Math.max(0,(p.hitAnim||0)-dt);
        const nowGround=p.y>=H*.78;
        if(nowGround&&!p.lastGround)p.landingTime=.22;
        p.landingTime=Math.max(0,(p.landingTime||0)-dt);
        p.lastGround=nowGround;
        p.fireCd = Math.max(0, p.fireCd - dt);
        let dx = 0, dy = 0;
        if (keys.has('arrowleft') || keys.has('a'))
            dx--;
        if (keys.has('arrowright') || keys.has('d'))
            dx++;
        if (keys.has('arrowup') || keys.has('w'))
            dy--;
        if (keys.has('arrowdown') || keys.has('s'))
            dy++;
        const pads = navigator.getGamepads?.() || [];
        gamepadMove = { x: 0, y: 0, fire: false };
        for (const pad of pads) {
            if (!pad)
                continue;
            let ax = pad.axes?.[0] || 0, ay = pad.axes?.[1] || 0;
            gamepadMove.x = Math.abs(ax) > .15 ? ax : ((pad.buttons?.[15]?.pressed ? 1 : 0) - (pad.buttons?.[14]?.pressed ? 1 : 0));
            gamepadMove.y = Math.abs(ay) > .15 ? ay : ((pad.buttons?.[13]?.pressed ? 1 : 0) - (pad.buttons?.[12]?.pressed ? 1 : 0));
            gamepadMove.fire = !!(pad.buttons?.[0]?.pressed || pad.buttons?.[7]?.pressed);
            break;
        }
        if (gamepadMove.x || gamepadMove.y) {
            dx = gamepadMove.x;
            dy = gamepadMove.y;
        }
        else {
            const mag = Math.hypot(dx, dy);
            if (mag > 1) {
                dx /= mag;
                dy /= mag;
            }
        }
        let beforeX = p.x, beforeY = p.y;
        if (touchId === null && mouseMoved && Math.abs(dx) + Math.abs(dy) < .01 && Math.abs(gamepadMove.x) + Math.abs(gamepadMove.y) < .01) {
            p.x = lerp(p.x, mouseX, Math.min(1, dt * 25));
            p.y = lerp(p.y, mouseY, Math.min(1, dt * 25));
        }
        else {
            p.x += dx * W * .86 * dt;
            p.y += dy * H * .91 * dt;
        }
        p.x = clamp(p.x, 90, 870);
        p.y = clamp(p.y, 120, 640);
        p.vx = lerp(p.vx, (p.x - beforeX) / dt, .34);
        p.vy = lerp(p.vy, (p.y - beforeY) / dt, .34);
        const firing = keys.has(' ') || keys.has('z') || keys.has('x') || mouseHeld || touchId !== null || gamepadMove.fire || settings.autoFire;
        p.firing=firing;
        if (firing && p.fireCd <= 0) {
            firePlayer();
            p.fireCd = 1 / 7.5;
        }
    }
    function updateEnemies(dt) {
        const diff = getDifficulty(), speed = (47 + game.stageIndex * 1.45) * diff.speed;
        for (let i = game.enemies.length - 1; i >= 0; i--) {
            const e = game.enemies[i];
            e.z -= speed * dt;
            e.age += dt;
            let k = e.movement;
            e.x = e.baseX + (k === 0 ? Math.sin(e.age * 2 + e.seed) * 40 : k === 1 ? Math.sin(e.age * 4 + e.seed) * 95 : k === 2 ? Math.cos(e.age * 2.4 + e.seed) * 70 : k === 3 ? Math.sin(e.age * 5 + e.seed) * 145 : Math.sin(e.age * 3 + e.seed) * 70);
            e.y = e.baseY + (k === 2 ? Math.sin(e.age * 4 + e.seed) * 90 : k === 4 ? Math.sin(e.age * 3 + e.seed) * 60 : Math.sin(e.age * 2 + e.seed) * 30);
            e.x = clamp(e.x, 65, 895);
            e.y = clamp(e.y, 160, 625);
            if (e.z < 82 && e.z > 24 && e.shotCount < ((game.stageIndex >= 9) ? 2 : 1) && e.age > e.fireAt) {
                e.shotCount++;
                e.fireAt = e.age + 1.3;
                fireEnemy(e);
                if (e.type === 'ring' && game.stageIndex > 6) {
                    fireEnemy(e, -90);
                    fireEnemy(e, 90);
                }
            }
            if (e.z <= NEAR + 1) {
                if (dist2(e.x, e.y, game.player.x, game.player.y) < (e.hitRadius + (game.casual ? 13 : 18)) ** 2)
                    damage();
                game.enemies.splice(i, 1);
            }
        }
    }
    function updateObstacles(dt) { const speed = (47 + game.stageIndex * 1.45) * getDifficulty().speed; for (let i = game.obstacles.length - 1; i >= 0; i--) {
        const o = game.obstacles[i];
        o.z -= speed * dt;
        o.age += dt;
        if (o.kind === 9)
            o.x += Math.sin(o.age * 3) * .8;
        if (o.z <= NEAR + 1) {
            if (game.stage.bonus) {
                if (dist2(o.x, o.y, game.player.x, game.player.y) < (o.hitRadius + 90) ** 2) {
                    game.bonusCount++;
                    scorePoints(1800);
                    audio.play('bonus', .45);
                    addParticle(o.x, o.y, '#ffdd8a', 19, 120);
                }
            }
            else if (dist2(o.x, o.y, game.player.x, game.player.y) < (o.hitRadius + (game.casual ? 14 : 19)) ** 2)
                damage();
            game.obstacles.splice(i, 1);
        }
    } }
    function updateBullets(dt) {
        for (let i = game.projectiles.length - 1; i >= 0; i--) {
            const b = game.projectiles[i];
            if (!b)
                continue;
            b.age += dt;
            b.prevZ = b.z;
            b.z += (b.kind === 'friendly' ? 1 : -1) * b.speed * dt;
            if (b.kind === 'friendly') {
                let hit = false;
                for (let j = game.enemies.length - 1; j >= 0; j--) {
                    let e = game.enemies[j];
                    if (b.prevZ > e.z + 6 || b.z < e.z - 6)
                        continue;
                    if (dist2(b.x, b.y, e.x, e.y) > (e.hitRadius + 17) ** 2)
                        continue;
                    e.hp--;
                    e.color = e.hp < 1 ? '#ffffff' : e.color;
                    audio.play('hit', .34);
                    game.hits++;
                    hit = true;
                    let pp = projection(e.x, e.y, e.z);
                    addParticle(pp.x, pp.y, '#fff7b8', 5, 75);
                    if (e.hp <= 0)
                        destroyEnemy(e);
                    break;
                }
                if (!hit && game.boss && !game.boss.defeated) {
                    let e = game.boss;
                    if (!(b.prevZ > e.z + 5 || b.z < e.z - 5) && dist2(b.x, b.y, e.x, e.y) < (e.hitRadius + 16) ** 2) {
                        e.hp--;
                        e.flash = .12;
                        audio.play('hit', .35);
                        game.hits++;
                        hit = true;
                        addParticle(...[projection(e.x, e.y, e.z).x, projection(e.x, e.y, e.z).y], '#ffffcf', 3, 85);
                        if (e.hp <= 0) {
                            destroyBoss();
                            return;
                        }
                        else
                            updateHud();
                    }
                }
                if (hit || b.z > FAR + 50) {
                    game.projectiles.splice(i, 1);
                    continue;
                }
            }
            else {
                let mix = clamp((b.initialZ - b.z) / (b.initialZ - NEAR), 0, 1);
                b.x = lerp(b.originX, b.aimX, smooth(mix));
                b.y = lerp(b.originY, b.aimY, smooth(mix));
                if (b.z <= NEAR + 1) {
                    if (dist2(b.x, b.y, game.player.x, game.player.y) < (b.r + (game.casual ? 13 : 17)) ** 2)
                        damage();
                    game.projectiles.splice(i, 1);
                }
            }
        }
    }
    function updateBoss(dt) { let b=game.boss;if(!b)return;
        if(b.defeated)return;
        b.attackAnim=Math.max(0,(b.attackAnim||0)-dt);
        b.age+=dt; b.z = Math.max(35, b.z - 65 * dt); b.x = 480 + Math.sin(b.age * (b.kind === 9 ? 1.22 : .78)) * (b.isAkari?170:145) + Math.sin(b.age * .31) * 45; b.y = (b.isAkari?238:366) + Math.sin(b.age * .93 + b.kind) * (b.isAkari?43:72); b.flash = Math.max(0, b.flash - dt); if (b.z > 35)
        return; b.fireCd -= dt; if (b.fireCd <= 0) {
        bossAttack(b);
        b.fireCd = (game.casual ? 1.55 : 1.35) - (1 - b.hp / b.maxHp) * .35;
    } }
    function tick(dt) {
        clock += dt;
        if (noticeUntil && clock > noticeUntil) {
            notice.classList.remove('active');
            noticeUntil = 0;
        }
        if (state !== 'PLAYING')
            return;
        const g = game;
        g.time += dt;
        g.distance += ((g.stage.bonus ? 66 : 47) + g.stageIndex * 1.45) * dt;
        updateParticles(dt);
        if (g.phase === 'intro') {
            g.intro -= dt;
            updatePlayer(dt);
            if (g.intro <= 0) {
                g.phase = g.stage.bonus ? 'bonus' : 'waves';
                showNotice(g.stage.bonus ? 'COLLECT THE STARS!' : 'GO, ITO!', 1);
            }
            return;
        }
        if (g.phase === 'clear') {
            g.clearTime -= dt;
            updatePlayer(dt);
            if (g.clearTime <= 0)
                advanceStage();
            return;
        }
        if (g.phase === 'intermission') {
            g.clearTime -= dt;
            updatePlayer(dt);
            if (g.clearTime <= 0)
                spawnGauntletBoss();
            return;
        }
        if(g.phase==='bossDefeat'){
            g.boss.defeatTime-=dt;
            updateParticles(dt);
            updatePlayer(dt);
            if(g.boss.defeatTime<=0){g.boss=null;stageClear();}
            return;
        }
        g.stageTime += dt;
        updatePlayer(dt);
        if (g.phase === 'bonus') {
            g.obstacleTime -= dt;
            if (g.obstacleTime <= 0) {
                spawnObstacle();
                g.obstacleTime = .65 + g.rng() * .35;
            }
            if (g.stageTime >= 35) {
                stageClear();
                return;
            }
        }
        else if (g.phase === 'waves') {
            g.spawnTime -= dt;
            g.obstacleTime -= dt;
            if (g.spawnTime <= 0) {
                spawnWave();
                g.spawnTime = (2.1 + g.rng() * 1.1) * (g.casual ? 1.25 : 1);
            }
            if (g.obstacleTime <= 0) {
                spawnObstacle();
                g.obstacleTime = (1.85 + g.rng() * 1.3) * (g.casual ? 1.25 : 1);
            }
            if (g.stageTime >= g.stage.bossTime) {
                if (g.stage.gauntlet) {
                    g.phase = 'intermission';
                    g.clearTime = 1.5;
                    g.enemies = [];
                    g.obstacles = [];
                    showNotice('THE FINAL TRIAL', 2);
                    audio.play('boss');
                    audio.changeTrack('boss');
                }
                else
                    spawnBoss();
            }
        }
        updateEnemies(dt);
        updateObstacles(dt);
        updateBullets(dt);
        updateBoss(dt);
    }
    /* UI, menus, and input */
    function home() { state = 'TITLE'; game = null; particles = []; backgroundStage = STAGES[0]; audio.changeTrack('title'); hud.classList.add('hidden'); pauseBtn.classList.add('hidden'); showTitle(); }
    function showTitle(){
        overlay.innerHTML=`<div class="title-art-screen">
            <img class="title-key-art" src="assets/title_art.webp" alt="飛行するITOと背後に控えるAKARI。空中都市のゲームタイトルビジュアル">
            <div class="title-dock"><div class="title-dock-head"><span>ITO × AKARI</span><span>18 STAGES · ARCADE</span></div>
            <button class="menu-btn primary" data-action="start">▶ START GAME</button>
            <div class="title-row"><button class="menu-btn" data-action="mode">MODES</button><button class="menu-btn" data-action="practice-menu">PRACTICE</button></div>
            <div class="title-row"><button class="menu-btn ghost" data-action="options">SETTINGS</button><button class="menu-btn ghost" data-action="help">HOW TO PLAY</button></div>
            <div class="title-score">BEST SCORE ${pad(Math.max(save.hi,save.casualHi))} · SPACE / Z TO FIRE</div></div>
        </div>`;
    }
    function modes() { overlay.innerHTML = `<div class="panel-wrapper"><section class="panel"><h2>SELECT MODE</h2><p>ITOと一緒に、地平線の向こうへ。ゲームの進行速度は同じですが、回避難度と残機が異なります。</p><div class="panel-actions"><button class="menu-btn primary" data-action="start-arcade">ARCADE — STANDARD</button><button class="menu-btn" data-action="start-casual">CASUAL — EASY</button><button class="menu-btn" data-action="practice-menu">PRACTICE — STAGES</button>${save.clears > 0 ? '<button class="menu-btn" data-action="score-menu">SCORE ATTACK — UNLOCKED</button>' : ''}<button class="menu-btn ghost" data-action="title">BACK</button></div></section></div>`; }
    function stageSelect() { let chips = STAGES.map((s, i) => `<button class="stage-chip ${i + 1 === save.unlocked ? 'current' : ''}" data-action="stage-${i}" ${i + 1 > save.unlocked ? 'disabled' : ''} title="${s.name}">${pad(i + 1, 2)}</button>`).join(''); overlay.innerHTML = `<div class="panel-wrapper"><section class="panel"><h2>STAGE PRACTICE</h2><p>解放済みのステージを自由に練習。残機無制限、ハイスコアは記録されません。</p><div class="stage-select">${chips}</div><div class="panel-actions"><button class="menu-btn primary" data-action="akari-practice">AKARI · FINAL BOSS PRACTICE</button><button class="menu-btn ghost" data-action="title">BACK</button></div></section></div>`; }
    function scoreSelect() {
        if (save.clears < 1) { modes(); return; }
        const chips = STAGES.map((s, i) => `<button class="stage-chip" data-action="score-stage-${i}" title="${s.name}">${pad(i + 1, 2)}</button>`).join('');
        overlay.innerHTML = `<div class="panel-wrapper"><section class="panel"><h2>SCORE ATTACK</h2><p>クリア記念モード。好きな1ステージのスコアを競おう。コンティニュー不可、ステージ別ベスト記録あり。</p><div class="stage-select">${chips}</div><div class="panel-actions"><button class="menu-btn ghost" data-action="mode">BACK</button></div></section></div>`;
    }
    function settingsMenu() {
        const bool = (k, on, off) => `<select data-setting="${k}"><option value="true" ${settings[k] ? 'selected' : ''}>${on}</option><option value="false" ${!settings[k] ? 'selected' : ''}>${off}</option></select>`;
        const opt = (k, choices) => `<select data-setting="${k}">${choices.map(([v, label]) => `<option value="${v}" ${settings[k] === v ? 'selected' : ''}>${label}</option>`).join('')}</select>`;
        const range = (k) => `<input type="range" min="0" max="1" step="0.05" value="${settings[k]}" data-setting="${k}" aria-label="${k}">`;
        overlay.innerHTML = `<div class="panel-wrapper"><section class="panel"><h2>SETTINGS</h2><div class="setting-row"><label>VISUAL STYLE</label>${opt('visual', [['modern', 'MODERN'], ['classic', 'CLASSIC']])}</div><div class="setting-row"><label>MASTER VOLUME</label>${range('master')}</div><div class="setting-row"><label>MUSIC VOLUME</label>${range('music')}</div><div class="setting-row"><label>SFX VOLUME</label>${range('effects')}</div><div class="setting-row"><label>SCREEN SHAKE</label>${bool('shake', 'ON', 'OFF')}</div><div class="setting-row"><label>SCANLINES</label>${bool('scanlines', 'ON', 'OFF')}</div><div class="setting-row"><label>REDUCED EFFECTS</label>${bool('reducedParticles', 'ON', 'OFF')}</div><div class="setting-row"><label>AUTO FIRE</label>${bool('autoFire', 'ON', 'OFF')}</div><div class="setting-row"><label>ASSISTED AIM</label>${bool('autoAim', 'ON', 'OFF')}</div><div class="panel-actions"><button class="menu-btn primary" data-action="settings-back">SAVE & BACK</button></div></section></div>`;
    }
    function help() { overlay.innerHTML = `<div class="panel-wrapper"><section class="panel"><h2>HOW TO PLAY</h2><p><b>ITO</b>を操縦して18の幻想世界を突破しよう！ 地平線から迫る敵を撃ち、障害物と弾をかわし、巨大なボスを倒そう。</p><div class="keycaps"><span>移動</span><b>↑↓←→ / WASD</b><span>射撃</span><b>SPACE / Z / X</b><span>ポーズ</span><b>P / ESC</b><span>マウス</span><b>移動 ＋ 左クリック</b><span>ゲームパッド</span><b>左スティック ＋ A / RT</b><span>スマホ・タブレット</span><b>タッチ＆ドラッグで射撃</b></div><p>敵を撃破してスコア獲得。20万点ごとに残機が増える。STAGE 05・12は星獣に乗ったボーナスステージ。被弾後はしばらく無敵。ゲーム進行中でも設定を変更できます。</p><div class="panel-actions"><button class="menu-btn primary" data-action="title">GOT IT!</button></div></section></div>`; }
    function confirmMenu(kind) { const message = kind === 'title' ? '現在のプレイを終了してタイトルに戻りますか？' : '現在のスコアと進行を破棄して最初からやり直しますか？'; overlay.innerHTML = `<div class="panel-wrapper"><section class="panel"><h2>ARE YOU SURE?</h2><p>${message}</p><div class="panel-actions"><button class="menu-btn primary" data-action="${kind === 'title' ? 'confirm-title-yes' : 'confirm-restart-yes'}">YES</button><button class="menu-btn" data-action="pause-menu">CANCEL</button></div></section></div>`; }
    function handleAction(action) {
        if (!action)
            return;
        audio.unlock();
        audio.play('ui', .5);
        if (action === 'start') {
            begin(settings.difficulty === 'casual' ? 'casual' : 'arcade', 0);
            return;
        }
        if (action === 'start-arcade') {
            begin('arcade');
            return;
        }
        if (action === 'start-casual') {
            begin('casual');
            return;
        }
        if (action.startsWith('score-stage-')) { begin('scoreAttack', Number(action.split('-')[2])); return; }
        if (action==='akari-practice'){
            begin('practice',17);game.phase='boss';game.stageTime=75;
            game.gauntletIdx=6;spawnGauntletBoss();game.player.invuln=3;
            return;
        }
        if (action.startsWith('stage-')) {
            begin('practice', Number(action.split('-')[1]));
            return;
        }
        switch (action) {
            case 'title':
                home();
                break;
            case 'mode':
                modes();
                break;
            case 'practice-menu':
                stageSelect();
                break;
            case 'score-menu':
                scoreSelect();
                break;
            case 'retry-score':
                begin('scoreAttack', game.stageIndex);
                break;
            case 'options':
                settingsMenu();
                break;
            case 'settings-back':
                persist();
                if (state === 'PAUSED')
                    renderPauseMenu();
                else if (state === 'PLAYING')
                    resume();
                else
                    showTitle();
                break;
            case 'help':
                help();
                break;
            case 'restart':
                begin(game?.mode || 'arcade', game?.scoreAttack ? game.stageIndex : 0);
                break;
            case 'continue':
                continueGame();
                break;
            case 'resume':
                resume();
                break;
            case 'pause-menu':
                pause();
                break;
            case 'confirm-title':
                confirmMenu('title');
                break;
            case 'confirm-restart':
                confirmMenu('restart');
                break;
            case 'confirm-title-yes':
                home();
                break;
            case 'confirm-restart-yes':
                begin(game.mode, game.practice ? game.stageIndex : 0);
                break;
            default: break;
        }
    }
    overlay.addEventListener('click', e => { const btn = e.target.closest('[data-action]'); if (btn)
        handleAction(btn.dataset.action); });
    overlay.addEventListener('input', e => { const el = e.target; if (!el.matches('[data-setting]'))
        return; let key = el.dataset.setting; settings[key] = el.type === 'range' ? Number(el.value) : el.value === 'true' ? true : el.value === 'false' ? false : el.value; save.settings = settings; audio.setVolumes(); persist(); });
    function canvasCoords(e) { let box = canvas.getBoundingClientRect(); return { x: (e.clientX - box.left) / box.width * W, y: (e.clientY - box.top) / box.height * H }; }
    canvas.addEventListener('pointerdown', e => { if (state !== 'PLAYING')
        return; audio.unlock(); let p = canvasCoords(e); if (e.pointerType === 'mouse') {
        mouseHeld = true;
        mouseMoved = true;
        mouseX = p.x;
        mouseY = p.y;
    }
    else if (touchId === null) {
        touchId = e.pointerId;
        touchX = p.x;
        touchY = p.y;
        mouseMoved = false;
    } try {
        canvas.setPointerCapture(e.pointerId);
    }
    catch { } e.preventDefault(); });
    canvas.addEventListener('pointermove', e => { if (state !== 'PLAYING')
        return; const p = canvasCoords(e); if (e.pointerType === 'mouse') {
        mouseMoved = true;
        mouseX = p.x;
        mouseY = p.y;
    }
    else if (e.pointerId === touchId && game) {
        game.player.x = clamp(game.player.x + (p.x - touchX) * 1.25, 90, 870);
        game.player.y = clamp(game.player.y + (p.y - touchY) * 1.25, 120, 640);
        touchX = p.x;
        touchY = p.y;
    } e.preventDefault(); });
    function releasePointer(e) { if (e.pointerType === 'mouse')
        mouseHeld = false; if (e.pointerId === touchId)
        touchId = null; }
    canvas.addEventListener('pointerup', releasePointer);
    canvas.addEventListener('pointercancel', releasePointer);
    window.addEventListener('pointerup', e => { if (e.pointerType === 'mouse')
        mouseHeld = false; });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener('keydown', e => {
        const key = e.key.toLowerCase();
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'escape'].includes(key))
            e.preventDefault();
        keys.add(key);
        if (e.repeat)
            return;
        if ((key === 'escape' || key === 'p') && state === 'PLAYING') {
            pause();
            return;
        }
        if ((key === 'escape' || key === 'p') && state === 'PAUSED') {
            resume();
            return;
        }
        if (key === 'enter' && state === 'TITLE') {
            const primary = overlay.querySelector('[data-action="start"]');
            if (primary)
                handleAction('start');
        }
        if (key === 'f' && state === 'PLAYING')
            toggleFullscreen();
    });
    window.addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => { keys.clear(); mouseHeld = false; touchId = null; if (state === 'PLAYING')
        pause(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'PLAYING')
        pause(); });
    pauseBtn.addEventListener('click', () => pause());
    async function toggleFullscreen() { const target = $('arcade'); try {
        if (document.fullscreenElement)
            await document.exitFullscreen();
        else if (target.requestFullscreen)
            await target.requestFullscreen();
    }
    catch { /* unsupported browser */ } }
    $('fullscreen').addEventListener('click', toggleFullscreen);
    // Lightweight diagnostic API for browser tests. Does not affect high-score storage.
    window.__HORIZON_RUSH__ = Object.freeze({ version: '2.2.0', getMusic: () => audio.getInfo(), getState: () => state, getStage: () => game?.stageIndex + 1 || 0, getScore: () => game?.score || 0, getStats: () => ({ lives: game?.lives, phase: game?.phase, elapsed: game?.stageTime, shots: game?.shots, kills: game?.kills, bossHp: game?.boss?.hp, bossMaxHp: game?.boss?.maxHp }), getEntities: () => ({ enemies: game?.enemies.length || 0, obstacles: game?.obstacles.length || 0, projectiles: game?.projectiles.length || 0, boss: !!game?.boss, finalAkari: !!game?.boss?.isAkari, itoPose: game?.player?.pose }), startPractice: i => begin('practice', clamp(Number(i) - 1, 0, 17)), startAkariDemo:()=>{begin('practice',17);game.phase='boss';game.stageTime=75;game.gauntletIdx=6;spawnGauntletBoss();game.player.invuln=4;}, advanceTime: seconds => { for (let i = 0; i < Math.floor(Math.min(250, seconds) * 60); i++)
            tick(FIXED); } });
    function checkGamepadMenu() {
        const pads = navigator.getGamepads?.() || [];
        let pressed = false;
        for (const pad of pads) {
            if (pad) { pressed = !!pad.buttons?.[9]?.pressed; break; }
        }
        if (pressed && !lastPad) {
            if (state === 'PLAYING') pause();
            else if (state === 'PAUSED') resume();
        }
        lastPad = pressed;
    }
    function frame(timestamp) { if (!lastFrame)
        lastFrame = timestamp; let delta = clamp((timestamp - lastFrame) / 1000, 0, .08); lastFrame = timestamp; accumulator += delta; let step = 0; while (accumulator >= FIXED && step < 5) {
        tick(FIXED);
        accumulator -= FIXED;
        step++;
    } if (step === 5)
        accumulator = 0; checkGamepadMenu(); audio.update(); render(timestamp / 1000); requestAnimationFrame(frame); }
    function boot() { if ($('loading'))
        $('loading').classList.add('hidden'); home(); requestAnimationFrame(frame); }
    if (ito.complete && ito.naturalWidth)
        boot();
    else {
        let started = false;
        const one = () => { if (started)
            return; started = true; boot(); };
        ito.addEventListener('load', one, { once: true });
        ito.addEventListener('error', one, { once: true });
        setTimeout(one, 2400);
    }
})();
