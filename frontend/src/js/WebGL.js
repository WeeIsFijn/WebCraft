import {Circle} from 'frontend/src/js/Circle.js';
import 'frontend/src/js/lib/gl-matrix-min.js';

/*
 *	WebGL class, responsible for rendering. Singleton.
 */

/* globals
	mat4: true
 */

export class WebGL{
	constructor(){

		this.canvas = undefined;

		this.gl = undefined;
		this.triangleVertexPositionBuffer = undefined;
		this.shaderProgram = undefined;
		this.pMatrix = undefined;
		this.mvMatrix = mat4.create();
		this.visObjects = [];
	}

	start(canvas){
		this.canvas = canvas;

		this.initGL();
		
		this.initShaders();
		this.initBuffers();

		this.gl.clearColor(1.0, 1.0, 0.0, 1.0);
    	this.gl.enable(this.gl.DEPTH_TEST);

		this.tick();
	}

	initGL(){
		// TODO implement try-catch block here
		this.gl = this.canvas.getContext('experimental-webgl');
		this.gl.viewportWidth 	= this.canvas.width;
		this.gl.viewportHeight = this.canvas.height;
	}

	initBuffers(){
		// create new vertex buffer
		this.triangleVertexPositionBuffer = this.gl.createBuffer();

		// activate the new vertex buffer for editing
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.triangleVertexPositionBuffer);

		// define vertices
		var vertices = [
			0.0,	1.0,	0.0,
			-1.0,	-1.0,	0.0,
			1.0,	-1.0,	0.0
		];

		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

		this.triangleVertexPositionBuffer.itemSize = 3;
		this.triangleVertexPositionBuffer.numItems = 3;
	}

	initShaders(){
		var fragmentShader = this.getShader(this.gl, 'shader-fs');
		var vertexShader = this.getShader(this.gl, 'shader-vs');

		this.shaderProgram = this.gl.createProgram();
		this.gl.attachShader(this.shaderProgram, vertexShader);
		this.gl.attachShader(this.shaderProgram, fragmentShader);
		this.gl.linkProgram(this.shaderProgram);
		this.gl.useProgram(this.shaderProgram);

		this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, 'aVertexPosition');
		this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);

		this.shaderProgram.pMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, 'uPMatrix');
		this.shaderProgram.mvMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, 'uMVMatrix');


		this.pMatrix = mat4.create();
	}

	getShader(gl, id){
		var shaderScript = document.getElementById(id);
		if (!shaderScript) {
			return null;
		}

		// Read in the shader
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

      gl.shaderSource(shader, str);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          alert(gl.getShaderInfoLog(shader));
          return null;
      }

      return shader;
	}

	setMatrixUniforms(){
		this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
    	this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
	}

	draw(){
		this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT || this.gl.DEPTH_BUFFER_BIT);


		
		this.pMatrix = mat4.perspective(this.pMatrix, 45, this.gl.viewportWidth / this.gl.viewportHeight, 0.1, 100.0);
		this.setMatrixUniforms();

		//draw here
		//console.log(this.circle);
		
		for(var visObject in this.visObjects){
			this.visObjects[visObject].draw();
		}
		
	}

	tick(){
		WebGL.getInstance().draw();
		requestAnimationFrame( WebGL.getInstance().tick );		
	}

	addVisObject(visObject){
		this.visObjects.push(visObject);
	}

	static getInstance(){
		if(!this['instance']){ this['instance'] = new WebGL(); }
		return this['instance'];
	}
}
