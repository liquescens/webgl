// @ts-check
import * as THREE from 'three';
import { Scene } from "../Scene.js";
import { PlaneGeometryBuilder } from '../Geometry.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

export class BasicTerrainScene extends Scene
{
    async load()
    {
        let { camera, camera_controls } = this._createOrbitCamera({ position: new THREE.Vector3(0, 0, -3) });
        let geometry = this._createGeometry();
        let light_pos = new THREE.Vector3().set(50, 50, 50);
        let uniforms =
        {
            CameraPos: { value: camera.position },
            LightPos: { value: light_pos },
            Time: { value: 1 },
        };
        let shaders = 
        { 
            vertexShader: await this._loadShaderSource('js/webgl/three/scenes/terrain/BasicTerrainSceneVertex.glsl'),
            fragmentShader: await this._loadShaderSource('js/webgl/three/scenes/terrain/BasicTerrainSceneFragment.glsl'),
        };
        let material = new THREE.RawShaderMaterial({ ...shaders, uniforms, side: THREE.DoubleSide, wireframe: false });
        let mesh = new THREE.Mesh(geometry.buffer, material);
        this.scene.add(mesh);
        this.render = () =>
        {
            material.uniforms.Time.value += 0.001;
            camera_controls.update();
            this.renderer.render(this.scene, camera);
        }
        
        let gui = new GUI();
        let seaFolder = gui.addFolder('Sea');
        seaFolder.add(material, 'wireframe').name('Wireframe');
    }

    _createGeometry()
    {
        let geometry_builder = new PlaneGeometryBuilder(10, 10, 500, 500);
        // geometry_builder.createNormalAttribute();
        // let position = geometry_builder.buffer.getAttribute('position');
        // let i = 0;

        // for (let y = 0; y <= 100; y++)
        // {
        //     for (let x = 0; x <= 100; x++)
        //     {
        //         // position.setY(i, Math.random());
        //         i++;
        //     }
        // }
        return geometry_builder;
    }
}