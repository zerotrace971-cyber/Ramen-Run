$ErrorActionPreference = 'Stop'

if (-not $env:STELLAR_DEPLOY_SOURCE) { throw 'Set STELLAR_DEPLOY_SOURCE to your Stellar CLI identity name first.' }
if (-not (Get-Command stellar -ErrorAction SilentlyContinue)) { throw 'Install the Stellar CLI, then run this command again.' }

cargo build --release --target wasm32v1-none
$stampWasm = 'target/wasm32v1-none/release/stamp_shelf.wasm'
$vaultWasm = 'target/wasm32v1-none/release/ramen_vault.wasm'

$stampId = stellar contract deploy --wasm $stampWasm --source $env:STELLAR_DEPLOY_SOURCE --network testnet
$vaultId = stellar contract deploy --wasm $vaultWasm --source $env:STELLAR_DEPLOY_SOURCE --network testnet
$adminAddress = stellar keys address $env:STELLAR_DEPLOY_SOURCE

stellar contract invoke --id $stampId --source $env:STELLAR_DEPLOY_SOURCE --network testnet -- init --admin $adminAddress
stellar contract invoke --id $stampId --source $env:STELLAR_DEPLOY_SOURCE --network testnet -- set_minter --minter $vaultId
stellar contract invoke --id $vaultId --source $env:STELLAR_DEPLOY_SOURCE --network testnet -- init --admin $adminAddress --stamp_shelf $stampId

Write-Host "Stamp Shelf: $stampId"
Write-Host "Ramen Vault: $vaultId"
Write-Host 'Copy both values into .env, then restart Vite.'
