// @ts-check
import * as SCENCES from './js/webgl/three/scenes/index.js';

async function onWindowLoad()
{
    let scene = new SCENCES.BasicTerrainScene();
    await scene.load();
    document.body.appendChild(scene.renderer.domElement);
    scene.animate();
}

window.addEventListener('load', onWindowLoad);