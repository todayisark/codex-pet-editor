# Codex Pet Sprite Editor

Create, edit, preview, and export Codex Pet sprite sheets in your browser.

**[Open the editor →](https://codex-pet-editor.vercel.app/)**

No account or image uploads are required. Image processing and ZIP generation happen locally in your browser.

This is an independent community project, not affiliated with or endorsed by OpenAI.

## Features

- **Two sprite layouts:** v1 animation frames and v2 animation frames plus directional poses.
- **Frame editing:** upload images, drag between cells to move or swap, flip horizontally, and copy/paste frames.
- **GIF to PNG:** split a GIF into draggable PNG frames. The frame tray stays visible while you scroll through the editor.
- **Live previews:** preview animation rows and pointer-controlled directional poses.
- **Local export:** download a ZIP containing a WebP or PNG sprite sheet, pet metadata, and installation instructions.
- **Partial projects:** empty cells stay transparent and do not block export.

## Using the editor

1. Open the [live editor](https://codex-pet-editor.vercel.app/).
2. Choose **V1** or **V2**, then enter a pet ID, display name, and description. IDs use lowercase letters, numbers, and single hyphens, such as `my-pet`.
3. Double-click a cell to upload an image, or drop images onto the grid.
4. Rearrange and edit your frames, then check the preview.
5. Choose **WebP** or **PNG** and click **Download ZIP**.

For GIFs, click **GIF to PNG**, select a file, then drag the extracted frames into cells.

### Editing controls

| Action                     | Control                                            |
| -------------------------- | -------------------------------------------------- |
| Select a cell              | Single-click                                       |
| Upload or replace an image | Double-click                                       |
| Move an image              | Drag it to an empty cell                           |
| Swap two images            | Drag one onto an occupied cell                     |
| Copy a frame               | Select its cell, then press `Ctrl+C` / `⌘C`        |
| Paste a frame              | Select the destination, then press `Ctrl+V` / `⌘V` |
| Flip horizontally          | Click the upper-left mirror button                 |
| Remove an image            | Click the upper-right × button                     |
| Clear the grid             | Click **Clear all**, then confirm                  |

Pasting replaces the destination image and preserves the copied frame's flip state. Frame copying uses an in-page clipboard, not the system clipboard. Shortcuts apply when a grid cell has focus; text fields retain their normal copy/paste behavior.

## Sprite formats

| Format | Grid   | Cell size | Output size | Available frames |
| ------ | ------ | --------- | ----------- | ---------------- |
| v1     | 8 × 9  | 192 × 208 | 1536 × 1872 | 57               |
| v2     | 8 × 11 | 192 × 208 | 1536 × 2288 | 73               |

v1 contains nine animation rows. v2 adds 16 directional poses across two more rows. Both layouts have 15 unused cells, which remain transparent.

Switching from v2 to v1 asks for confirmation if directional frames would be removed.

## Export contents

The downloaded `<pet-id>.zip` contains these files at its root:

```text
pet.json
spritesheet.webp
README.md
```

Choosing PNG produces `spritesheet.png` instead, with the matching path in `pet.json`. The generated README includes installation instructions.

## Limitations

- **No automatic saving or project restore.** Refreshing or closing the page discards the current editing session. Export before leaving.
- **No sprite-sheet or ZIP re-import yet.** An exported ZIP is an output package, not a resumable editor project.
- **GIF splitting requires browser support for `ImageDecoder`.** The editor displays an error if it is unavailable; you can still upload individual supported images.
- **The interface is designed for desktop use.** It currently has a minimum page width of 1100px; narrow screens may require horizontal scrolling.
- **No general undo history.** Clearing all images requires confirmation, but deleted or overwritten frames cannot be recovered through an undo command.

## Local development

Use **Node.js 24.x** and npm. The current test tooling requires Node.js 22.12+ on the 22.x line, or a supported newer major version.

From the repository directory:

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000).

Available checks:

```bash
npm run lint
npm run typecheck
npm test
npm run format:check
npm run build
```

Built with Next.js, React, TypeScript, browser Canvas APIs, and JSZip. Tests run with Vitest.

## Privacy and analytics

Uploaded images are decoded, edited, and exported in the browser. The app does not provide an image-upload backend, require an account, or store projects on a server.

When configured, the optional Google Analytics integration sends page views and usage events such as sprite-version changes, frame-import counts, preview selection, and successful exports. The application's custom event payloads do not include image contents, filenames, pet IDs, display names, or descriptions.

Local image processing does not mean the website makes no network requests: page assets are fetched from the hosting provider, and enabling GA4 adds requests to Google. Operators deploying their own instance should document their analytics configuration and applicable privacy choices.

## License

[Apache License 2.0](LICENSE).
