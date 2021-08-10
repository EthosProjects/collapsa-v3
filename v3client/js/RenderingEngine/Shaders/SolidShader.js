export default class SolidShader {
    constructor(vertexShaderPath, fragmentShaderPath) {
        const webgl = RenderingEngine.Core.webgl;
        // Step A: load and compile vertex and fragment shaders
        this._vertexShader = this._compileShader(vertexShaderPath, webgl.VERTEX_SHADER);
        this._fragmentShader = this._compileShader(fragmentShaderPath, webgl.FRAGMENT_SHADER);
        // Step B: Create and link the shaders into a program.
        /**
         * @type {WebGLProgram}
         */
        this._program = webgl.createProgram();
        webgl.attachShader(this._program, this._vertexShader);
        webgl.attachShader(this._program, this._fragmentShader);
        webgl.linkProgram(this._program);
        //console.log(webgl.getAttribLocation(this._program, 'a_textureCoordinate'))
        // Step C: check for error
        if (!webgl.getProgramParameter(this._program, webgl.LINK_STATUS)) throw new Error('Error linking shader');
        // Step D: Gets a reference to the a_squareVertexPosition attribute
        this._shaderVertexPositionAttribute = webgl.getAttribLocation(this._program, 'a_squareVertexPosition');
        // Step E: Activates the vertex buffer loaded in Engine.Core_VertexBuffer
        webgl.bindBuffer(webgl.ARRAY_BUFFER, RenderingEngine.VertexBuffer.renderableVertexBuffer);
        /// Step F: Describe the characteristic of the vertex position attribute
        webgl.vertexAttribPointer(
            this._shaderVertexPositionAttribute,
            3, // each element is a 3-float (x,y.z)
            webgl.FLOAT, // data type is FLOAT
            false, // if the content is normalized vectors
            0, // number of bytes to skip in between elements
            0,
        ); // offsets to the first element
        // Step G: Gets a reference to the uniform variable uPixelColor in the //     fragment shader
        /**
         * @type {WebGLUniformLocation}
         */
        this._pixelColor = webgl.getUniformLocation(this._program, 'u_pixelColor');
        /**
         * @type {WebGLUniformLocation}
         */
        this._modelTransform = webgl.getUniformLocation(this._program, 'u_modelTransform');
        /**
         * @type {WebGLUniformLocation}
         */
        this._viewProjTransform = webgl.getUniformLocation(this._program, 'u_viewProjTransform');
        //console.log(this);
    }

    /**
     * Returns a complied shader from a shader in the dom.
     * @param {string} path
     * @param {string} shaderType
     * @returns {WebGLShader}
     */
    _compileShader(path, shaderType) {
        const webgl = RenderingEngine.Core.webgl;
        let shaderSource = RenderingEngine.Resources.retrieve(path);
        let compiledShader = webgl.createShader(shaderType);
        webgl.shaderSource(compiledShader, shaderSource);
        webgl.compileShader(compiledShader);
        // Check for errors and return results (null if error)
        // The log info is how shader compilation errors are typically displayed.
        // This is useful for debugging the shaders.
        if (!webgl.getShaderParameter(compiledShader, webgl.COMPILE_STATUS)) {
            throw new Error('A shader compiling error occurred: ' + webgl.getShaderInfoLog(compiledShader));
        } else return compiledShader;
    }
    activate(pixelColor, vpMatrix) {
        const webgl = RenderingEngine.Core.webgl;
        webgl.useProgram(this._program);
        webgl.enableVertexAttribArray(this._shaderVertexPositionAttribute);
        webgl.uniform4fv(this._pixelColor, pixelColor);
        webgl.uniformMatrix4fv(this._viewProjTransform, false, vpMatrix);
    }
    /**
     * Loads per-object model transform to the vertex shader
     * @param {} modelTransform
     */
    loadObjectTransform(modelTransform) {
        const webgl = RenderingEngine.Core.webgl;
        webgl.uniformMatrix4fv(this._modelTransform, false, modelTransform);
    }
    cleanup() {
        const webgl = RenderingEngine.Core.getGL();
        webgl.detachShader(this._program, this._vertexShader);
        webgl.detachShader(this._program, this._fragmentShader);
        webgl.deleteShader(this._vertexShader);
        webgl.deleteShader(this._fragmentShader);
    }
}
