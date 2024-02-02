// @ts-check
// import * as THREE from './node_modules/three/build/three.module.js';
// import { ImprovedNoise } from './node_modules/three/examples/jsm/math/ImprovedNoise.js';
import * as THREE from 'three';
// import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
// import { MapControls } from './node_modules/three/examples/jsm/controls/MapControls.js';
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';
// import { Water } from './node_modules/three/examples/jsm/objects/Water2.js';
// import { Water } from './node_modules/three/examples/jsm/objects/Water.js';
import { HeightMapGenerator } from './js/HeightMapGenerator.js';
import { CameraControls } from './js/CameraControls.js';
import { ImprovedNoise } from './node_modules/three/examples/jsm/math/ImprovedNoise.js';
import { InstancedObject } from './js/InstancedObject.js';

const height_map_generator = new HeightMapGenerator();
const height_map = height_map_generator.generate(257, 257);

const gltf_loader = new GLTFLoader();

const width = 1024;
const height = 768;
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

const texture_loader = new THREE.TextureLoader();

function createGroundMesh()
{
    let texture = texture_loader.load('assets/textures/forest_ground_04_diff_1k.jpg');
    let texture_bump = texture_loader.load('assets/textures/forest_ground_04_disp_1k.png');
    let material = new THREE.MeshStandardMaterial({ map: texture, bumpMap: texture_bump, bumpScale: 10, color: 'white' });
    let geometry = new THREE.PlaneGeometry(256, 256, 256, 256);
    let vertices = geometry.attributes.position;
    let uvs = geometry.attributes.uv;
    
    for (let i = 0; i < vertices.count; i++)
    {
        let x = i % 257;
        let y = Math.floor(i / 257);
        vertices.setZ(i, height_map[x][y]);
    }
    
    for (let i = 0; i < uvs.count; i++)
    {
        uvs.setXY(i, i % 2, Math.floor(i / 257) % 2);
    }
    
    geometry.computeVertexNormals();
    let mesh = new THREE.Mesh(geometry, material);
    mesh.rotateX(Math.PI * -0.5);
    return mesh;
}

/**
 * @param {HeightMapGenerator} height_map_generator
 * @param {number} perlin_z
 * @param {number} noise_threshold
 */
function treeCondition(height_map_generator, perlin_z, noise_threshold)
{
    let noise = 0, height = 0, r = 0;
    return function(/** @type {number} */ x, /** @type {number} */ y)
    {
        noise = height_map_generator.perlin.noise(x * 0.05, y * 0.05, perlin_z);
        if (noise < noise_threshold) return;
        r = Math.random();
        if (r * r > noise) return;
        height = height_map_generator.generateHeight(x, y);
        if (height < -9) return;
        return height;
    }
}

/**
 * @param {HeightMapGenerator} height_map_generator
 * @param {number} perlin_z
 * @param {number} noise_threshold
 */
function grassCondition(height_map_generator, perlin_z, noise_threshold)
{
    let noise = 0, height = 0, r = 0;
    return function(/** @type {number} */ x, /** @type {number} */ y)
    {
        noise = height_map_generator.perlin.noise(x * 0.05, y * 0.05, perlin_z);
        if (noise < noise_threshold) return;
        height = height_map_generator.generateHeight(x, y);
        if (height < -9) return;
        return height;
    }
}

const ground = createGroundMesh();
const ground_grid = new THREE.LineSegments(ground.geometry);
ground_grid.rotateX(Math.PI * -0.5);
const hemisphere_light = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 1);
const light = new THREE.PointLight(0xffffff, 10240, 0, 1.5);
light.position.set(-128, 150, 128);

const scene = new THREE.Scene();
scene.add(ground);
scene.add(ground_grid);
scene.add(hemisphere_light);
scene.add(light);

gltf_loader.load('assets/models/shapespark-low-poly-plants-kit-double-sided-for-baking.gltf', (/** @type {{ scene: THREE.Group }} */ model) => { 
    // model.scene.position.set(-100, 0, 100);
    // tree.position.set(-100, 0, 100);
    // scene.add(tree);
    // ['Tree-01-1', 'Tree-01-2', 'Tree-01-3', 'Tree-01-4', 'Tree-02-1', 'Tree-02-2', 'Tree-02-3', 'Tree-02-4', 'Tree-03-1', 'Tree-03-2', 'Tree-03-3', 'Tree-03-4', 'Hedge-01', 'Bush-01', 'Bush-02', 'Bush-03', 'Bush-04', 'Bush-05', 'Clover-01', 'Clover-02', 'Clover-03', 'Clover-04', 'Clover-05', 'Grass-01', 'Grass-02', 'Grass-03', 'Flowers-02', 'Flowers-04', 'Flowers-01', 'Flowers-03']
    // let tree = model.scene.getObjectByName('Tree-01-1');

    let instanced_objects = [
        new InstancedObject(model.scene, 'Tree-01-1', 5000, treeCondition(height_map_generator, -10, 0)),
        new InstancedObject(model.scene, 'Tree-02-1', 5000, treeCondition(height_map_generator, -10, 0)),
        new InstancedObject(model.scene, 'Grass-01', 15000, grassCondition(height_map_generator, -10, -1)),
        new InstancedObject(model.scene, 'Grass-02', 15000, grassCondition(height_map_generator, -10, -1)),
        new InstancedObject(model.scene, 'Grass-03', 15000, grassCondition(height_map_generator, -10, -1)),
        new InstancedObject(model.scene, 'Bush-01', 1000, grassCondition(height_map_generator, -10, -1)),
        new InstancedObject(model.scene, 'Bush-02', 1500, grassCondition(height_map_generator, -10, -1)),
        new InstancedObject(model.scene, 'Bush-03', 2000, grassCondition(height_map_generator, -10, -1)),
        new InstancedObject(model.scene, 'Bush-04', 2500, grassCondition(height_map_generator, -10, -1)),
        new InstancedObject(model.scene, 'Bush-05', 3000, grassCondition(height_map_generator, -10, -1))
    ];
    instanced_objects.forEach(object => object.meshes.forEach(mesh => scene.add(mesh)));

}, undefined, error => console.error(error));

// camera.up.set(0, 0, 1);
// camera.up.set(0, 0, 1);

// const controls = new OrbitControls(camera, renderer.domElement);
// controls.target.set(-128, 0, 128);
// controls.enableDamping = true;
// controls.enablePan = true;
// controls.panSpeed = 10;
// controls.screenSpacePanning = true;
// controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
// controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
// controls.update();

// const controls = new MapControls(camera, renderer.domElement);
// controls.enableDamping = true; 

/*
const water_geometry = new THREE.PlaneGeometry(256, 256);
// water_geometry.rotateX(Math.PI * -0.5);
const water = new Water(water_geometry, { color: '#0e87cc', scale: 4, flowDirection: new THREE.Vector2(0, 0), textureWidth: 1024, textureHeight: 1024 } );
water.position.y = -10;
water.rotation.x = Math.PI * -0.5;

scene.add(water);
*/

/*
// const water_geometry = new THREE.PlaneGeometry(256, 256);
// const water_texture = texture_loader.load('textures/waternormals.jpg', texture => texture.wrapS = texture.wrapT = THREE.RepeatWrapping);
// const water = new Water(water_geometry, { textureWidth: 512, textureHeight: 512, waterNormals: water_texture, sunDirection: new THREE.Vector3(), sunColor: 0xffffff, waterColor: '#0e87cc', distortionScale: 3.7, fog: scene.fog !== undefined });
// water.position.y = -10;
// water.rotation.x = Math.PI * -0.5;
// scene.add(water);
*/

const water_geometry = new THREE.PlaneGeometry(256, 256);
const water_material = new THREE.MeshStandardMaterial({ color: '#0e87cc', transparent: true, opacity: 0.5 });
const water = new THREE.Mesh(water_geometry, water_material);
water.position.y = -10;
water.rotation.x = Math.PI * -0.5;
scene.add(water);

const controls = new CameraControls(camera, renderer, height_map);

class Coordinates
{
    /**
     * @param {number} field_x 
     * @param {number} field_y 
     * @param {THREE.Vector3} result 
     * @returns 
     */
    fieldToScene(field_x, field_y, result)
    {
        result.set(field_x - 128, height_map[field_x][field_y], field_y - 128);
    }
}

const coordinates = new Coordinates();


const pointer_selector = new PointerSelector();
pointer_selector._box_map_position.set(0, 256);
pointer_selector._updateBoxPosition();
scene.add(pointer_selector.box);

// const selection_geometry = new THREE.BufferGeometry().setFromPoints([ new THREE.Vector3(-128, 3, 128), new THREE.Vector3(-120, 3, 128), new THREE.Vector3(-120, 3, 120) ]);
// const selection_material = new THREE.MeshBasicMaterial({ color: '#ff0000', transparent: false, opacity: 0.5, side: THREE.DoubleSide });
// const selection = new THREE.Mesh(selection_geometry, selection_material);
// selection.rotateX(Math.PI * -0.5);
// scene.add(selection);

// /**
//  * @param {THREE.BufferGeometry} geometry 
//  * @param {number} geometry_index 
//  * @param {THREE.Intersection} intersection 
//  * @param {'a' | 'b' | 'c'} face_component 
//  */
// function setPosition(geometry, geometry_index, intersection, face_component)
// {
//     if (intersection.face)
//     {
//         let index = intersection.face[face_component];
//         let intersection_position = intersection.object.geometry.getAttribute('position');
//         let x = intersection_position.getX(index);
//         let y = intersection_position.getY(index);
//         let z = intersection_position.getZ(index);
//         let position = geometry.getAttribute('position');
//         position.setXYZ(geometry_index, x, y + 0.0001, z);
//         // position.setX(geometry_index, x);
//         // position.setZ(geometry_index, 0 - y);
//         // position.setY(geometry_index, z);
//         position.needsUpdate = true;
//     }
// }

// /**
//  * @param {THREE.Intersection} intersection 
//  */
// function highlightFace(intersection)
// {
//     if (intersection.face)
//     {
//         /** @type {THREE.PlaneGeometry} */
//         // @ts-ignore
//         let geometry = intersection.object.geometry;

//         // let color = geometry.getAttribute('color');
//         // color.setXYZ(intersection.face.a, 256, 0, 0);
//         // color.setXYZ(intersection.face.b, 256, 0, 0);
//         // color.setXYZ(intersection.face.c, 256, 0, 0);
//         // color.needsUpdate = true;

//         document.title = `${intersection.point.x}`;

//         setPosition(selection.geometry, 0, intersection, 'a');
//         setPosition(selection.geometry, 1, intersection, 'b');
//         setPosition(selection.geometry, 2, intersection, 'c');
//     }
// }

function animate()
{
	requestAnimationFrame(animate);
	// cube.rotation.x += 0.01;
	// cube.rotation.y += 0.01;
    // water.material.uniforms['time'].value += 1.0 / 60.0;

    pointer_selector.update();
	renderer.render(scene, camera);
    controls.update();
}

animate();