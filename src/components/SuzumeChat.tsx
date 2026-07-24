import { Bot, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { config } from '../lib/config';

type ChatMessage = { side: 'bot' | 'user'; text: string };
const localReply = (message: string) => {
  const text = message.toLowerCase();
  if (text.includes('risk')) return 'Meteor Miso is a chill 18 XLM route. Black Hole Broth is spicier—but the stamp looks extremely cool in your vault.';
  if (text.includes('wallet') || text.includes('freighter')) return 'Tap Connect wallet in the top bar. Freighter signs the transaction locally; I never see your secret key. Tiny chef’s promise.';
  if (text.includes('stamp') || text.includes('nft')) return 'Completed routes call the Stamp Shelf contract. It mints your achievement stamp after the Vault confirms delivery.';
  return 'I’m in demo-diner mode right now, so I can explain the route board, vault, wallet flow, or why ramen is a better unit of account than vibes.';
};

export function SuzumeChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ side: 'bot', text: 'Hey star courier! I’m Suzume. Ask me about routes, stamps, or wallet safety.' }]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const send = async (event: FormEvent) => {
    event.preventDefault(); const question = draft.trim(); if (!question || thinking) return;
    setMessages(current => [...current, { side: 'user', text: question }]); setDraft(''); setThinking(true);
    try {
      const response = await fetch(config.suzumeProxy, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: question }) });
      if (!response.ok) throw new Error('offline');
      const body = await response.json() as { text?: string };
      setMessages(current => [...current, { side: 'bot', text: body.text || localReply(question) }]);
    } catch { setMessages(current => [...current, { side: 'bot', text: localReply(question) }]); }
    finally { setThinking(false); }
  };
  return <div className="suzume-chat">
    <AnimateButton open={open} onClick={() => setOpen(!open)} />
    {open && <section className="chat-panel"><header><span className="bot-avatar"><Bot size={17} /></span><div><b>Suzume</b><small><i /> Kitchen signal strong</small></div><button onClick={() => setOpen(false)} aria-label="Close Suzume chat"><X size={18} /></button></header>
      <div className="chat-body">{messages.map((message, index) => <p key={index} className={message.side}>{message.text}</p>)}{thinking && <p className="bot typing"><span /> <span /> <span /></p>}</div>
      <form onSubmit={send}><input value={draft} onChange={event => setDraft(event.target.value)} placeholder="Ask Suzume anything…" aria-label="Chat message" /><button className="icon-button" type="submit" aria-label="Send message"><Send size={17} /></button></form>
    </section>}
  </div>;
}

function AnimateButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return <button className="suzume-fab" onClick={onClick} aria-label="Chat with Suzume">{open ? <X size={21} /> : <><MessageCircle size={21} /><span><Sparkles size={11} /></span></>}</button>;
}
