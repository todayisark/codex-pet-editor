"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { downloadPetJson, downloadSpritesheet } from "@/lib/export-project";
import {
  createProject, frameKey, removeProjectFrame, setProjectFrame,
  type SpriteFrame, type SpriteProject,
} from "@/lib/sprite-project";
import { getSpritePreset, isValidFrame, type SpriteMode } from "@/lib/sprite-presets";
import { validateProject } from "@/lib/validate-project";

type FramePosition = Readonly<{ row: number; column: number }>;

function useObjectUrl(blob?: Blob): string | undefined {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (!blob) { setUrl(undefined); return; }
    const nextUrl = URL.createObjectURL(blob);
    setUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [blob]);
  return url;
}

function FrameImage({ frame }: { frame?: SpriteFrame }) {
  const url = useObjectUrl(frame?.blob);
  return url ? <img className={frame?.placement} src={url} alt="" draggable={false} /> : null;
}

function AnimationPreview({ project, row, onRowChange }: {
  project: SpriteProject; row: number; onRowChange: (row: number) => void;
}) {
  const preset = getSpritePreset(project.mode);
  const animation = preset.animations[row] ?? preset.animations[0];
  const [frameIndex, setFrameIndex] = useState(0);
  const [directionIndex, setDirectionIndex] = useState(0);
  const isDirection = animation.kind === "direction";
  const directionRow = directionIndex < 8 ? 9 : 10;
  const directionColumn = directionIndex % 8;
  const frame = project.frames.get(
    frameKey(isDirection ? directionRow : animation.row, isDirection ? directionColumn : frameIndex),
  );
  const url = useObjectUrl(frame?.blob);

  useEffect(() => setFrameIndex(0), [animation.row]);
  useEffect(() => {
    if (animation.kind !== "animation") return;
    const duration = animation.durationsMs?.[frameIndex] ?? 150;
    const timer = window.setTimeout(
      () => setFrameIndex((value) => (value + 1) % animation.frameCount),
      duration,
    );
    return () => window.clearTimeout(timer);
  }, [animation, frameIndex]);

  const angle = directionIndex * 22.5;

  function updatePointerDirection(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDirection) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - (bounds.left + bounds.width / 2);
    const dy = event.clientY - (bounds.top + bounds.height / 2);
    const degrees = (Math.atan2(dx, -dy) * 180) / Math.PI;
    setDirectionIndex(Math.round(((degrees + 360) % 360) / 22.5) % 16);
  }

  return (
    <div className="preview-card">
      <div className="preview-heading">
        <span className="step">Preview</span>
        <select value={animation.row} onChange={(event) => onRowChange(Number(event.target.value))} aria-label="Animation to preview">
          {preset.animations.filter((item) => item.row !== 10).map((item) => (
            <option value={item.row} key={item.id}>
              {item.kind === "direction" ? "Pointer direction" : item.label}
            </option>
          ))}
        </select>
      </div>
      <div
        className={isDirection ? "preview-stage direction" : "preview-stage"}
        onPointerMove={updatePointerDirection}
      >
        {url ? <img className={frame?.placement} src={url} alt={animation.label + " preview"} /> : <span>Transparent frame</span>}
      </div>
      {isDirection ? (
        <span className="preview-count">Move the pointer here · {angle}°</span>
      ) : (
        <span className="preview-count">Frame {frameIndex + 1} of {animation.frameCount}</span>
      )}
    </div>
  );
}

export function SpriteEditor() {
  const [project, setProject] = useState(() => createProject("v2", {
    id: "my-pet", displayName: "My Pet", description: "",
  }));
  const [selected, setSelected] = useState<FramePosition>({ row: 0, column: 0 });
  const [previewRow, setPreviewRow] = useState(0);
  const [message, setMessage] = useState("Select a frame or drop images into a row.");
  const [exporting, setExporting] = useState<string>();
  const frameInput = useRef<HTMLInputElement>(null);
  const uploadPosition = useRef<FramePosition>({ row: 0, column: 0 });
  const preset = getSpritePreset(project.mode);
  const validation = useMemo(() => validateProject(project), [project]);
  const emptyFrames = validation.warnings.filter((issue) => issue.code === "missing-frame").length;

  function changeMode(mode: SpriteMode) {
    const directionalFrames = Array.from(project.frames.values()).filter((frame) => frame.row >= 9).length;
    if (
      project.mode === "v2" &&
      mode === "v1" &&
      directionalFrames > 0 &&
      !window.confirm("Switching to v1 will remove " + directionalFrames + " directional frame" + (directionalFrames === 1 ? "." : "s.") + " Continue?")
    ) return;
    setProject((current) => {
      const frames = new Map(Array.from(current.frames.entries()).filter(([, frame]) =>
        isValidFrame(mode, frame.row, frame.column),
      ));
      return { ...current, mode, frames };
    });
    setSelected({ row: 0, column: 0 });
    setPreviewRow(0);
    trackEvent("select_sprite_version", { sprite_version: mode });
    setMessage(mode === "v2" ? "V2 adds two directional pose rows." : "V1 uses the first nine animation rows.");
  }

  function updateMetadata(field: "id" | "displayName" | "description", value: string) {
    setProject((current) => ({ ...current, metadata: { ...current.metadata, [field]: value } }));
  }

  function addFiles(files: File[], start: FramePosition) {
    const rowDefinition = preset.animations[start.row];
    const images = files
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, Math.max(0, (rowDefinition?.frameCount ?? 0) - start.column));
    if (!images.length) { setMessage("Choose a browser-supported image."); return; }
    setProject((current) => {
      const currentRow = getSpritePreset(current.mode).animations[start.row];
      if (!currentRow) return current;
      let next = current;
      for (let index = 0; index < images.length; index += 1) {
        const column = start.column + index;
        if (column >= currentRow.frameCount) break;
        const file = images[index];
        next = setProjectFrame(next, {
          id: crypto.randomUUID(), row: start.row, column, sourceName: file.name,
          blob: file, placement: "fit-bottom",
        });
      }
      return next;
    });
    trackEvent("import_frames", {
      sprite_version: project.mode,
      import_method: images.length === 1 ? "single" : "batch",
      frame_count: images.length,
      row_index: start.row,
    });
    setMessage("Added " + images.length + " image" + (images.length === 1 ? "." : "s."));
  }

  function uploadTo(position: FramePosition) {
    uploadPosition.current = position;
    setSelected(position);
    frameInput.current?.click();
  }

  function clearAllFrames() {
    if (!project.frames.size) return;
    setProject((current) => ({ ...current, frames: new Map() }));
    setMessage("All images cleared. Every cell will export as transparent.");
  }

  async function exportSheet(format: "png" | "webp") {
    if (!validation.canExport) return;
    setExporting(format);
    try {
      await downloadSpritesheet(project, format);
      trackEvent("export_sprite_sheet", {
        sprite_version: project.mode,
        file_format: format,
        frame_count: project.frames.size,
      });
      setMessage(format.toUpperCase() + " exported locally.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setExporting(undefined);
    }
  }

  function exportJson() {
    downloadPetJson(project);
    trackEvent("export_pet_json", {
      sprite_version: project.mode,
      frame_count: project.frames.size,
    });
  }

  return (
    <section className="workspace" aria-labelledby="workspace-title">
      <div className="toolbar">
        <div>
          <p className="step">Create locally</p>
          <h2 id="workspace-title">Create a new pet</h2>
          <p className="section-copy">Add only the frames you need. Empty cells stay transparent and do not block export.</p>
        </div>
        <div className="mode-switch" aria-label="Sprite sheet version">
          {(["v1", "v2"] as const).map((mode) => (
            <button className={project.mode === mode ? "active" : ""} key={mode} onClick={() => changeMode(mode)} type="button">
              {mode.toUpperCase()}<small>{mode === "v1" ? "8 × 9" : "8 × 11"}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="project-form">
        <label><span>Pet ID</span><input value={project.metadata.id} onChange={(event) => updateMetadata("id", event.target.value)} /></label>
        <label><span>Display name</span><input value={project.metadata.displayName} onChange={(event) => updateMetadata("displayName", event.target.value)} /></label>
        <label className="description-field"><span>Description</span><input value={project.metadata.description} onChange={(event) => updateMetadata("description", event.target.value)} /></label>
      </div>

      <div className="stats" aria-label="Current sprite sheet specification">
        <span><b>{preset.sheetWidth} × {preset.sheetHeight}</b> Output size</span>
        <span><b>{project.frames.size} / {preset.validFrameCount}</b> Frames added</span>
        <span><b>{preset.unusedFrameCount}</b> Transparent-only cells</span>
      </div>

      <div className="frame-toolbar">
        <div className="frame-actions">
          <button type="button" disabled={!project.frames.size} onClick={clearAllFrames}>Clear all</button>
          <input ref={frameInput} hidden type="file" accept="image/*" onChange={(event) => {
            addFiles(Array.from(event.target.files ?? []), uploadPosition.current); event.target.value = "";
          }} />
        </div>
      </div>

      <p className="editor-message" aria-live="polite">{message}</p>

      <div className="editor-grid">
        <div className="sheet">
          {preset.animations.map((animation) => (
            <div className="sprite-row" key={animation.id} onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
              event.preventDefault(); addFiles(Array.from(event.dataTransfer.files), { row: animation.row, column: 0 });
            }}>
              <div className="row-label"><strong>{animation.label}</strong><span>Row {animation.row}</span></div>
              <div className="row-cells">
                {Array.from({ length: preset.columns }, (_, column) => {
                  const enabled = column < animation.frameCount;
                  const frame = project.frames.get(frameKey(animation.row, column));
                  const isSelected = selected.row === animation.row && selected.column === column;
                  return (
                    <div className="cell-wrap" key={[animation.row, column].join("-")}>
                    <button type="button" disabled={!enabled}
                      className={["cell", enabled ? "enabled" : "unused", frame ? "filled" : "", isSelected ? "selected" : ""].filter(Boolean).join(" ")}
                      onClick={() => uploadTo({ row: animation.row, column })}
                      onDragOver={(event) => enabled && event.preventDefault()}
                      onDrop={(event) => {
                        if (!enabled) return; event.preventDefault(); event.stopPropagation();
                        addFiles(Array.from(event.dataTransfer.files), { row: animation.row, column });
                      }}
                      title={enabled ? (frame ? frame.sourceName + " · Click to replace" : "Click to upload image") : "Unused cell"}>
                      <span>{column + 1}</span><FrameImage frame={frame} />
                      {enabled && !frame && <span className="cell-upload-hint">＋</span>}
                    </button>
                    {enabled && frame && <button type="button" className="cell-remove" aria-label={`Delete ${frame.sourceName}`} title="Delete image" onClick={(event) => {
                      event.stopPropagation();
                      setProject((current) => removeProjectFrame(current, animation.row, column));
                      setMessage("Image removed. The cell will export as transparent.");
                    }}>×</button>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="editor-sidebar">
          <AnimationPreview
            project={project}
            row={previewRow}
            onRowChange={(row) => {
              setPreviewRow(row);
              trackEvent("preview_animation", {
                sprite_version: project.mode,
                row_index: row,
              });
            }}
          />
          <aside className="panel">
            <div className={validation.canExport ? "status-dot" : "status-dot error"} aria-hidden="true" />
            <p className="step">Project status</p>
            <h3>{validation.canExport ? "Ready to export" : validation.errors.length + " errors"}</h3>
            <p>{emptyFrames} empty available frames will export as transparent cells.</p>
            {validation.errors.map((issue) => <p className="error-message" key={issue.code}>{issue.message}</p>)}
          </aside>
          <aside className="export-panel">
            <p className="step">Export locally</p>
            <button disabled={!validation.canExport || Boolean(exporting)} onClick={() => exportSheet("webp")}>{exporting === "webp" ? "Exporting…" : "Download WebP"}</button>
            <button disabled={!validation.canExport || Boolean(exporting)} onClick={() => exportSheet("png")}>{exporting === "png" ? "Exporting…" : "Download PNG"}</button>
            <button disabled={!validation.canExport} onClick={exportJson}>Download pet.json</button>
            <p>Files are generated in this browser and never uploaded.</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
