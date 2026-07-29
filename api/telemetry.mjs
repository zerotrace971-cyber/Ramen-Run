import { timingSafeEqual } from 'node:crypto';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const EVENT_SET = 'suzume:observatory:events';
const WALLET_SET = 'suzume:observatory:wallets';
const LOGIN_SET = 'suzume:observatory:logins';
const EVENT_PREFIX = 'suzume:observatory:event:';
const EVENT_TTL_SECONDS = 60 * 60 * 24 * 90;
const kinds = new Set(['wallet_login', 'route_funded', 'quest_reward', 'quest_receipt', 'jetpack_shop', 'jetpack_reward', 'jetpack_receipt']);

function readBody(body) { if (typeof body === 'string') { try { return JSON.parse(body); } catch { return {}; } } return body && typeof body === 'object' ? body : {}; }
function isConfigured() { return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN); }
function adminTokenIsValid(request) {
  const expected = process.env.ADMIN_DASHBOARD_TOKEN;
  const received = request.headers['x-admin-token'] || request.headers.authorization?.replace(/^Bearer\s+/i, '');
  return Boolean(expected && typeof received === 'string' && received.length === expected.length && timingSafeEqual(Buffer.from(received), Buffer.from(expected)));
}
async function redisPipeline(commands) {
  const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/pipeline`, { method: 'POST', headers: { authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`, 'content-type': 'application/json' }, body: JSON.stringify(commands) });
  if (!response.ok) throw new Error(`Redis returned ${response.status}`);
  return (await response.json()).map(item => item.result);
}
async function verifyTransaction({ kind, wallet, hash }) {
  const response = await fetch(`${HORIZON_URL}/transactions/${encodeURIComponent(hash)}`);
  if (!response.ok) throw new Error('That Testnet transaction is not available on Horizon yet.');
  const transaction = await response.json(); const memo = transaction.memo ?? '';
  if (kind === 'wallet_login' && (transaction.source_account !== wallet || memo !== 'SUZUME-CHECKIN')) throw new Error('Wallet login receipt did not match its Freighter check-in.');
  if (kind === 'route_funded' && transaction.source_account !== wallet) throw new Error('Route funding receipt did not match its Freighter wallet.');
  if (kind === 'jetpack_shop' && (transaction.source_account !== wallet || !memo.startsWith('SZ-') || !memo.endsWith('-SHOP'))) throw new Error('Jetpack shop receipt did not match its Testnet payment.');
  if (kind === 'quest_reward' && !memo.startsWith('SZ-QUEST-')) throw new Error('Quest reward receipt did not match a Suzume bounty.');
  if (kind === 'quest_receipt' && (transaction.source_account !== wallet || !memo.startsWith('QUEST-'))) throw new Error('Quest completion receipt did not match its Freighter wallet.');
  if (kind === 'jetpack_reward' && memo !== 'SZ-RAMEN-ROUTE-07') throw new Error('Jetpack bounty receipt did not match Route 07.');
  if (kind === 'jetpack_receipt' && (transaction.source_account !== wallet || memo !== 'JETPACK-ROUTE-07')) throw new Error('Jetpack completion receipt did not match its courier.');
}
async function recordEvent(request, response) {
  const body = readBody(request.body); const kind = typeof body.kind === 'string' ? body.kind : ''; const wallet = typeof body.wallet === 'string' ? body.wallet.trim() : ''; const hash = typeof body.hash === 'string' ? body.hash.trim() : ''; const label = typeof body.label === 'string' ? body.label.trim().slice(0, 90) : ''; const amount = typeof body.amount === 'string' ? body.amount.trim().slice(0, 30) : undefined;
  if (!kinds.has(kind) || !/^G[A-Z2-7]{55}$/.test(wallet) || !/^[a-f0-9]{64}$/i.test(hash) || !label) return response.status(400).json({ error: 'Invalid telemetry event.' });
  if (!isConfigured()) return response.status(202).json({ stored: false, message: 'Telemetry storage is not configured yet.' });
  try {
    await verifyTransaction({ kind, wallet, hash }); const timestamp = Date.now(); const event = { kind, wallet, hash, label, ...(amount ? { amount } : {}), createdAt: new Date(timestamp).toISOString() };
    const commands = [['SET', `${EVENT_PREFIX}${hash}`, JSON.stringify(event), 'EX', String(EVENT_TTL_SECONDS)], ['ZADD', EVENT_SET, String(timestamp), hash], ['SADD', WALLET_SET, wallet], ['ZREMRANGEBYSCORE', EVENT_SET, '0', String(timestamp - EVENT_TTL_SECONDS * 1000)]];
    if (kind === 'wallet_login') commands.push(['ZADD', LOGIN_SET, String(timestamp), hash]);
    await redisPipeline(commands); return response.status(202).json({ stored: true });
  } catch (error) { console.warn('Telemetry event was not stored', error); return response.status(202).json({ stored: false }); }
}
async function getObservatory(request, response) {
  if (!adminTokenIsValid(request)) return response.status(401).json({ error: 'Admin authorization required.' });
  if (!isConfigured()) return response.status(503).json({ error: 'Telemetry storage is not configured. Add the Redis and admin environment variables in Vercel.' });
  try {
    const [uniqueWallets, loginEvents, transactionCount, hashes] = await redisPipeline([['SCARD', WALLET_SET], ['ZCARD', LOGIN_SET], ['ZCARD', EVENT_SET], ['ZREVRANGE', EVENT_SET, '0', '99']]);
    const values = hashes.length ? await redisPipeline([['MGET', ...hashes.map(hash => `${EVENT_PREFIX}${hash}`)]]) : [];
    const events = (values[0] ?? []).flatMap(value => { try { return value ? [JSON.parse(value)] : []; } catch { return []; } });
    return response.status(200).json({ uniqueWallets: Number(uniqueWallets ?? 0), loginEvents: Number(loginEvents ?? 0), transactionCount: Number(transactionCount ?? 0), generatedAt: new Date().toISOString(), events });
  } catch (error) { console.error('Admin telemetry query failed', error); return response.status(502).json({ error: 'The observatory could not read telemetry storage.' }); }
}
export default async function handler(request, response) { if (request.method === 'POST') return recordEvent(request, response); if (request.method === 'GET') return getObservatory(request, response); return response.status(405).json({ error: 'GET or POST only' }); }
