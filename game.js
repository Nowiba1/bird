// game.js
const GameState = {
    roomCode: null, myPlayerId: null, isHost: false,
    birds: {}, localBird: null,
    canvas: null, ctx: null,

    async init() {
        this.roomCode = sessionStorage.getItem('roomCode');
        this.myPlayerId = sessionStorage.getItem('playerId');
        this.isHost = sessionStorage.getItem('isHost') === 'true';
        if (!this.roomCode) return window.location.href = 'index.html';

        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());

        InputManager.init();

        const refs = {
            room: getRoomRef(this.roomCode),
            players: getPlayersRef(this.roomCode)
        };

        refs.room.child('state').on('value', snap => {
            if (snap.val() === 'lobby') window.location.href = 'lobby.html';
        });

        refs.players.on('value', snap => {
            const data = snap.val() || {};
            for (let id of Object.keys(this.birds)) {
                if (!data[id]) delete this.birds[id];
            }
            for (let id in data) {
                const p = data[id];
                if (!p || p.alive === false) {
                    if (this.birds[id]) this.birds[id].alive = false;
                    continue;
                }
                if (!this.birds[id]) {
                    this.birds[id] = new Bird({ id, ...p });
                    if (id === this.myPlayerId) {
                        this.localBird = this.birds[id];
                        InputManager.setLocalBird(this.localBird);
                    }
                } else if (id !== this.myPlayerId) {
                    this.birds[id].y = p.y || 0.5;
                    this.birds[id].alive = p.alive !== false;
                    this.birds[id].score = p.score || 0;
                }
            }
            document.getElementById('aliveHud').textContent = '🟢 ' + Object.values(this.birds).filter(b => b.alive).length;
        });

        if (this.isHost) {
            PipeManager.init();
            this.hostLoop();
        }

        requestAnimationFrame(t => this.renderLoop(t));
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    hostLoop() {
        const interval = 16;
        setInterval(() => {
            const now = Date.now();
            PipeManager.update(interval, now);

            // Update all birds
            for (let id in this.birds) {
                const bird = this.birds[id];
                if (!bird.alive) continue;
                bird.update(interval);
                // Pipe collision
                for (let pipe of PipeManager.pipes) {
                    if (bird.checkPipeCollision(pipe)) {
                        bird.die();
                    }
                }
                // Score from passing pipes
                if (PipeManager.checkPassed(0.3)) bird.score++;
            }

            // Sync all
            const updates = {};
            for (let id in this.birds) {
                updates[id] = this.birds[id].serialize();
            }
            getPlayersRef(this.roomCode).set(updates);

            // Check if round over (all dead)
            const alive = Object.values(this.birds).filter(b => b.alive).length;
            if (alive === 0) {
                PipeManager.init();
                for (let id in this.birds) {
                    this.birds[id].alive = true;
                    this.birds[id].y = 0.5;
                    this.birds[id].vy = 0;
                    this.birds[id].score = 0;
                }
            }
        }, interval);
    },

    renderLoop() {
        requestAnimationFrame(t => this.renderLoop());
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#70c5ce');
        skyGrad.addColorStop(1, '#a8e6cf');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Ground
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, h - 40, w, 40);
        ctx.fillStyle = '#6B3410';
        ctx.fillRect(0, h - 40, w, 5);

        // Pipes (only host renders, or sync pipe state)
        PipeManager.render(ctx, w, h);

        // Birds
        for (let id in this.birds) {
            if (id === this.myPlayerId) continue;
            this.birds[id].render(ctx, w, h, false);
        }
        if (this.localBird) this.localBird.render(ctx, w, h, true);

        // Score
        if (this.localBird) {
            document.getElementById('scoreHud').textContent = '🏆 ' + this.localBird.score;
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('game.html')) setTimeout(() => GameState.init(), 500);
});
