import { Activity, ArrowUpRight, CircleCheck, Clock3, Coins, Rocket, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { useMissionStream } from '../hooks/useMissionStream';

export function DashboardPage() {
  const { events, isLive } = useMissionStream();
  return <><section className="page-title"><div><p>WELCOME BACK, STAR COURIER</p><h1>Command center <span>✦</span></h1></div><Link to="/missions" className="button primary">Fund a route <Rocket size={17} /></Link></section>
    <section className="metrics"><Metric icon={<Coins />} label="XLM sponsored" value="1,248" delta="+18% this week" /><Metric icon={<Trophy />} label="Stamps collected" value="08" delta="2 rare editions" /><Metric icon={<CircleCheck />} label="Routes completed" value="23" delta="96% clean landings" /><Metric icon={<Clock3 />} label="Active streak" value="6 days" delta="Personal best: 9" /></section>
    <section className="dashboard-grid"><article className="panel route-progress"><div className="panel-title"><div><p>ACTIVE DELIVERY</p><h2>Meteor Miso <span>☄️</span></h2></div><StatusBadge tone="pink">In warp</StatusBadge></div><div className="route-line"><i /><i /><i /><i className="active" /><i /></div><div className="route-stops"><span>Nebula Kitchen</span><span>Moonbean Market</span></div><div className="route-countdown"><b>01:42</b><span>until arrival</span><button className="text-button">Track route <ArrowUpRight size={15} /></button></div></article>
      <article className="panel rank-panel"><div className="panel-title"><div><p>COURIER RANK</p><h2>Level 02 — Broth Scout</h2></div><span className="rank-icon">🥢</span></div><div className="rank-meter"><span style={{ width: '64%' }} /></div><p><b>640 / 1,000</b> noodle points to unlock Comet Creamy Tonkotsu.</p><Link to="/vault" className="text-button">View stamp vault <ArrowUpRight size={15} /></Link></article>
      <article className="panel activity-panel"><div className="panel-title"><div><p><Activity size={13} /> REAL-TIME DISPATCH</p><h2>Kitchen activity</h2></div><StatusBadge tone={isLive ? 'cyan' : 'muted'}>{isLive ? 'Live' : 'Reconnecting'}</StatusBadge></div><div className="activity-list">{events.slice(0, 4).map(event => <div key={event.id}><span>{event.emoji}</span><p><b>{event.actor}</b> {event.action}<small>{event.amount && `${event.amount} · `}{event.time}</small></p></div>)}</div><Link to="/dispatch" className="text-button">Open live dispatch <ArrowUpRight size={15} /></Link></article>
    </section></>;
}
function Metric({ icon, label, value, delta }: { icon: React.ReactNode; label: string; value: string; delta: string }) { return <article className="metric"><span>{icon}</span><div><p>{label}</p><h2>{value}</h2><small>{delta}</small></div></article>; }
