// @ts-check
import * as THREE from 'three';
import { MapCameraControls } from './js/MapCameraControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { HeightMapGenerator } from './js/HeightMapGenerator.js';
import { PointerSelector } from './js/PointerSelector.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { CSM } from 'three/examples/jsm/csm/CSM.js';
import { CSMHelper } from 'three/examples/jsm/csm/CSMHelper.js';
import { MapCamera } from './js/MapCamera.js';
import { GIMesh } from './js/GIMesh.js';

const WIDTH = 1024;
const HEIGHT = 768;

/**
 * @param {THREE.Scene} scene 
 */
function createGround(scene)
{
    let geometry = new THREE.PlaneGeometry(10, 10, 10, 10).rotateX(Math.PI / -2);
    let material = new THREE.MeshPhongMaterial({ color: 'white' });
    let ground = new THREE.Mesh(geometry, material);
    ground.receiveShadow = true;
    scene.add(ground);
    return ground;
}

/**
 * @param {THREE.Scene} scene 
 */
function createBox(scene)
{
    let geometry = new THREE.BoxGeometry().rotateX(Math.PI / -2);
    let material = new THREE.MeshPhongMaterial({ color: 'red' });
    let box = new THREE.Mesh(geometry, material);
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add(box);
    return box;
}

/**
 * @param {THREE.Scene} scene 
 */
function createLight(scene)
{
    let light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.castShadow = true;
    light.position.set(3, 2, 4);
    light.shadow.radius = 0.1;
    light.shadow.bias = 0;
    scene.add(light);
    return light;
}

const renderer = new THREE.WebGLRenderer({ antialias: true });
// const texture_loader = new THREE.TextureLoader();
renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(WIDTH, HEIGHT);
const scene = new THREE.Scene();
createGround(scene);
const hemisphere_light = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 1);
scene.add(hemisphere_light);
const light = createLight(scene);
createBox(scene).position.set(0, 0.49, 0);
createBox(scene).position.set(2, 0.49, 2);
createBox(scene).position.set(-2, 0.49, 1);
const camera = new MapCamera(renderer, WIDTH / HEIGHT, () => 1);
document.body.appendChild(renderer.domElement);

/**
 * @param {DOMHighResTimeStamp} time 
 */
function animate(time)
{
	requestAnimationFrame(animate);
    // if (instanced_meshes.length > 2) pointer_selector.update(camera, instanced_meshes[2]);
    // csm.update();
	renderer.render(scene, camera.camera);
    // stats.update();
    camera.controls.update();
    // light_time += 0.001;
    // light.position.x = Math.sin(light_time) * 25;
    // light.position.z = Math.sin(light_time * 0.1) * 25;
    // light.position.y = Math.abs(Math.cos(light_time) * 25);
    // csm.lightDirection.copy(light.position).multiplyScalar(-1).normalize();
    light.position.set(3 + Math.sin(time * 0.001), 2, 4);
}

requestAnimationFrame(animate);