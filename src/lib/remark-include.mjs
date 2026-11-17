// Expands Jekyll `{% include_relative file.md %}` tags, which the notes use to split long course
// notes into one file per lecture. A paragraph made only of include tags is replaced by the parsed
// content of those files (resolved relative to the including file, recursively).
import fs from 'node:fs';
import path from 'node:path';

const TAG = /\{%\s*include_relative\s+(\S+?)\s*%\}/g;
const ONLY_TAGS = /^(\s*\{%\s*include_relative\s+\S+?\s*%\}\s*)+$/;

export default function remarkInclude() {
  const processor = this;

  function expand(tree, dir, seen) {
    const children = [];
    for (const node of tree.children) {
      const text = node.type === 'paragraph' && node.children.every((c) => c.type === 'text')
        ? node.children.map((c) => c.value).join('') : '';
      if (!text || !ONLY_TAGS.test(text)) {
        children.push(node);
        continue;
      }
      for (const [, rel] of text.matchAll(TAG)) {
        const file = path.resolve(dir, rel);
        if (seen.has(file)) throw new Error(`include_relative cycle: ${file}`);
        const sub = processor.parse(fs.readFileSync(file, 'utf8'));
        expand(sub, path.dirname(file), new Set(seen).add(file));
        children.push(...sub.children);
      }
    }
    tree.children = children;
  }

  return (tree, file) => {
    if (!file.path) return;
    expand(tree, path.dirname(file.path), new Set([file.path]));
  };
}
