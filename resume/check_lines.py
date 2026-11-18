#!/usr/bin/env python3
"""Check résumé bullet lengths: each bullet must fill one line, or run 1.5 to 2 lines.

Usage: python3 check_lines.py file.pdf [...]. Reads word boxes from `pdftotext -bbox-layout`,
groups the lines of each bullet (a line starting with the bullet glyph begins one; following lines
indented to the bullet's text continue it), and reports the fill of the last line.
"""
import re, subprocess, sys, html

FULL = 0.86      # a one-line bullet must reach this fraction of the text width
MIN_LAST = 0.50  # a two-line bullet's last line must reach this fraction

def lines(pdf):
    xml = subprocess.run(['pdftotext', '-bbox-layout', pdf, '-'], capture_output=True, text=True).stdout
    out = []
    for m in re.finditer(r'<line xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</line>', xml, re.S):
        boxes = re.findall(r'<word xMin="([\d.]+)"[^>]*>([^<]*)</word>', m.group(5))
        words = [html.unescape(w) for _, w in boxes]
        # Where the text proper starts: the second word on a bullet line, else the first.
        text_x = float(boxes[1][0]) if len(boxes) > 1 and words[0] == '•' else float(m.group(1))
        out.append((float(m.group(1)), float(m.group(3)), ' '.join(words), text_x))
    return out

def check(pdf):
    ls = lines(pdf); bad = 0
    right = max(l[1] for l in ls)
    i = 0
    while i < len(ls):
        x0, x1, text, text_x = ls[i]
        if not text.startswith('•'):
            i += 1; continue
        # Continuation lines share the indent of the text after the bullet glyph.
        start = text_x
        group = [ls[i]]; j = i + 1
        while j < len(ls) and abs(ls[j][0] - start) < 3 and not ls[j][2].startswith('•'):
            group.append(ls[j]); j += 1
        fill = (group[-1][1] - start) / (right - start)
        n = len(group)
        ok = (n == 1 and fill >= FULL) or (n == 2 and fill >= MIN_LAST)
        if not ok:
            bad += 1
            print(f'  x {n} line(s), last line {fill:.0%}: {text[2:80]}…')
        i = j
    print(f'{pdf}: {"ok" if not bad else f"{bad} bullet(s) to fix"}')
    return bad

sys.exit(1 if sum(check(p) for p in sys.argv[1:]) else 0)
