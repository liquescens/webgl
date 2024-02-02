// @ts-check
import * as THREE from 'three';
import { CameraControls } from './js/CameraControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { HeightMapGenerator } from './js/HeightMapGenerator.js';
import { PointerSelector } from './js/PointerSelector.js';

const WIDTH = 1024;
const HEIGHT = 768;
const renderer = new THREE.WebGLRenderer();
const texture_loader = new THREE.TextureLoader();
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.setSize(WIDTH, HEIGHT);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const hemisphere_light = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 1);
scene.add(hemisphere_light);

const light = new THREE.PointLight(0xffffff, 1024, 0, 1.5);
light.position.set(0, 20, 0);
light.castShadow = true;
scene.add(light);

const obj_loader = new OBJLoader();
const fbx_loader = new FBXLoader();
const gltf_loader = new GLTFLoader();

const height_map = new HeightMapGenerator();

/**
 * @param {THREE.BufferGeometry} geometry 
 * @param {THREE.MeshBasicMaterial} material 
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
    
    instanced_mesh.castShadow = true;
    instanced_mesh.receiveShadow = true;
    instanced_mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instanced_mesh);
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

    gltf_loader.load('assets/models/grass_block.gltf', model =>
    {
        let size = 100;
        /** @type {THREE.Mesh[]} */
        let meshes = model.scene.children[0].children[0].children;
        meshes[0].geometry.scale(1 / 16, 1 / 16, 1 / 16);
        meshes.forEach(mesh => instanced_meshes.push(createInstancedMesh(mesh.geometry, mesh.material, size, 10000)));
        user_instances_count = size * size;
    });
}

const camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);
const controls = new CameraControls(camera, renderer, () => 1);
controls._camera_target.set(0, 0, 0);
controls._camera_distance = 1;

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

function animate()
{
	requestAnimationFrame(animate);
    if (instanced_meshes.length > 2) pointer_selector.update(camera, instanced_meshes[2]);
	renderer.render(scene, camera);
    controls.update();
}

animate();