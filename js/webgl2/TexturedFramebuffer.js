// @ts-check
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
