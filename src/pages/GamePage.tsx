import { ArrowLeft, CheckCircle2, ShoppingBag, Sparkles, WalletCards } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../App';
import RamenJetpackGame, { type JetpackReceiptState, type JetpackRunResult } from '../game/jetpack/RamenJetpackGame';
import { jetpackPowerups, type JetpackPowerupId } from '../game/jetpack/powerups';
import { useGameProgress } from '../game/progress';
import { config } from '../lib/config';
import { claimJetpackDeliveryReward, purchaseJetpackPowerup } from '../lib/stellar';

type ShopState = { id?: JetpackPowerupId; status: 'idle' | 'loading' | 'ready' | 'error'; message?: string; hash?: string };

export function GamePage() {
  const { wallet, connect } = useApp();
  const { progress, update } = useGameProgress();
  const [reward, setReward] = useState<JetpackReceiptState>({ status: 'idle' });
  const [shop, setShop] = useState<ShopState>({ status: 'idle' });

  const recordRun = useCallback((result: JetpackRunResult) => {
    setReward({ status: 'idle' });
    update(current => {
      const delivered = result.outcome === 'delivered';
      const completed = new Set(current.completedLevels);
      if (delivered) completed.add(1);
      return {
        runs: current.runs + 1,
        highScore: Math.max(current.highScore, result.score),
        coins: current.coins + (delivered ? 80 + result.ramen * 6 + result.sparks * 10 : 8),
        unlockedLevel: delivered ? Math.max(current.unlockedLevel, 2) : current.unlockedLevel,
        completedLevels: [...completed],
        perfectRuns: current.perfectRuns + (delivered && !result.shieldUsed && result.hitsTaken === 0 ? 1 : 0),
        bestCombo: Math.max(current.bestCombo, result.bestCombo),
      };
    });
  }, [update]);

  const usePowerup = useCallback((id: JetpackPowerupId) => {
    if ((progress.jetpackPowerups[id] ?? 0) < 1) return false;
    update(current => ({
      jetpackPowerups: { ...current.jetpackPowerups, [id]: Math.max(0, (current.jetpackPowerups[id] ?? 0) - 1) },
    }));
    return true;
  }, [progress.jetpackPowerups, update]);

  const claimReward = useCallback(async (run: JetpackRunResult) => {
    if (!wallet.address) {
      await connect();
      setReward({ status: 'error', message: 'Freighter is connected. Tap Claim delivery reward once more.' });
      return;
    }
    setReward({ status: 'loading' });
    try {
      const result = await claimJetpackDeliveryReward(wallet.address, run);
      setReward({ status: 'ready', hash: result.hash, amount: result.amount, message: result.message });
    } catch (error) {
      setReward({ status: 'error', message: error instanceof Error ? error.message : 'Could not send the Testnet delivery reward.' });
    }
  }, [connect, wallet.address]);

  const buyPowerup = useCallback(async (id: JetpackPowerupId) => {
    if (!wallet.address) {
      await connect();
      setShop({ id, status: 'error', message: 'Freighter is connected. Tap the item once more to approve its Testnet XLM payment.' });
      return;
    }
    setShop({ id, status: 'loading' });
    try {
      const purchase = await purchaseJetpackPowerup(wallet.address, id);
      update(current => ({ jetpackPowerups: { ...current.jetpackPowerups, [id]: (current.jetpackPowerups[id] ?? 0) + 1 } }));
      setShop({ id, status: 'ready', hash: purchase.hash, message: `${purchase.amount} paid on Stellar Testnet. Added to Suzume’s loadout.` });
    } catch (error) {
      setShop({ id, status: 'error', message: error instanceof Error ? error.message : 'The Testnet shop purchase could not be completed.' });
    }
  }, [connect, update, wallet.address]);

  return <div className="arcade-page jetpack-page">
    <header className="arcade-topbar">
      <Link to="/game/map"><ArrowLeft size={18} /> Stellar map</Link>
      <div className="arcade-title"><span>SUZUME’S RAMEN RUN · がんばれ!</span><b>Jetpack Delivery</b></div>
      <div className="jetpack-wallet-status">
        {wallet.address ? <><Sparkles size={15} /> Freighter ready</> : <button onClick={() => void connect()}><WalletCards size={16} /> Connect Freighter</button>}
      </div>
    </header>

    <section className="jetpack-store" aria-labelledby="jetpack-store-title">
      <div className="jetpack-store-heading">
        <span><ShoppingBag size={16} /> TESTNET SUPPLY WINDOW</span>
        <div><h2 id="jetpack-store-title">Suzume’s rooftop shop</h2><p>Three one-use route tools. Buy with an explicit Freighter Testnet XLM payment, then trigger them mid-flight.</p></div>
        <small>{config.jetpackStoreAddress ? 'Freighter checkout enabled' : 'Add the shop address to enable checkout'}</small>
      </div>
      <div className="jetpack-store-grid">
        {jetpackPowerups.map(powerup => <article className={`jetpack-store-card ${powerup.id}`} key={powerup.id}>
          <span className={`powerup-art ${powerup.id}`} aria-hidden="true" />
          <div className="powerup-copy"><span>{powerup.japanese}</span><h3>{powerup.name}</h3><p>{powerup.description}</p><small>Press {powerup.key} in-flight · {powerup.duration}</small></div>
          <div className="powerup-buy"><b>{progress.jetpackPowerups[powerup.id] ?? 0}<small> in bag</small></b><button onClick={() => void buyPowerup(powerup.id)} disabled={shop.status === 'loading' || !config.jetpackStoreAddress}>{shop.status === 'loading' && shop.id === powerup.id ? 'Opening Freighter…' : `${powerup.price} XLM · Buy`}</button></div>
        </article>)}
      </div>
      {shop.status !== 'idle' && <p className={`jetpack-shop-message ${shop.status}`}>
        {shop.status === 'ready' && <CheckCircle2 size={15} />}{shop.message}
        {shop.hash && <a href={`https://stellar.expert/explorer/testnet/tx/${shop.hash}`} target="_blank" rel="noreferrer"> View transaction ↗</a>}
      </p>}
    </section>

    <RamenJetpackGame onRunEnd={recordRun} onClaimDeliveryReward={run => void claimReward(run)} reward={reward} powerups={progress.jetpackPowerups} onUsePowerup={usePowerup} />
    <footer className="arcade-footer"><span><Sparkles size={14} /> Runs: {progress.runs}</span><span>Broth coins: {progress.coins}</span><span>High score: {progress.highScore}</span><Link to="/game/quests">Character side quests →</Link></footer>
  </div>;
}
