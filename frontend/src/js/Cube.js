
import {Point3} from 'frontend/src/js/Point3.js';

/* globals
	mat4: true,
	vec3: true,
	mat3: true
 */
export class Cube{

	constructor(gl, x =0, y =0, z =-1, width =1){
		this.gl = gl.gl;
		this.renderer = gl;
		this.shaderProgram = this.gl.shaderProgram;
		this.mvMatrix = mat4.create();
		this.position = new Point3(x, y, z);
		this.width = width;
		mat4.identity( this.mvMatrix );

		this.initBuffers();
		gl.addVisObject(this);
	}

	initBuffers(){
		// create new vertex buffer
		this.cubeVertexPositionBuffer = this.gl.createBuffer();

		// activate the new vertex buffer for editing
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeVertexPositionBuffer);

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

		
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

		this.cubeVertexPositionBuffer.itemSize = 3; // verts per item
		this.cubeVertexPositionBuffer.numItems = 24; // num of items

		this.cubeVertexIndexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.cubeVertexIndexBuffer);
        var cubeVertexIndices = [
            0, 1, 2,      0, 2, 3,    // Front face
            4, 5, 6,      4, 6, 7,    // Back face
            8, 9, 10,     8, 10, 11,  // Top face
            12, 13, 14,   12, 14, 15, // Bottom face
            16, 17, 18,   16, 18, 19, // Right face
            20, 21, 22,   20, 22, 23  // Left face
        ];
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), this.gl.STATIC_DRAW);
        this.cubeVertexIndexBuffer.itemSize = 1;
        this.cubeVertexIndexBuffer.numItems = 36;

        this.cubeVertexNormalBuffer = this.gl.createBuffer();
	    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeVertexNormalBuffer);
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
	      -1.0,  0.0,  0.0,
	    ];
	    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertexNormals), this.gl.STATIC_DRAW);
	    this.cubeVertexNormalBuffer.itemSize = 3;
	    this.cubeVertexNormalBuffer.numItems = 24;
	}

	setMatrixUniforms(){
		//this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
    	//this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
    	
	}

	draw(){

			this.resetMVMatrix();
			this.renderer.absToRel(this.mvMatrix);
			this.translate();
			this.scale();

			//NEW
			//this.setMatrixUniforms();

			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeVertexPositionBuffer);
			this.gl.vertexAttribPointer(this.renderer.shaderProgram.vertexPositionAttribute, this.cubeVertexPositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

			this.gl.uniformMatrix4fv(this.renderer.shaderProgram.mvMatrixUniform, false, this.mvMatrix);

			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.cubeVertexIndexBuffer);

			// -- Lighting shader --
			// 
			// Bind vertex normals to shader attribute
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeVertexNormalBuffer);
    		this.gl.vertexAttribPointer(this.renderer.shaderProgram.vertexNormalAttribute, this.cubeVertexNormalBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
    		// LightingEnabled shader uniform
    		this.gl.uniform1i(this.renderer.shaderProgram.useLightingUniform, true);
    		// Push lighting color to shader uniform
    		this.gl.uniform3f(this.renderer.shaderProgram.ambientColorUniform,1.0, 1.0, 1.0);
    		// Normalize lighting direction and pass to shader as uniform (vec3->Float32Array->uniform3fv instead 
    		// of uniform3f)
    		var lightingDirection=vec3.fromValues(-1.0, -1.0, -1.0);
    		vec3.normalize(lightingDirection, lightingDirection);
    		this.gl.uniform3fv(this.renderer.shaderProgram.lightingDirectionUniform, lightingDirection);
    		// push lighting color to shader as uniform
    		this.gl.uniform3f(this.renderer.shaderProgram.directionalColorUniform, 1.0, 1.0, 1.0);

			this.gl.drawElements(this.gl.TRIANGLES, this.cubeVertexIndexBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
	}

	resetMVMatrix(){
		mat4.identity(this.mvMatrix);
	}

	translate(){
		mat4.translate(this.mvMatrix, this.mvMatrix, vec3.fromValues(this.position.x, this.position.y, this.position.z));
	}

	scale(){
		mat4.scale(this.mvMatrix, this.mvMatrix, vec3.fromValues(this.width/2, this.width/2, this.width/2));
	}
}