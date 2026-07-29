# GitHub Actions and Vercel setup

This project deploys through GitHub Actions. Pull requests only run quality gates; a push to `main` or `master` deploys to Vercel after every gate passes.

## Required GitHub secrets

Add these repository or `production` environment secrets before the first production deployment:

| Secret | Purpose |
| --- | --- |
| `VERCEL_TOKEN` | Vercel personal/team access token used by the deployment job |
| `VERCEL_ORG_ID` | Vercel team or personal account ID |
| `VERCEL_PROJECT_ID` | Vercel project ID for this dApp |

Get the project identifiers from `.vercel/project.json` after linking the project with the Vercel CLI, or from Vercel project settings. Keep application runtime values—such as `GEMINI_API_KEY`, treasury secrets, and `VITE_*` configuration—in Vercel's Environment Variables, not in GitHub Actions.

## Workflow behavior

- Pull requests to `main` / `master`: frontend lint, tests and build; serverless backend syntax validation; Soroban tests and WASM build.
- Pushes to `main` / `master`: the same gates, then a Vercel production build and deployment.
- Manual runs: quality gates only, so an accidental manual run cannot deploy a different branch to production.

The workflow lives at `.github/workflows/ci-cd.yml`.

## Private admin observatory

The `/admin` route is a private Testnet activity dashboard. Before deploying it, create an Upstash Redis REST database and add these Vercel Environment Variables:

| Variable | Purpose |
| --- | --- |
| `ADMIN_DASHBOARD_TOKEN` | A long, private token required to open `/admin` |
| `UPSTASH_REDIS_REST_URL` | Upstash database REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash database REST token |

The public client never receives these values. It submits only transaction metadata after wallet actions; `/api/telemetry` independently checks each receipt against Stellar Testnet Horizon before it writes to Redis. Leave the variables unset during local UI work if desired: the game continues to work and the observatory clearly reports that storage has not been configured.
