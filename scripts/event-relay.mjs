/**
 * Local/event-hosting adapter: polls Soroban events and broadcasts Server-Sent Events.
 * Run: node scripts/event-relay.mjs (after setting VITE_RAMEN_VAULT_CONTRACT_ID in .env)
 */
import { createServer } from 'node:http';
import { rpc } from '@stellar/stellar-sdk';

const port = Number(process.env.EVENT_RELAY_PORT || 8787);
const rpcUrl = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const contractId = process.env.RAMEN_VAULT_CONTRACT_ID;
const clients = new Set();
let cursor;
let startLedger;

if (!contractId) throw new Error('Set RAMEN_VAULT_CONTRACT_ID before running the relay.');
createServer((request, response) => {
  if (request.url !== '/events') return response.writeHead(404).end();
  response.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive', 'access-control-allow-origin': '*' });
  response.write(': Suzume dispatch relay connected\n\n');
  clients.add(response); request.on('close', () => clients.delete(response));
}).listen(port, () => console.log(`Dispatch relay listening at http://localhost:${port}/events`));

const server = new rpc.Server(rpcUrl);
setInterval(async () => {
  try {
    if (!startLedger) startLedger = (await server.getLatestLedger()).sequence;
    const page = await server.getEvents({ startLedger, filters: [{ type: 'contract', contractIds: [contractId] }], limit: 25, cursor });
    cursor = page.cursor;
    for (const event of page.events || []) {
      const payload = JSON.stringify({ id: event.id, actor: 'ON-CHAIN', action: 'emitted a Vault route event', time: 'just now', emoji: '🍜' });
      for (const client of clients) client.write(`data: ${payload}\n\n`);
    }
  } catch (error) { console.error('Event relay poll failed', error.message); }
}, 4000);
