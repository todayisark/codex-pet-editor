# Codex Pet Sprite Editor

A local-first web editor for creating Codex Pet sprite sheets. It supports both v1 and v2 layouts and is built as a fully static Next.js application.

Images stay on your device. The editor does not require an account, backend, database, or image upload service.

> This project is in active development. The format selector, sprite specifications, grid UI, and validation foundation are implemented. Image editing, preview, and export are next on the roadmap.

## Sprite formats

| Format | Grid | Cell size | Output size | Available frames | Purpose |
| --- | ---: | ---: | ---: | ---: | --- |
| v1 | 8 × 9 | 192 × 208 | 1536 × 1872 | 57 | Nine animation rows |
| v2 | 8 × 11 | 192 × 208 | 1536 × 2288 | 73 | v1 animations plus 16 directional poses |

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
- [ ] Image import and frame replacement
- [ ] Canvas sprite-sheet composition
- [ ] Animation and directional preview
- [ ] PNG, WebP, JSON, and ZIP export
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

All image decoding, editing, composition, storage, and export are designed to run in the browser. The project does not use Next.js Route Handlers, Server Actions, a backend service, or a remote database.

Projects will be stored locally using IndexedDB. Static deployment is supported on Vercel and other static hosts.

## Development plan

See [docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md) for the phased implementation plan and acceptance criteria.

## License

Licensed under the [Apache License 2.0](LICENSE).
