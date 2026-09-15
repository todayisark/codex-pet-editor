import { describe, expect, it } from "vitest";
import { getSpritePreset, isValidFrame } from "./sprite-presets";

describe("sprite presets", () => {
  it.each([
    ["v1", 9, 1872, 57],
    ["v2", 11, 2288, 73],
  ] as const)("defines %s consistently", (mode, rows, height, validFrames) => {
    const preset = getSpritePreset(mode);
    expect(preset.rows).toBe(rows);
    expect(preset.sheetWidth).toBe(preset.columns * preset.cellWidth);
    expect(preset.sheetHeight).toBe(height);
    expect(preset.sheetHeight).toBe(preset.rows * preset.cellHeight);
    expect(
      preset.animations.reduce((sum, row) => sum + row.frameCount, 0),
    ).toBe(validFrames);
    expect(preset.columns * preset.rows - validFrames).toBe(15);
  });

  it("only enables direction rows in v2", () => {
    expect(isValidFrame("v1", 9, 0)).toBe(false);
    expect(isValidFrame("v2", 9, 0)).toBe(true);
    expect(isValidFrame("v2", 10, 7)).toBe(true);
  });
});
