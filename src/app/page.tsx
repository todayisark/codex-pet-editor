import { SpriteEditor } from "@/components/sprite-editor";

export default function Home() {
  return (
    <main>
      <header className="hero">
        <div className="hero-content">
          <p className="eyebrow">v1.0.0</p>
          <h1>Codex Pet Sprite Editor</h1>
          <p className="intro">
            Codex Pets bring a character to your desktop with animated states
            for idling, working, reviewing, and more. Build a compatible v1 or
            v2 sprite sheet here, entirely in your browser.
          </p>
          <div className="how-it-works" aria-label="How Codex Pet works">
            <span className="card-label">Create your pet</span>
            <p>
              <strong>1. Add frames</strong>
              <span>→</span>
              <strong>2. Preview and check</strong>
              <span>→</span>
              <strong>3. Export</strong>
            </p>
          </div>
          <div className="install-note">
            <div>
              <span className="install-label">Install in Codex Desktop</span>
              <code>~/.codex/pets/&lt;pet-id&gt;/</code>
            </div>
            <p>
              Extract the exported folder here so it contains{" "}
              <code>pet.json</code> and <code>spritesheet.webp</code>. Then open{" "}
              <strong>Settings → Pets</strong>, refresh the list, and select
              your pet.
            </p>
          </div>
          <div className="hero-actions">
            <a className="hero-action" href="#editor">
              Start creating <span>→</span>
            </a>
            <a
              className="github-link"
              href="https://github.com/todayisark"
              target="_blank"
              rel="noreferrer"
              aria-label="Visit todayisark on GitHub"
              title="GitHub · todayisark"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22">
                <path
                  fill="currentColor"
                  d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.24c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.57-.3-5.27-1.29-5.27-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.16 1.18a10.95 10.95 0 0 1 5.76 0c2.19-1.49 3.15-1.18 3.15-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.71 5.39-5.29 5.68.42.36.78 1.06.78 2.14v3.18c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z"
                />
              </svg>
            </a>
          </div>
        </div>
      </header>
      <div id="editor">
        <SpriteEditor />
      </div>
    </main>
  );
}
