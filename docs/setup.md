# Setup

Getting started with Carta local development.

## Prerequisites

- Modern web browser with Web Audio API support (Chrome, Firefox, Safari, Edge)
- Local web server (optional, for development)
- MIDI controller (optional, for enhanced playback)

## Quick Start

Carta is a single HTML file with no build process. There are three ways to run it:

### Option 1: Direct File Access
Simply open `index.html` in your browser:
```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

### Option 2: Local Server (Recommended for Development)
Using Python:
```bash
# Python 3
python -m http.server 8000

# Then open http://localhost:8000
```

Using Node.js:
```bash
npx serve .
# Then open http://localhost:3000
```

Using PHP:
```bash
php -S localhost:8000
```

### Option 3: VS Code Live Server
If using VS Code, install the "Live Server" extension and right-click `index.html` → "Open with Live Server".

## External Dependencies (CDN)

Carta loads these libraries from CDN - no installation required:

| Library | Version | Purpose |
|---------|---------|---------|
| Leaflet | 1.9.4 | Interactive map |
| Leaflet CSS | 1.9.4 | Map styling |

## Environment Variables

None required. Carta runs entirely in the browser.

## API Dependencies

### Elevation Data
- **Primary**: Open-Elevation API (`api.open-elevation.com`)
- **Fallback**: Open Topo Data (`api.opentopodata.org`)
- **Demo Mode**: Procedural terrain when APIs unavailable

No API keys required - these are free, public APIs.

## Browser Compatibility

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome 90+ | Full support | Recommended |
| Firefox 88+ | Full support | |
| Safari 14+ | Full support | |
| Edge 90+ | Full support | |

### Required Browser Features
- Web Audio API (AudioContext, OscillatorNode, PeriodicWave)
- Canvas 2D
- CSS Grid and Custom Properties
- Fetch API
- Web MIDI API (optional, for MIDI controllers)

## MIDI Setup (Optional)

1. Connect your MIDI controller before opening Carta
2. Allow MIDI access when browser prompts
3. Status bar shows connected device name
4. Controls:
   - Note On/Off: Play notes
   - Mod Wheel (CC1): Controls morph position
   - Velocity: Note volume

## Common Commands

```bash
# Start local server
python -m http.server 8000

# Open in browser (macOS)
open http://localhost:8000

# Check for JavaScript errors
# Open browser DevTools (F12) → Console tab
```

## Troubleshooting

### No Sound Playing
1. Click somewhere on the page first (browsers require user interaction to start audio)
2. Check that volume slider isn't at zero
3. Check browser isn't muted
4. Try a different browser

### Map Not Loading
1. Check internet connection (Leaflet tiles load from OpenStreetMap)
2. Check browser console for CORS errors
3. Try running from a local server instead of file://

### Terrain Fetch Fails
1. Open-Elevation API may be rate-limited or down
2. App automatically falls back to Open Topo Data
3. If both fail, demo mode generates procedural terrain
4. Check status bar for error messages

### MIDI Not Detected
1. Connect controller before opening Carta
2. Refresh the page after connecting
3. Ensure browser has MIDI permissions
4. Check that controller is sending on expected channel

### Audio Clicks/Pops
1. Close other browser tabs
2. Reduce system audio processing load
3. Try increasing envelope attack time
4. Use Chrome for best Web Audio performance

### Dark/Light Mode Issues
1. Toggle switches based on system preference
2. Use browser DevTools to test: `prefers-color-scheme` media query
3. Check that CSS variables are loading correctly
