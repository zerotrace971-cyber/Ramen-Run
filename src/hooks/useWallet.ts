import { useCallback, useState } from 'react';
import { getAddress, requestAccess } from '@stellar/freighter-api';
import type { WalletState } from '../lib/types';

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({ address: null, isConnecting: false, error: null, testnetHash: null });

  const connect = useCallback(async () => {
    setWallet((state) => ({ ...state, isConnecting: true, error: null }));
    let address: string | null = null;
    try {
      // Request access first: this is what opens Freighter's approval window.
      const access = await requestAccess();
      if (access.error) throw new Error(access.error);
      const result = await getAddress();
      if (result.error || !result.address) throw new Error(result.error ?? 'Freighter did not return an address.');
      address = result.address;
      setWallet({ address, isConnecting: true, error: null, testnetHash: null });
      const { createWalletHandshake } = await import('../lib/stellar');
      const testnetHash = await createWalletHandshake(address);
      setWallet({ address, isConnecting: false, error: null, testnetHash });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not connect wallet.';
      setWallet({ address, isConnecting: false, error: address ? `Wallet connected, but the Testnet check-in needs attention: ${message}` : message, testnetHash: null });
    }
  }, []);

  return { wallet, connect };
}
