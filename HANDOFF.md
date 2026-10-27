# Portfolio handoff

Saved October 26, 2026. Repository: `JaredAnimal/Portfolio`.
Live site: https://jaredanimal.github.io/Portfolio/

## Project setup

- React, TypeScript, Vite, and Three.js; warm olive-and-sand theme. Use the existing `/workspace/Portfolio` checkout.
- Node.js 22.12+ and npm; validated with Node 24.19.0. No secrets, database, or environment variables are required.
- Install: `npm ci --cache /tmp/portfolio-npm-cache`. Develop: `npm run dev -- --port 5173`.
- Validate: `npm run build` and `npm test`. Playwright uses `/usr/bin/chromium`, or `CHROMIUM_PATH`.

## Completed work

- Interactive circuit board with six accessible hotspots, keyboard/touch support, reduced motion, and a non-WebGL fallback.
- Project pages, employment details, concept illustrations, and nested menus with Back, Escape, and focus restoration.
- The three pickleball projects appear only inside the Pickleball submenu: reservation bot, reservation-sharing website, and a proposed 3D-printed net-base extension.
- Approved resume preserved unchanged. Renamed unofficial transcript published as `public/Jared-Ashman-Transcript.pdf`, with student ID and birth date removed and academic content preserved. Never publish the original upload.
- The portfolio now includes the restored “Curiosity, wired into practice” headline, a matching LinkedIn icon/link beside the résumé, Sunflower with design details and photo/link slots, project metric captions and link slots, and consistent circuit-board pointer motion. The circuit figure’s top caption has been removed; internship wording uses computer engineering.
- Validation includes 20 production browser checks, with focused checks for pointer motion, touch, reduced motion, and the non-WebGL fallback.
- Content lives in `src/projects.ts`, `src/experience.ts`, and `src/pickleballProjects.ts`; shared menus are in `src/components/PortfolioMenu.tsx`. See `README.md` for more detail.

## Remaining tasks

- Replace concept illustrations with real photos when supplied; slots use `data-photo-slot` and `PlaceholderArt`.
- Add further project specifications, results, or live links only when confirmed. The car and net extension remain in progress; dart-robot details are intentionally limited.
- Separate LinkedIn updates remain unapplied. Copy-ready text is saved outside Git at `/workspace/linkedin-profile-updates.md`; no profile edits or posts were made.
- Sunflower photos, the full design snapshot URL, other project URLs, and verified metric values can be supplied later. The source design PDF is not published.

## Deployment instructions

- Production uses the `/Portfolio/` base path and hash routes. Preserve these for GitHub Pages.
- Standing user preference: after implementing and validating requested updates, commit and push to `main` automatically, without asking for publication confirmation. Use `git push origin HEAD:main` from the active branch, preserving other work.
- `.github/workflows/deploy.yml` installs, builds, and deploys `dist/` automatically on pushes to `main`; manual dispatch is also available. Pages source must remain **GitHub Actions**.
- Check the workflow result and live site after publishing: `gh run list --repo JaredAnimal/Portfolio --workflow deploy.yml --limit 3`.
- For local production checks: run `npm run build`, then `npm run preview -- --port 4174 --strictPort`. In another terminal, run `PLAYWRIGHT_BASE_URL=http://127.0.0.1:4174/Portfolio/ npm test`.
