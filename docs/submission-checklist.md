# Submission checklist

Complete these after creating your public repository and deployment.

- [ ] Public GitHub repository: `https://github.com/...`
- [ ] Live demo: `https://...`
- [ ] Ramen Vault contract address: `C...`
- [ ] Stamp Shelf contract address: `C...`
- [ ] Real `fund_route` testnet transaction hash: `...`
- [ ] Screenshot: desktop command center
- [ ] Screenshot: mobile route board
- [ ] Screenshot: CI workflow passing
- [ ] Screenshot: `npm run test` and `cargo test --workspace` output
- [ ] Demo video (1–2 min): `https://...`

## Evidence to mention in the submission

1. Vault completion authorizes a constrained nested Stamp Shelf mint.
2. Three Rust contract tests cover the happy path, inter-contract mint, and invalid funding guard.
3. Five frontend assertions cover formatting, mission IDs and prologue content.
4. The frontend supports loading, error, demo, connected-wallet, mobile and 404 states.
5. The SSE relay provides the production path for real-time Soroban events.
