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
let cameraCenter = new THREE.Vector3();
const cameraHorzLimit = 1;
const cameraVertLimit = 1;
let ambientLight, pointAccentLight;
// const directionalLight = new THREE.DirectionalLight('#77B5BD', 5);
let accentColor = new THREE.Color('#299639');
let tagColor = new THREE.Color('#6FD5E5');
let stateColor = new THREE.Color('#1E1531');
let params;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color('white');
  renderer = new THREE.WebGLRenderer({antialias: true});

  // GUI
  params = {
    selectionColor: tagColor,
    wireframe: false,
    lightColor: accentColor,
    lightIntensity: 15,
  }
  gui.addColor(params, 'selectionColor');
  gui.add(params, 'wireframe');
  gui.addColor(params, 'lightColor');
  gui.add(params, 'lightIntensity', 0, 30, .5);

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
  camera.position.set(2, .5, 5);
  cameraCenter.x = camera.position.x;
  cameraCenter.y = camera.position.y;
  // CONTROLS
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  // LIGHTS
  // directionalLight.position.set(5, 0, 0);
  // console.log(directionalLight);
  // scene.add(directionalLight);

  pointAccentLight = new THREE.PointLight('#77B5BD', 1);
  pointAccentLight.position.set(2, 1, -1);
  console.log(pointAccentLight);
  scene.add(pointAccentLight);
  // const sphereSize = 1;
  // const pointAccentLightHelper = new THREE.PointLightHelper(pointAccentLight, sphereSize);
  // scene.add(pointAccentLightHelper);
  ambientLight = new THREE.AmbientLight('#ffffff', .7);
  scene.add(ambientLight);

  window.addEventListener('mousemove', onMouseMove, false);
  // renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function render() {  
  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);
  pointAccentLight.color = params.lightColor;
  pointAccentLight.intensity = params.lightIntensity;
  // Allow meshes to load
  if (meshes && meshes.length) {
    meshes.forEach(mesh => {
      mesh.material.color.set(stateColor);
      mesh.material.wireframe = params.wireframe;
      if (!mesh.animation.reversed()) {
        mesh.animation.reverse();
      }
    });

    // Get the model meshes that are being intersected
    intersects = raycaster.intersectObjects(meshes);
    if (intersects.length) {
      let pickedObject = intersects[0].object;
      pickedObject.material.color.set(params.selectionColor);
      pickedObject.animation.play();
    }
  }
  renderer.render(scene, camera);
}

function animate() {
  const elapsedTime = clock.getElapsedTime();
  render();
  updateCamera();
  requestAnimationFrame(animate);
  controls.update();
}

function updateCamera() {
  // Pan camera with movement of mouse
  camera.position.x = cameraCenter.x + (cameraHorzLimit * mouse.x)/2;
  camera.position.y = cameraCenter.y + (cameraVertLimit * mouse.y)/2;
}

function onMouseMove(event) {
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function processSplineGLTF(gltf) {
  model = gltf.scene.children[0];
  model.scale.set(.005, .005, .005);
  model.position.set(-3, 5, 0);
  scene.add(model);
  // console.log(model);
  meshes = model.children.filter(object => object.type === "Mesh");
  meshes.forEach((mesh) => {
    // Create a new material for each region so they can be highlighted individually
    mesh.material = new THREE.MeshStandardMaterial();
    mesh.material.metalness = 0;
    mesh.material.roughness = 1;
    // mesh.material.emissive = new THREE.Color("red");
    mesh.material.flatShading = true;
    // let line = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({color: 0xff0000}));
    // scene.add(line);
    // console.log(mesh.geometry);
    mesh.animation = gsap.to(mesh.position, {duration: .2, z: 25});
    mesh.animation.pause();
  });
}