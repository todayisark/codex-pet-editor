export type SpriteMode = "v1" | "v2";

export type AnimationDefinition = Readonly<{
  row: number;
  id: string;
  label: string;
  frameCount: number;
  durationsMs?: readonly number[];
  kind: "animation" | "direction";
}>;

export type SpritePreset = Readonly<{
  mode: SpriteMode;
  columns: 8;
  rows: 9 | 11;
  cellWidth: 192;
  cellHeight: 208;
  sheetWidth: 1536;
  sheetHeight: 1872 | 2288;
  validFrameCount: 57 | 73;
  unusedFrameCount: 15;
  spriteVersionNumber?: 2;
  animations: readonly AnimationDefinition[];
}>;

const COMMON_ANIMATIONS: readonly AnimationDefinition[] = [
  {
    row: 0,
    id: "idle",
    label: "Idle",
    frameCount: 6,
    durationsMs: [280, 110, 110, 140, 140, 320],
    kind: "animation",
  },
  {
    row: 1,
    id: "running-right",
    label: "Run right",
    frameCount: 8,
    durationsMs: [120, 120, 120, 120, 120, 120, 120, 220],
    kind: "animation",
  },
  {
    row: 2,
    id: "running-left",
    label: "Run left",
    frameCount: 8,
    durationsMs: [120, 120, 120, 120, 120, 120, 120, 220],
    kind: "animation",
  },
  {
    row: 3,
    id: "waving",
    label: "Wave",
    frameCount: 4,
    durationsMs: [140, 140, 140, 280],
    kind: "animation",
  },
  {
    row: 4,
    id: "jumping",
    label: "Jump",
    frameCount: 5,
    durationsMs: [140, 140, 140, 140, 280],
    kind: "animation",
  },
  {
    row: 5,
    id: "failed",
    label: "Failed",
    frameCount: 8,
    durationsMs: [140, 140, 140, 140, 140, 140, 140, 240],
    kind: "animation",
  },
  {
    row: 6,
    id: "waiting",
    label: "Waiting",
    frameCount: 6,
    durationsMs: [150, 150, 150, 150, 150, 260],
    kind: "animation",
  },
  {
    row: 7,
    id: "running",
    label: "Working",
    frameCount: 6,
    durationsMs: [120, 120, 120, 120, 120, 220],
    kind: "animation",
  },
  {
    row: 8,
    id: "review",
    label: "Review",
    frameCount: 6,
    durationsMs: [150, 150, 150, 150, 150, 280],
    kind: "animation",
  },
];

const DIRECTIONS: readonly AnimationDefinition[] = [
  {
    row: 9,
    id: "look-a",
    label: "Look 0°–157.5°",
    frameCount: 8,
    kind: "direction",
  },
  {
    row: 10,
    id: "look-b",
    label: "Look 180°–337.5°",
    frameCount: 8,
    kind: "direction",
  },
];

const PRESETS: Readonly<Record<SpriteMode, SpritePreset>> = {
  v1: {
    mode: "v1",
    columns: 8,
    rows: 9,
    cellWidth: 192,
    cellHeight: 208,
    sheetWidth: 1536,
    sheetHeight: 1872,
    validFrameCount: 57,
    unusedFrameCount: 15,
    animations: COMMON_ANIMATIONS,
  },
  v2: {
    mode: "v2",
    columns: 8,
    rows: 11,
    cellWidth: 192,
    cellHeight: 208,
    sheetWidth: 1536,
    sheetHeight: 2288,
    validFrameCount: 73,
    unusedFrameCount: 15,
    spriteVersionNumber: 2,
    animations: [...COMMON_ANIMATIONS, ...DIRECTIONS],
  },
};

export function getSpritePreset(mode: SpriteMode): SpritePreset {
  return PRESETS[mode];
}

export function isValidFrame(
  mode: SpriteMode,
  row: number,
  column: number,
): boolean {
  const animation = getSpritePreset(mode).animations[row];
  return Boolean(animation && column >= 0 && column < animation.frameCount);
}
