// @ts-check
import * as WebGL2 from "../../../js/webgl2/index.js";
/**
 * @extends {WebGL2.ShaderProgram<typeof UpdateParticlesProgram.AttributesModel, typeof UpdateParticlesProgram.UniformsModel>}
 */
export class UpdateParticlesProgram extends WebGL2.ShaderProgram
{
    /** @type {{ position: 'vec2', velocity: 'vec2', smell: 'vec3' }} */
    static AttributesModel = { position: 'vec2', velocity: 'vec2', smell: 'vec3' };
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
        in vec3 smell;
        out vec2 outPosition;
        out vec2 outVelocity;
        #define LOOK_D 0.7853981 // 1.570796326
        const mat2 LOOK_L = mat2(cos(-LOOK_D), sin(-LOOK_D), -sin(-LOOK_D), cos(-LOOK_D));
        const mat2 LOOK_R = mat2(cos(LOOK_D), sin(LOOK_D), -sin(LOOK_D), cos(LOOK_D));
        // const float P3 = 7.0 / 768.0;
        vec3 pheromones(vec2 uv, vec2 velocity)
        {
            vec4 f1 = texture(Screen, uv + normalize(velocity * LOOK_L) * ViewingDistance);
            vec4 f2 = texture(Screen, uv + normalize(velocity * LOOK_R) * ViewingDistance);
            return vec3(f1 - f2);
        }
        void main()
        {
            vec2 scaledVelocity = VelocityScale * velocity;
            outPosition = position + scaledVelocity;
            outVelocity.x = outPosition.x < -1.0 || outPosition.x > 1.0 ? -velocity.x : velocity.x;
            outVelocity.y = outPosition.y < -1.0 || outPosition.y > 1.0 ? -velocity.y : velocity.y;
            vec2 uv = (position.xy + 1.0) * 0.5;
            // vec4 f0 = texture(Screen, uv + normalize(velocity) * ViewingDistance);
            // vec4 f1 = texture(Screen, uv + normalize(velocity * LOOK_L) * ViewingDistance);
            // vec4 f2 = texture(Screen, uv + normalize(velocity * LOOK_R) * ViewingDistance);
            // // if (f1.b > f0.b || f2.b > f0.b) outVelocity = outVelocity * (f1.b > f2.b ? RotateL : RotateR);
            // outVelocity = outVelocity * (f1.b > f2.b ? RotateL : RotateR);
            vec3 f = pheromones(uv, velocity) * smell;
            outVelocity = outVelocity * (f.b > 0.0 ? RotateL : RotateR);
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
        super(gl, UpdateParticlesProgram.AttributesModel, UpdateParticlesProgram.UniformsModel, UpdateParticlesProgram.Vertex_Shader_Source, UpdateParticlesProgram.Fragment_Shader_Source, [ 'outPosition', 'outVelocity' ]);
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