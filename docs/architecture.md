# Architecture

## Overview

Carta is a terrain wavetable synthesizer implemented as a single HTML file. It fetches real elevation data from map locations and converts it into playable wavetables using the Web Audio API. The architecture prioritizes simplicity—no build tools, no backend, just open and play.

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Structure | Single HTML file | All CSS/JS inline, ~4500 lines |
| Map | Leaflet.js | CDN, interactive tile map |
| 3D Visualization | Three.js | CDN, terrain mesh rendering |
| Audio | Web Audio API | Native browser synthesis |
| Elevation Data | Open-Elevation API | Free, no API key required |
| Styling | CSS Variables | Light/dark theme support |

## Key Components

```
index.html
├── CSS Styles (~800 lines)
│   ├── Theme variables (light/dark)
│   ├── Layout (header, main, controls, footer)
│   └── Component styles (sliders, dropdowns, buttons)
│
├── HTML Structure (~400 lines)
│   ├── Header (title, volume, theme toggle)
│   ├── Main (map panel, terrain/waveform panel)
│   ├── Controls (morph, filter, 3-column section, footer)
│   └── Status bar
│
└── JavaScript (~3300 lines)
    ├── TerrainService - Fetches and processes elevation data
    ├── SearchService - Geocoding for location search
    ├── ShimmerReverb - Freeverb-style algorithmic reverb
    ├── AudioEngine - Web Audio synthesis and routing
    ├── ScaleManager - Musical scale definitions
    ├── Terrain3D - Three.js mesh visualization
    ├── WaveformDisplay - Canvas 2D waveform drawing
    ├── Keyboard - Computer keyboard input handling
    ├── MIDIManager - Web MIDI API integration
    ├── GenerativeSequencer - Auto-play engine
    ├── LFO - Low frequency oscillator
    ├── ModulationManager - Routes LFOs to destinations
    ├── ModDestination - Individual modulation target
    ├── CustomSelect - Styled dropdown replacement
    └── App - Main application orchestrator
```

## Data Flow

### Terrain → Wavetable Pipeline

```
1. User clicks map
   ↓
2. TerrainService calculates 256x32 grid of coordinates
   ↓
3. Open-Elevation API returns elevation values
   ↓
4. Normalize to [-1, +1] range
   ↓
5. Each row (256 samples) → FFT → PeriodicWave
   ↓
6. Store 32 PeriodicWave objects (wavetable frames)
   ↓
7. Morphing interpolates between adjacent frames
```

### Audio Signal Path

```
Oscillator A (frame N) ──→ Gain A ──┐
                                    ├──→ Filter ──→ Dry/Wet ──→ Master ──→ Output
Oscillator B (frame N+1) ──→ Gain B ──┘                 ↓
                                                    Reverb
```

### Modulation Routing

```
LFO 1/2 ──→ ModulationManager ──→ ModDestination (Morph)
                              └──→ ModDestination (Filter)

ModDestination calculates: output = offset + (LFO × range)
```

## External Services

- **Open-Elevation API** (`api.open-elevation.com`) — Primary elevation data source
- **OpenTopoData** (`api.opentopodata.org`) — Fallback elevation source
- **Nominatim** (`nominatim.openstreetmap.org`) — Geocoding for location search
- **OpenStreetMap** — Map tiles via Leaflet

## Core Patterns

### Single-File Architecture
Everything in one HTML file for maximum portability. No npm, no bundler, no server required. Trade-off: harder to maintain at scale, but perfect for a focused prototype.

### Wavetable Morphing
Two oscillators play adjacent wavetable frames simultaneously. Crossfading between them creates smooth timbral transitions as you move through the terrain.

### Modulation as Multiplexer
The ModulationManager runs a single animation loop that updates all registered ModDestinations. Each destination applies its own range/offset transformation independently.

### CSS Variables for Theming
All colors defined as CSS custom properties on `:root`. The `.light-mode` class overrides them, enabling instant theme switching without JavaScript style manipulation.
