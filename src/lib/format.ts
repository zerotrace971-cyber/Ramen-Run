export const shortenAddress = (address?: string | null) => {
  if (!address) return 'Not connected';
  return `${address.slice(0, 5)}…${address.slice(-4)}`;
};

export const formatXlm = (amount: number) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);

export const relativeTime = (seconds: number) => {
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  return `${minutes}m ago`;
};
