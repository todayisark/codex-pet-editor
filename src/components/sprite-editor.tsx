"use client";

import { useMemo, useState } from "react";
import { createProject } from "@/lib/sprite-project";
import { getSpritePreset, type SpriteMode } from "@/lib/sprite-presets";
import { validateProject } from "@/lib/validate-project";

export function SpriteEditor() {
  const [mode, setMode] = useState<SpriteMode>("v2");
  const preset = getSpritePreset(mode);
  const project = useMemo(
    () =>
      createProject(mode, {
        id: "my-pet",
        displayName: "My Pet",
        description: "",
      }),
    [mode],
  );
  const validation = validateProject(project);

  return (
    <section className="workspace" aria-labelledby="workspace-title">
      <div className="toolbar">
        <div>
          <p className="step">Create locally</p>
          <h2 id="workspace-title">Create a new pet</h2>
          <p className="section-copy">
            Choose a format, then add images to the frames you need. Empty
            frames stay transparent.
          </p>
        </div>
        <div className="mode-switch" aria-label="Sprite sheet version">
          {(["v1", "v2"] as const).map((candidate) => (
            <button
              className={mode === candidate ? "active" : ""}
              key={candidate}
              onClick={() => setMode(candidate)}
              type="button"
            >
              {candidate.toUpperCase()}
              <small>{candidate === "v1" ? "8 × 9" : "8 × 11"}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="stats" aria-label="Current sprite sheet specification">
        <span>
          <b>
            {preset.sheetWidth} × {preset.sheetHeight}
          </b>{" "}
          Output size
        </span>
        <span>
          <b>{preset.validFrameCount}</b> Available frames
        </span>
        <span>
          <b>{preset.unusedFrameCount}</b> Transparent cells
        </span>
      </div>

      <div className="editor-grid">
        <div className="sheet">
          {preset.animations.map((animation) => (
            <div className="sprite-row" key={animation.id}>
              <div className="row-label">
                <strong>{animation.label}</strong>
                <span>Row {animation.row}</span>
              </div>
              <div className="row-cells">
                {Array.from({ length: preset.columns }, (_, column) => {
                  const enabled = column < animation.frameCount;
                  return (
                    <div
                      className={enabled ? "cell enabled" : "cell unused"}
                      key={[animation.row, column].join("-")}
                    >
                      <span>{column + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <aside className="panel">
          <div className="status-dot" aria-hidden="true" />
          <p className="step">Project status</p>
          <h3>
            {validation.canExport
              ? "Ready to export"
              : `${validation.errors.length} ${validation.errors.length === 1 ? "error" : "errors"}`}
          </h3>
          <p>
            You currently have{" "}
            {
              validation.warnings.filter(
                (issue) => issue.code === "missing-frame",
              ).length
            }{" "}
            empty available frames. They will be exported as transparent cells
            and will not block you from continuing.
          </p>
          <p className="privacy">
            Image processing, project storage, and export all happen on this
            device.
          </p>
        </aside>
      </div>
    </section>
  );
}
