// pipes.js
const PipeManager = {
    pipes: [],
    spawnTimer: 0,
    spawnInterval: 2500,
    gapSize: 0.22,
    speed: 0.0003,

    init() { this.pipes = []; this.spawnTimer = 0; },

    update(dt, time) {
        this.spawnTimer += dt;
        if (this.spawnTimer > this.spawnInterval) {
            this.spawnTimer = 0;
            const gapY = 0.3 + Math.random() * 0.4;
            this.pipes.push({ x: 1.1, gapY, gapSize: this.gapSize, width: 0.08 });
        }
        for (let p of this.pipes) p.x -= this.speed * dt;
        this.pipes = this.pipes.filter(p => p.x > -0.2);
    },

    checkPassed(birdX) {
        for (let p of this.pipes) {
            if (!p.passed && p.x + p.width/2 < birdX) {
                p.passed = true;
                return true;
            }
        }
        return false;
    },

    render(ctx, w, h) {
        ctx.fillStyle = '#2d8a2d';
        for (let p of this.pipes) {
            const px = p.x * w;
            const topHeight = (p.gapY - p.gapSize/2) * h;
            const bottomY = (p.gapY + p.gapSize/2) * h;
            const pipeW = p.width * w;

            // Top pipe
            ctx.fillRect(px - pipeW/2, 0, pipeW, topHeight);
            ctx.fillStyle = '#3ab03a';
            ctx.fillRect(px - pipeW/2 - 4, topHeight - 30, pipeW + 8, 30);

            // Bottom pipe
            ctx.fillStyle = '#2d8a2d';
            ctx.fillRect(px - pipeW/2, bottomY, pipeW, h - bottomY);
            ctx.fillStyle = '#3ab03a';
            ctx.fillRect(px - pipeW/2 - 4, bottomY, pipeW + 8, 30);
            ctx.fillStyle = '#2d8a2d';
        }
    }
};
