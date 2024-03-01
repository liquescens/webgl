// @ts-check
/**
 * @abstract
 * @template TAttributesModel
 * @template TUniformsModel
 */
export class ShaderProgram
{
    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {string} vertex_shader_source 
     * @param {string} fragment_shader_source 
     * @param {string[]} [transform_feedback_varyings]
     */
    static compileProgram(gl, vertex_shader_source, fragment_shader_source, transform_feedback_varyings)
    {
        let vertex_shader = ShaderProgram.compileShader(gl, vertex_shader_source, gl.VERTEX_SHADER);
        let fragment_shader = ShaderProgram.compileShader(gl, fragment_shader_source, gl.FRAGMENT_SHADER);
        let program = gl.createProgram();
        if (!program) throw new Error("WebGPU not supported on this browser.");
        gl.attachShader(program, vertex_shader);
        gl.attachShader(program, fragment_shader);
        if (transform_feedback_varyings) gl.transformFeedbackVaryings(program, transform_feedback_varyings, gl.SEPARATE_ATTRIBS); // INTERLEAVED_ATTRIBS
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        {
            console.error(gl.getProgramInfoLog(program));
            console.error(gl.getShaderInfoLog(vertex_shader));
            console.error(gl.getShaderInfoLog(fragment_shader));
        }

        return program;
    }

    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {string} source 
     * @param {number} type 
     */
    static compileShader(gl, source, type)
    {
        let shader = gl.createShader(type);
        if (!shader) throw new Error("WebGPU not supported on this browser.");
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    }

    /**
     * @param {WebGL2RenderingContext} context 
     * @param {TAttributesModel} attributes_model 
     * @param {TUniformsModel} uniforms_model 
     * @param {string} vertex_shader_source 
     * @param {string} fragment_shader_source 
     * @param {string[]} [transform_feedback_varyings]
     */
    constructor(context, attributes_model, uniforms_model, vertex_shader_source, fragment_shader_source, transform_feedback_varyings)
    {
        this.context = context;
        this.attributes_model = attributes_model;
        this.handle = ShaderProgram.compileProgram(context, vertex_shader_source, fragment_shader_source, transform_feedback_varyings);
        /** @type {Record<keyof TAttributesModel, number>} */
        // @ts-ignore
        this.attribute_locations = Object.fromEntries(Object.keys(attributes_model).map(name => [name, context.getAttribLocation(this.handle, name)]));
        /** @type {Record<keyof TUniformsModel, number>} */
        // @ts-ignore
        this.uniform_locations = Object.fromEntries(Object.keys(uniforms_model).map(name => [name, context.getUniformLocation(this.handle, name)]));
    }
}