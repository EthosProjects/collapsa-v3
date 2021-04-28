#version 300 es
 
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision lowp float;

uniform sampler2D u_image;
in vec2 v_texCoord;
// we need to declare an output for the fragment shader
out vec4 outColor;
 
void main() {
    // Just set the output to a constant reddish-purple
    vec4 o = texture(u_image, v_texCoord);
    outColor = texture(u_image, v_texCoord);
}