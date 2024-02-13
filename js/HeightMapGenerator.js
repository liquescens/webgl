// @ts-check
import * as THREE from 'three';
import { ImprovedNoise } from '../node_modules/three/examples/jsm/math/ImprovedNoise.js';

export class HeightMapGenerator
{
    constructor()
    {
        this.perlin = new ImprovedNoise();
        this.components = [ [0.01, 32], [0.02, 8], [0.035, 4], [0.06, 2], [0.1, 1], [0.2, 0.5], [0.35, 0.2] ] //, [0.1, 1], [0.75, 0.1] ]; // [0.02, 8], [0.04, 4], 
        this.seed = 0;
    }

    /**
     * @param {number} width
     * @param {number} height
     */
    generate(width, height)
    {
        /**
         * @param {number} x 
         * @param {number} y 
         */
        return Array.from({ length: width }, (_, x) => Array.from({ length: height }, (_, y) => this.generateHeight(x, y)));
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @returns 
     */
    generateHeight(x, y)
    {
        return this.components.map(([scale, weight], index) => this.perlin.noise(x * scale, y * scale, index + this.seed) * weight).reduce((s, a) => s + a, 0);
    }

    get range()
    {
        return this.components.map(([_, weight]) => Math.sqrt(2) * weight).reduce((s, a) => s + a, 0) / 2;
    }
    

    /**
     * @param {THREE.InstancedMesh[]} model
     * @param {number} perlin_z
     * @param {number} noise_threshold
     * @param {number} height_threshold
     * @param {number} size
     */
    initializeInstancedMeshMatrices(model, perlin_z, noise_threshold, height_threshold, size)
    {
        let that = this;
        let noise;

        /**
         * @param {number} x 
         * @param {number} y 
         * @returns 
         */
        function condition(x, y)
        {
            noise = that.perlin.noise(x * 0.05, y * 0.05, perlin_z);
            if (noise < noise_threshold) return;
            height = that.generateHeight(x, y);
            if (height < height_threshold) return;
            return height;
        }

        let position = new THREE.Object3D();
        let x = 0, y = 0, height = undefined;
        let count = model[0].count;
            
        for (let i = 0; i < count; i++)
        {
            while (true)
            {
                x = Math.random() * size;
                y = Math.random() * size;
                height = condition(x, y);
                if (height !== undefined) break;
            }

            // this.height_map_generator.generateHeight(Math.floor(x), Math.floor(y))
            position.scale.set(1, 1, 1 + Math.random() * 0.5);
            position.rotateY(Math.PI * 2 * Math.random());
            position.position.set(x, height, y);
            position.updateMatrix();
            model.forEach(mesh => mesh.setMatrixAt(i, position.matrix));
        }

        model.forEach(mesh => mesh.instanceMatrix.needsUpdate = true);
    }
}