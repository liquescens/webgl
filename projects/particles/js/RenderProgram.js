// @ts-check
import * as WebGL2 from "../../../js/webgl2/index.js";
/**
 * @extends {WebGL2.ShaderProgram<typeof RenderProgram.AttributesModel, typeof RenderProgram.UniformsModel>}
 */
export class RenderProgram extends WebGL2.ShaderProgram
{
    /** @type {{ position: 'vec3' }} */
    static AttributesModel = { position: 'vec3' };
    /** @type {{ }} */
    static UniformsModel = { };
    static Vertex_Shader_Source =`#version 300 es
        in vec2 position;
        void main()
        {
            gl_Position = vec4(vec2(position), 0, 1);
        }
    `;
    static Fragment_Shader_Source = `#version 300 es
        precision highp float;
        uniform sampler2D Screen;
        out vec4 color;
        void main()
        {
            color = texture(Screen, gl_FragCoord.xy / 768.0);
        }
    `;
    /**
     * @param {WebGL2RenderingContext} gl 
     */
    constructor(gl)
    {
        super(gl, RenderProgram.AttributesModel, {}, RenderProgram.Vertex_Shader_Source, RenderProgram.Fragment_Shader_Source);
    }
}