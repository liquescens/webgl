// @ts-check
import { BasicFramebuffer } from './js/webgl/projects/BasicFramebuffer.js';
import { ParticleSimulation } from './js/webgl/projects/ParticleSimulation.js';
import * as PROJECTS from './js/webgl/three/projects/index.js';

async function onWindowLoad()
{
    // await new PROJECTS.Points().run();
    await new ParticleSimulation().run();
}

window.addEventListener('load', onWindowLoad);