// @ts-check
import * as WebGL2 from "../../../js/webgl2/index.js";
/**
 * @extends {WebGL2.ShaderProgram<typeof DrawParticlesProgram.AttributesModel, typeof DrawParticlesProgram.UniformsModel>}
 */
export class DrawParticlesProgram extends WebGL2.ShaderProgram
{
    /** @type {{ position: 'vec2', smell: 'vec3' }} */
    static AttributesModel = { position: 'vec2', smell: 'vec3' };
    /** @type {{ }} */
    static UniformsModel = { };
    static Vertex_Shader_Source =`#version 300 es
        in vec2 position;
        in vec3 smell;
        out vec3 fragColor;
        void main()
        {
            fragColor = smell;
            gl_Position = vec4(vec2(position), 0, 1);
            gl_PointSize = 1.0;
        }
    `;
    static Fragment_Shader_Source = `#version 300 es
        precision highp float;
        uniform sampler2D Screen;
        in vec3 fragColor;
        out vec4 color;
        void main()
        {
            color = vec4(fragColor, 0.005);
            // color = vec4(0.0, 0.0, 1.0, 0.005);
        }
    `;
    /**
     * @param {WebGL2RenderingContext} gl 
     */
    constructor(gl)
    {
        super(gl, DrawParticlesProgram.AttributesModel, {}, DrawParticlesProgram.Vertex_Shader_Source, DrawParticlesProgram.Fragment_Shader_Source);
    }
}