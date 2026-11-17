// On-device replies for the pet, from the browser's own language model (the Prompt API in
// Chromium browsers). It is only used when the model is already on the device: this site never
// starts a model download, so everywhere else the pet keeps its canned lines.

type Session = {
  promptStreaming(input: string, options?: { signal?: AbortSignal }): AsyncIterable<string>;
  clone(options?: { signal?: AbortSignal }): Promise<Session>;
  destroy(): void;
};
type LanguageModelStatic = {
  availability(options?: object): Promise<'unavailable' | 'downloadable' | 'downloading' | 'available'>;
  create(options?: object): Promise<Session>;
};

const TEXT_EN = {
  expectedInputs: [{ type: 'text', languages: ['en'] }],
  expectedOutputs: [{ type: 'text', languages: ['en'] }],
};

const PERSONA = [
  "You are Moss, a small pixel space invader living on Sudhansh Peddabomma's personal website.",
  'You talk like the narrator of the text adventure Zork: deadpan, dry, second person, faintly ominous.',
  'Never cute, never enthusiastic. No emoji, no exclamation marks, no markdown, no lists.',
  'Reply in one or two short sentences, under 28 words.',
  'For anything about Sudhansh or this site, use only the site excerpts you are given. If they do not',
  'contain the answer, say you do not know. Never invent facts about him.',
].join(' ');

const model = (): LanguageModelStatic | null =>
  (globalThis as unknown as { LanguageModel?: LanguageModelStatic }).LanguageModel ?? null;

let ready: Promise<boolean> | null = null;
let base: Promise<Session> | null = null; // system prompt only; remarks fork it and throw the fork away
let chat: Promise<Session> | null = null; // the visitor's conversation, so follow-up questions work
let chatUsedAt = 0;
let inflight: AbortController | null = null;
const CHAT_IDLE_MS = 10 * 60 * 1000; // after this long without a question, start a fresh conversation

/** True only when the browser has a model on the device right now. Never triggers a download. */
export function brainReady(): Promise<boolean> {
  ready ??= (async () => {
    const lm = model();
    if (!lm || (window as unknown as { __ff?: Record<string, boolean> }).__ff?.brain === false) return false;
    try {
      return (await lm.availability(TEXT_EN)) === 'available';
    } catch {
      return false;
    }
  })();
  return ready;
}

async function session(): Promise<Session> {
  base ??= model()!.create({ ...TEXT_EN, initialPrompts: [{ role: 'system', content: PERSONA }] });
  try {
    return await base;
  } catch (e) {
    base = null;
    throw e;
  }
}

const clean = (s: string) =>
  s.replace(/[*_`#>]+/g, '').replace(/!+/g, '.').replace(/\s+/g, ' ').trim();

// Chrome keeps the conversation inside a session. When it outgrows the context window, Chrome drops
// the oldest turns but never the system prompt, so the chat needs no compaction of its own.
async function chatSession(): Promise<Session> {
  const now = Date.now();
  if (chat && now - chatUsedAt > CHAT_IDLE_MS) { (await chat.catch(() => null))?.destroy(); chat = null; }
  chatUsedAt = now;
  chat ??= session().then((s) => s.clone());
  try {
    return await chat;
  } catch (e) {
    chat = null;
    throw e;
  }
}

/** Stream one reply, either in the ongoing chat or in a throwaway fork of the base session. */
async function run(input: string, onText: (text: string) => void, inChat = false): Promise<string> {
  inflight?.abort();
  const ctl = new AbortController();
  inflight = ctl;
  const s = inChat ? await chatSession() : await (await session()).clone({ signal: ctl.signal });
  let out = '';
  try {
    for await (const chunk of s.promptStreaming(input, { signal: ctl.signal })) {
      out += chunk;
      onText(clean(out));
      if (out.length > 260) { ctl.abort(); break; } // it is meant to be terse
    }
  } catch (e) {
    if (!ctl.signal.aborted) throw e;
  } finally {
    if (!inChat) s.destroy();
    if (inflight === ctl) inflight = null;
  }
  return clean(out);
}

// Site-wide grounding from the Pagefind index that already powers search.
type PagefindResult = { data(): Promise<{ url: string; meta?: { title?: string }; excerpt?: string; content?: string }> };
let pagefind: Promise<{ search(q: string): Promise<{ results: PagefindResult[] }> } | null> | null = null;
const loadPagefind = () => {
  pagefind ??= import(/* @vite-ignore */ '/pagefind/pagefind.js').catch(() => null);
  return pagefind;
};
const strip = (html: string) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function siteExcerpts(query: string): Promise<string> {
  const pf = await loadPagefind();
  if (!pf) return '';
  try {
    const { results } = await pf.search(query);
    const top = await Promise.all(results.slice(0, 3).map((r) => r.data()));
    return top
      .map((d, i) => `[${i + 1}] ${d.meta?.title ?? d.url} (${d.url}): ${strip(d.excerpt ?? '')} ${strip(d.content ?? '').slice(0, 500)}`)
      .join('\n');
  } catch {
    return '';
  }
}

/** Answer a visitor's question, grounded in this page and the site's search index. */
export async function ask(question: string, onText: (text: string) => void): Promise<string> {
  const q = question.trim().slice(0, 300);
  const page = document.querySelector('main')?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 900) ?? '';
  const excerpts = await siteExcerpts(q);
  return run(
    `Site excerpts:\n${excerpts || '(none found)'}\n\nCurrent page "${document.title}": ${page}\n\nThe visitor asks: ${q}`,
    onText,
    true,
  );
}

/** One dry remark about the paragraph the pet has just landed on. */
export function remark(paragraph: string, onText: (text: string) => void): Promise<string> {
  const text = paragraph.replace(/\s+/g, ' ').trim().slice(0, 700);
  return run(
    `You are standing on this paragraph:\n"${text}"\n\nMake one dry remark about it, under 14 words. Do not quote it back.`,
    onText,
  );
}

export function hush() {
  inflight?.abort();
}
