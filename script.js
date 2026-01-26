
// Three.js Setup
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 3.5); // Initial zoom

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

// Logo Primary Color Light (The Sun/Glow)
const sunLight = new THREE.DirectionalLight(0xea9401, 1.5);
sunLight.position.set(5, 3, 5);
scene.add(sunLight);

// Backlight for atmosphere effect
const backLight = new THREE.SpotLight(0xea9401, 1);
backLight.position.set(-5, 0, -5);
scene.add(backLight);

// Texture Loader
const textureLoader = new THREE.TextureLoader();

// Earth Group (to rotate everything together including clouds)
const earthGroup = new THREE.Group();
scene.add(earthGroup);

// 1. Earth Sphere
// Using stable generic textures
const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
const earthMaterial = new THREE.MeshPhongMaterial({
    map: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg'),
    specularMap: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg'),
    normalMap: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg'),
    specular: new THREE.Color(0x333333),
    shininess: 15
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earthGroup.add(earth);

// 2. Clouds
const cloudGeometry = new THREE.SphereGeometry(1.02, 64, 64);
const cloudMaterial = new THREE.MeshPhongMaterial({
    map: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'),
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
});
const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
earthGroup.add(clouds);

// 3. Atmosphere Glow (Fresnel-like) (Simplified Geometry)
const atmosGeometry = new THREE.SphereGeometry(1.1, 64, 64);
const atmosMaterial = new THREE.MeshBasicMaterial({
    color: 0xea9401,
    transparent: true,
    opacity: 0.1,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
});
const atmosphere = new THREE.Mesh(atmosGeometry, atmosMaterial);
scene.add(atmosphere);

// 4. Stars
const starsGeometry = new THREE.BufferGeometry();
const starCount = 2000;
const starPos = new Float32Array(starCount * 3);
for(let i=0; i<starCount*3; i++) {
    starPos[i] = (Math.random() - 0.5) * 100;
}
starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const starsMaterial = new THREE.PointsMaterial({color: 0xffffff, size: 0.05});
const starField = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starField);

// 5. Planets (Simple representatives)
const planetGroup = new THREE.Group();
scene.add(planetGroup);

function createPlanet(size, color, distance, speed) {
    const geo = new THREE.SphereGeometry(size, 32, 32);
    const mat = new THREE.MeshStandardMaterial({color: color});
    const mesh = new THREE.Mesh(geo, mat);
    
    // Orbit object
    const orbit = new THREE.Object3D();
    orbit.add(mesh);
    planetGroup.add(orbit);
    mesh.position.x = distance;
    
    return { orbit, speed, mesh };
}

const planets = [
    createPlanet(0.05, 0xaaaaaa, 1.8, 0.5), // Mercury-ish
    createPlanet(0.08, 0xffcc00, 2.5, 0.3), // Venus-ish
    createPlanet(0.06, 0xff5500, 3.2, 0.2), // Mars-ish
];


// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Scroll Animation Variables
let scrollY = 0;
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
});

// Intersection Observer for CSS Fade-ins
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('section').forEach(section => {
    const title = section.querySelector('.section-title');
    if(title) observer.observe(title);
});
document.querySelectorAll('.mission-card').forEach(c => observer.observe(c));

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Rotation
    earth.rotation.y += 0.001;
    clouds.rotation.y += 0.0015;
    starField.rotation.y -= 0.0002;

    // Planets Orbit
    planets.forEach(p => {
        p.orbit.rotation.y += p.speed * 0.01;
    });

    // Scroll Effects
    // Move Earth based on scroll
    // Start at z=0, move back as we scroll down to "zoom out" or move up contextually
    const scrollPercent = scrollY / (document.body.scrollHeight - window.innerHeight);
    
    // Custom scroll choreography
    // Hero: Earth is big.
    // As scroll -> Earth moves Up and Away
    
    // Camera movement
    // camera.position.z = 3.5 + (scrollY * 0.005); // Zoom out
    
    // Earth position
    // earthGroup.position.y = scrollY * 0.002; 
    
    // Better effect:
    // Earth stays somewhat central but gets smaller/moves to background
    const targetScale = Math.max(0.5, 1 - scrollY * 0.001);
    // earthGroup.scale.setScalar(targetScale);
    
    // Or move it to the side? relative to scroll
    // User requested: "Earth slowly zooms out while rotating... Space scene moves upward"
    
    camera.position.y = -scrollY * 0.002; 
    
    renderer.render(scene, camera);
}

animate();
// ================= LOGO ORBIT =================

window.addEventListener("load", () => {

  const logo = document.getElementById("logo-orbit");
  if (!logo) return;

  const orbitRadius = 240;
  const orbitSpeed = 0.0006;
  let orbitAngle = 0;

  function animateLogoOrbit() {
    orbitAngle += orbitSpeed;

    const x = Math.cos(orbitAngle) * orbitRadius;
    const y = Math.sin(orbitAngle) * orbitRadius * 0.45;

    logo.style.transform = `
      translate(-50%, -50%)
      translate(${x}px, ${y}px)
    `;

    requestAnimationFrame(animateLogoOrbit);
  }

  animateLogoOrbit();
});
