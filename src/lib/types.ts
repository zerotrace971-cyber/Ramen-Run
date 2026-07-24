export type MissionStatus = 'ready' | 'running' | 'completed' | 'cooldown';

export interface Mission {
  id: number;
  title: string;
  district: string;
  flavor: string;
  reward: number;
  risk: 'chill' | 'spicy' | 'volcanic';
  eta: string;
  status: MissionStatus;
  icon: string;
  description: string;
}

export interface FeedEvent {
  id: string;
  actor: string;
  action: string;
  amount?: string;
  time: string;
  emoji: string;
}

export interface WalletState {
  address: string | null;
  isConnecting: boolean;
  error: string | null;
  testnetHash: string | null;
}
