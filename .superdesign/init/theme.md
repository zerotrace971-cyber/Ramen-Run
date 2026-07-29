# Theme

## Compact token summary

- Ink backgrounds: `--ink #080717`, `--ink-2 #111027`, `--ink-3 #1b1938`
- Paper and text: `--paper #f7f5f0`, `--muted #9d9ab5`
- Accents: cyan `#5ae5e1`, pink `#ff5e9e`, gold `#ffc95b`, purple `#9a76ff`
- Type: Bricolage Grotesque headings/body; Space Mono labels; DM Mono code
- Shell: sticky 230px dark sidebar, 72px translucent topbar, 38px desktop page padding
- Cards: 1px translucent white borders, 14px rounded corners, dark purple gradients, compact cyan eyebrow labels
- Motion: small translate-on-hover; bright status dots; restrained manga asymmetry in selected panels

## Relevant raw CSS source

Source: `src/styles.css`

```css
:root { --ink:#080717; --ink-2:#111027; --ink-3:#1b1938; --paper:#f7f5f0; --muted:#9d9ab5; --line:rgba(255,255,255,.1); --cyan:#5ae5e1; --pink:#ff5e9e; --gold:#ffc95b; --purple:#9a76ff; font-family:'Bricolage Grotesque',system-ui,sans-serif; color:var(--paper); background:var(--ink); }
.app-layout { min-height:100vh; display:grid; grid-template-columns:230px minmax(0,1fr); background:#0b0a1c; }
.sidebar { position:sticky; top:0; height:100vh; padding:24px 15px 18px; display:flex; flex-direction:column; border-right:1px solid var(--line); background:#0d0c20; }
.topbar { min-height:72px; padding:0 37px; display:flex; align-items:center; justify-content:flex-end; border-bottom:1px solid var(--line); background:rgba(13,12,31,.75); backdrop-filter:blur(18px); }
.page-container { max-width:1410px; padding:38px 38px 60px; margin:auto; }
.page-title { display:flex; align-items:flex-start; justify-content:space-between; gap:25px; margin-bottom:29px; }
.page-title>div>p { color:var(--cyan); font:700 .71rem/1 'Space Mono',monospace; letter-spacing:.08em; }
.page-title h1 { margin:8px 0; font-size:clamp(2.2rem,4vw,3.4rem); line-height:.92; letter-spacing:-.085em; }
.panel { padding:21px; border:1px solid var(--line); border-radius:14px; background:linear-gradient(135deg,#121126,#0f0e22); }
.status-badge { display:inline-flex; align-items:center; gap:7px; padding:5px 8px; border:1px solid currentColor; border-radius:999px; font-size:.64rem; font-weight:750; }
.status-badge.cyan { color:var(--cyan); background:rgba(90,229,225,.07); }
@media (max-width:850px) { .app-layout { grid-template-columns:1fr; } }
```
