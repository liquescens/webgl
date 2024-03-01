// @ts-check
export class Project
{
    constructor()
    {
        this.canvas_element = document.createElement('canvas');
        this.canvas_element.width = 768;
        this.canvas_element.height = 768;
        this.context = this.canvas_element.getContext("webgl2");
        if (!this.context) throw new Error("WebGPU not supported on this browser.");
    }
}
