#version 300 es
 
// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_texposition;
in vec2 a_position;
in vec2 a_texCoord;
in float a_rotation;
uniform vec2 u_resolution;
out vec2 v_texCoord;
// all shaders have a main function
void main() {
    float s = sin(a_rotation * 3.14/180.0);
    float c = cos(a_rotation * 3.14/180.0);
    mat3 rotationalMatrix = mat3(
        c, s, 0.0,
        -s, c, 0.0,
        0.0, 0.0, 1.0
    );
    mat3 positionalMatrix = mat3(
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        a_position.x, a_position.y, 1.0 
    );
    vec2 position = vec2(positionalMatrix * rotationalMatrix * vec3(a_texposition.x, a_texposition.y, 1.0));
    // convert the position from pixels to 0.0 to 1.0
    vec2 zeroToOne = position / u_resolution;
    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;
    // convert from 0->2 to -1->+1 (clipspace)
    vec2 clipSpace = zeroToTwo - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0.0, 1);
    v_texCoord = a_texCoord;
}