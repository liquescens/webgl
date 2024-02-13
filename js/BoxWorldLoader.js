// @ts-check
import * as THREE from 'three';
import { MapCamera } from './MapCamera.js';
import { HeightMapGenerator } from './HeightMapGenerator.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export class GrassInstances
{
    /**
     * @param {THREE.InstancedMesh} mesh 
     * @param {(mesh: THREE.InstancedMesh) => void} initializer 
     */
    constructor(mesh, initializer)
    {
        this.mesh = mesh;
        this.initializer = initializer;
    }
}

export class BoxWorldLoader
{
    constructor()
    {
        this.texture_loader = new THREE.TextureLoader();
        this.gltf_loader = new GLTFLoader();
        this.fbx_loader = new FBXLoader();
        this.fbx_loader = new FBXLoader();
        this.size = 100;
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(1024, 768);
        this.scene = new THREE.Scene();
        this.height_map_generator = new HeightMapGenerator();
        this.height_map = this._createHeightMap();
        this.cast_shadows = false;
        this.receive_shadows = false;
    }

    loadSunLight()
    {
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.VSMShadowMap;
        this.cast_shadows = true;
        this.receive_shadows = true;
        let light = new THREE.DirectionalLight('#ffffff', 2);
        light.shadow.radius = 2;
        light.shadow.bias = 0;
        light.shadow.bias = -0.00005;
        light.position.set(12, 4, 14);
        light.target.position.set(20, 0, 20);
        light.target.updateMatrixWorld();
        light.castShadow = true;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        this.scene.add(light);
    }

    loadAmbientLight()
    {
        let ambient_light = new THREE.AmbientLight(0x404040, 4);
        this.scene.add(ambient_light);
    }

    /**
     * @param {THREE.InstancedMesh[]} meshes 
     */
    loadGround(meshes)
    {
        this._initializeGroundInstancedMeshesMatrices(meshes);
        meshes.forEach(mesh => this.scene.add(mesh));
    }
    
    async loadGround2Meshes()
    {
        return new Promise((resolve =>
        {
            this.gltf_loader.load('assets/models/grass_block.gltf', model =>
            {
                /** @type {THREE.Mesh[]} */
                // @ts-ignore
                let meshes = model.scene.children[0].children[0].children;
                meshes[0].geometry.scale(1 / 16, 1 / 16, 1 / 16);
                resolve(meshes.map(m => 
                {
                    let mesh = new THREE.InstancedMesh(m.geometry, m.material, this.size * this.size);
                    mesh.castShadow = this.cast_shadows;
                    mesh.receiveShadow = this.receive_shadows;
                    return mesh;
                }));
            });
        }));
    }

    /**
     * @param {THREE.InstancedMesh[]} meshes 
     */
    _initializeGroundInstancedMeshesMatrices(meshes)
    {
        meshes.forEach(mesh => this._initializeGroundInstancedMeshMatrices(mesh));
    }

    /**
     * @param {THREE.InstancedMesh} mesh
     */
    _initializeGroundInstancedMeshMatrices(mesh)
    {
        let position = new THREE.Object3D();
            
        for (let y = 0; y < this.size; y++)
        {
            for (let x = 0; x < this.size; x++)
            {
                position.position.set(x, this.height_map[x][y], y);
                position.updateMatrix();
                mesh.setMatrixAt(x + y * this.size, position.matrix);
            }
        }

        mesh.instanceMatrix.needsUpdate = true;
    }

    async loadLowPolyHouse()
    {
        return new Promise((resolve =>
        {
            let map = this.texture_loader.load('assets/models/low_poly_house/textures/Material__2_diffuse.jpeg')
            let emissive_map = this.texture_loader.load('assets/models/low_poly_house/textures/Material__2_emissive.jpeg')

            this.gltf_loader.load('assets/models/low_poly_house/scene.gltf', model =>
            {
                /** @type {THREE.Object3D} */
                // @ts-ignore
                let object = model.scene.children[0].children[0].children[1];
                object.geometry.scale(0.01, 0.01, 0.01);
                object.geometry.rotateX(Math.PI * -0.5);
                /** @type {THREE.MeshStandardMaterial} */
                let material = object.material;
                material.map = map;
                material.emissive_map;
                // let meshes = model.scene.children[0].children[0].children;
                // meshes[0].geometry.scale(1 / 16, 1 / 16, 1 / 16);
                // meshes.map(m => new THREE.InstancedMesh(m.geometry, m.material, this.size * this.size)));
                let positions = [[20, 0, 20], [20, 0, 21], [20, 0, 22], [22, 0, 20], [22, 0, 21], [22, 0, 22], [22, 0, 23], [22, 0, 19], [22, 0, 18]];
                let instanced_mesh = new THREE.InstancedMesh(object.geometry, material, positions.length);
                instanced_mesh.castShadow = this.cast_shadows;
                instanced_mesh.receiveShadow = this.receive_shadows;
                let position = new THREE.Object3D();
                positions.forEach((p, i) =>
                {
                    position.position.set(p[0], p[1], p[2]);
                    position.updateMatrix();
                    instanced_mesh.setMatrixAt(i, position.matrix);
                });
                this.scene.add(instanced_mesh);
                resolve(0);
            });
        }));
    }

    /**
     * @param {GrassInstances[]} instances_sets 
     */
    loadGrass(instances_sets)
    {
        instances_sets.forEach(instances => instances.initializer(instances.mesh));
        instances_sets.forEach(instances => this.scene.add(instances.mesh));
    }

    /**
     * @returns {Promise<GrassInstances[]>}
     */
    async loadGrassInstances()
    {
        /** @type {GrassInstances[]} */
        let items = new Array();

        for (let i = 1; i <= 13; i++)
        {
            let mesh = await this._loadGrassInstancedMeshFromFbx(`Grass${i}.fbx`, 200);
            let matrix_initializer = (/** @type {THREE.InstancedMesh} */ mesh) => this._initializeGrassInstancedMeshMatrices(mesh, -10 - i, -2);
            items.push(new GrassInstances(mesh, matrix_initializer));
        }

        for (let i = 1; i <= 7; i++)
        {
            let mesh = await this._loadGrassInstancedMeshFromFbx(`GrassBunch${i}.fbx`, 500);
            let matrix_initializer = (/** @type {THREE.InstancedMesh} */ mesh) => this._initializeGrassInstancedMeshMatrices(mesh, -50 - i, 0.4);
            items.push(new GrassInstances(mesh, matrix_initializer));
        }

        return items;
    }

    /**
     * @param {THREE.InstancedMesh} mesh
     * @param {number} perlin_z
     * @param {number} noise_threshold
     */
    _initializeGrassInstancedMeshMatrices(mesh, perlin_z, noise_threshold)
    {
        let height_map_generator = this.height_map_generator;
        let noise;

        /**
         * @param {number} x 
         * @param {number} y 
         * @returns 
         */
        function condition(x, y)
        {
            noise = height_map_generator.perlin.noise(x * 0.05, y * 0.05, perlin_z);
            if (noise < noise_threshold) return;
            height = height_map_generator.generateHeight(x, y);
            // if (height < -9) return;
            return height;
        }

        let position = new THREE.Object3D();
        let x = 0, y = 0, height = undefined;
            
        for (let i = 0; i < mesh.count; i++)
        {
            while (true)
            {
                x = Math.random() * this.size;
                y = Math.random() * this.size;
                height = condition(x, y);
                if (height !== undefined) break;
            }

            // this.height_map_generator.generateHeight(Math.floor(x), Math.floor(y))
            position.scale.set(1, 1, 1 + Math.random() * 0.5);
            position.rotateY(Math.PI * 2 * Math.random());
            position.position.set(x, this._getHeight(x, y), y);
            position.updateMatrix();
            mesh.setMatrixAt(i, position.matrix);
        }

        mesh.instanceMatrix.needsUpdate = true;
    }

    /**
     * @returns {number[][]}
     */
    _createHeightMap()
    {
        let map = new Array();

        for (let y = 0; y < this.size; y++)
        {
            let map_row = new Array();

            for (let x = 0; x < this.size; x++)
            {
                map_row.push(Math.floor(this.height_map_generator.generateHeight(x, y)));
            }

            map.push(map_row);
        }

        return map;
    }
    
    /**
     * @param {string} model_name 
     * @param {number} count 
     * @returns {Promise<THREE.InstancedMesh>}
     */
    async _loadGrassInstancedMeshFromFbx(model_name, count)
    {
        return new Promise((resolve =>
        {
            let material = new THREE.MeshPhongMaterial({ color: '#227733' })

            this.fbx_loader.load(`assets/models/${model_name}`, model =>
            {
                /** @type {THREE.Mesh} */
                // @ts-ignore
                let object = model.children[0];
                object.geometry.rotateX(Math.PI * -0.5);
                // model.children[0].geometry.scale(0.2, 0.2, 0.2);
                object.geometry.translate(0, 1, 0);
                let mesh = new THREE.InstancedMesh(object.geometry, material, count);
                mesh.castShadow = this.cast_shadows;
                mesh.receiveShadow = this.receive_shadows;
                resolve(mesh);
            });
        }));
    }

    _createGround1()
    {
        let texture = this.texture_loader.load('assets/models/All_blocks.png');
        // texture.magFilter = THREE.NearestFilter;
        // texture.minFilter = THREE.NearestFilter;
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        texture.colorSpace = THREE.SRGBColorSpace;
        let geometry = new THREE.BoxGeometry();
        
        // geometry.scale(1.1, 1.1, 1.1);

        // geometry.getAttribute('uv').setXY(4, 400 / 1024, (1024 - 72) / 1024);
        // geometry.getAttribute('uv').setXY(5, 415 / 1024, (1024 - 72) / 1024);
        // geometry.getAttribute('uv').setXY(6, 400 / 1024, (1024 - 88) / 1024);
        // geometry.getAttribute('uv').setXY(7, 415 / 1024, (1024 - 88) / 1024);

        // BlocksTextureHelper.setupBoxGeometry(geometry, BlocksTextureHelper.STONE);

        // let instanced_geometry = new THREE.InstancedBufferGeometry();
        // Object.keys(geometry.attributes).forEach(attributeName => instanced_geometry.attributes[attributeName] = geometry.attributes[attributeName]);
        // instanced_geometry.index = geometry.index;
        // instanced_geometry.instanceCount = this.size * this.size;
        // const array_size = this.size * this.size * 1;
        // const arrays = [ new Float32Array(array_size) ];
        // instanced_geometry

        let uv_offsets = [];
        
        for (let i = 0; i < this.size * this.size; i++)
        {
            uv_offsets.push(400 / 1024, 70 / 1024);
        }

        geometry.setAttribute('uvOffsets', new THREE.InstancedBufferAttribute(new Float32Array(uv_offsets), 2));
        let vertex_shader = `
            varying vec3 vUv;
            void main() {
                vUv = position; 
                vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * modelViewPosition; 
            }
        `;
        let fragment_shader = `
            uniform vec3 colorA; 
            uniform vec3 colorB; 
            varying vec3 vUv;
            void main() { gl_FragColor = vec4(mix(colorA, colorB, vUv.z), 1.0); }
        `;
        let uniforms = {
            colorB: {type: 'vec3', value: new THREE.Color(0xACB6E5)},
            colorA: {type: 'vec3', value: new THREE.Color(0x74ebd5)}
        };
        // let material = new THREE.ShaderMaterial({ uniforms, vertexShader: vertex_shader, fragmentShader: fragment_shader });
        let material = new THREE.MeshPhongMaterial({ map: texture });
        // material.onBeforeCompile = shader =>
        // {
        //     let fragment_shader = shader.fragmentShader;
        // //     fragment_shader = fragment_shader.replace('#include <map_pars_fragment>', `#ifdef USE_MAP
        // //     varying vec2 vMapUv;
        // //     varying vec2 vUvOffsets;
        // // #endif`);
        //     fragment_shader = fragment_shader.replace('#include <map_pars_fragment>\n', `#include <map_pars_fragment>\nvarying vec2 vUvOffsets;\n`);
        //     fragment_shader = fragment_shader.replace('#include <map_fragment>', `#ifdef USE_MAP
        //     vec4 sampledDiffuseColor = texture2D( map, vMapUv + vUvOffsets );
        //     #ifdef DECODE_VIDEO_TEXTURE
        //         sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
            
        //     #endif
        //     diffuseColor *= sampledDiffuseColor;
        // #endif`);
        //     shader.fragmentShader = fragment_shader;
        // }

        return [{ geometry, material }];
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @returns {number}
     */
    _getHeight(x, y)
    {
        return this.height_map[Math.round(x < 0 ? 0 : (x >= this.size - 1 ? this.size - 1 : x))][Math.round(y < 0 ? 0 : (y >= this.size - 1 ? this.size - 1 : y))];
    }
}
