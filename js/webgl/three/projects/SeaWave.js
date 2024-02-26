// @ts-check
import * as THREE from 'three';
import { Project } from './Project.js';
import { PlaneGeometryBuilder } from '../scenes/Geometry.js';

export class SeaWave extends Project
{
    constructor()
    {
        super();
    }

    async run()
    {
        const { animate, renderer, camera } = await this._initialize();

        let scene = new THREE.Scene();

        let light_position = new THREE.Vector3(20.0, 50.0, 53.0);
        let sea = await this.loadSea(camera, light_position);
        sea.mesh.translateX(-0.6);
        sea.mesh.translateZ(-0.6);
        scene.add(sea.mesh);

        animate(() =>
        {
            sea.mesh.material.uniforms.Time.value += 0.001;
            renderer.render(scene, camera);
        });
    }

    /**
     * @param {THREE.PerspectiveCamera} camera 
     * @param {THREE.Vector3} light_position 
     * @returns 
     */
    async loadSea(camera, light_position)
    {
        let geometry_builder = new PlaneGeometryBuilder(40, 40, 500, 500);
        geometry_builder.createIndexedPositionAttribute(0);
        let vertex_shader = `
            uniform mat4 projectionMatrix;
            uniform mat4 modelViewMatrix;
            uniform mat4 modelMatrix;
            uniform vec3 CameraPos;
            uniform float Time;
            attribute vec3 position;
            attribute vec2 uv;
            varying vec2 vUV;
            varying vec3 vVertPos;
            varying vec3 vNormal;
            varying vec3 vColor;
            #include "js/webgl/three/shaders/wave.glsl"
            void main()
            {
                vec3 tangent = vec3(0.0, 0.0, 0.0);
                vec3 binormal = vec3(0.0, 0.0, 0.0);
                vec3 vertex = position;
                vertex += wave(vec4(1.0, 1.0, 0.35, 3.0), position.xz, Time, tangent, binormal);
                vertex += wave(vec4(1.0, 0.6, 0.30, 1.55), position.xz, Time, tangent, binormal);
                vertex += wave(vec4(1.0, 1.3, 0.25, 0.9), position.xz, Time, tangent, binormal);
                // vBinormal = binormal;
                // vTangent = tangent;
                vVertPos = vec3(modelMatrix * vec4(vertex, 1.0));
                vNormal = normalize(cross(binormal, tangent));
                // vNormal = vec3(modelViewMatrix * vec4(normalize(cross(binormal, tangent)), 0.0));
                vColor = vec3(0.1, 0.3 + 0.5 * vertex.y, 0.5 + 0.2 * vertex.y);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(vertex, 1.0);
            }
        `;
        let fragment_shader = `
            precision highp float;
            uniform vec3 CameraPos;
            uniform float Time;
            varying vec2 vUV;
            varying vec3 vVertPos;
            varying vec3 vNormal;
            varying vec3 vColor;
            #include "js/webgl/three/shaders/phong.glsl"
            #include "js/webgl/three/shaders/wave.glsl"
            #include "js/webgl/three/shaders/OpenSimplex2SDerivatives.glsl"
            void main()
            {
                vec4 noise1 = snoise(vec3(vVertPos.x *  16.0, 4.0 * Time + 10.0, vVertPos.z * 16.0)) * 64.0;
                vec4 noise2 = snoise(vec3(vVertPos.x *   8.0, 8.0 * Time + 20.0, vVertPos.z *  8.0)) * 32.0;
                vec4 noise3 = snoise(vec3(vVertPos.x *  32.0, 2.0 * Time + 30.0, vVertPos.z * 32.0)) * 64.0;
                vec4 noise4 = snoise(vec3(vVertPos.x * 128.0, 1.0 * Time + 40.0, vVertPos.z * 128.0)) * 128.0;
                // vec4 noise5 = snoise(vec3(vVertPos.x * 1.0, Time + 40.0, vVertPos.z * 1.0));
                vec4 noise = normalize(noise1 + noise2 + noise3 + noise4) * 0.05; //  + noise2 + noise3 * 32.0 + noise5 * 64.0 + noise4 + 16.0
                gl_FragColor = vec4(phong(vVertPos, normalize(vNormal + noise.xyz), vColor), 1.0);
            }
        `;
        let material = new THREE.RawShaderMaterial
        ({
            uniforms:
            {
                Time: { value: 1 },
                LightPosition: { value: light_position },
                CameraPosition: { value: camera.position }
            },
            vertexShader: await this.loader._resolveShaderSourceIncludes(vertex_shader),
            fragmentShader: await this.loader._resolveShaderSourceIncludes(fragment_shader),
            side: THREE.DoubleSide,
            wireframe: false,
        });
        let mesh = new THREE.Mesh(geometry_builder.buffer, material);
        return { mesh };
    }
}