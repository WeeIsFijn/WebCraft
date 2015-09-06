module Webcraft {
	export class RenderService {

		private ctx : any;
		private shaderProgram : any;
		private modelVertexPositionBuffer : any;
		private modelVertexIndexBuffer : any;
		private modelVertexNormalBuffer : any;
		private pMatrix : any;
		private mvMatrix : any;

		constructor (glCanvas : HTMLCanvasElement) {
			this.ctx = new GLContext(glCanvas).get();

			this.ctx.clearColor(0.2, 1.0, 1.0, 0.5);
			this.ctx.enable(this.ctx.DEPTH_TEST);
			
			this.initialize();
		};
		
		/* TODO: Implement some kind of try-catch logic here */
		public initialize () {
			this.mvMatrix = mat4.create();
			this.initializeShaders();
			this.initializeBuffers();

			this.ctx.viewport(0, 0, this.ctx.viewportWidth, this.ctx.viewportHeight);
			this.ctx.clear(this.ctx.COLOR_BUFFER_BIT || this.ctx.DEPTH_BUFFER_BIT);
		};
		
		/* TODO: Remove shader logic from this class */
		private initializeShaders () {
			// compile shaders
			var fragmentShader =	this.readShader('shader-fs-light');
			var vertexShader = 		this.readShader('shader-vs-light');
			
			this.shaderProgram = this.ctx.createProgram();
			this.ctx.attachShader(this.shaderProgram, fragmentShader);
			this.ctx.attachShader(this.shaderProgram, vertexShader);
			this.ctx.linkProgram(this.shaderProgram);
			
			// load shaders
			this.ctx.useProgram(this.shaderProgram);
			
			// create shader attributes
			this.shaderProgram.vertexPositionAttribute = this.ctx.getAttribLocation(this.shaderProgram, 'aVertexPosition');
			this.ctx.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
			
			this.shaderProgram.vertexNormalAttribute = this.ctx.getAttribLocation(this.shaderProgram, 'aVertexNormal');
			this.ctx.enableVertexAttribArray(this.shaderProgram.vertexNormalAttribute);
			
			this.shaderProgram.pMatrixUniform 			= this.ctx.getUniformLocation(this.shaderProgram, 'uPMatrix');
			this.shaderProgram.mvMatrixUniform 			= this.ctx.getUniformLocation(this.shaderProgram, 'uMVMatrix');
			this.shaderProgram.nMatrixUniform 			= this.ctx.getUniformLocation(this.shaderProgram, "uNMatrix");
			this.shaderProgram.useLightingUniform 		= this.ctx.getUniformLocation(this.shaderProgram, "uUseLighting");
			this.shaderProgram.ambientColorUniform 		= this.ctx.getUniformLocation(this.shaderProgram, "uAmbientColor");
			this.shaderProgram.lightingDirectionUniform = this.ctx.getUniformLocation(this.shaderProgram, "uLightingDirection");
			this.shaderProgram.directionalColorUniform 	= this.ctx.getUniformLocation(this.shaderProgram, "uDirectionalColor");

			this.pMatrix = mat4.create();
		};
		
		/* TODO: Remove Buffer logic from this class */
		private initializeBuffers () {
			// create new vertex buffer
			this.modelVertexPositionBuffer = this.ctx.createBuffer();

			// activate the new vertex buffer for editing
			this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.modelVertexPositionBuffer);

			// define vertices
			var vertices = [
            // Front face
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,
            // Back face
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0, -1.0, -1.0,
            // Top face
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0, -1.0,
            // Bottom face
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,
            // Right face
             1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
             1.0, -1.0,  1.0,
            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0,
        	];

			this.ctx.bufferData(this.ctx.ARRAY_BUFFER, new Float32Array(vertices), this.ctx.STATIC_DRAW);

			this.modelVertexPositionBuffer.itemSize = 3;
			this.modelVertexPositionBuffer.numItems = 24;

			this.modelVertexIndexBuffer = this.ctx.createBuffer();

	        this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, this.modelVertexIndexBuffer);
	        var cubeVertexIndices = [
	            0, 1, 2,      0, 2, 3,    // Front face
	            4, 5, 6,      4, 6, 7,    // Back face
	            8, 9, 10,     8, 10, 11,  // Top face
	            12, 13, 14,   12, 14, 15, // Bottom face
	            16, 17, 18,   16, 18, 19, // Right face
	            20, 21, 22,   20, 22, 23  // Left face
	        ];
	        this.ctx.bufferData(this.ctx.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), this.ctx.STATIC_DRAW);
	        this.modelVertexIndexBuffer.itemSize = 1;
	        this.modelVertexIndexBuffer.numItems = 36;

	        this.modelVertexNormalBuffer = this.ctx.createBuffer();
		    this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.modelVertexNormalBuffer);
		    var vertexNormals = [
		      // Front face
		       0.0,  0.0,  1.0,
		       0.0,  0.0,  1.0,
		       0.0,  0.0,  1.0,
		       0.0,  0.0,  1.0,

		      // Back face
		       0.0,  0.0, -1.0,
		       0.0,  0.0, -1.0,
		       0.0,  0.0, -1.0,
		       0.0,  0.0, -1.0,

		      // Top face
		       0.0,  1.0,  0.0,
		       0.0,  1.0,  0.0,
		       0.0,  1.0,  0.0,
		       0.0,  1.0,  0.0,

		      // Bottom face
		       0.0, -1.0,  0.0,
		       0.0, -1.0,  0.0,
		       0.0, -1.0,  0.0,
		       0.0, -1.0,  0.0,

		      // Right face
		       1.0,  0.0,  0.0,
		       1.0,  0.0,  0.0,
		       1.0,  0.0,  0.0,
		       1.0,  0.0,  0.0,

		      // Left face
		      -1.0,  0.0,  0.0,
		      -1.0,  0.0,  0.0,
		      -1.0,  0.0,  0.0,
		      -1.0,  0.0,  0.0
		    	];
		    this.ctx.bufferData(this.ctx.ARRAY_BUFFER, new Float32Array(vertexNormals), this.ctx.STATIC_DRAW);
		    this.modelVertexNormalBuffer.itemSize = 3;
		    this.modelVertexNormalBuffer.numItems = 24;
		};
		
		private readShader (id) {
			var gl = this.ctx;
			var shaderScript = <any> document.getElementById(id);
			if (!shaderScript) {
				return null;
			}
	
			var str = '';
			var k = shaderScript.firstChild;
			while (k) {
				if (k.nodeType===3)
					str += k.textContent;
				k = k.nextSibling;
			}
	
			var shader;
			if (shaderScript.type === "x-shader/x-fragment") {
				shader = gl.createShader(gl.FRAGMENT_SHADER);
			} else if (shaderScript.type === "x-shader/x-vertex") {
				shader = gl.createShader(gl.VERTEX_SHADER);
			} else {
				return null;
			}
			console.log(str);
			gl.shaderSource(shader, str);
			gl.compileShader(shader);
		
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				alert(gl.getShaderInfoLog(shader));
				return null;
			}
		
			return shader;
		}

		setMatrixUniforms(){

		this.ctx.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
    	this.ctx.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
    	/*
    	var normalMatrix = mat3.create();
    	var invertedMatrix = mat4.create();
    	mat4.invert(invertedMatrix, this.mvMatrix);
	    mat3.fromMat4(normalMatrix, invertedMatrix);
	    mat3.transpose(normalMatrix, normalMatrix);
	    this.ctx.uniformMatrix3fv(this.shaderProgram.nMatrixUniform, false, normalMatrix);
	    */
		}

		public draw () {
			this.ctx.viewport(0, 0, this.ctx.viewportWidth, this.ctx.viewportHeight);
			this.ctx.clear(this.ctx.COLOR_BUFFER_BIT || this.ctx.DEPTH_BUFFER_BIT);

			this.ctx.useProgram(this.shaderProgram);

			this.pMatrix = mat4.perspective(this.pMatrix, 45.0, this.ctx.viewportWidth / this.ctx.viewportHeight, 0.1, 100.0);
			this.setMatrixUniforms();
			mat4.identity(this.mvMatrix);

			mat4.translate(this.mvMatrix, this.mvMatrix, vec3.fromValues(0.0, 0.0, 10.0));

    		this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.modelVertexPositionBuffer);
			
			this.ctx.vertexAttribPointer(this.ctx.getAttribLocation(this.shaderProgram, 'aVertexPosition'), 
				this.modelVertexPositionBuffer.itemSize, 
				this.ctx.FLOAT, 
				false, 
				0, 
				0);

			this.ctx.uniformMatrix4fv(this.ctx.getUniformLocation(this.shaderProgram, 'mvMatrixUniform'), false, this.mvMatrix);

			this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, this.modelVertexIndexBuffer);

			
			// -- Lighting shader --
			// 
			// Bind vertex normals to shader attribute
			this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.modelVertexNormalBuffer);

    		this.ctx.vertexAttribPointer(this.ctx.getAttribLocation(this.shaderProgram, 'aVertexNormal'), 
    			this.modelVertexNormalBuffer.itemSize, 
    			this.ctx.FLOAT, 
    			false, 
    			0, 
    			0);

    		// LightingEnabled shader uniform

    		this.ctx.uniform1i(this.ctx.getUniformLocation(this.shaderProgram, 'uUseLighting'), true);
    		// Push lighting color to shader uniform
    		this.ctx.uniform3f(this.ctx.getUniformLocation(this.shaderProgram, 'uAmbientColor'),0.2, 0.2, 0.2);
    		// Normalize lighting direction and pass to shader as uniform (vec3->Float32Array->uniform3fv instead 
    		// of uniform3f)
    		var lightingDirection=vec3.fromValues(0.5, 0.2, -0.8);
    		
    		vec3.normalize(lightingDirection, lightingDirection);
    		
    		this.ctx.uniform3fv(this.ctx.getUniformLocation(this.shaderProgram, 'uLightingDirection'), lightingDirection);
    		// push lighting color to shader as uniform
    		this.ctx.uniform3f(this.ctx.getUniformLocation(this.shaderProgram, 'uDirectionalColor'), 0.5, 0.5, 0.5);
			
			this.ctx.drawElements(this.ctx.TRIANGLES, this.modelVertexIndexBuffer.numItems, this.ctx.UNSIGNED_SHORT, 0);
		}
	}
}