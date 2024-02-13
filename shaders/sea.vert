varying vec3 FragPos;
varying vec3 VertPos;

#include "sea-commons.vert"

void main()
{
    VertPos = position;
    VertPos.y += getHeight(position.xz, Time).y;
    FragPos = vec3(modelViewMatrix * vec4(VertPos, 1.0));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(VertPos, 1.0);
}