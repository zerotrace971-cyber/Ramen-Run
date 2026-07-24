import type { FeedEvent, Mission } from './types';

export const missions: Mission[] = [
  { id: 1, title: 'Meteor Miso', district: 'Nebula Noodlebar', flavor: 'Umami / orbital', reward: 18, risk: 'chill', eta: '02:18', status: 'ready', icon: '☄️', description: 'A bowl escaped the low-gravity kitchen. Land it gently.' },
  { id: 2, title: 'Black Hole Broth', district: 'Singularity Station', flavor: 'Dark / extra garlic', reward: 42, risk: 'spicy', eta: '04:30', status: 'ready', icon: '🕳️', description: 'The broth is dense. Your route needs a very brave sponsor.' },
  { id: 3, title: 'Solar Flare Shoyu', district: 'Aurora Arcade', flavor: 'Bright / soy', reward: 28, risk: 'spicy', eta: '03:05', status: 'ready', icon: '☀️', description: 'Beat rush-hour with a bowl that is legally too radiant.' },
  { id: 4, title: 'Comet Creamy Tonkotsu', district: 'Moonbean Market', flavor: 'Rich / cosmic', reward: 70, risk: 'volcanic', eta: '08:15', status: 'cooldown', icon: '☄️', description: 'A boss route. Unlock at Courier rank 3.' },
];

export const seedEvents: FeedEvent[] = [
  { id: 'a1', actor: 'GDR…KU7E', action: 'funded Meteor Miso', amount: '18 XLM', time: 'just now', emoji: '🍜' },
  { id: 'a2', actor: 'GCA…M9PK', action: 'earned a Neon Nori stamp', time: '2m ago', emoji: '✨' },
  { id: 'a3', actor: 'GB5…2QFQ', action: 'boosted Black Hole Broth', amount: '42 XLM', time: '4m ago', emoji: '🚀' },
  { id: 'a4', actor: 'GAS…3KQ1', action: 'joined the kitchen queue', time: '7m ago', emoji: '🥢' },
];

export const storyPanels = [
  { chapter: '00 — midnight', title: 'The city is starving.', copy: 'At 2:17 AM, the Astral Ramen Co. launches one last delivery. Then a meteor shower boops the cargo pod.', illustration: '🍜', accent: 'gold' },
  { chapter: '01 — oh no', title: 'Three Stellar Stamps scatter.', copy: 'Each stamp lands in a different district. Without them, Suzume’s scooter cannot navigate the cosmic noodle lanes.', illustration: '💫', accent: 'pink' },
  { chapter: '02 — your cue', title: 'Become a route sponsor.', copy: 'Fund deliveries, help the kitchen clear missions, and collect a permanent on-chain stamp when a route lands.', illustration: '🛵', accent: 'cyan' },
];
