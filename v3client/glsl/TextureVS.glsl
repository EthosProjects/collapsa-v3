#version 300 es
in vec3 a_squareVertexPosition;  // Expects one vertex position
in vec2 a_textureCoordinate;
out vec2 texCoord;
// to transform the vertex position
uniform mat4 u_modelTransform;
uniform mat4 u_viewProjTransform;
void main(void) {
    gl_Position = u_viewProjTransform * u_modelTransform * vec4(a_squareVertexPosition, 1.0);
    texCoord = a_textureCoordinate;
}