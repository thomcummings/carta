# Carta

A terrain wavetable synthesizer that transforms Earth's topography into sound. Click anywhere on the map, and Carta fetches real elevation data to generate unique wavetables you can play as a musical instrument.

## How It Works

1. **Select a location** - Click on the map or search for a place
2. **Terrain becomes sound** - Elevation data is converted into wavetable frames
3. **Play and explore** - Use your keyboard (A-L keys) or MIDI controller to play notes shaped by the terrain

## Features

- **Real elevation data** - Fetches actual topography from Open-Elevation API
- **Wavetable synthesis** - Terrain profiles become playable waveforms
- **Morph control** - Smoothly travel through the terrain from North to South
- **Dual LFOs** - Modulate morph position and filter cutoff with sine waves
- **Filter** - Lowpass filter with resonance and modulation
- **Reverb** - Freeverb-style algorithmic reverb with size, decay, damping, pre-delay, and shimmer
- **Generative sequencer** - Auto-play random or patterned melodies constrained to scales
- **MIDI support** - Connect hardware controllers, use mod wheel for morphing
- **3D terrain visualization** - See the terrain mesh with current morph position highlighted
- **Light/Dark themes** - Respects system preference, toggleable

## Quick Start

No build step required. Just open `index.html` in a modern browser.

```bash
# Clone the repo
git clone https://github.com/thomcummings/carta.git
cd carta

# Open in browser
open index.html
```

Or serve locally:
```bash
python -m http.server 8000
# Visit http://localhost:8000
```

## Controls

### Keyboard
| Key | Note |
|-----|------|
| A | C4 |
| S | D4 |
| D | E4 |
| F | F4 |
| G | G4 |
| H | A4 |
| J | B4 |
| K | C5 |
| L | D5 |

### MIDI
- Note On/Off for playing
- Mod Wheel (CC1) can be mapped to morph or filter modulation

### Modulation
- **Range** - How much of the parameter range to sweep (0-100%)
- **Offset** - Where the sweep starts (0-100%)
- Example: Range=50%, Offset=25% sweeps from 25% to 75%

## Tech Stack

- **Single HTML file** - No build tools, no dependencies to install
- **Leaflet.js** - Interactive map (CDN)
- **Three.js** - 3D terrain visualization (CDN)
- **Web Audio API** - Synthesis engine
- **Open-Elevation API** - Terrain data

## Browser Support

Requires a modern browser with:
- Web Audio API
- ES6+ JavaScript
- WebGL (for 3D visualization)

Tested in Chrome, Firefox, Safari.

## License

MIT
