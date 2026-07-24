name: Deploy Stellar Contracts and Refresh Vercel

on:
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: ramen-run-stellar-testnet
  cancel-in-progress: false

jobs:
  deploy-testnet:
    name: Deploy contracts to Stellar Testnet
    runs-on: ubuntu-latest
    environment: stellar-testnet
    env:
      VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
      VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: wasm32v1-none

      - name: Cache Rust build files
        uses: Swatinem/rust-cache@v2

      - name: Test contracts before deployment
        run: cargo test --workspace

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install frontend dependencies
        run: npm ci

      - name: Install Stellar CLI
        shell: bash
        run: |
          curl -fsSL https://github.com/stellar/stellar-cli/raw/main/install.sh | sh
          echo "$HOME/.local/bin" >> "$GITHUB_PATH"

      - name: Verify Stellar CLI
        run: stellar --version

      - name: Derive Testnet deployer address
        shell: bash
        env:
          STELLAR_TESTNET_SECRET_KEY: ${{ secrets.STELLAR_TESTNET_SECRET_KEY }}
        run: |
          test -n "$STELLAR_TESTNET_SECRET_KEY"
          admin_address=$(node --input-type=module -e "import { Keypair } from '@stellar/stellar-sdk'; console.log(Keypair.fromSecret(process.env.STELLAR_TESTNET_SECRET_KEY).publicKey())")
          echo "STELLAR_DEPLOY_ADMIN=$admin_address" >> "$GITHUB_ENV"

      - name: Deploy and initialize contracts
        id: contracts
        shell: pwsh
        env:
          STELLAR_DEPLOY_SOURCE: ${{ secrets.STELLAR_TESTNET_SECRET_KEY }}
        run: ./scripts/deploy-testnet.ps1

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Update production contract IDs in Vercel
        shell: bash
        env:
          RAMEN_VAULT_ID: ${{ steps.contracts.outputs.ramen_vault_id }}
          STAMP_SHELF_ID: ${{ steps.contracts.outputs.stamp_shelf_id }}
        run: |
          vercel env rm VITE_RAMEN_VAULT_CONTRACT_ID production --yes --token="${{ secrets.VERCEL_TOKEN }}" || true
          printf '%s\n' "$RAMEN_VAULT_ID" | vercel env add VITE_RAMEN_VAULT_CONTRACT_ID production --token="${{ secrets.VERCEL_TOKEN }}"

          vercel env rm VITE_STAMP_NFT_CONTRACT_ID production --yes --token="${{ secrets.VERCEL_TOKEN }}" || true
          printf '%s\n' "$STAMP_SHELF_ID" | vercel env add VITE_STAMP_NFT_CONTRACT_ID production --token="${{ secrets.VERCEL_TOKEN }}"

      - name: Pull updated Vercel production configuration
        run: vercel pull --yes --environment=production --token="${{ secrets.VERCEL_TOKEN }}"

      - name: Build with the new contract IDs
        run: vercel build --prod --token="${{ secrets.VERCEL_TOKEN }}"

      - name: Deploy refreshed production app
        id: deploy
        shell: bash
        run: |
          deployment_url=$(vercel deploy --prebuilt --prod --token="${{ secrets.VERCEL_TOKEN }}")
          echo "url=$deployment_url" >> "$GITHUB_OUTPUT"

      - name: Write deployment summary
        shell: bash
        env:
          RAMEN_VAULT_ID: ${{ steps.contracts.outputs.ramen_vault_id }}
          STAMP_SHELF_ID: ${{ steps.contracts.outputs.stamp_shelf_id }}
          DEPLOYMENT_URL: ${{ steps.deploy.outputs.url }}
        run: |
          {
            echo "## Ramen Run deployment"
            echo
            echo "- Ramen Vault: \`$RAMEN_VAULT_ID\`"
            echo "- Stamp Shelf: \`$STAMP_SHELF_ID\`"
            echo "- Vercel: $DEPLOYMENT_URL"
          } >> "$GITHUB_STEP_SUMMARY"
