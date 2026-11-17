// Runtime for project visuals (see src/data/viz.ts and ProjectMedia.astro).
//
// One requestAnimationFrame loop drives every visual on the page. A visual only ticks while it
// is on screen. Each visual plays on its own when idle and hands control to the pointer on hover.

import { SCENES, type Scene, type SceneCtx } from './scenes';

type Pointer = { x: number; y: number; active: boolean };
type Ctl = { el: HTMLElement; visible: boolean; pointer: Pointer; tick: (t: number, dt: number) => void; dirty: boolean };

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ctls = new Set<Ctl>();
let raf = 0;
let last = 0;
let io: IntersectionObserver | null = null;

function loop(now: number) {
  const dt = Math.min(0.05, (now - (last || now)) / 1000);
  last = now;
  for (const c of ctls) {
    if (!c.el.isConnected) { ctls.delete(c); continue; }
    if (c.visible && (!reduce() || c.pointer.active || c.dirty)) { c.tick(now / 1000, dt); c.dirty = false; }
  }
  raf = ctls.size ? requestAnimationFrame(loop) : 0;
}
const ensureLoop = () => { if (!raf) { last = 0; raf = requestAnimationFrame(loop); } };

function trackPointer(el: HTMLElement, p: Pointer, onEnter?: () => void, onLeave?: () => void) {
  const host = (el.closest('.card') as HTMLElement) || el;
  host.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    p.x = clamp((e.clientX - r.left) / r.width);
    p.y = clamp((e.clientY - r.top) / r.height);
    if (!p.active) { p.active = true; el.classList.add('is-live'); onEnter?.(); }
  });
  host.addEventListener('pointerleave', () => { p.active = false; el.classList.remove('is-live'); onLeave?.(); });
}

function cssColors(el: HTMLElement) {
  const s = getComputedStyle(el);
  const g = (n: string, f: string) => s.getPropertyValue(n).trim() || f;
  return {
    bg: g('--bg-soft', '#141417'), surface: g('--surface', '#17171b'), text: g('--text', '#f0ede6'),
    muted: g('--muted', '#a3a09a'), faint: g('--faint', '#6e6c66'), accent: g('--accent', '#e8622c'),
    cool: g('--viz-cool', '#7aa7ff'), good: g('--viz-good', '#3ecf8e'), bad: g('--viz-bad', '#ff5d5d'),
    border: g('--border-strong', 'rgba(240,237,230,.16)'),
  };
}

/* ---------------------------------------------------------------- compare */
function compare(el: HTMLElement): Ctl {
  const a = el.querySelector<HTMLImageElement>('.pm-a')!;
  const b = el.querySelector<HTMLImageElement>('.pm-b')!;
  const lblA = el.querySelector<HTMLElement>('.pm-lbl-a')!;
  const lblB = el.querySelector<HTMLElement>('.pm-lbl-b')!;
  const opts: { src: string; label: string }[] = JSON.parse(el.dataset.options || '[]');
  let bi = 0, x = 0.5, phase = 0, lastPhase = 0;
  const setB = (i: number) => { bi = (i + opts.length) % opts.length; b.src = opts[bi].src; lblB.textContent = opts[bi].label; };
  // Preload the alternatives so switching never flashes.
  opts.slice(1).forEach((o) => { const im = new Image(); im.src = o.src; });
  if (opts.length > 1) {
    lblB.classList.add('is-switch');
    lblB.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); setB(bi + 1); });
  }
  const p: Pointer = { x: 0.5, y: 0.5, active: false };
  trackPointer(el, p);
  const c: Ctl = {
    el, visible: false, pointer: p, dirty: true,
    tick(_t, dt) {
      let target: number;
      if (p.active) target = p.x;
      else if (reduce()) target = 0.5;
      else {
        phase += dt * 0.55;
        target = 0.5 + 0.34 * Math.sin(phase);
        // Switch the comparison each time the slider is fully to the right (A covers most of B).
        const k = Math.floor((phase - Math.PI / 2) / (2 * Math.PI));
        if (k !== lastPhase) { lastPhase = k; if (opts.length > 1) setB(bi + 1); }
      }
      x += (target - x) * Math.min(1, dt * (p.active ? 18 : 6));
      el.style.setProperty('--x', `${(x * 100).toFixed(2)}%`);
      lblA.style.opacity = String(clamp((x - 0.12) / 0.14));
      lblB.style.opacity = String(clamp((0.88 - x) / 0.14));
    },
  };
  void a;
  return c;
}

/* ------------------------------------------------------------------ video */
function video(el: HTMLElement): Ctl {
  const v = el.querySelector<HTMLVideoElement>('video')!;
  const bar = el.querySelector<HTMLElement>('.pm-progress i');
  const scrub = el.dataset.scrub === 'true';
  let loaded = false, seeking = false, want = -1;
  v.addEventListener('seeked', () => { seeking = false; if (want >= 0) { const w = want; want = -1; seek(w); } });
  const seek = (time: number) => { if (seeking) { want = time; return; } seeking = true; v.currentTime = time; };
  const p: Pointer = { x: 0, y: 0, active: false };
  trackPointer(el, p, () => { if (scrub) v.pause(); }, () => { if (!reduce() && c.visible) v.play().catch(() => {}); });
  const c: Ctl = {
    el, visible: false, pointer: p, dirty: true,
    tick() {
      if (!loaded) { loaded = true; v.src = v.dataset.src!; v.load(); if (!reduce()) v.play().catch(() => {}); }
      if (scrub && p.active && v.duration) seek(p.x * (v.duration - 0.05));
      if (bar && v.duration) bar.style.transform = `scaleX(${(v.currentTime / v.duration).toFixed(4)})`;
    },
  };
  return c;
}

/* ----------------------------------------------------------------- frames */
function frames(el: HTMLElement): Ctl {
  const canvas = el.querySelector('canvas')!;
  const ctx = canvas.getContext('2d')!;
  const bar = el.querySelector<HTMLElement>('.pm-progress i');
  const n = Number(el.dataset.frames), size = Number(el.dataset.size);
  const ends = [...el.querySelectorAll<HTMLElement>('.pm-lbl')];
  const img = new Image();
  img.src = el.dataset.sprite!;
  let f = n - 1, t = 0;
  const p: Pointer = { x: 0, y: 0, active: false };
  trackPointer(el, p);
  const c: Ctl = {
    el, visible: false, pointer: p, dirty: true,
    tick(_t, dt) {
      if (!img.complete) { c.dirty = true; return; }
      if (p.active) f = Math.round(p.x * (n - 1));
      else if (!reduce()) {
        // Ping-pong: linger on the clean image, then fall back into noise.
        t = (t + dt) % 7;
        const u = t < 3.2 ? t / 3.2 : t < 4.6 ? 1 : 1 - (t - 4.6) / 2.4;
        f = Math.round(clamp(u) * (n - 1));
      }
      const { w, h } = fit(canvas, ctx);
      const s = Math.max(w, h);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, f * size, 0, size, size, (w - s) / 2, (h - s) / 2, s, s);
      if (bar) bar.style.transform = `scaleX(${(f / (n - 1)).toFixed(4)})`;
      ends[0]?.classList.toggle('is-on', f < n * 0.35);
      ends[1]?.classList.toggle('is-on', f > n * 0.75);
    },
  };
  return c;
}

/* ----------------------------------------------------------------- canvas */
function fit(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const dpr = Math.min(2, devicePixelRatio || 1);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

function scene(el: HTMLElement): Ctl {
  const canvas = el.querySelector('canvas')!;
  const ctx = canvas.getContext('2d')!;
  const make = SCENES[el.dataset.scene!];
  const p: Pointer = { x: 0.5, y: 0.5, active: false };
  trackPointer(el, p);
  let colors = cssColors(el), colorAge = 0, t = 0;
  const sc: Scene | null = make ? make() : null;
  const c: Ctl = {
    el, visible: false, pointer: p, dirty: true,
    tick(_now, dt) {
      if (!sc) return;
      if ((colorAge += dt) > 0.5) { colors = cssColors(el); colorAge = 0; }
      const speed = sc.slowOnHover && p.active ? 0.35 : 1;
      t += reduce() && !p.active ? 0 : dt * speed;
      const { w, h } = fit(canvas, ctx);
      // All scenes are authored in a 400 × 225 space and scaled to fit.
      const k = Math.min(w / 400, h / 225);
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate((w - 400 * k) / 2, (h - 225 * k) / 2);
      ctx.scale(k, k);
      const s: SceneCtx = { ctx, t: reduce() && !p.active ? sc.still ?? 6 : t, dt: dt * speed, p, c: colors };
      sc.draw(s);
      ctx.restore();
    },
  };
  return c;
}

const MAKERS: Record<string, (el: HTMLElement) => Ctl> = { compare, video, frames, canvas: scene };

export function initViz() {
  io ??= new IntersectionObserver((entries) => {
    for (const e of entries) {
      const c = [...ctls].find((x) => x.el === e.target);
      if (!c) continue;
      c.visible = e.isIntersecting;
      c.dirty = true;
      const v = c.el.querySelector('video');
      if (v && v.src) { if (c.visible && !reduce() && !c.pointer.active) v.play().catch(() => {}); else v.pause(); }
    }
    ensureLoop();
  }, { rootMargin: '120px' });
  document.querySelectorAll<HTMLElement>('[data-viz]:not([data-viz-ready])').forEach((el) => {
    const make = MAKERS[el.dataset.viz!];
    if (!make) return;
    el.dataset.vizReady = '1';
    const c = make(el);
    ctls.add(c);
    io!.observe(el);
  });
  ensureLoop();
}
