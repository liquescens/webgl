// @ts-check
import { WebGL2Program } from "../WebGL2Program.js";
/**
 * @extends {WebGL2Program<typeof TextureWithoutTransform.AttributesModel, {}>}
 */
export class TextureWithoutTransform extends WebGL2Program
{
    /** @type {{ position: 'vec3', uv: 'vec2' }} */
    static AttributesModel = { position: 'vec3', uv: 'vec2' };

    static Vertex_Shader_Source = `#version 300 es
        in vec3 position;
        in vec2 uv;
        out vec2 out_uv;
        void main()
        {
            out_uv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `;
    
    static Fragment_Shader_Source = `#version 300 es
        precision highp float;
        uniform sampler2D Texture;
        in vec2 out_uv;
        out vec4 out_color;
        void main()
        {
            out_color = texture(Texture, out_uv.yx * 2.0);
            // out_color = vec4(out_uv.x, 1, out_uv.y, 1);
        }
    `;

    /**
     * @param {WebGL2RenderingContext} gl 
     */
    constructor(gl)
    {
        super(gl, TextureWithoutTransform.AttributesModel, {}, TextureWithoutTransform.Vertex_Shader_Source, TextureWithoutTransform.Fragment_Shader_Source);
    }
}
