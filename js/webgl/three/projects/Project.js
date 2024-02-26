// @ts-check
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class ProjectLoader
{
    constructor()
    {
        this.texture_loader = new THREE.TextureLoader();
        /** @type {Map<string, string>} */
        this.loaded_shader_sources = new Map();
    }

    /**
     * @param {string} url 
     */
    _loadTexture(url)
    {
        let texture = this.texture_loader.load(url);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
    
    /**
     * @param {string} url 
     * @return {Promise<string>}
     */
    async _loadShaderSource(url)
    {
        return await this._resolveShaderSourceIncludes(await this._loadShaderSourceRaw(url));
    }

    /**
     * @param {string} source
     * @return {Promise<string>}
     */
    async _resolveShaderSourceIncludes(source)
    {
        let pattern = /#include "(.*)"/g;
        let includes = await Promise.all([...source.matchAll(pattern)].map(async ([_, url]) => await this._loadShaderSourceRaw(url)));
        let i = 0;
        return source.replaceAll(pattern, () => includes[i++]);
    }

    /**
     * @param {string} url 
     * @return {Promise<string>}
     */
    async _loadShaderSourceRaw(url)
    {
        let source = this.loaded_shader_sources.get(url);
        if (source) return source;
        this.loaded_shader_sources.set(url, source = await (await fetch(url)).text());
        return source;
    }
}

export class Project
{
    constructor()
    {
        this.loader = new ProjectLoader();
    }
    
    async _initialize()
    {
        let renderer_size = new THREE.Vector2(1024, 768);
        let renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(renderer_size.x, renderer_size.y);

        let camera = new THREE.PerspectiveCamera(75, renderer_size.x / renderer_size.y, 0.1, 100.0);
        camera.position.set(-0.4, 0.5, -1.0);
        let camera_controls = new OrbitControls(camera, renderer.domElement);

        document.body.appendChild(renderer.domElement); 

        const animate = (/** @type {() => void} */ render) =>
        {
            const animateFrame = () =>
            {
                requestAnimationFrame(animateFrame);
                render();
                camera_controls.update();
            }

            requestAnimationFrame(animateFrame);
        }

        return { animate, renderer_size, renderer, camera, camera_controls };
    }
}
