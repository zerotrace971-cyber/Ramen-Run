import { BadgeCheck, Download, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { useApp } from '../App';
import { shortenAddress } from '../lib/format';

const stamps = [
  { name: 'Meteor Miso', date: 'Jul 19, 2026', emoji: '☄️', rarity: 'uncommon', serial: '#0042' },
  { name: 'Aurora Shoyu', date: 'Jul 16, 2026', emoji: '🌌', rarity: 'rare', serial: '#0008' },
  { name: 'Neon Nori', date: 'Jul 14, 2026', emoji: '✨', rarity: 'common', serial: '#0191' },
  { name: 'Moonbean Menma', date: 'Jul 08, 2026', emoji: '🌙', rarity: 'uncommon', serial: '#0036' },
];

export function VaultPage() {
  const { wallet, connect } = useApp();
  return <><section className="page-title"><div><p>YOUR ON-CHAIN SHELF</p><h1>Stamp vault <span>🎟️</span></h1><small>Every stamp is a contract-minted memento of a delivered route.</small></div><button className="button ghost" onClick={wallet.address ? undefined : connect}><LockKeyhole size={17} /> {wallet.address ? shortenAddress(wallet.address) : 'Connect wallet'}</button></section>
    <section className="vault-hero"><div><div className="vault-shine"><Sparkles size={28} /></div><p>COLLECTION COMPLETION</p><h2>08 <span>/ 24 stamps</span></h2><div className="collection-meter"><span style={{ width: '33%' }} /></div><small>Collect four more to reveal the legendary Tonkotsu Comet.</small></div><div className="vault-hero-fact"><BadgeCheck size={20} /><p><b>Inter-contract verified</b><span>The Vault only asks the Stamp Shelf to mint after a completed delivery.</span></p></div></section>
    <section className="stamp-grid">{stamps.map(stamp => <article className={`stamp ${stamp.rarity}`} key={stamp.serial}><div className="stamp-punch">{stamp.emoji}</div><div className="stamp-copy"><p>{stamp.rarity} • {stamp.serial}</p><h2>{stamp.name}</h2><small>Delivered {stamp.date}</small></div><button aria-label={`View ${stamp.name}`}><Download size={16} /></button></article>)}</section>
    <section className="security-card"><ShieldCheck size={23} /><div><b>Your stamps are yours.</b><p>The vault is a read-only view of the Stamp Shelf contract. No custodial account, no hidden transfer rights.</p></div></section>
  </>;
}
