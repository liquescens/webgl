precision highp float;

uniform vec3 CameraPos;
uniform vec3 LightPos;
uniform float Time;

varying vec3 vFragPos;
varying vec3 vNormal;
varying vec3 vColor;

#define AMBIENT_COLOR vec3(1.0, 1.0, 1.0)
#define AMBIENT_STRENGTH 0.1
#define SPECULAR_STRENGTH 0.5

void main()
{
    vec3 lightDir = normalize(LightPos - vFragPos);
    
    vec3 ambient = AMBIENT_STRENGTH * AMBIENT_COLOR * vColor;
    
    vec3 diffuse = max(dot(vNormal, lightDir), 0.0) * AMBIENT_COLOR;

    vec3 viewDir = normalize(CameraPos - vFragPos);
    vec3 reflectDir = reflect(-lightDir, vNormal);
    vec3 specular = SPECULAR_STRENGTH * pow(max(dot(viewDir, reflectDir), 0.0), 64.0) * AMBIENT_COLOR;  

    vec3 color = (ambient + diffuse + specular) * vColor;
    gl_FragColor = vec4(color, 1.0);
}