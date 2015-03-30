
import {Point3} from 'frontend/src/js/Point3.js';

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
		this.squareVertexPositionBuffer = this.gl.createBuffer();

		// activate the new vertex buffer for editing
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.squareVertexPositionBuffer);

		// define vertices
		var vertices = [];

		vertices.push( this.position.x - this.width/2 );
		vertices.push( this.position.y + this.width/2 );
		vertices.push( this.position.z );

		vertices.push( this.position.x + this.width/2 );
		vertices.push( this.position.y + this.width/2 );
		vertices.push( this.position.z );

		vertices.push( this.position.x - this.width/2 );
		vertices.push( this.position.y - this.width/2 );
		vertices.push( this.position.z );

		vertices.push( this.position.x + this.width/2 );
		vertices.push( this.position.y - this.width/2 );
		vertices.push( this.position.z );

		
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

		this.squareVertexPositionBuffer.itemSize = 3; // verts per item
		this.squareVertexPositionBuffer.numItems = 4; // num of items
	}

	draw(){

			this.resetMVMatrix();
			this.translate();
			this.renderer.absToRel(this.mvMatrix);

			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.squareVertexPositionBuffer);
			this.gl.vertexAttribPointer(this.renderer.shaderProgram.vertexPositionAttribute, this.squareVertexPositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

			this.gl.uniformMatrix4fv(this.renderer.shaderProgram.mvMatrixUniform, false, this.mvMatrix);

			this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.squareVertexPositionBuffer.numItems);
	}

	resetMVMatrix(){
		mat4.identity(this.mvMatrix);
	}

	translate(){
		mat4.translate(this.mvMatrix, this.mvMatrix, vec3.fromValues(this.position.x, this.position.y, this.position.z));
	}
}