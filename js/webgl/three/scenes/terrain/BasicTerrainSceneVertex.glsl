uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform vec3 LightPos;
uniform float Time;

attribute vec3 position;

varying vec3 vFragPos;
varying vec3 vNormal;
varying vec3 vColor;

#include "js/webgl/three/shaders/noise.glsl"

#define EPSILON_NRM (0.1)

vec3 calculateNormal(vec2 p, float time)
{
    vec3 n;
    n.y = noise(vec3(p.x, p.y, time));    
    n.x = noise(vec3(p.x + EPSILON_NRM, p.y, time)) - n.y;
    n.z = noise(vec3(p.x, p.y + EPSILON_NRM, time)) - n.y;
    n.y = EPSILON_NRM;
    return normalize(n);
}

void main()
{
    vNormal = calculateNormal(position.xz, Time); // vec3(0.0, 1.0, 0.0); // 
    vFragPos = position;
    vFragPos.y = noise(vec3(position.x, position.z, Time));
    vColor = vec3(0.1, 0.2 + 0.5 * vFragPos.y, 0.5 + 0.3 * vFragPos.y);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vFragPos, 1.0);
    // gl_Position = vec4(position, 1.0);
}