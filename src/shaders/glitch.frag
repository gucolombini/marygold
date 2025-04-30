precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform sampler2D tDiffuse;

varying vec2 fragCoord;

// Random function
float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 uv = fragCoord;
    
    // Time-based glitch effect
    float glitchIntensity = 0.02 * (0.5 + 0.5 * sin(time * 0.1));
    
    // Create horizontal glitch lines
    float lineNoise = step(0.98, rand(vec2(time * 10.0, floor(uv.y * 100.0))));
    uv.x += lineNoise * glitchIntensity * (rand(vec2(time)) * 2.0 - 1.0);
    
    // RGB shift
    float rgbShift = 0.01 * (0.5 + 0.5 * sin(time * 0.2));
    float r = texture2D(tDiffuse, uv + vec2(rgbShift, 0.0)).r;
    float g = texture2D(tDiffuse, uv).g;
    float b = texture2D(tDiffuse, uv - vec2(rgbShift, 0.0)).b;
    
    // Block displacement
    float blockIntensity = 0.01;
    if (rand(vec2(floor(uv.y * 40.0), time * 0.5)) > 0.97) {
        uv.x += blockIntensity * (rand(vec2(time)) * 2.0 - 1.0);
    }
    
    // Add some vertical displacement occasionally
    if (rand(vec2(time * 0.2, floor(uv.x * 20.0))) > 0.99) {
        uv.y += blockIntensity * 0.5 * (rand(vec2(time * 0.2)) * 2.0 - 1.0);
    }
    
    // Final color with glitch effects
    gl_FragColor = vec4(r, g, b, 1.0);
}