import { CheckCircle2, Gamepad2, ReceiptText, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { quests } from '../game/data';
import { useGameProgress } from '../game/progress';

export function SideQuestsPage() {
  const { progress, update } = useGameProgress();
  const accept = (id: string) => update(current => ({ acceptedQuests: current.acceptedQuests.includes(id) ? current.acceptedQuests : [...current.acceptedQuests, id] }));
  return <div className="quest-page"><header><p>THE PEOPLE OF NOODLE NOVA</p><h1>Character challenges</h1><span>Every friend has a different arcade stage, objective, backdrop, and Testnet bounty. Finish one with Freighter connected to create its receipt.</span></header><section className="quest-grid">{quests.map(quest => {
    const complete = progress.completedQuests.includes(quest.id); const accepted = progress.acceptedQuests.includes(quest.id); const receipt = progress.questReceipts[quest.id];
    return <article key={quest.id} className={`quest-card ${complete ? 'completed' : ''}`}><div className="quest-person"><span>{quest.portrait}</span><div><p>{quest.role} · {quest.expression}</p><h2>{quest.character}</h2></div>{complete && <CheckCircle2 size={22} />}</div><div className="quest-speech">“{quest.dialogue}”</div><h3>{quest.title}</h3><p className="quest-objective"><b>{quest.arcadeTitle}:</b> {quest.objective}</p><div className="quest-reward"><span>REWARD</span><b>{quest.reward} · {quest.xlmReward}</b></div>{receipt && <a className="quest-hash" href={`https://stellar.expert/explorer/testnet/tx/${receipt.hash}`} target="_blank" rel="noreferrer"><ReceiptText size={15} /> {receipt.paid ? 'XLM bounty hash' : 'Completion receipt'} ↗</a>}{complete ? <Link to={`/game/quest/${quest.id}`}><Gamepad2 size={16} /> Replay quest</Link> : accepted ? <Link to={`/game/quest/${quest.id}`}><Gamepad2 size={16} /> Start {quest.arcadeTitle}</Link> : <button onClick={() => accept(quest.id)}><Sparkles size={16} /> Accept quest</button>}</article>;
  })}</section></div>;
}
