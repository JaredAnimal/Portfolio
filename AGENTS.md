# Portfolio workflow

- Implement requested portfolio changes in this checkout and preserve unrelated work.
- The user has authorized automatically committing and pushing completed, validated changes to `main` every time. Do not ask for separate publication confirmation. Use `git push origin HEAD:main`; do not force-push.
- A push to `main` deploys GitHub Pages through `.github/workflows/deploy.yml`. Check that workflow after publishing.
- Use `npm run build` to check TypeScript and build the site. Run the relevant browser checks with `npm test`; production preview checks use `PLAYWRIGHT_BASE_URL=http://127.0.0.1:4174/Portfolio/`.
- Preserve the production `/Portfolio/` base path and hash routes. Keep the approved résumé and redacted transcript unchanged unless explicitly asked to edit them.
- Keep unverified project metrics and URLs as placeholders until supplied. USS Sunflower's design snapshot is source material; its public link is still pending. Keep the supplied workbench close-up as its lead photo and the pickleball team shot as the club’s lead photo.
- See `README.md` for content files and development commands, and `HANDOFF.md` for project context.
