import { signTransaction } from '@stellar/freighter-api';
import { Address, Asset, Contract, Horizon, Keypair, Memo, Networks, Operation, TransactionBuilder, nativeToScVal, rpc } from '@stellar/stellar-sdk';
import { config, isDemoMode } from './config';
import { getJetpackPowerup, type JetpackPowerupId } from '../game/jetpack/powerups';
import { recordTelemetry } from './telemetry';

const sleep = (milliseconds: number) => new Promise(resolve => window.setTimeout(resolve, milliseconds));
const networkPassphrase = config.network === 'PUBLIC' ? Networks.PUBLIC : Networks.TESTNET;
const horizonUrl = config.network === 'PUBLIC' ? 'https://horizon.stellar.org' : 'https://horizon-testnet.stellar.org';

export type FundRouteResult = { hash: string; demo: boolean };
export type QuestRewardResult = { hash: string; amount: string; paid: boolean; message: string };
export type JetpackRewardResult = { hash: string; amount: string; message: string };
export type JetpackStorePurchase = { hash: string; amount: string; item: JetpackPowerupId };

const testnetHorizon = new Horizon.Server('https://horizon-testnet.stellar.org');

/**
 * Creates a tiny self-payment with a readable memo. This is deliberately Testnet-only
 * and gives Freighter users a real, inspectable wallet check-in transaction.
 */
async function submitTestnetReceipt(address: string, memo: string): Promise<string> {
  const account = await testnetHorizon.loadAccount(address);
  const transaction = new TransactionBuilder(account, { fee: '100', networkPassphrase: Networks.TESTNET })
    .addOperation(Operation.payment({ destination: address, asset: Asset.native(), amount: '0.00001' }))
    .addMemo(Memo.text(memo.slice(0, 28)))
    .setTimeout(60)
    .build();
  const signed = await signTransaction(transaction.toXDR(), { networkPassphrase: Networks.TESTNET });
  if (signed.error || !signed.signedTxXdr) throw new Error(signed.error ?? 'Freighter did not sign the Testnet transaction.');
  const submitted = await testnetHorizon.submitTransaction(TransactionBuilder.fromXDR(signed.signedTxXdr, Networks.TESTNET));
  return submitted.hash;
}

/** Opens Freighter a second time to sign a real, tiny Testnet check-in transaction. */
export async function createWalletHandshake(address: string): Promise<string> {
  try {
    const hash = await submitTestnetReceipt(address, 'SUZUME-CHECKIN');
    recordTelemetry({ kind: 'wallet_login', wallet: address, hash, label: 'Freighter Testnet check-in' });
    return hash;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Testnet check-in failed.';
    if (/not found|does not exist|account/i.test(message)) {
      throw new Error('This Freighter address is not funded on Stellar Testnet yet. Fund it with Friendbot, then connect again.');
    }
    throw error;
  }
}

/**
 * A player-triggered Testnet completion receipt for the Jetpack arcade route.
 * This is intentionally a tiny self-payment, not a game reward or XLM payout.
 */
export async function claimJetpackCompletionReceipt(address: string): Promise<string> {
  try {
    const hash = await submitTestnetReceipt(address, 'JETPACK-ROUTE-07');
    recordTelemetry({ kind: 'jetpack_receipt', wallet: address, hash, label: 'Route 07 completion receipt' });
    return hash;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not create the Jetpack Testnet receipt.';
    if (/not found|does not exist|account/i.test(message)) {
      throw new Error('Fund this Freighter address on Stellar Testnet with Friendbot, then claim the receipt again.');
    }
    throw error;
  }
}

/**
 * Pays the configured public Testnet shop address via Freighter. The item itself is
 * stored in the player's local arcade inventory only after Horizon accepts this payment.
 */
export async function purchaseJetpackPowerup(address: string, item: JetpackPowerupId): Promise<JetpackStorePurchase> {
  if (config.network !== 'TESTNET') throw new Error('The Suzume supply shop is deliberately Testnet-only.');
  if (!config.jetpackStoreAddress) throw new Error('The Testnet shop address is not configured yet. Add VITE_JETPACK_STORE_ADDRESS first.');
  try { Keypair.fromPublicKey(config.jetpackStoreAddress); }
  catch { throw new Error('The configured Testnet shop address is not a valid Stellar public key.'); }
  if (address === config.jetpackStoreAddress) throw new Error('Connect a player wallet, not the shop wallet.');

  const powerup = getJetpackPowerup(item);
  try {
    const account = await testnetHorizon.loadAccount(address);
    const transaction = new TransactionBuilder(account, { fee: '100', networkPassphrase: Networks.TESTNET })
      .addOperation(Operation.payment({ destination: config.jetpackStoreAddress, asset: Asset.native(), amount: powerup.price }))
      .addMemo(Memo.text(`SZ-${item.toUpperCase()}-SHOP`))
      .setTimeout(90)
      .build();
    const signed = await signTransaction(transaction.toXDR(), { networkPassphrase: Networks.TESTNET });
    if (signed.error || !signed.signedTxXdr) throw new Error(signed.error ?? 'Freighter did not sign the shop purchase.');
    const submitted = await testnetHorizon.submitTransaction(TransactionBuilder.fromXDR(signed.signedTxXdr, Networks.TESTNET));
    recordTelemetry({ kind: 'jetpack_shop', wallet: address, hash: submitted.hash, label: powerup.name, amount: `${powerup.price} XLM` });
    return { hash: submitted.hash, amount: `${powerup.price} XLM`, item };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'The Testnet shop transaction could not be completed.';
    if (/not found|does not exist|account/i.test(message)) throw new Error('Fund this Freighter address on Stellar Testnet with Friendbot, then try the shop again.');
    throw error;
  }
}

/** A player-triggered request for the Testnet treasury bounty after a completed delivery. */
export async function claimJetpackDeliveryReward(address: string, run: { score: number; distance: number; ramen: number }): Promise<JetpackRewardResult> {
  if (config.network !== 'TESTNET') throw new Error('Jetpack delivery bounties are deliberately available on Testnet only.');
  const response = await fetch(config.jetpackRewardApi, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ address, score: run.score, distance: run.distance, ramen: run.ramen, claimId: crypto.randomUUID() }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || typeof body.hash !== 'string' || typeof body.amount !== 'string') {
    throw new Error(typeof body.error === 'string' ? body.error : 'The Jetpack Testnet treasury is not configured yet.');
  }
  recordTelemetry({ kind: 'jetpack_reward', wallet: address, hash: body.hash, label: 'Route 07 delivery bounty', amount: body.amount });
  return { hash: body.hash, amount: body.amount, message: 'Testnet XLM delivered from Suzume’s reward treasury.' };
}

/**
 * Requests a treasury-paid bounty first. If the server is not configured, a player can
 * still sign a real Testnet completion receipt; the UI never labels that fallback as XLM.
 */
export async function claimQuestReward(address: string, questId: string): Promise<QuestRewardResult> {
  try {
    const response = await fetch(config.questRewardApi, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ address, questId }) });
    const body = await response.json().catch(() => ({}));
    if (response.ok && typeof body.hash === 'string' && typeof body.amount === 'string') {
      recordTelemetry({ kind: 'quest_reward', wallet: address, hash: body.hash, label: `${questId} quest bounty`, amount: body.amount });
      return { hash: body.hash, amount: body.amount, paid: true, message: 'Testnet XLM bounty sent from the Suzume treasury.' };
    }
    throw new Error(typeof body.error === 'string' ? body.error : 'The quest treasury is not configured.');
  } catch (error) {
    const hash = await submitTestnetReceipt(address, `QUEST-${questId.toUpperCase()}`);
    const message = error instanceof Error ? error.message : 'Treasury unavailable.';
    recordTelemetry({ kind: 'quest_receipt', wallet: address, hash, label: `${questId} quest receipt`, amount: '0 XLM' });
    return { hash, amount: '0 XLM', paid: false, message: `${message} Your signed Testnet completion receipt was still recorded.` };
  }
}

/**
 * Builds, simulates, signs, and submits the Vault's `fund_route` invocation.
 * Demo mode deliberately returns a deterministic-looking receipt so the UI is usable
 * before the contract IDs are inserted into the deployed environment.
 */
export async function fundRoute(address: string, routeId: number, amount: number): Promise<FundRouteResult> {
  if (isDemoMode) {
    await sleep(1300);
    return { hash: `demo_${crypto.randomUUID().replaceAll('-', '').slice(0, 20)}`, demo: true };
  }
  const horizon = new Horizon.Server(horizonUrl);
  const account = await horizon.loadAccount(address);
  const contract = new Contract(config.vaultContract);
  const tx = new TransactionBuilder(account, { fee: '100000', networkPassphrase })
    .addOperation(contract.call('fund_route', new Address(address).toScVal(), nativeToScVal(routeId, { type: 'u32' }), nativeToScVal(amount * 10_000_000, { type: 'i128' })))
    .setTimeout(60)
    .build();
  const server = new rpc.Server(config.rpcUrl);
  const simulation = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simulation)) throw new Error(simulation.error);
  const prepared = await server.prepareTransaction(tx);
  const signed = await signTransaction(prepared.toXDR(), { networkPassphrase });
  if (signed.error || !signed.signedTxXdr) throw new Error(signed.error ?? 'Freighter did not sign the transaction.');
  const submitted = await server.sendTransaction(TransactionBuilder.fromXDR(signed.signedTxXdr, networkPassphrase));
  if (submitted.status === 'ERROR') throw new Error('Soroban rejected the transaction. Check the route and XLM amount.');
  recordTelemetry({ kind: 'route_funded', wallet: address, hash: submitted.hash, label: `Route ${routeId} funded`, amount: `${amount} XLM` });
  return { hash: submitted.hash, demo: false };
}
