import { Asset, Horizon, Keypair, Memo, Networks, Operation, TransactionBuilder } from '@stellar/stellar-sdk';

const horizon = new Horizon.Server('https://horizon-testnet.stellar.org');

/**
 * Testnet-only delivery bounty endpoint. It intentionally requires an explicit client
 * claim after a completed run. Add durable account/claim tracking before using this
 * pattern for anything with production value.
 */
export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'POST only' });
  const address = typeof request.body?.address === 'string' ? request.body.address.trim() : '';
  const score = Number(request.body?.score);
  const distance = Number(request.body?.distance);
  const ramen = Number(request.body?.ramen);
  const amount = process.env.JETPACK_REWARD_XLM ?? '0.35';
  if (!process.env.JETPACK_REWARD_SECRET) return response.status(503).json({ error: 'Jetpack reward treasury is not configured yet.' });
  if (!Number.isFinite(score) || !Number.isFinite(distance) || !Number.isFinite(ramen) || score < 250 || distance < 1200) {
    return response.status(400).json({ error: 'A completed Route 07 delivery is required before claiming the bounty.' });
  }

  try {
    Keypair.fromPublicKey(address);
    const treasury = Keypair.fromSecret(process.env.JETPACK_REWARD_SECRET);
    const account = await horizon.loadAccount(treasury.publicKey());
    const transaction = new TransactionBuilder(account, { fee: '100', networkPassphrase: Networks.TESTNET })
      .addOperation(Operation.payment({ destination: address, asset: Asset.native(), amount }))
      .addMemo(Memo.text('SZ-RAMEN-ROUTE-07'))
      .setTimeout(90)
      .build();
    transaction.sign(treasury);
    const submitted = await horizon.submitTransaction(transaction);
    return response.status(200).json({ hash: submitted.hash, amount: `${amount} XLM` });
  } catch (error) {
    console.error('Jetpack reward transfer failed', error);
    return response.status(502).json({ error: 'The Testnet delivery bounty could not be sent. Check the treasury balance and try again.' });
  }
}
