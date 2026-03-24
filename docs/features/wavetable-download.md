# Feature: Wavetable Download

## Summary
Export terrain wavetables as .wav files compatible with Serum, Vital, Phase Plant, and other wavetable synths.

## Status
Shipped (free mode) — payment gate planned for future.

## User Story
As a sound designer, I want to download terrain wavetables so that I can use them in my DAW/synth of choice.

## Requirements
- [x] Export current terrain as .wav file
- [x] Upsample 256-sample internal frames to 2048-sample industry standard
- [x] Include `clm ` chunk metadata for automatic frame detection in synths
- [x] Descriptive filenames with location name and coordinates
- [x] Button disabled until terrain is loaded
- [x] Feature flag infrastructure for future payment gate
- [ ] Stripe Checkout integration (future — per-download at £1.99)

## Design

### UI Placement
Download button sits below the visualization section (terrain + waveform panels), right-aligned. Matches existing control styling — monospace, uppercase, muted until hover.

```
┌──────────────────────────────────────────────────────────────┐
│ [Terrain 3D]                    │ [Waveform 2D]             │
└──────────────────────────────────────────────────────────────┘
                                        [↓ Download Wavetable]
```

### Export Pipeline
1. User clicks "Download Wavetable"
2. Each 256-sample frame → FFT → zero-pad spectrum to 2048 bins → IFFT
3. 32 frames concatenated into single .wav (32-bit float, mono, 44100 Hz)
4. `clm ` RIFF chunk appended with `<!>2048` marker
5. Browser download triggered

### File Format
| Spec | Value |
|------|-------|
| Format | WAV (RIFF) |
| Frame size | 2048 samples |
| Frames | 32 |
| Sample rate | 44100 Hz |
| Bit depth | 32-bit IEEE float |
| Channels | Mono |
| Metadata | `clm ` chunk: `<!>2048` |
| File size | ~256 KB |

### Filename Convention
```
carta_mount-fuji_35.3606_138.7274.wav
carta_36.1069_-112.1129.wav  (fallback if no location name)
```

## Technical Notes

### Spectral Upsampling
Linear interpolation from 256→2048 would introduce artifacts. Instead we use spectral interpolation: FFT the 256-sample frame, zero-pad the frequency bins to 2048, IFFT back. This preserves the exact harmonic content at higher resolution — the mathematically correct approach for periodic waveforms.

### Feature Flags
```javascript
const FEATURES = {
    wavetableExport: {
        enabled: true,
        paymentModel: "per-download",
        price: 1.99,
        currency: "GBP",
    },
};
```

When Stripe is added, the flow becomes:
`Click Download → Stripe Checkout (£1.99) → on success → trigger .wav download`

No user accounts or subscription management needed. Single `handleDownloadWavetable()` method is the only integration point.

### Synth Compatibility
Tested format is compatible with:
- **Serum** — reads `clm ` chunk, loads as 32-frame wavetable automatically
- **Vital** — reads `clm ` chunk, also supports drag-and-drop
- **Phase Plant** — reads `clm ` chunk
- **Pigments** — accepts 2048-sample .wav wavetables
- **Surge** — reads `clm ` chunk and standard .wav

## Testing Criteria
- [ ] Button is disabled on page load (no terrain loaded)
- [ ] Button enables after clicking map and terrain loading completes
- [ ] Button enables after loading a factory preset
- [ ] Clicking button downloads a .wav file
- [ ] Filename includes location name when searched (e.g. "carta_mount-fuji_...")
- [ ] Filename uses coordinates only when map-clicked without search
- [ ] Downloaded .wav opens in Serum without manual frame size prompt
- [ ] Downloaded .wav opens in Vital as 32-frame wavetable
- [ ] Waveform shapes in synth match the terrain visualization in Carta
- [ ] Status bar shows "Wavetable exported" after download

## Decisions
- **2048 samples per frame** over 256: Industry standard, avoids user friction in synths. See docs/decisions.md.
- **Spectral interpolation** over linear: Mathematically correct for periodic waveforms, no aliasing.
- **Per-download payment** over subscription: Simpler for both user and implementation. No accounts needed.
- **32-bit float** over 16-bit PCM: Higher precision, widely supported, avoids quantization on subtle terrain.

## Open Questions
- Higher frame count exports (64, 128, 256 frames) as premium upsell?
- Should we show a preview of what synths the file works with?
- Batch export for multiple locations?
