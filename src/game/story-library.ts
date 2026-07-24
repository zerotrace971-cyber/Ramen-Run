import type { AnimeCharacterId } from '../components/Prologue';
import type { StorySoundscape } from './useStoryAudio';

export type MangaPage = {
  chapter: number;
  chapterTitle: string;
  page: number;
  title: string;
  background: string;
  sound: StorySoundscape;
  cast: AnimeCharacterId[];
  narration: string;
  lines: Array<{ speaker: AnimeCharacterId; mood: string; text: string }>;
  stamp: string;
};

export const mangaPages: MangaPage[] = [
  { chapter: 1, chapterTitle: 'Midnight Hunger', page: 1, title: 'The Last Delivery', background: 'rain-market-story-stage.png', sound: 'rain', cast: ['suzume'], narration: 'Noodle Nova, 2:17 AM. The rain has a rhythm, and the city has one remaining order.', lines: [{ speaker: 'suzume', mood: 'watchful', text: 'One last bowl. One quiet route. Nothing weird.' }], stamp: 'DRIP… DRIP…' },
  { chapter: 1, chapterTitle: 'Midnight Hunger', page: 2, title: 'A Very Loud Meteor', background: 'neon-route-stage.png', sound: 'neon', cast: ['beam', 'suzume'], narration: 'The cosmos hears the word “quiet” and takes it personally.', lines: [{ speaker: 'beam', mood: 'panic', text: 'Suzume! The miso meteor has escaped the kitchen!' }, { speaker: 'suzume', mood: 'grin', text: 'Finally. A reasonable shift.' }], stamp: 'KABOOOM!' },
  { chapter: 2, chapterTitle: 'Stamps in the Wind', page: 3, title: 'Three Lights Scatter', background: 'shinkansen-drift-stage.png', sound: 'train', cast: ['mika'], narration: 'The impact splits the route map into three luminous Stellar Stamps.', lines: [{ speaker: 'mika', mood: 'smug', text: 'A disaster with excellent pacing. I approve.' }], stamp: 'SHHHH!' },
  { chapter: 2, chapterTitle: 'Stamps in the Wind', page: 4, title: 'Yori’s Warranty', background: 'neon-route-stage.png', sound: 'neon', cast: ['yori'], narration: 'One stamp bolts through Laser Alley. So do Yori’s experimental cat drones.', lines: [{ speaker: 'yori', mood: 'worry', text: 'They were not meant to chase cosmic artifacts. They were meant to chase moths.' }], stamp: 'MEE-OW!' },
  { chapter: 3, chapterTitle: 'The Torii Pantry', page: 5, title: 'Nori in Orbit', background: 'torii-nori-stage.png', sound: 'kitchen', cast: ['beam', 'yori'], narration: 'At the shrine pantry, every nori sheet catches a different stream of starlight.', lines: [{ speaker: 'beam', mood: 'despair', text: 'Without the stamps, the kitchen map is abstract art!' }, { speaker: 'yori', mood: 'focus', text: 'Abstract art can still have a power socket.' }], stamp: 'FWIP! FWIP!' },
  { chapter: 3, chapterTitle: 'The Torii Pantry', page: 6, title: 'A Deal at Dawn', background: 'rain-market-story-stage.png', sound: 'rain', cast: ['suzume', 'beam'], narration: 'Chef Beam makes a promise: restore the routes, and every courier gets a bowl on the house.', lines: [{ speaker: 'suzume', mood: 'ready', text: 'You had me at bowl.' }, { speaker: 'beam', mood: 'hope', text: 'I had you at “on the house.”' }], stamp: 'CLINK.' },
  { chapter: 4, chapterTitle: 'Alley of Nine Lives', page: 7, title: 'Laser Cat Chase', background: 'neon-route-stage.png', sound: 'neon', cast: ['yori', 'suzume'], narration: 'Yori’s cat drones sprint between laser gates with the first stamp blinking from a rooftop.', lines: [{ speaker: 'yori', mood: 'alarm', text: 'Six drones. Three lasers. Please choose the cats.' }, { speaker: 'suzume', mood: 'hero', text: 'I was born for very specific rescue missions.' }], stamp: 'ZIP! ZIP!' },
  { chapter: 4, chapterTitle: 'Alley of Nine Lives', page: 8, title: 'Turbo Paw', background: 'rain-market-story-stage.png', sound: 'rain', cast: ['yori', 'suzume'], narration: 'The last drone returns the stamp, its tiny engine purring like a pocket comet.', lines: [{ speaker: 'yori', mood: 'hope', text: 'You saved my drones. I will pretend I was calm.' }, { speaker: 'suzume', mood: 'grin', text: 'You shook a wrench at the clouds.' }], stamp: 'PURRRR.' },
  { chapter: 5, chapterTitle: 'Railway Rivalry', page: 9, title: 'The Drift Challenge', background: 'shinkansen-drift-stage.png', sound: 'train', cast: ['mika', 'suzume'], narration: 'The second stamp rides the rain rail. Mika is already waiting at the first curve.', lines: [{ speaker: 'mika', mood: 'challenge', text: 'Keep the scooter in my drift line. No scratches.' }, { speaker: 'suzume', mood: 'ready', text: 'Then blink slowly.' }], stamp: 'VRRRAAM!' },
  { chapter: 5, chapterTitle: 'Railway Rivalry', page: 10, title: 'Lantern Memory', background: 'lantern-skyway-stage.png', sound: 'lantern', cast: ['mika', 'suzume'], narration: 'The final stamp becomes a lantern pattern in the sky. P.E.E.P. knows the sequence and refuses to explain why.', lines: [{ speaker: 'mika', mood: 'smug', text: 'Five lights. One chance. Try not to improvise.' }, { speaker: 'suzume', mood: 'watchful', text: 'I am excellent at remembering shiny things.' }], stamp: 'GLOW… GLOW…' },
  { chapter: 6, chapterTitle: 'The Shrine of Starlight', page: 11, title: 'All Routes Home', background: 'stardust-shrine-finale-stage.png', sound: 'shrine', cast: ['suzume', 'beam', 'mika', 'yori'], narration: 'At sunrise, three stamps lock together above the floating torii. The route map remembers itself.', lines: [{ speaker: 'beam', mood: 'hope', text: 'The kitchen can see every road again!' }, { speaker: 'yori', mood: 'focus', text: 'And every road can see the kitchen. That is… mostly good.' }], stamp: 'CHIME!' },
  { chapter: 6, chapterTitle: 'The Shrine of Starlight', page: 12, title: 'The First Bowl', background: 'stardust-shrine-finale-stage.png', sound: 'shrine', cast: ['suzume', 'beam', 'mika', 'yori'], narration: 'Noodle Nova wakes up. The routes glow. The first bowl of the restored night is ready.', lines: [{ speaker: 'mika', mood: 'smug', text: 'Almost competent, rookie.' }, { speaker: 'suzume', mood: 'hero', text: 'Save that compliment. We have a whole galaxy to feed.' }], stamp: 'THE END… FOR TONIGHT.' },
];
