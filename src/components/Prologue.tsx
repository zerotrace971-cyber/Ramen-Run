import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, FastForward, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export type AnimeCharacterId = 'suzume' | 'beam' | 'mika' | 'yori';
type ComicPanel = { place: string; scene: string; bg: string; sound: string; character: AnimeCharacterId; mood: string; line: string; narration?: string };
type ComicPage = { issue: string; title: string; panels: ComicPanel[] };

const comicPages: ComicPage[] = [
  { issue: 'PAGE 01 · MIDNIGHT KITCHEN', title: 'THE CITY IS STARVING.', panels: [
    { place: 'NOODLE NOVA // 02:17', scene: 'wide', bg: 'lantern-skyway-stage.png', sound: 'GLOW…', character: 'suzume', mood: 'watchful', narration: 'At 2:17 AM, one last ramen route leaves the kitchen.', line: 'Quiet night. Suspiciously quiet.' },
    { place: 'ASTRAL RAMEN CO.', scene: 'slice', bg: 'torii-nori-stage.png', sound: 'CLATTER!', character: 'beam', mood: 'panic', line: 'Suzume! The miso meteor is rolling away with the whole dinner!' },
    { place: 'ABOVE THE TORII', scene: 'impact', bg: 'neon-route-stage.png', sound: 'KABOOOM!', character: 'yori', mood: 'alarm', narration: 'Then the sky burps a meteor shower directly into the delivery lane.', line: 'That is not covered by the scooter warranty!' },
    { place: 'NEON ALLEY', scene: 'close', bg: 'neon-route-stage.png', sound: 'VRRRM', character: 'suzume', mood: 'grin', line: 'Good. I was getting bored.' },
  ] },
  { issue: 'PAGE 02 · STAMPS IN THE WIND', title: 'THE ROUTES BREAK APART.', panels: [
    { place: 'SHINKANSEN DISTRICT', scene: 'speed', bg: 'shinkansen-drift-stage.png', sound: 'SHHHH!', character: 'mika', mood: 'smug', narration: 'Three Stellar Stamps scatter across Noodle Nova.', line: 'Aha. A crisis with excellent composition.' },
    { place: 'TORII PANTRY', scene: 'slice', bg: 'torii-nori-stage.png', sound: 'FWIP!', character: 'beam', mood: 'despair', line: 'Without those stamps, my kitchen map has become abstract art!' },
    { place: 'LASER ALLEY', scene: 'impact', bg: 'neon-route-stage.png', sound: 'MEE-OW!', character: 'yori', mood: 'worry', line: 'My cat drones followed one of them. They have tiny jetpacks. I regret everything.' },
    { place: 'THE STARTING LINE', scene: 'close', bg: 'lantern-skyway-stage.png', sound: 'CLICK.', character: 'suzume', mood: 'ready', line: 'Then we collect them. One impossible route at a time.' },
  ] },
  { issue: 'PAGE 03 · THE ROOKIE ENTERS', title: 'YOUR SHIFT BEGINS.', panels: [
    { place: 'GARAGE // MK.04', scene: 'wide', bg: 'shinkansen-drift-stage.png', sound: 'KRRR-CHNK', character: 'yori', mood: 'focus', narration: 'Yori patches the rocket scooter with a wrench and unreasonable optimism.', line: 'Fresh decals. More boost. Fewer explosions. Probably.' },
    { place: 'KITCHEN ROOF', scene: 'slice', bg: 'torii-nori-stage.png', sound: 'PLOP!', character: 'beam', mood: 'hope', line: 'Bring the city’s routes back—and do not let Mika eat the evidence.' },
    { place: 'RAIL PLATFORM', scene: 'speed', bg: 'shinkansen-drift-stage.png', sound: 'HA!', character: 'mika', mood: 'challenge', line: 'Beat my drift time and I might admit you are almost competent.' },
    { place: 'NOODLE NOVA', scene: 'impact', bg: 'lantern-skyway-stage.png', sound: 'LET’S GO!', character: 'suzume', mood: 'hero', line: 'Rookie, hop on. The cosmos is hungry.' },
  ] },
];

export function AnimeCharacter({ who, mood }: { who: AnimeCharacterId; mood: string }) {
  const labels: Record<AnimeCharacterId, string> = { suzume: 'SUZUME', beam: 'CHEF BEAM', mika: 'MIKA', yori: 'YORI' };
  return <div className={`anime-character anime-${who} mood-${mood}`} aria-label={`${labels[who]} ${mood}`}><div className="anime-sprite" /><b>{labels[who]}</b><i>{mood.toUpperCase()}</i></div>;
}

export function Prologue({ forceOpen, onClose }: { forceOpen?: boolean; onClose?: () => void }) {
  const [open, setOpen] = useState(Boolean(forceOpen)); const [page, setPage] = useState(0); const navigate = useNavigate();
  useEffect(() => { if (forceOpen) { setOpen(true); setPage(0); } }, [forceOpen]);
  const close = (go = false) => { sessionStorage.setItem('suzume-prologue-seen', 'yes'); setOpen(false); onClose?.(); if (go) navigate('/game/story'); };
  const current = comicPages[page];
  return <AnimatePresence>{open && <motion.section className="prologue manga-prologue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-modal="true" role="dialog"><div className="prologue-stars" /><button className="skip-story" onClick={() => close(true)}><FastForward size={15} /> Skip comic</button><div className="manga-book"><div className="chapter-kicker"><Sparkles size={15} /> SUZUME’S STELLAR RAMEN RUN · {current.issue}</div><AnimatePresence mode="wait"><motion.article key={page} className={`comic-page comic-page-${page}`} initial={{ opacity: 0, rotateY: -12, x: 45 }} animate={{ opacity: 1, rotateY: 0, x: 0 }} exit={{ opacity: 0, rotateY: 12, x: -45 }} transition={{ duration: .35 }}><header><span>ISSUE 01</span><h1>{current.title}</h1><i>PAGE {String(page + 1).padStart(2, '0')} / 03</i></header><div className="comic-panel-grid">{current.panels.map((panel, index) => <section key={`${page}-${index}`} className={`comic-frame frame-${index + 1} scene-${panel.scene}`} style={{ '--panel-bg': `url('/assets/${panel.bg}')` } as React.CSSProperties}><div className="frame-text"><small>{panel.place}</small>{panel.narration && <p className="narration-box">{panel.narration}</p>}<b className="sound-effect">{panel.sound}</b></div><AnimeCharacter who={panel.character} mood={panel.mood} /><div className="frame-speech">{panel.line}</div></section>)}</div><footer><span>✦ {current.issue}</span><b>STELLAR RAMEN RUN</b></footer></motion.article></AnimatePresence><div className="comic-controls"><div className="comic-page-dots">{comicPages.map((_, index) => <i key={index} className={index === page ? 'active' : ''} />)}</div>{page < comicPages.length - 1 ? <button className="button primary" onClick={() => setPage(index => index + 1)}>Turn page <ArrowRight size={17} /></button> : <button className="button primary" onClick={() => close(true)}>Enter Noodle Nova <ArrowRight size={17} /></button>}</div></div></motion.section>}</AnimatePresence>;
}
