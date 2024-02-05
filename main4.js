// @ts-check
import * as THREE from 'three';
import { MapCamera } from './js/MapCamera.js';
import { HeightMapGenerator } from './js/HeightMapGenerator.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { BoxWorldLoader } from './js/BoxWorldLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

class BlocksTextureHelper
{
    static STONE = { x: 1, y: 0 }

    /**
     * @param {THREE.BoxGeometry} geometry 
     * @param {{ x: number, y: number }} top 
     */
    static setupBoxGeometry(geometry, top)
    {
        let attribute = geometry.getAttribute('uv');

        attribute.setXY(8, (384 + top.x * 16) / 1024, (1024 - 72 - top.y * 16) / 1024);
        attribute.setXY(9, (384 + 16 + top.x * 16) / 1024, (1024 - 72 - top.y * 16) / 1024);
        attribute.setXY(10, (384 + top.x * 16) / 1024, (1024 - 72 - 16 - top.y * 16) / 1024);
        attribute.setXY(11, (384 + 16 + top.x * 16) / 1024, (1024 - 72 - 16 - top.y * 16) / 1024);

        // geometry.getAttribute('uv').setXY(8, 400 / 1024, (1024 - 72) / 1024);
        // geometry.getAttribute('uv').setXY(9, 415 / 1024, (1024 - 72) / 1024);
        // geometry.getAttribute('uv').setXY(10, 400 / 1024, (1024 - 88) / 1024);
        // geometry.getAttribute('uv').setXY(11, 415 / 1024, (1024 - 88) / 1024);

    }
}

// gltf_loader.load('assets/models/grass_block.gltf', model =>

async function onWindowLoad()
{
    const world_loader = new BoxWorldLoader();
    const renderer = world_loader.renderer;
    world_loader.loadSunLight();
    world_loader.loadAmbientLight();
    const ground = await world_loader.loadGround2Meshes();
    world_loader.loadGround(ground);
    const grass = await world_loader.loadGrassInstances();
    world_loader.loadGrass(grass);
    await world_loader.loadLowPolyHouse();
    const camera = new MapCamera(renderer, 1024 / 768, (x, y) => world_loader._getHeight(x, y));
    camera.controls._camera_target.set(20, 0, 20);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(world_loader.scene, camera.camera));
    const smaa_pass = new SMAAPass(1024 * renderer.getPixelRatio(), 768 * renderer.getPixelRatio());
    composer.addPass(smaa_pass);
    const outputPass = new OutputPass();
    composer.addPass(outputPass);
    
    document.body.appendChild(renderer.domElement);
    const stats = new Stats();
    document.body.appendChild(stats.dom);

    function onRegenerateButtonClick()
    {
        world_loader.height_map_generator.seed = Math.random() * 1000;
        world_loader.height_map = world_loader._createHeightMap();
        world_loader._initializeGroundInstancedMeshesMatrices(ground);
        grass.forEach(instances => instances.initializer(instances.mesh));
    }

    document.body.appendChild(document.createElement('br'));
    let renegerate_button = document.body.appendChild(document.createElement('button'));
    renegerate_button.innerText = 'Regenerate';
    renegerate_button.addEventListener('click', onRegenerateButtonClick);
    
    /**
     * @param {DOMHighResTimeStamp} time 
     */
    function animate(time)
    {
        requestAnimationFrame(animate);
        composer.render();
        stats.update();
        camera.controls.update();
    }
    
    requestAnimationFrame(animate);
}

window.addEventListener('load', onWindowLoad);