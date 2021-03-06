import {Circle} from 'frontend/src/js/Circle.js';
import 'frontend/src/js/lib/gl-matrix-min.js';

/*
 *	WebGL class, responsible for rendering. Singleton.
 */

/* globals
	mat4: true
 */
let singleton = Symbol();

export class WebGL{
	constructor(){

		this.canvas = undefined;

		this.gl = undefined;
		this.triangleVertexPositionBuffer = undefined;
		this.shaderProgram = undefined;
		this.pMatrix = undefined;
		this.mvMatrix = mat4.create();
		this.camera = undefined;
		this.visObjects = [];
		this.onLoadDelegate = undefined;
		this.onTickDelegate = undefined;
		this.time = {
			last: new Date().getTime(),
			getElapsed: function(){
				var elapsed = new Date().getTime() - this.last;
				this.last = new Date().getTime();
				return elapsed;
			}
		};
	}

	start(canvas){
		this.canvas = canvas;

		this.initGL();
		
		//this.initShaders();
		//this.initBuffers();

		if(this.onLoadDelegate) {this.onLoadDelegate()}

		this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
    	this.gl.enable(this.gl.DEPTH_TEST);

		this.tick();
	}

	// Make delegates accesible
	onload( callback ){
		this.onLoadDelegate = callback;
	}

	ontick( callback ){
		this.onTickDelegate = callback;
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

		this.shaderProgram.vertexNormalAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexNormal");
        this.gl.enableVertexAttribArray(this.shaderProgram.vertexNormalAttribute);

		this.shaderProgram.pMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, 'uPMatrix');
		this.shaderProgram.mvMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, 'uMVMatrix');
		this.shaderProgram.nMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uNMatrix");
        this.shaderProgram.useLightingUniform = this.gl.getUniformLocation(this.shaderProgram, "uUseLighting");
        this.shaderProgram.ambientColorUniform = this.gl.getUniformLocation(this.shaderProgram, "uAmbientColor");
        this.shaderProgram.lightingDirectionUniform = this.gl.getUniformLocation(this.shaderProgram, "uLightingDirection");
        this.shaderProgram.directionalColorUniform = this.gl.getUniformLocation(this.shaderProgram, "uDirectionalColor");


		this.pMatrix = mat4.create();
	}

	getShader(gl, id){
		var shaderScript = document.getElementById(id);
		if (!shaderScript) {
			return null;
		}

		// Read in the shader
    // Blabla
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
    	var normalMatrix = mat3.create();
    	var invertedMatrix = mat4.create();
    	mat4.invert(invertedMatrix, this.mvMatrix);
	    mat3.fromMat4(normalMatrix, invertedMatrix);
	    mat3.transpose(normalMatrix, normalMatrix);
	    this.gl.uniformMatrix3fv(this.shaderProgram.nMatrixUniform, false, normalMatrix);
	}

	draw(){
		this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT || this.gl.DEPTH_BUFFER_BIT);


		
		//this.pMatrix = mat4.perspective(this.pMatrix, 45, this.gl.viewportWidth / this.gl.viewportHeight, 0.1, 100.0);
		//this.setMatrixUniforms();

		//draw here
		//console.log(this.circle);

		for(var visObject in this.visObjects){
			this.visObjects[visObject].draw();
		}

		
	}

	tick(){
		if(WebGL.getInstance().onTickDelegate){ WebGL.getInstance().onTickDelegate(WebGL.getInstance().time.getElapsed() ); }
		WebGL.getInstance().draw();
		requestAnimationFrame( WebGL.getInstance().tick );		
	}

	addVisObject(visObject){
		this.visObjects.push(visObject);
	}

	setCamera(camera){
		this.camera = camera;
	}

	// Convert absolute world coordinates to relative-to-camera coördinates
	absToRel(mvMatrix){
		if(this.camera){ this.camera.absToRel(mvMatrix); }
	}

	static getInstance(){
		//if(!this['instance']){ this['instance'] = new WebGL(); }
		//return this['instance'];
		if (!this[singleton]) {
            this[singleton] = new WebGL();
        }
        return this[singleton];
	}
}
