# Résumés

LaTeX sources for the one-page résumés.

| File | Purpose |
|---|---|
| `resume-common.tex` | Shared preamble, layout and every bullet, written once |
| `SudhanshPeddabomma-AI.tex` | AI and software engineering profile |
| `SudhanshPeddabomma-Vision.tex` | Computer vision, 3D and robotics profile |
| `check_lines.py` | Flags bullets that leave a short dangling last line |

Build with pdfLaTeX (TeX Live):

```sh
latexmk -pdf SudhanshPeddabomma-AI.tex SudhanshPeddabomma-Vision.tex
python3 check_lines.py SudhanshPeddabomma-AI.pdf SudhanshPeddabomma-Vision.pdf
```

Each profile picks its own coursework, skills and section order, and may tighten the vertical
spacing (`\secgap`, `\rulegap`, `\entrygap`, `\headgap`, `\itemgap`, `\groupgap`) to stay on one page.
Bullets inside an entry sit tight together; entries and sections get progressively larger gaps.

The default typeface is Charter with Source Sans headings; override `\resumefont` and `\headfont` before `\input{resume-common}`
to try another pairing.
