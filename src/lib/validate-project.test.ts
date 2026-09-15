import { describe, expect, it } from "vitest";
import { createProject } from "./sprite-project";
import { validateProject } from "./validate-project";

describe("project validation", () => {
  it.each([
    ["v1", 57],
    ["v2", 73],
  ] as const)(
    "allows an empty %s project to export with warnings",
    (mode, emptyFrames) => {
      const project = createProject(mode, {
        id: "my-pet",
        displayName: "My pet",
        description: "",
      });
      const result = validateProject(project);

      expect(result.canExport).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(
        result.warnings.filter((issue) => issue.code === "missing-frame"),
      ).toHaveLength(emptyFrames);
    },
  );
});
