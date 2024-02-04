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

const WIDTH = 1024;
const HEIGHT = 768;
const renderer = new THREE.WebGLRenderer({ antialias: false });
const texture_loader = new THREE.TextureLoader();
renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(WIDTH, HEIGHT);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const hemisphere_light = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 2);
scene.add(hemisphere_light);

const light = new THREE.DirectionalLight(0x9999ff, 1.5 * 5);
light.castShadow = true;
light.shadow.camera.left = -100;
light.shadow.camera.bottom = -100;
light.shadow.camera.right = 100;
light.shadow.camera.top = 100;
// light.position.set(-75, 2, -50);
light.position.set(20, 30, -10);
light.shadow.radius = 0.01;
light.shadow.bias = 0;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
scene.add(light);

const light_helper = new THREE.DirectionalLightHelper(light);
scene.add(light_helper);

/*
const light = new THREE.PointLight(0xffffff, 1024, 0, 1.1);
light.position.set(-75, 150, -50);
light.shadow.bias = -0.0005;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.near = 0.01;
light.shadow.camera.far = 1000;
light.castShadow = true;
// light.shadowMapWidth = 1024; // default is 512
// light.shadowMapHeight = 1024; // default is 512
scene.add(light);
*/

const obj_loader = new OBJLoader();
const fbx_loader = new FBXLoader();
const gltf_loader = new GLTFLoader();

const height_map = new HeightMapGenerator();

/**
 * @param {THREE.BufferGeometry} geometry 
 * @param {THREE.Material} material 
 * @param {number} size 
 * @param {number} additional_size 
 */
function createInstancedMesh(geometry, material, size, additional_size)
{
    let instanced_mesh = new THREE.InstancedMesh(geometry, material, size * size + additional_size);
    let instance_position = new THREE.Object3D();
    let size_half = size / 2;
    let offset = size * size;
    
    for (let y = 0; y < size; y++)
    {
        for (let x = 0; x < size; x++)
        {
            let height = Math.floor(height_map.generateHeight(x, y));
            instance_position.position.set(x - size_half, height, y - size_half);
            instance_position.updateMatrix();
            instanced_mesh.setMatrixAt(x + y * size, instance_position.matrix);
        }
    }
    
    instance_position.position.set(0, -10, 0);
    instance_position.updateMatrix();
    
    for (let i = 0; i < additional_size; i++)
    {
        instanced_mesh.setMatrixAt(offset + i, instance_position.matrix);
    }
    
    instanced_mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instanced_mesh);
    // instanced_mesh.castShadow = true;
    // instanced_mesh.receiveShadow = true;
    return instanced_mesh;
}

function loadRocksMesh()
{
    const texture_albedo = texture_loader.load('assets/textures/rocks/albedo.png');
    const texture_displacement = texture_loader.load('assets/textures/rocks/displacement.png');
    const texture_roughness = texture_loader.load('assets/textures/rocks/roughness.png');
    const texture_normal = texture_loader.load('assets/textures/rocks/normal.png');
    const geometry = new THREE.PlaneGeometry(1, 1, 256, 256);
    geometry.rotateX(Math.PI * -0.5)
    const material = new THREE.MeshStandardMaterial({ 
        map: texture_albedo, 
        displacementMap: texture_displacement, 
        displacementScale: 0.1,
        roughnessMap: texture_roughness,
        normalMap: texture_normal, 
    });
    return { geometry, material };
}

/** @type {THREE.InstancedMesh[]} */
const instanced_meshes = [];
let user_instances_count = 0;

function loadGrassMesh()
{
    // obj_loader.load('assets/models/Grass_block.obj', model =>
    // {
    //     /** @type {THREE.Mesh} */
    //     let object = model.getObjectByName('Grass_block_extrusion'); // 'MSH_Grass_block');
    //     createInstancedMesh(object.geometry, object.material);
    // });

    // fbx_loader.load('assets/models/Grass_block.fbx', model =>
    // {
    //     /** @type {THREE.Mesh} */
    //     let object = model.getObjectByName('Grass_block_extrusion'); // 'MSH_Grass_block');
    //     createInstancedMesh(object.geometry, object.material);
    // });
				
    const material1 = new THREE.MeshPhongMaterial({ color: '#f8d9d6' });
    // csm.setupMaterial(material1);

    gltf_loader.load('assets/models/grass_block.gltf', model =>
    {
        let size = 100;
        /** @type {THREE.Mesh[]} */
        let meshes = model.scene.children[0].children[0].children;
        meshes[0].geometry.scale(1 / 16, 1 / 16, 1 / 16);
        // meshes.forEach(mesh => csm.setupMaterial(mesh.material));
        // meshes.forEach(mesh => mesh.material.wireframe = true);
        meshes.forEach(mesh => {
            mesh.material.map.minFilter = THREE.LinearFilter;
            mesh.material.map.needsUpdate = true;
            instanced_meshes.push(createInstancedMesh(mesh.geometry, mesh.material, size, 10000));
        });
        instanced_meshes[1].castShadow = true;
        instanced_meshes[2].receiveShadow = true;
        instanced_meshes[4].castShadow = true;
        instanced_meshes[5].castShadow = true;
        // instanced_meshes[3].castShadow = true; spód
        // instanced_meshes[5].castShadow = true;
        user_instances_count = size * size;
    });
}

/**
 * @param {number} x 
 * @param {number} y 
 */
function heightOnSceneXY(x, y)
{
    let map_x = Math.max(0, Math.min(256, Math.round(x) + 50));
    let map_y = Math.max(0, Math.min(256, Math.round(y) + 50));
    return height_map.generateHeight(map_x, map_y);
}

const camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);
const controls = new MapCameraControls(camera, renderer, (x, y) => heightOnSceneXY(x, y));
controls._camera_target.set(0, 0, 0);
controls._camera_distance = 10;

// const csm = new CSM(
// {
//     maxFar: 5000,
//     cascades: 4,
//     mode: 'practical',
//     parent: scene,
//     shadowMapSize: 2048,
//     lightDirection: light.position.clone().multiplyScalar(-1).normalize(),
//     camera: camera,
//     shadowBias: 0.0001
// });

// let { geometry, material } = loadRocksMesh();
loadGrassMesh();

const pointer_selector = new PointerSelector(renderer, (x, y) => Math.floor(height_map.generateHeight(x, y)));
scene.add(pointer_selector.box);

let instance_position = new THREE.Object3D();

function onClick()
{
    let x = pointer_selector._box_map_position.x;
    let y = pointer_selector._box_map_position.y;
    let height = pointer_selector._box_map_position.z;
    instance_position.position.set(x - 50, height, y - 50);
    instance_position.updateMatrix();
    instanced_meshes.forEach(mesh => 
    {
        mesh.setMatrixAt(user_instances_count, instance_position.matrix);
        mesh.instanceMatrix.needsUpdate = true;
    });
    user_instances_count++;
}

window.addEventListener('click', onClick);

const stats = new Stats();
document.body.appendChild(stats.dom);

// const gui = new GUI();
// const gui_light = gui.addFolder('Light');
// gui_light.add(light.position, 'x', -100, 100); 
// gui_light.add(light.position, 'y', -200, 200); 
// gui_light.add(light.position, 'z', -100, 100); //.onChange(() => { light.shadow.bias = gui_params.shadowBias; });
// gui.open();

let light_time = 0;

function animate()
{
	requestAnimationFrame(animate);
    if (instanced_meshes.length > 2) pointer_selector.update(camera, instanced_meshes[2]);
    // csm.update();
	renderer.render(scene, camera);
    stats.update();
    controls.update();
    // light_time += 0.001;
    // light.position.x = Math.sin(light_time) * 25;
    // light.position.z = Math.sin(light_time * 0.1) * 25;
    // light.position.y = Math.abs(Math.cos(light_time) * 25);
    // csm.lightDirection.copy(light.position).multiplyScalar(-1).normalize();
}

animate();