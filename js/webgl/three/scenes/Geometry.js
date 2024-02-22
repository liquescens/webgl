// @ts-check
import * as THREE from 'three';

export class Geometry
{
    static createTriangle()
    {
        let geometry = new THREE.BufferGeometry();
        let vertices = 
        [
            -1, -1, 0,
            0, 1, 0,
            1, -1, 0,
        ];
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        return geometry;
    }
    static createBox()
    {
        let geometry = new THREE.BufferGeometry();
        let front_v = [ [ -1, -1, -1 ], [ -1, 1, -1 ], [ 1, 1, -1 ], [ -1, -1, -1 ], [ 1, 1, -1 ], [ 1, -1, -1 ] ];
        let front_n = front_v.map(() => [ 0, 0, -1 ]);
        let front_c = front_v.map(() => [ 1, 0, 0 ]);
        let back_v = [ [ -1, 1, 1 ], [ -1, -1, 1 ], [ 1, 1, 1 ], [ -1, -1, 1 ], [ 1, 1, 1 ], [ 1, -1, 1 ] ];
        let back_n = back_v.map(() => [ 0, 0, 1 ]);
        let back_c = back_v.map(() => [ 0, 1, 0 ]);
        let top_v = [ [ -1, 1, 1 ], [ -1, 1, -1 ], [ 1, 1, -1 ], [ -1, 1, 1 ], [ 1, 1, -1 ], [ 1, 1, 1 ] ];
        let top_n = top_v.map(() => [ 0, 1, 0 ]);
        let top_c = top_v.map(() => [ 0, 0, 1 ]);
        let vertices = [ front_v, back_v, top_v ].flat().flat();
        let normals = [ front_n, back_n, top_n ].flat().flat();
        let colors = [ front_c, back_c, top_c ].flat().flat();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
        return geometry;
    }
}

export class PlaneGeometryBuilder
{
    /**
     * @param {number} width 
     * @param {number} height 
     * @param {number} width_segments 
     * @param {number} height_segments 
     */
    constructor(width, height, width_segments, height_segments)
    {
        this.width = width;
        this.height = height;
        this.width_segments = width_segments;
        this.height_segments = height_segments;
        this.buffer = new THREE.BufferGeometry();
        this.createIndexedPositionAttribute();
    }

    createIndexedPositionAttribute()
    {
        let width_segments = this.width_segments;
        let height_segments = this.height_segments;
        let vertices = [];
        let dx = this.width / width_segments;
        let dy = this.height / height_segments;
        let vy = this.height * -0.5;

        for (let y = 0; y <= height_segments; y++)
        {
            let vx = this.width * -0.5;

            for (let x = 0; x <= width_segments; x++)
            {
                vertices.push([vx, 0, vy]);
                vx += dx;
            }

            vy += dy;
        }

        let indices = [];
        
        for (let y = 0; y < height_segments; y++)
        {
            for (let x = 0; x < width_segments; x++)
            {
                let i = x + y * (width_segments + 1);
                indices.push([i, i + 1, i + width_segments + 1]);
                indices.push([i + width_segments + 1, i + width_segments + 2, i + 1]);
            }
        }
        
        this.buffer.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices.flat()), 3));
        this.buffer.setIndex(indices.flat());
    }

    createNormalAttribute()
    {
        let length = (this.width_segments + 1) * (this.height_segments + 1);
        let normals = Array.from({ length }, () => [0, 1, 0]);
        this.buffer.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals.flat()), 3));
    }
}