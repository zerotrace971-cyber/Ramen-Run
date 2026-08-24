import { Pause, Play, RotateCcw, ShieldCheck, Sparkles, TimerReset, Trophy, Volume2, VolumeX, Zap } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSound } from '../useSound';
import { comboScore, getComboMultiplier, getRouteDistrict, isNearMiss, MAX_INTEGRITY } from './mechanics';
import { emptyJetpackPowerups, jetpackPowerups, type JetpackPowerupId, type JetpackPowerupInventory } from './powerups';
import './RamenJetpackGame.css';

export type JetpackRunResult = {
  outcome: 'delivered' | 'crashed'; score: number; ramen: number; sparks: number; distance: number; bestCombo: number; shieldUsed: boolean; hitsTaken: number; nearMisses: number; duration: number; reason?: 'drone' | 'laser';
};

export type JetpackReceiptState = { status: 'idle' | 'loading' | 'ready' | 'error'; message?: string; hash?: string; amount?: string };

type Props = {
  goalDistance?: number;
  onRunEnd?: (result: JetpackRunResult) => void;
  onClaimDeliveryReward?: (run: JetpackRunResult) => void;
  reward?: JetpackReceiptState;
  powerups?: JetpackPowerupInventory;
  onUsePowerup?: (id: JetpackPowerupId) => boolean;
};

type Phase = 'briefing' | 'running' | 'paused' | 'result';
type EntityKind = 'drone' | 'laser' | 'ramen' | 'spark' | 'shield';
type Entity = { id: number; kind: EntityKind; x: number; y: number; width: number; height: number; passed?: boolean };
type RunState = { y: number; velocity: number; distance: number; score: number; ramen: number; sparks: number; combo: number; bestCombo: number; shield: number; magnet: number; chrono: number; shieldUsed: boolean; integrity: number; invulnerable: number; hitsTaken: number; nearMisses: number; elapsed: number; speed: number; nextDispatch: number };
type Hud = Pick<RunState, 'distance' | 'score' | 'ramen' | 'sparks' | 'combo' | 'bestCombo' | 'shield' | 'magnet' | 'chrono' | 'speed' | 'integrity' | 'nearMisses'>;
type Art = Partial<Record<'background' | 'player' | 'drone' | 'ramen' | 'spark' | 'shield', HTMLImageElement>>;

const WIDTH = 1280;
const HEIGHT = 720;
const PLAYER_X = 212;
const GOAL = 1200;
const dispatcherLines = [
  'Broth temperature: perfect. Route conditions: absolutely not.',
  'Upper lane is blocked. Improvisation authorized.',
  'That spark signature is clean. Scoop it.',
  'You are making illegal speed look extremely professional.',
  'Patrol drone ahead. It has paperwork. Avoid it.',
  'Combo climbing. Try not to become architecture.',
  'Customer updated: “driver nearby.” Technically true.',
];

const createRun = (): RunState => ({ y: HEIGHT * .5, velocity: 0, distance: 0, score: 0, ramen: 0, sparks: 0, combo: 0, bestCombo: 0, shield: 0, magnet: 0, chrono: 0, shieldUsed: false, integrity: MAX_INTEGRITY, invulnerable: 0, hitsTaken: 0, nearMisses: 0, elapsed: 0, speed: 385, nextDispatch: 8 });
const createHud = (state: RunState): Hud => ({ distance: state.distance, score: state.score, ramen: state.ramen, sparks: state.sparks, combo: state.combo, bestCombo: state.bestCombo, shield: state.shield, magnet: state.magnet, chrono: state.chrono, speed: state.speed, integrity: state.integrity, nearMisses: state.nearMisses });
const isHazard = (kind: EntityKind) => kind === 'drone' || kind === 'laser';
const isPickup = (kind: EntityKind) => kind === 'ramen' || kind === 'spark' || kind === 'shield';
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);
const overlaps = (a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) => a.x + 8 < b.x + b.width - 8 && a.x + a.width - 8 > b.x + 8 && a.y + 8 < b.y + b.height - 8 && a.y + a.height - 8 > b.y + 8;

function loadArt(): Art {
  const root = '/assets/ramen-jetpack/';
  const assets: Record<keyof Art, string> = { background: 'neon-skyway-v2.png', player: 'suzume-jetpack-v2.png', drone: 'delivery-drone.svg', ramen: 'ramen-seal.svg', spark: 'stellar-spark.svg', shield: 'shield.svg' };
  return Object.fromEntries(Object.entries(assets).map(([key, source]) => {
    const image = new Image(); image.src = `${root}${source}`; return [key, image];
  })) as Art;
}

function drawSuzume(context: CanvasRenderingContext2D, y: number, thrusting: boolean, shield: number, player?: HTMLImageElement) {
  const flameLength = thrusting ? 74 + Math.random() * 24 : 22;
  context.save();
  context.translate(PLAYER_X - 58, y + 5);
  context.globalCompositeOperation = 'screen';
  const flame = context.createLinearGradient(-flameLength, 0, 28, 0); flame.addColorStop(0, 'rgba(89,244,255,0)'); flame.addColorStop(.45, 'rgba(89,244,255,.76)'); flame.addColorStop(1, 'rgba(255,90,178,.95)');
  context.fillStyle = flame; context.beginPath(); context.moveTo(-flameLength, 0); context.lineTo(12, -21); context.lineTo(31, 0); context.lineTo(12, 21); context.fill();
  context.globalCompositeOperation = 'source-over';
  if (shield > 0) {
    context.strokeStyle = '#9cfaff'; context.lineWidth = 5; context.shadowColor = '#43efff'; context.shadowBlur = 23;
    context.beginPath(); context.ellipse(18, -3, 82, 62, 0, 0, Math.PI * 2); context.stroke(); context.shadowBlur = 0;
  }
  if (player?.complete) context.drawImage(player, -56, -79, 214, 143);
  else {
    context.fillStyle = '#ff5eaa'; context.fillRect(-18, -18, 65, 43); context.fillStyle = '#54f5ff'; context.beginPath(); context.arc(42, -27, 22, 0, Math.PI * 2); context.fill();
  }
  context.restore();
}

function drawEntity(context: CanvasRenderingContext2D, entity: Entity, art: Art) {
  if (entity.kind === 'laser') {
    context.save(); context.translate(entity.x, entity.y); context.shadowColor = '#ff4fa6'; context.shadowBlur = 20;
    context.fillStyle = '#ff4fa6'; context.fillRect(0, 0, entity.width, entity.height);
    context.fillStyle = '#fff1c9'; context.fillRect(5, 4, entity.width - 10, 5);
    context.strokeStyle = '#24113f'; context.lineWidth = 5; context.strokeRect(0, 0, entity.width, entity.height); context.restore(); return;
  }
  const image = entity.kind === 'drone' ? art.drone : entity.kind === 'ramen' ? art.ramen : entity.kind === 'spark' ? art.spark : art.shield;
  if (image?.complete) context.drawImage(image, entity.x, entity.y, entity.width, entity.height);
  else { context.fillStyle = isHazard(entity.kind) ? '#ff5dab' : '#fff1c9'; context.fillRect(entity.x, entity.y, entity.width, entity.height); }
}

export default function RamenJetpackGame({ goalDistance = GOAL, onRunEnd, onClaimDeliveryReward, reward = { status: 'idle' }, powerups = emptyJetpackPowerups, onUsePowerup }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const artRef = useRef<Art>({});
  const phaseRef = useRef<Phase>('briefing');
  const thrustRef = useRef(false);
  const endedRef = useRef(false);
  const nextEntityRef = useRef(0);
  const entitiesRef = useRef<Entity[]>([]);
  const stateRef = useRef<RunState>(createRun());
  const spawnRef = useRef({ hazard: 1.25, pickup: .8 });
  const hudAtRef = useRef(0);
  const powerupsRef = useRef<JetpackPowerupInventory>(powerups);
  const [phase, setPhase] = useState<Phase>('briefing');
  const [hud, setHud] = useState<Hud>(() => createHud(stateRef.current));
  const [line, setLine] = useState('Press and hold Space. Suzume responds immediately; release to descend into the next lane.');
  const [lastRun, setLastRun] = useState<JetpackRunResult | null>(null);
  const [visiblePowerups, setVisiblePowerups] = useState<JetpackPowerupInventory>(powerups);
  const { play, soundOn, setSoundOn } = useSound();

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { artRef.current = loadArt(); }, []);
  useEffect(() => { powerupsRef.current = powerups; setVisiblePowerups(powerups); }, [powerups]);

  const finishRun = useCallback((outcome: JetpackRunResult['outcome'], reason?: JetpackRunResult['reason']) => {
    if (endedRef.current) return;
    endedRef.current = true; thrustRef.current = false;
    const state = stateRef.current;
    const result: JetpackRunResult = { outcome, reason, score: state.score, ramen: state.ramen, sparks: state.sparks, distance: Math.round(state.distance), bestCombo: state.bestCombo, shieldUsed: state.shieldUsed, hitsTaken: state.hitsTaken, nearMisses: state.nearMisses, duration: Math.round(state.elapsed) };
    setHud(createHud(state)); setLastRun(result); setPhase('result');
    setLine(outcome === 'delivered' ? 'Balcony twelve, blue lantern. Express means express.' : reason === 'laser' ? 'Okay. New plan: less laser.' : 'Tell dispatch the drone failed to signal.');
    play(outcome === 'delivered' ? 'win' : 'hit'); onRunEnd?.(result);
  }, [onRunEnd, play]);

  const startRun = useCallback((launching = false) => {
    stateRef.current = createRun(); entitiesRef.current = []; spawnRef.current = { hazard: 1.25, pickup: .8 }; nextEntityRef.current = 0; endedRef.current = false; thrustRef.current = launching;
    setHud(createHud(stateRef.current)); setLastRun(null); setLine('Route Seven is live. Hold Space to rise; release to drop with a crisp glide.'); setPhase('running');
    play('boost'); if (launching) play('engine');
  }, [play]);

  const pause = useCallback(() => {
    if (phaseRef.current === 'running') { thrustRef.current = false; setPhase('paused'); }
    else if (phaseRef.current === 'paused') setPhase('running');
  }, []);

  const setThrust = useCallback((active: boolean) => {
    if (phaseRef.current !== 'running') return;
    if (active && !thrustRef.current) play('engine');
    thrustRef.current = active;
  }, [play]);

  const activatePowerup = useCallback((id: JetpackPowerupId) => {
    if (phaseRef.current !== 'running') return;
    const state = stateRef.current;
    const remaining = powerupsRef.current[id] ?? 0;
    if (remaining < 1) { setLine('That tool is not in Suzume’s bag. The rooftop shop is above the launch pad.'); play('hit'); return; }
    if (onUsePowerup && !onUsePowerup(id)) return;
    powerupsRef.current = { ...powerupsRef.current, [id]: remaining - 1 };
    setVisiblePowerups(powerupsRef.current);
    if (id === 'magnet') { state.magnet = 7; setLine('Udon Magnet humming: every nearby seal is coming home.'); }
    if (id === 'chrono') { state.chrono = 4.5; setLine('Torii Chrono engaged. Traffic is now a very polite slideshow.'); }
    if (id === 'shield') { state.shield = 6; setLine('Kitsune Aegis is up. One rude collision will be forgiven.'); }
    play('powerup');
  }, [onUsePowerup, play]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'p' || event.key === 'P' || event.key === 'Escape') && !event.repeat) { event.preventDefault(); pause(); return; }
      if ((event.code === 'Digit1' || event.code === 'Digit2' || event.code === 'Digit3') && !event.repeat) { event.preventDefault(); activatePowerup(event.code === 'Digit1' ? 'magnet' : event.code === 'Digit2' ? 'chrono' : 'shield'); return; }
      if (event.code === 'Space' || event.key === 'w' || event.key === 'W' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (phaseRef.current === 'briefing' || phaseRef.current === 'result') startRun(true);
        else setThrust(true);
      }
    };
    const onKeyUp = (event: KeyboardEvent) => { if (event.code === 'Space' || event.key === 'w' || event.key === 'W' || event.key === 'ArrowUp') setThrust(false); };
    window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, [activatePowerup, pause, setThrust, startRun]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const context = canvas.getContext('2d'); if (!context) return;
    let frame = 0; let previous = performance.now();
    const render = (now: number) => {
      const delta = Math.min(.033, (now - previous) / 1000); previous = now;
      const state = stateRef.current;
      if (phaseRef.current === 'running') {
        state.elapsed += delta;
        state.speed = Math.min(720, 385 + state.distance * .28);
        const timeScale = state.chrono > 0 ? .52 : 1;
        const worldDelta = delta * timeScale;
        state.distance += state.speed * worldDelta * .125;
        // Direct target velocity gives Spacebar a precise arcade feel instead of floaty acceleration.
        const targetVelocity = thrustRef.current ? -430 : 330;
        const response = thrustRef.current ? 18 : 8.5;
        state.velocity += (targetVelocity - state.velocity) * Math.min(1, response * delta);
        state.y += state.velocity * delta;
        if (state.y < 72) { state.y = 72; state.velocity = 0; } if (state.y > HEIGHT - 82) { state.y = HEIGHT - 82; state.velocity = 0; }
        state.shield = Math.max(0, state.shield - delta); state.magnet = Math.max(0, state.magnet - delta); state.chrono = Math.max(0, state.chrono - delta); state.invulnerable = Math.max(0, state.invulnerable - delta);
        spawnRef.current.hazard -= worldDelta; spawnRef.current.pickup -= worldDelta;
        if (spawnRef.current.hazard <= 0) {
          const laser = Math.random() < .31; const height = laser ? randomBetween(108, 180) : 68; const y = laser ? randomBetween(78, HEIGHT - height - 78) : randomBetween(76, HEIGHT - 135);
          entitiesRef.current.push({ id: nextEntityRef.current++, kind: laser ? 'laser' : 'drone', x: WIDTH + 48, y, width: laser ? 44 : 98, height });
          spawnRef.current.hazard = Math.max(.82, 1.62 - state.distance / 3100);
        }
        if (spawnRef.current.pickup <= 0) {
          const roll = Math.random(); const kind: EntityKind = roll < .1 ? 'shield' : roll < .3 ? 'spark' : 'ramen'; const size = kind === 'ramen' ? 57 : 64;
          entitiesRef.current.push({ id: nextEntityRef.current++, kind, x: WIDTH + 35, y: randomBetween(70, HEIGHT - 126), width: size, height: size });
          spawnRef.current.pickup = randomBetween(.55, .92);
        }
        const player = { x: PLAYER_X - 42, y: state.y - 42, width: 118, height: 78 };
        const nextEntities: Entity[] = [];
        for (const entity of entitiesRef.current) {
          entity.x -= state.speed * worldDelta;
          if (state.magnet > 0 && isPickup(entity.kind)) {
            const dx = PLAYER_X - (entity.x + entity.width / 2); const dy = state.y - (entity.y + entity.height / 2); const distance = Math.hypot(dx, dy);
            if (distance < 270) { entity.x += dx * Math.min(1, delta * 5.6); entity.y += dy * Math.min(1, delta * 5.6); }
          }
          if (overlaps(player, entity)) {
            if (isHazard(entity.kind)) {
              if (state.shield > 0) { state.shield = 0; state.shieldUsed = true; state.combo = 0; setLine('Kitsune Aegis shattered. Broth still level. That was close.'); play('hit'); }
              else if (state.invulnerable <= 0) {
                state.integrity -= 1; state.hitsTaken += 1; state.invulnerable = 1.55; state.combo = 0; state.score = Math.max(0, state.score - 100); play('hit');
                if (state.integrity <= 0) { finishRun('crashed', entity.kind === 'laser' ? 'laser' : 'drone'); continue; }
                setLine(state.integrity === 1 ? 'Broth integrity critical! One more hit ends the route.' : 'Impact absorbed. Stabilizers give you two seconds to recover.');
              }
            } else if (entity.kind === 'ramen') { state.ramen += 1; state.combo += 1; state.score += comboScore(55, state.combo); play('collect'); setLine(state.ramen % 4 === 0 ? 'Order intact. The customer can smell victory.' : 'Still hot. Keep moving.'); }
            else if (entity.kind === 'spark') { state.sparks += 1; state.combo += 2; state.score += comboScore(140, state.combo); play('collect'); setLine('Stellar spark acquired. Combo multiplier engaged.'); }
            else { state.shield = 5.5; play('boost'); setLine('Route shield found. One rude collision can wait.'); }
            state.bestCombo = Math.max(state.bestCombo, state.combo); continue;
          }
          if (entity.x + entity.width < PLAYER_X - 55) {
            if (isHazard(entity.kind) && !entity.passed) {
              const near = isNearMiss(state.y, entity.y, entity.height); state.combo += near ? 2 : 1;
              if (near) { state.nearMisses += 1; state.score += comboScore(90, state.combo); play('collect'); setLine(`NEAR MISS +${comboScore(90, state.combo)}. The city blinked first.`); }
              state.bestCombo = Math.max(state.bestCombo, state.combo); if (!near && (state.combo === 4 || state.combo === 8)) setLine(state.combo === 8 ? 'Express means express. Try to keep up, city.' : 'Route is opening up. Keep the line clean.');
            }
            continue;
          }
          nextEntities.push(entity);
        }
        entitiesRef.current = nextEntities;
        if (state.elapsed >= state.nextDispatch) { setLine(dispatcherLines[Math.floor(Math.random() * dispatcherLines.length)]); state.nextDispatch += randomBetween(10, 16); }
        if (state.distance >= goalDistance) finishRun('delivered');
        if (now - hudAtRef.current > 90) { hudAtRef.current = now; setHud(createHud(state)); }
      }

      const sky = context.createLinearGradient(0, 0, 0, HEIGHT); sky.addColorStop(0, '#060722'); sky.addColorStop(.52, '#181249'); sky.addColorStop(1, '#050613'); context.fillStyle = sky; context.fillRect(0, 0, WIDTH, HEIGHT);
      const background = artRef.current.background;
      if (background?.complete) {
        const drift = -((state.distance * .82) % WIDTH); context.globalAlpha = .96;
        context.drawImage(background, drift, 0, WIDTH, HEIGHT); context.drawImage(background, drift + WIDTH, 0, WIDTH, HEIGHT); context.globalAlpha = 1;
      }
      context.fillStyle = 'rgba(7,8,29,.18)'; context.fillRect(0, 0, WIDTH, HEIGHT);
      context.strokeStyle = state.chrono > 0 ? 'rgba(255,218,100,.34)' : 'rgba(103,241,255,.24)'; context.lineWidth = 2;
      for (let index = 0; index < 14; index += 1) { const y = 46 + (index * 53) % 590; const speedLine = 75 + (index % 4) * 42; const x = (index * 163 + state.distance * (index % 3 + 1) * 3) % (WIDTH + 150) - 150; context.beginPath(); context.moveTo(x, y); context.lineTo(x + speedLine, y); context.stroke(); }
      for (const entity of entitiesRef.current) drawEntity(context, entity, artRef.current);
      context.globalAlpha = state.invulnerable > 0 && Math.floor(state.invulnerable * 12) % 2 === 0 ? .42 : 1;
      drawSuzume(context, state.y, thrustRef.current && phaseRef.current === 'running', state.shield, artRef.current.player); context.globalAlpha = 1;
      if (state.chrono > 0) { context.fillStyle = 'rgba(255,218,100,.08)'; context.fillRect(0, 0, WIDTH, HEIGHT); }
      if (getComboMultiplier(state.combo) >= 2) { context.strokeStyle = 'rgba(255,218,100,.35)'; context.lineWidth = 9; context.strokeRect(5, 5, WIDTH - 10, HEIGHT - 10); }
      context.fillStyle = 'rgba(255,255,255,.035)'; context.fillRect(0, 0, WIDTH, HEIGHT);
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render); return () => cancelAnimationFrame(frame);
  }, [finishRun, goalDistance, play]);

  const pointerStart = () => { if (phase === 'briefing' || phase === 'result') startRun(true); else setThrust(true); };
  const delivered = lastRun?.outcome === 'delivered';
  const district = getRouteDistrict(hud.distance, goalDistance);
  const multiplier = getComboMultiplier(hud.combo);
  return <section className="jetpack-game" aria-label="Ramen Run jetpack delivery game">
    <div className="jetpack-hud">
      <div><small>{district.name.toUpperCase()} · {district.japanese}</small><b>{Math.min(100, Math.round(hud.distance / goalDistance * 100))}% <span>{district.intensity}</span></b></div>
      <div className={multiplier >= 2 ? 'fever-score' : ''}><small>DELIVERY SCORE · x{multiplier}</small><b>{hud.score.toLocaleString()}</b></div>
      <div><small>RAMEN SEALS</small><b>{hud.ramen} <span>· sparks {hud.sparks}</span></b></div>
      <div className={hud.integrity === 1 ? 'critical-integrity' : ''}><small>BROTH INTEGRITY</small><b>{'♥'.repeat(hud.integrity)}<span>{'♡'.repeat(MAX_INTEGRITY - hud.integrity)}</span></b></div>
      <div className={hud.shield > 0 ? 'active-shield' : ''}><small>AEGIS · NEAR {hud.nearMisses}</small><b>{hud.shield > 0 ? `${hud.shield.toFixed(1)}s` : 'standby'}</b></div>
    </div>
    <div className="jetpack-canvas-shell">
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} role="img" aria-label="Ramen Run jetpack delivery game. Hold Space, W, Arrow Up, mouse, or touch to rise. Release to descend. Press 1, 2, or 3 to use a purchased power-up. Press P or Escape to pause." onPointerDown={pointerStart} onPointerUp={() => setThrust(false)} onPointerLeave={() => setThrust(false)} />
      {phase === 'briefing' && <div className="jetpack-overlay">
        <img src="/assets/ramen-jetpack/ramen-run-logo.svg" alt="Ramen Run" />
        <span className="jetpack-kicker">STELLAR EXPRESS // ROUTE 07</span><h2>Hot ramen. Cold vacuum.<br />Zero excuses.</h2>
        <p>Hold to climb and release to dive through three escalating districts. You have three broth-integrity hearts; skim hazards for near-miss bonuses and build a x3 score fever.</p>
        <div className="jetpack-loadout-preview">{jetpackPowerups.map(powerup => <span key={powerup.id}><i className={`powerup-art ${powerup.id}`} /><b>{powerup.key}</b> {powerup.name} <em>×{visiblePowerups[powerup.id]}</em></span>)}</div>
        <button onClick={() => startRun()}><Play size={17} fill="currentColor" /> Launch delivery</button><small>Hold Space / W / ↑ / touch to rise · 1, 2, 3 use bought route tools · P or Esc pauses</small>
      </div>}
      {phase === 'paused' && <div className="jetpack-overlay compact"><Pause size={34} /><span className="jetpack-kicker">DELIVERY SUSPENDED</span><h2>Broth stabilizers engaged.</h2><p>Nothing moves until the courier says so.</p><button onClick={pause}><Play size={17} fill="currentColor" /> Resume route</button></div>}
      {phase === 'result' && lastRun && <div className="jetpack-overlay result">
        <span className="jetpack-kicker">{delivered ? 'DESTINATION LOCKED' : 'DELIVERY INTERRUPTED'}</span>{delivered ? <Trophy size={38} /> : <Zap size={38} />}<h2>{delivered ? 'Route recorded.' : 'The city gets another chance.'}</h2>
        <p>{delivered ? `Balcony twelve received ${lastRun.ramen} ramen seals and ${lastRun.sparks} Stellar sparks.` : 'No shame, courier. Obstacles are famously rude. Reset and give the sky another chance.'}</p>
        <div className="jetpack-result-grid"><span><b>{lastRun.score}</b> score</span><span><b>{lastRun.distance}m</b> flown</span><span><b>x{lastRun.bestCombo}</b> combo</span><span><b>{lastRun.nearMisses}</b> near misses</span></div>
        {delivered && onClaimDeliveryReward && <div className="jetpack-claim"><ShieldCheck size={17} /><p>Completed delivery bounty: <b>0.35 XLM on Stellar Testnet.</b> This sends XLM from the configured treasury only after you explicitly claim it.</p>{reward.status === 'ready' ? <a href={`https://stellar.expert/explorer/testnet/tx/${reward.hash}`} target="_blank" rel="noreferrer">{reward.amount} sent · View transaction ↗</a> : <button className="claim-button" onClick={() => onClaimDeliveryReward(lastRun)} disabled={reward.status === 'loading'}>{reward.status === 'loading' ? 'Sending Testnet XLM…' : 'Claim delivery reward'}</button>}{reward.status === 'error' && <small className="claim-error">{reward.message}</small>}</div>}
        <button className="retry-button" onClick={() => startRun()}><RotateCcw size={16} /> Retry delivery</button>
      </div>}
      <div className="jetpack-status"><span><Sparkles size={15} /> x{hud.combo} combo · best x{hud.bestCombo}</span><p>{line}</p><span><TimerReset size={15} /> {Math.round(hud.speed)} km/h</span></div>
    </div>
    <div className="jetpack-controls">
      <div className="jetpack-power-controls">{jetpackPowerups.map(powerup => <button key={powerup.id} className={`${powerup.id} ${hud[powerup.id] > 0 ? 'active' : ''}`} disabled={phase !== 'running' || visiblePowerups[powerup.id] < 1} onClick={() => activatePowerup(powerup.id)}><i className={`powerup-art ${powerup.id}`} /><span><b>{powerup.key}</b> {powerup.name}</span><em>×{visiblePowerups[powerup.id]}</em></button>)}</div>
      <button aria-label="Hold to thrust upward" className="thrust-control" disabled={phase !== 'running'} onPointerDown={() => setThrust(true)} onPointerUp={() => setThrust(false)} onPointerLeave={() => setThrust(false)}><Zap size={19} fill="currentColor" /> HOLD SPACE / IGNITE</button>
      <button className="pause-control" onClick={pause} disabled={phase !== 'running' && phase !== 'paused'}><Pause size={17} /> {phase === 'paused' ? 'Resume' : 'Pause'}</button>
      <button className="sound-control" onClick={() => setSoundOn(value => !value)} aria-label={soundOn ? 'Mute game sounds' : 'Enable game sounds'}>{soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}</button>
    </div>
  </section>;
}
