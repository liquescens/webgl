// @ts-check
import { WebGL2Program } from "../WebGL2Program.js";
/**
 * @extends {WebGL2Program<typeof FixedColorWithoutTransform.AttributesModel, {}>}
 */
export class FixedColorWithoutTransform extends WebGL2Program
{
    /** @type {{ position: 'vec3' }} */
    static AttributesModel = { position: 'vec3' };

    static Vertex_Shader_Source = `#version 300 es
        in vec3 position;
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `;
    
    static Fragment_Shader_Source = `#version 300 es
        precision highp float;
        out vec4 outColor;
        void main()
        {
            outColor = vec4(1, 0, 0, 1);
        }
    `;

    /**
     * @param {WebGL2RenderingContext} gl 
     */
    constructor(gl)
    {
        super(gl, FixedColorWithoutTransform.AttributesModel, {}, FixedColorWithoutTransform.Vertex_Shader_Source, FixedColorWithoutTransform.Fragment_Shader_Source);
    }
}
