// @ts-check
import * as THREE from 'three';
import { BoxWorldLoader } from './js/BoxWorldLoader.js';
import { MapCamera } from './js/MapCamera.js';

const PROGRAM1 =
{
    vertex_shader: `void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragment_shader: `void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }`
}

const PROGRAM2 =
{
    vertex_shader: `
    attribute float color1;
    varying float vColor;
    void main() { vColor = color1; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragment_shader: `
    varying float vColor;
    void main() { gl_FragColor = vec4(1.0, vColor, 0.0, 1.0); }`
}


class World
{
    run()
    {
        const world_loader = new BoxWorldLoader();
        world_loader.loadAmbientLight();
        const world_camera = new MapCamera(world_loader.renderer, 1024 / 768, (x, y) => world_loader._getHeight(x, y));

        const vertices = new Float32Array([ -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1 ]);
        const indices = [ 2, 1, 0, 0, 3, 2 ];
        const colors = new Float32Array([ 0, 1, 1, 1, 1, 1 ]);
        const geometry = new THREE.BufferGeometry();
        geometry.setIndex(indices);
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setAttribute('color1', new THREE.BufferAttribute(colors, 1));
        const material = new THREE.ShaderMaterial({ fragmentShader: PROGRAM2.fragment_shader, vertexShader: PROGRAM2.vertex_shader });
        material.onBeforeCompile = () => { debugger };
        // const material = new THREE.MeshBasicMaterial({ color: 'white' });
        const mesh = new THREE.Mesh(geometry, material);
        world_loader.scene.add(mesh);
        
        document.body.appendChild(world_loader.renderer.domElement);

        /**
         * @param {DOMHighResTimeStamp} time 
         */
        function animate(time)
        {
            requestAnimationFrame(animate);
            world_loader.renderer.render(world_loader.scene, world_camera.camera);
            world_camera.controls.update();
        }
        
        requestAnimationFrame(animate);
    }
}

async function onWindowLoad()
{
    const world = new World();
    world.run();
}

window.addEventListener('load', onWindowLoad);