export const config = {
  network: import.meta.env.VITE_STELLAR_NETWORK ?? 'TESTNET',
  rpcUrl: import.meta.env.VITE_SOROBAN_RPC_URL ?? 'https://soroban-testnet.stellar.org',
  vaultContract: import.meta.env.VITE_RAMEN_VAULT_CONTRACT_ID ?? '',
  stampContract: import.meta.env.VITE_STAMP_NFT_CONTRACT_ID ?? '',
  eventStreamUrl: import.meta.env.VITE_EVENT_STREAM_URL ?? '',
  suzumeProxy: import.meta.env.VITE_GEMINI_PROXY_URL ?? '/api/suzume',
  questRewardApi: import.meta.env.VITE_QUEST_REWARD_API ?? '/api/claim-quest',
  jetpackRewardApi: import.meta.env.VITE_JETPACK_REWARD_API ?? '/api/claim-jetpack-reward',
  jetpackStoreAddress: import.meta.env.VITE_JETPACK_STORE_ADDRESS ?? '',
};

export const isDemoMode = !config.vaultContract || !config.stampContract;
