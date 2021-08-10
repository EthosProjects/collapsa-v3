#version 300 es
precision mediump float;   // sets the precision for floating point computation
uniform vec4 u_pixelColor;  // to transform the vertex position
out vec4 pixelColor;
void main(void) {
    pixelColor = u_pixelColor;
}