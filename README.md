# Suzume’s Stellar Ramen Run 🍜 ✦

> A comic-book Stellar dApp where a player sponsors cosmic ramen deliveries, tracks their route live, and earns a permanent on-chain achievement stamp when the order lands.

![Suzume, the neon ramen courier](public/assets/suzume-hero.png)

## Why this is more than a demo

Suzume’s Stellar Ramen Run is a full-stack, responsive Soroban project designed around a small but realistic two-contract workflow:

```text
Freighter wallet → Ramen Vault → Stamp Shelf
                     │              │
                     └── events ────┴──→ SSE relay → live dispatch UI
```

- **Ramen Vault** accepts a sponsored route, validates its state, holds its record, emits typed events, and can complete a route.
- **Stamp Shelf** is a separate contract that only accepts a delegated authorization from the configured Vault. A completed route triggers a cross-contract call that mints an owner/route/rarity/serial achievement record.
- **Live Dispatch** consumes an SSE feed. It has a polished simulated live feed in demo mode, then switches to a real relay through `VITE_EVENT_STREAM_URL` after deployment.
- **Suzume** is a Gemini-ready assistant. Its API key is only read by `api/suzume.mjs`; without a key, the UI keeps working through an intentionally helpful local concierge fallback.

## Feature tour

- A dedicated **Manga Archive** with six chapters and twelve illustrated pages, static cast compositions, chapter navigation, and opt-in Web Audio ambience for rain, kitchens, trains, lanterns, and the shrine finale.
- A generated sprite-art kit replaces gameplay emoji placeholders across Ramen Run and every side-quest arcade board, while the runner now has deeper neon lane lighting and impact effects.
- A playable three-lane Suzume courier arcade run: keyboard/tap movement, collectible stardust, hazards, hearts, combos, score targets, boosts, win/loss states, Web Audio sound effects, and local saved progression.
- A skippable, three-page manga prologue with four comic frames per page, generated anime key-art cast members, sound-effect typography, narration boxes, page-turn controls, and motion-driven reactions. The chapter view keeps the same moving, expression-tagged cast.
- Four genuinely different character arcade games: Yori’s **Laser Cat Chase** reaction grid, Chef Beam’s **Torii Nori Sorter** classification puzzle, Mika’s **Shinkansen Drift Duel** precision-steering challenge, and P.E.E.P.’s **Lantern Memory Heist** Simon-style memory game. They do not reuse the ramen-run mechanic.
- Responsive landing page, command center, route board, stamp vault, dispatch observatory, technical guide, settings, 404 page, loading, success, error, and wallet states.
- Freighter wallet flow: access approval, then a second Freighter prompt for a real tiny **Stellar Testnet self-payment** (`SUZUME-CHECKIN`) with an inspectable transaction hash.
- Testnet side-quest receipts: the included server function can pay a completed quest’s configured XLM bounty from a server-side Testnet treasury. Without a treasury, the game makes it explicit that the Freighter-signed fallback is a completion receipt, not an XLM reward.
- Typed contract events, narrow delegated authorization, role-gated administration, and three Rust contract tests.
- Frontend unit tests, linting, production build, GitHub Actions pipeline, deploy script, Vercel server function, and an SSE relay adapter.

## Quick start

Prerequisites: Node 22+, Rust stable, the `wasm32v1-none` target, and the Stellar CLI only when you are ready to deploy.

```bash
npm install
copy .env.example .env
npm run dev
```

Open the local Vite URL, select **Start the story**, then fund a route. With no contract IDs configured, the app runs safely in **demo mode** so every screen is presentation-ready.

For the game: use **↑ / ↓** or **W / S** to switch lanes, press **Space** to boost, collect ✦ and 🍜, and dodge ☄️. Mobile controls appear below the game stage.

## Environment variables

Copy `.env.example` to `.env`. Never expose Gemini credentials in a variable beginning with `VITE_`.

| Variable | Needed for | Example |
| --- | --- | --- |
| `VITE_STELLAR_NETWORK` | Target network | `TESTNET` |
| `VITE_SOROBAN_RPC_URL` | Simulate and submit contracts | `https://soroban-testnet.stellar.org` |
| `VITE_RAMEN_VAULT_CONTRACT_ID` | Live `fund_route` calls | `C…` |
| `VITE_STAMP_NFT_CONTRACT_ID` | Vault display / deployment reference | `C…` |
| `VITE_EVENT_STREAM_URL` | Real-time route events | `https://your-relay/events` |
| `VITE_GEMINI_PROXY_URL` | Suzume endpoint | `/api/suzume` |
| `VITE_QUEST_REWARD_API` | Quest bounty endpoint | `/api/claim-quest` |
| `GEMINI_API_KEY` | Vercel server-side Suzume bot | set in Vercel only |
| `QUEST_REWARD_SECRET` | Testnet-only treasury secret for quest payouts | set in Vercel only |

## Test and build

```bash
npm run lint
npm run test
npm run build
cargo test --workspace
cargo build --release --target wasm32v1-none
```

Current local verification:

```text
✓ Frontend: 9 Vitest assertions passed
✓ Contracts: 3 Rust tests passed
✓ Production Vite bundle built
✓ Vault and Stamp Shelf WebAssembly built
```

## Contract architecture

### `contracts/ramen-vault`

| Method | Caller | Purpose |
| --- | --- | --- |
| `init(admin, stamp_shelf)` | admin | Configures immutable starting references |
| `fund_route(sponsor, route_id, amount)` | sponsor | Creates a funded route and emits `route_funded` |
| `complete_route(route_id, rarity)` | admin | Delegates a tightly-scoped mint authorization, calls Stamp Shelf, marks route done, emits `route_done` |
| `get_route`, `total_sponsored` | anyone | Read-only UI data |

### `contracts/stamp-shelf`

| Method | Caller | Purpose |
| --- | --- | --- |
| `init(admin)` | admin | Initializes contract ownership |
| `set_minter(vault)` | admin | Limits mint authority to the Vault contract |
| `mint(owner, route_id, rarity)` | configured Vault only | Stores one unique stamp per owner/route and emits `stamp_minted` |
| `get_stamp`, `owner_count`, `all_stamps` | anyone | Read-only vault data |

The Vault uses `authorize_as_current_contract` to grant exactly one nested `mint` call. The Stamp Shelf then calls `minter.require_auth()`, so a random user cannot mint a stamp directly.

## Deploy to Stellar testnet

1. Install the [Stellar CLI](https://developers.stellar.org/docs/tools/cli/install) and create/fund a testnet identity.
2. Make sure `wasm32v1-none` is installed: `rustup target add wasm32v1-none`.
3. Run the deployment workflow. It builds both WASM files, deploys them, configures the Stamp Shelf’s minter, and initializes the Vault.

```powershell
$env:STELLAR_DEPLOY_SOURCE = 'your-stellar-cli-identity'
npm run deploy:testnet
```

4. Copy the two emitted contract IDs into `.env`, restart the frontend, and fund any route with Freighter.
5. Save the resulting transaction hash and paste it into `docs/submission-checklist.md`.

The deploy script deliberately does not auto-fund or create an identity. That keeps wallet custody and real network writes under your control.

## Freighter Testnet check-in and quest XLM bounties

Clicking **Connect wallet** opens Freighter for access, then opens it again to sign a real Testnet self-payment of `0.00001 XLM` with the `SUZUME-CHECKIN` memo. This creates a visible transaction hash; the account must be funded on Testnet first. Use [Friendbot](https://laboratory.stellar.org/#account-creator?network=test) for a disposable Testnet account.

For real Testnet XLM quest rewards, create a separate treasury account, fund it with Friendbot, then set its secret only in the Vercel environment:

```text
QUEST_REWARD_SECRET=S...   # Testnet treasury only, never VITE_
```

`api/claim-quest.mjs` pays the selected quest’s configured amount (`0.50`, `0.75`, or `1.00 XLM`) and returns its transaction hash. It intentionally uses a tiny Testnet treasury and includes no claim-rate database; before placing material value in a treasury, enforce one-claim-per-wallet in a contract or durable backend store.

## Event streaming

After configuring the Vault contract ID, expose the relay as a small persistent Node service:

```powershell
$env:RAMEN_VAULT_CONTRACT_ID = 'C...'
$env:SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org'
npm run relay
```

Set `VITE_EVENT_STREAM_URL=http://localhost:8787/events` during local testing. The relay reads Vault events through Soroban RPC and broadcasts normalized Server-Sent Events to any connected dispatch screens. For production, run the same adapter in a persistent worker/container and use its public HTTPS URL.

## Deploy the web app

This repo is ready for Vercel:

1. Import the GitHub repository in Vercel.
2. Use build command `npm run build` and output directory `dist`.
3. Add every `VITE_…` setting required for your deployment.
4. Add `GEMINI_API_KEY` and optionally `GEMINI_MODEL=gemini-2.5-flash` as server-only environment values.
5. Deploy. The included `/api/suzume` server function protects the Gemini key; `vercel.json` supports client-side routes.

## CI/CD

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on pull requests and pushes to `main`:

1. Install locked Node dependencies.
2. Lint, test and build the frontend.
3. Test both contracts.
4. Compile deployable WASM binaries.

## Demo flow (90 seconds)

Follow [docs/demo-script.md](docs/demo-script.md) to record the video. It showcases the prologue, responsive route board, wallet/transaction states, live activity, cross-contract vault, test output, and CI workflow without any dead air.

## Submission handoff

Use [docs/submission-checklist.md](docs/submission-checklist.md) after you create the GitHub repository and deploy. It deliberately leaves the public URL, contract IDs, interaction hash, screenshots and video URL blank—those must be real, not invented.

## Project map

```text
src/                         React UI, Freighter flow, event hook and tests
contracts/ramen-vault/       Route state machine + delegated cross-contract mint
contracts/stamp-shelf/       Achievement stamp registry
api/suzume.mjs               Protected Gemini bridge for Vercel
api/claim-quest.mjs          Testnet-only side-quest XLM treasury function
scripts/deploy-testnet.ps1   Soroban compile/deploy/initialize workflow
scripts/event-relay.mjs      Soroban RPC → Server-Sent Events adapter
.github/workflows/ci.yml     Frontend and contract quality gates
```

## License

MIT
