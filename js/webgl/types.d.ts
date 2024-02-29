
interface Program<T extends AttributeVec2 | AttributeVec3>
{
    attribute_locations: Record<keyof T, number>;
}

interface GenericClass1<T>
{
    get property(): T;
}

type AttributeVec2 = { name: string, type: 'vec2' }
type AttributeVec3 = { name: string, type: 'vec3' }


type AttributeModel1 = { position: 'vec3' }