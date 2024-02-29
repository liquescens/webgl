// @ts-check
export class WebGLProject
{
    constructor()
    {
        this.canvas_element = document.createElement('canvas');
        this.canvas_element.width = 768;
        this.canvas_element.height = 768;
        document.getElementById('webgl-placeholder')?.appendChild(this.canvas_element);
        this.context = this.canvas_element.getContext("webgl2");
        if (!this.context) throw new Error("WebGPU not supported on this browser.");
        // this.gl_helper = new WebGL2Helper(this.context);
    }
}
