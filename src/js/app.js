import * as THREE from 'three';
import gsap from 'gsap';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

var camera, scene, renderer, controls, intersects, cube;
const cubes = [];
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(1, 1);
const clock = new THREE.Clock();

//Generate a random tag color
let cr = Math.floor(Math.random() * 255);
let cg = Math.floor(Math.random() * 255);
let cb = Math.floor(Math.random() * 255);
let tagColor = new THREE.Color(`rgb(${cr}, ${cg}, ${cb})`);

init();
animate();
render();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color('skyblue');
  renderer = new THREE.WebGLRenderer({antialias: true});
  const aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 100);
  camera.position.set(3, 6, 10);
  // Add OrbitControls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = true;
  // LIGHTS
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const cubeSpacing = 3;
  let delayCounter = .5;
  const geometry = new THREE.BoxGeometry(1, 1, 1);

  for (var i = -1; i <= 1; i++) {
    for (var j = -1; j <= 1; j++) {
      for (var k = -1; k <= 1; k++) {
        const material = new THREE.MeshBasicMaterial();
        cube = new THREE.Mesh(geometry, material);
        cubes.push(cube);
        scene.add(cube);
        cube.position.set(i * cubeSpacing, 0, j * cubeSpacing);
        let delayTime = delayCounter;
        gsap.to(cube.position, {duration: .3, delay: delayTime, y: k * cubeSpacing})
        delayCounter += .12;
      }
    }
  }

  window.addEventListener('mousemove', onMouseMove, false);
  // renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function render() {
  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);
  // Get the objects in the scene being intersected
  intersects = raycaster.intersectObjects(scene.children);
  // Clear cube colors on every frame
  for (let i = 0; i < cubes.length; i++) {
    cubes[i].material.color.set("white");
  }
  if (intersects.length) {
    for (let i = 0; i < intersects.length; i++) {
      // Change all intersecting cubes to the same color 
      intersects[i].object.material.color.set(tagColor);
    }
  }
  renderer.render(scene, camera);
}

function animate() {

  const elapsedTime = clock.getElapsedTime();

  render();
  requestAnimationFrame(animate);
  controls.update();

}

function onMouseMove(event) {
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}