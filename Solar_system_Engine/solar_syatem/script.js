const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  innerWidth / innerHeight,
  0.1,
  20000
);

camera.position.set(0, 0, 900);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// Light
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

const sunLight = new THREE.PointLight(0xffffff, 4, 12000);
scene.add(sunLight);

// Sun
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(80, 64, 64),
  new THREE.MeshBasicMaterial({ color: 0xffcc55 })
);
scene.add(sun);

// glow 
const glowCanvas = document.createElement("canvas");
glowCanvas.width = glowCanvas.height = 256;

const gctx = glowCanvas.getContext("2d");
let g = gctx.createRadialGradient(128, 128, 10, 128, 128, 128);
g.addColorStop(0, "rgba(255,220,120,1)");
g.addColorStop(1, "transparent");

gctx.fillStyle = g;
gctx.fillRect(0, 0, 256, 256);

const glow = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(glowCanvas),
    transparent: true
  })
);

glow.scale.set(400, 400, 1);
scene.add(glow);

// Stars
const starGeo = new THREE.BufferGeometry();
const starPos = [];

for (let i = 0; i < 5000; i++) {
  starPos.push(
    (Math.random() - 0.5) * 6000,
    (Math.random() - 0.5) * 6000,
    (Math.random() - 0.5) * 6000
  );
}

starGeo.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starPos, 3)
);

scene.add(
  new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ color: 0xffffff, size: 1 })
  )
);

// Planet
const loader = new THREE.TextureLoader();
const planets = [];
let earth;

const data = [
  { r: 130, s: 5, sp: 0.018, tex: "mercury.jpg" },
  { r: 190, s: 9, sp: 0.013, tex: "venus.jpg" },
  { r: 260, s: 11, sp: 0.010, tex: "earth_atmos_2048.jpg" },
  { r: 340, s: 8, sp: 0.008, tex: "mars.jpg" },
  { r: 460, s: 18, sp: 0.005, tex: "jupiter.jpg" },
  { r: 600, s: 16, sp: 0.003, tex: "saturn.jpg" },
  { r: 750, s: 13, sp: 0.002, tex: "uranus.jpg" },
  { r: 900, s: 13, sp: 0.0015, tex: "neptune.jpg" }
];

data.forEach(p => {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(p.s, 64, 64),
    new THREE.MeshStandardMaterial({
      map: loader.load(
        "https://threejs.org/examples/textures/planets/" + p.tex
      )
    })
  );

  m.userData = {
    a: Math.random() * 6.28,
    sp: p.sp,
    r: p.r
  };

  scene.add(m);
  planets.push(m);

  if (p.tex.includes("earth")) earth = m;
});

// Moon
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(2.5, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
);
scene.add(moon);

// Black Hole
const bh = new THREE.Mesh(
  new THREE.SphereGeometry(45, 64, 64),
  new THREE.MeshBasicMaterial({ color: 0x000000 })
);

bh.position.set(2000, 200, -1500);
scene.add(bh);

// disk 
const disk = new THREE.Mesh(
  new THREE.RingGeometry(90, 200, 128),
  new THREE.MeshBasicMaterial({
    color: 0xff5500,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide
  })
);

disk.position.copy(bh.position);
disk.rotation.x = Math.PI / 2;
scene.add(disk);

// halo 
const halo = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture((() => {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const ctx = c.getContext("2d");

      let g = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
      g.addColorStop(0, "orange");
      g.addColorStop(1, "transparent");

      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);

      return c;
    })()),
    transparent: true,
    blending: THREE.AdditiveBlending
  })
);

halo.scale.set(450, 450, 1);
halo.position.copy(bh.position);
scene.add(halo);

// Controls
let keys = {};
let mx = 0, my = 0;
let vel = new THREE.Vector3();

document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

document.addEventListener("mousemove", e => {
  mx -= e.movementX * 0.002;
  my -= e.movementY * 0.002;
  my = Math.max(-1.4, Math.min(1.4, my));
});

// Loop
function animate() {
  requestAnimationFrame(animate);

  // sun 
  sun.rotation.y += 0.002;
  glow.position.copy(sun.position);

  // planets 
  planets.forEach(p => {
    p.userData.a += p.userData.sp;
    p.position.x = Math.cos(p.userData.a) * p.userData.r;
    p.position.z = Math.sin(p.userData.a) * p.userData.r;
  });

  // moon 
  moon.position.set(
    earth.position.x + Math.cos(Date.now() * 0.002) * 25,
    earth.position.y,
    earth.position.z + Math.sin(Date.now() * 0.002) * 25
  );

  // camera movement 
  let speed = 10;

  let forward = new THREE.Vector3(-Math.sin(mx), 0, -Math.cos(mx));
  let right = new THREE.Vector3(Math.cos(mx), 0, -Math.sin(mx));

  if (keys["KeyW"]) vel.addScaledVector(forward, speed);
  if (keys["KeyS"]) vel.addScaledVector(forward, -speed);
  if (keys["KeyA"]) vel.addScaledVector(right, -speed);
  if (keys["KeyD"]) vel.addScaledVector(right, speed);

  vel.multiplyScalar(0.92);
  camera.position.add(vel);

  camera.rotation.x = my;
  camera.rotation.y = mx;

  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});