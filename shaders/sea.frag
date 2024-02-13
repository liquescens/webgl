// varying float vColor;
varying vec3 FragPos;
varying vec3 VertPos;

#include "sea-commons.vert"

void main()
{
    vec3 color = getColor(VertPos.xz, Time);
	gl_FragColor = vec4(pow(color, vec3(0.65)), 0.9);
    // gl_FragColor = vec4(1.0, noise(vFragPos.xz), 0.0, 1.0);
}