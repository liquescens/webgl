// @ts-check
import { WebGL2Program } from "../WebGL2Program.js";
import { Geometry, WebGL2VertexArrayHelper } from "../WebGL2VertexArrayHelper.js";
import { TexturedFramebuffer } from "./BasicFramebuffer.js";
import { WebGLProject } from "./WebGLProject.js";
// count=1000000&pdf=0.97&ss=7&dca=18&vd=3.5
// count=1000000&pdf=0.99&ss=2&dca=18&vd=5.5
// count=1000000&pdf=0.99&ss=2&dca=4&vd=3
// count=1000000&pdf=0.98&ss=4&dca=8&vd=6
class Controls
{
    static Defaults = 
    {
        Count: 100000,
        Pheromone_Decay_Factor: 0.995,
        Step_Size: 1.1313131345364123,
        Direction_Change_Angle: 2, // 1313131345364123
        ViewingDistance: 4.1313131345364123
    };
    constructor()
    {
        let params = new URLSearchParams(window.location.search);
        /** @type {(name: string, default_value: number) => number} */
        let getFloatParam = (name, default_value) => 
        {
            let param_value = params.get(name);
            if (!param_value) return default_value;
            let value = Number.parseFloat(param_value);
            if (Number.isNaN(value)) return default_value;
            return value;
        }
        Controls.Defaults.Count = getFloatParam('count', Controls.Defaults.Count);
        Controls.Defaults.Pheromone_Decay_Factor = getFloatParam('pdf', Controls.Defaults.Pheromone_Decay_Factor);
        Controls.Defaults.Step_Size = getFloatParam('ss', Controls.Defaults.Step_Size);
        Controls.Defaults.Direction_Change_Angle = getFloatParam('dca', Controls.Defaults.Direction_Change_Angle);
        Controls.Defaults.ViewingDistance = getFloatParam('vd', Controls.Defaults.ViewingDistance);
        this.placeholder = document.getElementById('controls-placeholder');
        if (!this.placeholder) throw new Error();
        this.pheromone_decay_factor = this._createInputControl({ name: 'pheromone-decay-factor', title: 'Współczynnik zanikania feromonu', type: 'number', value: Controls.Defaults.Pheromone_Decay_Factor }, { step: 0.001 })
        this.step_size = this._createInputControl({ name: 'step-size', title: 'Długość kroku', type: 'number', value: Controls.Defaults.Step_Size }, { step: 0.1 });
        this.direction_change_angle = this._createInputControl({ name: 'direction-change-angle', title: 'Kąt zmiany kierunku', type: 'number', value: Controls.Defaults.Direction_Change_Angle }, { min: 0, max: 90, step: 0.1 });
        this.viewing_distance = this._createInputControl({ name: 'viewing-distance', title: 'Odległość widzenia', type: 'number', value: Controls.Defaults.ViewingDistance }, { min: 0.5, max: 50, step: 0.1 });
    }
    /**
     * @param {{ name: string, title: string, type: string, value: any }} param0 
     * @param {{}} [input_properties]
     */
    _createInputControl({ name, title, type, value }, input_properties)
    {
        let container = document.createElement('div');
        let label = container.appendChild(Object.assign(document.createElement('label'), { for: name, innerText: title }));;
        let input = container.appendChild(Object.assign(document.createElement('input'), { type, value, ...input_properties }));
        let control = { label, input, changed: true };
        input.addEventListener('change', () => control.changed = true); 
        this.placeholder.appendChild(container);
        return control;
    }
}
/**
 * @extends {WebGL2Program<typeof ParticleUpdateProgram.AttributesModel, typeof ParticleUpdateProgram.UniformsModel>}
 */
class ParticleUpdateProgram extends WebGL2Program
{
    /** @type {{ position: 'vec2', velocity: 'vec2' }} */
    static AttributesModel = { position: 'vec2', velocity: 'vec2' };
    /** @type {{ VelocityScale: 'float', ViewingDistance: 'float', RotateL: 'mat2', RotateR: 'mat2' }} */
    static UniformsModel = { VelocityScale: 'float', ViewingDistance: 'float', RotateL: 'mat2', RotateR: 'mat2' };
    static Vertex_Shader_Source = `#version 300 es
        precision mediump float;
        uniform float VelocityScale;
        uniform float ViewingDistance;
        uniform sampler2D Screen;
        uniform mat2 RotateL;
        uniform mat2 RotateR;
        in vec2 position;
        in vec2 velocity;
        out vec2 outPosition;
        out vec2 outVelocity;
        #define LOOK_D 0.7853981 // 1.570796326
        const mat2 LOOK_L = mat2(cos(-LOOK_D), sin(-LOOK_D), -sin(-LOOK_D), cos(-LOOK_D));
        const mat2 LOOK_R = mat2(cos(LOOK_D), sin(LOOK_D), -sin(LOOK_D), cos(LOOK_D));
        // const float P3 = 7.0 / 768.0;
        void main()
        {
            vec2 scaledVelocity = VelocityScale * velocity;
            outPosition = position + scaledVelocity;
            outVelocity.x = outPosition.x < -1.0 || outPosition.x > 1.0 ? -velocity.x : velocity.x;
            outVelocity.y = outPosition.y < -1.0 || outPosition.y > 1.0 ? -velocity.y : velocity.y;
            vec2 uv = (position.xy + 1.0) * 0.5;
            vec4 f0 = texture(Screen, uv + normalize(velocity) * ViewingDistance);
            vec4 f1 = texture(Screen, uv + normalize(velocity * LOOK_L) * ViewingDistance);
            vec4 f2 = texture(Screen, uv + normalize(velocity * LOOK_R) * ViewingDistance);
            // if (f1.b > f0.b || f2.b > f0.b) outVelocity = outVelocity * (f1.b > f2.b ? RotateL : RotateR);
            outVelocity = outVelocity * (f1.b > f2.b ? RotateL : RotateR);
        }
    `;
    static Fragment_Shader_Source = `#version 300 es
        precision highp float;
        out vec4 color;
        void main()
        {
        }
    `;
    /**
     * @param {WebGL2RenderingContext} gl 
     */
    constructor(gl)
    {
        super(gl, ParticleUpdateProgram.AttributesModel, ParticleUpdateProgram.UniformsModel, ParticleUpdateProgram.Vertex_Shader_Source, ParticleUpdateProgram.Fragment_Shader_Source, [ 'outPosition', 'outVelocity' ]);
    }
    /**
     * @param {number} value
     */
    set direction_change_angle(value)
    {
        value = value * Math.PI / 180;
        this.context.uniformMatrix2fv(this.uniform_locations.RotateL, false, [ Math.cos(-value), Math.sin(-value), -Math.sin(-value), Math.cos(-value) ]);
        this.context.uniformMatrix2fv(this.uniform_locations.RotateR, false, [ Math.cos(value), Math.sin(value), -Math.sin(value), Math.cos(value) ]);
    }
}
/**
 * @extends {WebGL2Program<typeof SpaceUpdateProgram.AttributesModel, {}>}
 */
class SpaceUpdateProgram extends WebGL2Program
{
    /** @type {{ position: 'vec3' }} */
    static AttributesModel = { position: 'vec3' };
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
        out vec4 color;
        void main()
        {
            color = vec4(0.0, 0.0, 1.0, 0.005);
        }
    `;
    /**
     * @param {WebGL2RenderingContext} gl 
     */
    constructor(gl)
    {
        super(gl, SpaceUpdateProgram.AttributesModel, {}, SpaceUpdateProgram.Vertex_Shader_Source, SpaceUpdateProgram.Fragment_Shader_Source);
    }
}
/**
 * @extends {WebGL2Program<typeof SpaceUpdateProgram2.AttributesModel, typeof SpaceUpdateProgram2.UniformsModel>}
 */
class SpaceUpdateProgram2 extends WebGL2Program
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

            float c1 = texture(Screen, uv + vec2(-P, -P)).b * 0.045;
            float c2 = texture(Screen, uv + vec2(0, -P)).b * 0.122;
            float c3 = texture(Screen, uv + vec2(P, -P)).b * 0.045;
            float c4 = texture(Screen, uv + vec2(-P, 0)).b * 0.122;
            float c5 = texture(Screen, uv + vec2(0, 0)).b * 0.332;
            float c6 = texture(Screen, uv + vec2(P, 0)).b * 0.122;
            float c7 = texture(Screen, uv + vec2(-P, P)).b * 0.045;
            float c8 = texture(Screen, uv + vec2(0, P)).b * 0.122;
            float c9 = texture(Screen, uv + vec2(P, P)).b * 0.045;
            float c = c1 + c2 + c3 + c4 + c5 + c6 + c7 + c8 + c9;

            color = vec4(0.0, 0.0, c * PheromoneDecayFactor, 1.0);
        }
    `;
    /**
     * @param {WebGL2RenderingContext} gl 
     */
    constructor(gl)
    {
        super(gl, SpaceUpdateProgram2.AttributesModel, SpaceUpdateProgram2.UniformsModel, SpaceUpdateProgram2.Vertex_Shader_Source, SpaceUpdateProgram2.Fragment_Shader_Source);
    }
    /**
     * @param {number} value
     */
    set pheromone_decay_factor(value)
    {
        this.context.uniform1f(this.uniform_locations.PheromoneDecayFactor, value);
    }
}
/**
 * @extends {WebGL2Program<typeof RenderProgram.AttributesModel, {}>}
 */
class RenderProgram extends WebGL2Program
{
    /** @type {{ position: 'vec3' }} */
    static AttributesModel = { position: 'vec3' };
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
export class ParticleSimulation extends WebGLProject
{
    constructor()
    {
        super();
        this.helpers = { basic: new WebGL2VertexArrayHelper() };
        this.controls = new Controls();
    }

    async run()
    {
        let gl = this.context;
        let controls = this.controls;
        let particles = this._createParticles();
        let space = new SpaceUpdateProgram(gl);
        let space2 = new SpaceUpdateProgram2(gl);
        let render = new RenderProgram(gl);
        let render_plane = WebGL2VertexArrayHelper.createVertexArray3(gl, Geometry.createRectangleVertices(), render);
        // let render_program = this._createRenderProgram();
        // let renderbuffer = gl.createRenderbuffer();
    
        // gl.blendEquation(gl.FUNC_ADD);
        // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, particles.vertex_arrays.input.buffers.framebuffer.handle);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, particles.vertex_arrays.output.buffers.framebuffer.handle);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
        function animate()
        {
            particles.update();

            gl.bindVertexArray(null);
            gl.bindTexture(gl.TEXTURE_2D, particles.vertex_arrays.input.buffers.framebuffer.texture_handle);
            gl.bindFramebuffer(gl.FRAMEBUFFER, particles.vertex_arrays.output.buffers.framebuffer.handle);
            // gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(space2.handle);
            if (controls.pheromone_decay_factor.changed) space2.pheromone_decay_factor = controls.pheromone_decay_factor.input.valueAsNumber;
            gl.bindVertexArray(render_plane.handle);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
                gl.bindTexture(gl.TEXTURE_2D, particles.vertex_arrays.output.buffers.framebuffer.texture_handle);
                gl.bindFramebuffer(gl.FRAMEBUFFER, particles.vertex_arrays.input.buffers.framebuffer.handle);
                gl.drawArrays(gl.TRIANGLES, 0, 6);
                gl.bindTexture(gl.TEXTURE_2D, particles.vertex_arrays.input.buffers.framebuffer.texture_handle);
                gl.bindFramebuffer(gl.FRAMEBUFFER, particles.vertex_arrays.output.buffers.framebuffer.handle);
                gl.drawArrays(gl.TRIANGLES, 0, 6);
                gl.bindTexture(gl.TEXTURE_2D, particles.vertex_arrays.output.buffers.framebuffer.texture_handle);
                gl.bindFramebuffer(gl.FRAMEBUFFER, particles.vertex_arrays.input.buffers.framebuffer.handle);
                gl.drawArrays(gl.TRIANGLES, 0, 6);
                gl.bindTexture(gl.TEXTURE_2D, particles.vertex_arrays.input.buffers.framebuffer.texture_handle);
                gl.bindFramebuffer(gl.FRAMEBUFFER, particles.vertex_arrays.output.buffers.framebuffer.handle);
                gl.drawArrays(gl.TRIANGLES, 0, 6);
            gl.bindVertexArray(null);
            gl.useProgram(space.handle);
            gl.bindBuffer(gl.ARRAY_BUFFER, particles.vertex_arrays.output.buffers.position);
            gl.enableVertexAttribArray(space.attribute_locations.position);
            gl.vertexAttribPointer(space.attribute_locations.position, 2, gl.FLOAT, false, 0, 0); 
            // gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.POINTS, 0, Controls.Defaults.Count);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            
            gl.bindVertexArray(render_plane.handle);
            gl.activeTexture(gl.TEXTURE0 + 0);
            gl.bindTexture(gl.TEXTURE_2D, particles.vertex_arrays.output.buffers.framebuffer.texture_handle);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            // gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(render.handle);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
    
            // gl.bindFramebuffer(gl.READ_FRAMEBUFFER, update_renderer.vertex_arrays.output.buffers.frame.handle);
            // gl.bindVertexArray(null);
            // // gl.bindVertexArray(points_array);
            // gl.bindBuffer(gl.ARRAY_BUFFER, update_renderer.vertex_arrays.output.buffers.position);
            // gl.enableVertexAttribArray(render_program.attributes.position);
            // gl.vertexAttribPointer(render_program.attributes.position, 2, gl.FLOAT, false, 0, 0);
            // gl.useProgram(render_program.handle);
            // gl.activeTexture(gl.TEXTURE0);
            // gl.bindTexture(gl.TEXTURE_2D, update_renderer.vertex_arrays.input.buffers.frame.texture);
            // gl.uniform1i(render_program.uniforms.screen, 0);
            // gl.drawArrays(gl.POINTS, 0, COUNT);
            // gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
            // gl.bindFramebuffer(gl.READ_FRAMEBUFFER, update_renderer.vertex_arrays.output.buffers.frame.handle);
            // gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
            // gl.blitFramebuffer(0, 0, 768, 768, 0, 0, 768, 768, gl.COLOR_BUFFER_BIT, gl.NEAREST);
    
            window.requestAnimationFrame(animate);
            
            // time = 0.001;
        }
        
        window.requestAnimationFrame(animate);
    }

    _createParticles()
    {
        let gl = this.context;
        let program = new ParticleUpdateProgram(gl);
        /** @type {number[]} */
        let positions = [];
        let d = (Math.PI * 2) / Controls.Defaults.Count;
        for (let i = 0, a = 0; i < Controls.Defaults.Count; i++)
        {
            positions.push(Math.sin(a) * (Math.random() * 0.5 + 0.3));
            positions.push(Math.cos(a) * (Math.random() * 0.5 + 0.3));
            a += d;
        }
        /** @type {number[]} */
        let velocities = [];
        for (let i = 0, a = 0; i < Controls.Defaults.Count; i++)
        {
            velocities.push(-Math.sin(a) * (1.0 + Math.random() * 0.21));
            velocities.push(-Math.cos(a) * (1.0 + Math.random() * 0.21));
            a += d;
        }

        function createVertexArray()
        {
            let framebuffer = new TexturedFramebuffer(gl);
            let buffers = { position: gl.createBuffer(), velocity: gl.createBuffer(), framebuffer };
            
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.velocity);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(velocities), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            let handle = gl.createVertexArray();
            gl.bindVertexArray(handle);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.enableVertexAttribArray(program.attribute_locations.position);
            gl.vertexAttribPointer(program.attribute_locations.position, 2, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.velocity);
            gl.enableVertexAttribArray(program.attribute_locations.velocity);
            gl.vertexAttribPointer(program.attribute_locations.velocity, 2, gl.FLOAT, false, 0, 0);
            gl.bindVertexArray(null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            return { handle, buffers }
        }

        let vertex_arrays = { input: createVertexArray(), output: createVertexArray() };
        let controls = this.controls;
        
        function update()
        {
            [vertex_arrays.input, vertex_arrays.output] = [vertex_arrays.output, vertex_arrays.input];

            gl.bindVertexArray(vertex_arrays.input.handle);
            // gl.bindBuffer(gl.ARRAY_BUFFER, buffers.input.position);
            // gl.enableVertexAttribArray(program.attributes.position);
            // gl.vertexAttribPointer(program.attributes.position, 2, gl.FLOAT, false, 0, 0);
            // gl.bindBuffer(gl.ARRAY_BUFFER, buffers.input.velocity);
            // gl.enableVertexAttribArray(program.attributes.velocity);
            // gl.vertexAttribPointer(program.attributes.velocity, 2, gl.FLOAT, false, 0, 0);
            // gl.activeTexture(vertex_arrays.input.buffers.frame.texture);
            gl.useProgram(program.handle);
            if (controls.step_size.changed) gl.uniform1f(program.uniform_locations.VelocityScale, (1 / 768) * controls.step_size.input.valueAsNumber);
            if (controls.viewing_distance.changed) gl.uniform1f(program.uniform_locations.ViewingDistance, (1 / 768) * controls.viewing_distance.input.valueAsNumber);
            if (controls.direction_change_angle.changed) program.direction_change_angle = controls.direction_change_angle.input.valueAsNumber;
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, vertex_arrays.output.buffers.position);
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, vertex_arrays.output.buffers.velocity);
            gl.enable(gl.RASTERIZER_DISCARD);
            gl.beginTransformFeedback(gl.POINTS);
            gl.drawArrays(gl.POINTS, 0, Controls.Defaults.Count);
            gl.endTransformFeedback();
            gl.disable(gl.RASTERIZER_DISCARD);
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, null);
        }

        return { update, program, vertex_arrays };
    }
}