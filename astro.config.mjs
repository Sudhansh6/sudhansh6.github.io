// @ts-check
import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkInclude from './src/lib/remark-include.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://sudhansh6.github.io',
  markdown: {
    // Notes were written for Jekyll/kramdown: `$$...$$` is math (inline or display), single `$` is text.
    remarkPlugins: [remarkInclude, [remarkMath, { singleDollarTextMath: false }]],
    rehypePlugins: [[rehypeKatex, { throwOnError: false, strict: false }]],
  },
});
