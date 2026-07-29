# Shared components

## `Brand`

Source: `src/components/Brand.tsx` — the application brand link used in the landing header and sidebar.

```tsx
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Brand() {
  return <Link to="/" className="brand" aria-label="Suzume's Stellar Ramen Run home"><span className="brand-mark"><Sparkles size={18} /></span><span><b>Suzume’s</b><small>STELLAR RAMEN RUN</small></span></Link>;
}
```

## `StatusBadge`

Source: `src/components/StatusBadge.tsx` — reusable inline network/status pill.

```tsx
export function StatusBadge({ children, tone = 'cyan' }: { children: React.ReactNode; tone?: 'cyan' | 'gold' | 'pink' | 'muted' }) {
  return <span className={`status-badge ${tone}`}><i />{children}</span>;
}
```
