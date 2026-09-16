import { composeSpritesheet, type SpriteOutputFormat } from './compose-spritesheet';
import type { SpriteProject } from './sprite-project';
import { getSpritePreset } from './sprite-presets';

export const buildPetJson = (project: SpriteProject): string => {
  const preset = getSpritePreset(project.mode);
  const value: Record<string, string | number> = {
    id: project.metadata.id,
    displayName: project.metadata.displayName,
    description: project.metadata.description,
    spritesheetPath: 'spritesheet.webp',
    kind: 'pet',
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
