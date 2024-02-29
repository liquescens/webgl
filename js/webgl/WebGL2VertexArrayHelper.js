// @ts-check
export class Geometry
{
    /**
     * @returns {[number, number, number][]}
     */
    static createRectangleVertices()
    {
        /** @type {[number, number, number][]} */
        let triangle_1 = [[-1, -1, 0], [-1, 1, 0], [1, 1, 0]];
        /** @type {[number, number, number][]} */
        let triangle_2 = [[-1, -1, 0], [1, 1, 0], [1, -1, 0]];
        return [...triangle_1, ...triangle_2];
    }
}
export class WebGL2VertexArrayHelper
{
    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {[number, number, number][]} vertices
     * @param {import('./WebGL2Program.js').WebGL2Program<{ position: 'vec3' }, any>} program
     */
    static createVertexArray3(gl, vertices, program)
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
    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {import('./WebGL2Program.js').WebGL2Program<{ position: 'vec3' }, any>} program 
     */
    createFixedColorTriangle(gl, program)
    {
        let handle = gl.createVertexArray();
        gl.bindVertexArray(handle);
        this._createTrianglePositionBuffer(gl, program.attribute_locations.position);
        return { handle }
    }
    /**
     * @param {WebGL2RenderingContext} gl
     * @param {import('./WebGL2Program.js').WebGL2Program<{ position: 'vec3', uv: 'vec2' }, any>} program 
     */
    createTexturedTriangle(gl, program)
    {
        let handle = gl.createVertexArray();
        gl.bindVertexArray(handle);
        this._createTrianglePositionBuffer(gl, program.attribute_locations.position);
        this._createTriangleUVBuffer(gl, program.attribute_locations.uv);
        return { handle };
    }
    /**
     * @param {WebGL2RenderingContext} gl
     * @param {number} attribute_location
     * @returns 
     */
    _createTrianglePositionBuffer(gl, attribute_location)
    {
        let position = gl.createBuffer();
        let positions = [[-1, -1, 0], [0, 1, 0], [1, -1, 0]].flat();
        gl.bindBuffer(gl.ARRAY_BUFFER, position);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(attribute_location);
        gl.vertexAttribPointer(attribute_location, 3, gl.FLOAT, false, 0, 0);
    }
    /**
     * @param {WebGL2RenderingContext} gl
     * @param {number} attribute_location
     * @returns 
     */
    _createTriangleUVBuffer(gl, attribute_location)
    {
        let uv = gl.createBuffer();
        let uvs = [[0, 0], [0.5, 1], [1, 0]].flat();
        gl.bindBuffer(gl.ARRAY_BUFFER, uv);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(attribute_location);
        gl.vertexAttribPointer(attribute_location, 2, gl.FLOAT, false, 0, 0);
    }
}
