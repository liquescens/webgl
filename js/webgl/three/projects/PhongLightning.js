// @ts-check
import * as THREE from 'three';
import { Project, ProjectLoader } from './Project.js';

export class PhongLightning extends Project
{
    /**
     * @param {ProjectLoader} loader 
     * @param {THREE.PerspectiveCamera} camera 
     * @param {THREE.Vector3} light_position 
     */
    static async loadSphere(loader, camera, light_position)
    {
        let geometry = new THREE.SphereGeometry();
        let vertex_shader = `
            uniform mat4 projectionMatrix;
            uniform mat4 modelViewMatrix;
            uniform mat4 modelMatrix;
            attribute vec3 position;
            attribute vec3 normal;
            varying vec3 ModelPos;
            varying vec3 Normal;
            void main()
            {
                Normal = normal;
                ModelPos = vec3(modelMatrix * vec4(position, 1.0));
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
        let fragment_shader = `
            precision highp float;
            varying vec3 ModelPos;
            varying vec3 Normal;
            #include "js/webgl/three/shaders/phong.glsl"
            void main()
            {
                gl_FragColor = vec4(phong(ModelPos, normalize(Normal), vec3(0.3, 0.6, 0.9)), 1.0);
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
            vertexShader: await loader._resolveShaderSourceIncludes(vertex_shader),
            fragmentShader: await loader._resolveShaderSourceIncludes(fragment_shader),
            side: THREE.DoubleSide,
            wireframe: false,
        });
        let mesh1 = new THREE.Mesh(geometry, material);
        let mesh2 = new THREE.Mesh(geometry, material);
        mesh2.translateX(2.5);
        return { material, meshes: [ mesh1, mesh2 ] };
    }

    constructor()
    {
        super();
    }

    async run()
    {
        const { animate, renderer, camera } = await this._initialize();
        
        let light_position = new THREE.Vector3(0.0, 0.0, 3.0);
        let scene = new THREE.Scene();
        let { material, meshes } = await PhongLightning.loadSphere(this.loader, camera, light_position);
        meshes.forEach(mesh => scene.add(mesh));

        animate(() =>
        {
            renderer.render(scene, camera);
        });
    }
}