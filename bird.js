// bird.js
class Bird {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.color = data.color || '#ffdd00';
        this.y = data.y || 0.5;
        this.vy = 0;
        this.alive = data.alive !== false;
        this.score = data.score || 0;
        this.width = 0.08;
        this.height = 0.06;
    }

    flap() {
        if (!this.alive) return;
        this.vy = -0.012;
    }

    update(dt) {
        if (!this.alive) return;
        this.vy += 0.0005 * dt;
        this.y += this.vy * dt;
        if (this.y < 0) { this.y = 0; this.vy = 0; }
        if (this.y > 1) { this.y = 1; this.die(); }
    }

    die() { this.alive = false; }

    checkPipeCollision(pipe) {
        if (!this.alive) return false;
        const bx = 0.3;
        const bw = this.width;
        const bh = this.height;
        const by = this.y;
        if (bx + bw > pipe.x - pipe.width/2 && bx - bw < pipe.x + pipe.width/2) {
            if (by - bh < pipe.gapY - pipe.gapSize/2 || by + bh > pipe.gapY + pipe.gapSize/2) {
                return true;
            }
        }
        return false;
    }

    serialize() {
        return { id:this.id, name:this.name, color:this.color, y:this.y, vy:this.vy, alive:this.alive, score:this.score };
    }

    render(ctx, w, h, isLocal) {
        if (!this.alive) return;
        const x = w * 0.3;
        const y = this.y * h;
        const size = Math.min(w, h) * 0.06;

        // Body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Wing
        const wingFlap = Math.sin(Date.now() * 0.01) * 5;
        ctx.fillStyle = this.darken(this.color, 30);
        ctx.beginPath();
        ctx.ellipse(x - size * 0.5, y + size * 0.3 + wingFlap, size * 0.6, size * 0.3, -0.5, 0, Math.PI * 2);
        ctx.fill();

        // Eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x + size * 0.4, y - size * 0.2, size * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x + size * 0.5, y - size * 0.2, size * 0.12, 0, Math.PI * 2);
        ctx.fill();

        // Name
        ctx.fillStyle = '#fff';
        ctx.font = `${size*0.8}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(this.name, x, y - size * 1.5);
    }

    darken(hex, pct) {
        let r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
        r = Math.max(0, r - Math.floor(r*pct/100));
        g = Math.max(0, g - Math.floor(g*pct/100));
        b = Math.max(0, b - Math.floor(b*pct/100));
        return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
    }
}
