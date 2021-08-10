#version 300 es
precision mediump float; // precision for floating point computation

// The object that fetches data from texture.
// Must be set outside the shader.
uniform sampler2D u_sampler;

// Color of pixel
uniform vec4 u_pixelColor;

// The "varying" keyword is for signifing that the texture coordinate will be
// interpolated and thus varies.
out vec4 pixelColor;
in vec2 texCoord;
void main(void)  {
    // texel color look up based on interpolated UV value in texCoord
    vec4 c = texture(u_sampler, vec2(texCoord.s, texCoord.t));
    // tint the textured area. Leave transparent area as defined by the texture
    vec3 r = vec3(c) * (1.0-u_pixelColor.a) + vec3(u_pixelColor) * u_pixelColor.a;
    vec4 result = vec4(r, c.a);
    pixelColor = result;
}
