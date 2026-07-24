export function StatusBadge({ children, tone = 'cyan' }: { children: React.ReactNode; tone?: 'cyan' | 'gold' | 'pink' | 'muted' }) {
  return <span className={`status-badge ${tone}`}><i />{children}</span>;
}
