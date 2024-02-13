uniform vec3 lightPos;
uniform vec3 heights;
uniform float noiseScale;
uniform float time;

varying vec3 vFragPos;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vIntensity;

void main()
{
    vec3 norm = normalize(vNormal);
    vec3 lightDir = normalize(lightPos - vFragPos);
    float diffuse = max(dot(norm, lightDir), 0.0);
    // vec3 color_1 = vec3(0.0, 0.1, 0.6);
    // vec3 color_2 = vec3(0.0, 0.5, 0.0);
    // vec3 color_3 = vec3(0.6, 0.1, 0.0);
    vec3 color_1 = vec3(0.4, 0.5, 1.0);
    vec3 color_2 = vec3(0.4, 0.9, 0.4);
    vec3 color_3 = vec3(1.0, 0.5, 0.4);
    float h = (vPosition.y + heights.x) / (2.0 * heights.x);
    vec3 mix1 = mix(color_1, color_2, h / 0.5);
    vec3 mix2 = mix(color_2, color_3, (h - 0.5) / 0.5);
    vec3 ground = mix(mix1, mix2, step(0.5, h));
    ground = round(ground * 10.0) * 0.1;
    gl_FragColor = vec4(diffuse * ground.xyz, 1.0);
    // gl_FragColor = vec4(mix(vec3(1.0, 0.0, 0.0), diffuse * ground.xyz, vIntensity), 1.0);
}