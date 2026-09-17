'use client';

import { useEffect, useMemo, useState } from 'react';
import { frameKey, type SpriteFrame, type SpriteProject } from '@/lib/sprite-project';
import { getSpritePreset } from '@/lib/sprite-presets';

const useObjectUrl = (blob?: Blob): string | undefined => {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : undefined), [blob]);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  return url;
};

export const AnimationPreview = ({
  project,
  row,
  onRowChange,
  onClearAll,
}: {
  project: SpriteProject;
  row: number;
  onRowChange: (row: number) => void;
  onClearAll: () => void;
}) => {
  const preset = getSpritePreset(project.mode);
  const animation = preset.animations[row] ?? preset.animations[0];
  const [frameCursor, setFrameCursor] = useState({
    row: animation.row,
    index: 0,
  });
  const frameIndex = frameCursor.row === animation.row ? frameCursor.index : 0;
  const [directionIndex, setDirectionIndex] = useState(0);
  const isDirection = animation.kind === 'direction';
  const directionRow = directionIndex < 8 ? 9 : 10;
  const frame = project.frames.get(
    frameKey(
      isDirection ? directionRow : animation.row,
      isDirection ? directionIndex % 8 : frameIndex,
    ),
  );
  const url = useObjectUrl(frame?.blob);

  useEffect(() => {
    if (animation.kind !== 'animation') return;
    const timer = window.setTimeout(
      () =>
        setFrameCursor({
          row: animation.row,
          index: (frameIndex + 1) % animation.frameCount,
        }),
      animation.durationsMs?.[frameIndex] ?? 150,
    );
    return () => window.clearTimeout(timer);
  }, [animation, frameIndex]);

  const updatePointerDirection = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDirection) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - (bounds.left + bounds.width / 2);
    const dy = event.clientY - (bounds.top + bounds.height / 2);
    const degrees = (Math.atan2(dx, -dy) * 180) / Math.PI;
    setDirectionIndex(Math.round(((degrees + 360) % 360) / 22.5) % 16);
  };

  return (
    <>
      <button
        className="ui-button clear-all-button"
        type="button"
        disabled={!project.frames.size}
        onClick={onClearAll}
      >
        Clear all
      </button>
      <div className="ui-panel ui-panel--padded preview-card">
        <div className="preview-heading">
          <span className="step">Preview</span>
          <select
            className="ui-control"
            value={animation.row}
            onChange={(event) => onRowChange(Number(event.target.value))}
            aria-label="Animation to preview"
          >
            {preset.animations
              .filter((item) => item.row !== 10)
              .map((item) => (
                <option value={item.row} key={item.id}>
                  {item.kind === 'direction' ? 'Pointer direction' : item.label}
                </option>
              ))}
          </select>
        </div>
        <div
          className={isDirection ? 'preview-stage direction' : 'preview-stage'}
          onPointerMove={updatePointerDirection}
        >
          {url ? (
            <img
              className={(frame as SpriteFrame | undefined)?.placement}
              src={url}
              style={{ transform: frame?.flippedX ? 'scaleX(-1)' : undefined }}
              alt={animation.label + ' preview'}
            />
          ) : (
            <span>Transparent frame</span>
          )}
        </div>
        <span className="preview-count">
          {isDirection
            ? `Move the pointer here · ${directionIndex * 22.5}°`
            : `Frame ${frameIndex + 1} of ${animation.frameCount}`}
        </span>
      </div>
    </>
  );
};
