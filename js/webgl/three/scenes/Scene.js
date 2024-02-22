// @ts-check
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class Scene
{
    constructor()
    {
        this.renderer_size = new THREE.Vector2(1024, 768);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.renderer_size.x, this.renderer_size.y);
        this.scene = new THREE.Scene();
        /** @type {Map<string, string>} */
        this._loaded_shader_sources = new Map();
    }
    
    render()
    {
    }

    animate()
    {
        /** @type {(time: DOMHighResTimeStamp) => void} */
        const animate = time =>
        {
            requestAnimationFrame(animate);
            this.render();
        }
        
        requestAnimationFrame(animate);
    }

    /**
     * @param {{ position: THREE.Vector3Like }} param0 
     */
    _createOrbitCamera({ position })
    {
        let camera = new THREE.PerspectiveCamera(75, this.renderer_size.x / this.renderer_size.y, 0.1, 1000);
        camera.position.copy(position);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
        let camera_controls = new OrbitControls(camera, this.renderer.domElement);
        return { camera, camera_controls };
    }
    
    /**
     * @param {string} url 
     * @return {Promise<string>}
     */
    async _loadShaderSource(url)
    {
        let source = await this._loadShaderSourceRaw(url);
        let pattern = /#include "(.*)"/g;
        let includes = await Promise.all([...source.matchAll(pattern)].map(async ([_, url]) => await this._loadShaderSourceRaw(url)));
        let i = 0;
        return source.replaceAll(pattern, includes[i++]);
    }

    /**
     * @param {string} url 
     * @return {Promise<string>}
     */
    async _loadShaderSourceRaw(url)
    {
        let source = this._loaded_shader_sources.get(url);
        if (source) return source;
        this._loaded_shader_sources.set(url, source = await (await fetch(url)).text());
        return source;
    }
}