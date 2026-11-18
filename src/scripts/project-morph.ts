// Card-to-page morph for projects. Cards and project pages mark their media and title with
// data-morph-project / data-morph-part (see projectMorph in src/lib/projects.ts). On each
// navigation, only the project being opened or returned from gets view-transition names, on both
// the old and new page, so its card and page hero morph into each other while everything else
// crossfades with the page. Naming every card would lift all of them out of the crossfade.

const slugOf = (url: URL) => url.pathname.match(/^\/projects\/([^/]+)\/?$/)?.[1];

let active = new Set<string>();

function nameMorphs(doc: Document) {
  doc.querySelectorAll<HTMLElement>('[data-morph-project]').forEach((el) => {
    const slug = el.dataset.morphProject!;
    el.style.viewTransitionName = active.has(slug)
      ? `project-${el.dataset.morphPart}-${slug.replace(/[^\w-]/g, '-')}`
      : '';
  });
}

document.addEventListener('astro:before-preparation', (e) => {
  active = new Set([slugOf(e.from), slugOf(e.to)].filter((s): s is string => !!s));
  nameMorphs(document);
});
document.addEventListener('astro:before-swap', (e) => nameMorphs(e.newDocument));
