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

- `src/projects.ts`: project descriptions, detail views, metric captions, and optional project URLs. The `featuredProjects` export selects the homepage cards: Dart-launching robot and Wind turbine. USS Sunflower stays in the Projects menu and its dedicated page, without a homepage card.
- `src/App.tsx`: homepage, expanded work experience, UCLA Club Pickleball, board story dialogs, contact links, and hash navigation.
- `src/components/PortfolioMenu.tsx`: shared native dialog with category, project, employment, and pickleball-project submenus; Back, Escape, and focus restoration work across nested views; the source-code viewer opens as a nested native dialog. Home project/job image and title controls, header categories, and the circuit components open these views.
- `src/experience.ts`: the three employment entries, shared by the homepage and their submenus.
- `src/pickleballProjects.ts`: the reservation bot, reservation-sharing website, and 3D-printed net-base extension. They appear on the all-projects page and in both the Projects and Pickleball menus, with dedicated shareable pages. Bot and website descriptions were recovered from the user's public [UCLAPickleball repository](https://github.com/JaredAnimal/UCLAPickleball); the net extension is described as a design goal, with no invented measurements or results.
- `src/components/BrandMark.tsx` and `public/favicon.svg`: matching circuit-inspired chip-and-connections emblem.
- `src/components/ProjectsPage.tsx`: the all-projects index at `#/projects`, covering all eight projects.
- `src/components/ProjectPage.tsx`: dedicated engineering and pickleball project pages. BrightLight uses `#/projects/brightlight` and retains `#/projects/pilight` as an alias; other routes use each project’s stable ID. Direct links and refreshes work on GitHub Pages without server routing.
- `src/components/SourceCodeViewer.tsx`: an accessible, syntax-highlighted in-page viewer for the supplied Picklebot JavaScript. The source is displayed as escaped text and never executed.
- `src/components/PickleballNetScene.tsx`: an interactive Three.js concept model for the net-base extension, with reduced-motion support and a non-WebGL fallback.
- `src/styles.css`: palette, layout, and responsive styles.
- `src/photos.ts`, `src/components/Photo.tsx`, and `src/assets/photos/`: the user-supplied project and experience images, with descriptive alt text, captions, natural dimensions, and lazy loading for gallery images.
- `src/components/CircuitScene.tsx`: interactive circuit board with six components for projects, experience, transcript, about, pickleball, and resume. Labels and component markers support keyboard, touch, and a non-WebGL fallback. It renders on demand and respects reduced motion. Pointer motion uses camera-relative parallax and tilt so both the near and far edges follow the cursor consistently. This conceptual board is not a model of one of Jared's projects.
- `src/components/ProjectArtwork.tsx`: conceptual project illustrations. Replace with real project photography when available.
- `src/components/PlaceholderArt.tsx` and `src/assets/illustrations/`: seven generated olive-and-sand placeholder illustrations for BrightLight, the PID car, the dart robot, robotics instruction, hardware-data analysis, IT support, and pickleball. BrightLight uses its supplied transparent LED-display photograph as its lead image. Supplied images now replace the PID car, dart-robot, work-experience, pickleball, and USS Sunflower placeholders; unused originals remain archived in the assets directory.
- `public/Jared-Ashman-Resume.pdf`: the user's approved, one-page LaTeX resume PDF, supplied October 26, 2026. The uploaded PDF is served unchanged, including its contact details.
- `public/Jared-Ashman-Transcript.pdf`: the renamed, three-page unofficial UCLA transcript, available to view or download from the Transcript submenu. The public copy permanently redacts the university ID and birth-date field and uses clean metadata; extracted academic content was verified unchanged. The original upload is retained outside the checkout and is not published.

Project descriptions, education, skills, and experience follow that approved resume: expected UCLA graduation June 2029, GPA 3.9 and Dean's List, Navy SSEP data analysis, UCLA robotics instruction, admissions IT, BrightLight (ESP32/Python/FFT), and an in-progress ESP32 PID line-following car using eight brightness sensors and the Arduino IDE. About content also includes the listed clearance, salutatorian distinction, past BUR Computer Vision Simulation Manager role (2025–2026), and current UCLA Club Pickleball involvement. Jared is no longer participating in BUR this year. No performance measurements or hardware specifications beyond the supplied information have been added. The reservation-sharing project links to the confirmed public repository; other project destinations stay empty until supplied. The remaining concept illustrations do not document a tested physical configuration; USS Sunflower and pickleball now use the user’s actual photographs. The only external profile link is the LinkedIn URL supplied by Jared.

Photo areas are marked `data-photo-slot`. Real photographs also carry `data-photo` and `data-photo-subject`; remaining concept illustrations use `data-placeholder-illustration`. The shared photo component also displays supplied charts, screenshots, and diagrams, with alt text identifying the media accurately. These illustrations are not photographs or documentation of actual builds, workplaces, or events. Replace the `PlaceholderArt` renderings with real photos and meaningful alt text when supplied. Original generated PNGs are preserved outside the checkout under `/workspace/generated_images`; the site uses copies in `src/assets/illustrations`. The transcript component links to the unchanged public PDF and identifies it as an unofficial student copy. Its redactions remain in place, while the visible redaction notice has been removed. The dart-launching robot is presented as an independent project with a link to the district showcase.

## Project links, metrics, and USS Sunflower

The hero reads “Curiosity, wired into practice,” with “wired” in the italic display face. Its LinkedIn link uses the same supplied profile URL as the contact section, with an olive icon beside the résumé.

Each project has link slots. Edit `links` in `src/projects.ts` or `src/pickleballProjects.ts`; the dart-robot links live in `src/projectDetails.ts`. Add an `href` to a slot to make it an active link. Without an `href` or a source-viewer action, the site displays a noninteractive “Coming soon” label. Only BrightLight retains a demo-video slot. USS Sunflower’s design-snapshot slot has been removed; the attached source PDF is not published. Picklebot’s source action opens the uploaded JavaScript in the page, and its installer links directly to the verified `picklebot-v0.2.6` GitHub release asset.

Metrics supplied by Jared: BrightLight response latency <50 ms and frequency resolution <2.5 Hz; PID car tracking error 4% and control-loop period 17 ms; USS Sunflower dive depth 33 ft and underwater runtime 30 min; Picklebot booking turnaround <0.3 s; reservation-sharing website approximately 50 reservations shared as of October 29, 2026; wind turbine output voltage 17 V and maximum speed 82 RPM. Milliseconds describe the control-loop period, rather than a frequency. The net-extension measurements remain placeholders. Shared rendering lives in `src/components/ProjectDetails.tsx`.

USS Sunflower is Jared’s underwater robotics course robot developed with his underwater robotics course team. Its content comes from the supplied nine-page underwater robotics design snapshot: cylindrical body and internal wiring (page 2), six-motor CAD layout (page 3), custom clamps and brackets (page 4), fabrication and appearance concepts (pages 5–8), and planned PS4 controller input (page 9). The snapshot credits Fedor Khaldin, Dhruv Mistry, and Jared Ashman. The snapshot supplies design details, while the current depth and runtime figures were supplied separately by Jared; no individual contribution breakdown is claimed. USS Sunflower now shows six supplied photographs, with the close-up on the workshop table as its lead image. It remains accessible from the Projects menu and its direct route, without a homepage card.

## Supplied photo sets

The homepage introduction uses the portrait from `JDA.zip`, renamed `src/assets/photos/jared-ashman-portrait.jpg`. The original JPEG is preserved; CSS frames a tighter 4:5 head-and-shoulders crop beside the introduction, with responsive sizing and eager loading.

Photos supplied October 27, 2026 are preserved as original JPEGs in `src/assets/photos/`. The image order, alt text, and captions are in `src/photos.ts`. Gallery photos retain their natural proportions. USS Sunflower’s lead image uses a CSS crop and fitted frame to emphasize the robot; the original JPEG is preserved.

- **Pickleball:** `PB.zip` supplies three photos. `WCCI_WB-405071 (1).jpg` is `pickleball/team.jpg`, used as the large club-section photo and the Pickleball menu preview. `WCCI_WB-404575.jpg` and `WCCI_WB-404577.jpg` are the two supporting court photos.
- **USS Sunflower:** `SF.zip` supplies six photos. `IMG_3085.JPG` is `sunflower/workbench.jpg`, used as the large project-page photo and menu preview. The five-photo gallery includes the upright hull (`IMG_3077`), poolside electronics (`IMG_1477`), workshop camera monitor (`IMG_3084`), poolside robot (`IMG_1478`), and pool camera monitor (`IMG_3090`). Photographs add visual documentation, not unverified performance measurements.

The wind-turbine project records team testing of four designs: Savonius, HAWT, VAWT, and bladeless. Jared supplied an output voltage of 17 V and a maximum speed of 82 RPM; its supplied test-setup photo from `WTPHOTO.zip` leads the project, with four videos in the gallery. Decorative short sayings have been reduced throughout the homepage and project pages in favor of descriptive headings.

## Additional images — October 28, 2026

`Addimages.zip` supplies seven images, preserved unchanged with descriptive filenames. The PID car uses `line-follower/robot-platform.jpg` in its submenu and dedicated page. The dart robot uses `dart-robot/district-showcase.png` as its lead, with `dart-flow-simulation.jpg` and `launch-angle-chart.png` as uncropped supporting diagrams. Experience entries and their submenus use `experience/underwater-robotics.jpg`, `navy-ships.jpg`, and `ucla-web-portals.jpg`. Captions describe visible content without treating the images as evidence of unconfirmed hardware specifications or individual contributions.

## PID and BrightLight images — October 28, 2026

The supplied transparent PNG replaces the PID car image in menus and on its project page. Its background matches BrightLight’s concept art. The PID page also includes the supplied SUM vs. ERROR graph (`imageofPID.png`), displayed uncropped at full gallery width. BrightLight’s two supplied portrait ESP32 photographs appear only in its full project page gallery, side by side on desktop and stacked on phones, with their natural proportions preserved.

## Net model callouts — October 28, 2026

The viewer depicts a standard pickleball net with a yellow box centered on the lower rail halfway between the middle and right post. A callout labeled “proposed area of net extension” points to the box and follows rotation, resizing, and the static fallback. The box marks a proposed location, rather than a completed extension. Both bases share the same olive frame material. CAD-style callouts track rotation and resizing, with matching static callouts: net width 6.63 m, sideline height 0.9144 m, center height 0.8636 m, and tension 230–270 N. The width and tension were supplied by Jared; the heights follow the previously verified regulation dimensions. The tension leader points directly to the net’s top edge. The caption contains only the model name and interaction instructions.

## Reservation-sharing total — October 29, 2026

The website link is https://bit.ly/UCLAPB. Its estimated reservations-shared total starts at approximately 50 on October 29, 2026, then adds 2 for each subsequent weekday and 1 for each subsequent weekend day, using America/Los_Angeles calendar dates. `src/reservationTotals.ts` computes an integer total from the date; no backend or daily deployment is needed. The shared metrics component refreshes once per minute and when the page regains focus or visibility. The ≈ prefix identifies this rate-based estimate. The dart robot retains only its district-showcase link, with its pending project-files slot removed.

## BrightLight main image — October 29, 2026

The supplied transparent LED-display PNG is the lead image in BrightLight’s menu and on its full project page. CSS centers the visible enclosure within the original image’s transparent margins, matching the PID car card’s background and balancing their scale. The source PNG is preserved unchanged. The two vertical ESP32 photographs remain exclusive to the full project page gallery.

The net extension detail page uses `NetExtenderPrototype.tsx` to display the original STL from `FINAlSOLUTION.zip`. The model and its static preview live in `src/assets/models/`. Automatic rotation respects reduced-motion preferences, visibility, and pause controls; the existing net diagram remains below it for context.
