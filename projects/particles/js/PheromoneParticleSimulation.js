// @ts-check
import * as WebGL2 from "../../../js/webgl2/index.js";
import { ParametersPanel } from "./ParametersPanel.js";
import { PheromoneParticleSystem } from "./PheromoneParticleSystem.js";
export class PheromoneParticleSimulation extends WebGL2.Project
{
    constructor()
    {
        super();
        this.control_panel = new ParametersPanel();
        this.particles = new PheromoneParticleSystem(this.context, this.control_panel.parameters);
    }
    setRandomParameters()
    {
        const round = (/** @type {number} */ n) => Math.round(n * 10) / 10;
        this.control_panel.controls.direction_change_angle.value.set(round(Math.random() * 89 + 1));
        this.control_panel.controls.viewing_distance.value.set(round(1 + Math.random() * 30));
        this.control_panel.controls.step_size.value.set(round(1 + Math.random() * 30));
        this.control_panel._updateLink();
    }
    _handleReset()
    {
        if (this.control_panel.reset)
        {
            this.control_panel.reset = false;
            this.particles.setData(this._generateParticlesData(this.control_panel.parameters.particles_count.value));
        }
    }
    _handleBlending()
    {
        let gl = this.context;
        let control_panel = this.control_panel;
        if (control_panel.parameters.color_blending.changed)
        {
            control_panel.parameters.color_blending.changed = false;
            switch (control_panel.parameters.color_blending.value)
            {
                case 'a':
                    gl.enable(gl.BLEND);
                    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                    break;
                case '0':
                default:
                    gl.disable(gl.BLEND);
            }
        }
    }
    async run()
    {
        let gl = this.context;
        let particles = this.particles;
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    
        const animate = () =>
        {
            this._handleReset();
            this._handleBlending();
            particles.updateParticles();
            particles.emitPheromones();
            particles.diffusePheromones();
            particles.draw();
            window.requestAnimationFrame(animate);
        }
        
        window.requestAnimationFrame(animate);

        async function parametersAnimation()
        {
            // await new Promise(r => setTimeout(r, 2000));
            // control_panel.step_size.input.valueAsNumber = 8;
            // control_panel.step_size.changed = true;
            // await new Promise(r => setTimeout(r, 2000));
            // control_panel.direction_change_angle.input.valueAsNumber = 20;
            // control_panel.direction_change_angle.changed = true;
            // await new Promise(r => setTimeout(r, 3000));
            // control_panel.step_size.input.valueAsNumber = 1.1;
            // control_panel.step_size.changed = true;
            // control_panel.viewing_distance.input.valueAsNumber = 3.1;
            // control_panel.viewing_distance.changed = true;
            // control_panel.direction_change_angle.input.valueAsNumber = 1;
            // control_panel.direction_change_angle.changed = true;
            // await new Promise(r => setTimeout(r, 2000));
            // control_panel.direction_change_angle.input.valueAsNumber = 45;
            // control_panel.direction_change_angle.changed = true;
            // await new Promise(r => setTimeout(r, 5000));
            // control_panel.direction_change_angle.input.valueAsNumber = 3;
            // control_panel.direction_change_angle.changed = true;
            // await new Promise(r => setTimeout(r, 1000));
            // control_panel.viewing_distance.input.valueAsNumber = 31.1;
            // control_panel.viewing_distance.changed = true;
            // await new Promise(r => setTimeout(r, 3000));
            // control_panel.direction_change_angle.input.valueAsNumber = 0.3;
            // control_panel.direction_change_angle.changed = true;
            // await new Promise(r => setTimeout(r, 2000));
            // control_panel.direction_change_angle.input.valueAsNumber = 1.3;
            // control_panel.direction_change_angle.changed = true;
            // control_panel.viewing_distance.input.valueAsNumber = 2.1;
            // control_panel.viewing_distance.changed = true;

            // while (true)
            // {
            //     await new Promise(r => setTimeout(r, 2000));
            //     control_panel.direction_change_angle.input.valueAsNumber = Math.random() * 89 + 1;
            //     control_panel.direction_change_angle.changed = true;
            //     control_panel.viewing_distance.input.valueAsNumber = 1 + Math.random() * 30;
            //     control_panel.viewing_distance.changed = true;
            //     control_panel.step_size.input.valueAsNumber = 1 + Math.random() * 30;
            //     control_panel.step_size.changed = true;
            // }
        }

        // parametersAnimation();
    }

    /**
     * @param {number} count 
     * @returns 
     */
    _generateParticlesData(count)
    {
        /** @type {number[]} */
        let positions = [];
        let d = (Math.PI * 2) / count;
        if (this.control_panel.parameters.start_state.value == 'fc')
        {
            for (let i = 0, a = 0; i < count; i++)
            {
                positions.push(Math.sin(a) * Math.random() * 0.8);
                positions.push(Math.cos(a) * Math.random() * 0.8);
                a += d;
            }
        }
        else if (this.control_panel.parameters.start_state.value == 'r')
        {
            for (let i = 0, a = 0; i < count; i++)
            {
                positions.push(Math.random() * 1.8 - 0.9);
                positions.push(Math.random() * 1.8 - 0.9);
                a += d;
            }
        }
        else if (this.control_panel.parameters.start_state.value == 'c')
        {
            for (let i = 0, a = 0; i < count; i++)
            {
                positions.push(Math.sin(a) * 0.8);
                positions.push(Math.cos(a) * 0.8);
                a += d;
            }
        }
        else
        {
            for (let i = 0, a = 0; i < count; i++)
            {
                positions.push(Math.sin(a) * (Math.random() * 0.5 + 0.3));
                positions.push(Math.cos(a) * (Math.random() * 0.5 + 0.3));
                a += d;
            }
        }
        // for (let i = 0, a = 0; i < count; i++)
        // {
        //     positions.push(Math.sin(a) * 0.8);
        //     positions.push(Math.cos(a) * 0.8);
        //     a += d;
        // }
        /** @type {number[]} */
        let velocities = [];
        // if (this.control_panel.parameters.start_state.value == 'r')
        // {
        //     for (let i = 0, a = 0; i < count; i++)
        //     {
        //         velocities.push(Math.random() * 2 - 1);
        //         velocities.push(Math.random() * 2 - 1);
        //         a += d;
        //     }
        // }
        // else
        // {
            for (let i = 0, a = 0; i < count; i++)
            {
                velocities.push(-Math.sin(a) * (1.0 + Math.random() * 0.21));
                velocities.push(-Math.cos(a) * (1.0 + Math.random() * 0.21));
                a += d;
            }
        // }
        /** @type {number[]} */
        let smell = [];
        let smell_function = this.control_panel.getPheromonesModelFunction();
        for (let i = 0; i < count; i++)
        {
            smell.push(...smell_function(i));
        }
        return { positions, velocities, smell, count };
    }
}