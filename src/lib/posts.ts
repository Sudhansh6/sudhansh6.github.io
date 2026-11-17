// Notes keep their Jekyll layout: a post is a `YYYY-MM-DD-slug.md` file; sibling chapter files are
// pulled in with `{% include_relative %}` (src/lib/remark-include.mjs) and are not posts themselves.
export const POST_FILE = /(?:^|\/)(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/;

/** Date encoded in a post's file name; year 0001 marks undated drafts on the old site. */
export function postDate(filePath: string | undefined): Date | undefined {
  const m = filePath?.match(POST_FILE);
  if (!m || Number(m[1]) < 1900) return undefined;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
}
