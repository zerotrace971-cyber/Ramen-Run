import { Bell, BookOpen, CircleHelp, Command, Compass, ExternalLink, Gamepad2, Map, Menu, Radio, ScrollText, Trophy, Vault, WalletCards, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useApp } from '../App';
import { shortenAddress } from '../lib/format';
import { Brand } from './Brand';
import { StatusBadge } from './StatusBadge';
import { SuzumeChat } from './SuzumeChat';

const nav = [
  { to: '/game', label: 'Play ramen run', icon: Gamepad2 },
  { to: '/game/story', label: 'Comic story', icon: ScrollText },
  { to: '/story/manga', label: 'Manga archive', icon: BookOpen },
  { to: '/game/map', label: 'Stellar map', icon: Map },
  { to: '/game/quests', label: 'Side quests', icon: Trophy },
  { to: '/dashboard', label: 'Command center', icon: Command },
  { to: '/missions', label: 'Sponsor routes', icon: Compass },
  { to: '/vault', label: 'Stamp vault', icon: Vault },
  { to: '/dispatch', label: 'Live dispatch', icon: Radio },
];
export function AppShell() {
  const { wallet, connect, launchStory } = useApp(); const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);
  return <div className="app-layout">
    <aside className={`sidebar ${menuOpen ? 'mobile-open' : ''}`}><div className="sidebar-top"><Brand /><button className="mobile-close" onClick={close}><X size={20} /></button></div>
      <nav>{nav.map(item => <NavLink key={item.to} to={item.to} onClick={close} className={({ isActive }) => isActive ? 'active' : ''}><item.icon size={18} />{item.label}</NavLink>)}</nav>
      <button className="story-replay" onClick={() => { close(); launchStory(); }}><Gamepad2 size={18} /> Replay prologue</button>
      <div className="sidebar-bottom"><p>NETWORK</p><StatusBadge>Testnet online</StatusBadge><a href="https://stellar.org" target="_blank" rel="noreferrer">Built on Stellar <ExternalLink size={13} /></a></div>
    </aside>
    {menuOpen && <button className="scrim" aria-label="Close navigation" onClick={close} />}
    <main><header className="topbar"><button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={21} /></button><div className="mobile-brand"><Brand /></div><div className="topbar-actions"><button className="icon-button notification" aria-label="Notifications"><Bell size={19} /><i /></button><button className="wallet-button" onClick={connect} disabled={wallet.isConnecting}>{wallet.isConnecting ? 'Warming warp drive…' : wallet.address ? <><WalletCards size={17} /> {shortenAddress(wallet.address)}</> : <><WalletCards size={17} /> Connect wallet</>}</button></div></header>
      {wallet.error && <div className="inline-error"><CircleHelp size={16} /> Wallet note: {wallet.error}</div>}
      {wallet.testnetHash && <div className="inline-success">✦ Freighter Testnet check-in confirmed <a href={`https://stellar.expert/explorer/testnet/tx/${wallet.testnetHash}`} target="_blank" rel="noreferrer">View transaction ↗</a></div>}
      <div className="page-container"><Outlet /></div>
    </main><SuzumeChat />
  </div>;
}
