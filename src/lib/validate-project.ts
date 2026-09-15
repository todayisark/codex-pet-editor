import { frameKey, type SpriteProject } from "./sprite-project";
import { getSpritePreset, isValidFrame } from "./sprite-presets";

export type ValidationIssue = Readonly<{
  severity: "error" | "warning" | "info";
  code: "invalid-id" | "missing-frame" | "frame-in-unused-cell";
  message: string;
  row?: number;
  column?: number;
}>;

export type ValidationResult = Readonly<{
  errors: readonly ValidationIssue[];
  warnings: readonly ValidationIssue[];
  info: readonly ValidationIssue[];
  canExport: boolean;
}>;

const SAFE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateProject(project: SpriteProject): ValidationResult {
  const preset = getSpritePreset(project.mode);
  const issues: ValidationIssue[] = [];

  if (!SAFE_ID.test(project.metadata.id)) {
    issues.push({
      severity: "error",
      code: "invalid-id",
      message:
        "The pet ID may only contain lowercase letters, numbers, and single hyphens.",
    });
  }

  for (const animation of preset.animations) {
    for (let column = 0; column < animation.frameCount; column += 1) {
      if (!project.frames.has(frameKey(animation.row, column))) {
        issues.push({
          severity: "warning",
          code: "missing-frame",
          message: `${animation.label} frame ${column + 1} is empty and will be exported as a transparent cell.`,
          row: animation.row,
          column,
        });
      }
    }
  }

  for (const frame of project.frames.values()) {
    if (!isValidFrame(project.mode, frame.row, frame.column)) {
      issues.push({
        severity: "error",
        code: "frame-in-unused-cell",
        message: `Row ${frame.row}, column ${frame.column} is an unused cell.`,
        row: frame.row,
        column: frame.column,
      });
    }
  }

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  const info = issues.filter((issue) => issue.severity === "info");
  return { errors, warnings, info, canExport: errors.length === 0 };
}
