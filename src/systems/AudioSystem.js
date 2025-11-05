/**
 * AudioSystem - Manages game audio (shooting, impacts, gates, music)
 * Uses Web Audio API for high-performance sound playback
 */

export class AudioSystem {
    constructor() {
        this.context = null;
        this.sounds = {};
        this.masterGain = null;
        this.enabled = true;
        this.volume = 0.5; // Master volume (0-1)

        this.initAudioContext();
    }

    initAudioContext() {
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();

            // Create master gain node
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.context.destination);

            console.log('🔊 Audio System initialized');
        } catch (error) {
            console.warn('Audio not supported:', error);
            this.enabled = false;
        }
    }

    /**
     * Resume audio context (required after user interaction)
     */
    async resumeContext() {
        if (this.context && this.context.state === 'suspended') {
            await this.context.resume();
        }
    }

    /**
     * Generate procedural sound effects (no audio files needed!)
     */

    /**
     * Play shooting sound
     */
    playShoot() {
        if (!this.enabled || !this.context) return;

        this.resumeContext();

        const now = this.context.currentTime;
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        // Pew pew laser sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.1);

        // Quick attack and decay
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.start(now);
        oscillator.stop(now + 0.1);
    }

    /**
     * Play impact sound (bullet hits obstacle/enemy)
     */
    playImpact() {
        if (!this.enabled || !this.context) return;

        this.resumeContext();

        const now = this.context.currentTime;
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        // Thud/impact sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.05);

        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.start(now);
        oscillator.stop(now + 0.05);
    }

    /**
     * Play explosion sound
     */
    playExplosion() {
        if (!this.enabled || !this.context) return;

        this.resumeContext();

        const now = this.context.currentTime;

        // Create noise for explosion
        const bufferSize = this.context.sampleRate * 0.5;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        // Fill with noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 10);
        }

        const source = this.context.createBufferSource();
        source.buffer = buffer;

        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.5);

        const gainNode = this.context.createGain();
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);

        source.start(now);
        source.stop(now + 0.5);
    }

    /**
     * Play gate pass sound (positive)
     */
    playGatePositive() {
        if (!this.enabled || !this.context) return;

        this.resumeContext();

        const now = this.context.currentTime;
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        // Ascending tone (success!)
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, now);
        oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.15);

        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.start(now);
        oscillator.stop(now + 0.15);
    }

    /**
     * Play gate pass sound (negative)
     */
    playGateNegative() {
        if (!this.enabled || !this.context) return;

        this.resumeContext();

        const now = this.context.currentTime;
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        // Descending tone (danger!)
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(330, now);
        oscillator.frequency.exponentialRampToValueAtTime(110, now + 0.2);

        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.start(now);
        oscillator.stop(now + 0.2);
    }

    /**
     * Play gate hit sound (bullet hitting gate)
     */
    playGateHit() {
        if (!this.enabled || !this.context) return;

        this.resumeContext();

        const now = this.context.currentTime;
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        // Metallic ping
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1200, now);
        oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.08);

        gainNode.gain.setValueAtTime(0.12, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.start(now);
        oscillator.stop(now + 0.08);
    }

    /**
     * Set master volume
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
    }

    /**
     * Toggle audio on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled && this.context) {
            this.context.suspend();
        } else if (this.enabled && this.context) {
            this.resumeContext();
        }
        return this.enabled;
    }

    /**
     * Cleanup
     */
    dispose() {
        if (this.context) {
            this.context.close();
        }
    }
}

export default AudioSystem;
