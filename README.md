# Codex Pet Sprite Editor

A local-first web editor for creating Codex Pet sprite sheets. It supports both v1 and v2 layouts and is built as a fully static Next.js application.

Images stay on your device. The editor does not require an account, backend, database, or image upload service.

> This project is in active development. The v1/v2 editing, preview, validation, and local export workflow is implemented. Local project persistence, ZIP packaging, documentation, and deployment remain on the roadmap.

## Sprite formats

| Format |   Grid | Cell size | Output size | Available frames | Purpose                                 |
| ------ | -----: | --------: | ----------: | ---------------: | --------------------------------------- |
| v1     |  8 × 9 | 192 × 208 | 1536 × 1872 |               57 | Nine animation rows                     |
| v2     | 8 × 11 | 192 × 208 | 1536 × 2288 |               73 | v1 animations plus 16 directional poses |

Both formats contain 15 unused cells. Empty available frames and unused cells remain transparent in the exported sprite sheet. Available frames do not need to be filled before export.

## Planned workflow

1. Choose the v1 or v2 sprite format.
2. Add transparent images to the frames you need.
3. Preview animation states and check the layout.
4. Export `spritesheet.webp`, `spritesheet.png`, and `pet.json`.
5. Extract the pet folder into `~/.codex/pets/<pet-id>/`.
6. Open **Settings → Pets** in Codex Desktop, refresh the list, and select the pet.

The generated folder will use this structure:

```text
my-pet/
├── pet.json
└── spritesheet.webp
```

## Current status

- [x] Static Next.js foundation
- [x] v1 and v2 specification presets
- [x] Format-aware sprite grid
- [x] Missing-frame warnings that do not block export
- [x] Responsive dark interface
- [x] Single-frame, row, drag-and-drop, and filename-mapped image import
- [x] Frame replacement, movement, removal, and placement modes
- [x] Canvas sprite-sheet composition
- [x] Animation and pointer-direction preview
- [x] PNG, WebP, and JSON export
- [ ] ZIP package export
- [ ] Local project persistence with IndexedDB
- [ ] Documentation, examples, and deployment

## Local development

Requirements:

- Node.js 20 or newer
- npm

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run the project checks:

```bash
npm test
npm run typecheck
npm run build
```

The production build uses Next.js static export and writes the deployable site to `out/`.

## Analytics and production URL

Copy `.env.example` to `.env.local` and configure the public deployment values:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://your-production-domain.example
```

The GA4 tag is omitted completely when no measurement ID is configured. When enabled, the editor records page views and a small set of product events: sprite version selection, frame import method and count, animation preview selection, and successful PNG, WebP, or JSON export. Image data, filenames, pet IDs, display names, and descriptions are never included in analytics events.

`NEXT_PUBLIC_SITE_URL` is used to generate the canonical URL, Open Graph metadata, `robots.txt`, and `sitemap.xml`. Set it before the production build.

## Project structure

```text
src/
├── app/                  # Static pages and global styles
├── components/           # Interactive editor UI
└── lib/
    ├── sprite-presets.ts # v1/v2 format definitions
    ├── sprite-project.ts # Project and frame model
    └── validate-project.ts
```

Format dimensions, row definitions, valid cells, and version rules live in the sprite preset module. UI and export code consume those presets instead of duplicating format constants.

## Privacy and architecture

All image decoding, editing, composition, storage, and export are designed to run in the browser. The project does not use Next.js Route Handlers, Server Actions, a backend service, or a remote database. If the optional GA4 integration is enabled, it sends usage events to Google Analytics without image or project content.

Projects will be stored locally using IndexedDB. Static deployment is supported on Vercel and other static hosts.

## Development plan

See [docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md) for the phased implementation plan and acceptance criteria.

## License

Licensed under the [Apache License 2.0](LICENSE).
