// @ts-check
import * as THREE from 'three';
export class MapCameraControls
{
    /**
     * @param {THREE.PerspectiveCamera} camera 
     * @param {THREE.WebGLRenderer} renderer 
     * @param {(x: number, y: number) => number} height_map
     */
    constructor(camera, renderer, height_map)
    {
        this._camera = camera;
        this._camera_target = new THREE.Vector3();
        this._camera_target.set(0, 0, 0);
        this._camera_direction_spherical = new THREE.Spherical();
        this._camera_direction_spherical.phi = 0.94;
        this._camera_direction_spherical.theta = -0.66;
        this._camera_direction = new THREE.Vector3();
        this._camera_position = new THREE.Vector3();
        this._camera_movement = new THREE.Spherical();
        this._camera_movement.phi = Math.PI / 2;
        this._camera_movement.theta = this._camera_direction_spherical.theta;
        this._camera_distance = 5;
        this._height_map = height_map;
        this.update();
        this._left = false;
        this._middle = false;
        this._right = false;
        renderer.domElement.addEventListener('mousedown', this._onMouseDown.bind(this));
        renderer.domElement.addEventListener('mouseup', this._onMouseUp.bind(this));
        renderer.domElement.addEventListener('mousemove', this._onMouseMove.bind(this));
        renderer.domElement.addEventListener('wheel', this._onMouseWheel.bind(this));
        renderer.domElement.addEventListener('contextmenu', event => event.preventDefault());
    }

    update()
    {
        this._camera_target.y = this._height_map(this._camera_position.x, this._camera_position.z);
        this._camera_direction.setFromSpherical(this._camera_direction_spherical);
        this._camera_position.copy(this._camera_target);
        this._camera_position.addScaledVector(this._camera_direction, this._camera_distance);
        this._camera.position.copy(this._camera_position);
        this._camera.lookAt(this._camera_target.x, this._camera_target.y, this._camera_target.z);
    }

    /**
     * 
     * @param {WheelEvent} event 
     */
    _onMouseWheel(event)
    {
        console.log(event.deltaY);
        // if (event.deltaY > 0) this._camera_distance *= event.deltaY / 90;
        // if (event.deltaY < 0) this._camera_distance /= event.deltaY / -90;
        this._camera_distance += event.deltaY / 100;
        if (this._camera_distance <= 0) this._camera_distance = 1;
        event.preventDefault();
    }

    /**
     * @param {MouseEvent} event
     */
    _onMouseDown(event)
    {
        switch (event.button)
        {
            case 0: this._left = true; break;
            case 1: this._middle = true; break;
            case 2: this._right = true; break;
        }
    }

    /**
     * @param {MouseEvent} event
     */
    _onMouseUp(event)
    {
        switch (event.button)
        {
            case 0: this._left = false; break;
            case 1: this._middle = false; break;
            case 2: this._right = false; break;
        }
    }

    /**
     * @param {MouseEvent} event
     */
    _onMouseMove(event)
    {
        if (this._left)
        {
        }
        if (this._middle)
        {
            this._camera_direction_spherical.theta -= event.movementX * 0.01;
            this._camera_direction_spherical.phi += event.movementY * -0.01;
            this._camera_movement.theta = this._camera_direction_spherical.theta;
        }
        if (this._right)
        {
            this._camera_direction.setFromSpherical(this._camera_movement);
            // this._camera_target.addScaledVector(this._camera_direction, -event.movementY * (this._camera_distance / 100));
            this._camera_target.addScaledVector(this._camera_direction, -event.movementY * 0.1);
            this._camera_movement.theta += Math.PI / 2;
            this._camera_direction.setFromSpherical(this._camera_movement);
            // this._camera_target.addScaledVector(this._camera_direction, -event.movementX * (this._camera_distance / 100));
            this._camera_target.addScaledVector(this._camera_direction, -event.movementX * 0.1);
            this._camera_movement.theta -= Math.PI / 2;
        }
    }
}