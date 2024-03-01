// @ts-check
import * as WebGL2 from "../../../js/webgl2/index.js";
/**
 * @extends {WebGL2.ShaderProgram<typeof UpdatePheromoneProgram.AttributesModel, typeof UpdatePheromoneProgram.UniformsModel>}
 */
export class UpdatePheromoneProgram extends WebGL2.ShaderProgram
{
    /** @type {{ position: 'vec3' }} */
    static AttributesModel = { position: 'vec3' };
    /** @type {{ PheromoneDecayFactor: 'float' }} */
    static UniformsModel = { PheromoneDecayFactor: 'float' };
    static Vertex_Shader_Source =`#version 300 es
        in vec2 position;
        void main()
        {
            gl_Position = vec4(vec2(position), 0, 1);
            gl_PointSize = 1.0;
        }
    `;
    static Fragment_Shader_Source = `#version 300 es
        precision highp float;
        uniform sampler2D Screen;
        uniform float PheromoneDecayFactor;
        out vec4 color;
        const float P = 1.0 / 768.0;
        void main()
        {
            vec2 uv = gl_FragCoord.xy / 768.0;

            // ad-hoc blur
            
            // vec4 c0 = texture(Screen, uv);
            // vec4 c1 = texture(Screen, uv + vec2(P, 0));
            // vec4 c2 = texture(Screen, uv + vec2(-P, 0));
            // vec4 c3 = texture(Screen, uv + vec2(0, P));
            // vec4 c4 = texture(Screen, uv + vec2(0, -P));
            // vec4 c = (c0 + c1 + c2 + c3 + c4) * 0.2;

            // gaussian blur

            vec3 c1 = texture(Screen, uv + vec2(-P, -P)) * 0.045;
            vec3 c2 = texture(Screen, uv + vec2(0, -P)) * 0.122;
            vec3 c3 = texture(Screen, uv + vec2(P, -P)) * 0.045;
            vec3 c4 = texture(Screen, uv + vec2(-P, 0)) * 0.122;
            vec3 c5 = texture(Screen, uv + vec2(0, 0)) * 0.332;
            vec3 c6 = texture(Screen, uv + vec2(P, 0)) * 0.122;
            vec3 c7 = texture(Screen, uv + vec2(-P, P)) * 0.045;
            vec3 c8 = texture(Screen, uv + vec2(0, P)) * 0.122;
            vec3 c9 = texture(Screen, uv + vec2(P, P)) * 0.045;
            vec3 c = c1 + c2 + c3 + c4 + c5 + c6 + c7 + c8 + c9;

            color = vec4(c * PheromoneDecayFactor, 1.0);
        }
    `;
    /**
     * @param {WebGL2RenderingContext} gl 
     */
    constructor(gl)
    {
        super(gl, UpdatePheromoneProgram.AttributesModel, UpdatePheromoneProgram.UniformsModel, UpdatePheromoneProgram.Vertex_Shader_Source, UpdatePheromoneProgram.Fragment_Shader_Source);
    }
    /**
     * @param {number} value
     */
    set pheromone_decay_factor(value)
    {
        this.context.uniform1f(this.uniform_locations.PheromoneDecayFactor, value);
    }
}