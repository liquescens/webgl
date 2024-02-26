// @ts-check
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Project } from './Project.js';

export class ProceduralWater extends Project
{
    constructor()
    {
        super();
    }

    async run()
    {
        let renderer_size = new THREE.Vector2(1024, 768);
        let renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(renderer_size.x, renderer_size.y);

        let camera = new THREE.PerspectiveCamera(75, renderer_size.x / renderer_size.y, 0.1, 3.0);
        camera.position.set(0, 1, 1.5);
        let camera_controls = new OrbitControls(camera, renderer.domElement);

        // let camera = new THREE.PerspectiveCamera(75, renderer_size.x / renderer_size.y, 0.1, 100.0);
        // camera.position.set(0, 1, 1.5);
        // camera.lookAt(0, 0, 0);

        let scene = new THREE.Scene();

        let water1 = await this.loadWater1(camera);
        water1.mesh.translateX(0.6);
        water1.mesh.translateZ(0.6);
        water1.mesh.up
        scene.add(water1.mesh);
        
        let water2 = await this.loadWater2(camera);
        water2.mesh.translateX(-0.6);
        water2.mesh.translateZ(0.6);
        scene.add(water2.mesh);
        
        let water3 = await this.loadWater3(camera);
        water3.mesh.translateX(-0.6);
        water3.mesh.translateZ(-0.6);
        scene.add(water3.mesh);

        document.body.appendChild(renderer.domElement); 

        const animate = () =>
        {
            water2.mesh.material.uniforms.Time.value += 0.01;
            water3.mesh.material.uniforms.Time.value += 0.01;
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
            camera_controls.update();
        }

        requestAnimationFrame(animate);
    }

    /**
     * @param {THREE.PerspectiveCamera} camera 
     * @returns 
     */
    async loadWater1(camera)
    {
        let vertex_shader = `
            uniform mat4 projectionMatrix;
            uniform mat4 modelViewMatrix;
            uniform mat4 modelMatrix;
            attribute vec3 position;
            attribute vec2 uv;
            varying vec2 vUV;
            varying vec3 vVertPos;
            void main()
            {
                vUV = uv;
                vVertPos = vec3(modelMatrix * vec4(position, 1.0));
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
        let fragment_shader = `
            precision highp float;
            uniform sampler2D SamplerNormal1;
            uniform vec3 CameraPos;
            varying vec2 vUV;
            varying vec3 vVertPos;
            #include "js/webgl/three/shaders/phong.glsl"
            void main()
            {
                vec4 uv = normalize(texture2D(SamplerNormal1, vUV * 2.0));
                gl_FragColor = vec4(phong(vVertPos, normalize(uv.xzy), vec3(1.0, 1.0, 1.0)), 1.0);
            }
        `;
        let material = new THREE.RawShaderMaterial
        ({
            uniforms:
            {
                CameraPos: { value: camera.position },
                SamplerNormal1: { value: this._loadTexture('js/webgl/three/scenes/terrain/Water_N_A.png') },
            },
            vertexShader: await this._resolveShaderSourceIncludes(vertex_shader),
            fragmentShader: await this._resolveShaderSourceIncludes(fragment_shader),
        });
        let geometry = new THREE.PlaneGeometry();
        geometry.rotateX(Math.PI * -0.5);
        // let material = new THREE.MeshBasicMaterial({ color: '#ffffff' });
        let mesh = new THREE.Mesh(geometry, material);
        return { mesh };
    }

    /**
     * @param {THREE.PerspectiveCamera} camera 
     * @returns 
     */
    async loadWater2(camera)
    {
        let vertex_shader = `
            uniform mat4 projectionMatrix;
            uniform mat4 modelViewMatrix;
            uniform mat4 modelMatrix;
            attribute vec3 position;
            attribute vec2 uv;
            varying vec2 vUV;
            varying vec3 vVertPos;
            void main()
            {
                vUV = uv;
                vVertPos = vec3(modelMatrix * vec4(position, 1.0));
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
        let fragment_shader = `
            precision highp float;
            uniform sampler2D SamplerNormal1;
            uniform vec3 CameraPos;
            uniform float Time;
            varying vec2 vUV;
            varying vec3 vVertPos;
            #include "js/webgl/three/shaders/phong.glsl"
            #include "js/webgl/three/shaders/snoise.glsl"
            void main()
            {
                vec3 noise1 = snoise3(vec3(vVertPos.xz * 1.0, Time * 0.25));
                vec3 noise2 = snoise3(vec3(vVertPos.xz * 4.0, Time * 0.5));
                vec3 noise3 = snoise3(vec3(vVertPos.xz * 8.0, Time * 1.0));
                gl_FragColor = vec4(phong(vVertPos, normalize(noise3), vec3(0.2, 0.6, 0.9)), 1.0);
                // gl_FragColor = vec4(snoise3(vec3(vVertPos.xz * 8.0, 1.0) * -1.0)), 1.0);
            }
        `;
        let material = new THREE.RawShaderMaterial
        ({
            uniforms:
            {
                Time: { value: 1.0 },
                CameraPos: { value: camera.position },
            },
            vertexShader: await this._resolveShaderSourceIncludes(vertex_shader),
            fragmentShader: await this._resolveShaderSourceIncludes(fragment_shader),
        });
        let geometry = new THREE.PlaneGeometry();
        geometry.rotateX(Math.PI * -0.5);
        let mesh = new THREE.Mesh(geometry, material);
        return { mesh };
    }

    /**
     * @param {THREE.PerspectiveCamera} camera 
     * @returns 
     */
    async loadWater3(camera)
    {
        let vertex_shader = `
            uniform mat4 projectionMatrix;
            uniform mat4 modelViewMatrix;
            uniform mat4 modelMatrix;
            attribute vec3 position;
            attribute vec2 uv;
            varying vec2 vUV;
            varying vec3 vVertPos;
            void main()
            {
                vUV = uv;
                vVertPos = vec3(modelMatrix * vec4(position, 1.0));
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
        let fragment_shader = `
            precision highp float;
            uniform sampler2D SamplerNormal1;
            uniform vec3 CameraPos;
            uniform float Time;
            varying vec2 vUV;
            varying vec3 vVertPos;
            #include "js/webgl/three/shaders/phong.glsl"
            // include "js/webgl/three/shaders/ocean.glsl"
            #include "js/webgl/three/shaders/OpenSimplex2SDerivatives.glsl"
            void main()
            {
                // float h = wave(vUV.xy * 16.0, 1.0);
                // vec3 normal = waveNormal(vUV.xy * 16.0, 1.0);
                // normal = vec3(0.0, abs(sin(vVertPos.x * 6.0)), cos(vVertPos.x * 6.0));
                vec4 noise1 = snoise(vec3(vUV.x * 16.0, Time, vUV.y * 16.0));
                vec4 noise2 = snoise(vec3(vUV.x * 8.0, Time + 10.0, vUV.y * 8.0));
                vec4 noise3 = snoise(vec3(vUV.x * 4.0, Time + 20.0, vUV.y * 4.0));
                vec4 noise4 = snoise(vec3(vUV.x * 32.0, Time + 30.0, vUV.y * 32.0));
                vec4 noise = noise1 + noise2 + noise3 + noise4;
                vec3 phongColor = phong(vVertPos, normalize(noise.xyz), vec3(0.3, 0.7, 0.9)); // vec3(0.3, 0.7, 0.9) vec3(h, h, h) (noise.www + 1.0) * 0.5
                // // vec3 phongColor = vec3(h, h, h);
                gl_FragColor = vec4(phongColor, 1.0);
            }
        `;
        let material = new THREE.RawShaderMaterial
        ({
            uniforms:
            {
                Time: { value: 1.0 },
                CameraPos: { value: camera.position },
            },
            vertexShader: await this._resolveShaderSourceIncludes(vertex_shader),
            fragmentShader: await this._resolveShaderSourceIncludes(fragment_shader),
        });
        let geometry = new THREE.PlaneGeometry();
        geometry.rotateX(Math.PI * -0.5);
        let mesh = new THREE.Mesh(geometry, material);
        return { mesh };
    }
}