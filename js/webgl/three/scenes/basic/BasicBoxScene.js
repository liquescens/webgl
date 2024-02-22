// @ts-check
import * as THREE from 'three';
import { Scene } from "../Scene.js";

export class BasicBoxScene extends Scene
{
    async load()
    {
        let geometry = new THREE.BoxGeometry(1, 1, 1, 1);
        let material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, wireframe: false });
        let mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
        
        let camera = new THREE.PerspectiveCamera(75, this.renderer_size.x / this.renderer_size.y, 0.1, 1000);
        camera.position.set(0, 0, -2);
        camera.lookAt(0, 0, 0);
        
        this.render = () =>
        {
            this.renderer.render(this.scene, camera);
        }
    }
}