
import {Point3} from 'frontend/src/js/Point3.js';

export class VisObject{

	constructor(gl){
		this.numberOfSamples = 80;
		this.radius = 0.2;

		this.gl = gl.gl;
		this.renderer = gl;
		this.shaderProgram = this.gl.shaderProgram;
		this.mvMatrix = mat4.create();
		this.position = new Point3();
		mat4.identity( this.mvMatrix );

		this.initBuffers();
		gl.addVisObject(this);
	}

	initBuffers(){
		// create new vertex buffer
		this.triangleVertexPositionBuffer = this.gl.createBuffer();

		// activate the new vertex buffer for editing
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.triangleVertexPositionBuffer);

		// define vertices
		var vertices = [];

		// add vertices here
		// define vertices
		var vertices = [];

		for (var i = this.numberOfSamples - 1; i >= 0; i--) {
			vertices.push( this.radius*Math.cos(i*2*Math.PI/this.numberOfSamples) );
			vertices.push( this.radius*Math.sin(i*2*Math.PI/this.numberOfSamples) );
			vertices.push( 0.0 );

			vertices.push( this.radius*Math.cos((i+1)*2*Math.PI/this.numberOfSamples) );
			vertices.push( this.radius*Math.sin((i+1)*2*Math.PI/this.numberOfSamples) );
			vertices.push( 0.0 );

			vertices.push( 0.0 );
			vertices.push( 0.0 );
			vertices.push( 0.0 );
		}

		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

		this.triangleVertexPositionBuffer.itemSize = 3; // verts per item
		this.triangleVertexPositionBuffer.numItems = 3*this.numberOfSamples; // num of items
	}

	draw(){

			this.resetMVMatrix();
			this.translate(1.0, 1.0, -2.0);

			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.triangleVertexPositionBuffer);
			this.gl.vertexAttribPointer(this.renderer.shaderProgram.vertexPositionAttribute, this.triangleVertexPositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

			this.gl.uniformMatrix4fv(this.renderer.shaderProgram.mvMatrixUniform, false, this.mvMatrix);

			this.gl.drawArrays(this.gl.TRIANGLES, 0, this.triangleVertexPositionBuffer.numItems);
	}

	resetMVMatrix(){
		mat4.identity(this.mvMatrix);
	}

	translate(x, y, z){
		mat4.translate(this.mvMatrix, this.mvMatrix, vec3.fromValues(x, y, z));
	}
}