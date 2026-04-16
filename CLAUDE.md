# BP Risk Toolkit

Interactive service blueprint portfolio app for BP's Risk Toolkit — four safety tools used in offshore oil rig operations.

## Stack
- React + Vite + Tailwind CSS v4 + Framer Motion + React Router
- Static content — no backend, all data in `src/data/`
- Desktop-only — no mobile breakpoints

## Key Concepts
- **Two organizations**: BP (green `#007F00`) and ACME Oil Rigs (orange `#FF9900`) — always color-coded
- **HUD aesthetic**: monospace labels, bracket notation `[ 01 / PHASE ]`, status readouts, crosshair marks — on a white/light canvas
- **Rig Verification** is the researched blueprint (from real interviews); the other three are informed extrapolations

## Architecture
- `src/data/blueprints/` — blueprint content (phases, actions, outputs, roles)
- `src/data/roles.js` — role definitions with org affiliations and avatar paths
- `src/pages/Landing.jsx` — hero + 4 blueprint cards
- `src/pages/BlueprintViewer.jsx` — horizontal scroll canvas with fixed left rail, phase columns, detail panel
- `src/components/` — PhaseColumn, DetailPanel, OutputIcon, BlueprintCard, OilRigIllustration
- `src/assets/headshots/` — role avatar PNGs

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build to `dist/`

## Design Tokens
Defined in `src/index.css` via `@theme` block. BP brand palette: green, dark green, light green, yellow, yellow-orange, dark blue, silver, dark grey.
Typography: DM Sans (body), IBM Plex Mono (HUD labels).
