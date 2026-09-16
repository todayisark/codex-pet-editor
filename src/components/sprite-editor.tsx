'use client';

import { useMemo, useRef, useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import { downloadPetZip } from '@/lib/export-project';
import { createProject, removeProjectFrame, setProjectFrame } from '@/lib/sprite-project';
import { getSpritePreset, isValidFrame, type SpriteMode } from '@/lib/sprite-presets';
import { validateProject } from '@/lib/validate-project';
import { AnimationPreview } from '@/components/editor/animation-preview';
import { FrameGrid } from '@/components/editor/frame-grid';
import type { FramePosition } from '@/components/editor/types';
import { getGifDropFiles, GifFrameTools } from '@/components/editor/gif-frame-tools';
import { ProjectSettings } from '@/components/editor/project-settings';

export const SpriteEditor = () => {
  const [project, setProject] = useState(() =>
    createProject('v2', {
      id: 'my-pet',
      displayName: 'My Pet',
      description: '',
    }),
  );
  const [selected, setSelected] = useState<FramePosition>({
    row: 0,
    column: 0,
  });
  const [previewRow, setPreviewRow] = useState(0);
  const [message, setMessage] = useState('Select a frame or drop images into a row.');
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'webp' | 'png'>('webp');
  const frameInput = useRef<HTMLInputElement>(null);
  const uploadPosition = useRef<FramePosition>({ row: 0, column: 0 });
  const preset = getSpritePreset(project.mode);
  const validation = useMemo(() => validateProject(project), [project]);
  const emptyFrames = validation.warnings.filter((issue) => issue.code === 'missing-frame').length;

  const changeMode = (mode: SpriteMode) => {
    const directionalFrames = Array.from(project.frames.values()).filter(
      (frame) => frame.row >= 9,
    ).length;
    if (
      project.mode === 'v2' &&
      mode === 'v1' &&
      directionalFrames > 0 &&
      !window.confirm(
        'Switching to v1 will remove ' +
          directionalFrames +
          ' directional frame' +
          (directionalFrames === 1 ? '.' : 's.') +
          ' Continue?',
      )
    )
      return;
    setProject((current) => {
      const frames = new Map(
        Array.from(current.frames.entries()).filter(([, frame]) =>
          isValidFrame(mode, frame.row, frame.column),
        ),
      );
      return { ...current, mode, frames };
    });
    setSelected({ row: 0, column: 0 });
    setPreviewRow(0);
    trackEvent('select_sprite_version', { sprite_version: mode });
    setMessage(
      mode === 'v2'
        ? 'V2 adds two directional pose rows.'
        : 'V1 uses the first nine animation rows.',
    );
  };

  const updateMetadata = (field: 'id' | 'displayName' | 'description', value: string) => {
    setProject((current) => ({
      ...current,
      metadata: { ...current.metadata, [field]: value },
    }));
  };

  const addFiles = (files: File[], start: FramePosition) => {
    const rowDefinition = preset.animations[start.row];
    const images = files
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, Math.max(0, (rowDefinition?.frameCount ?? 0) - start.column));
    if (!images.length) {
      setMessage('Choose a browser-supported image.');
      return;
    }
    setProject((current) => {
      const currentRow = getSpritePreset(current.mode).animations[start.row];
      if (!currentRow) return current;
      let next = current;
      for (let index = 0; index < images.length; index += 1) {
        const column = start.column + index;
        if (column >= currentRow.frameCount) break;
        const file = images[index];
        next = setProjectFrame(next, {
          id: crypto.randomUUID(),
          row: start.row,
          column,
          sourceName: file.name,
          blob: file,
          placement: 'fit-bottom',
        });
      }
      return next;
    });
    trackEvent('import_frames', {
      sprite_version: project.mode,
      import_method: images.length === 1 ? 'single' : 'batch',
      frame_count: images.length,
      row_index: start.row,
    });
    setMessage('Added ' + images.length + ' image' + (images.length === 1 ? '.' : 's.'));
  };

  const uploadTo = (position: FramePosition) => {
    uploadPosition.current = position;
    setSelected(position);
    frameInput.current?.click();
  };

  const clearAllFrames = () => {
    if (!project.frames.size) return;
    setProject((current) => ({ ...current, frames: new Map() }));
    setMessage('All images cleared. Every cell will export as transparent.');
  };

  const dropGifFrames = (event: React.DragEvent<HTMLButtonElement>, start: FramePosition) => {
    const files = getGifDropFiles(event.dataTransfer);
    if (!files.length) return;
    event.preventDefault();
    event.stopPropagation();
    addFiles(files, start);
  };

  const exportZip = async () => {
    if (!validation.canExport) return;
    setExporting(true);
    try {
      await downloadPetZip(project, exportFormat);
      trackEvent('export_sprite_sheet', {
        sprite_version: project.mode,
        file_format: exportFormat,
        frame_count: project.frames.size,
      });
      setMessage('ZIP exported locally.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Export failed.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="workspace" aria-labelledby="workspace-title">
      <ProjectSettings
        mode={project.mode}
        metadata={project.metadata}
        preset={preset}
        framesAdded={project.frames.size}
        onModeChange={changeMode}
        onMetadataChange={updateMetadata}
      />

      <GifFrameTools onConverted={setMessage} />

      <p className="editor-message" aria-live="polite">
        {message}
      </p>

      <div className="editor-grid">
        <FrameGrid
          project={project}
          preset={preset}
          selected={selected}
          onUpload={uploadTo}
          onDropFiles={addFiles}
          onDropGifFrames={dropGifFrames}
          onRemove={(position) => {
            setProject((current) => removeProjectFrame(current, position.row, position.column));
            setMessage('Image removed. The cell will export as transparent.');
          }}
        />

        <div className="editor-sidebar">
          <AnimationPreview
            project={project}
            row={previewRow}
            onClearAll={clearAllFrames}
            onRowChange={(row) => {
              setPreviewRow(row);
              trackEvent('preview_animation', {
                sprite_version: project.mode,
                row_index: row,
              });
            }}
          />
          <aside className="ui-panel ui-panel--padded panel">
            <div
              className={validation.canExport ? 'status-dot' : 'status-dot error'}
              aria-hidden="true"
            />
            <p className="step">Project status</p>
            <h3>
              {validation.canExport ? 'Ready to export' : validation.errors.length + ' errors'}
            </h3>
            <p>{emptyFrames} empty available frames will export as transparent cells.</p>
            {validation.errors.map((issue) => (
              <p className="error-message" key={issue.code}>
                {issue.message}
              </p>
            ))}
          </aside>
          <aside className="ui-panel ui-panel--padded export-panel">
            <p className="step">Export locally</p>
            <label className="export-format-label" htmlFor="export-format">
              Image format
            </label>
            <select
              className="ui-control"
              id="export-format"
              value={exportFormat}
              onChange={(event) => setExportFormat(event.target.value as 'webp' | 'png')}
              aria-label="Spritesheet format"
            >
              <option value="webp">WebP</option>
              <option value="png">PNG</option>
            </select>
            <button
              className="ui-button ui-button--primary"
              disabled={!validation.canExport || exporting}
              onClick={exportZip}
            >
              {exporting ? 'Preparing ZIP…' : 'Download ZIP'}
            </button>
            <p>Files are generated in this browser and never uploaded.</p>
          </aside>
        </div>
      </div>
    </section>
  );
};
