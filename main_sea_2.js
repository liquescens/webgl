// @ts-check
import * as THREE from 'three';
import { HeightMapGenerator } from "./js/HeightMapGenerator.js";
import { MapCamera } from './js/MapCamera.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { GltfModelLoader } from './js/PalmTreesLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

class SceneLoader
{
    constructor()
    {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(1024, 768);
        this.scene = new THREE.Scene();
    }

    _loadAmbientLight()
    {
        let ambient_light = new THREE.AmbientLight(0x404040, 4);
        this.scene.add(ambient_light);
    }
}

class SeaSceneLoader extends SceneLoader
{
    constructor()
    {
        super();
        this.height_map_generator = new HeightMapGenerator();
        this.size = 100;
        this.model_loader = new GltfModelLoader();
    }
    
    async _loadPalms()
    {
        let palm = await this.model_loader.loadPalmAsInstancedMesh(10000);
        let palm_meshes = [palm.bark, ...palm.leaf];
        this.height_map_generator.initializeInstancedMeshMatrices(palm_meshes, -1000, -0.2, -2.5, this.size);
        palm_meshes.forEach(mesh => this.scene.add(mesh));
    }

    async _loadGround()
    {
        let size = this.size;
        let mesh_density = 10;
        let geometry = new THREE.PlaneGeometry(size, size, size * mesh_density, size * mesh_density);
        let position = geometry.getAttribute('position');
        let i = 0;
        let height_max = 0;
        
        for (let my = 0; my <= size * mesh_density; my++)
        {
            for (let mx = 0; mx <= size * mesh_density; mx++)
            {
                let hx = mx / mesh_density;
                let hy = my / mesh_density;
                let h = this.height_map_generator.generateHeight(hx, hy);
                height_max = Math.max(h, height_max);
                position.setXYZ(i++, hx, h, hy);
            }
        }
        
        geometry.computeVertexNormals();
        let vertex_shader = await (await fetch('shaders/ground.vert')).text();
        let fragment_shader = await (await fetch('shaders/ground.frag')).text();
        let shaders = { fragmentShader: fragment_shader, vertexShader: vertex_shader };
        let uniforms = { 
            lightPos: { value: new THREE.Vector3(20, 150, 10) },
            heights: { value: new THREE.Vector3(height_max, 0, 0) },
            noiseScale: { value: 1.7 },
            Camera: { value: new THREE.Vector3(0, 0, 0) },
        };
        let material = new THREE.ShaderMaterial({ ...shaders, uniforms, side: THREE.DoubleSide });
        let mesh = new THREE.Mesh(geometry, material);

        this.scene.add(mesh);
        return { mesh };
    }

    async _loadSea()
    {
        let size = this.size;
        let mesh_density = 1;
        let geometry = new THREE.PlaneGeometry(size, size, size * mesh_density, size * mesh_density);
        let position = geometry.getAttribute('position');
        let i = 0;
        
        for (let my = 0; my <= size * mesh_density; my++)
        {
            for (let mx = 0; mx <= size * mesh_density; mx++)
            {
                position.setXYZ(i++, mx, -3, my);
            }
        }
        
        let uniforms = 
        { 
            Time: { value: 1 },
            Resolution: { value: new THREE.Vector2(size, size) },
            Eye: { value: new THREE.Vector3(-1, -1, -1).normalize() },
            Light: { value: new THREE.Vector3(0, -1, -0.5).normalize() },
            // SeaSpeed: { value: 0.8 },
            // SeaHeight: { value: 1.6 },
            // SeaFrequency: { value: 0.16 },
            SeaSpeed: { value: 0.1 },
            SeaHeight: { value: 0.1 },
            SeaFrequency: { value: 2 },
        };
    
        let shader_commons = await (await fetch('shaders/sea-commons.vert')).text();
        let vertex_shader = await (await fetch('shaders/sea.vert')).text();
        vertex_shader = vertex_shader.replace('#include "sea-commons.vert"', shader_commons);
        let fragment_shader = await (await fetch('shaders/sea.frag')).text();
        fragment_shader = fragment_shader.replace('#include "sea-commons.vert"', shader_commons);
        let shaders = { fragmentShader: fragment_shader, vertexShader: vertex_shader };
        let material = new THREE.ShaderMaterial({ ...shaders, side: THREE.DoubleSide, uniforms, wireframe: false, transparent: true, opacity: 0.8 });
        let mesh = new THREE.Mesh(geometry, material);

        this.scene.add(mesh);
        return { mesh };
    }

    async load()
    {
        this._loadAmbientLight();
        let palms = await this._loadPalms();
        let ground = await this._loadGround();
        let sea = await this._loadSea();

        let gui = new GUI();
        // let terrainFolder = gui.addFolder('Terrain');
        // // terrainFolder.add(material.uniforms.seaHeight, 'value', -height_range, height_range).name('Sea height');
        // terrainFolder.add(material.uniforms.noiseScale, 'value', 0.0001, 100).name('Noise scale');
        // terrainFolder.add(material.uniforms.proceduralTexture1Resolution, 'value', 0.001, 10).name('Texture 1 resolution');
        let seaFolder = gui.addFolder('Sea');
        seaFolder.add(sea.mesh.material, 'wireframe').name('Wireframe');
        seaFolder.add(sea.mesh.material.uniforms.SeaSpeed, 'value', 0.01, 10).name('Speed');
        seaFolder.add(sea.mesh.material.uniforms.SeaHeight, 'value', 0.01, 10).name('Height');
        seaFolder.add(sea.mesh.material.uniforms.SeaFrequency, 'value', 0.01, 10).name('Frequency');
        
        let renderer = this.renderer;
        let scene = this.scene;
        let camera = new MapCamera(renderer, 1024 / 768, (x, y) => Math.max(-2.5, this.height_map_generator.generateHeight(x, y)));
        let stats = new Stats();
        
        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera.camera));
        const smaa_pass = new SMAAPass(1024 * renderer.getPixelRatio(), 768 * renderer.getPixelRatio());
        composer.addPass(smaa_pass);
        const outputPass = new OutputPass();
        composer.addPass(outputPass);

        return {
            renderer,
            stats,
            render: () =>
            {
                sea.mesh.material.uniforms.Time.value += 0.01;
                // renderer.render(scene, camera.camera);
                composer.render();
                camera.controls.update();
                stats.update()
            }
        };
    }
}

async function onWindowLoad()
{
    let scene = await new SeaSceneLoader().load();
    document.body.appendChild(scene.renderer.domElement);
    document.body.appendChild(scene.stats.dom);

    /**
     * @param {DOMHighResTimeStamp} time 
     */
    function animate(time)
    {
        requestAnimationFrame(animate);
        scene.render();

        // renderer.render(scene, camera.camera);
        // camera.controls.update();
        // // ground.material.uniforms.time.value += 0.01;
        // // sea.mesh.material.uniforms.Time.value += 0.01;
        // ground.mesh.material.uniforms.Camera.value = camera.camera.position;
        
        // camera.controls._camera_direction.setFromSpherical(camera.controls._camera_direction_spherical);
        // mesh.material.uniforms.Eye.value = camera.controls._camera_direction.normalize();
        // sea.material.uniforms.iEyePosition.value = world_camera.camera.position;
        // sea.material.uniforms.iEyeDirection.value.x = world_camera.controls._camera_direction_spherical.theta;
        // sea.material.uniforms.iEyeDirection.value.y = world_camera.controls._camera_direction_spherical.phi;
    }
    
    requestAnimationFrame(animate);
}

window.addEventListener('load', onWindowLoad);