// @ts-check
import { ParticleSimulation } from './js/ParticleSimulation.js';
async function onWindowLoad()
{
    let canvas_placeholder = document.getElementById('webgl-placeholder');
    if (!canvas_placeholder) throw Error('Canvas placeholder not found.');
    let controls_placeholder = document.getElementById('controls-placeholder');
    if (!controls_placeholder) throw Error('Controls placeholder not found.');
    let project = new ParticleSimulation();
    canvas_placeholder.appendChild(project.canvas_element);
    controls_placeholder.appendChild(project.controls.element);
    await project.run();
}
window.addEventListener('load', onWindowLoad);