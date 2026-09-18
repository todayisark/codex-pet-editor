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
  return url ? (
    <img
      className={frame?.placement}
      src={url}
      alt=""
      draggable={false}
      style={{ transform: frame?.flippedX ? 'scaleX(-1)' : undefined }}
    />
  ) : null;
};

export const FrameGrid = ({
  project,
  preset,
  selected,
  onSelect,
  onCopy,
  onPaste,
  onUpload,
  onDropFiles,
  onDropGifFrames,
  onMove,
  onFlip,
  onRemove,
}: {
  project: SpriteProject;
  preset: SpritePreset;
  selected: FramePosition;
  onSelect: (position: FramePosition) => void;
  onCopy: (position: FramePosition) => void;
  onPaste: (position: FramePosition) => void;
  onUpload: (position: FramePosition) => void;
  onDropFiles: (files: File[], position: FramePosition) => void;
  onDropGifFrames: (event: DragEvent<HTMLButtonElement>, position: FramePosition) => void;
  onMove: (from: FramePosition, to: FramePosition) => void;
  onFlip: (position: FramePosition) => void;
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
                    onClick={() => {
                      onSelect(position);
                    }}
                    onFocus={() => onSelect(position)}
                    onDoubleClick={() => onUpload(position)}
                    aria-label={`Row ${animation.row}, cell ${column + 1}${frame ? `: ${frame.sourceName}` : ': empty'}`}
                    aria-pressed={isSelected}
                    onKeyDown={(event) => {
                      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey)
                        return;
                      const key = event.key.toLowerCase();
                      if (key !== 'c' && key !== 'v') return;
                      event.preventDefault();
                      event.stopPropagation();
                      if (key === 'c') onCopy(position);
                      else onPaste(position);
                    }}
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
                    title={enabled ? undefined : 'Unused cell'}
                  >
                    <span>{column + 1}</span>
                    <FrameImage frame={frame} />
                    {enabled && !frame && <span className="cell-upload-hint">＋</span>}
                  </button>
                  {enabled && (
                    <span className="cell-hover-tip" aria-hidden="true">
                      Double-click to upload · Click to select
                    </span>
                  )}
                  {enabled && frame && (
                    <button
                      type="button"
                      className="cell-flip"
                      aria-label={`Flip ${frame.sourceName} horizontally`}
                      aria-pressed={Boolean(frame.flippedX)}
                      title="Flip horizontally"
                      onClick={() => onFlip(position)}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        aria-hidden="true"
                      >
                        <path d="M8 1v14M5.5 4 1.5 12h4V4ZM10.5 4l4 8h-4V4Z" />
                      </svg>
                    </button>
                  )}
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
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d="M3 3l6 6M9 3l-6 6" />
                      </svg>
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
