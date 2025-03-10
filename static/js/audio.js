class GameAudio {
    constructor() {
        this.synth = new Tone.Synth().toDestination();
        this.initialized = false;
    }

    async init() {
        if (!this.initialized) {
            await Tone.start();
            this.initialized = true;
        }
    }

    playCorrect() {
        if (!this.initialized) return;
        this.synth.triggerAttackRelease("C5", "8n");
    }

    playIncorrect() {
        if (!this.initialized) return;
        this.synth.triggerAttackRelease("A3", "8n");
    }

    playGameStart() {
        if (!this.initialized) return;
        const now = Tone.now();
        this.synth.triggerAttackRelease("C4", "8n", now);
        this.synth.triggerAttackRelease("E4", "8n", now + 0.1);
        this.synth.triggerAttackRelease("G4", "8n", now + 0.2);
    }

    playGameOver() {
        if (!this.initialized) return;
        const now = Tone.now();
        this.synth.triggerAttackRelease("G4", "8n", now);
        this.synth.triggerAttackRelease("E4", "8n", now + 0.1);
        this.synth.triggerAttackRelease("C4", "8n", now + 0.2);
    }
}

// Create global audio instance
window.gameAudio = new GameAudio();
