import { Activity, Boxes, CircleDot, Radio, RefreshCw, Satellite, Zap } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { useMissionStream } from '../hooks/useMissionStream';

export function DispatchPage() {
  const { events, isLive } = useMissionStream();
  return <><section className="page-title"><div><p>EVENT STREAM OBSERVATORY</p><h1>Live dispatch <span>📡</span></h1><small>Contract events are normalized into a small server-sent event feed for a real-time route board.</small></div><StatusBadge tone={isLive ? 'cyan' : 'muted'}>{isLive ? 'Streaming now' : 'Reconnecting'}</StatusBadge></section>
    <section className="dispatch-layout"><article className="radar panel"><div className="panel-title"><div><p><Radio size={13} /> CITYWIDE RADAR</p><h2>Courier signal map</h2></div><Satellite size={25} /></div><div className="radar-field"><i className="radar-ring one" /><i className="radar-ring two" /><i className="radar-ring three" /><b className="radar-core">🍜</b><span className="route-pip p1" /><span className="route-pip p2" /><span className="route-pip p3" /><span className="route-pip p4" /><div className="radar-sweep" /></div><div className="radar-legend"><span><i className="pink-dot" /> In warp: 4</span><span><i className="cyan-dot" /> Delivered: 16</span><span><i className="gold-dot" /> Waiting: 2</span></div></article>
      <article className="panel event-console"><div className="panel-title"><div><p><Activity size={13} /> CONTRACT EVENT CONSOLE</p><h2>Latest emissions</h2></div><RefreshCw size={18} className={isLive ? 'spin-slow' : ''} /></div><div className="console-lines">{events.map(event => <div key={event.id}><span>{event.emoji}</span><p><b>{event.actor}</b> {event.action}<small>{event.amount || 'event'} · {event.time}</small></p><CircleDot size={15} /></div>)}</div></article>
    </section>
    <section className="pipeline"><PipelineStep icon={<Boxes />} label="Soroban contracts" caption="fund_route / complete_route" /><span>→</span><PipelineStep icon={<Zap />} label="Event relay" caption="SSE or websocket adapter" /><span>→</span><PipelineStep icon={<Radio />} label="This dashboard" caption="optimistic UI + live updates" /></section>
  </>;
}
function PipelineStep({ icon, label, caption }: { icon: React.ReactNode; label: string; caption: string }) { return <div><span>{icon}</span><b>{label}</b><small>{caption}</small></div>; }
