# Roadmap

Long-term plans and priorities.

## Current Focus
Stabilizing core synth functionality and exploring sound design features.

## Ready to Merge (Feature Branches)
- [ ] `feature/presets` — Factory presets with 6 hand-crafted locations
- [ ] `feature/terrain-intensity` — Intensity slider to tame flat terrain
- [ ] `feature/terrain-stacking` — Play multiple terrain frames simultaneously
- [ ] `feature/unison-oscillators` — Traditional synth unison (detune + stereo)

## Up Next
- [ ] Merge and test feature branches
- [ ] URL sharing — Encode location + settings in URL params for shareability
- [ ] User presets — Save/load presets to localStorage
- [ ] Wavetable export — Export terrain as .wav or Serum-compatible format

## Terrain-Driven Features (New)
Features that lean into the unique terrain-as-instrument concept:

- [ ] **Gravity Flow Sequencer** — Drop a ball on terrain, it rolls downhill, direction changes trigger notes. Physics-based generative sequencing where terrain topology creates the rhythm.
- [ ] **Weather Layer Modulation** — Fetch real-time weather for selected location. Wind → LFO rate, temperature → filter, humidity → reverb. The sound of a place *right now*.
- [ ] **Terrain Navigator** — Custom morph paths: rotate sampling angle, draw freehand paths, use spiral/zigzag patterns. Same terrain, infinite variations based on traversal.

## Later
- [ ] Journey mode — Draw path on map, terrain crossfades along route over time
- [ ] Add stereo width control to reverb section
- [ ] Additional effects (delay, distortion)
- [ ] Terrain comparison mode — A/B two locations with crossfader
- [ ] Micro/macro terrain toggle — 100m² to 50km² scale options
- [ ] Higher resolution wavetable options
- [ ] Pitch bend support

## Icebox
Ideas we're not pursuing now but might revisit:
- Seafloor/bathymetry data (requires different API)
- Mobile-optimized layout
- MIDI CC mapping UI
- Plugin version (VST/AU via JUCE)
- Real-time GPS mode (sound changes as you walk)
- Journey as generative sequencer (terrain features trigger notes)

## Shipped
- [x] Core terrain wavetable synthesis — 2025-01
- [x] Interactive map with location search — 2025-01
- [x] 3D terrain visualization — 2025-01
- [x] Dual LFO modulation system — 2025-01
- [x] Shimmer reverb — 2025-01
- [x] Generative sequencer — 2025-01
- [x] MIDI input support — 2025-01
- [x] Scale/key selection — 2025-01
- [x] Light/dark mode — 2025-01

---

*Last updated: 2025-01-19*
