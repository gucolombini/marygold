precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform sampler2D tDiffuse;

varying vec2 fragCoord;

void main() {
    // Get pixel coordinates
    vec2 uv = fragCoord;
    
    // Basic wave effect
    float wave = sin(uv.y * 20.0 + time * 2.0) * 0.01;
    uv.x += wave;
    
    // Color shift effect based on time
    float r = texture2D(tDiffuse, uv).r;
    float g = texture2D(tDiffuse, uv + vec2(sin(time * 0.5) * 0.01, 0.0)).g;
    float b = texture2D(tDiffuse, uv + vec2(sin(time * 0.3) * 0.01, 0.0)).b;
    
    // Output color
    gl_FragColor = vec4(r, g, b, 1.0);
}