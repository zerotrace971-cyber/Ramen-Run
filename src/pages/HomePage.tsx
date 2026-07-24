import { ArrowRight, BookOpen, CirclePlay, Layers3, Radio, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../App';
import { isDemoMode } from '../lib/config';
import { StatusBadge } from '../components/StatusBadge';

export function HomePage() {
  const { launchStory } = useApp();
  return <div className="landing-page">
    <section className="hero"><div className="hero-copy"><div className="eyebrow"><Sparkles size={15} /> A STELLAR DELIVERY DAPP</div><h1>Fund noodles.<br /><em>Collect stardust.</em></h1><p>Suzume needs sponsors to restore the city’s midnight ramen routes. Back a mission, stream its progress, and receive an on-chain Stellar Stamp when it lands.</p><div className="hero-buttons"><button className="button primary" onClick={launchStory}>Start the story <CirclePlay size={18} /></button><Link className="button ghost" to="/how-it-works">Read the brief <BookOpen size={17} /></Link></div><div className="hero-trust"><StatusBadge tone="gold">Soroban-powered</StatusBadge><span>•</span><span>Non-custodial</span><span>•</span><span>Testnet ready</span></div></div><div className="hero-art"><img src="/assets/suzume-hero.png" alt="Suzume the ramen courier rides through a neon space city" /><div className="comic-sticker">NOODLE<br />NOVA!</div><div className="hero-stat"><span>Tonight’s routes</span><b>12,480</b><small>XLM in motion</small></div></div></section>
    <section className="ticker" aria-label="Live dApp status"><span>LIVE KITCHEN FEED</span><i /> <b>☄️ Meteor Miso just landed</b><i /> <b>✦ 28 new stamps minted</b><i /> <b>◉ Testnet network healthy</b></section>
    <section className="landing-section"><div className="section-heading"><p>HOW THE MAGIC COOKS</p><h2>One delivery, two contracts,<br />zero soggy receipts.</h2></div><div className="feature-grid"><Feature icon={<Layers3 />} title="Vault + Stamp Shelf" copy="The route Vault manages sponsorship and completion. It calls the Stamp Shelf contract to mint achievement records." /><Feature icon={<Radio />} title="Every slurp, streamed" copy="Dispatch events flow live to the dashboard, with a clean demo fallback if your event service is offline." /><Feature icon={<ShieldCheck />} title="Your keys stay yours" copy="Freighter signs your transaction locally. The dApp never asks for—or stores—a secret key." /></div></section>
    <section className="cta-band"><div><p>THE SHIFT STARTS NOW</p><h2>The night is young.<br />The broth is not.</h2></div><Link className="button inverted" to="/missions">Browse route board <ArrowRight size={18} /></Link></section>
    {isDemoMode && <p className="demo-note">Demo mode is on: add deployed contract IDs to <code>.env</code> to submit on-chain transactions.</p>}
  </div>;
}
function Feature({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) { return <article className="feature-card"><span>{icon}</span><h3>{title}</h3><p>{copy}</p></article>; }
