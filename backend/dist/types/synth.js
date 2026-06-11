export const defaultSynthState = {
    osc1: {
        waveform: 'saw',
        octave: 0,
        detune: 0,
        volume: 72,
    },
    filter: {
        enabled: true,
        cutoff: 58,
        resonance: 36,
        slope: 12,
        envelope: 42,
    },
    ampAdsr: {
        attack: 12,
        decay: 46,
        sustain: 78,
        release: 34,
    },
    arpeggiator: {
        enabled: false,
        rate: 8,
    },
    global: {
        midiChannel: 1,
        voices: 4,
        multiCore: true,
    }
};
//# sourceMappingURL=synth.js.map