// @ts-check
import * as WebGL2 from "../../../js/webgl2/index.js";
import * as WebGL2Helpers from "../../../js/webgl2/helpers/index.js";
import { DrawParticlesProgram } from './DrawParticlesProgram.js';
import { PheromoneMap } from './PheromoneMap.js';
import { RenderParticlesProgram } from './RenderParticlesProgram.js';
import { UpdateParticlesProgram } from './UpdateParticlesProgram.js';
export class PheromoneParticleSystem
{
    /**
     * @param {WebGL2RenderingContext} context
     * @param {import('./ParametersPanel.js').Parameters} parameters
     */
    constructor(context, parameters)
    {
        this.count = 0;
        this.context = context;
        this.parameters = parameters;
        this.update_program = new UpdateParticlesProgram(context, parameters.movement_model.value);
        this.smell_buffer = context.createBuffer();
        if (!this.smell_buffer) throw new Error();
        this.pheromone_map = new PheromoneMap(context, parameters.blur_type.value);
        this.vertex_arrays = { input: this._createUpdateProgramVertexArray(), output: this._createUpdateProgramVertexArray() };
        this.draw_program = new DrawParticlesProgram(context);
        this.render_program = new RenderParticlesProgram(context);
        this.render_plane = WebGL2Helpers.VertexArray.createVertexArray3(context, this.render_program, WebGL2.Geometry.createRectangleVertices());
    }
    updateParticles()
    {
        let gl = this.context;
        let program = this.update_program;
        let vertex_arrays = this.vertex_arrays;
        let parameters = this.parameters;
        [vertex_arrays.input, vertex_arrays.output] = [vertex_arrays.output, vertex_arrays.input];
        gl.bindVertexArray(this.vertex_arrays.input.handle);
        // gl.bindBuffer(gl.ARRAY_BUFFER, buffers.input.position);
        // gl.enableVertexAttribArray(program.attributes.position);
        // gl.vertexAttribPointer(program.attributes.position, 2, gl.FLOAT, false, 0, 0);
        // gl.bindBuffer(gl.ARRAY_BUFFER, buffers.input.velocity);
        // gl.enableVertexAttribArray(program.attributes.velocity);
        // gl.vertexAttribPointer(program.attributes.velocity, 2, gl.FLOAT, false, 0, 0);
        // gl.activeTexture(vertex_arrays.input.buffers.frame.texture);
        gl.useProgram(program.handle);
        if (parameters.step_size.changed) gl.uniform1f(program.uniform_locations.VelocityScale, (1 / 768) * parameters.step_size.value);
        if (parameters.viewing_distance.changed) gl.uniform1f(program.uniform_locations.ViewingDistance, (1 / 768) * parameters.viewing_distance.value);
        if (parameters.direction_change_angle.changed) program.direction_change_angle = parameters.direction_change_angle.value;
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, vertex_arrays.output.buffers.position);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, vertex_arrays.output.buffers.velocity);
        gl.enable(gl.RASTERIZER_DISCARD);
        gl.beginTransformFeedback(gl.POINTS);
        gl.drawArrays(gl.POINTS, 0, this.count);
        gl.endTransformFeedback();
        gl.disable(gl.RASTERIZER_DISCARD);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, null);
    }
    diffusePheromones()
    {
        this.context.useProgram(this.pheromone_map.program.handle);
        this.pheromone_map.program.pheromone_decay_factor = this._getPheromoneDecayFactor(); // [1.0, 1.0, 1.0];
        this.pheromone_map.draw();
        // particles.pheromone_map.draw();
        // particles.pheromone_map.draw();
        // particles.pheromone_map.draw();
    }
    emitPheromones()
    {
        let gl = this.context;
        let parameters = this.parameters;
        gl.bindVertexArray(null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.pheromone_map.output.handle);
        gl.useProgram(this.draw_program.handle);
        if (parameters.emission_intensity.changed)
        {
            parameters.emission_intensity.changed = false;
            this.draw_program.emission_intensity = parameters.emission_intensity.value;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_arrays.output.buffers.position);
        gl.enableVertexAttribArray(this.draw_program.attribute_locations.position);
        gl.vertexAttribPointer(this.draw_program.attribute_locations.position, 2, gl.FLOAT, false, 0, 0); 
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_arrays.output.buffers.smell);
        gl.enableVertexAttribArray(this.draw_program.attribute_locations.smell);
        gl.vertexAttribPointer(this.draw_program.attribute_locations.smell, 3, gl.FLOAT, false, 0, 0); 
        // gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, this.count);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
    draw()
    {
        if (this.parameters.show_pheromones.value) this.drawPheromoneMap(); 
        else this.drawParticles();
    }
    drawPheromoneMap()
    {
        let gl = this.context;
        gl.bindVertexArray(this.render_plane.handle);
        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, this.pheromone_map.output.texture_handle);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        // gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(this.render_program.handle);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    drawParticles()
    {
        let gl = this.context;
        let draw_program = this.draw_program;
        gl.bindVertexArray(null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(draw_program.handle);
        if (this.parameters.emission_intensity.changed) this.draw_program.emission_intensity = this.parameters.emission_intensity.value;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_arrays.output.buffers.position);
        gl.enableVertexAttribArray(draw_program.attribute_locations.position);
        gl.vertexAttribPointer(draw_program.attribute_locations.position, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_arrays.output.buffers.smell);
        gl.enableVertexAttribArray(draw_program.attribute_locations.smell);
        gl.vertexAttribPointer(draw_program.attribute_locations.smell, 3, gl.FLOAT, false, 0, 0); 
        gl.drawArrays(gl.POINTS, 0, this.count); 
    }
    /**
     * @param {{ positions: number[], velocities: number[], smell: number[] }} param0 
     */
    setData({ positions, velocities, smell })
    {
        let gl = this.context;
        this.count = positions.length / 2;
        this.vertex_arrays.input.setData(positions, velocities);
        this.vertex_arrays.output.setData(positions, velocities);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.smell_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(smell), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
    /**
     * @returns {[number, number, number]}
     */
    _getPheromoneDecayFactor()
    {
        let v = this.parameters.pheromone_decay_factor.value;
        switch (this.parameters.pheromones_model.value)
        {
            // case 'r01': return [1, 1, v];
            case 'sn': return [1, 1, v];
            default: return [v, v, v];
        }
    }
    _createUpdateProgramVertexArray()
    {
        let gl = this.context;
        let position = gl.createBuffer();
        if (!position) throw new Error();
        let velocity = gl.createBuffer();
        if (!velocity) throw new Error();
        let buffers = { position, velocity, smell: this.smell_buffer };
        
        let handle = gl.createVertexArray();
        gl.bindVertexArray(handle);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.enableVertexAttribArray(this.update_program.attribute_locations.position);
        gl.vertexAttribPointer(this.update_program.attribute_locations.position, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.velocity);
        gl.enableVertexAttribArray(this.update_program.attribute_locations.velocity);
        gl.vertexAttribPointer(this.update_program.attribute_locations.velocity, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.smell_buffer);
        gl.enableVertexAttribArray(this.update_program.attribute_locations.smell);
        gl.vertexAttribPointer(this.update_program.attribute_locations.smell, 3, gl.FLOAT, false, 0, 0);
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        /** @type {(positions: number[], velocities: number[]) => void} */
        const setData = (positions, velocities) =>
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.velocity);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(velocities), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        };

        return { handle, buffers, setData }
    }
}