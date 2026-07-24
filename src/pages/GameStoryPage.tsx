import { ArrowRight, MessageCircleMore, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimeCharacter } from '../components/Prologue';
import { cast, storyBeats } from '../game/data';
import { useSound } from '../game/useSound';

export function GameStoryPage() {
  const [beat, setBeat] = useState(0); const navigation = useNavigate(); const { soundOn, setSoundOn, play } = useSound(); const current = storyBeats[beat];
  const next = () => { play('dialogue'); if (beat === storyBeats.length - 1) navigation('/game/map'); else setBeat(index => index + 1); };
  return <div className="story-mode manga-story"><div className="story-head"><span>CHAPTER 1 · THE MISO METEOR</span><button onClick={() => setSoundOn(value => !value)}>{soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}</button></div><div className="story-sky"><img src="/assets/lantern-skyway-stage.png" alt="Lantern-lit Noodle Nova skyline" /><div className="story-halftone" /></div>
    <section className="manga-cast" aria-label="Chapter cast">{(Object.entries(cast) as [keyof typeof cast, (typeof cast)[keyof typeof cast]][]).map(([id, character]) => <article key={id} className={`manga-character ${character.color} ${current.speaker === id ? 'speaking' : ''}`}><div className="speech-above">{current.speaker === id && <><span>{character.name.toUpperCase()} · {current.expression}</span><p>“{current.line}”</p></>}</div><div className="story-anime"><AnimeCharacter who={id} mood={current.speaker === id ? current.expression.toLowerCase() : character.expression} /></div><b>{character.name}</b><small>{character.role}</small></article>)}</section>
    <div className="story-controls"><div className="choice-row">{beat === 2 && <button onClick={() => { play('dialogue'); setBeat(3); }}>“I’ll keep it classy.”</button>}{beat === 2 && <button onClick={() => { play('dialogue'); setBeat(3); }}>“No promises.”</button>}{beat !== 2 && <button onClick={next}>{beat === storyBeats.length - 1 ? 'Open the star map' : 'Continue scene'} <ArrowRight size={16} /></button>}</div></div><div className="story-pips">{storyBeats.map((_, index) => <i key={index} className={index === beat ? 'on' : ''} />)}</div><button className="skip-chapter" onClick={() => navigation('/game/map')}><MessageCircleMore size={16} /> Skip dialogue</button></div>;
}
