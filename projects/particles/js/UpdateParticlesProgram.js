// @ts-check
import * as WebGL2 from "../../../js/webgl2/index.js";
/**
 * @typedef { 'simple2' | 'simple3' | 'simple5' } MovementModel
 */
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
        #define MOVEMENT_MODEL_{movement_model}
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
        const mat2 LOOK_F = mat2(cos(0.0), sin(0.0), -sin(0.0), cos(0.0));
        const mat2 LOOK_L = mat2(cos(-LOOK_D), sin(-LOOK_D), -sin(-LOOK_D), cos(-LOOK_D));
        const mat2 LOOK_R = mat2(cos(LOOK_D), sin(LOOK_D), -sin(LOOK_D), cos(LOOK_D));
        #ifdef MOVEMENT_MODEL_SIMPLE2
        float pheromones(vec2 uv, vec2 velocity, vec3 smell)
        {
            vec4 f1 = texture(Screen, uv + normalize(velocity * LOOK_L) * ViewingDistance);
            vec4 f2 = texture(Screen, uv + normalize(velocity * LOOK_R) * ViewingDistance);
            vec3 ps = vec3(f1 - f2) * (smell * 2.0 - 1.0);
            return ps.r + ps.g + ps.b;
        }
        #endif
        #ifdef MOVEMENT_MODEL_SIMPLE3
        vec3 pheromones(vec2 uv, vec2 velocity, vec3 smell)
        {
            vec4 t0 = texture(Screen, uv + normalize(velocity) * ViewingDistance);
            vec4 t1 = texture(Screen, uv + normalize(velocity * LOOK_L) * ViewingDistance);
            vec4 t2 = texture(Screen, uv + normalize(velocity * LOOK_R) * ViewingDistance);
            vec3 p0 = vec3(t0) * (smell * 2.0 - 1.0);
            vec3 p1 = vec3(t1) * (smell * 2.0 - 1.0);
            vec3 p2 = vec3(t2) * (smell * 2.0 - 1.0);
            return vec3(p0.r + p0.g + p0.b, p1.r + p1.g + p1.b, p2.r + p2.g + p2.b);
        }
        #endif
        #ifdef MOVEMENT_MODEL_SIMPLE5
        const mat2 LOOK_L1 = mat2(cos(-LOOK_D      ), sin(-LOOK_D      ), -sin(-LOOK_D      ), cos(-LOOK_D      ));
        const mat2 LOOK_L2 = mat2(cos(-LOOK_D * 2.0), sin(-LOOK_D * 2.0), -sin(-LOOK_D * 2.0), cos(-LOOK_D * 2.0));
        const mat2 LOOK_R1 = mat2(cos( LOOK_D      ), sin( LOOK_D      ), -sin( LOOK_D      ), cos( LOOK_D      ));
        const mat2 LOOK_R2 = mat2(cos( LOOK_D * 2.0), sin( LOOK_D * 2.0), -sin( LOOK_D * 2.0), cos( LOOK_D * 2.0));
        vec2 getNewVelocity(vec2 uv, vec2 velocity, vec3 smell)
        {
            vec4 f0 = texture(Screen, uv + normalize(velocity) * ViewingDistance);
            vec4 l1 = texture(Screen, uv + normalize(velocity * LOOK_L1) * ViewingDistance);
            vec4 l2 = texture(Screen, uv + normalize(velocity * LOOK_L2) * ViewingDistance);
            vec4 r1 = texture(Screen, uv + normalize(velocity * LOOK_R1) * ViewingDistance);
            vec4 r2 = texture(Screen, uv + normalize(velocity * LOOK_R2) * ViewingDistance);
            vec3 psf0 = vec3(f0) * (smell * 2.0 - 1.0);
            vec3 psl1 = vec3(l1) * (smell * 2.0 - 1.0);
            vec3 psl2 = vec3(l2) * (smell * 2.0 - 1.0);
            vec3 psr1 = vec3(r1) * (smell * 2.0 - 1.0);
            vec3 psr2 = vec3(r2) * (smell * 2.0 - 1.0);
            float pf0 = psf0.r + psf0.g + psf0.b;
            float pl1 = psl1.r + psl1.g + psl1.b;
            float pl2 = psl2.r + psl2.g + psl2.b;
            float pr1 = psr1.r + psr1.g + psr1.b;
            float pr2 = psr2.r + psr2.g + psr2.b;
            if (pf0 > pl1 && pf0 > pl2 && pf0 > pr1 && pf0 > pr2) return velocity;
            if (pl1 > pl2 && pl1 > pr1 && pl1 > pr2) return velocity * RotateL;
            if (pl2 > pr1 && pl2 > pr2) return velocity * RotateL * RotateL;
            if (pr1 > pr2) return velocity * RotateR;
            return velocity * RotateR * RotateR;
        }
        #endif
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
            #ifdef MOVEMENT_MODEL_SIMPLE2
            float p = pheromones(uv, velocity, smell);
            outVelocity = outVelocity * (p > 0.0 ? RotateL : RotateR);
            #endif
            #ifdef MOVEMENT_MODEL_SIMPLE3
            vec3 ps = pheromones(uv, velocity, smell);
            if (ps.x < ps.y || ps.x < ps.z) outVelocity = outVelocity * (ps.y > ps.z ? RotateL : RotateR);
            #endif
            #ifdef MOVEMENT_MODEL_SIMPLE5
            outVelocity = getNewVelocity(uv, outVelocity, smell);
            #endif
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
     * @param {MovementModel} movement_model
     */
    constructor(gl, movement_model)
    {
        let vertex_shader_source = UpdateParticlesProgram.Vertex_Shader_Source.replace('{movement_model}', movement_model.toUpperCase());
        super(gl, UpdateParticlesProgram.AttributesModel, UpdateParticlesProgram.UniformsModel, vertex_shader_source, UpdateParticlesProgram.Fragment_Shader_Source, [ 'outPosition', 'outVelocity' ]);
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