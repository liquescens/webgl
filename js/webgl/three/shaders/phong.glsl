uniform vec3 CameraPosition;
uniform vec3 LightPosition;

vec3 phong(vec3 position, vec3 normal, vec3 color)
{
    vec3 lightColor = vec3(1.0, 1.0, 1.0);
    vec3 ambientIntensity = vec3(0.1, 0.1, 0.1);
    
    vec3 lightDirection = normalize(LightPosition - position);
    float diffuse = max(dot(normal, lightDirection), 0.0);
    
    vec3 cameraDirection = normalize(CameraPosition - position);
    float specular = pow(max(dot(reflect(-lightDirection, normal), cameraDirection), 0.0), 64.0);

    return color * (vec3(0.1, 0.1, 0.1) + diffuse * 0.8 + specular * 0.5);
}