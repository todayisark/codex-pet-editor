import { describe, expect, it } from 'vitest';
import { buildPetJson } from './export-project';
import { createProject } from './sprite-project';

describe('pet JSON export', () => {
  it('does not mark v1 projects as v2', () => {
    const json = JSON.parse(
      buildPetJson(
        createProject('v1', {
          id: 'my-pet',
          displayName: 'My Pet',
          description: '',
        }),
      ),
    );
    expect(json.spriteVersionNumber).toBeUndefined();
  });

  it('marks v2 projects with sprite version 2', () => {
    const json = JSON.parse(
      buildPetJson(
        createProject('v2', {
          id: 'my-pet',
          displayName: 'My Pet',
          description: '',
        }),
      ),
    );
    expect(json.spriteVersionNumber).toBe(2);
  });

  it('includes package version and update source metadata', () => {
    const json = JSON.parse(
      buildPetJson(
        createProject('v2', {
          id: 'my-pet',
          displayName: 'My Pet',
          description: '',
        }),
      ),
    );
    expect(json.version).toBe('1.0.0');
    expect(json.updateUrl).toBe('https://github.com/todayisark/codex-pet-editor');
  });
});
