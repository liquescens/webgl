// @ts-check
// import * as THREE from './node_modules/three/build/three.module.js';
// import { ImprovedNoise } from './node_modules/three/examples/jsm/math/ImprovedNoise.js';
import * as THREE from 'three';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import { MapControls } from './node_modules/three/examples/jsm/controls/MapControls.js';
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';
// import { Water } from './node_modules/three/examples/jsm/objects/Water2.js';
import { Water } from './node_modules/three/examples/jsm/objects/Water.js';
import { HeightMapGenerator } from './js/HeightMapGenerator.js';
import { ImprovedNoise } from './node_modules/three/examples/jsm/math/ImprovedNoise.js';

const height_map_generator = new HeightMapGenerator();
const heights = height_map_generator.generate(257, 257);

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
    let texture = texture_loader.load('textures/forest_ground_04_diff_1k.jpg');
    let texture_bump = texture_loader.load('textures/forest_ground_04_disp_1k.png');
    let material = new THREE.MeshStandardMaterial({ map: texture, bumpMap: texture_bump, bumpScale: 10 });
    let geometry = new THREE.PlaneGeometry(256, 256, 256, 256);
    let vertices = geometry.attributes.position;
    let uvs = geometry.attributes.uv;
    
    for (let i = 0; i < vertices.count; i++)
    {
        let x = i % 257;
        let y = Math.floor(i / 257);
        vertices.setZ(i, heights[x][y]);
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

const ground = createGroundMesh();
const hemisphere_light = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 1);
const light = new THREE.PointLight(0xffffff, 10240, 0, 1.5);
light.position.set(-128, 150, 128);

const scene = new THREE.Scene();
scene.add(ground);
scene.add(hemisphere_light);
scene.add(light);

class InstancedObject
{
    /**
     * @param {THREE.Group} group
     * @param {string} name
     * @param {number} count 
     * @param {(x: number, y: number) => number | undefined} condition 
     */
    constructor(group, name, count, condition)
    {
        this.object = group.getObjectByName(name);
        if (!this.object) throw "";
        this.meshes = this.object.children.map(base_mesh => this._createInstancedMesh(base_mesh, count));
        let map_x = 0, map_y = 0, noise = 0, r = 0, map_height;
        let instance_position = new THREE.Object3D();

        for (let i = 0; i < count; i++)
        {
            while (true)
            {
                map_x = Math.random() * 256;
                map_y = Math.random() * 256;
                map_height = condition(map_x, map_y);
                if (map_height !== undefined) break;
                // noise = this.height_map_generator.perlin.noise(map_x * 0.05, map_y * 0.05, -10);
                // if (noise < 0) continue;
                // map_height = heights[Math.round(map_x)][Math.round(map_y)];
                // if (map_height < -9) continue;
                // // noise = heights[Math.round(map_x)][Math.round(map_y)] + 0.5;
                // r = Math.random();
                // if (r * r > noise) continue;
                // break;
            }

            instance_position.position.set(map_x - 128, map_height, map_y - 128);
            instance_position.updateMatrix();
            instance_position.rotateY(Math.PI * 2 * Math.random());
            this.meshes.forEach(mesh => mesh.setMatrixAt(i, instance_position.matrix));
        }

        this.meshes.forEach(mesh => mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage));
    }

    /**
     * @param {THREE.Mesh} base_mesh
     * @param {number} count
     * @returns {THREE.InstancedMesh}
     */
    _createInstancedMesh(base_mesh, count)
    {
        base_mesh.geometry.scale(0.2, 0.2, 0.2);
        return new THREE.InstancedMesh(base_mesh.geometry, base_mesh.material, count);
    }
}

/**
 * @param {ImprovedNoise} perlin
 * @param {number} perlin_z
 * @param {number[][]} height_map
 * @param {number} noise_threshold
 */
function treeCondition(perlin, perlin_z, height_map, noise_threshold)
{
    let noise = 0, height = 0, r = 0;
    return function(/** @type {number} */ x, /** @type {number} */ y)
    {
        noise = perlin.noise(x * 0.05, y * 0.05, perlin_z);
        if (noise < noise_threshold) return;
        r = Math.random();
        if (r * r > noise) return;
        height = height_map[Math.round(x)][Math.round(y)];
        if (height < -9) return;
        return height;
    }
}

/**
 * @param {ImprovedNoise} perlin
 * @param {number} perlin_z
 * @param {number[][]} height_map
 * @param {number} noise_threshold
 */
function grassCondition(perlin, perlin_z, height_map, noise_threshold)
{
    let noise = 0, height = 0, r = 0;
    return function(/** @type {number} */ x, /** @type {number} */ y)
    {
        noise = perlin.noise(x * 0.05, y * 0.05, perlin_z);
        if (noise < noise_threshold) return;
        height = height_map[Math.round(x)][Math.round(y)];
        if (height < -9) return;
        return height;
    }
}

gltf_loader.load('assets/models/shapespark-low-poly-plants-kit-double-sided-for-baking.gltf', (/** @type {{ scene: THREE.Group }} */ model) => { 
    // model.scene.position.set(-100, 0, 100);
    // tree.position.set(-100, 0, 100);
    // scene.add(tree);
    // ['Tree-01-1', 'Tree-01-2', 'Tree-01-3', 'Tree-01-4', 'Tree-02-1', 'Tree-02-2', 'Tree-02-3', 'Tree-02-4', 'Tree-03-1', 'Tree-03-2', 'Tree-03-3', 'Tree-03-4', 'Hedge-01', 'Bush-01', 'Bush-02', 'Bush-03', 'Bush-04', 'Bush-05', 'Clover-01', 'Clover-02', 'Clover-03', 'Clover-04', 'Clover-05', 'Grass-01', 'Grass-02', 'Grass-03', 'Flowers-02', 'Flowers-04', 'Flowers-01', 'Flowers-03']
    // let tree = model.scene.getObjectByName('Tree-01-1');

    let instanced_objects = [
        new InstancedObject(model.scene, 'Tree-01-1', 5000, treeCondition(height_map_generator.perlin, -10, heights, 0)),
        new InstancedObject(model.scene, 'Tree-02-1', 5000, treeCondition(height_map_generator.perlin, -10, heights, 0)),
        new InstancedObject(model.scene, 'Grass-01', 50000, grassCondition(height_map_generator.perlin, -10, heights, -1)),
        new InstancedObject(model.scene, 'Grass-02', 50000, grassCondition(height_map_generator.perlin, -10, heights, -1)),
        new InstancedObject(model.scene, 'Grass-03', 50000, grassCondition(height_map_generator.perlin, -10, heights, -1)),
        new InstancedObject(model.scene, 'Bush-01', 10000, grassCondition(height_map_generator.perlin, -10, heights, -1)),
        new InstancedObject(model.scene, 'Bush-02', 15000, grassCondition(height_map_generator.perlin, -10, heights, -1)),
        new InstancedObject(model.scene, 'Bush-03', 20000, grassCondition(height_map_generator.perlin, -10, heights, -1)),
        new InstancedObject(model.scene, 'Bush-04', 25000, grassCondition(height_map_generator.perlin, -10, heights, -1)),
        new InstancedObject(model.scene, 'Bush-05', 30000, grassCondition(height_map_generator.perlin, -10, heights, -1))
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

class CameraControls
{
    /**
     * @param {THREE.PerspectiveCamera} camera 
     */
    constructor(camera)
    {
        this._camera = camera;
        this._camera_target = new THREE.Vector3();
        this._camera_target.set(-100, 0, 100);
        this._camera_direction_spherical = new THREE.Spherical();
        this._camera_direction_spherical.phi = 0.94;
        this._camera_direction_spherical.theta = -0.66;
        this._camera_direction = new THREE.Vector3();
        this._camera_position = new THREE.Vector3();
        this._camera_movement = new THREE.Spherical();
        this._camera_movement.phi = Math.PI / 2;
        this._camera_movement.theta = this._camera_direction_spherical.theta;
        this._camera_distance = 40;
        this.update();
        this._left = false;
        this._right = false;
        renderer.domElement.addEventListener('mousedown', this._onMouseDown.bind(this));
        renderer.domElement.addEventListener('mouseup', this._onMouseUp.bind(this));
        renderer.domElement.addEventListener('mousemove', this._onMouseMove.bind(this));
        renderer.domElement.addEventListener('wheel', this._onMouseWheel.bind(this));
        renderer.domElement.addEventListener('contextmenu', event => event.preventDefault());
    }

    update()
    {
        let x = Math.max(0, Math.min(256, Math.round(this._camera_position.x) + 128));
        let y = Math.max(0, Math.min(256, Math.round(this._camera_position.z) + 128));
        this._camera_target.y = heights[x][y];
        this._camera_direction.setFromSpherical(this._camera_direction_spherical);
        this._camera_position.copy(this._camera_target);
        this._camera_position.addScaledVector(this._camera_direction, this._camera_distance);
        camera.position.copy(this._camera_position);
        camera.lookAt(this._camera_target.x, this._camera_target.y, this._camera_target.z);
    }

    /**
     * 
     * @param {WheelEvent} event 
     */
    _onMouseWheel(event)
    {
        console.log(event.deltaY);
        if (event.deltaY > 0) this._camera_distance *= event.deltaY / 90;
        if (event.deltaY < 0) this._camera_distance /= event.deltaY / -90;
    }

    /**
     * @param {MouseEvent} event
     */
    _onMouseDown(event)
    {
        console.log(event.button)
        switch (event.button)
        {
            case 0: this._left = true; break;
            case 2: this._right = true; break;
        }
    }

    /**
     * @param {MouseEvent} event
     */
    _onMouseUp(event)
    {
        switch (event.button)
        {
            case 0: this._left = false; break;
            case 2: this._right = false; break;
        }
    }

    /**
     * @param {MouseEvent} event
     */
    _onMouseMove(event)
    {
        if (this._left)
        {
            this._camera_direction.setFromSpherical(this._camera_movement);
            this._camera_target.addScaledVector(this._camera_direction, -event.movementY * (this._camera_distance / 100));
            this._camera_movement.theta += Math.PI / 2;
            this._camera_direction.setFromSpherical(this._camera_movement);
            this._camera_target.addScaledVector(this._camera_direction, -event.movementX * (this._camera_distance / 100));
            this._camera_movement.theta -= Math.PI / 2;
        }
        if (this._right)
        {
            this._camera_direction_spherical.theta -= event.movementX * 0.01;
            this._camera_direction_spherical.phi += event.movementY * -0.01;
            this._camera_movement.theta = this._camera_direction_spherical.theta;
        }
    }
}

const X = new THREE.Vector3(1, 0, 0);
const Y = new THREE.Vector3(0, 1, 0);

const controls = new CameraControls(camera);

function animate()
{
	requestAnimationFrame( animate );
	// cube.rotation.x += 0.01;
	// cube.rotation.y += 0.01;
    // water.material.uniforms['time'].value += 1.0 / 60.0;
	renderer.render(scene, camera);
    controls.update();
}

animate();