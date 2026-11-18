import type { CollectionEntry } from 'astro:content';

type Project = CollectionEntry<'projects'>;

/** URL slug of a project, e.g. `2dgsir` for /projects/2dgsir. */
export const projectSlug = (p: Project) => p.id.replace(/\.md$/, '');

export const projectHref = (p: Project) => `/projects/${projectSlug(p)}`;

/**
 * Marks a project's media or title so it morphs between its card and its page during
 * navigation. src/scripts/project-morph.ts names only the pair involved in each navigation.
 */
export const projectMorph = (p: Project, part: 'media' | 'title') => ({
  'data-morph-project': projectSlug(p),
  'data-morph-part': part,
});
