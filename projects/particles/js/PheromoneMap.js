// @ts-check
import * as WebGL2 from "../../../js/webgl2/index.js";
import * as WebGL2Helpers from "../../../js/webgl2/helpers/index.js";
import { UpdatePheromoneProgram } from "./UpdatePheromoneProgram.js";
export class PheromoneMap
{
    /**
     * @param {WebGL2RenderingContext} gl
     * @param {import('./UpdatePheromoneProgram.js').BlurType} blur_type
     */
    constructor(gl, blur_type)
    {
        this.gl = gl;
        this.input = new WebGL2.TexturedFramebuffer(gl);
        this.output = new WebGL2.TexturedFramebuffer(gl);
        this.program = new UpdatePheromoneProgram(gl, blur_type);
        this.render_plane = WebGL2Helpers.VertexArray.createVertexArray3(gl, this.program, WebGL2.Geometry.createRectangleVertices());
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.input.handle);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.output.handle);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    draw()
    {
        let gl = this.gl;
        [this.input, this.output] = [this.output, this.input];
        gl.bindVertexArray(null);
        gl.bindTexture(gl.TEXTURE_2D, this.input.texture_handle);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.output.handle);
        gl.clear(gl.COLOR_BUFFER_BIT);
        // if (controls.pheromone_decay_factor.changed) update_pheromone_program.pheromone_decay_factor = controls.pheromone_decay_factor.input.valueAsNumber;
        gl.bindVertexArray(this.render_plane.handle);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}