'use client';

import { frameKey, type SpriteProject } from '@/lib/sprite-project';
import type { SpritePreset } from '@/lib/sprite-presets';
import { useEffect, useMemo, useState } from 'react';
import type { DragEvent } from 'react';
import type { FramePosition } from './types';

const frameDragType = 'application/x-pet-editor-frame';

const FrameImage = ({
  frame,
}: {
  frame?: NonNullable<ReturnType<SpriteProject['frames']['get']>>;
}) => {
  const url = useMemo(() => (frame ? URL.createObjectURL(frame.blob) : undefined), [frame]);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  return url ? <img className={frame?.placement} src={url} alt="" draggable={false} /> : null;
};

export const FrameGrid = ({
  project,
  preset,
  selected,
  onUpload,
  onDropFiles,
  onDropGifFrames,
  onMove,
  onRemove,
}: {
  project: SpriteProject;
  preset: SpritePreset;
  selected: FramePosition;
  onUpload: (position: FramePosition) => void;
  onDropFiles: (files: File[], position: FramePosition) => void;
  onDropGifFrames: (event: DragEvent<HTMLButtonElement>, position: FramePosition) => void;
  onMove: (from: FramePosition, to: FramePosition) => void;
  onRemove: (position: FramePosition) => void;
}) => {
  const [, setDraggedPosition] = useState<FramePosition | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<FramePosition | null>(null);

  return (
    <div className="sheet">
      {preset.animations.map((animation) => (
        <div
          className="sprite-row"
          key={animation.id}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            onDropFiles(Array.from(event.dataTransfer.files), {
              row: animation.row,
              column: 0,
            });
          }}
        >
          <div className="row-label">
            <strong>{animation.label}</strong>
            <span>Row {animation.row}</span>
          </div>
          <div className="row-cells">
            {Array.from({ length: preset.columns }, (_, column) => {
              const position = { row: animation.row, column };
              const enabled = column < animation.frameCount;
              const frame = project.frames.get(frameKey(animation.row, column));
              const isSelected = selected.row === animation.row && selected.column === column;
              return (
                <div className="cell-wrap" key={`${animation.row}-${column}`}>
                  <button
                    type="button"
                    disabled={!enabled}
                    className={[
                      'cell',
                      enabled ? 'enabled' : 'unused',
                      frame ? 'filled' : '',
                      isSelected ? 'selected' : '',
                      dragOverPosition?.row === animation.row && dragOverPosition.column === column
                        ? 'drag-over'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => onUpload(position)}
                    draggable={enabled && Boolean(frame)}
                    onDragStart={(event) => {
                      if (!frame) return;
                      event.dataTransfer.setData(frameDragType, JSON.stringify(position));
                      event.dataTransfer.effectAllowed = 'move';
                      setDraggedPosition(position);
                    }}
                    onDragEnd={() => {
                      setDraggedPosition(null);
                      setDragOverPosition(null);
                    }}
                    onDragOver={(event) => {
                      if (!enabled) return;
                      if (event.dataTransfer.types.includes(frameDragType)) {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = 'move';
                        setDragOverPosition(position);
                        return;
                      }
                      event.preventDefault();
                    }}
                    onDragLeave={() => {
                      if (
                        dragOverPosition?.row === animation.row &&
                        dragOverPosition.column === column
                      ) {
                        setDragOverPosition(null);
                      }
                    }}
                    onDrop={(event) => {
                      if (!enabled) return;
                      const draggedFrame = event.dataTransfer.getData(frameDragType);
                      if (draggedFrame) {
                        event.preventDefault();
                        event.stopPropagation();
                        const from = JSON.parse(draggedFrame) as FramePosition;
                        if (from.row !== position.row || from.column !== position.column) {
                          onMove(from, position);
                        }
                        setDraggedPosition(null);
                        setDragOverPosition(null);
                        return;
                      }
                      if (event.dataTransfer.types.includes('application/x-pet-gif-frames')) {
                        onDropGifFrames(event, position);
                        return;
                      }
                      event.preventDefault();
                      event.stopPropagation();
                      onDropFiles(Array.from(event.dataTransfer.files), position);
                    }}
                    title={
                      enabled
                        ? frame
                          ? `${frame.sourceName} · Click to replace`
                          : 'Click to upload image'
                        : 'Unused cell'
                    }
                  >
                    <span>{column + 1}</span>
                    <FrameImage frame={frame} />
                    {enabled && !frame && <span className="cell-upload-hint">＋</span>}
                  </button>
                  {enabled && frame && (
                    <button
                      type="button"
                      className="cell-remove"
                      aria-label={`Delete ${frame.sourceName}`}
                      title="Delete image"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemove(position);
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
