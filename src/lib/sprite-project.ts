import { getSpritePreset, type SpriteMode } from "./sprite-presets";

export type ProjectMetadata = Readonly<{
  id: string;
  displayName: string;
  description: string;
}>;

export type SpriteFrame = Readonly<{
  id: string;
  row: number;
  column: number;
  sourceName: string;
  blob: Blob;
  placement: "fit-bottom" | "preserve-cell";
}>;

export type SpriteProject = Readonly<{
  schemaVersion: 1;
  mode: SpriteMode;
  metadata: ProjectMetadata;
  frames: ReadonlyMap<string, SpriteFrame>;
}>;

export function frameKey(row: number, column: number): string {
  return `${row}:${column}`;
}

export function createProject(
  mode: SpriteMode,
  metadata: ProjectMetadata,
): SpriteProject {
  getSpritePreset(mode);
  return { schemaVersion: 1, mode, metadata, frames: new Map() };
}

export function setProjectFrame(
  project: SpriteProject,
  frame: SpriteFrame,
): SpriteProject {
  const frames = new Map(project.frames);
  frames.set(frameKey(frame.row, frame.column), frame);
  return { ...project, frames };
}

export function removeProjectFrame(
  project: SpriteProject,
  row: number,
  column: number,
): SpriteProject {
  const frames = new Map(project.frames);
  frames.delete(frameKey(row, column));
  return { ...project, frames };
}

export function moveProjectFrame(
  project: SpriteProject,
  from: Readonly<{ row: number; column: number }>,
  to: Readonly<{ row: number; column: number }>,
): SpriteProject {
  const fromKey = frameKey(from.row, from.column);
  const toKey = frameKey(to.row, to.column);
  const source = project.frames.get(fromKey);
  if (!source) return project;

  const target = project.frames.get(toKey);
  const frames = new Map(project.frames);
  frames.set(toKey, { ...source, row: to.row, column: to.column });
  if (target) {
    frames.set(fromKey, { ...target, row: from.row, column: from.column });
  } else {
    frames.delete(fromKey);
  }
  return { ...project, frames };
}
