// @ts-check
import * as THREE from 'three';
export class InstancedObject
{
    /**
     * @param {THREE.Group} group
     * @param {string} name
     * @param {number} count 
     * @param {(x: number, y: number) => number | undefined} condition 
     */
    constructor(group, name, count, condition)
    {
        this.object = group.getObjectByName(name);
        if (!this.object) throw "";
        this.meshes = this.object.children.map(base_mesh => this._createInstancedMesh(base_mesh, count));
        let map_x = 0, map_y = 0, map_height;
        let instance_position = new THREE.Object3D();

        for (let i = 0; i < count; i++)
        {
            while (true)
            {
                map_x = Math.random() * 256;
                map_y = Math.random() * 256;
                map_height = condition(map_x, map_y);
                if (map_height !== undefined) break;
            }

            instance_position.position.set(map_x - 128, map_height, map_y - 128);
            instance_position.updateMatrix();
            instance_position.rotateY(Math.PI * 2 * Math.random());
            this.meshes.forEach(mesh => mesh.setMatrixAt(i, instance_position.matrix));
        }

        this.meshes.forEach(mesh => mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage));
    }

    /**
     * @param {THREE.Mesh} base_mesh
     * @param {number} count
     * @returns {THREE.InstancedMesh}
     */
    _createInstancedMesh(base_mesh, count)
    {
        base_mesh.geometry.scale(0.2, 0.2, 0.2);
        return new THREE.InstancedMesh(base_mesh.geometry, base_mesh.material, count);
    }
}