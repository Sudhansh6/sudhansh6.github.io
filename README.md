# sudhansh6.github.io — Astro rebuild

Personal site for Sudhansh Peddabomma. Rebuilt with [Astro](https://astro.build) in 2026,
replacing the old Jekyll/al-folio site. Deploys to GitHub Pages via Actions.

## Develop

```sh
npm install
npm run dev
```

## Build

```sh
npm run build   # astro build + pagefind search index
```

## Content

Markdown content lives in `src/content/`:

- `projects/` — project cards (frontmatter: `title`, `description`, `category`,
  `importance` (1 = top), `img`, `redirect`)
- `news/` — dated news items (`date: YYYY-MM-DD`)
- `posts/` — longer writing/notes

Papers live in `src/data/papers.json` (converted from BibTeX).

Static assets (images, video, PDFs) live in `public/assets/`.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and
deploys to GitHub Pages. In the repo settings, Pages must be set to
**Deploy from GitHub Actions** (not from a branch).

## Feature flags

Experimental features are off by default and can be switched on from the URL; the choice is
remembered in `localStorage` until changed.

| URL | Effect |
| --- | --- |
| `?pet` or `?pet=1` | show Moss, the site pet (drag it into the homepage intro) |
| `?pet=0` | hide it again |
| `?ff=pet,-other` | enable / disable several flags at once |
| `?ff=reset` | back to defaults |

Flags are defined in the inline script at the top of `src/layouts/Base.astro`. Each enabled flag
sets `data-ff-<name>` on `<html>` and is available to scripts as `window.__ff`.
