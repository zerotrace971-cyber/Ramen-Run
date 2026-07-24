export type Level = {
  id: number;
  title: string;
  district: string;
  subtitle: string;
  difficulty: number;
  target: number;
  reward: number;
  accent: string;
  locked?: boolean;
  briefing: string;
};

export type QuestMode = 'cat-chase' | 'nori-rush' | 'shinkansen-drift' | 'lantern-flight';

export type Quest = {
  id: string;
  character: string;
  role: string;
  portrait: string;
  expression: string;
  title: string;
  objective: string;
  reward: string;
  dialogue: string;
  type: 'score' | 'stars' | 'perfect';
  amount: number;
  target: number;
  arcadeTitle: string;
  arcadeSubtitle: string;
  stage: string;
  mode: QuestMode;
  briefing: string;
  xlmReward: string;
};

export type StoryBeat = {
  speaker: 'suzume' | 'beam' | 'mika' | 'yori';
  line: string;
  expression: string;
};

export const cast = {
  suzume: { name: 'Suzume', role: 'Ramen courier', portrait: '🛵', expression: 'determined', color: 'pink' },
  beam: { name: 'Chef Beam', role: 'Kitchen captain', portrait: '👨🏽‍🍳', expression: 'panicked', color: 'gold' },
  mika: { name: 'Mika', role: 'Rival courier', portrait: '🛼', expression: 'smug', color: 'purple' },
  yori: { name: 'Yori', role: 'Neon-cat mechanic', portrait: '🐈‍⬛', expression: 'worried', color: 'cyan' },
} as const;

export const levels: Level[] = [
  { id: 1, title: 'Meteor Miso', district: 'Nebula Noodlebar', subtitle: 'Learn the lanes', difficulty: 1, target: 120, reward: 80, accent: 'cyan', briefing: 'A runaway miso capsule is bouncing through the noodle lanes. Grab the stardust and do not kiss an asteroid.' },
  { id: 2, title: 'Aurora Shoyu', district: 'Lightwave Arcade', subtitle: 'Night rush hour', difficulty: 2, target: 180, reward: 140, accent: 'pink', briefing: 'The arcade crowd needs shoyu before the last boss spawn. Ride the light ribbon and keep your combo alive.' },
  { id: 3, title: 'Black Hole Broth', district: 'Singularity Station', subtitle: 'Gravity gets spicy', difficulty: 3, target: 250, reward: 220, accent: 'gold', briefing: 'Gravity keeps stealing toppings. The bowl is heavy, the tips are huge, and every asteroid has an opinion.' },
  { id: 4, title: 'Comet Creamy', district: 'Moonbean Market', subtitle: 'Boss delivery', difficulty: 4, target: 340, reward: 360, accent: 'purple', locked: true, briefing: 'Only a courier with a clean streak can take this legendary tonkotsu route.' },
];

export const quests: Quest[] = [
  {
    id: 'yori', character: 'Yori', role: 'Neon-cat mechanic', portrait: '🐈‍⬛', expression: 'WORRIED!', title: 'Lost in the Laser Alley', objective: 'Rescue 6 cat drones before the lasers catch them.', reward: '+1 Turbo Paw badge', dialogue: 'My cat drone chased a laser pointer into lane three. If you see it, honk twice and do a heroic thing.', type: 'score', amount: 180, target: 180, arcadeTitle: 'Laser Cat Chase', arcadeSubtitle: 'Rescue 6 runaway cat drones', stage: 'neon-route-stage.png', mode: 'cat-chase', briefing: 'Yori’s tiny cat drones are zipping through Neon Alley. Scoop up six before the red laser gates zap the route.', xlmReward: '0.50 XLM',
  },
  {
    id: 'beam', character: 'Chef Beam', role: 'Chef / quest-giver', portrait: '👨🏽‍🍳', expression: 'PANIC MODE', title: 'The Nori Emergency', objective: 'Gather 12 glowing nori sparks in the torii pantry.', reward: '+120 broth coins', dialogue: 'The pantry is in low orbit again. Bring me twelve nori sparks and I will make you a bowl worthy of a title screen.', type: 'stars', amount: 12, target: 180, arcadeTitle: 'Torii Nori Rush', arcadeSubtitle: 'Catch 12 nori sparks in 42 seconds', stage: 'torii-nori-stage.png', mode: 'nori-rush', briefing: 'Chef Beam’s nori has escaped into the shrine skyway. Catch twelve glowing sheets and avoid the rogue soup pots.', xlmReward: '0.75 XLM',
  },
  {
    id: 'mika', character: 'Mika', role: 'Rival courier', portrait: '🛼', expression: 'SMUG', title: 'No Scratches, Please', objective: 'Finish the Shinkansen drift with all three hearts.', reward: 'Rival respect + rare decal', dialogue: 'I would normally win this route blindfolded. Today I am being generous. Finish without a scratch and I might clap once.', type: 'perfect', amount: 1, target: 210, arcadeTitle: 'Shinkansen Drift Duel', arcadeSubtitle: 'Bank 210 sparks with zero scratches', stage: 'shinkansen-drift-stage.png', mode: 'shinkansen-drift', briefing: 'Mika has challenged you on the Shinkansen rain route. You need 210 sparks — and not one dent in the scooter.', xlmReward: '1.00 XLM',
  },
  {
    id: 'peep', character: 'P.E.E.P.', role: 'Suspicious space pigeon', portrait: '🕊️', expression: 'VERY NORMAL', title: 'Definitely Not Breadcrumbs', objective: 'Build a 5x combo on the lantern skyway.', reward: '+1 Pigeon-approved stamp', dialogue: 'Coo. I require five consecutive sparkly objects. For science. And absolutely not for a heist.', type: 'stars', amount: 5, target: 150, arcadeTitle: 'Lantern Flight', arcadeSubtitle: 'Hold a 5x lantern combo', stage: 'lantern-skyway-stage.png', mode: 'lantern-flight', briefing: 'P.E.E.P. needs five shiny lantern pickups in a row. Ignore the fact that this is exactly how a heist begins.', xlmReward: '0.50 XLM',
  },
];

export const storyBeats: StoryBeat[] = [
  { speaker: 'suzume', expression: 'DETERMINED', line: 'Okay, rookie. The Miso Meteor bounced out of the kitchen and into a three-lane cosmic freeway. That is… technically not ideal.' },
  { speaker: 'beam', expression: 'PANICKING', line: 'The bowl must arrive hot, the route must be safe, and nobody is allowed to eat the evidence. Your scooter has a boost button!' },
  { speaker: 'mika', expression: 'SMUG', line: 'Try not to steer into an asteroid. It makes the rest of us look bad. I will be observing from a very flattering angle.' },
  { speaker: 'yori', expression: 'ALARMED', line: 'Also, my cat drones are loose in Neon Alley. Please do not ask why they have tiny jetpacks. It is a long warranty story.' },
  { speaker: 'suzume', expression: 'FIRED UP', line: 'Collect sparks, dodge space junk, and keep the combo singing. First stop: the star map. Let’s make the cosmos hungry!' },
];
