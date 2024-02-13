uniform vec3 Camera;

varying vec2 vUV;
varying vec3 vFragPos;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vIntensity;

void main()
{
    vUV = uv;
    vNormal = normal;
    vPosition = position;
    vFragPos = vec3(modelViewMatrix * vec4(position, 1.0));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); 
    
    vec3 actualNormal = vec3(modelViewMatrix * vec4(normal, 0.0));
    vIntensity = pow(dot(normalize(Camera - vFragPos), actualNormal), 6.0);
}