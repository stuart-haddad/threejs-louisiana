import * as THREE from 'three';
import gsap from 'gsap';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import GUI from 'lil-gui';

// const gui = new GUI();
var camera, scene, renderer, controls, intersects;
let model, meshes;
var mouse = new THREE.Vector2(1, 1);
const raycaster = new THREE.Raycaster();
const clock = new THREE.Clock();
// Sizes - Used for Renderer Size, Aspect Ratio, and Mouse Events
const sizes = {
  width: document.querySelector(".three-wrap").clientWidth,
  height: document.querySelector(".three-wrap").clientHeight
};
const aspectRatio = sizes.width / sizes.height;
let cameraCenter = new THREE.Vector3();
const cameraHorzLimit = .5;
const cameraVertLimit = .5;
let ambientLight, pointAccentLight;
// const directionalLight = new THREE.DirectionalLight('#77B5BD', 5);
let accentColor = new THREE.Color('#299639');
let hoverColor = new THREE.Color('#6FD5E5');
let selectionColor = new THREE.Color('#71C3BF');
let stateColor = new THREE.Color('#1E1531');
let params;

init();
animate();

function init() {
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
  renderer.setClearColor(0x000000, 0);

  // GUI
  params = {
    hoverColor: hoverColor,
    lightColor: accentColor,
    lightIntensity: 15,
  }
  // gui.domElement.style.width = '300px';
  // gui.addColor(params, 'hoverColor').name('Hover Color');
  // gui.addColor(params, 'lightColor').name('Accent Light Color');
  // gui.add(params, 'lightIntensity', 0, 30, .5).name('Accent Light Intensity');

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
  camera.position.set(2.5, 0, 5);
  cameraCenter.x = camera.position.x;
  cameraCenter.y = camera.position.y;
  // CONTROLS
  // controls = new OrbitControls(camera, renderer.domElement);
  // controls.enableDamping = true;
  // LIGHTS
  // directionalLight.position.set(5, 0, 0);
  // console.log(directionalLight);
  // scene.add(directionalLight);

  pointAccentLight = new THREE.PointLight('#77B5BD', 1);
  pointAccentLight.position.set(2, .8, -1);
  scene.add(pointAccentLight);
  // const sphereSize = 1;
  // const pointAccentLightHelper = new THREE.PointLightHelper(pointAccentLight, sphereSize);
  // scene.add(pointAccentLightHelper);
  ambientLight = new THREE.AmbientLight('#ffffff', .5);
  scene.add(ambientLight);

  // Event Listeners
  // window.addEventListener('mousemove', onMouseMove, false);
  document.body.querySelector(".three-wrap").addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('resize', onResize);
  window.addEventListener('click', onClick);
  renderer.setSize(sizes.width, sizes.height);
  // document.body.appendChild(renderer.domElement);
  document.body.querySelector(".three-wrap").appendChild(renderer.domElement);
}

function render() {  
  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);
  pointAccentLight.color = params.lightColor;
  pointAccentLight.intensity = params.lightIntensity;
  // Allow meshes to load
  if (meshes && meshes.length) {
    meshes.forEach(mesh => {
      if (!mesh.selected) {
        mesh.material.color.set(stateColor);
        if (!mesh.animation.reversed()) {
          mesh.animation.reverse();
        }
      }
    });

    // Get the model meshes that are being intersected
    intersects = raycaster.intersectObjects(meshes);
    if (intersects.length) {
      let pickedObject = intersects[0].object;
      if (!pickedObject.selected) {
        pickedObject.material.color.set(params.hoverColor);
      }
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
  // controls.update();
}

function updateCamera() {
  // Pan camera with movement of mouse
  camera.position.x = cameraCenter.x + (cameraHorzLimit * mouse.x);
  camera.position.y = cameraCenter.y + (cameraVertLimit * mouse.y);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
}

function onClick() {
  // Reset selected region
  meshes.forEach(mesh => {
    mesh.selected = false;
  });
  // If hovering over a region, log its ID
  if (intersects.length) {
    intersects[0].object.selected = true;
    intersects[0].object.material.color.set(selectionColor);
    console.log(intersects[0].object.region);
  }
}

function onMouseMove(event) {
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  event.preventDefault();
  let rect = event.target.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / sizes.width) * 2 - 1;
  mouse.y = - ((event.clientY - rect.top) / sizes.height) * 2 + 1;
}

function onResize() {
  // Update sizes
  sizes.width = document.querySelector(".three-wrap").clientWidth;
  sizes.height = document.querySelector(".three-wrap").clientHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
}

function processSplineGLTF(gltf) {
  model = gltf.scene.children[0];
  model.scale.set(.005, .005, .005);
  scene.add(model);
  console.log(model);
  meshes = model.children[0].children.filter(object => object.type === "Mesh");
  meshes.forEach((mesh, index) => {
    // Create a new material for each region so they can be highlighted individually
    mesh.material = new THREE.MeshStandardMaterial();
    mesh.material.metalness = 0;
    mesh.material.roughness = 1;
    mesh.material.flatShading = true;
    mesh.region = index + 1;
    mesh.selected = false;
    mesh.animation = gsap.to(mesh.position, {duration: .2, z: 25});
    mesh.animation.pause();
  });
}