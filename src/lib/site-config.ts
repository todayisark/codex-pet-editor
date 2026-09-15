const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const siteUrl = (configuredSiteUrl || "http://localhost:3000").replace(
  /\/$/,
  "",
);

export const siteName = "Codex Pet Sprite Editor";
export const siteDescription =
  "Create Codex Pet v1 and v2 sprite sheets locally in your browser. Import frames, preview animations, and export without uploading images.";
