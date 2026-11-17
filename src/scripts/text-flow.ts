// Live text reflow around a moving circle (the site pet), using Pretext for line breaking.
//
// Any prose paragraph on any page can host the obstacle: `[data-text-flow]` elements and `<p>`
// inside `<main>`, set up lazily the first time the obstacle reaches them. Paragraphs with math,
// media or hard line breaks are skipped, since the overlay cannot reproduce them. While the
// obstacle overlaps a paragraph, the
// paragraph's original content stays in the DOM (for screen readers and copy) but is made
// transparent, and an aria-hidden overlay paints Pretext-computed lines that part around the
// circle, on both sides when there is room. Inline <strong>, <em> and <a> survive the reflow.
import { clearCache } from '@chenglou/pretext';
import {
  layoutNextRichInlineLineRange,
  materializeRichInlineLineRange,
  prepareRichInline,
  type PreparedRichInline,
  type RichInlineCursor,
} from '@chenglou/pretext/rich-inline';

export type Obstacle = { x: number; y: number; r: number };

type Item = { text: string; font: string; chain: Element[] };
type Flow = {
  el: HTMLElement;
  src: HTMLElement;
  layer: HTMLElement;
  items: Item[];
  prepared: PreparedRichInline | null;
  natural: number;
  active: boolean;
  key: string;
};

const MIN_SPAN = 44; // narrowest gap (px) worth putting words into
const flows = new Map<HTMLElement, Flow>();
let fontsReady = false;

if (typeof document !== 'undefined') {
  (document.fonts?.ready ?? Promise.resolve()).then(() => {
    fontsReady = true;
    clearCache(); // widths measured before the web fonts loaded belong to the fallback font
    flows.forEach((flow) => { flow.prepared = null; flow.items = []; });
  });
}

const fontOf = (el: Element) => {
  const cs = getComputedStyle(el);
  return `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
};

function collect(node: Node, chain: Element[], out: Item[]) {
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      if (child.textContent) out.push({ text: child.textContent, font: fontOf(child.parentElement!), chain });
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      collect(child, [...chain, child as Element], out);
    }
  });
}

function setup(el: HTMLElement) {
  if (flows.has(el)) return;
  const src = document.createElement('span');
  src.className = 'flow-src';
  src.append(...Array.from(el.childNodes));
  const layer = document.createElement('span');
  layer.className = 'flow-lines';
  layer.setAttribute('aria-hidden', 'true');
  el.append(src, layer);
  el.classList.add('text-flow');
  flows.set(el, { el, src, layer, items: [], prepared: null, natural: 0, active: false, key: '' });
}

const TARGETS = '[data-text-flow], main p';
const EXCLUDED_AREAS = 'nav, header, footer, pre, table, figure, blockquote, .pet-layer, [data-no-flow]';
const BLOCKERS = '.katex, math, img, svg, picture, video, canvas, iframe, br, input, button, select, textarea';

/** The flowable paragraph containing `node`, if it is prose the overlay can reproduce. */
function eligible(node: Element | null): HTMLElement | null {
  const el = node?.closest<HTMLElement>(TARGETS) ?? null;
  if (!el || flows.has(el)) return el;
  if (!el.hasAttribute('data-text-flow')) {
    if (el.closest(EXCLUDED_AREAS) || el.querySelector(BLOCKERS)) return null;
    if ((el.textContent ?? '').trim().length < 40 || el.clientWidth < 160) return null;
  }
  return el;
}

function paragraphAt(x: number, y: number): HTMLElement | null {
  if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return null;
  for (const node of document.elementsFromPoint(x, y)) {
    const el = eligible(node);
    if (el) { setup(el); return el; }
  }
  return null;
}

/** Forget paragraphs that left the DOM (after a client-side navigation). */
export function scanFlowTargets() {
  flows.forEach((flow, el) => { if (!el.isConnected) flows.delete(el); });
}

/** The flowable paragraph under a viewport point, if any. */
export function flowTargetAt(x: number, y: number): HTMLElement | null {
  return paragraphAt(x, y) ?? paragraphAt(x, y - 6) ?? paragraphAt(x, y + 6);
}

/** Paragraphs comfortably inside the viewport, for the pet to hop into on its own. */
export function visibleFlowTargets(margin = 90): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(TARGETS)].filter((node) => {
    if (eligible(node) !== node) return false;
    const r = node.getBoundingClientRect();
    return r.width > 220 && r.top > margin && r.bottom < innerHeight - margin;
  });
}

function deactivate(flow: Flow) {
  if (!flow.active) return;
  flow.active = false;
  flow.key = '';
  flow.layer.replaceChildren();
  flow.el.classList.remove('is-flowing');
  flow.el.style.height = '';
}

function render(flow: Flow, o: Obstacle, rect: DOMRect) {
  if (!flow.prepared) {
    flow.items = [];
    collect(flow.src, [], flow.items);
    flow.prepared = prepareRichInline(flow.items.map(({ text, font }) => ({ text, font })));
  }
  const cs = getComputedStyle(flow.el);
  const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.6;
  const width = flow.el.clientWidth;
  const ox = o.x - rect.left;
  const oy = o.y - rect.top;

  const out: { x: number; y: number; line: ReturnType<typeof materializeRichInlineLineRange> }[] = [];
  let cursor: RichInlineCursor | undefined;
  let rows = 0;
  let done = false;
  while (!done && rows < 160) {
    const top = rows * lh;
    const dy = Math.abs(oy - Math.min(Math.max(oy, top), top + lh)); // circle centre to this row
    let spans: [number, number][] = [[0, width]];
    if (dy < o.r) {
      const half = Math.sqrt(o.r * o.r - dy * dy);
      spans = ([[0, ox - half], [ox + half, width]] as [number, number][])
        .map(([a, b]) => [Math.max(0, a), Math.min(width, b)] as [number, number])
        .filter(([a, b]) => b - a >= MIN_SPAN);
    }
    for (const [a, b] of spans) {
      const range = layoutNextRichInlineLineRange(flow.prepared, b - a, cursor);
      if (!range) { done = true; break; }
      out.push({ x: a, y: top, line: materializeRichInlineLineRange(flow.prepared, range) });
      cursor = range.end;
    }
    rows++;
  }
  if (!done) return; // pathological: leave the original text alone

  const frag = document.createDocumentFragment();
  for (const { x, y, line } of out) {
    const row = document.createElement('span');
    row.className = 'flow-line';
    row.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    line.fragments.forEach((fr, i) => {
      let node: Node = document.createTextNode((i > 0 && fr.gapBefore ? ' ' : '') + fr.text);
      const chain = flow.items[fr.itemIndex]?.chain ?? [];
      for (let k = chain.length - 1; k >= 0; k--) {
        const wrap = chain[k].cloneNode(false) as HTMLElement;
        if (wrap instanceof HTMLAnchorElement) wrap.tabIndex = -1;
        wrap.appendChild(node);
        node = wrap;
      }
      row.appendChild(node);
    });
    frag.appendChild(row);
  }
  flow.layer.replaceChildren(frag);
  flow.el.style.height = `${Math.max(flow.natural, Math.round((rows - 1) * lh + lh))}px`;
}

/**
 * Move the obstacle (viewport coordinates), or pass null to restore every paragraph. `skip` keeps
 * one paragraph untouched, such as the one the pet is standing on.
 */
export function setFlowObstacle(o: Obstacle | null, skip: HTMLElement | null = null) {
  // Only paragraphs under the obstacle (set up on demand) and ones still parted need work.
  const near = new Set(o ? [0, -0.8, 0.8].map((k) => paragraphAt(o.x, o.y + k * o.r)) : []);
  flows.forEach((flow) => {
    if (flow.el === skip) return deactivate(flow);
    if (o && !flow.active && !near.has(flow.el)) return;
    if (!o || !fontsReady || !flow.el.isConnected || o.r < 4) return deactivate(flow);
    const rect = flow.el.getBoundingClientRect();
    const bottom = rect.top + (flow.active ? flow.natural : rect.height);
    const hit = o.x + o.r > rect.left && o.x - o.r < rect.right && o.y + o.r > rect.top && o.y - o.r < bottom;
    if (!hit) return deactivate(flow);
    const key = `${(o.x - rect.left).toFixed(1)},${(o.y - rect.top).toFixed(1)},${o.r.toFixed(1)},${rect.width}`;
    if (flow.active && key === flow.key) return;
    if (!flow.active) {
      flow.natural = flow.el.offsetHeight;
      flow.active = true;
      flow.el.classList.add('is-flowing');
    }
    flow.key = key;
    render(flow, o, rect);
  });
}
