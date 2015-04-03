
import {Point3} from 'frontend/src/js/Point3.js';
import {Shader} from 'frontend/src/js/Shader.js';
import 'frontend/src/js/lib/noise.js';

/* globals
  mat4: true,
  vec3: true,
  mat3: true
 */

function SimplexNoise(r) {
  if (r == undefined) r = Math;
  this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0], 
                                 [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1], 
                                 [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]]; 
  this.p = [];
  for (var i=0; i<256; i++) {
    this.p[i] = Math.floor(r.random()*256);
  }
  // To remove the need for index wrapping, double the permutation table length 
  this.perm = []; 
  for(var i=0; i<512; i++) {
    this.perm[i]=this.p[i & 255];
  } 
 
  // A lookup table to traverse the simplex around a given point in 4D. 
  // Details can be found where this table is used, in the 4D noise method. 
  this.simplex = [ 
    [0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0], 
    [0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0], 
    [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0], 
    [1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0], 
    [1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0], 
    [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0], 
    [2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0], 
    [2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]; 
};
 
SimplexNoise.prototype.dot = function(g, x, y) { 
  return g[0]*x + g[1]*y;
};
 
SimplexNoise.prototype.noise = function(xin, yin) { 
  var n0, n1, n2; // Noise contributions from the three corners 
  // Skew the input space to determine which simplex cell we're in 
  var F2 = 0.5*(Math.sqrt(3.0)-1.0); 
  var s = (xin+yin)*F2; // Hairy factor for 2D 
  var i = Math.floor(xin+s); 
  var j = Math.floor(yin+s); 
  var G2 = (3.0-Math.sqrt(3.0))/6.0; 
  var t = (i+j)*G2; 
  var X0 = i-t; // Unskew the cell origin back to (x,y) space 
  var Y0 = j-t; 
  var x0 = xin-X0; // The x,y distances from the cell origin 
  var y0 = yin-Y0; 
  // For the 2D case, the simplex shape is an equilateral triangle. 
  // Determine which simplex we are in. 
  var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords 
  if(x0>y0) {i1=1; j1=0;} // lower triangle, XY order: (0,0)->(1,0)->(1,1) 
  else {i1=0; j1=1;}      // upper triangle, YX order: (0,0)->(0,1)->(1,1) 
  // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and 
  // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where 
  // c = (3-sqrt(3))/6 
  var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords 
  var y1 = y0 - j1 + G2; 
  var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords 
  var y2 = y0 - 1.0 + 2.0 * G2; 
  // Work out the hashed gradient indices of the three simplex corners 
  var ii = i & 255; 
  var jj = j & 255; 
  var gi0 = this.perm[ii+this.perm[jj]] % 12; 
  var gi1 = this.perm[ii+i1+this.perm[jj+j1]] % 12; 
  var gi2 = this.perm[ii+1+this.perm[jj+1]] % 12; 
  // Calculate the contribution from the three corners 
  var t0 = 0.5 - x0*x0-y0*y0; 
  if(t0<0) n0 = 0.0; 
  else { 
    t0 *= t0; 
    n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);  // (x,y) of grad3 used for 2D gradient 
  } 
  var t1 = 0.5 - x1*x1-y1*y1; 
  if(t1<0) n1 = 0.0; 
  else { 
    t1 *= t1; 
    n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1); 
  }
  var t2 = 0.5 - x2*x2-y2*y2; 
  if(t2<0) n2 = 0.0; 
  else { 
    t2 *= t2; 
    n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2); 
  } 
  // Add contributions from each corner to get the final noise value. 
  // The result is scaled to return values in the interval [-1,1]. 
  return 70.0 * (n0 + n1 + n2); 
};
 
// 3D simplex noise 
SimplexNoise.prototype.noise3d = function(xin, yin, zin) { 
  var n0, n1, n2, n3; // Noise contributions from the four corners 
  // Skew the input space to determine which simplex cell we're in 
  var F3 = 1.0/3.0; 
  var s = (xin+yin+zin)*F3; // Very nice and simple skew factor for 3D 
  var i = Math.floor(xin+s); 
  var j = Math.floor(yin+s); 
  var k = Math.floor(zin+s); 
  var G3 = 1.0/6.0; // Very nice and simple unskew factor, too 
  var t = (i+j+k)*G3; 
  var X0 = i-t; // Unskew the cell origin back to (x,y,z) space 
  var Y0 = j-t; 
  var Z0 = k-t; 
  var x0 = xin-X0; // The x,y,z distances from the cell origin 
  var y0 = yin-Y0; 
  var z0 = zin-Z0; 
  // For the 3D case, the simplex shape is a slightly irregular tetrahedron. 
  // Determine which simplex we are in. 
  var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords 
  var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords 
  if(x0>=y0) { 
    if(y0>=z0) 
      { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; } // X Y Z order 
      else if(x0>=z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; } // X Z Y order 
      else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; } // Z X Y order 
    } 
  else { // x0<y0 
    if(y0<z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; } // Z Y X order 
    else if(x0<z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; } // Y Z X order 
    else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; } // Y X Z order 
  } 
  // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z), 
  // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and 
  // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where 
  // c = 1/6.
  var x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords 
  var y1 = y0 - j1 + G3; 
  var z1 = z0 - k1 + G3; 
  var x2 = x0 - i2 + 2.0*G3; // Offsets for third corner in (x,y,z) coords 
  var y2 = y0 - j2 + 2.0*G3; 
  var z2 = z0 - k2 + 2.0*G3; 
  var x3 = x0 - 1.0 + 3.0*G3; // Offsets for last corner in (x,y,z) coords 
  var y3 = y0 - 1.0 + 3.0*G3; 
  var z3 = z0 - 1.0 + 3.0*G3; 
  // Work out the hashed gradient indices of the four simplex corners 
  var ii = i & 255; 
  var jj = j & 255; 
  var kk = k & 255; 
  var gi0 = this.perm[ii+this.perm[jj+this.perm[kk]]] % 12; 
  var gi1 = this.perm[ii+i1+this.perm[jj+j1+this.perm[kk+k1]]] % 12; 
  var gi2 = this.perm[ii+i2+this.perm[jj+j2+this.perm[kk+k2]]] % 12; 
  var gi3 = this.perm[ii+1+this.perm[jj+1+this.perm[kk+1]]] % 12; 
  // Calculate the contribution from the four corners 
  var t0 = 0.6 - x0*x0 - y0*y0 - z0*z0; 
  if(t0<0) n0 = 0.0; 
  else { 
    t0 *= t0; 
    n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0, z0); 
  }
  var t1 = 0.6 - x1*x1 - y1*y1 - z1*z1; 
  if(t1<0) n1 = 0.0; 
  else { 
    t1 *= t1; 
    n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1, z1); 
  } 
  var t2 = 0.6 - x2*x2 - y2*y2 - z2*z2; 
  if(t2<0) n2 = 0.0; 
  else { 
    t2 *= t2; 
    n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2, z2); 
  } 
  var t3 = 0.6 - x3*x3 - y3*y3 - z3*z3; 
  if(t3<0) n3 = 0.0; 
  else { 
    t3 *= t3; 
    n3 = t3 * t3 * this.dot(this.grad3[gi3], x3, y3, z3); 
  } 
  // Add contributions from each corner to get the final noise value. 
  // The result is scaled to stay just inside [-1,1] 
  return 32.0*(n0 + n1 + n2 + n3); 
};


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
    var noiseData = new SimplexNoise();
    
    for(var c=0; c<size*size*size; c++){
      this.blockArray.push(noiseData.noise3d(c, c+1, c+2));
    }

    /*

    for(var z=0; z<this.blockArraySize; z++){
      for(var y=0; y<this.blockArraySize; y++){
        for(var x=0; x<this.blockArraySize; x++){
          this.blockArray.push(noiseData.noise3d(x/1.0, y/1.0, z/1.0)*1.0);
        }
      }
    } */
    console.log('blockArray', this.blockArray);
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
    var SOLIDLIMIT = 0.0;
    var CHUNKSIZE = 50;

    this.generateBlockArray(CHUNKSIZE, 0);

    var elapsed = new Date().getTime() - this.currentTime;
    this.currentTime = new Date().getTime();
    console.log('generated volume data -', elapsed);

    // create new vertex buffer
    this.cubeVertexPositionBuffer = this.gl.createBuffer();
    this.cubeVertexIndexBuffer = this.gl.createBuffer();

    // trying to make this algorithm faster with typed arrays
    var cubeVertexIndices = new Uint16Array(CHUNKSIZE*CHUNKSIZE*CHUNKSIZE*6*6);
    var vertices = new Float32Array(CHUNKSIZE*CHUNKSIZE*CHUNKSIZE*6*4*3);
    var vertexNormals = new Float32Array(CHUNKSIZE*CHUNKSIZE*CHUNKSIZE*6*4*3);

    var cubeVertexIndicesLength = CHUNKSIZE*6*6;
    var verticesLength = CHUNKSIZE*6*4*3;
    var vertexNormalsLength = CHUNKSIZE*6*4*3;

    var cubeVertexIndicesIndex = 0;
    var verticesIndex = 0;
    var vertexNormalsIndex = 0;
    
    for(var x=this.blockArraySize-1; x>=0; x--){
      for(var y=this.blockArraySize-1; y>=0; y--){
        for(var z=this.blockArraySize-1; z>=0; z--){
          if(this.getBlockArrayElement(x,y,z)<SOLIDLIMIT){
            //element is 'air', check neighbours
            
            if(this.getBlockArrayElement(x+1,y,z)>=SOLIDLIMIT){
              //vertices = vertices.concat(this.getPlaneVerticesXn(x,y,z));
              //cubeVertexIndices = this.addVertexIndices(cubeVertexIndices);
              //vertexNormals = this.addVertexNormal(vertexNormals, 1.0, 0.0, 0.0);
              vertices.set(this.getPlaneVerticesXn(x,y,z), verticesIndex);
              vertexNormals.set([1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0], vertexNormalsIndex);
              cubeVertexIndices.set([verticesIndex/3+0, verticesIndex/3+1, 
                          verticesIndex/3+2, verticesIndex/3+0, 
                          verticesIndex/3+2, verticesIndex/3+3], cubeVertexIndicesIndex);
              verticesIndex += 12;
              vertexNormalsIndex += 3*4;
              cubeVertexIndicesIndex += 6;

            }
            if(this.getBlockArrayElement(x-1,y,z)>=SOLIDLIMIT){
              //vertices = vertices.concat(this.getPlaneVerticesXp(x,y,z));
              //cubeVertexIndices = this.addVertexIndices(cubeVertexIndices);
              //vertexNormals = this.addVertexNormal(vertexNormals, -1.0, 0.0, 0.0);
              vertices.set(this.getPlaneVerticesXp(x,y,z), verticesIndex);
              vertexNormals.set([-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0], vertexNormalsIndex);
              cubeVertexIndices.set([verticesIndex/3+0, verticesIndex/3+1, 
                          verticesIndex/3+2, verticesIndex/3+0, 
                          verticesIndex/3+2, verticesIndex/3+3], cubeVertexIndicesIndex);
              verticesIndex += 12;
              vertexNormalsIndex += 3*4;
              cubeVertexIndicesIndex += 6;
            }
            if(this.getBlockArrayElement(x,y+1,z)>=SOLIDLIMIT){
              //vertices = vertices.concat(this.getPlaneVerticesYn(x,y,z));
              //cubeVertexIndices = this.addVertexIndices(cubeVertexIndices);
              //vertexNormals = this.addVertexNormal(vertexNormals, 0.0, 1.0, 0.0);
              vertices.set(this.getPlaneVerticesYn(x,y,z), verticesIndex);
              vertexNormals.set([0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0], vertexNormalsIndex);
              cubeVertexIndices.set([verticesIndex/3+0, verticesIndex/3+1, 
                          verticesIndex/3+2, verticesIndex/3+0, 
                          verticesIndex/3+2, verticesIndex/3+3], cubeVertexIndicesIndex);
              verticesIndex += 12;
              vertexNormalsIndex += 3*4;
              cubeVertexIndicesIndex += 6;
            }
            if(this.getBlockArrayElement(x,y-1,z)>=SOLIDLIMIT){
              //vertices = vertices.concat(this.getPlaneVerticesYp(x,y,z));
              //cubeVertexIndices = this.addVertexIndices(cubeVertexIndices);
              //vertexNormals = this.addVertexNormal(vertexNormals, 0.0, -1.0, 0.0);
              vertices.set(this.getPlaneVerticesYp(x,y,z), verticesIndex);
              vertexNormals.set([0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0], vertexNormalsIndex);
              cubeVertexIndices.set([verticesIndex/3+0, verticesIndex/3+1, 
                          verticesIndex/3+2, verticesIndex/3+0, 
                          verticesIndex/3+2, verticesIndex/3+3], cubeVertexIndicesIndex);
              verticesIndex += 12;
              vertexNormalsIndex += 3*4;
              cubeVertexIndicesIndex += 6;
            }
            if(this.getBlockArrayElement(x,y,z+1)>=SOLIDLIMIT){
              //vertices = vertices.concat(this.getPlaneVerticesZn(x,y,z));
              //cubeVertexIndices = this.addVertexIndices(cubeVertexIndices);
              //vertexNormals = this.addVertexNormal(vertexNormals, 0.0, 0.0, 1.0);
              vertices.set(this.getPlaneVerticesZn(x,y,z), verticesIndex);
              vertexNormals.set([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0], vertexNormalsIndex);
              cubeVertexIndices.set([verticesIndex/3+0, verticesIndex/3+1, 
                          verticesIndex/3+2, verticesIndex/3+0, 
                          verticesIndex/3+2, verticesIndex/3+3], cubeVertexIndicesIndex);
              verticesIndex += 12;
              vertexNormalsIndex += 3*4;
              cubeVertexIndicesIndex += 6;
            }
            if(this.getBlockArrayElement(x,y,z-1)>=SOLIDLIMIT){
              //vertices = vertices.concat(this.getPlaneVerticesZp(x,y,z));
              //cubeVertexIndices = this.addVertexIndices(cubeVertexIndices);
              //vertexNormals = this.addVertexNormal(vertexNormals, 0.0, 0.0, -1.0);
              vertices.set(this.getPlaneVerticesZp(x,y,z), verticesIndex);
              vertexNormals.set([0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0], vertexNormalsIndex);
              cubeVertexIndices.set([verticesIndex/3+0, verticesIndex/3+1, 
                          verticesIndex/3+2, verticesIndex/3+0, 
                          verticesIndex/3+2, verticesIndex/3+3], cubeVertexIndicesIndex);
              verticesIndex += 12;
              vertexNormalsIndex += 3*4;
              cubeVertexIndicesIndex += 6;
            }

          } else {
            //element is 'solid', check whether it touches 'the void'
            if(this.getBlockArrayElement(x+1,y,z)===undefined){
              //vertices = vertices.concat(this.getPlaneVerticesXp(x+1,y,z));
              //cubeVertexIndices = this.addVertexIndices(cubeVertexIndices);
              //vertexNormals = this.addVertexNormal(vertexNormals, 1.0, 0.0, 0.0);
              vertices.set(this.getPlaneVerticesXp(x+1,y,z), verticesIndex);
              vertexNormals.set([-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0], vertexNormalsIndex);
              cubeVertexIndices.set([verticesIndex/3+0, verticesIndex/3+1, 
                          verticesIndex/3+2, verticesIndex/3+0, 
                          verticesIndex/3+2, verticesIndex/3+3], cubeVertexIndicesIndex);
              verticesIndex += 12;
              vertexNormalsIndex += 3*4;
              cubeVertexIndicesIndex += 6;
            }
            if(this.getBlockArrayElement(x-1,y,z)===undefined){
              //vertices = vertices.concat(this.getPlaneVerticesXn(x-1,y,z));
              //cubeVertexIndices = this.addVertexIndices(cubeVertexIndices);
              //vertexNormals = this.addVertexNormal(vertexNormals, -1.0, 0.0, 0.0);
              vertices.set(this.getPlaneVerticesXn(x-1,y,z), verticesIndex);
              vertexNormals.set([1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0], vertexNormalsIndex);
              cubeVertexIndices.set([verticesIndex/3+0, verticesIndex/3+1, 
                          verticesIndex/3+2, verticesIndex/3+0, 
                          verticesIndex/3+2, verticesIndex/3+3], cubeVertexIndicesIndex);
              verticesIndex += 12;
              vertexNormalsIndex += 3*4;
              cubeVertexIndicesIndex += 6;
            }
            if(this.getBlockArrayElement(x,y+1,z)===undefined){
              //vertices = vertices.concat(this.getPlaneVerticesYp(x,y+1,z));
              //cubeVertexIndices = this.addVertexIndices(cubeVertexIndices);
              //vertexNormals = this.addVertexNormal(vertexNormals, 0.0, 1.0, 0.0);
              vertices.set(this.getPlaneVerticesYp(x,y+1,z), verticesIndex);
              vertexNormals.set([0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0], vertexNormalsIndex);
              cubeVertexIndices.set([verticesIndex/3+0, verticesIndex/3+1, 
                          verticesIndex/3+2, verticesIndex/3+0, 
                          verticesIndex/3+2, verticesIndex/3+3], cubeVertexIndicesIndex);
              verticesIndex += 12;
              vertexNormalsIndex += 3*4;
              cubeVertexIndicesIndex += 6;
            }
            if(this.getBlockArrayElement(x,y-1,z)===undefined){
              //vertices = vertices.concat(this.getPlaneVerticesYn(x,y-1,z));
              //cubeVertexIndices = this.addVertexIndices(cubeVertexIndices);
              //vertexNormals = this.addVertexNormal(vertexNormals, 0.0, -1.0, 0.0);
              vertices.set(this.getPlaneVerticesYn(x,y-1,z), verticesIndex);
              vertexNormals.set([0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0], vertexNormalsIndex);
              cubeVertexIndices.set([verticesIndex/3+0, verticesIndex/3+1, 
                          verticesIndex/3+2, verticesIndex/3+0, 
                          verticesIndex/3+2, verticesIndex/3+3], cubeVertexIndicesIndex);
              verticesIndex += 12;
              vertexNormalsIndex += 3*4;
              cubeVertexIndicesIndex += 6;
            }
            if(this.getBlockArrayElement(x,y,z+1)===undefined){
              //vertices = vertices.concat(this.getPlaneVerticesZp(x,y,z+1.0));
              //cubeVertexIndices = this.addVertexIndices(cubeVertexIndices);
              //vertexNormals = this.addVertexNormal(vertexNormals, 0.0, 0.0, 1.0);
              vertices.set(this.getPlaneVerticesZp(x,y,z+1), verticesIndex);
              vertexNormals.set([0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0], vertexNormalsIndex);
              cubeVertexIndices.set([verticesIndex/3+0, verticesIndex/3+1, 
                          verticesIndex/3+2, verticesIndex/3+0, 
                          verticesIndex/3+2, verticesIndex/3+3], cubeVertexIndicesIndex);
              verticesIndex += 12;
              vertexNormalsIndex += 3*4;
              cubeVertexIndicesIndex += 6;
            }
            if(this.getBlockArrayElement(x,y,z-1)===undefined){
              //vertices = vertices.concat(this.getPlaneVerticesZn(x,y,z-1.0));
              //cubeVertexIndices = this.addVertexIndices(cubeVertexIndices);
              //vertexNormals = this.addVertexNormal(vertexNormals, 0.0, 0.0, -1.0);
              vertices.set(this.getPlaneVerticesZn(x,y,z-1), verticesIndex);
              vertexNormals.set([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0], vertexNormalsIndex);
              cubeVertexIndices.set([verticesIndex/3+0, verticesIndex/3+1, 
                          verticesIndex/3+2, verticesIndex/3+0, 
                          verticesIndex/3+2, verticesIndex/3+3], cubeVertexIndicesIndex);
              verticesIndex += 12;
              vertexNormalsIndex += 3*4;
              cubeVertexIndicesIndex += 6;
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
    console.log('num verts, ', verticesIndex/3);
    console.log('num normals, ', vertexNormalsIndex/3);
    console.log('num indices, ', cubeVertexIndicesIndex);

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
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

    this.cubeVertexPositionBuffer.itemSize = 3; // verts per item
    this.cubeVertexPositionBuffer.numItems = verticesIndex/3; // num of items

    this.cubeVertexIndexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.cubeVertexIndexBuffer);
        
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndices, this.gl.STATIC_DRAW);
        this.cubeVertexIndexBuffer.itemSize = 1;
        this.cubeVertexIndexBuffer.numItems = cubeVertexIndicesIndex/1;

        this.cubeVertexNormalBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeVertexNormalBuffer);

      this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexNormals, this.gl.STATIC_DRAW);
      this.cubeVertexNormalBuffer.itemSize = 3;
      this.cubeVertexNormalBuffer.numItems = vertexNormalsIndex/3;
      
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