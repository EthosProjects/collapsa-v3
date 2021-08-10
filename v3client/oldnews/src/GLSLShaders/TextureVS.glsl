attribute vec3 aSquareVertexPosition;  // Expects one vertex position
attribute vec2 aTextureCoordinate;
varying vec2 vTexCoord;
// to transform the vertex position
uniform mat4 uModelTransform;
uniform mat4 uViewProjTransform;
void main(void) {
    gl_Position = uViewProjTransform * uModelTransform * vec4(aSquareVertexPosition, 1.0);
    vTexCoord = aTextureCoordinate;
}