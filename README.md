# Jared Ashman — Portfolio

A warm olive-and-sand portfolio for Jared's electrical engineering internship search. Built with React, TypeScript, Vite, and Three.js. Fonts are bundled locally, so the page makes no requests to a font CDN or analytics service.

## Development

Use the existing checkout. Cloud tasks already have isolated workspaces; there is no need to create a Git worktree.

Requires Node.js 22.12+ (validated with Node 24.19.0) and npm.

```sh
cd /workspace/Portfolio
npm ci --cache /tmp/portfolio-npm-cache
npm run dev -- --port 5173
```

The npm cache flag keeps installation within writable locations in the cloud environment. No API keys, databases, or environment variables are needed.

## Validation

```sh
npm run build
npm test
```

The build checks TypeScript and produces `dist/`. Playwright uses system Chromium at `/usr/bin/chromium`, or `CHROMIUM_PATH` if set (see its config). Tests start their own development server when needed. Browser checks cover project dialogs, navigation, PDF downloads, responsive layouts, accessibility, reduced motion, and a WebGL-disabled fallback.

## GitHub Pages deployment

The production build targets `https://jaredanimal.github.io/Portfolio/`. Vite uses `/Portfolio/` as its production base while local development continues to use `/`. The favicon, bundled assets, and resume download respect that base path.

`.github/workflows/deploy.yml` builds with Node.js 24 and publishes `dist/` through the official GitHub Pages Actions. It runs on pushes to `main` and can also be started manually from the repository's Actions tab. Set **Settings → Pages → Build and deployment → Source** to **GitHub Actions** before the first deployment.

To check the production build locally, run `npm run preview -- --port 4174 --strictPort` after building. The preview serves the same `/Portfolio/` path as the deployed site. In another terminal, run `PLAYWRIGHT_BASE_URL=http://127.0.0.1:4174/Portfolio/ npm test` to validate the production build. The workflow configuration alone does not confirm a live deployment; check the Pages workflow result and public site after publishing.

## Content

- `src/projects.ts`: project descriptions and detail views.
- `src/App.tsx`: bio, experience, contact, and LinkedIn link.
- `src/styles.css`: palette, layout, and responsive styles.
- `src/components/CircuitScene.tsx`: interactive, decorative circuit study. This is not a model of one of Jared's projects. It renders on demand, respects reduced motion, and falls back to an SVG when WebGL is unavailable.
- `src/components/ProjectArtwork.tsx`: conceptual project illustrations. Replace with real project photography when available.
- `public/Jared-Ashman-Resume.pdf`: the user's approved, one-page LaTeX resume PDF, supplied October 26, 2026. The uploaded PDF is served unchanged, including its contact details.

Project descriptions, education, skills, and experience follow that approved resume: expected UCLA graduation June 2029, GPA 3.9 and Dean's List, Navy SSEP data analysis, UCLA robotics instruction, admissions IT, PiLight (ESP32/Python/FFT), and an in-progress ESP32 PID line-following car using eight brightness sensors and the Arduino IDE. About content also includes the listed clearance, salutatorian distinction, BUR role, and UCLA Club Pickleball. No performance measurements, project source links, or hardware specifications beyond the supplied information have been added. Project artwork is conceptual; it does not document a tested physical configuration. The only external profile link is the LinkedIn URL supplied by Jared.
