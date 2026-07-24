import { CheckCircle2, CircleAlert, LoaderCircle, Rocket, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../App';
import { StatusBadge } from '../components/StatusBadge';
import { config, isDemoMode } from '../lib/config';
import { missions } from '../lib/mission-data';
import type { Mission } from '../lib/types';

type Receipt = { title: string; hash: string; demo: boolean } | null;
export function MissionsPage() {
  const { wallet, connect } = useApp(); const [pending, setPending] = useState<number | null>(null); const [receipt, setReceipt] = useState<Receipt>(null); const [error, setError] = useState<string | null>(null);
  const sponsor = async (mission: Mission) => {
    if (!wallet.address) { await connect(); return; }
    setPending(mission.id); setError(null); setReceipt(null);
    try {
      // The Stellar SDK is loaded only when a real route is sponsored, keeping the arcade UI fast.
      const { fundRoute } = await import('../lib/stellar');
      const result = await fundRoute(wallet.address, mission.id, mission.reward);
      setReceipt({ title: mission.title, ...result });
    }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'The kitchen lost your receipt. Please try again.'); }
    finally { setPending(null); }
  };
  return <><section className="page-title"><div><p>THE KITCHEN NEEDS YOU</p><h1>Route board <span>🗺️</span></h1><small>Each route sponsorship invokes the Vault. Completed routes earn a collectible Stellar Stamp.</small></div><StatusBadge tone="gold">{isDemoMode ? 'Demo transactions' : 'On-chain ready'}</StatusBadge></section>
    {receipt && <div className="transaction-card success"><CheckCircle2 size={23} /><div><b>{receipt.title} is funded!</b><p>{receipt.demo ? 'Demo receipt generated — add contract IDs for a real Soroban hash.' : `Transaction ${receipt.hash}`}</p></div><button onClick={() => setReceipt(null)}>Dismiss</button></div>}
    {error && <div className="transaction-card error"><CircleAlert size={23} /><div><b>Route not funded</b><p>{error}</p></div><button onClick={() => setError(null)}>Dismiss</button></div>}
    <section className="mission-grid">{missions.map(mission => <article className={`mission-card ${mission.status}`} key={mission.id}><div className="mission-card-top"><span className="mission-emoji">{mission.icon}</span><StatusBadge tone={mission.risk === 'chill' ? 'cyan' : mission.risk === 'spicy' ? 'pink' : 'gold'}>{mission.risk} route</StatusBadge></div><p>{mission.district}</p><h2>{mission.title}</h2><span className="flavor-tag">{mission.flavor}</span><div className="mission-description">{mission.description}</div><div className="mission-meta"><span>Reward <b>{mission.reward} XLM</b></span><span>ETA <b>{mission.eta}</b></span></div><button className="button primary mission-action" disabled={mission.status !== 'ready' || pending !== null} onClick={() => sponsor(mission)}>{pending === mission.id ? <><LoaderCircle className="spin" size={17} /> Signing route…</> : mission.status === 'cooldown' ? 'Rank up to unlock' : wallet.address ? <><Sparkles size={17} /> Sponsor route</> : <><Rocket size={17} /> Connect to sponsor</>}</button></article>)}</section>
    <section className="contract-strip"><div><p>CONTRACT WIRING</p><b>Vault → Stamp Shelf</b><span>Route completion calls the NFT contract to mint your permanent achievement.</span></div><code>{config.vaultContract ? `${config.vaultContract.slice(0, 16)}…` : 'Awaiting testnet deployment'}</code></section>
  </>;
}
