uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform vec3 LightPos;

attribute vec3 position;
attribute vec3 normal;
attribute vec3 color;

varying vec3 vFragPos;
varying vec3 vNormal;
varying vec3 vColor;

void main()
{
    vNormal = normal;
    vColor = color;
    vFragPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    // gl_Position = vec4(position, 1.0);
}