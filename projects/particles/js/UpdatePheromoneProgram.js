// @ts-check
import * as WebGL2 from "../../../js/webgl2/index.js";
/**
 * @typedef { 'off' | '3' | '5' } BlurType
 */
/**
 * @extends {WebGL2.ShaderProgram<typeof UpdatePheromoneProgram.AttributesModel, typeof UpdatePheromoneProgram.UniformsModel>}
 */
export class UpdatePheromoneProgram extends WebGL2.ShaderProgram
{
    /** @type {{ position: 'vec3' }} */
    static AttributesModel = { position: 'vec3' };
    /** @type {{ PheromoneDecayFactor: 'vec3' }} */
    static UniformsModel = { PheromoneDecayFactor: 'vec3' };
    static Vertex_Shader_Source =`#version 300 es
        in vec2 position;
        void main()
        {
            gl_Position = vec4(vec2(position), 0, 1);
            gl_PointSize = 1.0;
        }
    `;
    static Fragment_Shader_Source = `#version 300 es
        #define BLUR_{blur_type}
        precision highp float;
        uniform sampler2D Screen;
        uniform vec3 PheromoneDecayFactor;
        out vec4 color;
        const float P1 = 1.0 / 768.0;
        const float P2 = 2.0 / 768.0;
        #ifdef BLUR_OFF
        vec3 gaussian(vec2 uv)
        {
            return vec3(texture(Screen, uv));
        }
        #endif
        #ifdef BLUR_3
        vec3 gaussian(vec2 uv)
        {
            vec3 c1 = vec3(texture(Screen, uv + vec2(-P1, -P1))) * 0.045;
            vec3 c2 = vec3(texture(Screen, uv + vec2(0, -P1))) * 0.122;
            vec3 c3 = vec3(texture(Screen, uv + vec2(P1, -P1))) * 0.045;
            vec3 c4 = vec3(texture(Screen, uv + vec2(-P1, 0))) * 0.122;
            vec3 c5 = vec3(texture(Screen, uv + vec2(0, 0))) * 0.332;
            vec3 c6 = vec3(texture(Screen, uv + vec2(P1, 0))) * 0.122;
            vec3 c7 = vec3(texture(Screen, uv + vec2(-P1, P1))) * 0.045;
            vec3 c8 = vec3(texture(Screen, uv + vec2(0, P1))) * 0.122;
            vec3 c9 = vec3(texture(Screen, uv + vec2(P1, P1))) * 0.045;
            return c1 + c2 + c3 + c4 + c5 + c6 + c7 + c8 + c9;
        }
        #endif
        #ifdef BLUR_5
        vec3 gaussian(vec2 uv)
        {
            vec3 c0 = vec3(texture(Screen, uv + vec2(0, 0))) * 0.16; // 0.15018315019;
            
            vec3 c1a = vec3(texture(Screen, uv + vec2(0, P1))) * 0.0952380952380952;
            vec3 c1b = vec3(texture(Screen, uv + vec2(0, -P1))) * 0.0952380952380952;
            vec3 c1c = vec3(texture(Screen, uv + vec2(P1, 0))) * 0.0952380952380952;
            vec3 c1d = vec3(texture(Screen, uv + vec2(-P1, 0))) * 0.0952380952380952;
            
            vec3 c2a = vec3(texture(Screen, uv + vec2(-P1, -P1))) * 0.0586080586080586;
            vec3 c2b = vec3(texture(Screen, uv + vec2(P1, P1))) * 0.0586080586080586;
            vec3 c2c = vec3(texture(Screen, uv + vec2(-P1, P1))) * 0.0586080586080586;
            vec3 c2d = vec3(texture(Screen, uv + vec2(P1, -P1))) * 0.0586080586080586;
            
            vec3 c3a = vec3(texture(Screen, uv + vec2(0, P2))) * 0.0256410256410256;
            vec3 c3b = vec3(texture(Screen, uv + vec2(0, -P2))) * 0.0256410256410256;
            vec3 c3c = vec3(texture(Screen, uv + vec2(P2, 0))) * 0.0256410256410256;
            vec3 c3d = vec3(texture(Screen, uv + vec2(-P2, 0))) * 0.0256410256410256;
            
            vec3 c4a = vec3(texture(Screen, uv + vec2(P1, P2))) * 0.0146520146520147;
            vec3 c4b = vec3(texture(Screen, uv + vec2(P1, -P2))) * 0.0146520146520147;
            vec3 c4c = vec3(texture(Screen, uv + vec2(-P1, P2))) * 0.0146520146520147;
            vec3 c4d = vec3(texture(Screen, uv + vec2(-P1, -P2))) * 0.0146520146520147;
            vec3 c4e = vec3(texture(Screen, uv + vec2(P2, P1))) * 0.0146520146520147;
            vec3 c4f = vec3(texture(Screen, uv + vec2(P2, -P1))) * 0.0146520146520147;
            vec3 c4g = vec3(texture(Screen, uv + vec2(-P2, P1))) * 0.0146520146520147;
            vec3 c4h = vec3(texture(Screen, uv + vec2(-P2, -P1))) * 0.0146520146520147;
            
            vec3 c5a = vec3(texture(Screen, uv + vec2(P2, P2))) * 0.00366300366300366;
            vec3 c5b = vec3(texture(Screen, uv + vec2(P2, -P2))) * 0.00366300366300366;
            vec3 c5c = vec3(texture(Screen, uv + vec2(-P2, P2))) * 0.00366300366300366;
            vec3 c5d = vec3(texture(Screen, uv + vec2(-P2, -P2))) * 0.00366300366300366;

            return c1a + c1b + c1c + c1d
            + c2a + c2b + c2c + c2d
            + c3a + c3b + c3c + c3d
            + c4a + c4b + c4c + c4d + c4e + c4f + c4g + c4h
            + c5a + c5b + c5c + c5d; 
        }
        #endif
        void main()
        {
            vec2 uv = gl_FragCoord.xy / 768.0;
            color = vec4(gaussian(uv) * PheromoneDecayFactor - 0.0001, 1.0);
        }
    `;
    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {BlurType} blur_type
     */
    constructor(gl, blur_type)
    {
        let fragment_shader_source = UpdatePheromoneProgram.Fragment_Shader_Source.replace('{blur_type}', blur_type.toUpperCase());
        super(gl, UpdatePheromoneProgram.AttributesModel, UpdatePheromoneProgram.UniformsModel, UpdatePheromoneProgram.Vertex_Shader_Source, fragment_shader_source);
    }
    /**
     * @param {[number, number, number]} value
     */
    set pheromone_decay_factor(value)
    {
        this.context.uniform3f(this.uniform_locations.PheromoneDecayFactor, ...value);
    }
}