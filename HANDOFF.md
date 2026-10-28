# Portfolio handoff

Saved October 27, 2026. Repository: `JaredAnimal/Portfolio`.
Live site: https://jaredanimal.github.io/Portfolio/

## Project setup

- React, TypeScript, Vite, and Three.js; warm olive-and-sand theme. Use the existing `/workspace/Portfolio` checkout.
- Node.js 22.12+ and npm; validated with Node 24.19.0. No secrets, database, or environment variables are required.
- Install: `npm ci --cache /tmp/portfolio-npm-cache`. Develop: `npm run dev -- --port 5173`.
- Validate: `npm run build` and `npm test`. Playwright uses `/usr/bin/chromium`, or `CHROMIUM_PATH`.

## Completed work

- Jared’s supplied portrait appears beside the homepage introduction, below the headline. Its original JPEG is renamed `src/assets/photos/jared-ashman-portrait.jpg`, with a CSS head-and-shoulders crop, responsive sizing, and descriptive alt text. Preserve the original face and image; the crop only changes the visible framing.
- Interactive circuit board with six accessible hotspots, keyboard/touch support, reduced motion, and a non-WebGL fallback.
- Project pages, employment details, concept illustrations, and nested menus with Back, Escape, and focus restoration. The net-extension project includes an interactive Three.js concept model; the dart robot is independent and links to the district showcase. Decorative short sayings were reduced in favor of descriptive labels.
- All eight projects appear at `#/projects`, including the three pickleball projects and the wind turbine. Pickleball projects also remain in the club submenu and have dedicated shareable pages. BrightLight is the new display name, with the old `pilight` route preserved as an alias.
- Approved resume preserved unchanged. Renamed unofficial transcript published as `public/Jared-Ashman-Transcript.pdf`, with student ID and birth date removed and academic content preserved. Never publish the original upload.
- The portfolio now includes the restored “Curiosity, wired into practice” headline, a matching LinkedIn icon/link beside the résumé, USS Sunflower with design details and photo/link slots, project metric captions and link slots, and consistent circuit-board pointer motion. The circuit figure’s top caption has been removed; internship wording uses computer engineering.
- Browser validation covers project and source dialogs, routes, metrics, downloads, accessibility, pointer motion, touch, reduced motion, and non-WebGL fallbacks.
- Content lives in `src/projects.ts`, `src/experience.ts`, and `src/pickleballProjects.ts`; shared menus are in `src/components/PortfolioMenu.tsx`. See `README.md` for more detail.

## Remaining tasks

- Pickleball now uses three supplied photos, led by the team portrait. USS Sunflower uses six photos, led by the close-up on the workshop table. Photos live in `src/assets/photos/` with captions and ordering in `src/photos.ts`.
- Replace the remaining concept illustrations with real photos when supplied; slots use `data-photo-slot` and `PlaceholderArt`.
- Add further project specifications, results, or live links only when confirmed. The car and net extension remain in progress; dart-robot details are intentionally limited.
- Separate LinkedIn updates remain unapplied. Copy-ready text is saved outside Git at `/workspace/linkedin-profile-updates.md`; no profile edits or posts were made.
- USS Sunflower is available from the Projects menu and its dedicated page at `#/projects/sunflower`, while the homepage features BrightLight and the PID car.
- The USS Sunflower design-snapshot link and video slots outside BrightLight have been removed. The source design PDF is not published. Wind turbine voltage/RPM and net-extension metrics remain pending; other displayed measurements were supplied by Jared. Picklebot links to the v0.2.6 Windows installer and shows the exact supplied JavaScript in an in-page viewer.

## Deployment instructions

- Production uses the `/Portfolio/` base path and hash routes. Preserve these for GitHub Pages.
- Standing user preference: after implementing and validating requested updates, commit and push to `main` automatically, without asking for publication confirmation. Use `git push origin HEAD:main` from the active branch, preserving other work.
- `.github/workflows/deploy.yml` installs, builds, and deploys `dist/` automatically on pushes to `main`; manual dispatch is also available. Pages source must remain **GitHub Actions**.
- Check the workflow result and live site after publishing: `gh run list --repo JaredAnimal/Portfolio --workflow deploy.yml --limit 3`.
- For local production checks: run `npm run build`, then `npm run preview -- --port 4174 --strictPort`. In another terminal, run `PLAYWRIGHT_BASE_URL=http://127.0.0.1:4174/Portfolio/ npm test`.
