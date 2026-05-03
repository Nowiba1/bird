// input.js
const InputManager = {
    localBird: null,
    init() {
        window.addEventListener('keydown', e => {
            if (e.code === 'Space') { e.preventDefault(); this.flap(); }
        });
        document.getElementById('gameCanvas').addEventListener('pointerdown', e => {
            e.preventDefault();
            this.flap();
        });
    },
    flap() {
        if (this.localBird && this.localBird.alive) this.localBird.flap();
    },
    setLocalBird(b) { this.localBird = b; }
};
