const AUDIO_BASE = './sounds/';

const Sound = {
  enabled: true,
  master: 0.9,
  clips: {},

  add(name, src, poolSize = 4) {
    const bank = [];
    for (let i = 0; i < poolSize; i++) {
      const a = new Audio(src);
      a.preload = 'auto';
      a.addEventListener('error', () => console.warn('[Sound] load error', name, src));
      bank.push(a);
    }
    this.clips[name] = { bank, i: 0 };
  },

  init() {
    this.clips = {}; // reset
    this.add('strike', AUDIO_BASE + 'Strike.mp3', 4);
    this.add('balls',  AUDIO_BASE + 'BallsCollide.mp3', 6);
    this.add('side',   AUDIO_BASE + 'Side.mp3', 4);
    this.add('hole',   AUDIO_BASE + 'Hole.mp3', 3);
    console.log('[Sound] init clips:', Object.keys(this.clips));
  },

  play(name, vol = 1) {
    const entry = this.clips[name];
    if (!entry) return console.warn('[Sound] unknown clip:', name);
    entry.i = (entry.i + 1) % entry.bank.length;
    const a = entry.bank[entry.i];
    a.volume = Math.max(0, Math.min(1, this.master * vol));
    try { a.currentTime = 0; } catch {}
    a.play().catch(err => console.warn('[Sound] play blocked:', err));
  },

  // Safari/iOS: unlock audio on first user gesture
  unlock() {
    Object.values(this.clips).forEach(({ bank }) =>
      bank.forEach(a => { a.muted = true; a.play().then(()=>{ a.pause(); a.currentTime=0; a.muted=false;}).catch(()=>{}); })
    );
  }
};