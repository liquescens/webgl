// @ts-check
export class VertexArray
{
    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {import('./../ShaderProgram.js').ShaderProgram<{ position: 'vec3' }, any>} program
     * @param {[number, number, number][]} vertices
     */
    static createVertexArray3(gl, program, vertices)
    {
        let handle = gl.createVertexArray();
        gl.bindVertexArray(handle);
        let position = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, position);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices.flat()), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(program.attribute_locations.position);
        gl.vertexAttribPointer(program.attribute_locations.position, 3, gl.FLOAT, false, 0, 0);
        return { handle }
    }
}

export class VertexArrayBuilder
{
    /**
     * @param {WebGL2RenderingContext} gl 
     */
    constructor(gl)
    {
        this.gl = gl;
        this.handle = gl.createVertexArray();
    }
    /**
     * @template TAttributesModel
     * @param {Attribute3<TAttributesModel>} name
     * @param {[number, number, number][]} data 
     * @param {import('./../ShaderProgram.js').ShaderProgram<TAttributesModel, any>} program 
     */
    bindBufferWithData(name, data, program)
    {
        let gl = this.gl;
        let buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.flat()), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(program.attribute_locations[name]);
        gl.vertexAttribPointer(program.attribute_locations[name], 3, gl.FLOAT, false, 0, 0);
    }
    /**
     * @template TAttributesModel
     * @param {Attribute2<TAttributesModel>} name
     * @param {WebGLBuffer} buffer // TODO: otypować
     * @param {import('./../ShaderProgram.js').ShaderProgram<TAttributesModel, any>} program 
     */
    bindBuffer2(name, buffer, program)
    {
        let gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(program.attribute_locations[name]);
        gl.vertexAttribPointer(program.attribute_locations[name], 2, gl.FLOAT, false, 0, 0);
    }
    /**
     * @template TAttributesModel
     * @param {Attribute3<TAttributesModel>} name
     * @param {WebGLBuffer} buffer // TODO: otypować
     * @param {import('./../ShaderProgram.js').ShaderProgram<TAttributesModel, any>} program 
     */
    bindBuffer3(name, buffer, program)
    {
        let gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(program.attribute_locations[name]);
        gl.vertexAttribPointer(program.attribute_locations[name], 3, gl.FLOAT, false, 0, 0);
    }
}
