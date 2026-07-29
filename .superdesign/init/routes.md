# Routes

The app uses React Router inside `src/App.tsx`, with every product page except the landing page rendered inside `AppShell`.

| Path | Component |
| --- | --- |
| `/` | `HomePage` |
| `/dashboard` | `DashboardPage` |
| `/missions` | `MissionsPage` |
| `/vault` | `VaultPage` |
| `/dispatch` | `DispatchPage` |
| `/settings` | `SettingsPage` |
| `/game` | `GamePage` |
| `/game/*` | game, story, map, quests, garage and leaderboard pages |
| `/story/manga` | `StoryMangaPage` |

An admin route should live under the `AppShell` and use the same sidebar/topbar, but remain absent from public navigation.

```tsx
<Routes>
  <Route path="/" element={<HomeLayout />} />
  <Route element={<AppShell />}>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/missions" element={<MissionsPage />} />
    <Route path="/vault" element={<VaultPage />} />
    <Route path="/dispatch" element={<DispatchPage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="/game" element={<GamePage />} />
  </Route>
</Routes>
```
