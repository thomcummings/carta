# Decisions

Log of significant choices and their reasoning.

---

## 2026-03-24 Wavetable export format: 2048-sample frames with clm chunk

**Context:** Carta's internal engine uses 256-sample frames, but external synths expect 2048.

**Options considered:**
1. Export at 256 samples (native) — smallest file, but most synths won't auto-detect and some may reject
2. Export at 2048 samples with clm chunk — industry standard, auto-detected by Serum/Vital/Phase Plant
3. Export at 4096 samples — higher resolution but diminishing returns, larger files

**Decision:** 2048 samples per frame with `clm ` RIFF chunk containing `<!>2048`.

**Reasoning:** 2048 is the de facto standard set by Serum and adopted by Vital, Phase Plant, Pigments, and Surge. The `clm ` chunk enables auto-detection so users don't have to manually specify frame size on import. Upsampling via spectral interpolation (FFT → zero-pad → IFFT) is mathematically exact for periodic waveforms.

**Consequences:** Export files are ~256 KB (vs ~32 KB at native 256). Upsampling adds brief computation time but is imperceptible. Format works across all major wavetable synths without user friction.

---

## 2026-03-24 Per-download payment model over subscription

**Context:** Wavetable export is planned as the first monetisation feature.

**Options considered:**
1. Subscription/premium tier — recurring revenue, but requires user accounts, auth, session management
2. Per-download payment via Stripe Checkout — simple, no accounts needed, just redirect-and-back
3. Free forever — no revenue

**Decision:** Per-download at £1.99 via Stripe Checkout (not yet implemented, but architecture prepared).

**Reasoning:** A single `handleDownloadWavetable()` method becomes the Stripe entry point. No user database, no login flow, no "my account" page. Stripe handles the entire payment UI. Lowest implementation cost with clear value exchange.

**Consequences:** Feature flag system (`FEATURES.wavetableExport.enabled`) gates the feature. Today it's free (`true`). Flip to Stripe checkout call when ready. No user state to manage.

---

## Template

Copy this for new decisions:
## [YYYY-MM-DD] [Decision Title]

**Context:**

**Options considered:**
1.
2.
3.

**Decision:**

**Reasoning:**

**Consequences:**
