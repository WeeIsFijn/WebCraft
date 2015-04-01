
import {Point3} from 'frontend/src/js/Point3.js';
import {Shader} from 'frontend/src/js/Shader.js';

/* globals
	mat4: true,
	vec3: true,
	mat3: true
 */
export class Chunk{

	constructor(gl, x =0, y =0, z =-1, width =1, shader){
		this.gl = gl.gl;
		this.renderer = gl;
		//this.shaderProgram = this.gl.shaderProgram;
		this.mvMatrix = mat4.create();
		this.position = new Point3(x, y, z);
		this.width = width;
		this.shader = shader;
		mat4.identity( this.mvMatrix );

		this.currentTime = new Date().getTime();
		console.log('initializing object');
		
		this.initShaders();

		var elapsed = new Date().getTime() - this.currentTime;
		this.currentTime = new Date().getTime();
		console.log('initialized shaders-', elapsed);

		this.blockArray = [];
		this.initBuffers();

		


		gl.addVisObject(this);
	}

	generateBlockArray(size, val){
		this.blockArray = [];
		this.blockArraySize = size;
		for(var c=0; c<size*size*size; c++){
			this.blockArray.push(Math.random());
		}
	}

	getBlockArrayElement(x,y,z){
		if( x<0 || y<0 || z<0 || x>this.blockArraySize-1 || y>this.blockArraySize-1 || z>this.blockArraySize-1){
			//element does not exist
			return undefined;
		}
		return this.blockArray[x + y*this.blockArraySize + z*this.blockArraySize*this.blockArraySize];
	}

	initShaders(){
		// If a shader has been passed at object creation, we're not going to compile it
		console.log()
		if(!this.shader){
			var shader = new Shader(this.gl);

			var fragmentShader = shader.compileFromScript('shader-fs-light');
			var vertexShader = shader.compileFromScript('shader-vs-light');
			
			shader.generateProgram(shader.compileFromScript('shader-vs-light'), shader.compileFromScript('shader-fs-light'));

			this.shader = shader;
		}

		this.shaderProgram = this.shader.getProgram();
		this.shaderProgram.vertexPositionAttribute = this.shader.getAttributeLocation('aVertexPosition');
		this.shaderProgram.pMatrixUniform = this.shader.getUniformLocation('uPMatrix');
		this.shaderProgram.mvMatrixUniform = this.shader.getUniformLocation('uMVMatrix');
		
		this.pMatrix = mat4.create();	
	}

	getPlaneVerticesZp(x, y, z){
		var v = [
            x-0.5, y-0.5,  z-0.5,
            x+0.5, y-0.5,  z-0.5,
            x+0.5, y+0.5,  z-0.5,
            x-0.5, y+0.5,  z-0.5
            ];
        return v;
	}

	getPlaneVerticesZn(x, y, z){
		var v = [
            x-0.5, y-0.5,  z+0.5,
            x-0.5, y+0.5,  z+0.5,
            x+0.5, y+0.5,  z+0.5,
            x+0.5, y-0.5,  z+0.5
            ];
        return v;
	}

	getPlaneVerticesXn(x, y, z){
		var v = [
            x+0.5, y-0.5,  z-0.5,
            x+0.5, y+0.5,  z-0.5,
            x+0.5, y+0.5,  z+0.5,
            x+0.5, y-0.5,  z+0.5
            ];
        return v;
	}

	getPlaneVerticesXp(x, y, z){
		var v = [
            x-0.5, y-0.5,  z-0.5,
            x-0.5, y-0.5,  z+0.5,
            x-0.5, y+0.5,  z+0.5,
            x-0.5, y+0.5,  z-0.5
            ];
        return v;
	}

	getPlaneVerticesYn(x, y, z){
		var v = [
            x-0.5, y+0.5,  z-0.5,
            x-0.5, y+0.5,  z+0.5,
            x+0.5, y+0.5,  z+0.5,
            x+0.5, y+0.5,  z-0.5
            ];
        return v;
	}

	getPlaneVerticesYp(x, y, z){
		var v = [
            x-0.5, y-0.5,  z-0.5,
            x+0.5, y-0.5,  z-0.5,
            x+0.5, y-0.5,  z+0.5,
            x-0.5, y-0.5,  z+0.5
            ];
        return v;
	}

	addVertexIndices(indices){
		if( indices.length===0 ){ return [0, 1, 2, 0, 2, 3]; }
		var li = indices[indices.length-1];
		return indices.concat(li+1, li+2, li+3, li+1, li+3, li+4);
	}

	addVertexNormal(vertNormal, x, y, z){
		return vertNormal.concat(x, y, z).concat(x, y, z).concat(x, y, z).concat(x, y, z);
	}


	initBuffers(){
		this.generateBlockArray(13, 0);

		var elapsed = new Date().getTime() - this.currentTime;
		this.currentTime = new Date().getTime();
		console.log('generated volume data -', elapsed);

		var SOLIDLIMIT = 0.5;

		// create new vertex buffer
		this.cubeVertexPositionBuffer = this.gl.createBuffer();
		this.cubeVertexIndexBuffer = this.gl.createBuffer();

		
		var cubeVertexIndices = [];
		var vertices = [];
		var vertexNormals = [];

		for(var x=this.blockArraySize-1; x>=0; x--){
			for(var y=this.blockArraySize-1; y>=0; y--){
				for(var z=this.blockArraySize-1; z>=0; z--){
					if(this.getBlockArrayElement(x,y,z)<SOLIDLIMIT){
						//element is 'air', check neighbours
						
						if(this.getBlockArrayElement(x+1,y,z)>=SOLIDLIMIT){
							vertices = vertices.concat(this.getPlaneVerticesXn(x,y,z));
							//cubeVertexIndices = this.addVertexIndices(cubeVertexIndices);
							vertexNormals = this.addVertexNormal(vertexNormals, 1.0, 0.0, 0.0);

						}
						if(this.getBlockArrayElement(x-1,y,z)>=SOLIDLIMIT){
							vertices = vertices.concat(this.getPlaneVerticesXp(x,y,z));
							//cubeVertexIndices = this.addVertexIndices(cubeVertexIndices);
							vertexNormals = this.addVertexNormal(vertexNormals, -1.0, 0.0, 0.0);
						}
						if(this.getBlockArrayElement(x,y+1,z)>=SOLIDLIMIT){
							vertices = vertices.concat(this.getPlaneVerticesYn(x,y,z));
							//cubeVertexIndices = this.addVertexIndices(cubeVertexIndices);
							vertexNormals = this.addVertexNormal(vertexNormals, 0.0, 1.0, 0.0);
						}
						if(this.getBlockArrayElement(x,y-1,z)>=SOLIDLIMIT){
							vertices = vertices.concat(this.getPlaneVerticesYp(x,y,z));
							//cubeVertexIndices = this.addVertexIndices(cubeVertexIndices);
							vertexNormals = this.addVertexNormal(vertexNormals, 0.0, -1.0, 0.0);
						}
						if(this.getBlockArrayElement(x,y,z+1)>=SOLIDLIMIT){
							vertices = vertices.concat(this.getPlaneVerticesZn(x,y,z));
							//cubeVertexIndices = this.addVertexIndices(cubeVertexIndices);
							vertexNormals = this.addVertexNormal(vertexNormals, 0.0, 0.0, 1.0);
						}
						if(this.getBlockArrayElement(x,y,z-1)>=SOLIDLIMIT){
							vertices = vertices.concat(this.getPlaneVerticesZp(x,y,z));
							//cubeVertexIndices = this.addVertexIndices(cubeVertexIndices);
							vertexNormals = this.addVertexNormal(vertexNormals, 0.0, 0.0, -1.0);
						}

					} else {
						//element is 'solid', check whether it touches 'the void'
						if(this.getBlockArrayElement(x+1,y,z)===undefined){
							vertices = vertices.concat(this.getPlaneVerticesXp(x+1,y,z));
							//cubeVertexIndices = this.addVertexIndices(cubeVertexIndices);
							vertexNormals = this.addVertexNormal(vertexNormals, 1.0, 0.0, 0.0);
						}
						if(this.getBlockArrayElement(x-1,y,z)===undefined){
							vertices = vertices.concat(this.getPlaneVerticesXn(x-1,y,z));
							//cubeVertexIndices = this.addVertexIndices(cubeVertexIndices);
							vertexNormals = this.addVertexNormal(vertexNormals, -1.0, 0.0, 0.0);
						}
						if(this.getBlockArrayElement(x,y+1,z)===undefined){
							vertices = vertices.concat(this.getPlaneVerticesYp(x,y+1,z));
							//cubeVertexIndices = this.addVertexIndices(cubeVertexIndices);
							vertexNormals = this.addVertexNormal(vertexNormals, 0.0, 1.0, 0.0);
						}
						if(this.getBlockArrayElement(x,y-1,z)===undefined){
							vertices = vertices.concat(this.getPlaneVerticesYn(x,y-1,z));
							//cubeVertexIndices = this.addVertexIndices(cubeVertexIndices);
							vertexNormals = this.addVertexNormal(vertexNormals, 0.0, -1.0, 0.0);
						}
						if(this.getBlockArrayElement(x,y,z+1)===undefined){
							vertices = vertices.concat(this.getPlaneVerticesZp(x,y,z+1.0));
							//cubeVertexIndices = this.addVertexIndices(cubeVertexIndices);
							vertexNormals = this.addVertexNormal(vertexNormals, 0.0, 0.0, 1.0);
						}
						if(this.getBlockArrayElement(x,y,z-1)===undefined){
							vertices = vertices.concat(this.getPlaneVerticesZn(x,y,z-1.0));
							//cubeVertexIndices = this.addVertexIndices(cubeVertexIndices);
							vertexNormals = this.addVertexNormal(vertexNormals, 0.0, 0.0, -1.0);
						}
					}
				}
			}
		}


		var elapsed = new Date().getTime() - this.currentTime;
		this.currentTime = new Date().getTime();
		console.log('calculated vis quads -', elapsed);
		
		//console.log('elementArray, ', this.blockArray);
		//console.log('verts: v, ',vertices);
		console.log('num verts, ', vertices.length);
		console.log('num normals, ', vertexNormals.length);
		console.log('num indices, ', cubeVertexIndices.length);

		var elapsed = new Date().getTime() - this.currentTime;
		this.currentTime = new Date().getTime();
		console.log('logged to console -', elapsed);
		/*
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
		*/
	
		// activate the new vertex buffer for editing
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeVertexPositionBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

		this.cubeVertexPositionBuffer.itemSize = 3; // verts per item
		this.cubeVertexPositionBuffer.numItems = vertices.length/3; // num of items

		this.cubeVertexIndexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.cubeVertexIndexBuffer);
        
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), this.gl.STATIC_DRAW);
        this.cubeVertexIndexBuffer.itemSize = 1;
        this.cubeVertexIndexBuffer.numItems = cubeVertexIndices.length/1;

        this.cubeVertexNormalBuffer = this.gl.createBuffer();
	    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeVertexNormalBuffer);

	    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertexNormals), this.gl.STATIC_DRAW);
	    this.cubeVertexNormalBuffer.itemSize = 3;
	    this.cubeVertexNormalBuffer.numItems = vertexNormals.length/3;
	    
	}

	setMatrixUniforms(){
		this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
    	this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
    	
	}

	draw(){
			if(!this.shader.getProgram()){ return 0; }
			this.shader.useProgram();
			
			this.pMatrix = mat4.perspective(this.pMatrix, 45, this.gl.viewportWidth / this.gl.viewportHeight, 0.1, 100.0);
			this.setMatrixUniforms();
			this.resetMVMatrix();
			this.renderer.absToRel(this.mvMatrix);
			this.translate();
			this.scale();

			//NEW
			//

			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeVertexPositionBuffer);
			
			this.gl.vertexAttribPointer(this.shader.getAttributeLocation('aVertexPosition'), 
				this.cubeVertexPositionBuffer.itemSize, 
				this.gl.FLOAT, 
				false, 
				0, 
				0);

			this.gl.uniformMatrix4fv(this.shader.getUniformLocation('mvMatrixUniform'), false, this.mvMatrix);

			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.cubeVertexIndexBuffer);

			
			// -- Lighting shader --
			// 
			// Bind vertex normals to shader attribute
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeVertexNormalBuffer);
    		this.gl.vertexAttribPointer(this.shader.getAttributeLocation('aVertexNormal'), 
    			this.cubeVertexNormalBuffer.itemSize, 
    			this.gl.FLOAT, 
    			false, 
    			0, 
    			0);

    		// LightingEnabled shader uniform

    		this.gl.uniform1i(this.shader.getUniformLocation('uUseLighting'), true);
    		// Push lighting color to shader uniform
    		this.gl.uniform3f(this.shader.getUniformLocation('uAmbientColor'),0.2, 0.2, 0.2);
    		// Normalize lighting direction and pass to shader as uniform (vec3->Float32Array->uniform3fv instead 
    		// of uniform3f)
    		var lightingDirection=vec3.fromValues(0.5, 0.2, -0.8);
    		
    		vec3.normalize(lightingDirection, lightingDirection);
    		
    		this.gl.uniform3fv(this.shader.getUniformLocation('uLightingDirection'), lightingDirection);
    		// push lighting color to shader as uniform
    		this.gl.uniform3f(this.shader.getUniformLocation('uDirectionalColor'), 0.5, 0.5, 0.5);
			
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