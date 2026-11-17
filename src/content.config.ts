import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { POST_FILE } from './lib/posts';
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(), description: z.string(), category: z.string(),
    importance: z.number().default(3), img: z.string().optional(),
    // Project write-up (PDF, shown inline on the project page) and source repository.
    report: z.string().optional(), repo: z.string().url().optional(),
    // Other write-ups (talks, abstracts, articles) shown as link pills on the project page.
    links: z.array(z.object({ label: z.string(), url: z.string().url() })).optional(),
    // Key into src/data/viz.ts: the interactive or animated visual for this project.
    viz: z.string().optional(),
    // Built and reachable by URL, but left out of listings, site search and search engines.
    unlisted: z.boolean().default(false),
  }),
});
const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({ date: z.coerce.date(), title: z.string().optional() }),
});
// The id is the Jekyll `:title` slug, so /blog/<slug>/ links from the old site map onto /writing/<slug>.
const posts = defineCollection({
  loader: glob({
    pattern: '**/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-*.md',
    base: './src/content/posts',
    generateId: ({ entry }) => entry.match(POST_FILE)![4],
  }),
  schema: z.object({
    title: z.string(),
    // Jekyll front matter often leaves these blank, which YAML reads as null.
    excerpt: z.string().nullish(),
    description: z.string().nullish(),
    categories: z.array(z.string()).nullish().transform((c) => c ?? []),
  }),
});

export const collections = { projects, news, posts };
