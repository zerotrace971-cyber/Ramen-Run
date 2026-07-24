import { Bot, Code2, Copy, KeyRound, MonitorCog, Palette, Save } from 'lucide-react';
import { useState } from 'react';
import { config } from '../lib/config';

export function SettingsPage() {
  const [copied, setCopied] = useState(false); const [saved, setSaved] = useState(false);
  const copy = async () => { await navigator.clipboard.writeText(config.rpcUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1600); };
  return <><section className="page-title"><div><p>COCKPIT PREFERENCES</p><h1>Settings <span>⚙️</span></h1><small>Environment-sensitive settings are read from deployment variables; this screen documents what the app is using.</small></div></section>
    <section className="settings-list"><article><span><MonitorCog /></span><div><p>Stellar network</p><b>{config.network}</b><small>RPC: {config.rpcUrl}</small></div><button className="icon-button" onClick={copy} aria-label="Copy RPC URL"><Copy size={17} /></button>{copied && <em>Copied</em>}</article><article><span><Code2 /></span><div><p>Contract configuration</p><b>{config.vaultContract ? 'Vault contract wired' : 'Demo mode'}</b><small>Set VITE_RAMEN_VAULT_CONTRACT_ID and VITE_STAMP_NFT_CONTRACT_ID for live calls.</small></div></article><article><span><Bot /></span><div><p>Suzume AI concierge</p><b>{config.suzumeProxy === '/api/suzume' ? 'Local fallback enabled' : 'Gemini proxy configured'}</b><small>Gemini runs behind a server endpoint; browser code never receives the API key.</small></div></article><article><span><Palette /></span><div><p>Comic interface</p><b>Midnight Miso theme</b><small>Respects your system reduced-motion preference.</small></div></article></section>
    <section className="settings-footer"><KeyRound size={20} /><p>Secrets belong in your hosting provider, never in a <code>VITE_</code> variable.</p><button className="button primary" onClick={() => setSaved(true)}><Save size={17} /> {saved ? 'Preferences saved' : 'Save preferences'}</button></section>
  </>;
}
