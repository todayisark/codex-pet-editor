import type { SpriteProject } from './sprite-project';
import { getSpritePreset } from './sprite-presets';

export type SpriteOutputFormat = 'png' | 'webp';

const canvasToBlob = (canvas: HTMLCanvasElement, type: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error(`Unable to encode ${type}.`))),
      type,
      1,
    );
  });
};

export const composeSpritesheetCanvas = async (
  project: SpriteProject,
): Promise<HTMLCanvasElement> => {
  const preset = getSpritePreset(project.mode);
  const canvas = document.createElement('canvas');
  canvas.width = preset.sheetWidth;
  canvas.height = preset.sheetHeight;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not available in this browser.');
  context.clearRect(0, 0, canvas.width, canvas.height);

  for (const frame of project.frames.values()) {
    const image = await createImageBitmap(frame.blob);
    if (frame.flippedX) {
      context.save();
      context.translate((2 * frame.column + 1) * preset.cellWidth, 0);
      context.scale(-1, 1);
    }
    try {
      const cellX = frame.column * preset.cellWidth;
      const cellY = frame.row * preset.cellHeight;
      if (frame.placement === 'preserve-cell') {
        context.drawImage(image, cellX, cellY, preset.cellWidth, preset.cellHeight);
        continue;
      }

      const scale = Math.min(1, 192 / image.width, 192 / image.height);
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const x = cellX + Math.floor((preset.cellWidth - width) / 2);
      const y = cellY + preset.cellHeight - height;
      context.drawImage(image, x, y, width, height);
    } finally {
      if (frame.flippedX) context.restore();
      image.close();
    }
  }
  return canvas;
};

export const composeSpritesheet = async (
  project: SpriteProject,
  format: SpriteOutputFormat,
): Promise<Blob> => {
  const canvas = await composeSpritesheetCanvas(project);
  return canvasToBlob(canvas, format === 'png' ? 'image/png' : 'image/webp');
};
