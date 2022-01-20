import * as THREE from 'three';
import gsap from 'gsap';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import GUI from 'lil-gui';

const gui = new GUI();
var camera, scene, renderer, controls, intersects;
let model, meshes;
var mouse = new THREE.Vector2(1, 1);
const raycaster = new THREE.Raycaster();
const clock = new THREE.Clock();
const aspectRatio = window.innerWidth / window.innerHeight;
let tagColor = new THREE.Color('blue');
let params;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color('skyblue');
  renderer = new THREE.WebGLRenderer({antialias: true});

  // GUI
  params = {
    color: tagColor
  }
  gui.addColor(params, 'color');

  //Init Loader and import model
  var loader = new GLTFLoader();

  loader.load(
    'models/state-map.gltf',
    function (gltf) {
      processSplineGLTF(gltf)
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );

  // CAMERA
  camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 100);
  camera.position.set(0, 0, 5);
  // CONTROLS
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  // LIGHTS
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(2, 8, 4);
  scene.add(directionalLight);
  const ambientLight = new THREE.AmbientLight(0xffffff, .4);
  scene.add(ambientLight);

  window.addEventListener('mousemove', onMouseMove, false);
  // renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function render() {
  // Pan camera with movement of mouse
  // console.log(Math.round(mouse.x * 100) / 100);
  // if (camera.position.x > -1 && camera.position.x < 1) {
  //   camera.position.x += Math.round(mouse.x * 100) / 100;
  //   controls.update();
  // }
    // camera.position.y += mouse.y / 10;
  
  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);
  if (meshes && meshes.length) {
    // Get the objects in the scene being intersected
    meshes.forEach(mesh => mesh.material.color.set("white"));
    intersects = raycaster.intersectObjects(meshes);
    if (intersects.length) {
      for (let i = 0; i < intersects.length; i++) {
        intersects[0].object.material.color.set(params.color);
      }
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
  // console.log(mouse.x);
}

function processSplineGLTF(gltf) {
  model = gltf.scene.children[0];
  model.scale.set(.005, .005, .005);
  model.position.set(-3, 5, 0);
  // console.log(model);
  scene.add(model);
  meshes = model.children.filter(object => object.type === "Mesh");
  meshes.forEach((mesh) => {
    // Create a new basic material for each region so they can be highlighted individually
    // mesh.material = new THREE.MeshStandardMaterial({color: 'white'})
    mesh.material = new THREE.MeshBasicMaterial({color: 'white'})
  });
}