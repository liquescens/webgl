
float hash(vec2 p)
{
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 83758.5453123);
}

float noise(in vec2 p)
{
    vec2 i = floor(p);
    vec2 f = fract(p);

    // bteitler: This is equivalent to the "smoothstep" interpolation function.
    // This is a smooth wave function with input between 0 and 1
    // (since it is taking the fractional part of <p>) and gives an output
    // between 0 and 1 that behaves and looks like a wave.  This is far from obvious, but we can graph it to see
    // Wolfram link: http://www.wolframalpha.com/input/?i=plot+x*x*%283.0-2.0*x%29+from+x%3D0+to+1
    // This is used to interpolate between random points.  Any smooth wave function that ramps up from 0 and
    // and hit 1.0 over the domain 0 to 1 would work.  For instance, sin(f * PI / 2.0) gives similar visuals.
    // This function is nice however because it does not require an expensive sine calculation.
    vec2 u = f * f * (3.0 - 2.0 * f);

    // bteitler: This very confusing looking mish-mash is simply pulling deterministic random values (between 0 and 1)
    // for 4 corners of the grid square that <p> is inside, and doing 2D interpolation using the <u> function
    // (remember it looks like a nice wave!) 
    // The grid square has points defined at integer boundaries.  For example, if <p> is (4.3, 2.1), we will 
    // evaluate at points (4, 2), (5, 2), (4, 3), (5, 3), and then interpolate x using u(.3) and y using u(.1).
    float m1 = mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x);
    float m2 = mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x);
    // return -1.0 + 2.0 * mix(m1, m2, u.y);
    return mix(m1, m2, u.y);
}

float wave(vec2 uv, float choppy)
{
    return sin(uv.x) * cos(uv.y);

    // uv += noise(uv);

    // vec2 wv = 1.0 - abs(sin(uv));
    // vec2 swv = abs(cos(uv));
    // wv = mix(wv, swv, wv);
    // return wv.x * wv.y;

    // bteitler: Finally, compose both of the wave functions for X and Y channels into a final 
    // 1D height value, shaping it a bit along the way.  First, there is the composition (multiplication) of
    // the wave functions: wv.x * wv.y.  Wolfram will give us a cute 2D height graph for this!:
    // http://www.wolframalpha.com/input/?i=%7BAbs%5BCos%5Bx%5D%5D+%2B+Abs%5BCos%5Bx%5D%5D+%28%281.+-+Abs%5BSin%5Bx%5D%5D%29+-+Abs%5BCos%5Bx%5D%5D%29%7D+*+%7BAbs%5BCos%5By%5D%5D+%2B+Abs%5BCos%5By%5D%5D+%28%281.+-+Abs%5BSin%5By%5D%5D%29+-+Abs%5BCos%5By%5D%5D%29%7D
    // Next, we reshape the 2D wave function by exponentiation: (wv.x * wv.y)^0.65.  This slightly rounds the base of the wave:
    // http://www.wolframalpha.com/input/?i=%7B%7BAbs%5BCos%5Bx%5D%5D+%2B+Abs%5BCos%5Bx%5D%5D+%28%281.+-+Abs%5BSin%5Bx%5D%5D%29+-+Abs%5BCos%5Bx%5D%5D%29%7D+*+%7BAbs%5BCos%5By%5D%5D+%2B+Abs%5BCos%5By%5D%5D+%28%281.+-+Abs%5BSin%5By%5D%5D%29+-+Abs%5BCos%5By%5D%5D%29%7D%7D%5E0.65
    // one last final transform (with choppy = 4) results in this which resembles a recognizable ocean wave shape in 2D:
    // http://www.wolframalpha.com/input/?i=%7B1-%7B%7B%7BAbs%5BCos%5Bx%5D%5D+%2B+Abs%5BCos%5Bx%5D%5D+%28%281.+-+Abs%5BSin%5Bx%5D%5D%29+-+Abs%5BCos%5Bx%5D%5D%29%7D+*+%7BAbs%5BCos%5By%5D%5D+%2B+Abs%5BCos%5By%5D%5D+%28%281.+-+Abs%5BSin%5By%5D%5D%29+-+Abs%5BCos%5By%5D%5D%29%7D%7D%5E0.65%7D%7D%5E4
    // Note that this function is called with a specific frequency multiplier which will stretch out the wave.  Here is the graph
    // with the base frequency used by map and map_detailed (0.16):
    // http://www.wolframalpha.com/input/?i=%7B1-%7B%7B%7BAbs%5BCos%5B0.16x%5D%5D+%2B+Abs%5BCos%5B0.16x%5D%5D+%28%281.+-+Abs%5BSin%5B0.16x%5D%5D%29+-+Abs%5BCos%5B0.16x%5D%5D%29%7D+*+%7BAbs%5BCos%5B0.16y%5D%5D+%2B+Abs%5BCos%5B0.16y%5D%5D+%28%281.+-+Abs%5BSin%5B0.16y%5D%5D%29+-+Abs%5BCos%5B0.16y%5D%5D%29%7D%7D%5E0.65%7D%7D%5E4+from+-20+to+20
    // return pow(1.0-pow(wv.x * wv.y,0.65),choppy);
}

vec3 waveNormal(vec2 uv, float choppy)
{
    // float dx = cos(uv.x);
    // float dxy = max(0.0, sin(uv.x));
    
    // float dz = -sin(uv.y);
    // float dzy = cos(uv.y);

    // return vec3(dx, dxy, 0.0);
    // // return vec3(dx, dxy + dzy, dz) * 0.5;

    // vec3 a = vec3(uv.x, wave(uv, choppy), uv.y);
    // vec2 uv2 = uv + vec2(0.001, 0.001);
    // vec3 b = vec3(uv2.x, wave(uv2, choppy), uv2.y);
    // return normalize(a - b);

    vec3 n;
    float eps = 0.00001;
    float h = wave(uv, choppy);
    n.x = wave(vec2(uv.x + eps, uv.y), choppy) - h;
    n.z = wave(vec2(uv.x, uv.y + eps), choppy) - h;
    n.y = h;
    return normalize(n);
}