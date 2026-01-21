# Carta VST Plugin — JUCE Implementation Plan

## Overview

Port Carta terrain wavetable synthesizer to a cross-platform VST3/AU plugin using JUCE. The plugin retains Carta's core differentiator: **fetching real terrain data from interactive maps** to generate unique wavetables.

## Scope

### In Scope
- Interactive map for location selection (Leaflet via WebBrowserComponent)
- Terrain data fetching from Open-Elevation API
- 3D terrain visualization
- Wavetable generation from elevation data (32 frames × 256 samples)
- Dual-oscillator morphing engine
- Lowpass filter with resonance
- ADSR envelope
- Modulation system (2 LFOs → morph, filter)
- 8-voice polyphony
- Factory presets (bundled locations)
- VST3 + AU formats

### Out of Scope (for v1)
- Generative sequencer
- Shimmer reverb (users can use DAW reverb)
- AAX format
- Standalone app (plugin only)

---

## Architecture

```
carta-vst/
├── CMakeLists.txt                    # CMake build (JUCE 7+)
├── Source/
│   ├── PluginProcessor.h/cpp         # Audio processing, state, MIDI
│   ├── PluginEditor.h/cpp            # Main UI window
│   │
│   ├── DSP/
│   │   ├── WavetableOscillator.h/cpp # Dual-osc with frame morphing
│   │   ├── WavetableGenerator.h/cpp  # Elevation → PeriodicWave (FFT)
│   │   ├── ADSREnvelope.h/cpp        # Linear ramp envelope
│   │   ├── BiquadFilter.h/cpp        # Lowpass, 20Hz-20kHz, Q 0-30
│   │   ├── Voice.h/cpp               # Single synth voice
│   │   └── VoiceManager.h/cpp        # Polyphony, voice stealing
│   │
│   ├── Modulation/
│   │   ├── LFO.h/cpp                 # Sine, tri, square, S&H, drift
│   │   └── ModulationMatrix.h/cpp    # Source → destination routing
│   │
│   ├── Terrain/
│   │   ├── TerrainService.h/cpp      # HTTP fetching, caching
│   │   ├── ElevationAPI.h/cpp        # Open-Elevation + fallback
│   │   └── GridGenerator.h/cpp       # Lat/lng → 32×256 grid
│   │
│   ├── UI/
│   │   ├── MapComponent.h/cpp        # WebBrowserComponent + Leaflet
│   │   ├── TerrainView3D.h/cpp       # OpenGL wireframe mesh
│   │   ├── WaveformDisplay.h/cpp     # Current frame visualization
│   │   ├── MorphSection.h/cpp        # Morph knob + mod routing
│   │   ├── FilterSection.h/cpp       # Cutoff, resonance, mod
│   │   ├── EnvelopeSection.h/cpp     # ADSR sliders
│   │   ├── ModulationSection.h/cpp   # LFO controls
│   │   ├── PresetBrowser.h/cpp       # Location presets
│   │   └── CartaLookAndFeel.h/cpp    # Custom styling
│   │
│   └── Utility/
│       ├── HTTPClient.h/cpp          # Async URL fetching
│       └── FFTProcessor.h/cpp        # Waveform → harmonic conversion
│
├── Resources/
│   ├── MapView.html                  # Leaflet map (embedded)
│   ├── Presets/                      # Factory presets (JSON)
│   └── Fonts/                        # UI fonts
│
└── Tests/
    ├── WavetableTests.cpp
    ├── FilterTests.cpp
    └── ModulationTests.cpp
```

---

## Technical Design

### 1. Map Integration (WebBrowserComponent)

JUCE's `WebBrowserComponent` embeds a system webview. We load a minimal HTML page with Leaflet and communicate via JavaScript bridge.

**MapView.html** (embedded resource):
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
  <style>
    #map { width: 100%; height: 100%; }
    body { margin: 0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map').setView([46.8182, 8.2275], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    let marker = null;
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      if (marker) map.removeLayer(marker);
      marker = L.marker([lat, lng]).addTo(map);
      // Send to JUCE
      window.location.href = `juce://terrain?lat=${lat}&lng=${lng}`;
    });

    // Called from JUCE to set location
    function setLocation(lat, lng) {
      map.setView([lat, lng], 10);
      if (marker) map.removeLayer(marker);
      marker = L.marker([lat, lng]).addTo(map);
    }
  </script>
</body>
</html>
```

**MapComponent.cpp** (JUCE side):
```cpp
class MapComponent : public juce::WebBrowserComponent {
public:
    std::function<void(double lat, double lng)> onLocationSelected;

    bool pageAboutToLoad(const String& url) override {
        if (url.startsWith("juce://terrain")) {
            // Parse lat/lng from URL, call onLocationSelected
            return false; // Don't navigate
        }
        return true;
    }

    void setLocation(double lat, double lng) {
        evaluateJavascript("setLocation(" + String(lat) + "," + String(lng) + ")");
    }
};
```

### 2. Terrain Fetching

**TerrainService** handles HTTP requests to Open-Elevation API with chunking and caching.

```cpp
class TerrainService {
public:
    // Async fetch - calls callback when complete
    void fetchTerrain(double lat, double lng, double gridSizeKm,
                      std::function<void(std::vector<std::vector<float>>)> onComplete,
                      std::function<void(String)> onError);

private:
    // Generate 32×256 grid of coordinates
    std::vector<std::pair<double,double>> generateGrid(double lat, double lng, double sizeKm);

    // Chunk requests (max 1000 per API call)
    void fetchChunked(std::vector<std::pair<double,double>> coords, int chunkIndex);

    // Cache: key = "lat,lng,size" → elevation data
    std::map<String, std::vector<std::vector<float>>> cache;

    // Primary: Open-Elevation, Fallback: OpenTopoData
    const String primaryAPI = "https://api.open-elevation.com/api/v1/lookup";
    const String fallbackAPI = "https://api.opentopodata.org/v1/srtm30m";
};
```

### 3. Wavetable Generation

Convert elevation grid to playable wavetables using FFT.

```cpp
class WavetableGenerator {
public:
    // 32 frames × 256 samples each
    static constexpr int NUM_FRAMES = 32;
    static constexpr int SAMPLES_PER_FRAME = 256;

    struct Wavetable {
        std::array<std::array<float, SAMPLES_PER_FRAME>, NUM_FRAMES> frames;
        String locationName;
        double lat, lng;
    };

    // Convert raw elevation to normalized wavetable
    Wavetable generate(const std::vector<std::vector<float>>& elevations,
                       float intensity = 1.0f);

private:
    // Normalize to [-1, 1] range
    void normalize(std::vector<float>& frame, float globalMin, float globalMax);

    // Convert time-domain waveform to band-limited via FFT
    // (Prevents aliasing at high frequencies)
    void makeBandLimited(std::array<float, SAMPLES_PER_FRAME>& frame, float fundamentalHz);
};
```

### 4. Wavetable Oscillator

Dual oscillator with smooth morphing between adjacent frames.

```cpp
class WavetableOscillator {
public:
    void setWavetable(const WavetableGenerator::Wavetable& wt);
    void setFrequency(float hz);
    void setMorphPosition(float position); // 0.0 - 1.0

    float process(); // Returns next sample

private:
    const WavetableGenerator::Wavetable* wavetable = nullptr;

    float phase = 0.0f;
    float phaseIncrement = 0.0f;
    float morphPosition = 0.0f;

    // Morph interpolation
    int lowerFrame, upperFrame;
    float frameMix; // Blend factor between frames

    void updateFrameIndices();
};
```

**Morphing algorithm** (matching web version):
```cpp
void WavetableOscillator::updateFrameIndices() {
    float frameIndex = morphPosition * (NUM_FRAMES - 1);
    lowerFrame = static_cast<int>(frameIndex);
    upperFrame = std::min(lowerFrame + 1, NUM_FRAMES - 1);
    frameMix = frameIndex - lowerFrame;
}

float WavetableOscillator::process() {
    // Get samples from both frames
    int sampleIndex = static_cast<int>(phase * SAMPLES_PER_FRAME) % SAMPLES_PER_FRAME;
    float sampleA = wavetable->frames[lowerFrame][sampleIndex];
    float sampleB = wavetable->frames[upperFrame][sampleIndex];

    // Linear interpolation between frames
    float output = sampleA * (1.0f - frameMix) + sampleB * frameMix;

    // Advance phase
    phase += phaseIncrement;
    if (phase >= 1.0f) phase -= 1.0f;

    return output;
}
```

### 5. Voice Architecture

```cpp
class Voice {
public:
    void noteOn(int midiNote, float velocity);
    void noteOff();
    bool isActive() const;

    void process(float* outputL, float* outputR, int numSamples);

    // Setters for all parameters (called from processor)
    void setMorphPosition(float pos);
    void setFilterCutoff(float hz);
    void setFilterResonance(float q);
    void setADSR(float a, float d, float s, float r);

private:
    WavetableOscillator oscillator;
    ADSREnvelope envelope;
    BiquadFilter filter;

    float velocity = 0.0f;
    int currentNote = -1;
};

class VoiceManager {
public:
    static constexpr int MAX_VOICES = 8;

    void noteOn(int midiNote, float velocity);
    void noteOff(int midiNote);

    void process(float* outputL, float* outputR, int numSamples);

private:
    std::array<Voice, MAX_VOICES> voices;

    Voice* findFreeVoice();
    Voice* findVoiceForNote(int midiNote);

    // Gain compensation: 1/sqrt(activeVoices)
    float calculateGainCompensation();
};
```

### 6. Modulation System

```cpp
class LFO {
public:
    enum class Shape { Sine, Triangle, Square, SampleAndHold, Drift };

    void setRate(float hz);       // 0.05 - 10 Hz
    void setShape(Shape shape);

    float process();              // Returns 0.0 - 1.0

private:
    float phase = 0.0f;
    float rate = 1.0f;
    Shape shape = Shape::Sine;

    // For S&H and Drift
    float currentValue = 0.0f;
    float targetValue = 0.0f;
};

class ModulationMatrix {
public:
    enum class Source { None, LFO1, LFO2, ModWheel, Velocity };
    enum class Destination { MorphPosition, FilterCutoff };

    struct Route {
        Destination dest;
        Source source = Source::None;
        float range = 1.0f;   // How much modulation affects parameter
        float offset = 0.0f;  // Base value before modulation
    };

    void setRoute(Destination dest, Source src, float range, float offset);
    float getValue(Destination dest); // Returns modulated value

    void process(); // Update all LFOs

private:
    LFO lfo1, lfo2;
    float modWheel = 0.0f;
    float velocity = 0.0f;
    std::map<Destination, Route> routes;
};
```

### 7. Filter

```cpp
class BiquadFilter {
public:
    void setCutoff(float hz);      // 20 - 20000 Hz
    void setResonance(float q);    // 0 - 30
    void setSampleRate(float sr);

    float process(float input);

private:
    // Biquad coefficients
    float b0, b1, b2, a1, a2;
    float z1 = 0.0f, z2 = 0.0f;

    void calculateCoefficients();

    float cutoffHz = 20000.0f;
    float resonance = 0.707f;
    float sampleRate = 44100.0f;
};
```

### 8. ADSR Envelope

```cpp
class ADSREnvelope {
public:
    void setAttack(float seconds);   // 0.01 - 0.5
    void setDecay(float seconds);    // 0.1 - 0.5
    void setSustain(float level);    // 0.0 - 1.0
    void setRelease(float seconds);  // 0.1 - 2.0

    void noteOn();
    void noteOff();

    float process(); // Returns current envelope value
    bool isActive() const;

private:
    enum class Stage { Idle, Attack, Decay, Sustain, Release };
    Stage stage = Stage::Idle;

    float attack = 0.01f, decay = 0.1f, sustain = 0.7f, release = 0.3f;
    float currentLevel = 0.0f;
    float sampleRate = 44100.0f;
};
```

---

## UI Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  CARTA                                          [Preset ▼]  Vol ═══ │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────┐  ┌─────────────────────────┐          │
│  │                         │  │                         │          │
│  │      LEAFLET MAP        │  │    3D TERRAIN MESH      │          │
│  │     (WebBrowser)        │  │      (OpenGL)           │          │
│  │                         │  │                         │          │
│  │   [Click to select]     │  │   ════════ morph line   │          │
│  │                         │  │                         │          │
│  └─────────────────────────┘  └─────────────────────────┘          │
│                                                                     │
│  ┌─── MORPH ────┐  ┌─── FILTER ───┐  ┌─── ENVELOPE ─┐  ┌── LFOs ──┐│
│  │              │  │              │  │              │  │          ││
│  │   ◯ Morph    │  │  ◯ Cutoff   │  │  A  D  S  R  │  │ LFO1 ◯   ││
│  │              │  │              │  │  │  │  │  │  │  │ Rate     ││
│  │ Src [LFO1 ▼] │  │  ◯ Reso     │  │  ║  ║  ║  ║  │  │ [sine ▼] ││
│  │ Range ═══    │  │              │  │  ║  ║  ║  ║  │  │          ││
│  │ Offset ═══   │  │ Src [None▼] │  │              │  │ LFO2 ◯   ││
│  │              │  │ Range ═══   │  │              │  │ Rate     ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘│
│                                                                     │
│  ┌─── WAVEFORM ─────────────────────────────────────────────────┐  │
│  │ ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Status: Ready | Location: Swiss Alps (46.82°N, 8.23°E)            │
└─────────────────────────────────────────────────────────────────────┘
```

**Dimensions:** ~800 × 600px default, resizable

---

## Implementation Phases

### Phase 1: Project Setup & Basic Synthesis
- [ ] Create JUCE project (CMake, VST3+AU targets)
- [ ] Implement WavetableOscillator with hardcoded test wavetable
- [ ] Implement ADSREnvelope
- [ ] Implement Voice and VoiceManager (8-voice polyphony)
- [ ] Wire up MIDI note on/off
- [ ] Basic PluginProcessor audio callback
- [ ] Verify sound output in DAW

**Deliverable:** Plugin makes sound when you play MIDI notes

### Phase 2: Filter & Modulation
- [ ] Implement BiquadFilter (lowpass)
- [ ] Implement LFO (all 5 shapes)
- [ ] Implement ModulationMatrix
- [ ] Wire modulation to morph position and filter cutoff
- [ ] Add parameter smoothing to prevent zipper noise

**Deliverable:** Filter sweeps and LFO modulation working

### Phase 3: Terrain Pipeline
- [ ] Implement HTTPClient (async URL fetch)
- [ ] Implement GridGenerator (lat/lng → coordinate grid)
- [ ] Implement ElevationAPI (Open-Elevation + fallback)
- [ ] Implement TerrainService (chunking, caching)
- [ ] Implement WavetableGenerator (normalize + optional FFT)
- [ ] Test with hardcoded coordinates

**Deliverable:** Can fetch terrain and generate wavetable from coordinates

### Phase 4: Map UI
- [ ] Create MapView.html with Leaflet
- [ ] Implement MapComponent (WebBrowserComponent wrapper)
- [ ] JavaScript bridge: click → JUCE callback
- [ ] JUCE → JavaScript: set location, pan map
- [ ] Loading indicator during terrain fetch
- [ ] Error handling for failed fetches

**Deliverable:** Click map → fetch terrain → hear new wavetable

### Phase 5: Full UI
- [ ] Design CartaLookAndFeel (dark theme, knob/slider styling)
- [ ] Implement MorphSection (knob + mod routing dropdowns)
- [ ] Implement FilterSection (cutoff, resonance, mod routing)
- [ ] Implement EnvelopeSection (ADSR sliders)
- [ ] Implement ModulationSection (LFO rate/shape controls)
- [ ] Implement WaveformDisplay (canvas drawing current frame)
- [ ] Implement PresetBrowser (factory locations)
- [ ] Layout all sections in PluginEditor

**Deliverable:** Complete UI matching design spec

### Phase 6: 3D Terrain Visualization
- [ ] Implement TerrainView3D using juce::OpenGLContext
- [ ] Render wireframe mesh from elevation data
- [ ] Add morph position indicator line
- [ ] Mouse drag rotation (orbit controls)
- [ ] Sync visualization with audio morph position

**Deliverable:** Interactive 3D terrain view

### Phase 7: Presets & Polish
- [ ] Implement PresetManager (save/load JSON)
- [ ] Bundle 10-15 factory presets (iconic locations)
- [ ] DAW parameter automation for all controls
- [ ] State save/restore (getStateInformation/setStateInformation)
- [ ] Handle sample rate changes
- [ ] Test in multiple DAWs (Ableton, Logic, GarageBand, FL Studio)
- [ ] Create installers (macOS .pkg, Windows .exe)

**Deliverable:** Shippable plugin

---

## Factory Presets (Locations)

| Name | Coordinates | Character |
|------|-------------|-----------|
| Swiss Alps | 46.82°N, 8.23°E | Jagged, bright |
| Grand Canyon | 36.10°N, 112.11°W | Deep, dramatic |
| Mount Fuji | 35.36°N, 138.73°E | Smooth cone |
| Himalayas | 27.99°N, 86.93°E | Extreme, powerful |
| Scottish Highlands | 57.05°N, 4.90°W | Rolling, gentle |
| Sahara Dunes | 25.00°N, 10.00°E | Smooth waves |
| Norwegian Fjords | 61.00°N, 7.00°E | Deep cuts |
| Andes | -13.16°S, 72.54°W | Tall, sharp |
| Great Rift Valley | -3.00°S, 36.00°E | Wide, dramatic |
| Iceland Volcanoes | 64.42°N, 17.33°W | Volcanic, harsh |

---

## Dependencies

| Library | Purpose | License |
|---------|---------|---------|
| JUCE 7+ | Framework | GPLv3 or commercial |
| Leaflet | Map tiles | BSD-2-Clause |
| OpenStreetMap | Tile data | ODbL |
| Open-Elevation | Elevation API | Public |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **WebBrowserComponent limitations** | Map may not work on all systems | Test early on macOS/Windows; fallback to preset-only if needed |
| **API rate limiting** | Terrain fetch fails | Aggressive caching; chunk requests; add delay between chunks |
| **Firewall blocks API** | Corporate/school users can't fetch | Allow wavetable import from files; provide offline preset pack |
| **CPU usage** | Plugin too heavy | Profile early; optimize hot paths; consider SIMD for oscillator |
| **Cross-platform builds** | macOS vs Windows differences | Use CMake; test on both platforms throughout development |

---

## Testing Strategy

### Unit Tests
- Wavetable generation from known elevation data
- Filter coefficient calculation at various sample rates
- LFO output values for each shape
- ADSR envelope timing accuracy

### Integration Tests
- Full signal path: MIDI note → audio output
- Terrain fetch → wavetable generation → playback
- Preset load/save roundtrip
- Parameter automation recording/playback

### Manual Testing
- Play in Ableton Live, Logic Pro, GarageBand, FL Studio
- Test with various sample rates (44.1k, 48k, 96k)
- Test buffer sizes (64 → 2048 samples)
- Verify no clicks/pops during morph position changes
- Verify map click → audio update latency is acceptable

---

## Open Questions

1. **Band-limiting strategy** — Full FFT per frame, or simpler anti-aliasing?
2. **Wavetable file format** — Custom binary, or standard .wav with metadata?
3. **Search in map** — Include geocoding search bar, or just click-to-select?
4. **Intensity parameter** — Keep terrain intensity blending from web version?

---

## References

- [JUCE Documentation](https://docs.juce.com/)
- [JUCE Tutorials — Building a Synth](https://docs.juce.com/master/tutorial_synth_using_midi_input.html)
- [Web Audio Wavetable Synthesis](https://developer.mozilla.org/en-US/docs/Web/API/PeriodicWave)
- [Open-Elevation API](https://open-elevation.com/)
- [Leaflet.js](https://leafletjs.com/)
