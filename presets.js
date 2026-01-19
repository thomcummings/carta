// ============================================================
// CARTA - FACTORY PRESETS
// ============================================================
//
// Edit these to create new presets. Each preset defines all synth parameters.
// Location coordinates will trigger a terrain fetch on load.
//
// To add a new preset:
// 1. Copy an existing preset object
// 2. Change the name and parameters
// 3. Add to FACTORY_PRESETS array
//
// Parameter reference:
// - location: { lat, lng } - coordinates for terrain fetch
// - areaSize: "5" | "10" | "50" - km area to fetch
// - volume: 0-1 - master volume
// - morph.position: 0-1 - morph slider position
// - morph.modSource: "manual" | "lfo1" | "lfo2" | "snh" | "drift" | "midi-wheel" | "midi-velocity"
// - morph.modRange: 0-1 - modulation depth
// - morph.modOffset: 0-1 - modulation center point
// - filter.cutoff: 20-20000 Hz
// - filter.resonance: 0-30
// - filter.modSource/modRange/modOffset: same as morph
// - lfo1.rate, lfo2.rate: 0-1 (exponential, maps to 0.05-10Hz)
// - adsr: attack/decay/release in seconds, sustain 0-1
// - reverb: mix/size/damping/shimmer 0-1, decay 0.1-5s, predelay 0-100ms
// - sequencer: tempo in BPM, length "0.25"|"0.5"|"1"|"2"|"4" (1/16 to whole note), probability 0-100
// - sequencer: pattern "random"|"ascending"|"descending"|"pendulum"
// - sequencer: scale name, rootNote A-G, octaveLow/octaveHigh 1-7
//
// ============================================================

const FACTORY_PRESETS = [
    {
        name: "-- Select Preset --",
        isPlaceholder: true,
    },

    {
        name: "Alpine Peaks",
        description: "Jagged Swiss mountain terrain with bright, evolving textures",
        location: { lat: 46.5197, lng: 7.9597 },
        areaSize: "5",
        volume: 0.7,

        morph: {
            position: 0.5,
            modSource: "lfo1",
            modRange: 0.3,
            modOffset: 0.35,
        },

        filter: {
            cutoff: 12000,
            resonance: 2,
            modSource: "manual",
            modRange: 1,
            modOffset: 0.5,
        },

        lfo1: { rate: 0.35 },
        lfo2: { rate: 0.5 },

        adsr: { attack: 0.05, decay: 0.2, sustain: 0.6, release: 0.8 },

        reverb: {
            mix: 0.35,
            size: 0.6,
            decay: 2.5,
            predelay: 20,
            damping: 0.3,
            shimmer: 0.15,
        },

        sequencer: {
            tempo: 90,
            length: "0.5",
            pattern: "pendulum",
            probability: 75,
            scale: "minor",
            rootNote: "D",
            octaveLow: 3,
            octaveHigh: 5,
        },

        // Terrain stacking (feature/terrain-stacking branch)
        // Uncomment when merged:
        // stacking: {
        //     frames: 3,
        //     spread: 15,
        // },
    },

    {
        name: "Grand Canyon",
        description: "Layered Arizona canyon with deep, resonant character",
        location: { lat: 36.0544, lng: -112.1401 },
        areaSize: "10",
        volume: 0.7,

        morph: {
            position: 0.3,
            modSource: "drift",
            modRange: 0.2,
            modOffset: 0.3,
        },

        filter: {
            cutoff: 4000,
            resonance: 4,
            modSource: "lfo2",
            modRange: 0.4,
            modOffset: 0.2,
        },

        lfo1: { rate: 0.2 },
        lfo2: { rate: 0.15 },

        adsr: { attack: 0.3, decay: 0.4, sustain: 0.5, release: 1.5 },

        reverb: {
            mix: 0.5,
            size: 0.8,
            decay: 4,
            predelay: 40,
            damping: 0.5,
            shimmer: 0.05,
        },

        sequencer: {
            tempo: 60,
            length: "0.25",
            pattern: "random",
            probability: 50,
            scale: "dorian",
            rootNote: "A",
            octaveLow: 2,
            octaveHigh: 4,
        },

        // stacking: {
        //     frames: 5,
        //     spread: 25,
        // },
    },

    {
        name: "Sahara Dunes",
        description: "Smooth rolling sand dunes with gentle, warm tones",
        location: { lat: 25.0494, lng: 10.4451 },
        areaSize: "10",
        volume: 0.7,

        morph: {
            position: 0.5,
            modSource: "lfo1",
            modRange: 0.5,
            modOffset: 0.25,
        },

        filter: {
            cutoff: 6000,
            resonance: 1,
            modSource: "manual",
            modRange: 1,
            modOffset: 0.5,
        },

        lfo1: { rate: 0.1 },
        lfo2: { rate: 0.25 },

        adsr: { attack: 0.5, decay: 0.3, sustain: 0.8, release: 2 },

        reverb: {
            mix: 0.4,
            size: 0.7,
            decay: 3,
            predelay: 30,
            damping: 0.6,
            shimmer: 0.2,
        },

        sequencer: {
            tempo: 75,
            length: "0.5",
            pattern: "ascending",
            probability: 60,
            scale: "phrygian",
            rootNote: "E",
            octaveLow: 3,
            octaveHigh: 5,
        },

        // stacking: {
        //     frames: 3,
        //     spread: 30,
        // },
    },

    {
        name: "Icelandic Fjords",
        description: "Sharp coastal ridges with icy, crystalline textures",
        location: { lat: 65.6835, lng: -18.1002 },
        areaSize: "5",
        volume: 0.7,

        morph: {
            position: 0.7,
            modSource: "snh",
            modRange: 0.25,
            modOffset: 0.6,
        },

        filter: {
            cutoff: 16000,
            resonance: 6,
            modSource: "lfo1",
            modRange: 0.3,
            modOffset: 0.7,
        },

        lfo1: { rate: 0.6 },
        lfo2: { rate: 0.4 },

        adsr: { attack: 0.01, decay: 0.15, sustain: 0.4, release: 0.5 },

        reverb: {
            mix: 0.45,
            size: 0.5,
            decay: 2,
            predelay: 15,
            damping: 0.2,
            shimmer: 0.35,
        },

        sequencer: {
            tempo: 130,
            length: "0.5",
            pattern: "pendulum",
            probability: 85,
            scale: "minor",
            rootNote: "F#",
            octaveLow: 4,
            octaveHigh: 6,
        },

        // stacking: {
        //     frames: 5,
        //     spread: 10,
        // },
    },

    {
        name: "Himalayan Ridge",
        description: "Extreme elevation with massive, powerful harmonics",
        location: { lat: 27.9881, lng: 86.9250 },
        areaSize: "5",
        volume: 0.65,

        morph: {
            position: 0.4,
            modSource: "lfo2",
            modRange: 0.35,
            modOffset: 0.3,
        },

        filter: {
            cutoff: 8000,
            resonance: 3,
            modSource: "drift",
            modRange: 0.2,
            modOffset: 0.4,
        },

        lfo1: { rate: 0.3 },
        lfo2: { rate: 0.08 },

        adsr: { attack: 0.2, decay: 0.5, sustain: 0.7, release: 1.2 },

        reverb: {
            mix: 0.55,
            size: 0.9,
            decay: 4.5,
            predelay: 50,
            damping: 0.4,
            shimmer: 0.1,
        },

        sequencer: {
            tempo: 70,
            length: "0.25",
            pattern: "random",
            probability: 40,
            scale: "pentatonic",
            rootNote: "G",
            octaveLow: 2,
            octaveHigh: 5,
        },

        // stacking: {
        //     frames: 7,
        //     spread: 20,
        // },
    },

    {
        name: "Scottish Highlands",
        description: "Rolling green hills with warm, pastoral character",
        location: { lat: 57.0442, lng: -4.8596 },
        areaSize: "10",
        volume: 0.7,

        morph: {
            position: 0.6,
            modSource: "lfo1",
            modRange: 0.4,
            modOffset: 0.4,
        },

        filter: {
            cutoff: 5000,
            resonance: 2,
            modSource: "manual",
            modRange: 1,
            modOffset: 0.5,
        },

        lfo1: { rate: 0.18 },
        lfo2: { rate: 0.3 },

        adsr: { attack: 0.15, decay: 0.25, sustain: 0.65, release: 1 },

        reverb: {
            mix: 0.3,
            size: 0.55,
            decay: 2.2,
            predelay: 25,
            damping: 0.5,
            shimmer: 0.08,
        },

        sequencer: {
            tempo: 100,
            length: "0.5",
            pattern: "ascending",
            probability: 70,
            scale: "mixolydian",
            rootNote: "G",
            octaveLow: 3,
            octaveHigh: 5,
        },

        // stacking: {
        //     frames: 3,
        //     spread: 20,
        // },
    },
];
