---
title: ooxml (open source)
description: "Open-source contributor to ooxml, a TypeScript engine and set of browser viewers for Office files. I have landed 111 pull requests and 310 commits across ooxml and its predecessor, pptx-viewer, covering editing fidelity, real-time collaboration, cross-framework parity, performance and host controls."
category: Open Source
importance: 1
viz: ooxml
repo: "https://github.com/ChristopherVR/ooxml"
links:
  - label: "My ooxml pull requests"
    url: "https://github.com/ChristopherVR/ooxml/pulls?q=is%3Apr+author%3ASudhansh6"
  - label: "My pptx-viewer pull requests"
    url: "https://github.com/ChristopherVR/pptx-viewer/pulls?q=is%3Apr+author%3ASudhansh6"
  - label: "Live demo"
    url: "https://christophervr.github.io/ooxml/"
---

[ooxml](https://github.com/ChristopherVR/ooxml) is an Apache-2.0 TypeScript library that reads, renders, edits and writes Office Open XML files (PPTX and DOCX) in the browser. It has one core package, `ooxml-core`, and viewer bindings for React, Vue, Svelte, Angular and plain JavaScript. The PowerPoint viewer started as [pptx-viewer](https://github.com/ChristopherVR/pptx-viewer) and later moved into ooxml.

Since September 2026 I have been one of the project's most active contributors. All 111 of my pull requests have landed: 75 in pptx-viewer and 36 in ooxml. The maintainer merged 104 and applied the other seven directly. That adds up to 310 commits on ooxml's main branch, the third most among human contributors. Most of these changes close gaps in behaviour the library already ships; the rest add new options and building blocks for applications that embed the viewer.

## What I worked on

**Editing that survives a round trip.** A slide's formatting has to stay intact after it is edited and saved, so that it still opens correctly in PowerPoint. I fixed many cases where it did not:

- rich text runs, paragraph metadata, numbered and bulleted lists, and soft line breaks;
- table merges and splits, column widths, fractional font sizes and row heights, and the order of a cell's inline content;
- chart and axis titles, and SmartArt node editing in each binding;
- placeholder transforms, group connector attachments, and embedded fonts in headless saves.

**Real-time collaboration.** I added host-owned [Yjs](https://yjs.dev) collaboration to every binding, with support for custom editor shells. I also fixed sync problems: two clients seeding an empty room at once now converge, and paragraph formatting, consecutive line breaks, and edits in the same text box survive synchronization.

**The same API in five frameworks.** I gave all five bindings the same public options and behaviour, including viewport fit options, element and image insertion, live list editing, and edit and preview mode switches. I also exposed the slide thumbnail rail as a reusable building block in each binding.

**Canvas interaction.** I added pointer-anchored zoom, drag to pan, zoom out to 10%, and pasting native images. I also kept selection and rotation handles reachable at small sizes and slide edges, and kept selection controls out of raster exports.

**Rendering fidelity.** I fixed font families named by weight and added font weight variants. I also fixed `textPlain` WordArt, native 3D chart axes, pictures inherited from unused layouts, and duplicated slides that need their own package parts.

**Performance and bundle size.** I made the viewers ship the PPTX engine once and load the EMF converter and outline-font parser lazily. Embedded fonts are now decoded on first use, and package-part reads are shared within a load. I also made unused components tree-shakeable and stopped redundant history cloning and stale deck captures from holding memory.

**Controls for embedding hosts.** I added options that let host applications:

- block external content with `allowExternalContent`;
- bound deck loads with `limits`;
- disable or self-host the Google Fonts fallback;
- translate the viewer through `PptxI18nProvider`;
- scope the viewer's styles so they do not leak into the host page.
