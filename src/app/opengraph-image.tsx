import { ImageResponse } from 'next/og';

export const alt = 'Codex Pet Sprite Editor';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-static';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px',
        color: '#f0f6fc',
        background: '#0d1117',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', color: '#8b949e', fontSize: 28 }}>Local-first · v1 and v2</div>
      <div
        style={{
          display: 'flex',
          maxWidth: 960,
          fontSize: 82,
          fontWeight: 700,
          lineHeight: 1.05,
        }}
      >
        Codex Pet Sprite Editor
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 28 }}>
        <span
          style={{
            display: 'flex',
            width: 18,
            height: 18,
            borderRadius: 9,
            background: '#3b82c4',
          }}
        />
        Create, preview, and export locally in your browser
      </div>
    </div>,
    size,
  );
}
