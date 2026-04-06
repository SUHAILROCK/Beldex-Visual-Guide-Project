# CLAUDE.md - Beldex Visual Guide Project Memory

Read this file at the start of every session. It is the source of truth for this project.

---

## What This Project Is

An interactive visual educational website explaining the Beldex privacy blockchain ecosystem. Targeted at beginners who want to understand complex blockchain/cryptography concepts through diagrams, flowcharts, and structured UI.

Built with: HTML5, CSS3, Vanilla JavaScript (no frameworks, no build tools).

Live at:
- GitHub Pages: https://suhailrock.github.io/Beldex-Visual-Guide-Project/
- Vercel: https://beldex-guide-project.vercel.app/

---

## Folder Structure

```
Beldex-Visual-Guide-Project/
  index.html                    # Main entry point, single-page app with tab navigation
  style.css                     # Legacy/root-level stylesheet (may be unused or partial)
  favicon.svg                   # SVG favicon
  vercel.json                   # Vercel deployment config
  README.md                     # Public readme

  styles/                       # Modular CSS (loaded in index.html <head>)
    variables.css               # CSS custom properties, root colors, fonts, spacing
    base.css                    # Global reset and body defaults
    ecosystem.css               # Ecosystem section cards/layout
    links.css                   # Links section styles
    exchanges.css               # Exchanges section styles
    timeline.css                # Timeline section styles
    overview.css                # Overview/hero section styles
    research.css                # Research section styles
    challenges.css              # Challenges section (EVM deep dive)
    contracts.css               # Smart contracts section styles
    overrides.css               # One-off overrides and patches
    funding.css                 # Funding section styles
    ecosystem-tree.css          # Ecosystem tree diagram styles
    theme-light.css             # Light mode overrides (data-theme="light")
    market.css                  # Market/price section styles
    core-tech-stack.css         # Core tech stack section styles

  js/                           # Vanilla JS modules (ES modules)
    main.js                     # Entry point, imports and initializes all modules
    theme.js                    # Light/dark theme toggle (persists to localStorage)
    tabs.js                     # Tab switching logic for nav tabs
    animations.js               # Scroll/intersection animations
    ui-effects.js               # Misc UI effects
    timeline.js                 # Timeline section interactivity
    search.js                   # Search functionality
    price-widget.js             # BDX price widget (lazy-loaded, only on market/exchanges tabs)
    utils.js                    # Shared utilities

  images/
    logos/                      # Beldex, Bytecoin, Cryptonote, Monero logos
    team/                       # Team member photos (jpg + png pairs)
    tech/                       # Technical diagram images (stealth addresses, ring sigs, etc.)

  Products/                     # Standalone product explanation pages
    shared-styles.css           # Shared CSS for all Products pages
    bchat.html                  # BChat product page
    belnet.html                 # Belnet product page
    bns.html                    # Beldex Name Service page
    beldex-browser.html         # Beldex Browser product page
    beldex-browser-explained.html
    federated-learning.html     # Federated Learning explainer

  tech/                         # Deep-dive technical explanation pages
    privacy/
      tech-cryptonote.html      # CryptoNote protocol
      tech-cryptonote-flowchart.html
      tech-ring-signatures.html # Ring Signatures
      tech-ringct.html          # RingCT
      tech-stealth-addresses.html
      tech-bulletproof.html     # Bulletproof++
      tech-privacy-map.html     # Privacy technology map
    consensus/
      tech-proof-of-stake.html  # Proof of Stake
      tech-utxo.html            # UTXO model
    core/
      beldex-block-structure.html
      beldex-hardforks.html
      beldex-masternode.html
      beldex-pos-consensus.html
      beldex-tx-architecture.html
      beldex-vrf-consensus.html
    network/
      tech-belnet.html          # Belnet network
      tech-layerzero.html       # LayerZero bridge
      tech-masternode.html      # Masternode network
    partners/
      beldex-partners.html
    research/
      tech-evm.html             # EVM integration
      tech-vrf.html             # VRF (Verifiable Random Function)
      tech-zk-snarks.html       # zk-SNARKs
      beldex-evm-integration.html
    product's - L2/             # Note: folder name has apostrophe and space
      beldex-bchat-easy.html
      beldex-bchat-medium.html
      beldex-bchat-hard.html
      beldex-belnet-L1.html
      beldex-belnet-l2.html
      beldex-browser-l1.html

  Other standalone pages (root level):
    beldex-privacy-sandbox.html
    beldex-products.html
    beldex-stats.html
    beldex-tokenomics.html
    beldex-tree.html

  api/
    explorer.js                 # Blockchain explorer API integration

  archive/
    script.js                   # Old/archived script

  .agents/skills/frontend-design/SKILL.md  # Claude Code frontend-design skill config
```

---

## Main Page Tabs (index.html)

The main page is a single-page app with a tab navigation system. Tabs:

1. **overview** - Hero/intro, product ecosystem cards, privacy features
2. **team** - Team member profiles with photos
3. **market** - BDX price/market data (price widget lazy-loads here)
4. **exchanges** - Exchange listings (price widget also shown here)
5. **timeline** - Project history timeline
6. **ecosystem** - Ecosystem overview and tree diagram
7. **research** - Research topics, links to deep-dive pages
8. **links** - Useful external links
9. **evm-deep-dive** - EVM integration deep dive with sub-sections:
   - Vision, Proof of Concept, Architecture, Comparison, How It Works, Privacy, Challenges
10. **tokenomics** - Token distribution and economics

---

## Design System

### Theme
- Default: dark mode ("Encrypted Luxury" aesthetic)
- Light mode available via toggle (persisted in localStorage as `beldex-theme`)
- Theme applied via `data-theme="light"` on `<html>`

### Color Palette (dark mode, from variables.css)
- Background body: `#030306`
- Card background: `#0a0b10`
- Card hover: `#111318`
- Primary (Mint green): `#22d9a0`
- Secondary (Electric blue): `#3b82f6`
- Accent (Cyber purple): `#8b5cf6`
- Gold accent: `#d4a853`
- Text main: `#f0f0f5`
- Text muted: `#6b7280`

### Products pages color palette (shared-styles.css)
- Background: `#080d12`
- Teal: `#00e5c0`
- Amber: `#f5a623`
- Violet: `#a78bfa`
- Text: `#dde8f0`

### Typography
- Headings: **Syne** (Google Fonts, weights 400-800)
- Body: **Outfit** (Google Fonts, weights 300-700)
- Monospace/code: **IBM Plex Mono** (Google Fonts)
- Products pages use **Inter** instead of Outfit

### Spacing and Radius
- Large radius: `20px`
- Medium radius: `14px`
- Small radius: `6px`

### Animations
- Primary easing: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo)
- Spring easing: `cubic-bezier(0.34, 1.56, 0.64, 1)`

---

## Notable Features

- **Password gate** on index.html: A styled overlay prompts for a password before showing the site. Inline CSS for instant paint. Shakes on wrong password.
- **Price widget**: Lazy-loaded only when user visits market or exchanges tab. Uses CoinGecko API.
- **Light/dark theme toggle**: Button in the header, theme saved to localStorage.
- **Search**: Built into the navigation area.
- **Tech detail pages**: Each major tech topic has its own standalone HTML page under `tech/` or `Products/`, linked from the main page.

---

## User Preferences

- **Never use em dashes** ("---" or "—") in code or content. Use commas, periods, or other punctuation instead.
- This project is vanilla HTML/CSS/JS.
- Keep pages self-contained where possible. The `Products/shared-styles.css` is shared across all product pages.

---

## GitHub Info

- Repo owner: SUHAILROCK (GitHub handle)
- Remote URL: origin points to the GitHub repo for suhailrock
- Main branch is `main`
- Auto-deploys to both GitHub Pages and Vercel on push to main
