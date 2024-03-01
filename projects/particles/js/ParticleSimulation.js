// @ts-check
import * as WebGL2 from "../../../js/webgl2/index.js";
import * as WebGL2Helpers from "../../../js/webgl2/helpers/index.js";
import { DrawParticlesProgram } from "./DrawParticlesProgram.js";
import { RenderProgram } from "./RenderProgram.js";
import { UniformControls } from "./UniformControls.js";
import { UpdateParticlesProgram } from "./UpdateParticlesProgram.js";
import { UpdatePheromoneProgram } from "./UpdatePheromoneProgram.js";
// count=1000000&pdf=0.97&ss=7&dca=18&vd=3.5
// count=1000000&pdf=0.99&ss=2&dca=18&vd=5.5
// count=1000000&pdf=0.99&ss=2&dca=4&vd=3
// count=1000000&pdf=0.98&ss=4&dca=8&vd=6
// count=5000000&pdf=0.98&ss=7&dca=18&vd=11
// count=5000000&pdf=0.99&ss=3&dca=15&vd=6
// count=5000000&pdf=0.99&ss=1&dca=10&vd=2
export class ParticleSimulation extends WebGL2.Project
{
    constructor()
    {
        super();
        this.controls = new UniformControls();
    }

    async run()
    {
        let gl = this.context;
        let controls = this.controls;
        let particles = this._createParticles();
        let draw_particles_program = new DrawParticlesProgram(gl);

        let update_pheromone_program = new UpdatePheromoneProgram(gl);
        let render_program = new RenderProgram(gl);
        let render_plane = WebGL2Helpers.VertexArray.createVertexArray3(gl, render_program, WebGL2.Geometry.createRectangleVertices());
        
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, particles.vertex_arrays.input.buffers.framebuffer.handle);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, particles.vertex_arrays.output.buffers.framebuffer.handle);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
        function animate()
        {
            particles.update();

            gl.bindVertexArray(null);
            gl.bindTexture(gl.TEXTURE_2D, particles.vertex_arrays.input.buffers.framebuffer.texture_handle);
            gl.bindFramebuffer(gl.FRAMEBUFFER, particles.vertex_arrays.output.buffers.framebuffer.handle);
            // gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(update_pheromone_program.handle);
            if (controls.pheromone_decay_factor.changed) update_pheromone_program.pheromone_decay_factor = controls.pheromone_decay_factor.input.valueAsNumber;
            update_pheromone_program.pheromone_decay_factor = 1.0;
            gl.bindVertexArray(render_plane.handle);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
                gl.bindTexture(gl.TEXTURE_2D, particles.vertex_arrays.output.buffers.framebuffer.texture_handle);
                gl.bindFramebuffer(gl.FRAMEBUFFER, particles.vertex_arrays.input.buffers.framebuffer.handle);
                gl.drawArrays(gl.TRIANGLES, 0, 6);
                gl.bindTexture(gl.TEXTURE_2D, particles.vertex_arrays.input.buffers.framebuffer.texture_handle);
                gl.bindFramebuffer(gl.FRAMEBUFFER, particles.vertex_arrays.output.buffers.framebuffer.handle);
                gl.drawArrays(gl.TRIANGLES, 0, 6);
                gl.bindTexture(gl.TEXTURE_2D, particles.vertex_arrays.output.buffers.framebuffer.texture_handle);
                gl.bindFramebuffer(gl.FRAMEBUFFER, particles.vertex_arrays.input.buffers.framebuffer.handle);
                gl.drawArrays(gl.TRIANGLES, 0, 6);
                gl.bindTexture(gl.TEXTURE_2D, particles.vertex_arrays.input.buffers.framebuffer.texture_handle);
                gl.bindFramebuffer(gl.FRAMEBUFFER, particles.vertex_arrays.output.buffers.framebuffer.handle);
                update_pheromone_program.pheromone_decay_factor = controls.pheromone_decay_factor.input.valueAsNumber;
                gl.drawArrays(gl.TRIANGLES, 0, 6);
            // gl.bindVertexArray(particles.draw.input.handle);
            // gl.useProgram(particles.draw.program.handle);
            // gl.drawArrays(gl.POINTS, 0, controls.particles_count.input.valueAsNumber);
            gl.bindVertexArray(null);
            gl.useProgram(particles.draw.program.handle);
            gl.bindBuffer(gl.ARRAY_BUFFER, particles.vertex_arrays.output.buffers.position);
            gl.enableVertexAttribArray(draw_particles_program.attribute_locations.position);
            gl.vertexAttribPointer(draw_particles_program.attribute_locations.position, 2, gl.FLOAT, false, 0, 0); 
            gl.bindBuffer(gl.ARRAY_BUFFER, particles.vertex_arrays.output.buffers.smell);
            gl.enableVertexAttribArray(draw_particles_program.attribute_locations.smell);
            gl.vertexAttribPointer(draw_particles_program.attribute_locations.smell, 3, gl.FLOAT, false, 0, 0); 
            // // gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.POINTS, 0, controls.particles_count.input.valueAsNumber);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            
            gl.bindVertexArray(render_plane.handle);
            gl.activeTexture(gl.TEXTURE0 + 0);
            gl.bindTexture(gl.TEXTURE_2D, particles.vertex_arrays.output.buffers.framebuffer.texture_handle);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            // gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(render_program.handle);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
    
            // gl.bindFramebuffer(gl.READ_FRAMEBUFFER, update_renderer.vertex_arrays.output.buffers.frame.handle);
            // gl.bindVertexArray(null);
            // // gl.bindVertexArray(points_array);
            // gl.bindBuffer(gl.ARRAY_BUFFER, update_renderer.vertex_arrays.output.buffers.position);
            // gl.enableVertexAttribArray(render_program.attributes.position);
            // gl.vertexAttribPointer(render_program.attributes.position, 2, gl.FLOAT, false, 0, 0);
            // gl.useProgram(render_program.handle);
            // gl.activeTexture(gl.TEXTURE0);
            // gl.bindTexture(gl.TEXTURE_2D, update_renderer.vertex_arrays.input.buffers.frame.texture);
            // gl.uniform1i(render_program.uniforms.screen, 0);
            // gl.drawArrays(gl.POINTS, 0, COUNT);
            // gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
            // gl.bindFramebuffer(gl.READ_FRAMEBUFFER, update_renderer.vertex_arrays.output.buffers.frame.handle);
            // gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
            // gl.blitFramebuffer(0, 0, 768, 768, 0, 0, 768, 768, gl.COLOR_BUFFER_BIT, gl.NEAREST);
    
            window.requestAnimationFrame(animate);
            
            // time = 0.001;
        }
        
        window.requestAnimationFrame(animate);
    }

    _createParticles()
    {
        let gl = this.context;
        let program = new UpdateParticlesProgram(gl);
        /** @type {number[]} */
        let positions = [];
        let count = this.controls.particles_count.input.valueAsNumber;
        let d = (Math.PI * 2) / count;
        for (let i = 0, a = 0; i < count; i++)
        {
            positions.push(Math.sin(a) * (Math.random() * 0.5 + 0.3));
            positions.push(Math.cos(a) * (Math.random() * 0.5 + 0.3));
            a += d;
        }
        /** @type {number[]} */
        let velocities = [];
        for (let i = 0, a = 0; i < count; i++)
        {
            velocities.push(-Math.sin(a) * (1.0 + Math.random() * 0.21));
            velocities.push(-Math.cos(a) * (1.0 + Math.random() * 0.21));
            a += d;
        }
        /** @type {number[]} */
        let smell = [];
        for (let i = 0; i < count; i++)
        {
            smell.push(Math.random(), 0, 1);
        }

        /**
         * @param {WebGLBuffer} smell_buffer 
         * @returns 
         */
        function createVertexArray(smell_buffer)
        {
            let framebuffer = new WebGL2.TexturedFramebuffer(gl);
            let position = gl.createBuffer();
            if (!position) throw new Error();
            let velocity = gl.createBuffer();
            if (!velocity) throw new Error();
            let buffers = { position, velocity, smell: smell_buffer, framebuffer };
            
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.velocity);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(velocities), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            let handle = gl.createVertexArray();
            gl.bindVertexArray(handle);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.enableVertexAttribArray(program.attribute_locations.position);
            gl.vertexAttribPointer(program.attribute_locations.position, 2, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.velocity);
            gl.enableVertexAttribArray(program.attribute_locations.velocity);
            gl.vertexAttribPointer(program.attribute_locations.velocity, 2, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, smell_buffer);
            gl.enableVertexAttribArray(program.attribute_locations.smell);
            gl.vertexAttribPointer(program.attribute_locations.smell, 3, gl.FLOAT, false, 0, 0);
            gl.bindVertexArray(null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            return { handle, buffers }
        }
        
        let smell_buffer = gl.createBuffer();
        if (!smell_buffer) throw new Error();
        gl.bindBuffer(gl.ARRAY_BUFFER, smell_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(smell), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        let vertex_arrays = { input: createVertexArray(smell_buffer), output: createVertexArray(smell_buffer) };

        let draw_program = new DrawParticlesProgram(gl);
        // let draw_input = new WebGL2Helpers.VertexArrayBuilder(gl);
        // draw_input.bindBuffer2('position', vertex_arrays.output.buffers.position, draw_program);
        // draw_input.bindBuffer3('smell', smell_buffer, draw_program);
        // let draw_output = new WebGL2Helpers.VertexArrayBuilder(gl);
        // draw_output.bindBuffer2('position', vertex_arrays.input.buffers.position, draw_program);
        // draw_output.bindBuffer3('smell', smell_buffer, draw_program);
        let draw = {
            program: draw_program,
            // input: draw_input,
            // output: draw_output
        };

        let controls = this.controls;
        
        function update()
        {
            [vertex_arrays.input, vertex_arrays.output] = [vertex_arrays.output, vertex_arrays.input];

            gl.bindVertexArray(vertex_arrays.input.handle);
            // gl.bindBuffer(gl.ARRAY_BUFFER, buffers.input.position);
            // gl.enableVertexAttribArray(program.attributes.position);
            // gl.vertexAttribPointer(program.attributes.position, 2, gl.FLOAT, false, 0, 0);
            // gl.bindBuffer(gl.ARRAY_BUFFER, buffers.input.velocity);
            // gl.enableVertexAttribArray(program.attributes.velocity);
            // gl.vertexAttribPointer(program.attributes.velocity, 2, gl.FLOAT, false, 0, 0);
            // gl.activeTexture(vertex_arrays.input.buffers.frame.texture);
            gl.useProgram(program.handle);
            if (controls.step_size.changed) gl.uniform1f(program.uniform_locations.VelocityScale, (1 / 768) * controls.step_size.input.valueAsNumber);
            if (controls.viewing_distance.changed) gl.uniform1f(program.uniform_locations.ViewingDistance, (1 / 768) * controls.viewing_distance.input.valueAsNumber);
            if (controls.direction_change_angle.changed) program.direction_change_angle = controls.direction_change_angle.input.valueAsNumber;
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, vertex_arrays.output.buffers.position);
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, vertex_arrays.output.buffers.velocity);
            gl.enable(gl.RASTERIZER_DISCARD);
            gl.beginTransformFeedback(gl.POINTS);
            gl.drawArrays(gl.POINTS, 0, count);
            gl.endTransformFeedback();
            gl.disable(gl.RASTERIZER_DISCARD);
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, null);
        }

        return { update, program, vertex_arrays, draw };
    }
}