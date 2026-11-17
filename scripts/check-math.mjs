// Reports KaTeX parse errors in post Markdown without building the site.
// Usage: node scripts/check-math.mjs [file-or-dir ...]   (default: src/content/posts)
// Uses the same math options as astro.config.mjs (only $$…$$ is math, as on the Jekyll site).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import katex from 'katex';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

const walk = (p) => (statSync(p).isDirectory() ? readdirSync(p).flatMap((f) => walk(join(p, f))) : /\.mdx?$/.test(p) ? [p] : []);
const files = (process.argv.slice(2).length ? process.argv.slice(2) : ['src/content/posts']).flatMap(walk);
const parser = unified().use(remarkParse).use(remarkMath, { singleDollarTextMath: false });

let errors = 0;
for (const file of files) {
  const tree = parser.parse(readFileSync(file, 'utf8'));
  visit(tree, ['math', 'inlineMath'], (node) => {
    try {
      katex.renderToString(node.value, { throwOnError: true, strict: false, displayMode: node.type === 'math' });
    } catch (e) {
      errors++;
      const msg = String(e.message).replace(/^KaTeX parse error: /, '').slice(0, 160);
      console.log(`${file}:${node.position?.start.line}: ${msg}\n    ${node.value.replace(/\s+/g, ' ').slice(0, 140)}`);
    }
  });
}
console.log(`${errors} math error(s) in ${files.length} file(s)`);
process.exitCode = errors ? 1 : 0;
