import { Activity, Eye, KeyRound, LogIn, RefreshCw, ShieldCheck, WalletCards } from 'lucide-react';
import { type FormEvent, type ReactNode, useCallback, useState } from 'react';
import { type AdminTelemetrySnapshot, getAdminTelemetry } from '../lib/telemetry';

const sessionKey = 'suzume-admin-session-token';
const eventNames: Record<string, string> = {
  wallet_login: 'Freighter login', route_funded: 'Route funded', quest_reward: 'Quest bounty', quest_receipt: 'Quest receipt', jetpack_shop: 'Jetpack shop', jetpack_reward: 'Route 07 bounty', jetpack_receipt: 'Completion receipt',
};
const shorten = (value: string, head = 8, tail = 6) => `${value.slice(0, head)}...${value.slice(-tail)}`;
const formatTime = (value: string) => {
  const d = new Date(value);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}`;
};

export function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem(sessionKey) ?? '');
  const [snapshot, setSnapshot] = useState<AdminTelemetrySnapshot | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (nextToken = token) => {
    if (!nextToken) return;
    setLoading(true); setError('');
    try {
      const nextSnapshot = await getAdminTelemetry(nextToken);
      sessionStorage.setItem(sessionKey, nextToken);
      setSnapshot(nextSnapshot);
    } catch (reason) {
      sessionStorage.removeItem(sessionKey); setSnapshot(null);
      setError(reason instanceof Error ? reason.message : 'Could not unlock the observatory.');
    } finally { setLoading(false); }
  }, [token]);

  const submit = (event: FormEvent) => { event.preventDefault(); void load(); };
  const lock = () => { sessionStorage.removeItem(sessionKey); setToken(''); setSnapshot(null); setError(''); };

  if (!snapshot) return <section className="admin-gate"><div className="admin-gate-comic">
    <p className="chapter-kicker"><KeyRound size={15} /> PRIVATE KITCHEN CHANNEL / KANRI</p>
    <h1>Admin observatory</h1>
    <p>Read the verified Testnet trail: returning wallets, Freighter check-ins, rewards, and their receipts.</p>
    <form className="admin-key-row" onSubmit={submit}>
      <input value={token} onChange={event => setToken(event.target.value)} type="password" placeholder="Admin access token" aria-label="Admin access token" autoComplete="current-password" />
      <button disabled={!token || loading}>{loading ? <RefreshCw className="spin" size={17} /> : <LogIn size={17} />}{loading ? 'Opening...' : 'Open observatory'}</button>
    </form>
    {error && <div className="admin-error">{error}</div>}
    <p className="admin-gate-note"><ShieldCheck size={15} /> Token remains in this browser session only.</p>
  </div></section>;

  return <main className="admin-page">
    <header><div><p><Eye size={14} /> PRIVATE KITCHEN CHANNEL / KANRI</p><h1>Admin observatory <span>HOSHI</span></h1></div><div><div className="admin-actions"><button onClick={() => void load()} disabled={loading}>{loading ? <RefreshCw className="spin" size={16} /> : <RefreshCw size={16} />} Refresh</button><button onClick={lock}><KeyRound size={16} /> Lock</button></div><span>Verified Stellar Testnet receipts only</span></div></header>
    <section className="admin-metrics">
      <Metric icon={<WalletCards />} label="Unique wallet users" value={snapshot.uniqueWallets} note="distinct verified Freighter wallets" />
      <Metric icon={<LogIn />} label="Verified logins" value={snapshot.loginEvents} note="SUZUME-CHECKIN receipts" />
      <Metric icon={<Activity />} label="Tracked transactions" value={snapshot.transactionCount} note="latest 90-day event window" />
      <Metric icon={<ShieldCheck />} label="Observatory security" value="Locked" note="server token verified" />
    </section>
    <section className="admin-ledger"><header><div><p>RECENT VERIFIED RECEIPTS</p><h2>Transaction ledger</h2></div><span>Updated {formatTime(snapshot.generatedAt)}</span></header>
      {snapshot.events.length ? <div className="admin-table"><div className="admin-table-head"><span>Event</span><span>Wallet</span><span>Transaction</span><span>Recorded</span></div>{snapshot.events.map(event => <article key={event.hash}>
        <div data-label="Event"><b>{eventNames[event.kind] ?? event.kind}</b><small>{event.label}{event.amount ? ` / ${event.amount}` : ''}</small></div>
        <code data-label="Wallet" title={event.wallet}>{shorten(event.wallet)}</code>
        <a data-label="Transaction" href={`https://stellar.expert/explorer/testnet/tx/${event.hash}`} target="_blank" rel="noreferrer" title={event.hash}>{shorten(event.hash, 12, 9)} ↗</a>
        <time data-label="Recorded" dateTime={event.createdAt}>{formatTime(event.createdAt)}</time>
      </article>)}</div> : <div className="admin-empty"><div><Activity size={23} /><b>No verified activity has arrived yet.</b><p>Connect a Testnet Freighter wallet or complete a tracked transaction, then refresh.</p></div></div>}
    </section>
  </main>;
}

function Metric({ icon, label, value, note }: { icon: ReactNode; label: string; value: number | string; note: string }) {
  return <article className="admin-metric"><i>{icon}</i><span>{label}</span><b>{value}</b><small>{note}</small></article>;
}
