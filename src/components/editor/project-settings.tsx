import type { SpritePreset, SpriteMode } from '@/lib/sprite-presets';
import type { ProjectMetadata } from '@/lib/sprite-project';

export const ProjectSettings = ({
  mode,
  metadata,
  preset,
  framesAdded,
  onModeChange,
  onMetadataChange,
}: {
  mode: SpriteMode;
  metadata: ProjectMetadata;
  preset: SpritePreset;
  framesAdded: number;
  onModeChange: (mode: SpriteMode) => void;
  onMetadataChange: (field: keyof ProjectMetadata, value: string) => void;
}) => {
  return (
    <>
      <div className="toolbar">
        <div>
          <p className="step">Create locally</p>
          <h2 id="workspace-title">Create a new pet</h2>
          <p className="section-copy">
            Set up your pet, then add the frames you need. Empty cells stay transparent and won’t
            block export.
          </p>
        </div>
      </div>
      <div className="project-form">
        <div className="mode-switch-field">
          <span>Sprite version</span>
          <div className="ui-segmented" aria-label="Sprite sheet version">
            {(['v1', 'v2'] as const).map((option) => (
              <button
                className={mode === option ? 'ui-segmented-button active' : 'ui-segmented-button'}
                key={option}
                onClick={() => onModeChange(option)}
                type="button"
              >
                {option.toUpperCase()}
                <span>{option === 'v1' ? '8 x 9' : '8 x 11'}</span>
              </button>
            ))}
          </div>
        </div>
        <label>
          <span>Pet ID</span>
          <input
            className="ui-control"
            value={metadata.id}
            onChange={(event) => onMetadataChange('id', event.target.value)}
          />
        </label>
        <label>
          <span>Display name</span>
          <input
            className="ui-control"
            value={metadata.displayName}
            onChange={(event) => onMetadataChange('displayName', event.target.value)}
          />
        </label>
        <label className="description-field">
          <span>Description</span>
          <input
            className="ui-control"
            value={metadata.description}
            onChange={(event) => onMetadataChange('description', event.target.value)}
          />
        </label>
      </div>
      <div className="stats" aria-label="Current sprite sheet specification">
        <span>
          <b>
            {preset.sheetWidth} × {preset.sheetHeight}
          </b>{' '}
          Output size
        </span>
        <span>
          <b>
            {framesAdded} / {preset.validFrameCount}
          </b>{' '}
          Frames added
        </span>
        <span>
          <b>{preset.unusedFrameCount}</b> Transparent-only cells
        </span>
      </div>
    </>
  );
};
