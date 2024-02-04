// @ts-check
import * as THREE from 'three';
import { MapCameraControls } from './MapCameraControls.js';
export class MapCamera
{
    /**
     * @param {THREE.WebGLRenderer} renderer 
     * @param {number} aspect 
     * @param {(x: number, y: number) => number} height_map
     */
    constructor(renderer, aspect, height_map)
    {
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.controls = new MapCameraControls(this.camera, renderer, height_map);
    }
}