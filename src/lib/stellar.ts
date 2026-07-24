import { signTransaction } from '@stellar/freighter-api';
import { Address, Asset, Contract, Horizon, Memo, Networks, Operation, TransactionBuilder, nativeToScVal, rpc } from '@stellar/stellar-sdk';
import { config, isDemoMode } from './config';

const sleep = (milliseconds: number) => new Promise(resolve => window.setTimeout(resolve, milliseconds));
const networkPassphrase = config.network === 'PUBLIC' ? Networks.PUBLIC : Networks.TESTNET;
const horizonUrl = config.network === 'PUBLIC' ? 'https://horizon.stellar.org' : 'https://horizon-testnet.stellar.org';

export type FundRouteResult = { hash: string; demo: boolean };
export type QuestRewardResult = { hash: string; amount: string; paid: boolean; message: string };

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
    return await submitTestnetReceipt(address, 'SUZUME-CHECKIN');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Testnet check-in failed.';
    if (/not found|does not exist|account/i.test(message)) {
      throw new Error('This Freighter address is not funded on Stellar Testnet yet. Fund it with Friendbot, then connect again.');
    }
    throw error;
  }
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
      return { hash: body.hash, amount: body.amount, paid: true, message: 'Testnet XLM bounty sent from the Suzume treasury.' };
    }
    throw new Error(typeof body.error === 'string' ? body.error : 'The quest treasury is not configured.');
  } catch (error) {
    const hash = await submitTestnetReceipt(address, `QUEST-${questId.toUpperCase()}`);
    const message = error instanceof Error ? error.message : 'Treasury unavailable.';
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
  return { hash: submitted.hash, demo: false };
}
