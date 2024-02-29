// @ts-check
import { FixedColorWithoutTransform } from "../programs/FixedColorWithoutTransform.js";
import { TextureWithoutTransform } from "../programs/TextureWithoutTransform.js";
import { WebGL2VertexArrayHelper } from "../WebGL2VertexArrayHelper.js";
import { WebGLProject } from "./WebGLProject.js";

export class TexturedFramebuffer
{
    /**
     * @param {WebGL2RenderingContext} gl 
     * @returns 
     */
    static createTexture(gl)
    {
        let handle = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, handle);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return handle;
    }

    /**
     * @param {WebGL2RenderingContext} gl 
     */
    constructor(gl)
    {
        this.texture_handle = TexturedFramebuffer.createTexture(gl);
        this.handle = gl.createFramebuffer();
        // let renderbuffer = gl.createRenderbuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.handle);
        // gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
        // gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA4, gl.canvas.width, gl.canvas.height);
        // gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, renderbuffer);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.handle);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture_handle, 0);
    }
}

export class BasicFramebuffer extends WebGLProject
{
    constructor()
    {
        super();
        this.helpers = { basic: new WebGL2VertexArrayHelper() };
    }
    async run()
    {
        let gl = this.context;
        let fixed_color_program = new FixedColorWithoutTransform(this.context);
        let fixed_color_triangle = this.helpers.basic.createFixedColorTriangle(this.context, fixed_color_program);
        let textured_program = new TextureWithoutTransform(this.context);
        let textured_triangle = this.helpers.basic.createTexturedTriangle(this.context, textured_program);
        let framebuffer = new TexturedFramebuffer(gl);
        gl.clearColor(0.0, 0.0, 0.2, 1.0);
        
        let animate = () =>
        {
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.handle);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(fixed_color_program.handle);
            gl.bindVertexArray(fixed_color_triangle.handle);
            gl.drawArrays(gl.TRIANGLES, 0, 3);

            gl.activeTexture(gl.TEXTURE0 + 0);
            gl.bindTexture(gl.TEXTURE_2D, framebuffer.texture_handle);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            // gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(textured_program.handle);
            gl.bindVertexArray(textured_triangle.handle);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            // gl.bindFramebuffer(gl.READ_FRAMEBUFFER, framebuffer);
            // gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
            // gl.blitFramebuffer(0, 0, 768, 768, 0, 0, 768, 768, gl.COLOR_BUFFER_BIT, gl.NEAREST);


            // window.requestAnimationFrame(animate);
        }
        
        window.requestAnimationFrame(animate);
    }
}
