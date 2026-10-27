# Jared Ashman — Portfolio

A warm olive-and-sand portfolio for Jared's computer engineering internship search. Built with React, TypeScript, Vite, and Three.js. Fonts are bundled locally, so the page makes no requests to a font CDN or analytics service.

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

After validating requested changes, commit and push to `main` automatically. This is the user’s standing publishing preference; no separate publish confirmation is needed. Preserve unrelated changes and verify the deployment workflow after each push.

The production build targets `https://jaredanimal.github.io/Portfolio/`. Vite uses `/Portfolio/` as its production base while local development continues to use `/`. The favicon, bundled assets, and resume download respect that base path.

`.github/workflows/deploy.yml` builds with Node.js 24 and publishes `dist/` through the official GitHub Pages Actions. It runs on pushes to `main` and can also be started manually from the repository's Actions tab. Set **Settings → Pages → Build and deployment → Source** to **GitHub Actions** before the first deployment.

To check the production build locally, run `npm run preview -- --port 4174 --strictPort` after building. The preview serves the same `/Portfolio/` path as the deployed site. In another terminal, run `PLAYWRIGHT_BASE_URL=http://127.0.0.1:4174/Portfolio/ npm test` to validate the production build. The workflow configuration alone does not confirm a live deployment; check the Pages workflow result and public site after publishing.

## Content

- `src/projects.ts`: project descriptions, detail views, metric captions, and optional project URLs. Sunflower appears last in the homepage project list.
- `src/App.tsx`: homepage, expanded work experience, UCLA Club Pickleball, board story dialogs, contact links, and hash navigation.
- `src/components/PortfolioMenu.tsx`: shared native dialog with category, project, employment, and pickleball-project submenus; Back, Escape, and focus restoration work without nested modal stacks. Home project/job image and title controls, header categories, and the circuit components open these views.
- `src/experience.ts`: the three employment entries, shared by the homepage and their submenus.
- `src/pickleballProjects.ts`: the reservation bot, reservation-sharing website, and 3D-printed net-base extension. Their names and details render only after opening the Pickleball submenu, never as homepage projects. Bot and website descriptions were recovered from the user's public [UCLAPickleball repository](https://github.com/JaredAnimal/UCLAPickleball); the net extension is described as a design goal, with no invented measurements or results.
- `src/components/BrandMark.tsx` and `public/favicon.svg`: matching circuit-inspired chip-and-connections emblem.
- `src/components/ProjectPage.tsx`: dedicated PiLight, PID car, dart-robot backstory, and Sunflower pages. Routes use `#/projects/pilight`, `#/projects/line-follower`, `#/projects/dart-robot`, and `#/projects/sunflower` so direct links and refreshes work on GitHub Pages without server routing.
- `src/styles.css`: palette, layout, and responsive styles.
- `src/components/CircuitScene.tsx`: interactive circuit board with six components for projects, experience, transcript, about, pickleball, and resume. Labels and component markers support keyboard, touch, and a non-WebGL fallback. It renders on demand and respects reduced motion. Pointer motion uses camera-relative parallax and tilt so both the near and far edges follow the cursor consistently. This conceptual board is not a model of one of Jared's projects.
- `src/components/ProjectArtwork.tsx`: conceptual project illustrations. Replace with real project photography when available.
- `src/components/PlaceholderArt.tsx` and `src/assets/illustrations/`: seven generated olive-and-sand placeholder illustrations for PiLight, the PID car, the dart robot, robotics instruction, hardware-data analysis, IT support, and pickleball. The component reuses these assets across homepage and gallery slots, includes descriptive alt text and a visible concept-illustration label, and lazy-loads images while preserving each slot's dimensions.
- `public/Jared-Ashman-Resume.pdf`: the user's approved, one-page LaTeX resume PDF, supplied October 26, 2026. The uploaded PDF is served unchanged, including its contact details.
- `public/Jared-Ashman-Transcript.pdf`: the renamed, three-page unofficial UCLA transcript, available to view or download from the Transcript submenu. The public copy permanently redacts the university ID and birth-date field and uses clean metadata; extracted academic content was verified unchanged. The original upload is retained outside the checkout and is not published.

Project descriptions, education, skills, and experience follow that approved resume: expected UCLA graduation June 2029, GPA 3.9 and Dean's List, Navy SSEP data analysis, UCLA robotics instruction, admissions IT, PiLight (ESP32/Python/FFT), and an in-progress ESP32 PID line-following car using eight brightness sensors and the Arduino IDE. About content also includes the listed clearance, salutatorian distinction, BUR role, and UCLA Club Pickleball. No performance measurements or hardware specifications beyond the supplied information have been added. The reservation-sharing project links to the confirmed public repository; other project destinations stay empty until supplied. Project artwork is conceptual; it does not document a tested physical configuration. The only external profile link is the LinkedIn URL supplied by Jared.

Photo areas are marked `data-photo-slot` and currently display temporary concept clipart at the user's request, with `data-placeholder-illustration` identifying each subject. These illustrations are not photographs or documentation of actual builds, workplaces, or events. Replace the `PlaceholderArt` renderings with real photos and meaningful alt text when supplied. Original generated PNGs are preserved outside the checkout under `/workspace/generated_images`; the site uses copies in `src/assets/illustrations`. The transcript component provides real links to the renamed public PDF and identifies it as an unofficial copy with personal identifiers redacted. The dart-robot backstory records the user's confirmed inspiration relationship to the PID car without adding unconfirmed specifications.

## Project links, metrics, and Sunflower

The hero reads “Curiosity, wired into practice,” with “wired” in the italic display face. Its LinkedIn link uses the same supplied profile URL as the contact section, with an olive icon beside the résumé.

Each project has link slots. Edit `links` in `src/projects.ts` or `src/pickleballProjects.ts`; the dart-robot links live in `src/projectDetails.ts`. Add an `href` to a slot to make it an active link. Without an `href`, the site displays a noninteractive “Coming soon” label. Sunflower has a dedicated **Full design snapshot** slot. The attached source PDF has not been added to the public site.

Metric areas reserve room for large values while showing only captions and a dash until measurements are available. Edit each project's `metrics` array and add a verified `value` when ready. PiLight has response-latency and frequency-resolution captions; no sample latency is presented as a measured result. Shared rendering lives in `src/components/ProjectDetails.tsx`.

Sunflower is Jared’s underwater robotics course robot developed with Team OceanGate. Its content comes from the supplied nine-page **UWR Design: Team OceanGate** snapshot: cylindrical body and internal wiring (page 2), six-motor CAD layout (page 3), custom clamps and brackets (page 4), fabrication and appearance concepts (pages 5–8), and planned PS4 controller input (page 9). The snapshot credits Fedor Khaldin, Dhruv Mistry, and Jared Ashman. These are documented design details, not verified performance measurements or an individual contribution breakdown. Sunflower photo slots use `data-photo-pending="sunflower"` and await the user's photos.
