// @ts-check
import { ImprovedNoise } from '../node_modules/three/examples/jsm/math/ImprovedNoise.js';
export class HeightMapGenerator
{
    constructor()
    {
        this.perlin = new ImprovedNoise();
        this.components = [ [0.01, 32], [0.02, 8], [0.05, 4], [0.1, 1], [0.75, 0.1] ]; // [0.02, 8], [0.04, 4], 
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
}