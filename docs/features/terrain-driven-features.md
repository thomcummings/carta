# Terrain-Driven Features Spec

Three features that lean into Carta's unique terrain-as-instrument concept.

---

## 1. Weather Layer Modulation

Real-time weather data from the selected location modulates synth parameters.

### Concept
The sound of a place *right now*. A storm in the Rockies sounds different than a calm day. Weather becomes a slow-moving modulation source.

### Data Source
OpenWeatherMap free tier (1,000 calls/day, more than enough)
- API: `https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={key}`

### Parameter Mappings

| Weather Data | Range | Maps To | Reasoning |
|--------------|-------|---------|-----------|
| Wind speed | 0-30 m/s | LFO1 rate (0.1-5Hz) | Wind = movement |
| Wind direction | 0-360° | Stereo pan or morph offset | Directional |
| Temperature | -20 to +40°C | Filter cutoff bias | Cold = bright, warm = mellow |
| Humidity | 0-100% | Reverb wet mix | Humid = wetter sound |
| Pressure | 980-1040 hPa | Filter resonance | Pressure = tension |
| Cloud cover | 0-100% | High-freq damping | Overcast = darker |
| Visibility | 0-10km | Reverb size | Fog = large diffuse space |

### UI Design

```
┌─────────────────────────────────────────┐
│  WEATHER                        [⟳] [○] │  ← refresh, enable toggle
├─────────────────────────────────────────┤
│  ☀ Clear, 18°C                          │
│  Wind: 5m/s NW  ·  Humidity: 45%        │
│                                         │
│  Mappings:              [Subtle ●───○ ] │  ← global intensity
│  ├ Wind → LFO Rate      [✓]            │
│  ├ Temp → Filter        [✓]            │
│  ├ Humidity → Reverb    [✓]            │
│  └ Pressure → Resonance [ ]            │
└─────────────────────────────────────────┘
```

### Implementation

```javascript
class WeatherService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.cache = null;
    this.cacheTime = 0;
    this.CACHE_DURATION = 10 * 60 * 1000; // 10 min
  }

  async fetch(lat, lon) {
    // Return cached if fresh
    if (this.cache && Date.now() - this.cacheTime < this.CACHE_DURATION) {
      return this.cache;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
    const res = await fetch(url);
    const data = await res.json();

    this.cache = {
      temp: data.main.temp,           // °C
      humidity: data.main.humidity,   // %
      pressure: data.main.pressure,   // hPa
      windSpeed: data.wind.speed,     // m/s
      windDeg: data.wind.deg,         // degrees
      clouds: data.clouds.all,        // %
      visibility: (data.visibility || 10000) / 1000, // km
      description: data.weather[0].description,
      icon: data.weather[0].icon
    };
    this.cacheTime = Date.now();
    return this.cache;
  }
}

class WeatherModulation {
  constructor(modulationManager, audioEngine) {
    this.modManager = modulationManager;
    this.audio = audioEngine;
    this.enabled = false;
    this.intensity = 0.5; // 0-1 global scaling
    this.mappings = {
      wind: true,
      temp: true,
      humidity: true,
      pressure: false
    };
    this.weather = null;
  }

  apply(weather) {
    if (!this.enabled) return;
    this.weather = weather;

    // Wind → LFO1 rate (0.1 to 5Hz based on 0-30 m/s)
    if (this.mappings.wind) {
      const rate = 0.1 + (weather.windSpeed / 30) * 4.9 * this.intensity;
      this.modManager.lfo1.setRate(rate);
    }

    // Temperature → filter cutoff bias
    // Map -20°C to +40°C → 0 to 1
    if (this.mappings.temp) {
      const tempNorm = (weather.temp + 20) / 60;
      // Cold = brighter (higher cutoff), warm = darker
      const cutoffBias = 1 - tempNorm; // Inverted
      // Apply as offset to existing filter
      // ... integrate with filter control
    }

    // Humidity → reverb wet
    if (this.mappings.humidity) {
      const wet = (weather.humidity / 100) * this.intensity;
      this.audio.setReverbMix(wet);
    }

    // Pressure → resonance
    if (this.mappings.pressure) {
      // 980-1040 hPa → 0-1
      const pressNorm = (weather.pressure - 980) / 60;
      const q = pressNorm * 10 * this.intensity;
      this.audio.setFilterResonance(q);
    }
  }
}
```

### Open Questions
1. **API Key**: Ship with free key, or ask user to provide their own?
   - Recommendation: Provide default for frictionless experience, allow override
2. **Update frequency**: Fetch on terrain load, or poll every N minutes?
   - Recommendation: Fetch on terrain load + manual refresh button
3. **Offline fallback**: What if API fails?
   - Recommendation: Disable weather panel gracefully, show "Weather unavailable"

---

## 2. Terrain Navigator (Traversal Paths + Rotation)

Unified system for controlling how you move through terrain data.

### Concept
Currently morph sweeps N→S linearly. This feature lets you:
1. Rotate the sampling angle (same area, different wavetable)
2. Draw custom paths across the terrain grid
3. Use geometric patterns (spiral, zigzag)

### Path Types

| Type | Description | Use Case |
|------|-------------|----------|
| Linear | Straight line at any angle | Current behavior generalized |
| Freehand | User draws on terrain/map | Exploratory, unique paths |
| Spiral | Inward or outward spiral | Continuous evolution |
| Zigzag | Back-and-forth pattern | Rhythmic texture changes |
| Ridgeline | Follows terrain features | Requires feature detection |

### UI Design

```
┌─────────────────────────────────────────┐
│  TERRAIN PATH                           │
├─────────────────────────────────────────┤
│  Mode: [Linear ▾] [Freehand] [Spiral]   │
│                                         │
│  Rotation ○───────●────────── 45°       │
│  (for linear mode)                      │
│                                         │
│  [Draw Path]  [Clear]  [Preview]        │
│                                         │
│  Path Length: 847 samples               │
└─────────────────────────────────────────┘
```

### Implementation

```javascript
class TerrainPath {
  constructor(terrainGrid) {
    this.grid = terrainGrid;  // 256 x 32 elevation data
    this.path = [];           // Array of {x, y, elevation} points
    this.mode = 'linear';
    this.rotation = 0;        // degrees
  }

  // Generate path based on mode
  generate() {
    switch (this.mode) {
      case 'linear':
        return this.generateLinear();
      case 'spiral':
        return this.generateSpiral();
      case 'zigzag':
        return this.generateZigzag();
      case 'freehand':
        return this.path; // User-drawn, already set
    }
  }

  generateLinear() {
    const path = [];
    const steps = 256;
    const radians = this.rotation * Math.PI / 180;

    // Center of grid
    const cx = 128, cy = 16;

    // Calculate start and end points based on rotation
    const dx = Math.cos(radians);
    const dy = Math.sin(radians);
    const len = Math.max(128, 16); // Half diagonal

    for (let i = 0; i <= steps; i++) {
      const t = i / steps - 0.5; // -0.5 to 0.5
      const x = Math.round(cx + t * len * 2 * dx);
      const y = Math.round(cy + t * len * 2 * dy);

      // Clamp to grid bounds
      const gx = Math.max(0, Math.min(255, x));
      const gy = Math.max(0, Math.min(31, y));

      path.push({
        x: gx,
        y: gy,
        elevation: this.sampleElevation(gx, gy)
      });
    }
    return path;
  }

  generateSpiral() {
    const path = [];
    const turns = 3;
    const steps = 256;
    const cx = 128, cy = 16;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = t * turns * Math.PI * 2;
      const radius = t * Math.min(cx, cy);

      const x = Math.round(cx + Math.cos(angle) * radius);
      const y = Math.round(cy + Math.sin(angle) * radius * (16/128));

      const gx = Math.max(0, Math.min(255, x));
      const gy = Math.max(0, Math.min(31, y));

      path.push({
        x: gx,
        y: gy,
        elevation: this.sampleElevation(gx, gy)
      });
    }
    return path;
  }

  // For freehand: convert mouse coords to grid coords
  addPoint(canvasX, canvasY, canvasWidth, canvasHeight) {
    const x = Math.round((canvasX / canvasWidth) * 255);
    const y = Math.round((canvasY / canvasHeight) * 31);

    this.path.push({
      x: Math.max(0, Math.min(255, x)),
      y: Math.max(0, Math.min(31, y)),
      elevation: this.sampleElevation(x, y)
    });
  }

  sampleElevation(x, y) {
    // Bilinear interpolation for smooth sampling
    const x0 = Math.floor(x), x1 = Math.ceil(x);
    const y0 = Math.floor(y), y1 = Math.ceil(y);
    const fx = x - x0, fy = y - y0;

    const v00 = this.grid[y0]?.[x0] || 0;
    const v10 = this.grid[y0]?.[x1] || 0;
    const v01 = this.grid[y1]?.[x0] || 0;
    const v11 = this.grid[y1]?.[x1] || 0;

    return v00 * (1-fx) * (1-fy) +
           v10 * fx * (1-fy) +
           v01 * (1-fx) * fy +
           v11 * fx * fy;
  }

  // Get elevation at position along path (0-1)
  getElevationAt(position) {
    const path = this.generate();
    const index = position * (path.length - 1);
    const i0 = Math.floor(index);
    const i1 = Math.min(i0 + 1, path.length - 1);
    const frac = index - i0;

    return path[i0].elevation * (1 - frac) + path[i1].elevation * frac;
  }
}
```

### Integration with Morph
The morph knob (0-1) becomes position along the active path rather than N-S index:
- Path generates ordered elevation samples
- Morph position interpolates along path
- AudioEngine receives elevation value, converts to wavetable frame

### Visual Feedback
- Draw path on 3D terrain as glowing line
- Show current position as moving dot
- Path preview on map overlay (optional)

---

## 3. Gravity Flow Sequencer

Physics-based terrain sequencer: drop a ball, it rolls downhill, terrain features trigger notes.

### Concept
> You drop a marble on a mountain. It finds its own way down.
> Every turn, every tumble, every rest in a valley — a note.
> The terrain composes. You just let go.

### Physics Model

```
State:
- position: {x, y} on terrain grid (0-255, 0-31)
- velocity: {vx, vy}
- running: boolean

Each frame (~60fps):
1. Sample terrain gradient at current position
2. Accelerate ball downhill (gravity × slope)
3. Apply friction/damping
4. Detect trigger events (direction change, acceleration spike)
5. Update position
6. Check for settling (velocity ≈ 0)
```

### Trigger Events → Notes

| Event | Detection | Musical Mapping |
|-------|-----------|-----------------|
| Direction change >45° | Compare velocity vectors | Note attack, angle → velocity |
| Steep drop | Acceleration spike | Accent/louder note |
| Bounce (uphill collision) | Velocity reversal | Staccato hit |
| Settle in valley | Velocity → 0 | Sustained drone |

### Pitch Mapping
Elevation at trigger point → pitch (quantized to current scale)
- Highest terrain elevation → highest note in range
- Lowest → lowest note

### User Controls

```
┌─────────────────────────────────────────┐
│  GRAVITY FLOW                     [○]   │  ← enable toggle
├─────────────────────────────────────────┤
│  [Click terrain to drop ball]           │
│                                         │
│  Gravity    ○────────●──────  0.7       │
│  (descent speed)                        │
│                                         │
│  Friction   ────●────○──────  0.3       │
│  (how quickly it settles)               │
│                                         │
│  Bounce     ────────●───────  0.5       │
│  (energy on direction change)           │
│                                         │
│  Sensitivity ───────────●───  0.8       │
│  (trigger threshold)                    │
│                                         │
│  [▶ Drop]  [⏹ Stop]  [🔄 Auto-drop]     │
└─────────────────────────────────────────┘
```

### Implementation

```javascript
class GravityFlowSequencer {
  constructor(terrainGrid, audioEngine, scaleManager) {
    this.grid = terrainGrid;      // Raw elevation data [y][x]
    this.audio = audioEngine;
    this.scale = scaleManager;

    // Ball state
    this.pos = { x: 128, y: 16 };
    this.vel = { x: 0, y: 0 };
    this.lastVel = { x: 0, y: 0 };
    this.running = false;

    // Tunable parameters
    this.gravity = 0.7;           // 0-1
    this.friction = 0.97;         // 0-1 (higher = less friction)
    this.bounce = 0.5;            // 0-1 (energy retained)
    this.triggerThreshold = 0.5;  // radians (~28°)

    // Auto-drop
    this.autoDrop = false;

    // Pitch mapping
    this.minElevation = -1;
    this.maxElevation = 1;
    this.octaveLow = 3;
    this.octaveHigh = 5;

    // Animation
    this.animationId = null;
    this.lastTime = 0;

    // Callbacks for visualization
    this.onPositionUpdate = null;
    this.onTrigger = null;
  }

  setTerrainData(grid, min, max) {
    this.grid = grid;
    this.minElevation = min;
    this.maxElevation = max;
  }

  drop(x, y) {
    // Normalize to grid coordinates if needed
    this.pos = { x, y };
    this.vel = { x: 0, y: 0 };
    this.lastVel = { x: 0, y: 0 };
    this.running = true;

    if (!this.animationId) {
      this.lastTime = performance.now();
      this.animate();
    }
  }

  stop() {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  animate() {
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05); // Cap delta
    this.lastTime = now;

    if (this.running) {
      this.update(dt);
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  update(dt) {
    // Sample gradient at current position
    const gradient = this.sampleGradient(this.pos.x, this.pos.y);

    // Accelerate downhill (gradient points uphill, so negate)
    const gravityForce = this.gravity * 50; // Scale factor
    this.vel.x -= gradient.x * gravityForce * dt;
    this.vel.y -= gradient.y * gravityForce * dt;

    // Apply friction
    this.vel.x *= Math.pow(this.friction, dt * 60);
    this.vel.y *= Math.pow(this.friction, dt * 60);

    // Detect direction change before updating position
    const angleChange = this.getAngleChange();
    const speed = Math.hypot(this.vel.x, this.vel.y);

    if (angleChange > this.triggerThreshold && speed > 0.5) {
      this.onNoteTrigger(angleChange);
    }

    // Update position
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;

    // Bounce off edges
    this.handleEdges();

    // Notify visualization
    if (this.onPositionUpdate) {
      this.onPositionUpdate(this.pos.x, this.pos.y);
    }

    // Check if settled
    if (speed < 0.1) {
      this.onSettle();
    }

    // Store for next frame
    this.lastVel = { ...this.vel };
  }

  sampleGradient(x, y) {
    // Central difference for gradient
    const h = 1;
    const ex = this.sampleElevation(x + h, y) - this.sampleElevation(x - h, y);
    const ey = this.sampleElevation(x, y + h) - this.sampleElevation(x, y - h);

    return { x: ex / (2 * h), y: ey / (2 * h) };
  }

  sampleElevation(x, y) {
    // Bilinear interpolation
    const gx = Math.max(0, Math.min(254, x));
    const gy = Math.max(0, Math.min(30, y));

    const x0 = Math.floor(gx), x1 = x0 + 1;
    const y0 = Math.floor(gy), y1 = y0 + 1;
    const fx = gx - x0, fy = gy - y0;

    // grid is [frame][sample] = [y][x]
    const v00 = this.grid[y0]?.[x0] || 0;
    const v10 = this.grid[y0]?.[x1] || 0;
    const v01 = this.grid[y1]?.[x0] || 0;
    const v11 = this.grid[y1]?.[x1] || 0;

    return v00 * (1-fx) * (1-fy) +
           v10 * fx * (1-fy) +
           v01 * (1-fx) * fy +
           v11 * fx * fy;
  }

  getAngleChange() {
    const lastSpeed = Math.hypot(this.lastVel.x, this.lastVel.y);
    const currSpeed = Math.hypot(this.vel.x, this.vel.y);

    if (lastSpeed < 0.01 || currSpeed < 0.01) return 0;

    // Dot product for angle
    const dot = (this.lastVel.x * this.vel.x + this.lastVel.y * this.vel.y) /
                (lastSpeed * currSpeed);
    return Math.acos(Math.max(-1, Math.min(1, dot)));
  }

  handleEdges() {
    // Bounce off grid boundaries
    if (this.pos.x < 0) {
      this.pos.x = 0;
      this.vel.x = -this.vel.x * this.bounce;
    }
    if (this.pos.x > 255) {
      this.pos.x = 255;
      this.vel.x = -this.vel.x * this.bounce;
    }
    if (this.pos.y < 0) {
      this.pos.y = 0;
      this.vel.y = -this.vel.y * this.bounce;
    }
    if (this.pos.y > 31) {
      this.pos.y = 31;
      this.vel.y = -this.vel.y * this.bounce;
    }
  }

  onNoteTrigger(intensity) {
    const elevation = this.sampleElevation(this.pos.x, this.pos.y);
    const pitch = this.elevationToPitch(elevation);
    const velocity = Math.min(1, 0.3 + intensity / Math.PI * 0.7);

    // Play note
    const id = `gravity_${Date.now()}`;
    this.audio.playNote(id, pitch, velocity);

    // Auto release after short duration
    setTimeout(() => {
      this.audio.stopNote(id);
    }, 150);

    // Notify visualization
    if (this.onTrigger) {
      this.onTrigger(this.pos.x, this.pos.y, pitch, velocity);
    }
  }

  elevationToPitch(elevation) {
    // Normalize elevation to 0-1
    const norm = (elevation - this.minElevation) /
                 (this.maxElevation - this.minElevation);

    // Get notes in range from scale manager
    const notes = this.scale.getNotesInRange(this.octaveLow, this.octaveHigh);
    const index = Math.floor(norm * (notes.length - 1));

    return notes[Math.max(0, Math.min(notes.length - 1, index))].frequency;
  }

  onSettle() {
    this.running = false;

    // Optional: play sustained note at rest position
    // Or: auto-drop new ball if enabled
    if (this.autoDrop) {
      setTimeout(() => {
        this.dropAtRandomPeak();
      }, 500);
    }
  }

  dropAtRandomPeak() {
    // Find local maxima in terrain
    let maxElev = -Infinity;
    let peaks = [];

    for (let y = 1; y < 31; y += 4) {
      for (let x = 4; x < 252; x += 8) {
        const e = this.sampleElevation(x, y);
        if (e > maxElev * 0.8) {
          peaks.push({ x, y, e });
          if (e > maxElev) maxElev = e;
        }
      }
    }

    // Filter to top peaks
    peaks = peaks.filter(p => p.e > maxElev * 0.7);

    if (peaks.length > 0) {
      const peak = peaks[Math.floor(Math.random() * peaks.length)];
      this.drop(peak.x, peak.y);
    }
  }
}
```

### Visual Feedback (Terrain3D integration)

```javascript
// Add to Terrain3DDisplay class:

addBall() {
  const geometry = new THREE.SphereGeometry(0.02, 16, 16);
  const material = new THREE.MeshBasicMaterial({
    color: 0xff6600,
    transparent: true,
    opacity: 0.9
  });
  this.ball = new THREE.Mesh(geometry, material);
  this.scene.add(this.ball);

  // Trail
  this.trailPoints = [];
  this.trailGeometry = new THREE.BufferGeometry();
  this.trailMaterial = new THREE.LineBasicMaterial({
    color: 0xff6600,
    transparent: true,
    opacity: 0.5
  });
  this.trail = new THREE.Line(this.trailGeometry, this.trailMaterial);
  this.scene.add(this.trail);
}

updateBallPosition(gridX, gridY) {
  if (!this.ball) this.addBall();

  // Convert grid coords to 3D space
  const x = (gridX / 255) - 0.5;
  const z = (gridY / 31) - 0.5;
  const y = this.sampleHeightAt(gridX, gridY) * 0.3 + 0.02;

  this.ball.position.set(x, y, z);

  // Update trail
  this.trailPoints.push(new THREE.Vector3(x, y, z));
  if (this.trailPoints.length > 100) {
    this.trailPoints.shift();
  }
  this.trailGeometry.setFromPoints(this.trailPoints);
}

flashTrigger() {
  // Brief scale/color pulse on note trigger
  if (!this.ball) return;
  this.ball.scale.setScalar(1.5);
  this.ball.material.color.setHex(0xffffff);

  setTimeout(() => {
    this.ball.scale.setScalar(1);
    this.ball.material.color.setHex(0xff6600);
  }, 100);
}
```

---

## Implementation Order

Recommended sequence based on dependencies and value:

### Phase 1: Gravity Flow (most novel, self-contained)
1. Implement GravityFlowSequencer class
2. Add UI panel with controls
3. Integrate ball visualization in Terrain3D
4. Connect to AudioEngine for note playback
5. Add click-to-drop on terrain view

### Phase 2: Weather Layer (independent, high value)
1. Set up WeatherService with API
2. Implement WeatherModulation class
3. Add weather panel UI
4. Connect to existing modulation destinations
5. Test with various locations

### Phase 3: Terrain Navigator (builds on existing morph system)
1. Implement TerrainPath class
2. Add rotation control to UI
3. Integrate with morph system
4. Add freehand drawing mode
5. Add path visualization on terrain

---

## Open Questions

1. **Gravity Flow + Generative Sequencer**: Should these be mutually exclusive, or can they run together? Recommendation: Allow both, let them create polyrhythms.

2. **Weather API Key**: Bundle a free key, or require user to add their own? Recommendation: Bundle default with option to override.

3. **Path Drawing**: Draw on 3D terrain view, map, or both? Recommendation: Start with 3D terrain (more intuitive connection between path and sound).

4. **Mobile**: Touch support for drawing paths and dropping balls? Recommendation: Yes, use touch events alongside mouse.

---

*Drafted: 2025-01-19*
