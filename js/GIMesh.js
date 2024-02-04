// @ts-check
import * as THREE from 'three';
export class GIMesh extends THREE.Mesh
{
    /**
     * @param {*} source 
     * @returns 
     */
    copy(source)
    {
        super.copy(source);
        this.geometry = source.geometry.clone();
        return this;
    }
}