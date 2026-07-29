# Key page dependency trees

## `/dashboard` — Command center

Entry: `src/pages/DashboardPage.tsx`

Dependencies:
- `src/pages/DashboardPage.tsx`
  - `src/components/StatusBadge.tsx`
  - `src/hooks/useMissionStream.ts`
  - `react-router-dom`
  - `lucide-react`
- `src/components/AppShell.tsx`
  - `src/components/Brand.tsx`
  - `src/components/StatusBadge.tsx`
  - `src/components/SuzumeChat.tsx`
- `src/styles.css`

## `/game` — Jetpack arcade

Entry: `src/pages/GamePage.tsx`

Dependencies:
- `src/pages/GamePage.tsx`
  - `src/game/jetpack/RamenJetpackGame.tsx`
  - `src/game/jetpack/powerups.ts`
  - `src/lib/stellar.ts`
  - `src/game/progress.ts`
- `src/components/AppShell.tsx`
- `src/styles.css`

## `/admin` — planned operations panel

Entry: `src/pages/AdminPage.tsx` (new)

Dependencies:
- `src/pages/AdminPage.tsx`
  - `src/lib/admin.ts` (new protected API client)
  - `src/components/StatusBadge.tsx`
  - `lucide-react`
- `src/components/AppShell.tsx`
- `src/styles.css`
