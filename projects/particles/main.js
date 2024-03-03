// @ts-check
import { PheromoneParticleSimulation } from './js/PheromoneParticleSimulation.js';
const Parameter_Sets =
[
    '?pc=100000&s=mr&pm=argb&pdf=0.95&ei=0.25&mm=simple5&ss=27.6&dca=71.8&vd=26.1&sp=1&cb=a&bt=3',
    '?pc=100000&s=mr&pm=s&pdf=0.97&ei=0.01&mm=simple5&ss=29.2&dca=23.2&vd=12.9&sp=1&cb=a&bt=3',
    '?pc=100000&pdf=0.97&ss=2.7&dca=12&vd=4.1&pm=argb&cb=a&ei=0.05&sp=1',
    '?pc=100000&pdf=0.97&ss=17.3&dca=15.6&vd=29.7&pm=s&cb=a&ei=0.05&sp=1',
    '?pc=100000&pdf=0.97&ss=27.6&dca=69.8&vd=6.5&pm=s&cb=a&ei=0.05&sp=1',
    '?pc=100000&pdf=0.97&ss=17&dca=78.3&vd=22&pm=argb&cb=a&ei=0.05&sp=1',
    '?pc=100000&s=mr&pm=s&pdf=0.9&ei=0.15&mm=simple5&ss=18.9&dca=21.8&vd=18.3&sp=1&cb=a&bt=3',
    '?pc=100000&s=mr&pm=s&pdf=0.98&ei=0.05&mm=simple5&ss=5.1&dca=25.7&vd=11.3&sp=1&cb=a&bt=3',
    '?pc=100000&pm=s&pdf=0.999&ei=0.05&ss=1.7&dca=11.1&vd=4.1&sp=1&cb=a',
    '?pc=100000&pm=argb&pdf=0.999&ei=0.05&ss=1.7&dca=2&vd=4.1&sp=1&cb=a',
    '?pc=100000&pm=argb&pdf=0.999&ei=0.05&ss=26.2&dca=85.8&vd=2.3&sp=1&cb=a',
    '?pc=100000&s=mr&pm=argb&pdf=0.999&ei=0.05&mm=simple5&ss=29.7&dca=30.9&vd=16.5&sp=1&cb=a&bt=3',
    '?pc=100000&s=mr&pm=argb&pdf=0.999&ei=0.05&mm=simple5&ss=10.6&dca=75.4&vd=20.8&sp=1&cb=a&bt=3',
    '?pc=1000&s=mr&pm=s&pdf=0.999&ei=0.5&mm=simple5&ss=11.4&dca=41.1&vd=28.3&sp=1&cb=a&bt=3',
    '?pc=100000&pm=s&pdf=0.99&ei=0.05&ss=30&dca=60&vd=3&sp=1&cb=a',
    '?pc=100000&pm=s&pdf=0.992&ei=0.01&ss=0.4&dca=9&vd=3&sp=1&cb=a',
    '?pc=100000&s=mr&pm=argb&pdf=0.99&ei=0.05&mm=simple5&ss=30.8&dca=86.9&vd=7.3&sp=1&cb=a&bt=off',
    '?pc=100000&s=mr&pm=s&pdf=0.99&ei=0.05&mm=simple5&ss=25.2&dca=52.9&vd=27.5&sp=1&cb=a&bt=3',
    '?pc=100000&s=mr&pm=s&pdf=0.97&ei=0.05&mm=simple5&ss=20.2&dca=23.5&vd=27.1&sp=1&cb=a&bt=3',
    '?pc=100000&s=mr&pm=s&pdf=0.99&ei=0.05&mm=simple5&ss=11.5&dca=83.3&vd=8.3&sp=1&cb=a&bt=3',
    '?pc=100000&s=mr&pm=argb&pdf=0.99&ei=0.05&mm=simple5&ss=4.2&dca=4&vd=26.3&sp=1&cb=a&bt=off',
    '?pc=500000&pm=argb&pdf=0.99&ei=0.1&ss=9.5&dca=77.2&vd=9.4&sp=0&cb=a',
    '?pc=500000&s=mr&pm=s&pdf=0.95&ei=0.01&mm=simple5&ss=3.7&dca=67.2&vd=25.7&sp=0&cb=a&bt=3',
    '?pc=500000&s=c&pm=s&pdf=0.97&ei=0.12&mm=simple3&ss=7.68&dca=11.25&vd=7.68&sp=0&cb=a&bt=5',
    '?pc=50000&s=r&pm=s&pdf=0.99&ei=1&mm=simple5&ss=1.5&dca=1&vd=2.5&sp=1&cb=a&bt=5',
];
async function onWindowLoad()
{
    let canvas_placeholder = document.getElementById('webgl-placeholder');
    if (!canvas_placeholder) throw Error('Canvas placeholder not found.');
    let controls_placeholder = document.getElementById('controls-placeholder');
    if (!controls_placeholder) throw Error('Controls placeholder not found.');
    let project = new PheromoneParticleSimulation();
    canvas_placeholder.appendChild(project.canvas_element);
    controls_placeholder.appendChild(project.control_panel.element);
    let random_button = controls_placeholder.appendChild(Object.assign(document.createElement('button'), { innerText: "Ustaw parametry losowo" }));
    random_button.addEventListener('click', () => project.setRandomParameters());

    let parameter_sets_container = document.createElement('span');
    parameter_sets_container.id = 'parameter-sets';
    controls_placeholder.appendChild(parameter_sets_container);
    
    Parameter_Sets.forEach((url, i) => 
    {
        let button = Object.assign(document.createElement('button'), { innerText: `${i}` });
        button.addEventListener('click', () => window.location.href = url);
        parameter_sets_container.appendChild(button);
    });
    
    await project.run();
}
window.addEventListener('load', onWindowLoad);