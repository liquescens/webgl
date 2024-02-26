// @ts-check
import * as PROJECTS from './js/webgl/three/projects/index.js';

async function onWindowLoad()
{
    await new PROJECTS.SeaWave().run();
}

window.addEventListener('load', onWindowLoad);