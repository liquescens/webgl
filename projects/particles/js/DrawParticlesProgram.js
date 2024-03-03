// @ts-check
import * as WebGL2 from "../../../js/webgl2/index.js";
/**
 * @extends {WebGL2.ShaderProgram<typeof DrawParticlesProgram.AttributesModel, typeof DrawParticlesProgram.UniformsModel>}
 */
export class DrawParticlesProgram extends WebGL2.ShaderProgram
{
    /** @type {{ position: 'vec2', smell: 'vec3' }} */
    static AttributesModel = { position: 'vec2', smell: 'vec3' };
    /** @type {{ EmissionIntensity: 'float' }} */
    static UniformsModel = { EmissionIntensity: 'float' };
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
        uniform float EmissionIntensity;
        in vec3 fragColor;
        out vec4 color;
        void main()
        {
            color = vec4(fragColor, EmissionIntensity);
            // color = vec4(0.5, 0.0, 1.0, EmissionIntensity);
            // color = vec4(0.0, 0.0, 1.0, 0.005);
        }
    `;
    /**
     * @param {WebGL2RenderingContext} gl 
     */
    constructor(gl)
    {
        super(gl, DrawParticlesProgram.AttributesModel, DrawParticlesProgram.UniformsModel, DrawParticlesProgram.Vertex_Shader_Source, DrawParticlesProgram.Fragment_Shader_Source);
    }
    /**
     * @param {number} value
     */
    set emission_intensity(value)
    {
        this.context.uniform1f(this.uniform_locations.EmissionIntensity, value);
    }
}