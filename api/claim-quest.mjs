import { Asset, Horizon, Keypair, Memo, Networks, Operation, TransactionBuilder } from '@stellar/stellar-sdk';

const rewards = { yori: '0.50', beam: '0.75', mika: '1.00', peep: '0.50' };
const horizon = new Horizon.Server('https://horizon-testnet.stellar.org');

/**
 * Testnet-only bounty dispenser. The key is server-only and must be funded separately.
 * Production deployments should add durable claim tracking (contract or database) before
 * funding a treasury with material value.
 */
export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'POST only' });
  const address = typeof request.body?.address === 'string' ? request.body.address.trim() : '';
  const questId = typeof request.body?.questId === 'string' ? request.body.questId.trim() : '';
  const amount = rewards[questId];
  if (!amount) return response.status(400).json({ error: 'Unknown quest reward.' });
  if (!process.env.QUEST_REWARD_SECRET) return response.status(503).json({ error: 'Quest treasury is not configured yet.' });

  try {
    Keypair.fromPublicKey(address);
    const treasury = Keypair.fromSecret(process.env.QUEST_REWARD_SECRET);
    const account = await horizon.loadAccount(treasury.publicKey());
    const transaction = new TransactionBuilder(account, { fee: '100', networkPassphrase: Networks.TESTNET })
      .addOperation(Operation.payment({ destination: address, asset: Asset.native(), amount }))
      .addMemo(Memo.text(`SZ-QUEST-${questId}`))
      .setTimeout(90)
      .build();
    transaction.sign(treasury);
    const submitted = await horizon.submitTransaction(transaction);
    return response.status(200).json({ hash: submitted.hash, amount: `${amount} XLM` });
  } catch (error) {
    console.error('Quest reward transfer failed', error);
    return response.status(502).json({ error: 'The Testnet bounty could not be sent. Check the treasury balance and try again.' });
  }
}
