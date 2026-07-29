# Extractable components

## AppShell

- Source: `src/components/AppShell.tsx`
- Category: layout
- Description: Persistent sidebar, topbar, wallet status and page outlet.
- Extractable props: `activeItem` (string), `walletConnected` (boolean), `walletLabel` (string).
- Hardcoded: Suzume brand, navigation labels, Stellar network badge, chat launcher.

## Brand

- Source: `src/components/Brand.tsx`
- Category: basic
- Description: Compact Suzume’s Stellar Ramen Run logo link.
- Extractable props: none.
- Hardcoded: Sparkle mark, product name, destination URL.

## StatusBadge

- Source: `src/components/StatusBadge.tsx`
- Category: basic
- Description: Small outlined, color-coded status pill.
- Extractable props: `tone` (cyan/gold/pink/muted), text.
- Hardcoded: glowing dot and compact label format.
