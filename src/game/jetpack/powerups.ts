export type JetpackPowerupId = 'magnet' | 'chrono' | 'shield';

export type JetpackPowerupInventory = Record<JetpackPowerupId, number>;

export const emptyJetpackPowerups: JetpackPowerupInventory = { magnet: 0, chrono: 0, shield: 0 };

export const jetpackPowerups = [
  {
    id: 'magnet' as const,
    name: 'Udon Magnet',
    japanese: 'うどん磁石',
    price: '0.15',
    key: '1',
    duration: '7 seconds',
    description: 'Pulls ramen seals and Stellar sparks through the neon lane.',
  },
  {
    id: 'chrono' as const,
    name: 'Torii Chrono',
    japanese: '鳥居クロノ',
    price: '0.20',
    key: '2',
    duration: '4.5 seconds',
    description: 'Cuts traffic time in half while Suzume keeps her delivery line.',
  },
  {
    id: 'shield' as const,
    name: 'Kitsune Aegis',
    japanese: '狐の盾',
    price: '0.30',
    key: '3',
    duration: '6 seconds',
    description: 'A luminous fox barrier that absorbs one disastrous encounter.',
  },
] as const;

export const getJetpackPowerup = (id: JetpackPowerupId) => jetpackPowerups.find(powerup => powerup.id === id)!;
