// @ts-check
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
export class GltfModelLoader
{
    constructor()
    {
        this.loader = new GLTFLoader();
    }

    /**
     * @param {string} model_name 
     * @returns {Promise<import("three/examples/jsm/loaders/GLTFLoader.js").GLTF>}
     */
    async load(model_name)
    {
        return new Promise(resolve => this.loader.load(`assets/models/${model_name}`, model => resolve(model)));
    }

    async loadPalm()
    {
        let gltf = await this.load('palm_trees/scene.gltf');
        /** @type {THREE.Mesh} */// @ts-ignore
        let bark = gltf.scene.getObjectByName('Bark_1_Bark_1_0');
        bark.geometry.scale(0.1, 0.1, 0.1);
        bark.geometry.rotateX(Math.PI * -0.5);
        /** @type {THREE.Object3D} */// @ts-ignore
        let leaf_object = gltf.scene.getObjectByName('Leaf_1');
        /** @type {THREE.Mesh[]} */// @ts-ignore
        let leaf = leaf_object.children;
        leaf.forEach(mesh => mesh.geometry.translate(leaf_object.position.x, leaf_object.position.y, leaf_object.position.z));
        leaf.forEach(mesh => mesh.geometry.scale(0.1, 0.1, 0.1));
        leaf.forEach(mesh => mesh.geometry.rotateX(Math.PI * -0.5));
        return { bark, leaf };
    }
    
    /**
     * @param {number} count 
     */
    async loadPalmAsInstancedMesh(count)
    {
        let palm = await this.loadPalm();
        let bark = new THREE.InstancedMesh(palm.bark.geometry, palm.bark.material, count);
        let leaf = palm.leaf.map(mesh => new THREE.InstancedMesh(mesh.geometry, mesh.material, count));
        return { bark, leaf };
    }
}