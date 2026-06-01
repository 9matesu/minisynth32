export const defaultSynthState = {
    osc1: {
        waveform: 'square',
        octave: 0,
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
    },
    waveDisplay: {
        samples: [],
    },
};
//# sourceMappingURL=synth.js.map