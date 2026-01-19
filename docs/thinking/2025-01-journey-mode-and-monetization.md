# Journey Mode & Monetization Brainstorm

*2025-01-19*

## Monetization Options

### Could Carta charge?

Tough sell as standalone paid product - niche market for experimental web synths. But angles exist:

| Model | Approach | Viability |
|-------|----------|-----------|
| **Freemium + Export** | Free to play, $5-10 one-time for wavetable export | Best bet - bridges "fun" to "useful" |
| **Preset Packs** | Curated location packs ("Sound of the Alps"), $2-3 each | Low friction, small revenue |
| **Plugin (VST/AU)** | Port to desktop via JUCE | Significant work, but plugins have paying audiences |
| **Institutional** | Museum/science center/art installation licensing | High value if you can find buyers |

**Key insight:** Export is the monetization hook. It turns Carta from toy into tool.

---

## Journey Mode

### Concept
Draw a path on the map, and the synth "travels" along it over time. Hear the terrain change as you traverse real geography.

### Three Approaches

**Option A: Journey controls morph only**
- Wavetable stays fixed (single location)
- Journey automates morph slider position
- Traveling through 32 frames of one 1km² area
- Simple but limited - basically an LFO

**Option B: Journey loads new wavetables along path** *(recommended)*
- Fetch terrain at each waypoint
- Crossfade between wavetables as journey progresses
- Actually traversing geography
- Extends existing dual-oscillator crossfade system to crossfade between *sets* of wavetables

**Option C: Journey as generative sequencer**
- Notes tied to terrain features along path
- Elevation peaks = triggers, steepness = velocity
- Path *is* the sequence
- Most ambitious, most unique, most complex

### Why Option B?
- Option A is just morph automation (already have LFOs for this)
- Option C is cool but significant complexity
- Option B gives the "traveling across the Alps" experience with manageable technical lift

### User Flow
1. Click "Journey" button to enter path-drawing mode
2. Click waypoints on map (4-8 points)
3. Line connects waypoints showing route
4. Press play - terrain crossfades along path
5. Duration, loop, direction controls

### UI Sketch
```
┌─────────────────────────────────────────┐
│                                         │
│     MAP                                 │
│         ●───────●                       │
│                  \                      │
│                   ●────●                │
│                        (4 waypoints)    │
│                                         │
├─────────────────────────────────────────┤
│ JOURNEY  [▶]  ════●══════════  2:30     │
│          Duration: [1 min ▼]  [Loop ▼]  │
└─────────────────────────────────────────┘
```

### Controls
- Journey duration (30s, 1min, 5min, or sync to bars)
- Loop / one-shot / ping-pong
- Direction (forward, reverse)
- Pause/resume

### Technical Considerations
- Fetch terrain at each waypoint (4-8 API calls)
- Store multiple wavetables in memory
- Crossfade between them using existing dual-osc architecture
- Potential for audio glitches during crossfade - needs smooth interpolation

### The Magic Moment
User draws a path across the Himalayas, hits play, and hears terrain change from foothills to peaks to valleys over 2 minutes while sequencer plays. That's shareable. That might be worth paying for.

---

## Other Feature Ideas Discussed

### Terrain Comparison Mode
Split screen, two terrains, A/B crossfader. "Alps vs Sahara"

### Micro/Macro Terrain Toggle
- 100m² (micro) - fine detail
- 1km² (current)
- 50km² (macro) - continental features

Same location, dramatically different timbres at different scales.

### Real-time GPS
Walk around, sound changes based on actual location. Phone-based experience.

---

## Questions to Resolve

1. Journey: discrete waypoints or continuous path sampling?
2. How to handle long journeys without hammering the elevation API?
3. Should journey sync to sequencer tempo/bars?
4. Export format: .wav? Serum-compatible? Both?
