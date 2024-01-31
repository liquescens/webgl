// @ts-check
import { ImprovedNoise } from '../node_modules/three/examples/jsm/math/ImprovedNoise.js';
export class HeightMapGenerator
{
    constructor()
    {
        this.perlin = new ImprovedNoise();
        this.components = [ [0.01, 32], [0.02, 8], [0.05, 4], [0.1, 1], [0.75, 0.1] ]; // [0.02, 8], [0.04, 4], 
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
        let generateHeight = (x, y) => this.components.map(([scale, weight], index) => this.perlin.noise(x * scale, y * scale, index) * weight).reduce((s, a) => s + a, 0);
        return Array.from({ length: width }, (_, x) => Array.from({ length: height }, (_, y) => generateHeight(x, y)));
    }
}