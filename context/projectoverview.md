# Carta - Project Overview

## What It Is

Carta is an experimental terrain wavetable synthesizer that transforms real-world elevation data into playable musical instruments. Click anywhere on a map, and the app fetches 1km² of terrain data, converts it into a wavetable, and lets you play the landscape as sound.

## Core Concept

The fundamental idea: **geography becomes timbre**. Mountains produce complex, harmonically rich waveforms. Plains create smoother, simpler tones. Coastlines yield rhythmic, varied textures. Each location on Earth has its own unique sonic character.

### Wavetable Synthesis
A wavetable is a collection of single-cycle waveforms that can be smoothly morphed between. In Carta:
- 32 frames of terrain data (North to South)
- Each frame = 256 elevation samples (East to West)
- Morphing = traveling through the terrain from North to South
- The elevation profile becomes the waveform shape

## Target Users

- **Sound designers** looking for unique, organic wavetables
- **Electronic musicians** wanting geographic inspiration
- **Experimentalists** exploring the intersection of data and music
- **Educators** teaching synthesis concepts through tangible geography

## Key Features

### Terrain to Sound
- Click any location on the interactive map
- Fetches real elevation data from Open-Elevation API
- Converts 8,192 data points into 32-frame wavetable
- Visualizes terrain as 3D wireframe mesh

### Sound Shaping
- **Morph Control**: Sweep through terrain North→South
- **ADSR Envelope**: Attack, Decay, Sustain, Release
- **Low-pass Filter**: With resonance and modulation
- **Dual LFOs**: Sine wave modulators for morph and filter
- **Reverb**: Configurable room simulation

### Generative Sequencer
- Algorithmic pattern generator
- Configurable scale and octave range
- Probability-based note triggering
- Variable tempo and pattern length

### Input Methods
- Computer keyboard (A-L keys = C4-F5)
- MIDI controller support (note on/off, mod wheel)

## Technical Approach

### Why Single-File HTML?
- Zero build process, zero dependencies to install
- Works offline once loaded
- Easy to share, fork, and modify
- CDN-loaded libraries (Leaflet for maps)

### Why Web Audio API?
- Native browser support, no plugins
- Low-latency audio processing
- PeriodicWave for efficient wavetable synthesis
- Modular node graph for signal routing

### Data Pipeline
1. User clicks map → lat/lng coordinates
2. Generate 8,192 coordinate pairs (256×32 grid)
3. Fetch elevation data in chunks (API rate limits)
4. Normalize to [-1, +1] range
5. FFT each frame → PeriodicWave objects
6. Ready for playback

## Design Philosophy

### Visual Aesthetic
- Minimal black & white wireframe style
- Topographic map inspiration
- Information-dense but uncluttered
- Dark/light mode support

### Audio Philosophy
- Organic, terrain-derived timbres
- Smooth morphing without clicks
- Expressive modulation capabilities
- Real-time parameter control

## Limitations & Scope

### What Carta Is
- A prototype/experiment
- A single-page instrument
- A demonstration of terrain sonification

### What Carta Is Not
- A full DAW or production tool
- A sample library generator
- A mobile-optimized application

## Future Possibilities

- Save/load terrain presets
- Share locations via URL
- Additional effects (delay, distortion)
- Higher resolution wavetables
- Multi-voice polyphony improvements
- Export wavetables to other synths
