import { ArrowLeft, Heart, Pause, Play, RotateCcw, Sparkles, TimerReset, Volume2, VolumeX, WalletCards, Zap } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { levels, quests, type Quest, type QuestMode } from '../game/data';
import { useGameProgress } from '../game/progress';
import { useSound } from '../game/useSound';

type PickupType = 'star' | 'ramen' | 'rock' | 'cat' | 'laser' | 'nori' | 'pot' | 'comet' | 'rival' | 'lantern' | 'crumb' | 'storm';
type Pickup = { id: number; lane: number; x: number; type: PickupType };
type GameStatus = 'briefing' | 'running' | 'paused' | 'result';
type RewardState = { status: 'loading' | 'ready' | 'error'; hash?: string; amount?: string; paid?: boolean; message?: string };
const lanes = [18, 47, 76];

const hazards = new Set<PickupType>(['rock', 'laser', 'pot', 'rival', 'storm']);

function choosePickup(mode?: QuestMode): PickupType {
  const roll = Math.random();
  if (mode === 'cat-chase') return roll < .57 ? 'cat' : roll < .82 ? 'star' : 'laser';
  if (mode === 'nori-rush') return roll < .62 ? 'nori' : roll < .8 ? 'ramen' : 'pot';
  if (mode === 'shinkansen-drift') return roll < .58 ? 'comet' : roll < .76 ? 'star' : 'rival';
  if (mode === 'lantern-flight') return roll < .43 ? 'lantern' : roll < .74 ? 'crumb' : 'storm';
  return roll < .63 ? 'star' : roll < .82 ? 'rock' : 'ramen';
}

function pickupCopy(type: PickupType) {
  if (type === 'cat') return 'Cat drone rescued! Yori is typing fourteen grateful emojis.';
  if (type === 'nori') return 'Nori secured! Chef Beam has stopped screaming for one second.';
  if (type === 'comet') return 'Perfect drift spark! Mika pretends she is not impressed.';
  if (type === 'lantern') return 'Lantern caught! P.E.E.P. coos suspiciously.';
  if (type === 'crumb') return 'Shiny crumb acquired! Definitely normal bird business.';
  if (type === 'ramen') return 'Perfect ramen catch! Chef Beam is screaming with joy.';
  return 'Stardust secured! Keep the combo cooking!';
}

export function GamePage() {
  const navigation = useNavigate(); const location = useLocation(); const { wallet, connect } = useApp();
  const query = new URLSearchParams(location.search); const selected = Number(query.get('level') || 1); const questId = query.get('quest');
  const level = levels.find(item => item.id === selected) ?? levels[0]; const quest = quests.find(item => item.id === questId);
  const title = quest?.arcadeTitle ?? level.title; const district = quest?.character ?? level.district; const subtitle = quest?.arcadeSubtitle ?? level.subtitle;
  const target = quest?.target ?? level.target; const reward = quest ? 65 : level.reward; const difficulty = quest ? 2 : level.difficulty; const briefing = quest?.briefing ?? level.briefing;
  const objective = quest ? quest.arcadeSubtitle : `${target} stardust`; const stage = quest ? `/assets/${quest.stage}` : '/assets/neon-route-stage.png';
  const { progress, update } = useGameProgress(); const { soundOn, setSoundOn, play } = useSound();
  const [status, setStatus] = useState<GameStatus>('briefing'); const [lane, setLane] = useState(1); const [items, setItems] = useState<Pickup[]>([]);
  const [score, setScore] = useState(0); const [combo, setCombo] = useState(0); const [bestRunCombo, setBestRunCombo] = useState(0); const [specialCount, setSpecialCount] = useState(0); const [lives, setLives] = useState(3); const [remaining, setRemaining] = useState(42); const [dialogue, setDialogue] = useState(briefing); const [result, setResult] = useState<'win' | 'lose' | null>(null); const [boosting, setBoosting] = useState(false); const [completedQuest, setCompletedQuest] = useState<Quest | null>(null); const [rewardStates, setRewardStates] = useState<Record<string, RewardState>>({});
  const laneRef = useRef(1); const finished = useRef(false); const nextId = useRef(0);

  const goalReached = useCallback(() => {
    if (!quest) return score >= target;
    if (quest.mode === 'cat-chase') return specialCount >= 6;
    if (quest.mode === 'nori-rush') return specialCount >= 12;
    if (quest.mode === 'shinkansen-drift') return score >= target && lives === 3;
    return bestRunCombo >= 5;
  }, [bestRunCombo, lives, quest, score, specialCount, target]);

  const claim = useCallback(async (activeQuest: Quest) => {
    if (!wallet.address) { await connect(); return; }
    if (rewardStates[activeQuest.id]?.status === 'loading' || progress.questReceipts[activeQuest.id]) return;
    setRewardStates(current => ({ ...current, [activeQuest.id]: { status: 'loading' } }));
    try {
      const { claimQuestReward } = await import('../lib/stellar');
      const receipt = await claimQuestReward(wallet.address, activeQuest.id);
      setRewardStates(current => ({ ...current, [activeQuest.id]: { status: 'ready', ...receipt } }));
      update(current => ({ questReceipts: { ...current.questReceipts, [activeQuest.id]: { hash: receipt.hash, amount: receipt.amount, paid: receipt.paid } } }));
    } catch (error) {
      setRewardStates(current => ({ ...current, [activeQuest.id]: { status: 'error', message: error instanceof Error ? error.message : 'Could not create the Testnet reward receipt.' } }));
    }
  }, [connect, progress.questReceipts, rewardStates, update, wallet.address]);

  const move = useCallback((direction: -1 | 1) => { if (status !== 'running') return; setLane(current => { const next = Math.max(0, Math.min(2, current + direction)); laneRef.current = next; play('tap'); return next; }); }, [play, status]);
  const boost = useCallback(() => { if (status !== 'running') return; setBoosting(true); play('boost'); setDialogue(quest ? 'TURBO MODE! Somebody’s side quest just became a shōnen montage.' : 'TURBO RAMEN MODE! The scooter is legally a comet right now.'); window.setTimeout(() => setBoosting(false), 520); }, [play, quest, status]);

  const end = useCallback((won: boolean) => {
    if (finished.current) return; finished.current = true; setStatus('result'); setResult(won ? 'win' : 'lose'); play(won ? 'win' : 'hit');
    if (won) {
      const newQuest = quest && progress.acceptedQuests.includes(quest.id) && !progress.completedQuests.includes(quest.id) ? quest : null;
      setCompletedQuest(newQuest);
      update(current => {
        const nori = current.nori + (quest?.mode === 'nori-rush' ? specialCount : Math.floor(score / 15));
        const completed = new Set(current.completedLevels); if (!quest) completed.add(level.id);
        return {
          coins: current.coins + reward + (newQuest ? 65 : 0), highScore: Math.max(current.highScore, score), runs: current.runs + 1,
          unlockedLevel: quest ? current.unlockedLevel : Math.max(current.unlockedLevel, Math.min(4, level.id + 1)), completedLevels: [...completed], nori,
          perfectRuns: current.perfectRuns + (lives === 3 ? 1 : 0), bestCombo: Math.max(current.bestCombo, bestRunCombo),
          completedQuests: newQuest ? [...current.completedQuests, newQuest.id] : current.completedQuests,
        };
      });
    }
  }, [bestRunCombo, level.id, lives, play, progress.acceptedQuests, progress.completedQuests, quest, reward, score, specialCount, update]);

  const start = () => { finished.current = false; setItems([]); setScore(0); setCombo(0); setBestRunCombo(0); setSpecialCount(0); setLives(3); setRemaining(42); setLane(1); laneRef.current = 1; setDialogue(quest ? `${quest.character}: “Go! The quest timer has excellent dramatic lighting!”` : 'Go, go, go! Grab stardust ✦ and dodge the grumpy asteroids.'); setResult(null); setCompletedQuest(null); setStatus('running'); play('boost'); };

  useEffect(() => { if (status !== 'running') return; const key = (event: KeyboardEvent) => { if (event.key === 'ArrowUp' || event.key === 'w') move(-1); if (event.key === 'ArrowDown' || event.key === 's') move(1); if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); boost(); } }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key); }, [boost, move, status]);
  useEffect(() => { if (status !== 'running') return; const spawn = window.setInterval(() => setItems(current => [...current.slice(-13), { id: nextId.current++, lane: Math.floor(Math.random() * 3), x: 108, type: choosePickup(quest?.mode) }]), Math.max(390, 850 - difficulty * 105)); return () => window.clearInterval(spawn); }, [difficulty, quest?.mode, status]);
  useEffect(() => { if (status !== 'running') return; const moveLoop = window.setInterval(() => setItems(current => current.map(item => ({ ...item, x: item.x - (boosting ? 4.7 : 2.6 + difficulty * .18) })).filter(item => item.x > -8)), 100); return () => window.clearInterval(moveLoop); }, [boosting, difficulty, status]);
  useEffect(() => { if (status !== 'running') return; const clock = window.setInterval(() => setRemaining(current => { if (current <= 1) { window.setTimeout(() => end(goalReached()), 0); return 0; } return current - 1; }), 1000); return () => window.clearInterval(clock); }, [end, goalReached, status]);
  useEffect(() => { if (status !== 'running') return; const collisions = items.filter(item => item.x < 24 && item.x > 13 && item.lane === laneRef.current); if (!collisions.length) return; collisions.forEach(item => {
    setItems(current => current.filter(candidate => candidate.id !== item.id));
    if (hazards.has(item.type)) { setLives(current => { const next = current - 1; if (next <= 0) window.setTimeout(() => end(false), 0); return next; }); setCombo(0); setDialogue(quest?.mode === 'shinkansen-drift' ? 'SCRATCH! Mika is somehow laughing through the rain.' : 'BONK! That obstacle had absolutely no insurance. Switch lanes!'); play('hit'); }
    else { const bonus = item.type === 'ramen' ? 35 : item.type === 'cat' ? 30 : 15; setScore(current => current + bonus); setCombo(current => { const next = current + 1; setBestRunCombo(best => Math.max(best, next)); return next; }); if ((quest?.mode === 'cat-chase' && item.type === 'cat') || (quest?.mode === 'nori-rush' && item.type === 'nori')) setSpecialCount(current => current + 1); setDialogue(pickupCopy(item.type)); play('collect'); }
  }); }, [end, items, play, quest?.mode, status]);
  useEffect(() => { if (status === 'running' && goalReached()) end(true); }, [end, goalReached, status]);
  useEffect(() => { if (result === 'win' && completedQuest && wallet.address && !progress.questReceipts[completedQuest.id] && !rewardStates[completedQuest.id]) void claim(completedQuest); }, [claim, completedQuest, progress.questReceipts, result, rewardStates, wallet.address]);

  const storedReceipt = completedQuest ? progress.questReceipts[completedQuest.id] : undefined; const rewardState = completedQuest ? rewardStates[completedQuest.id] : undefined;
  return <div className="arcade-page"><header className="arcade-topbar"><Link to={quest ? '/game/quests' : '/game/map'}><ArrowLeft size={18} /> {quest ? 'Side quests' : 'Stellar map'}</Link><div className="arcade-title"><span>{quest ? 'CHARACTER ARCADE' : 'SUZUME’S RAMEN RUN'}</span><b>{title}</b></div><button onClick={() => setSoundOn(current => !current)} className="arcade-icon" aria-label="Toggle sounds">{soundOn ? <Volume2 size={19} /> : <VolumeX size={19} />}</button></header>
    <section className={`game-stage quest-stage ${quest ? `mode-${quest.mode}` : ''} ${boosting ? 'is-boosting' : ''}`} style={{ '--route-bg': `url('${stage}')` } as React.CSSProperties}>
      <div className="speed-lines" /><div className="game-hud"><div className="hud-box"><small>{quest ? 'QUEST GOAL' : 'STARDUST'}</small><b>{quest?.mode === 'cat-chase' || quest?.mode === 'nori-rush' ? specialCount : score}<em> / {quest?.mode === 'cat-chase' ? 6 : quest?.mode === 'nori-rush' ? 12 : target}</em></b></div><div className="hud-box combo"><small>{quest?.mode === 'lantern-flight' ? 'BEST CHAIN' : 'COMBO'}</small><b>x{quest?.mode === 'lantern-flight' ? bestRunCombo : combo}</b></div><div className="hud-box"><small>HEARTS</small><b className="hearts">{Array.from({ length: 3 }).map((_, index) => <Heart key={index} size={18} fill={index < lives ? 'currentColor' : 'none'} />)}</b></div><div className="hud-box time"><TimerReset size={16} /><b>00:{String(remaining).padStart(2, '0')}</b></div></div>
      <div className="mission-strip"><span>{quest ? `${quest.character.toUpperCase()} QUEST` : `MISSION ${level.id}`}</span><b>{district}</b><i /> {subtitle}</div><div className="lane-markers">{lanes.map((position, index) => <i key={index} style={{ top: `${position}%` }} />)}</div>
      {items.map(item => <span key={item.id} className={`game-item ${item.type}`} style={{ left: `${item.x}%`, top: `${lanes[item.lane]}%` }} aria-label={item.type} />)}
      <div className={`suzume-rider lane-${lane} ${boosting ? 'boosting' : ''}`}><span className="rider-portrait" /><i className="rider-scooter" aria-hidden="true" /><b>SUZUME</b></div><div className="comic-dialogue"><span className="comic-dialogue-mark" aria-hidden="true" /><p>{dialogue}</p></div>
      {status === 'briefing' && <div className="game-overlay"><div className="mission-card-comic"><span className="mission-tag">{quest ? 'SIDE QUEST ALERT' : 'DELIVERY ALERT'}</span><h1>{title}</h1><p>{briefing}</p><div className="objective-row"><span>✦ {objective}</span><span>☄️ {difficulty}x danger</span><span>🪙 +{reward} coins</span>{quest && <span>✦ {quest.xlmReward} Testnet bounty</span>}</div><button className="arcade-button" onClick={start}><Play size={18} fill="currentColor" /> Launch arcade</button><small>Move: ↑ ↓ or W S · Boost: spacebar · Mobile: use the controls below</small></div></div>}
      {status === 'paused' && <div className="game-overlay"><div className="mission-card-comic compact"><Pause size={31} /><h1>Kitchen break.</h1><p>The broth waits for no one, but it can wait thirty seconds.</p><button className="arcade-button" onClick={() => setStatus('running')}>Resume run</button></div></div>}
      {status === 'result' && <div className="game-overlay"><div className={`mission-card-comic result ${result}`}><span className="mission-tag">{result === 'win' ? (quest ? 'QUEST COMPLETE' : 'DELIVERY COMPLETE') : 'ROUTE INTERRUPTED'}</span><h1>{result === 'win' ? (quest ? 'Legendary side quest!' : 'Bowl delivered!') : 'The broth escaped.'}</h1><p>{result === 'win' ? (quest ? `You cleared ${quest.arcadeTitle}, banked ${score} sparks, and earned ${reward} broth coins.` : `You banked ${score} stardust and ${reward} broth coins. Suzume did a victory donut.`) : 'No shame, courier. Obstacles are famously rude. Reset and give the sky a second chance.'}</p><div className="result-score"><b>{score}</b><span>final sparks · best combo x{bestRunCombo}</span></div>{completedQuest && <div className="quest-receipt">{storedReceipt || rewardState?.status === 'ready' ? <><b>{storedReceipt?.paid ?? rewardState?.paid ? 'Testnet XLM bounty sent!' : 'Testnet completion receipt saved.'}</b><span>{storedReceipt?.amount ?? rewardState?.amount} · <a href={`https://stellar.expert/explorer/testnet/tx/${storedReceipt?.hash ?? rewardState?.hash}`} target="_blank" rel="noreferrer">view hash ↗</a></span></> : rewardState?.status === 'loading' ? <><b>Calling the Testnet bounty board…</b><span>Creating your on-chain receipt.</span></> : rewardState?.status === 'error' ? <><b>Reward needs a retry.</b><span>{rewardState.message}</span><button className="arcade-button receipt-action" onClick={() => void claim(completedQuest)}>Retry Testnet receipt</button></> : !wallet.address ? <><b>Connect Freighter for your bounty.</b><button className="arcade-button receipt-action" onClick={() => void connect()}><WalletCards size={16} /> Connect wallet</button></> : <><b>Preparing your Testnet bounty…</b><span>The treasury call will begin automatically.</span></>}</div>}
        <div className="result-actions"><button className="arcade-button" onClick={start}><RotateCcw size={17} /> Run it back</button><button className="arcade-button secondary" onClick={() => navigation(quest ? '/game/quests' : '/game/map')}>{quest ? 'More character quests' : 'Choose another route'}</button></div></div></div>}
    </section><div className="mobile-controls"><button disabled={status !== 'running'} onClick={() => move(-1)}>↑</button><button className="boost-control" disabled={status !== 'running'} onClick={boost}><Zap size={21} fill="currentColor" /> BOOST</button><button disabled={status !== 'running'} onClick={() => move(1)}>↓</button><button disabled={status !== 'running' && status !== 'paused'} onClick={() => setStatus(status === 'running' ? 'paused' : 'running')}><Pause size={17} /></button></div>
    <footer className="arcade-footer"><span><Sparkles size={14} /> Runs: {progress.runs}</span><span>🪙 {progress.coins} broth coins</span><span>✦ High score: {progress.highScore}</span><Link to="/game/quests">Character side quests →</Link></footer>
  </div>;
}
