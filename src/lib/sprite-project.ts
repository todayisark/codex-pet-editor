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
