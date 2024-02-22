// @ts-check
import * as THREE from 'three';
import { Scene } from "../Scene.js";
import { Geometry } from '../Geometry.js';

export class BasicShaderScene extends Scene
{
    async load()
    {
        let { camera, camera_controls } = this._createOrbitCamera({ position: new THREE.Vector3(0, 0, -3) });
        let geometry = Geometry.createBox();
        let light_pos = new THREE.Vector3();
        let uniforms =
        {
            CameraPos: { value: camera.position },
            LightPos: { value: light_pos },
        };
        let shaders = 
        { 
            vertexShader: await (await fetch('js/webgl/three/scenes/basic/BasicShaderSceneVertex.glsl')).text(),
            fragmentShader: await (await fetch('js/webgl/three/scenes/basic/BasicShaderSceneFragment.glsl')).text(),
        };
        let material = new THREE.RawShaderMaterial({ ...shaders, uniforms, side: THREE.DoubleSide, wireframe: false });
        let mesh = new THREE.Mesh(geometry, material);
        let time = 1;
        this.scene.add(mesh);
        this.render = () =>
        {
            time += 0.001;
            camera_controls.update();
            material.uniforms.CameraPos.value = camera.position;
            material.uniforms.LightPos.value = light_pos.set(Math.sin(time) * 3, Math.sin(time) * 7, Math.cos(time) * 5);
            this.renderer.render(this.scene, camera);
        }
    }
}