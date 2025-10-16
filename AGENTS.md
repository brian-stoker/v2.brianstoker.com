# Repository Guidelines

## Project Structure & Module Organization
- Next.js 15 source lives under `src`, with shared UI in `src/components`, feature bundles in `src/modules`, and page scaffolding in `src/layouts`.
- User-facing routes come from `pages` (legacy) and `src/pages` (app-specific entry points). Prefer colocating new routes in `src/pages` next to their feature module.
- Long-form content and assets sit in `data`, `public`, and `translations`; keep generated exports in `export/` out of version control.
- Serverless deployment logic resides in `sst.config.ts` and `stacks/`; scripts supporting build and export flows live in `scripts/`.

## Build, Test, and Development Commands
- `pnpm dev` — launches the local Next dev server on port 3000.
- `pnpm build` — produces a profiled production bundle; run before opening a PR touching runtime code.
- `pnpm build:static` / `pnpm build:open-next` — generate static exports used for public hosting flows.
- `pnpm build:clean` — clears `.next` and rebuilds; use if incremental builds misbehave.
- `pnpm link-check` — reports broken internal/MDX links.
- `pnpm icons` — rebuilds sprite assets in `public/static/icons/`; required after adding SVGs.

## Coding Style & Naming Conventions
- TypeScript is the default; favor `tsx` React function components with explicit prop types.
- Adhere to the prevalent two-space indentation, dangling semicolons, and single quotes.
- Use `PascalCase` for components, `camelCase` for helpers/hooks, and kebab-case for file names unless the module exports a React component.
- Styling mixes MUI `styled` utilities and Tailwind classes; keep theme tokens (`theme.palette.*`) instead of hard-coded colors.

## Testing Guidelines
- No automated test harness ships today; validate UI changes manually in `pnpm dev` and confirm builds via `pnpm build`.
- When adding tests, colocate them next to the module (`src/modules/<feature>/__tests__`) and mirror filenames (`Component.test.tsx`).
- Run `pnpm link-check` before publishing documentation updates.

## Commit & Pull Request Guidelines
- Follow the existing short, lower-case commit subjects (e.g., `minor config fixes`); group related changes per commit.
- Every PR should summarize intent, link tracking issues, list validation commands (`pnpm build`, `pnpm link-check`), and attach UI screenshots or videos when visual changes occur.
- Rebase onto the default branch to keep deployment scripts (`sst-build.js`, `next-sst-export.js`) aligned before merging.
