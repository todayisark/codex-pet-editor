import { composeSpritesheet, type SpriteOutputFormat } from './compose-spritesheet';
import JSZip from 'jszip';
import type { SpriteProject } from './sprite-project';
import { getSpritePreset } from './sprite-presets';

const PET_PACKAGE_VERSION = '1.0.0';
const PET_UPDATE_URL = 'https://github.com/todayisark/codex-pet-editor';

export const buildPetJson = (project: SpriteProject): string => {
  const preset = getSpritePreset(project.mode);
  const value: Record<string, string | number> = {
    id: project.metadata.id,
    displayName: project.metadata.displayName,
    description: project.metadata.description,
    spritesheetPath: 'spritesheet.webp',
    kind: 'pet',
    version: PET_PACKAGE_VERSION,
    updateUrl: PET_UPDATE_URL,
  };
  if (preset.spriteVersionNumber) {
    value.spriteVersionNumber = preset.spriteVersionNumber;
  }
  return `${JSON.stringify(value, null, 2)}\n`;
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
};

export const downloadSpritesheet = async (
  project: SpriteProject,
  format: SpriteOutputFormat,
): Promise<void> => {
  const blob = await composeSpritesheet(project, format);
  downloadBlob(blob, `spritesheet.${format}`);
};

export const downloadPetJson = (project: SpriteProject): void => {
  downloadBlob(new Blob([buildPetJson(project)], { type: 'application/json' }), 'pet.json');
};

export const buildPetReadme = (
  project: SpriteProject,
  format: SpriteOutputFormat,
): string => `# ${project.metadata.displayName || project.metadata.id || 'Codex Pet'}

This folder contains the exported Codex Pet files:

- \`pet.json\` — pet metadata and configuration.
- \`spritesheet.${format}\` — the animated sprite sheet.

## Install

1. Extract this ZIP file.
2. Move the extracted folder to \`~/.codex/pets/${project.metadata.id || '<pet-id>'}/\`.
3. Open Codex Desktop and go to **Settings → Pets**.
4. Refresh the pet list and select your pet.

Keep \`pet.json\` and \`spritesheet.${format}\` together in the same folder.
`;

export const downloadPetZip = async (
  project: SpriteProject,
  format: SpriteOutputFormat,
): Promise<void> => {
  const zip = new JSZip();
  zip.file(`spritesheet.${format}`, await composeSpritesheet(project, format));
  const json = buildPetJson(project).replace('spritesheet.webp', `spritesheet.${format}`);
  zip.file('pet.json', json);
  zip.file('README.md', buildPetReadme(project, format));
  downloadBlob(await zip.generateAsync({ type: 'blob' }), `${project.metadata.id || 'pet'}.zip`);
};
