# Image Spacer · vipercoma

A local Adobe Illustrator panel for distributing linked images, embedded images, and groups containing images.

## Distribution options

| Mode | Behavior |
| --- | --- |
| Compact grid | Equal cells sized to the largest image; fills row by row |
| Distributed grid | Equal cells spread across the active artboard |
| Wrapped rows | Images placed side by side; wrap when the row is full |
| Horizontal row | One row |
| Vertical column | One column |

Grid is the default. Choose automatic columns or enter a fixed column count. All images must fit a grid: if they do not, the preview explains how to make room. Optional **Shrink all images proportionally to fit** uses one common scale, preserves aspect ratios, and never enlarges images. It is off by default.

Set horizontal/vertical gaps and margins in millimetres. Choose original selection order, tallest first, widest first, or largest area first. Start/center alignment works in grids; space-between distribution works in rows and columns. In grids, images are centered inside equal cells, so gaps between smaller images can exceed the specified minimum. For wrapped rows, gaps apply to the actual image rectangles.

The **vipercoma** watermark appears only in the panel and preview, never in the document or exported artwork.

## Install on Windows

1. Close Illustrator, or restart it after installation.
2. Run `Install.ps1` from this folder, or copy this folder to `%APPDATA%\Adobe\CEP\extensions\ImageSpacer`.
3. Open **Window → Extensions → Image Spacer**.

This is an unsigned CEP extension. Adobe's `PlayerDebugMode` must already be enabled for your CEP runtime. The installer does not change that setting. Illustrator 2021 uses CEP 11 on the development machine; its setting was enabled separately by the user.

The installer backs up an existing installation beside the extension folder before updating it, and checks SHA-256 hashes after copying.

## Use

Select images in Illustrator, choose a distribution, click **Preview Distribution**, then **Apply Distribution**. The preview contains numbered rectangles instead of thumbnails. Images that do not fit a row/column layout stay in place and are counted. Grid places every eligible image or refuses to apply an incomplete layout.

The panel checks that the selection, document, artboard rectangle, and image bounds still match the preview. Preview again after editing. Use Illustrator Undo to revert changes. It never changes source image files or embeds linked files.

## Limits and compatibility

- Built for Illustrator 2021 / CEP 11; later Illustrator versions have not been verified.
- Groups move/scale as a unit, including other contents. Clipped groups use their direct clipping boundary.
- Uses rectangular bounds, including transparent image areas; no true-shape nesting, rotation, or automatic artboard creation.
- Live Illustrator execution and visual appearance need an in-app check.
- No network requests or third-party JavaScript packages. Uses Adobe's built-in CEP `evalScript` bridge directly.

## Development

`js/layout.js` is an ES3-compatible engine shared by the panel and ExtendScript host. `jsx/host.jsx` reads the selection and applies movement/scaling. `js/panel.js` handles controls and preview rendering.

Run `node tests/layout-host.test.cjs` from this folder. The tests cover all five modes, fit scaling, randomized boundaries/spacing, mocked host movement/scaling, stale previews, and rollback after an injected failure. Host tests are simulations and do not substitute for live Illustrator validation.

Open `index.html` in a browser for a six-image rectangle demo. Apply is disabled outside Illustrator.

## Repository status

This source folder is ready to import into a GitHub repository. No GitHub repository has been created or published yet.

## Animated distribution selector

This edition uses a dependency-free JavaScript/CSS adaptation inspired by the supplied React Bits RubberSegment component. Tap Grid, Spread, Wrap, Row, or Column; drag the selected thumb or use arrow keys, Home, and End. The selector respects reduced-motion settings and is disabled while Illustrator is processing. Existing settings, preview invalidation, and installation remain the same. No React, motion, build step, or network connection is required. It reproduces the segmented interaction rather than the exact React animation physics.


## Design foundation

See [DESIGN.md](DESIGN.md) for the approved monochrome palette, reactive dots, rounded controls, menu animation, accessibility and development workflow. Edit shared values in design-tokens.css. The current custom Image order menu is option 2 approved during design review.

