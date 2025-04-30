precision mediump float;

uniform float     time;
uniform vec2      resolution;

void main( void ) {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    float color = 0.5 + 0.5 * sin(time + uv.x * 10.0);
    gl_FragColor = vec4(vec3(color), 1.0);
}