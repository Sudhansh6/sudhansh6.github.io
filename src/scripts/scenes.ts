// Canvas scenes for projects without footage. Each animates the project's actual method.
// Scenes draw in a 400 × 225 space. Keep the bottom-left corner (x < 200, y > 196) clear for the
// caption chip and the top-right corner clear for the hint chip.

export type Colors = {
  bg: string; surface: string; text: string; muted: string; faint: string; accent: string;
  cool: string; good: string; bad: string; border: string;
};
export type SceneCtx = {
  ctx: CanvasRenderingContext2D; t: number; dt: number;
  p: { x: number; y: number; active: boolean }; c: Colors;
};
export type Scene = { draw: (s: SceneCtx) => void; slowOnHover?: boolean; still?: number };

const W = 400, H = 225;
const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';
const SANS = 'Inter, system-ui, sans-serif';
const DISPLAY = SANS;
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (u: number) => { u = clamp(u); return u * u * (3 - 2 * u); };
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const gauss = (r: () => number) => Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r());

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
function text(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, o: { size?: number; color: string; font?: string; align?: CanvasTextAlign; weight?: number | string; alpha?: number }) {
  ctx.save();
  ctx.globalAlpha *= o.alpha ?? 1;
  ctx.font = `${o.weight ?? 400} ${o.size ?? 10}px ${o.font ?? SANS}`;
  ctx.fillStyle = o.color;
  ctx.textAlign = o.align ?? 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
  ctx.restore();
}
function chip(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, fg: string, bg: string, size = 9, align: 'left' | 'center' = 'left') {
  ctx.save();
  ctx.font = `500 ${size}px ${SANS}`;
  const w = ctx.measureText(s).width + 10;
  const x0 = align === 'center' ? x - w / 2 : x;
  rr(ctx, x0, y - size / 2 - 4, w, size + 8, 5);
  ctx.fillStyle = bg; ctx.fill();
  ctx.fillStyle = fg; ctx.textBaseline = 'middle'; ctx.fillText(s, x0 + 5, y + 0.5);
  ctx.restore();
  return w;
}
function withAlpha(ctx: CanvasRenderingContext2D, a: number, f: () => void) { ctx.save(); ctx.globalAlpha *= a; f(); ctx.restore(); }

/* ------------------------------------------------------------------------------------------
 * MathPrompter++: abstract the numbers into variables, generate an algebraic expression and a
 * Python function, then check that both agree on random variable assignments.
 * The question is the example from the repo's methods/mathprompterpp.py (shortened).
 * ---------------------------------------------------------------------------------------- */
function mathprompter(): Scene {
  const L = 11;
  const lines = [
    [['Danny found ', 0], ['66', 1], [' wrappers at the park.', 0]],
    [['Now he has ', 0], ['68', 2], [' wrappers in his collection.', 0]],
    [['How many wrappers did he have at first?', 0]],
  ] as [string, number][][];
  const vars = ['', 'A', 'B'];
  return {
    slowOnHover: true, still: 9.2,
    draw({ ctx, t, c }) {
      const u = t % L;
      const fade = u > L - 0.5 ? 1 - (u - (L - 0.5)) / 0.5 : 1;
      ctx.globalAlpha = fade;
      // 1. Question, typed; numbers become variables.
      const typed = Math.floor(clamp(u / 1.6) * 120);
      const morph = ease((u - 1.7) / 0.6);
      let n = 0;
      lines.forEach((parts, li) => {
        let x = 18;
        const y = 20 + li * 15;
        for (const [s, v] of parts) {
          const show = s.slice(0, Math.max(0, typed - n));
          n += s.length;
          if (!show) continue;
          ctx.font = `400 11px ${MONO}`;
          if (v && morph > 0) {
            const w = chip(ctx, vars[v], x, y, '#fff', c.accent, 10);
            withAlpha(ctx, 1 - morph, () => text(ctx, show, x, y, { size: 11, color: c.accent }));
            x += lerp(ctx.measureText(show).width, w, morph);
          } else {
            text(ctx, show, x, y, { size: 11, color: v ? c.accent : c.text });
            x += ctx.measureText(show).width;
          }
        }
      });
      if (morph > 0) withAlpha(ctx, morph, () => text(ctx, 'A=66 · B=68', 382, 24, { size: 9, color: c.muted, align: 'right' }));

      // 2. Two independent formulations.
      const g = ease((u - 2.5) / 0.5);
      const boxes = [
        { y: 66, h: 36, head: 'algebraic', body: ['B - A'] },
        { y: 110, h: 50, head: 'python', body: ['def f(A, B):', '  return B - A'] },
      ];
      boxes.forEach((b, i) => {
        const a = ease((u - 2.6 - i * 0.5) / 0.4);
        if (a <= 0) return;
        withAlpha(ctx, a * g, () => {
          rr(ctx, 18, b.y, 176, b.h, 7); ctx.fillStyle = c.surface; ctx.fill();
          ctx.strokeStyle = c.border; ctx.lineWidth = 1; ctx.stroke();
          text(ctx, b.head, 28, b.y + 10, { size: 8.5, color: c.faint });
          b.body.forEach((ln, k) => {
            const chars = Math.floor(clamp((u - 2.8 - i * 0.5) / 0.6) * ln.length);
            text(ctx, ln.slice(0, chars), 28, b.y + 24 + k * 14, { size: 11, color: i ? c.cool : c.text, font: MONO });
          });
        });
      });

      // 3. Verification on random assignments.
      const r = rng(Math.floor(t / L) * 7 + 3);
      const rows = Array.from({ length: 5 }, () => { const A = 1 + Math.floor(r() * 60); const B = A + Math.floor(r() * 90); return [A, B, B - A]; });
      const v0 = 4.3;
      if (u > v0 - 0.3) {
        withAlpha(ctx, ease((u - v0 + 0.3) / 0.3), () => {
          text(ctx, 'verify on random A, B', 212, 72, { size: 8.5, color: c.faint });
          ['A', 'B', 'expr', 'code'].forEach((h, k) => text(ctx, h, 214 + k * 40, 87, { size: 9, color: c.muted }));
        });
      }
      rows.forEach((row, i) => {
        const a = ease((u - v0 - i * 0.55) / 0.25);
        if (a <= 0) return;
        const y = 101 + i * 13;
        withAlpha(ctx, a, () => {
          [row[0], row[1], row[2], row[2]].forEach((v, k) => text(ctx, String(v), 214 + k * 40, y, { size: 10, color: k > 1 ? c.text : c.muted }));
          text(ctx, '✓', 376, y, { size: 11, color: c.good, align: 'right', weight: 700 });
        });
      });
      // 4. Consensus answer.
      const fin = ease((u - 7.4) / 0.4);
      if (fin > 0) withAlpha(ctx, fin, () => {
        rr(ctx, 210, 162, 172, 22, 6); ctx.fillStyle = c.good; ctx.globalAlpha *= 0.14; ctx.fill(); ctx.globalAlpha /= 0.14;
        text(ctx, '5/5 agree → 68 − 66 = 2', 296, 173, { size: 10, color: c.good, align: 'center', weight: 600 });
      });
      ctx.globalAlpha = 1;
    },
  };
}

/* ------------------------------------------------------------------------------------------
 * YOLOv8 on COCO: the notebook scores predictions (blue) against ground truth (green) with IoU.
 * ---------------------------------------------------------------------------------------- */
function yolo(): Scene {
  type Box = [number, number, number, number];
  const iou = (a: Box, b: Box) => {
    const ix = Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0]));
    const iy = Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]));
    const i = ix * iy;
    return i / (a[2] * a[3] + b[2] * b[3] - i);
  };
  let px = -1, py = -1;
  return {
    still: 2,
    draw({ ctx, t, dt, p, c }) {
      // Ground plane and horizon.
      ctx.strokeStyle = c.border; ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) { const y = 150 + i * i * 2.2; ctx.globalAlpha = 0.5 - i * 0.06; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.globalAlpha = 1;
      // Person (walks) and dog (trots).
      const pxw = 150 + 70 * Math.sin(t * 0.35), step = Math.sin(t * 5);
      const dxw = 300 + 30 * Math.sin(t * 0.5 + 1), trot = Math.sin(t * 9);
      ctx.fillStyle = c.muted; ctx.strokeStyle = c.muted; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(pxw, 70, 10, 0, 7); ctx.fill();
      rr(ctx, pxw - 11, 82, 22, 40, 8); ctx.fill();
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(pxw - 5, 118); ctx.lineTo(pxw - 5 - step * 7, 150); ctx.moveTo(pxw + 5, 118); ctx.lineTo(pxw + 5 + step * 7, 150); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(dxw, 132, 22, 9, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(dxw + 22, 122, 7, 0, 7); ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.beginPath(); [-14, -6, 8, 15].forEach((o, k) => { ctx.moveTo(dxw + o, 138); ctx.lineTo(dxw + o + (k % 2 ? trot : -trot) * 3, 151); }); ctx.stroke();
      ctx.lineWidth = 1;

      const objs = [
        { name: 'person', gt: [pxw - 18, 56, 36, 96] as Box, ph: 0 },
        { name: 'dog', gt: [dxw - 25, 112, 56, 40] as Box, ph: 2 },
      ];
      objs.forEach((o, k) => {
        const [gx, gy, gw, gh] = o.gt;
        let pred: Box;
        if (k === 0 && p.active) {
          const tx = p.x * W - gw / 2, ty = p.y * H - gh / 2;
          if (px < 0) { px = tx; py = ty; }
          px += (tx - px) * Math.min(1, dt * 14); py += (ty - py) * Math.min(1, dt * 14);
          pred = [px, py, gw, gh];
        } else {
          if (k === 0) px = -1;
          const s = 1 + 0.14 * Math.sin(t * 0.7 + o.ph);
          pred = [gx + 9 * Math.sin(t * 1.1 + o.ph) - (gw * (s - 1)) / 2, gy + 6 * Math.sin(t * 0.8 + 1 + o.ph) - (gh * (s - 1)) / 2, gw * s, gh * s];
        }
        const score = iou(o.gt, pred);
        // Intersection
        const ix0 = Math.max(gx, pred[0]), iy0 = Math.max(gy, pred[1]);
        const ix1 = Math.min(gx + gw, pred[0] + pred[2]), iy1 = Math.min(gy + gh, pred[1] + pred[3]);
        if (ix1 > ix0 && iy1 > iy0) { ctx.fillStyle = c.accent; ctx.globalAlpha = 0.18; ctx.fillRect(ix0, iy0, ix1 - ix0, iy1 - iy0); ctx.globalAlpha = 1; }
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = c.good; ctx.strokeRect(gx, gy, gw, gh);
        ctx.strokeStyle = c.cool; ctx.strokeRect(pred[0], pred[1], pred[2], pred[3]);
        const conf = (0.45 + 0.54 * score).toFixed(2);
        chip(ctx, `${o.name} ${conf}`, pred[0], pred[1] - 8, '#fff', c.cool, 8);
        if (k === 0) {
          // IoU readout
          text(ctx, 'IoU', 18, 24, { size: 9, color: c.muted });
          text(ctx, score.toFixed(2), 18, 42, { size: 20, color: c.text, font: DISPLAY, weight: 600 });
          rr(ctx, 18, 56, 70, 4, 2); ctx.fillStyle = c.border; ctx.fill();
          rr(ctx, 18, 56, 70 * score, 4, 2); ctx.fillStyle = score > 0.5 ? c.good : c.accent; ctx.fill();
        }
      });
      // Legend
      [['ground truth', c.good], ['prediction', c.cool]].forEach(([s, col], i) => {
        ctx.fillStyle = col; ctx.fillRect(18, 74 + i * 13, 8, 2);
        text(ctx, s, 31, 75 + i * 13, { size: 8.5, color: c.muted });
      });
    },
  };
}

/* ------------------------------------------------------------------------------------------
 * Permutation noise: pairs of measurements get swapped (y = PAx + η). A debiased-LASSO test
 * statistic per measurement stays ~N(0,1) under the null and spikes for swapped rows.
 * ---------------------------------------------------------------------------------------- */
function permutation(): Scene {
  const m = 22;
  const r = rng(11);
  const y = Array.from({ length: m }, () => clamp(gauss(r) * 0.45, -1, 1));
  const z = Array.from({ length: m }, () => r() * 6.28);
  const far = (i: number) => { let j = 0, best = -1; y.forEach((v, k) => { const d = Math.abs(v - y[i]) - Math.abs(k - i) * 0.001; if (k !== i && d > best) { best = d; j = k; } }); return j; };
  const pairs = [[3, far(3)], [14, far(14)], [8, far(8)], [19, far(19)]];
  const x0 = 26, dx = 16.4;
  return {
    still: 1.6,
    draw({ ctx, t, p, c }) {
      const L = 4.2;
      let i: number, j: number, s: number, flag: number, fixed: number;
      if (p.active) {
        i = Math.round(p.x * (m - 1)); j = far(i); s = 1; flag = 1; fixed = 0;
      } else {
        const k = Math.floor(t / L) % pairs.length; [i, j] = pairs[k];
        const u = t % L;
        s = ease(u / 0.7) * (1 - ease((u - 2.7) / 0.7));
        flag = ease((u - 0.7) / 0.5) * (1 - ease((u - 2.7) / 0.4));
        fixed = ease((u - 2.9) / 0.3) * (1 - ease((u - 3.8) / 0.4));
      }
      // Panel 1: measurements
      text(ctx, 'measurements  y = P·A·x + η', 18, 18, { size: 9, color: c.muted });
      const base = 70;
      ctx.strokeStyle = c.border; ctx.beginPath(); ctx.moveTo(18, base); ctx.lineTo(382, base); ctx.stroke();
      for (let k = 0; k < m; k++) {
        let v = y[k];
        let x = x0 + k * dx;
        if (k === i) { v = y[i]; x = lerp(x0 + i * dx, x0 + j * dx, s); }
        if (k === j) { v = y[j]; x = lerp(x0 + j * dx, x0 + i * dx, s); }
        const hot = (k === i || k === j) && s > 0.02;
        ctx.fillStyle = hot ? (fixed > 0.5 ? c.good : c.accent) : c.faint;
        const h = v * 34;
        rr(ctx, x - 5, Math.min(base, base - h), 10, Math.max(1.5, Math.abs(h)), 2); ctx.fill();
      }
      if (s > 0.02) {
        // Swap arc
        const a = x0 + i * dx, b = x0 + j * dx;
        ctx.strokeStyle = fixed > 0.5 ? c.good : c.accent; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(a, 32); ctx.quadraticCurveTo((a + b) / 2, 18 - Math.abs(b - a) * 0.05, b, 32); ctx.stroke();
        ctx.setLineDash([]); ctx.lineWidth = 1;
      }
      // Panel 2: test statistic
      text(ctx, 'debiased-LASSO test  |Dᵢ|', 18, 104, { size: 9, color: c.muted });
      const b2 = 180, thr = 2.6, sc = 16;
      ctx.strokeStyle = c.border; ctx.beginPath(); ctx.moveTo(18, b2); ctx.lineTo(382, b2); ctx.stroke();
      ctx.strokeStyle = c.accent; ctx.setLineDash([4, 4]); ctx.globalAlpha = 0.7;
      ctx.beginPath(); ctx.moveTo(18, b2 - thr * sc); ctx.lineTo(382, b2 - thr * sc); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      text(ctx, 'reject H₀', 382, b2 - thr * sc - 7, { size: 8, color: c.accent, align: 'right' });
      for (let k = 0; k < m; k++) {
        let d = 0.35 + 0.55 * Math.abs(Math.sin(t * 0.9 + z[k]));
        const swapped = k === i || k === j;
        if (swapped) d = lerp(d, 1.2 + Math.abs(y[i] - y[j]) * 2.2, flag);
        const hot = swapped && flag > 0.5;
        ctx.fillStyle = hot ? c.accent : swapped && fixed > 0.3 ? c.good : c.faint;
        rr(ctx, x0 + k * dx - 5, b2 - d * sc, 10, d * sc, 2); ctx.fill();
      }
      const label = fixed > 0.3 ? 'corrected: swapped back' : flag > 0.5 ? `flagged: rows ${Math.min(i, j) + 1} ↔ ${Math.max(i, j) + 1}` : '';
      if (label) chip(ctx, label, 382 - 140, 104, '#fff', fixed > 0.3 ? c.good : c.accent, 8.5);
    },
  };
}

/* ------------------------------------------------------------------------------------------
 * Wiesner's scheme: a bill holds qubits in secret bases. Measuring in the wrong basis disturbs the
 * state, and each disturbed qubit fails the bank's check with probability 1/2.
 * ---------------------------------------------------------------------------------------- */
function quantum(): Scene {
  const N = 8;
  type Q = { basis: 0 | 1; bit: 0 | 1; ang: number; target: number; measured: boolean; disturbed: boolean; flash: number; mb: 0 | 1 };
  let qs: Q[] = [], serial = '', seed = 5, nextAt = 1, resetAt = -1, lastHover = -1, born = 0;
  const angle = (basis: number, bit: number) => (basis ? (bit ? -90 : 90) : bit ? 180 : 0);
  const fresh = (t: number) => {
    const r = rng(seed++);
    qs = Array.from({ length: N }, () => { const basis = (r() < 0.5 ? 0 : 1) as 0 | 1, bit = (r() < 0.5 ? 0 : 1) as 0 | 1; const a = angle(basis, bit); return { basis, bit, ang: a, target: a, measured: false, disturbed: false, flash: 0, mb: 0 }; });
    serial = Math.floor(r() * 0xffff).toString(16).toUpperCase().padStart(4, '0') + '-' + Math.floor(r() * 99);
    nextAt = t + 1; resetAt = -1; born = t;
  };
  const measure = (q: Q, mb: 0 | 1, r: number) => {
    q.measured = true; q.flash = 1; q.mb = mb;
    if (mb !== q.basis) { q.disturbed = true; q.basis = mb; q.bit = (r < 0.5 ? 0 : 1) as 0 | 1; q.target = angle(mb, q.bit); }
  };
  const label = (q: Q) => (q.basis ? (q.bit ? '|−⟩' : '|+⟩') : q.bit ? '|1⟩' : '|0⟩');
  return {
    still: 4,
    draw({ ctx, t, dt, p, c }) {
      if (!qs.length) fresh(t);
      const qx = (k: number) => 82 + k * 34;
      if (p.active) {
        const k = Math.round((p.x * W - 82) / 34);
        if (k >= 0 && k < N && k !== lastHover) { lastHover = k; if (!qs[k].measured) measure(qs[k], (Math.random() < 0.5 ? 0 : 1) as 0 | 1, Math.random()); }
        nextAt = t + 1.2;
      } else {
        lastHover = -1;
        const un = qs.map((q, k) => (q.measured ? -1 : k)).filter((k) => k >= 0);
        if (un.length && t > nextAt) { const r = rng(Math.floor(t * 10)); measure(qs[un[0]], (r() < 0.5 ? 0 : 1) as 0 | 1, r()); nextAt = t + 1.1; }
        if (!un.length && resetAt < 0) resetAt = t + 2.4;
        if (resetAt > 0 && t > resetAt) fresh(t);
      }
      const fadeIn = ease((t - born) / 0.5);
      ctx.globalAlpha = fadeIn;
      // Bill
      rr(ctx, 34, 20, 332, 132, 12); ctx.fillStyle = c.surface; ctx.fill(); ctx.strokeStyle = c.border; ctx.stroke();
      ctx.save(); rr(ctx, 34, 20, 332, 132, 12); ctx.clip();
      ctx.strokeStyle = c.accent; ctx.globalAlpha = 0.08 * fadeIn;
      for (let k = 0; k < 9; k++) { ctx.beginPath(); for (let x = 34; x <= 366; x += 4) { const yy = 40 + k * 12 + 5 * Math.sin(x * 0.045 + k); x === 34 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); }
      ctx.restore(); ctx.globalAlpha = fadeIn;
      text(ctx, 'QUANTUM BANK', 50, 38, { size: 9, color: c.muted, weight: 600 });
      text(ctx, `№ ${serial}`, 350, 38, { size: 9, color: c.muted, align: 'right' });
      text(ctx, '100', 50, 68, { size: 26, color: c.text, font: DISPLAY, weight: 700, alpha: 0.85 });
      // Qubits
      qs.forEach((q, k) => {
        const x = qx(k), y = 108;
        let d = q.target - q.ang; d = ((d + 540) % 360) - 180;
        q.ang += d * Math.min(1, dt * 7);
        q.flash = Math.max(0, q.flash - dt * 0.8);
        ctx.beginPath(); ctx.arc(x, y, 12, 0, 7);
        ctx.fillStyle = c.bg; ctx.fill();
        ctx.lineWidth = q.measured ? 1.8 : 1;
        ctx.strokeStyle = q.measured ? (q.disturbed ? c.bad : c.good) : c.border; ctx.stroke(); ctx.lineWidth = 1;
        const a = ((q.ang - 90) * Math.PI) / 180;
        ctx.strokeStyle = c.text; ctx.fillStyle = c.text; ctx.lineWidth = 1.6;
        const ex = x + Math.cos(a) * 8, ey = y + Math.sin(a) * 8;
        ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * 6, y - Math.sin(a) * 6); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - Math.cos(a - 0.5) * 4, ey - Math.sin(a - 0.5) * 4); ctx.lineTo(ex - Math.cos(a + 0.5) * 4, ey - Math.sin(a + 0.5) * 4); ctx.fill();
        ctx.lineWidth = 1;
        text(ctx, q.measured ? label(q) : '?', x, 133, { size: 8.5, color: q.measured ? c.muted : c.faint, align: 'center' });
        if (q.flash > 0) withAlpha(ctx, q.flash, () => chip(ctx, q.mb ? 'X' : 'Z', x, 84, '#fff', q.disturbed ? c.bad : c.good, 8, 'center'));
      });
      // Status
      const meas = qs.filter((q) => q.measured).length, dis = qs.filter((q) => q.disturbed).length;
      const pc = Math.round((1 - Math.pow(0.5, dis)) * 100);
      text(ctx, `counterfeiter measured ${meas}/${N} · disturbed ${dis}`, 382, 168, { size: 9, color: c.muted, align: 'right' });
      text(ctx, `bank catches the copy: p = 1 − ½^${dis} = ${pc}%`, 382, 184, { size: 10, color: dis ? c.bad : c.good, align: 'right', weight: 600 });
      ctx.globalAlpha = 1;
    },
  };
}

/* ------------------------------------------------------------------------------------------
 * Recipe ratings: a sparse user × recipe matrix. The report found user and recipe averages were
 * the strongest predictors, so missing cells fill in with μ + b_u + b_i.
 * ---------------------------------------------------------------------------------------- */
function recipes(): Scene {
  const U = 8, R = 18, cs = 16, gap = 3, gx = 30, gy = 26;
  const r = rng(21);
  const bu = Array.from({ length: U }, () => gauss(r) * 0.55);
  const bi = Array.from({ length: R }, () => gauss(r) * 0.6);
  const mu = 3.9;
  const truth = bu.map((u) => bi.map((i) => clamp(Math.round(mu + u + i + gauss(r) * 0.4), 1, 5)));
  const obs = truth.map((row) => row.map(() => r() < 0.24));
  // Estimate biases from observed cells only (what the model actually sees).
  const all = truth.flatMap((row, u) => row.filter((_, i) => obs[u][i]));
  const m = all.reduce((a, b) => a + b, 0) / all.length;
  const eu = truth.map((row, u) => { const v = row.filter((_, i) => obs[u][i]); return v.length ? v.reduce((a, b) => a + b, 0) / v.length - m : 0; });
  const ei = bi.map((_, i) => { const v = truth.map((row) => row[i]).filter((_, u) => obs[u][i]); return v.length ? v.reduce((a, b) => a + b, 0) / v.length - m - 0 : 0; });
  const pred = (u: number, i: number) => clamp(m + eu[u] + ei[i], 1, 5);
  let fu = 2, fi = 5, nextFocus = 0;
  return {
    still: 5,
    draw({ ctx, t, p, c }) {
      const L = 9, u0 = t % L;
      const wave = clamp((u0 - 0.8) / 2.6) * (R + U);
      const out = 1 - ease((u0 - 8.2) / 0.6);
      if (p.active) {
        fi = clamp(Math.floor((p.x * W - gx) / (cs + gap)), 0, R - 1); fu = clamp(Math.floor((p.y * H - gy) / (cs + gap)), 0, U - 1);
      } else if (t > nextFocus) {
        const rr2 = rng(Math.floor(t)); nextFocus = t + 1.6;
        do { fu = Math.floor(rr2() * U); fi = Math.floor(rr2() * R); } while (obs[fu][fi]);
      }
      text(ctx, `users × recipes · ${Math.round((all.length / (U * R)) * 100)}% observed`, gx, 14, { size: 9, color: c.muted });
      // Focus bands
      ctx.fillStyle = c.text; ctx.globalAlpha = 0.05;
      ctx.fillRect(gx - 2, gy + fu * (cs + gap) - 2, R * (cs + gap) + 1, cs + 4);
      ctx.fillRect(gx + fi * (cs + gap) - 2, gy - 2, cs + 4, U * (cs + gap) + 1);
      ctx.globalAlpha = 1;
      for (let u = 0; u < U; u++) for (let i = 0; i < R; i++) {
        const x = gx + i * (cs + gap), y = gy + u * (cs + gap);
        rr(ctx, x, y, cs, cs, 3);
        if (obs[u][i]) {
          ctx.fillStyle = c.accent; ctx.globalAlpha = 0.25 + 0.75 * ((truth[u][i] - 1) / 4); ctx.fill(); ctx.globalAlpha = 1;
        } else {
          ctx.strokeStyle = c.border; ctx.stroke();
          const a = ease(wave - (i + u)) * out;
          if (a > 0) {
            rr(ctx, x + 3, y + 3, cs - 6, cs - 6, 2);
            ctx.fillStyle = c.cool; ctx.globalAlpha = a * (0.2 + 0.7 * ((pred(u, i) - 1) / 4)); ctx.fill(); ctx.globalAlpha = 1;
          }
        }
      }
      // Focus outline + readout
      const fx = gx + fi * (cs + gap), fy = gy + fu * (cs + gap);
      rr(ctx, fx - 1.5, fy - 1.5, cs + 3, cs + 3, 4); ctx.strokeStyle = c.text; ctx.lineWidth = 1.5; ctx.stroke(); ctx.lineWidth = 1;
      const msg = obs[fu][fi]
        ? `user ${fu + 1} rated recipe ${fi + 1}: ${truth[fu][fi]}★`
        : `predict  μ + b_u + b_i = ${m.toFixed(1)} ${eu[fu] >= 0 ? '+' : '−'} ${Math.abs(eu[fu]).toFixed(1)} ${ei[fi] >= 0 ? '+' : '−'} ${Math.abs(ei[fi]).toFixed(1)} = ${pred(fu, fi).toFixed(1)}★`;
      text(ctx, msg, gx, 186, { size: 9.5, color: obs[fu][fi] ? c.accent : c.cool, weight: 500 });
      [['rated', c.accent], ['predicted', c.cool]].forEach(([s, col], k) => {
        const x = 300 + k * 50; rr(ctx, x, 10, 8, 8, 2); ctx.fillStyle = col; ctx.fill();
        text(ctx, s, x + 11, 14.5, { size: 8.5, color: c.muted });
      });
    },
  };
}

/* ------------------------------------------------------------------------------------------
 * Technical analysis: candlesticks with SMA 9 / 21 and their crossovers.
 * ---------------------------------------------------------------------------------------- */
function stocks(): Scene {
  const N = 3000, r = rng(42);
  const C: { o: number; h: number; l: number; c: number; v: number }[] = [];
  let price = 100, drift = 0;
  for (let i = 0; i < N; i++) {
    drift = drift * 0.96 + gauss(r) * 0.08;
    const o = price, cl = o * (1 + drift * 0.01 + gauss(r) * 0.009);
    const h = Math.max(o, cl) * (1 + r() * 0.006), l = Math.min(o, cl) * (1 - r() * 0.006);
    C.push({ o, h, l, c: cl, v: 0.3 + r() });
    price = cl;
  }
  const sma = (n: number) => C.map((_, i) => { let s = 0; const k = Math.max(0, i - n + 1); for (let j = k; j <= i; j++) s += C[j].c; return s / (i - k + 1); });
  const s9 = sma(9), s21 = sma(21);
  const vis = 46, cw = 364 / vis;
  let off = 30, lo = 90, hi = 110;
  return {
    still: 20,
    draw({ ctx, t, dt, p, c }) {
      if (!p.active) off = 30 + t * 1.3;
      const i0 = Math.floor(off) % (N - vis - 30) + 22, frac = off - Math.floor(off);
      let mn = Infinity, mx = -Infinity;
      for (let k = 0; k <= vis; k++) { const d = C[i0 + k]; mn = Math.min(mn, d.l, s21[i0 + k]); mx = Math.max(mx, d.h, s21[i0 + k]); }
      lo += (mn - lo) * Math.min(1, dt * 3) || mn; hi += (mx - hi) * Math.min(1, dt * 3) || mx;
      const top = 24, bot = 150, Y = (v: number) => bot - ((v - lo) / (hi - lo || 1)) * (bot - top);
      const X = (k: number) => 18 + (k - frac) * cw + cw / 2;
      ctx.save(); ctx.beginPath(); ctx.rect(18, 0, 364, H); ctx.clip();
      // Grid
      ctx.strokeStyle = c.border; ctx.globalAlpha = 0.6;
      for (let g = 0; g < 4; g++) { const y = top + (g * (bot - top)) / 3; ctx.beginPath(); ctx.moveTo(18, y); ctx.lineTo(382, y); ctx.stroke(); }
      ctx.globalAlpha = 1;
      for (let k = 0; k <= vis; k++) {
        const d = C[i0 + k], x = X(k), up = d.c >= d.o;
        ctx.strokeStyle = ctx.fillStyle = up ? c.good : c.bad;
        ctx.beginPath(); ctx.moveTo(x, Y(d.h)); ctx.lineTo(x, Y(d.l)); ctx.stroke();
        const y1 = Y(Math.max(d.o, d.c)), y2 = Y(Math.min(d.o, d.c));
        ctx.fillRect(x - cw * 0.32, y1, cw * 0.64, Math.max(1, y2 - y1));
        ctx.globalAlpha = 0.22; ctx.fillRect(x - cw * 0.32, 182 - d.v * 16, cw * 0.64, d.v * 16); ctx.globalAlpha = 1;
      }
      ([[s9, c.accent], [s21, c.cool]] as [number[], string][]).forEach(([s, col]) => {
        ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.beginPath();
        for (let k = 0; k <= vis; k++) { const x = X(k), y = Y(s[i0 + k]); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.stroke(); ctx.lineWidth = 1;
      });
      for (let k = 1; k <= vis; k++) {
        const a = s9[i0 + k - 1] - s21[i0 + k - 1], b = s9[i0 + k] - s21[i0 + k];
        if (a * b < 0) {
          const golden = b > 0, x = X(k), y = Y(s9[i0 + k]);
          text(ctx, golden ? '▲' : '▼', x, golden ? y + 12 : y - 12, { size: 9, color: golden ? c.good : c.bad, align: 'center' });
        }
      }
      ctx.restore();
      // Crosshair
      if (p.active) {
        const k = clamp(Math.round((p.x * W - 18) / cw - 0.5 + frac), 0, vis);
        const d = C[i0 + k], x = X(k), y = clamp(p.y * H, top, bot);
        ctx.strokeStyle = c.muted; ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.moveTo(x, top - 6); ctx.lineTo(x, 184); ctx.moveTo(18, y); ctx.lineTo(382, y); ctx.stroke(); ctx.setLineDash([]);
        chip(ctx, (lo + ((bot - y) / (bot - top)) * (hi - lo)).toFixed(2), 382 - 44, y, c.bg, c.text, 8);
        text(ctx, `O ${d.o.toFixed(2)}  H ${d.h.toFixed(2)}  L ${d.l.toFixed(2)}  C ${d.c.toFixed(2)}`, 18, 12, { size: 9, color: c.text });
      } else {
        [['SMA 9', c.accent], ['SMA 21', c.cool]].forEach(([s, col], k) => {
          ctx.fillStyle = col; ctx.fillRect(18 + k * 62, 11, 10, 2);
          text(ctx, s, 32 + k * 62, 12, { size: 8.5, color: c.muted });
        });
        text(ctx, '▲ golden cross  ▼ death cross', 160, 12, { size: 8.5, color: c.faint });
      }
    },
  };
}

/* ------------------------------------------------------------------------------------------
 * VS Code journal: TODO comments are pulled from code into today's note; unchecked tasks roll
 * over to the next day.
 * ---------------------------------------------------------------------------------------- */
function journal(): Scene {
  const r = rng(3);
  const code = Array.from({ length: 11 }, (_, i) => Array.from({ length: 2 + Math.floor(r() * 4) }, () => 10 + r() * 34).map((w, k) => ({ w, k: (i + k) % 3 })));
  const todos: Record<number, string> = { 2: 'handle empty input', 6: 'add parser tests', 9: 'rename helper' };
  const tags = ['#parser', '#tests', '#cleanup'];
  const lines = Object.keys(todos).map(Number);
  const L = 12;
  return {
    slowOnHover: true, still: 7.2,
    draw({ ctx, t, c }) {
      const u = t % L;
      const fade = Math.min(ease(u / 0.4), 1 - ease((u - (L - 0.5)) / 0.5));
      ctx.globalAlpha = fade;
      // Editor
      rr(ctx, 14, 14, 226, 176, 8); ctx.fillStyle = c.surface; ctx.fill(); ctx.strokeStyle = c.border; ctx.stroke();
      chip(ctx, 'parser.ts', 22, 26, c.text, c.bg, 8);
      const scanY = 42 + clamp(u / 4.4) * 11 * 13.2;
      code.forEach((toks, i) => {
        const y = 46 + i * 13.2;
        text(ctx, String(i + 1).padStart(2, ' '), 34, y, { size: 8, color: c.faint, align: 'right' });
        if (todos[i]) {
          const hit = scanY > y;
          text(ctx, `// TODO: ${todos[i]}`, 44, y, { size: 9, color: hit ? c.accent : c.muted, weight: hit ? 600 : 400 });
        } else {
          let x = 44 + (i % 4 === 3 ? 12 : 0);
          toks.forEach((tk) => { rr(ctx, x, y - 2.5, tk.w, 5, 2.5); ctx.fillStyle = [c.faint, c.cool, c.muted][tk.k]; ctx.globalAlpha = fade * (tk.k === 1 ? 0.6 : 0.45); ctx.fill(); ctx.globalAlpha = fade; x += tk.w + 5; });
        }
      });
      if (u < 4.6) { ctx.fillStyle = c.accent; ctx.globalAlpha = fade * 0.08; ctx.fillRect(15, scanY - 6, 224, 12); ctx.globalAlpha = fade; }

      // Journal
      const roll = ease((u - 8.2) / 0.6);
      rr(ctx, 250, 14, 136, 176, 8); ctx.fillStyle = c.surface; ctx.fill(); ctx.strokeStyle = c.border; ctx.stroke();
      ctx.save(); rr(ctx, 250, 14, 136, 176, 8); ctx.clip();
      text(ctx, 'Nov 16', 262, 34 - 22 * roll, { size: 13, color: c.text, font: DISPLAY, weight: 600, alpha: 1 - roll });
      text(ctx, 'Nov 17', 262, 34 + 22 * (1 - roll), { size: 13, color: c.text, font: DISPLAY, weight: 600, alpha: roll });
      ctx.restore(); ctx.globalAlpha = fade;
      text(ctx, roll > 0.5 ? 'today · rolled over' : 'today', 262, 50, { size: 8, color: c.faint });
      const checked = ease((u - 6.6) / 0.3);
      lines.forEach((ln, k) => {
        const lineY = 46 + ln * 13.2;
        const arrive = (u - (ln / 11) * 4.4 - 0.15) / 0.7;
        if (arrive <= 0) return;
        const done = k === 1;
        const gone = done ? roll : 0;
        // After the rollover the checked task drops off and later tasks move up a slot.
        const slotY = 70 + (k === 2 ? lerp(2, 1, roll) : k) * 30;
        const e = ease(arrive);
        const x = lerp(60, 262, e), y = lerp(lineY, slotY, e);
        withAlpha(ctx, (1 - gone) * (e < 1 ? 0.9 : 1), () => {
          rr(ctx, x, y - 6, 10, 10, 2.5); ctx.strokeStyle = done && checked > 0 ? c.good : c.muted; ctx.stroke();
          if (done && checked > 0) { ctx.strokeStyle = c.good; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x + 2.2, y - 1); ctx.lineTo(x + 4.3, y + 1.4); ctx.lineTo(x + 8, y - 3.4); ctx.stroke(); ctx.lineWidth = 1; }
          text(ctx, todos[ln], x + 16, y - 1, { size: 9, color: done && checked > 0.5 ? c.faint : c.text });
          if (done && checked > 0.5) { ctx.strokeStyle = c.faint; ctx.beginPath(); ctx.moveTo(x + 16, y - 1); ctx.lineTo(x + 16 + 92 * checked, y - 1); ctx.stroke(); }
          text(ctx, tags[k], x + 16, y + 10, { size: 7.5, color: c.cool });
        });
      });
      ctx.globalAlpha = 1;
    },
  };
}

/* ------------------------------------------------------------------------------------------
 * Navicane: ultrasonic depth checks, camera obstacles and turn-by-turn GPS cues feed haptic alerts.
 * The pointer moves the walker along the path, changing the measured distance to the hazard.
 * ---------------------------------------------------------------------------------------- */
function navicane(): Scene {
  return {
    still: 4.4,
    draw({ ctx, t, p, c }) {
      const walkerX = p.active ? lerp(68, 146, p.x) : 94 + 7 * Math.sin(t * 0.7);
      const hazardX = 292 + 8 * Math.sin(t * 0.32);
      const sensorX = walkerX + 76;
      const distance = Math.max(0, hazardX - sensorX);
      const curb = Math.floor(t / 7) % 2 === 1;
      const alert = distance < (curb ? 148 : 122);
      const pulse = alert ? 0.5 + 0.5 * Math.sin(t * 25) : 0;
      const step = Math.sin(t * 5.5);

      // Depth readout and a quiet path grid.
      text(ctx, 'ULTRASONIC DEPTH', 18, 20, { size: 8.5, color: c.muted, weight: 600 });
      text(ctx, `${Math.round(distance)} cm`, 18, 42, { size: 18, color: alert ? c.accent : c.text, weight: 600 });
      ctx.strokeStyle = c.border; ctx.globalAlpha = 0.55;
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(20, 89 + i * 16); ctx.lineTo(382, 89 + i * 16); ctx.stroke(); }
      ctx.globalAlpha = 1;

      // Sidewalk, with a drop-off in alternating passes.
      ctx.strokeStyle = c.muted; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(0, 174); ctx.lineTo(curb ? hazardX - 22 : 400, 174);
      if (curb) { ctx.lineTo(hazardX - 22, 190); ctx.lineTo(400, 190); }
      ctx.stroke(); ctx.lineWidth = 1;
      for (let x = 18; x < 390; x += 38) {
        if (Math.abs(x - hazardX) < 28) continue;
        ctx.strokeStyle = c.border; ctx.beginPath(); ctx.moveTo(x, 176); ctx.lineTo(x - 10, 181); ctx.stroke();
      }

      // Hazard: a low obstacle or the edge of a curb.
      if (curb) {
        ctx.fillStyle = c.surface; ctx.fillRect(hazardX - 22, 174, 48, 16);
        ctx.strokeStyle = alert ? c.accent : c.border; ctx.lineWidth = 1.4;
        ctx.strokeRect(hazardX - 22, 174, 48, 16); ctx.lineWidth = 1;
        text(ctx, 'DROP', hazardX + 2, 184, { size: 7, color: alert ? c.accent : c.faint, align: 'center', weight: 600 });
      } else {
        rr(ctx, hazardX - 12, 145, 28, 29, 4); ctx.fillStyle = c.surface; ctx.fill();
        ctx.strokeStyle = alert ? c.accent : c.border; ctx.lineWidth = 1.4; ctx.stroke(); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(hazardX - 7, 150); ctx.lineTo(hazardX + 11, 150); ctx.strokeStyle = c.faint; ctx.stroke();
      }

      // Ping cone from the cane tip toward the hazard.
      const sy = 166;
      ctx.save(); ctx.globalAlpha = alert ? 0.32 + pulse * 0.4 : 0.12 + 0.08 * Math.sin(t * 2.2);
      ctx.strokeStyle = alert ? c.accent : c.cool; ctx.lineWidth = 1.2;
      for (const spread of [-24, 0, 24]) {
        ctx.beginPath(); ctx.moveTo(sensorX, sy); ctx.lineTo(hazardX - 18, sy + spread); ctx.stroke();
      }
      ctx.restore();
      ctx.strokeStyle = alert ? c.accent : c.cool; ctx.globalAlpha = 0.6;
      const ping = 4 + (t * 16 % 22);
      ctx.beginPath(); ctx.arc(sensorX, sy, ping, -0.55, 0.55); ctx.stroke();
      ctx.beginPath(); ctx.arc(sensorX, sy, ping, Math.PI - 0.55, Math.PI + 0.55); ctx.stroke();
      ctx.globalAlpha = 1;

      // Walker in profile, with a cane and a vibrating handle.
      ctx.fillStyle = c.muted; ctx.strokeStyle = c.muted; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(walkerX, 57, 8, 0, Math.PI * 2); ctx.fill();
      rr(ctx, walkerX - 9, 69, 18, 39, 7); ctx.fill();
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(walkerX - 4, 104); ctx.lineTo(walkerX - 8 - step * 7, 145);
      ctx.moveTo(walkerX + 4, 104); ctx.lineTo(walkerX + 7 + step * 7, 145);
      ctx.moveTo(walkerX + 1, 82); ctx.lineTo(walkerX + 19, 98); ctx.lineTo(walkerX + 31, 101);
      ctx.stroke(); ctx.lineWidth = 1; ctx.lineCap = 'butt';
      ctx.strokeStyle = c.text; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(walkerX + 31, 101); ctx.lineTo(sensorX, sy + 8); ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = c.accent; ctx.beginPath(); ctx.arc(sensorX, sy, 3, 0, Math.PI * 2); ctx.fill();
      // Handle buzz shown as short vibration marks.
      if (alert) {
        ctx.strokeStyle = c.accent; ctx.lineWidth = 1.5;
        for (let k = 0; k < 3; k++) {
          const bx = walkerX + 28 + k * 4;
          ctx.beginPath(); ctx.moveTo(bx, 96); ctx.lineTo(bx + 2 + pulse * 2, 101); ctx.lineTo(bx, 106); ctx.stroke();
        }
        ctx.lineWidth = 1;
      }
      chip(ctx, alert ? (curb ? 'curb drop · buzz' : 'obstacle · buzz') : 'path clear', 236, 48, '#fff', alert ? c.accent : c.surface, 8.5);
    },
  };
}

/* ------------------------------------------------------------------------------------------
 * Sudoku camera view: a perspective-rectified board, AlexNet-style digit reads and registered
 * solution overlays. The pointer changes the camera tilt while every cell stays on the board.
 * ---------------------------------------------------------------------------------------- */
function sudoku(): Scene {
  const puzzle = [
    '530070000', '600195000', '098000060', '800060003', '400803001',
    '700020006', '060000280', '000419005', '000080079',
  ];
  const solution = [
    '534678912', '672195348', '198342567', '859761423', '426853791',
    '713924856', '961537284', '287419635', '345286179',
  ];
  const blanks: [number, number][] = [];
  puzzle.forEach((row, r) => [...row].forEach((v, col) => { if (v === '0') blanks.push([r, col]); }));
  return {
    still: 6.5,
    draw({ ctx, t, p, c }) {
      const phase = t % 10.4;
      const lock = ease(phase / 0.85);
      const shown = Math.min(blanks.length, Math.max(0, Math.floor((phase - 2.15) / 0.105)));
      const tiltX = p.active ? (p.x - 0.5) * 0.24 : Math.sin(t * 0.42) * 0.045;
      const tiltY = p.active ? (p.y - 0.5) * 0.2 : Math.cos(t * 0.35) * 0.04;

      // Camera frame.
      rr(ctx, 27, 27, 346, 150, 10); ctx.fillStyle = c.surface; ctx.fill();
      ctx.strokeStyle = c.border; ctx.lineWidth = 1; ctx.stroke();
      text(ctx, 'CAMERA FEED · BOARD DETECTION', 40, 19, { size: 8.5, color: c.muted, weight: 600 });
      ctx.save(); rr(ctx, 36, 38, 328, 128, 7); ctx.clip();
      ctx.strokeStyle = c.border; ctx.globalAlpha = 0.35;
      for (let x = 54; x < 360; x += 26) { ctx.beginPath(); ctx.moveTo(x, 40); ctx.lineTo(x, 164); ctx.stroke(); }
      ctx.restore(); ctx.globalAlpha = 1;

      const dx = p.active ? tiltX * 28 : tiltX * 25;
      const dy = p.active ? tiltY * 22 : tiltY * 18;
      const q = [
        [91 + dx, 43 + dy], [286 + dx, 49 - dy],
        [269 + dx * 0.8, 166 + dy], [72 + dx * 0.8, 157 - dy],
      ];
      const point = (u: number, v: number): [number, number] => {
        const topX = lerp(q[0][0], q[1][0], u), topY = lerp(q[0][1], q[1][1], u);
        const botX = lerp(q[3][0], q[2][0], u), botY = lerp(q[3][1], q[2][1], u);
        return [lerp(topX, botX, v), lerp(topY, botY, v)];
      };

      // Board plane.
      ctx.beginPath(); q.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
      ctx.fillStyle = c.bg; ctx.fill(); ctx.strokeStyle = c.border; ctx.lineWidth = 1.4; ctx.stroke();
      for (let i = 0; i <= 9; i++) {
        const u = i / 9, v = i / 9;
        const a = point(u, 0), b = point(u, 1), d = point(0, v), e = point(1, v);
        ctx.strokeStyle = i % 3 === 0 ? c.muted : c.border;
        ctx.globalAlpha = i % 3 === 0 ? 0.9 : 0.58; ctx.lineWidth = i % 3 === 0 ? 1.2 : 0.65;
        ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(...d); ctx.lineTo(...e); ctx.stroke();
      }
      ctx.globalAlpha = 1; ctx.lineWidth = 1;

      // Corner brackets lock to the same quadrilateral that receives the digit overlay.
      ctx.save(); ctx.globalAlpha = lock; ctx.strokeStyle = c.accent; ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const [x, y] = q[i], [x1, y1] = q[(i + 1) % 4], [x2, y2] = q[(i + 3) % 4];
        const seg = (a: number, b: number) => { const len = Math.hypot(a, b) || 1; return [a / len * 11, b / len * 11]; };
        const a = seg(x1 - x, y1 - y), b = seg(x2 - x, y2 - y);
        ctx.beginPath(); ctx.moveTo(x + a[0], y + a[1]); ctx.lineTo(x, y); ctx.lineTo(x + b[0], y + b[1]); ctx.stroke();
      }
      ctx.restore();

      // Original recognized digits and newly solved digits share the same projected cell centers.
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let r = 0; r < 9; r++) for (let col = 0; col < 9; col++) {
        const [x, y] = point((col + 0.5) / 9, (r + 0.5) / 9);
        const given = puzzle[r][col] !== '0';
        if (given) text(ctx, puzzle[r][col], x, y, { size: 9, color: c.text, font: MONO, weight: 500 });
      }
      for (let i = 0; i < shown; i++) {
        const [r, col] = blanks[i], [x, y] = point((col + 0.5) / 9, (r + 0.5) / 9);
        text(ctx, solution[r][col], x, y, { size: 9, color: c.accent, font: MONO, weight: 700 });
      }
      const status = phase < 0.9 ? 'searching for grid' : shown < blanks.length ? `solving · ${shown}/${blanks.length}` : 'solution registered';
      text(ctx, status, 368, 184, { size: 8.5, color: shown === blanks.length ? c.good : c.muted, align: 'right' });
    },
  };
}

/* ------------------------------------------------------------------------------------------
 * Bandit coursework: three policies run against the same Bernoulli arms. Thompson's posterior
 * densities and the cumulative pseudo-regret traces are recomputed from the live trial count.
 * ---------------------------------------------------------------------------------------- */
function bandits(): Scene {
  const means = [0.22, 0.43, 0.62, 0.79];
  const best = Math.max(...means);
  const logFact = (n: number) => { let s = 0; for (let i = 2; i <= n; i++) s += Math.log(i); return s; };
  const betaDensity = (x: number, a: number, b: number) => {
    if (x <= 0 || x >= 1) return 0;
    const logBeta = logFact(a - 1) + logFact(b - 1) - logFact(a + b - 1);
    return Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log1p(-x) - logBeta);
  };
  const gammaSample = (shape: number, r: () => number) => {
    const d = shape - 1 / 3, k = 1 / Math.sqrt(9 * d);
    for (let i = 0; i < 64; i++) {
      const x = gauss(r), v = 1 + k * x;
      if (v <= 0) continue;
      const v3 = v * v * v, u = r();
      if (u < 1 - 0.0331 * x ** 4 || Math.log(u) < 0.5 * x * x + d * (1 - v3 + Math.log(v3))) return d * v3;
    }
    return shape;
  };
  const betaSample = (a: number, b: number, r: () => number) => {
    const x = gammaSample(a, r), y = gammaSample(b, r);
    return x / (x + y);
  };
  const rollout = (steps: number) => {
    const names = ['ε-greedy', 'UCB', 'Thompson'];
    const result = names.map((name, pi) => ({ name, pulls: [0, 0, 0, 0], wins: [0, 0, 0, 0], regrets: [] as number[], picked: 0 }));
    result.forEach((s, pi) => {
      const r = rng(1907 + pi * 311);
      let regret = 0;
      for (let n = 0; n < steps; n++) {
        let arm = 0;
        if (pi === 0) {
          if (r() < 0.12) arm = Math.floor(r() * means.length);
          else {
            let top = -Infinity;
            for (let a = 0; a < means.length; a++) {
              const value = s.pulls[a] ? s.wins[a] / s.pulls[a] : 0.5;
              if (value > top) { top = value; arm = a; }
            }
          }
        } else if (pi === 1) {
          const untried = s.pulls.findIndex((v) => v === 0);
          if (untried >= 0) arm = untried;
          else {
            let top = -Infinity;
            for (let a = 0; a < means.length; a++) {
              const value = s.wins[a] / s.pulls[a] + Math.sqrt(2 * Math.log(n + 1) / s.pulls[a]);
              if (value > top) { top = value; arm = a; }
            }
          }
        } else {
          let top = -Infinity;
          for (let a = 0; a < means.length; a++) {
            const sample = betaSample(1 + s.wins[a], 1 + s.pulls[a] - s.wins[a], r);
            if (sample > top) { top = sample; arm = a; }
          }
        }
        s.picked = arm;
        s.pulls[arm]++;
        if (r() < means[arm]) s.wins[arm]++;
        regret += best - means[arm];
        s.regrets.push(regret);
      }
    });
    return result;
  };

  return {
    still: 3.2,
    draw({ ctx, t, p, c }) {
      const steps = Math.floor((t % 14) * 5);
      const runs = rollout(steps), ts = runs[2];
      const hovered = p.active && p.x < 0.5 && p.y > 0.17 && p.y < 0.75
        ? clamp(Math.floor((p.y * H - 39) / 27), 0, 3) : -1;
      const focus = hovered >= 0 ? hovered : ts.picked;

      text(ctx, `4 Bernoulli arms · ${steps} trials`, 18, 18, { size: 8.5, color: c.muted, weight: 600 });
      text(ctx, 'Beta posterior · Thompson sampling', 18, 35, { size: 8, color: c.faint });
      for (let a = 0; a < means.length; a++) {
        const y = 55 + a * 27;
        if (a === focus) { ctx.save(); ctx.globalAlpha = 0.07; rr(ctx, 14, y - 10, 184, 22, 5); ctx.fillStyle = c.accent; ctx.fill(); ctx.restore(); }
        text(ctx, `A${a + 1}`, 19, y, { size: 8.5, color: a === focus ? c.accent : c.muted, weight: a === focus ? 600 : 400 });
        const alpha = 1 + ts.wins[a], beta = 1 + ts.pulls[a] - ts.wins[a];
        const postMean = alpha / (alpha + beta);
        text(ctx, postMean.toFixed(2), 47, y, { size: 7.5, color: c.faint, font: MONO, align: 'right' });
        const x0 = 57, width = 128, baseline = y + 8, maxHeight = 13;
        ctx.strokeStyle = c.border; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(x0, baseline); ctx.lineTo(x0 + width, baseline); ctx.stroke();
        const density: [number, number][] = [];
        let maxD = 0;
        for (let k = 1; k < 40; k++) { const x = k / 40, d = betaDensity(x, alpha, beta); density.push([x, d]); maxD = Math.max(maxD, d); }
        ctx.beginPath(); density.forEach(([x, d], i) => {
          const px = x0 + x * width, py = baseline - (d / (maxD || 1)) * maxHeight;
          i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        });
        ctx.strokeStyle = a === focus ? c.accent : c.cool; ctx.lineWidth = a === focus ? 1.8 : 1.1; ctx.stroke(); ctx.lineWidth = 1;
      }
      const picked = ts.picked + 1;
      text(ctx, hovered >= 0 ? `inspect A${hovered + 1} · α=${1 + ts.wins[hovered]} β=${1 + ts.pulls[hovered] - ts.wins[hovered]}` : `Thompson draw → arm ${picked}`, 18, 174, { size: 8, color: c.accent, font: MONO });

      // Cumulative expected regret on the same four-arm reward environment.
      const x0 = 218, y0 = 48, width = 164, height = 111;
      text(ctx, 'cumulative regret', x0, 29, { size: 8.5, color: c.muted, weight: 600 });
      ctx.strokeStyle = c.border; ctx.lineWidth = 0.7;
      for (let k = 0; k <= 3; k++) { const y = y0 + (height * k) / 3; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + width, y); ctx.stroke(); }
      const maxRegret = Math.max(1, ...runs.flatMap((s) => s.regrets));
      const colors = [c.cool, c.good, c.accent];
      runs.forEach((s, i) => {
        if (!s.regrets.length) return;
        ctx.strokeStyle = colors[i]; ctx.lineWidth = i === 2 ? 1.8 : 1.2; ctx.beginPath();
        s.regrets.forEach((value, n) => {
          const x = x0 + (s.regrets.length > 1 ? (n / (s.regrets.length - 1)) * width : 0);
          const y = y0 + height - (value / maxRegret) * (height - 6);
          n ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        });
        ctx.stroke();
      });
      ctx.lineWidth = 1;
      text(ctx, '0', x0, 168, { size: 7.5, color: c.faint });
      text(ctx, `${steps}`, x0 + width, 168, { size: 7.5, color: c.faint, align: 'right' });
      const legend = [['ε-greedy', c.cool], ['UCB', c.good], ['Thompson', c.accent]] as [string, string][];
      legend.forEach(([label, color], i) => {
        const x = x0 + i * 55;
        ctx.strokeStyle = color; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(x, 183); ctx.lineTo(x + 9, 183); ctx.stroke();
        text(ctx, label, x + 12, 183, { size: 7.3, color: c.muted });
      });
    },
  };
}

export const SCENES: Record<string, () => Scene> = { mathprompter, yolo, permutation, quantum, recipes, stocks, journal, navicane, sudoku, bandits };
void W; void SANS;
