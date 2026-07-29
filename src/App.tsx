import { Component, createContext, useContext, useState, type ReactNode } from 'react';
import { Compass, Menu, WalletCards } from 'lucide-react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { Brand } from './components/Brand';
import { Prologue } from './components/Prologue';
import { AdminPage } from './pages/AdminPage';
import { DashboardPage } from './pages/DashboardPage';
import { DispatchPage } from './pages/DispatchPage';
import { GameMapPage } from './pages/GameMapPage';
import { GamePage } from './pages/GamePage';
import { GameStoryPage } from './pages/GameStoryPage';
import { GaragePage } from './pages/GaragePage';
import { HomePage } from './pages/HomePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { MissionsPage } from './pages/MissionsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { QuestArcadePage } from './pages/QuestArcadePage';
import { SettingsPage } from './pages/SettingsPage';
import { SideQuestsPage } from './pages/SideQuestsPage';
import { StoryMangaPage } from './pages/StoryMangaPage';
import { VaultPage } from './pages/VaultPage';
import { useWallet } from './hooks/useWallet';
import type { WalletState } from './lib/types';

type AppContextValue = { wallet: WalletState; connect: () => Promise<void>; launchStory: () => void };
const AppContext = createContext<AppContextValue | null>(null);
export const useApp = () => { const value = useContext(AppContext); if (!value) throw new Error('useApp must be used inside App.'); return value; };

function HomeLayout() {
  const { wallet, connect, launchStory } = useApp();
  return <><header className="landing-nav"><Brand /><nav><Link to="/how-it-works">How it works</Link><Link to="/dispatch">Live dispatch</Link><button className="wallet-button" onClick={connect}><WalletCards size={16} /> {wallet.address ? 'Wallet connected' : 'Connect wallet'}</button></nav><button className="landing-mobile-menu" onClick={launchStory}><Menu size={20} /></button></header><HomePage /></>;
}

export default function App() {
  const { wallet, connect } = useWallet(); const [storyOpen, setStoryOpen] = useState(false);
  return <AppContext.Provider value={{ wallet, connect, launchStory: () => setStoryOpen(true) }}><AppErrorBoundary>
    <Routes>
      <Route path="/" element={<HomeLayout />} />
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} /><Route path="/admin" element={<AdminPage />} /><Route path="/missions" element={<MissionsPage />} /><Route path="/vault" element={<VaultPage />} /><Route path="/dispatch" element={<DispatchPage />} /><Route path="/how-it-works" element={<HowItWorksPage />} /><Route path="/settings" element={<SettingsPage />} /><Route path="/game" element={<GamePage />} /><Route path="/game/story" element={<GameStoryPage />} /><Route path="/game/map" element={<GameMapPage />} /><Route path="/game/quests" element={<SideQuestsPage />} /><Route path="/game/quest/:questId" element={<QuestArcadePage />} /><Route path="/game/garage" element={<GaragePage />} /><Route path="/game/leaderboard" element={<LeaderboardPage />} /><Route path="/story/manga" element={<StoryMangaPage />} />
      </Route>
      <Route path="/start" element={<Navigate to="/" replace />} /><Route path="*" element={<NotFoundPage />} />
    </Routes>
    <Prologue forceOpen={storyOpen} onClose={() => setStoryOpen(false)} />
  </AppErrorBoundary></AppContext.Provider>;
}

class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { if (this.state.failed) return <main className="app-error"><Compass size={40} /><h1>The kitchen hit turbulence.</h1><p>Refresh the page to try the route again.</p><button className="button primary" onClick={() => window.location.assign('/')}>Return home</button></main>; return this.props.children; }
}
