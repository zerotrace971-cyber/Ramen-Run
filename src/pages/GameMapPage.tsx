import { LockKeyhole, Play, Sparkles, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { levels } from '../game/data';
import { useGameProgress } from '../game/progress';

export function GameMapPage() {
  const { progress } = useGameProgress();
  return <div className="map-page"><header><div><p>ASTRAL DELIVERY ATLAS</p><h1>Pick a route, courier.</h1></div><div className="map-wallet"><span>🪙 {progress.coins}</span><span>✦ {progress.completedLevels.length}/4 routes</span></div></header><section className="star-map"><div className="map-orbit orbit-a" /><div className="map-orbit orbit-b" />{levels.map((level, index) => { const locked = level.id > progress.unlockedLevel; return <article key={level.id} className={`map-node ${level.accent} ${locked ? 'locked' : ''}`} style={{ '--node-x': `${14 + index * 25}%`, '--node-y': `${index % 2 ? 26 : 65}%` } as React.CSSProperties}><span className="node-number">0{level.id}</span><div className="node-icon">{locked ? <LockKeyhole size={24} /> : progress.completedLevels.includes(level.id) ? <Trophy size={25} /> : '🍜'}</div><p>{level.district}</p><h2>{level.title}</h2><small>{locked ? `Unlock after mission ${level.id - 1}` : level.subtitle}</small>{locked ? <button disabled>Route locked</button> : <Link to={`/game?level=${level.id}`}><Play size={14} fill="currentColor" /> Play route</Link>}</article>; })}</section><footer className="map-footer"><Link to="/game/quests"><Sparkles size={16} /> Meet characters and accept side quests</Link><Link to="/game/garage">Visit scooter garage →</Link></footer></div>;
}
