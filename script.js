const c = document.getElementById("c");
const ctx = c.getContext("2d");

let W = c.width = innerWidth;
let H = c.height = innerHeight;

const CX = W / 2;
const CY = H / 2;

/* 🌌 stars */
let stars = [];
for (let i = 0; i < 250; i++) {
    stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        a: Math.random()
    });
}

/* 🪨 asteroids */
let rocks = [];
for (let i = 0; i < 50; i++) {
    rocks.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2
    });
}

/* ☄️ meteors */
let meteors = [];

function spawnMeteor() {
    meteors.push({
        x: Math.random() * W,
        y: -50,
        vx: -0.6 - Math.random() * 1.2,
        vy: 0.4 + Math.random() * 0.9,
        len: 20 + Math.random() * 25,
        life: 250 + Math.random() * 120
    });
}

/* 🌞 sun */
const SUN_RADIUS = 90;
const SUN_CORE = 28;

/* 🪐 planets */
let planets = [
    { r: 110, speed: 0.020, angle: 0, color: "#cfcfcf", size: 3 },
    { r: 150, speed: 0.016, angle: 1, color: "#d9a066", size: 5 },
    { r: 200, speed: 0.013, angle: 2, color: "#4aa3ff", size: 6 },
    { r: 250, speed: 0.010, angle: 3, color: "#ff5533", size: 5 },
    { r: 320, speed: 0.007, angle: 4, color: "#d2b48c", size: 12 },
    { r: 390, speed: 0.005, angle: 5, color: "#e6d2a3", size: 10 },
    { r: 460, speed: 0.0035, angle: 6, color: "#7ad7e0", size: 8 },
    { r: 530, speed: 0.0025, angle: 7, color: "#4b6cff", size: 8 }
];

let moon = {
    r: 16,
    speed: 0.05,
    angle: 0
};

/* 🌌 stars */
function drawStars() {
    for (let s of stars) {
        ctx.fillStyle = `rgba(255,255,255,${s.a})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1, 0, Math.PI * 2);
        ctx.fill();
    }
}

/* 🪨 asteroids */
function drawRocks() {
    for (let r of rocks) {
        ctx.fillStyle = "rgba(150,150,150,0.2)";
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.fill();
    }
}

/* ☄️ meteors */
function drawMeteors() {
    for (let i = 0; i < meteors.length; i++) {
        let m = meteors[i];

        m.x += m.vx;
        m.y += m.vy;
        m.life--;

        ctx.beginPath();
        ctx.strokeStyle = "rgba(255,210,160,0.25)";
        ctx.lineWidth = 1;
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * m.len, m.y - m.vy * m.len);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.arc(m.x, m.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    meteors = meteors.filter(m =>
        m.x > -200 && m.x < W + 200 &&
        m.y < H + 200 &&
        m.life > 0
    );
}

/* 🌞 sun */
function drawSun() {
    let g = ctx.createRadialGradient(CX, CY, 5, CX, CY, SUN_RADIUS);

    g.addColorStop(0, "#fff8dd");
    g.addColorStop(0.25, "#ffb300");
    g.addColorStop(0.6, "#ff5a00");
    g.addColorStop(1, "rgba(0,0,0,0)");

    ctx.beginPath();
    ctx.fillStyle = g;
    ctx.arc(CX, CY, SUN_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "#ffcc66";
    ctx.arc(CX, CY, SUN_CORE, 0, Math.PI * 2);
    ctx.fill();
}

/* 🎬 animation */
function animate() {
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0, 0, W, H);

    drawStars();
    drawRocks();

    ctx.globalCompositeOperation = "lighter";

    drawSun();

    planets.forEach((p, i) => {
        p.angle += p.speed;

        let x = CX + Math.cos(p.angle) * p.r;
        let y = CY + Math.sin(p.angle) * p.r;

        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (i === 2) {
            moon.angle += moon.speed;

            let mx = x + Math.cos(moon.angle) * moon.r;
            let my = y + Math.sin(moon.angle) * moon.r;

            ctx.beginPath();
            ctx.fillStyle = "#ddd";
            ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    if (Math.random() < 0.01) spawnMeteor();

    drawMeteors();

    ctx.globalCompositeOperation = "source-over";

    requestAnimationFrame(animate);
}

animate();

window.onresize = () => location.reload();