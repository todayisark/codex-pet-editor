import { afterEach, describe, expect, it, vi } from 'vitest';
import { composeSpritesheetCanvas } from './compose-spritesheet';
import { createProject, setProjectFrame } from './sprite-project';

const originalDocument = globalThis.document;
const originalCreateImageBitmap = globalThis.createImageBitmap;

afterEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: originalDocument,
  });
  Object.defineProperty(globalThis, 'createImageBitmap', {
    configurable: true,
    value: originalCreateImageBitmap,
  });
});

describe('sprite sheet composition', () => {
  it.each([
    ['v1', 1536, 1872],
    ['v2', 1536, 2288],
  ] as const)('creates the correct %s canvas', async (mode, width, height) => {
    const clearRect = vi.fn();
    const drawImage = vi.fn();
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => ({ clearRect, drawImage }),
    };
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: { createElement: () => canvas },
    });
    Object.defineProperty(globalThis, 'createImageBitmap', {
      configurable: true,
      value: vi.fn(async () => ({ width: 400, height: 200, close: vi.fn() })),
    });

    let project = createProject(mode, {
      id: 'my-pet',
      displayName: 'My Pet',
      description: '',
    });
    project = setProjectFrame(project, {
      id: 'frame',
      row: 0,
      column: 0,
      sourceName: 'frame.png',
      blob: new Blob(),
      placement: 'fit-bottom',
    });

    const result = await composeSpritesheetCanvas(project);
    expect(result.width).toBe(width);
    expect(result.height).toBe(height);
    expect(clearRect).toHaveBeenCalledWith(0, 0, width, height);
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 112, 192, 96);
  });
});
