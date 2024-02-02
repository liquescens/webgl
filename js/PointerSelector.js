// @ts-check
import * as THREE from 'three';
export class PointerSelector
{
    /**
     * @param {THREE.WebGLRenderer} renderer 
     * @param {(x: number, y: number) => number} height_map 
     */
    constructor(renderer, height_map)
    {
        this._renderer = renderer;
        this._height_map = height_map;
        this._pointer_position = new THREE.Vector2();
        this._box_map_position = new THREE.Vector3();
        this._raycaster = new THREE.Raycaster();
        this._raycaster = new THREE.Raycaster();
        this.box = this._createBox();
        window.addEventListener('pointermove', this._onPointerMove.bind(this));
    }

    /**
     * @param {THREE.Camera} camera 
     * @param {THREE.Object3D} object 
     */
    update(camera, object)
    {
        this._raycaster.setFromCamera(this._pointer_position, camera);
        let intersections = this._raycaster.intersectObject(object);

        if (intersections.length > 0)
        {
            let intersection = intersections.reduce((m, v) => v.distance < m.distance ? v : m);
            let x = Math.round(intersection.point.x + 50);
            let y = Math.round(intersection.point.z + 50);
            let z = Math.round(intersection.point.y);

            if (x < 0 || x > 100 || y < 0 || y > 100) x = y = 1000;

            if (this._box_map_position.x != x || this._box_map_position.y != y)
            {
                this._box_map_position.set(x, y, z);
                this._updateBoxPosition();
            }
        }
    }

    _createBox()
    {
        let box_geometry = new THREE.BoxGeometry(1, 1, 1);
        box_geometry.translate(0, 0.5, 0);
        let box_material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 }); 
        return new THREE.Mesh(box_geometry, box_material);
    }

    _updateBoxPosition()
    {
        // let height = this._box_map_position.x == 1000 ? 0 : this._height_map(this._box_map_position.x, this._box_map_position.y);
        let height = this._box_map_position.z;
        this.box.position.set(this._box_map_position.x - 50, height, this._box_map_position.y - 50);
    }

    /**
     * @param {PointerEvent} event 
     */
    _onPointerMove(event)
    {
        this._pointer_position.x = (event.clientX / this._renderer.domElement.clientWidth) * 2 - 1;
        this._pointer_position.y = (event.clientY / this._renderer.domElement.clientHeight) * -2 + 1;
    }
}