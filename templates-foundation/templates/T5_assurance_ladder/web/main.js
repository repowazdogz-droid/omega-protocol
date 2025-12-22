import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js";

import { setupUI } from "./ui.js";
import { setupInspector } from "./inspector.js";
import { buildScene } from "./scene.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e0e11);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(10, 8, 14);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

document.getElementById("resetView").onclick = () => {
  camera.position.set(10, 8, 14);
  controls.target.set(0, 0, 0);
  controls.update();
};

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Calm lights + reference grid
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dir = new THREE.DirectionalLight(0xffffff, 0.5);
dir.position.set(10, 20, 10);
scene.add(dir);

const grid = new THREE.GridHelper(30, 30, 0x333344, 0x222233);
grid.position.y = -2;
scene.add(grid);

// Build T5 content
buildScene(scene);

// Shared UI + Inspector
setupUI(scene);
setupInspector(scene, camera, renderer);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();





