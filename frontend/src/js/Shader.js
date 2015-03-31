export class Shader{
	constructor(gl){
		
		this.gl = gl;

		this.shaderProgram = undefined;
	}

	generateProgram(vertexSource, fragmentSource){
		//if(vertexSource===null || fragmentSource === null) { return undefined; }
		console.log('shader:', fragmentSource);
		this.shaderProgram = this.gl.createProgram();
		this.gl.attachShader(this.shaderProgram, vertexSource);
		this.gl.attachShader(this.shaderProgram, fragmentSource);
		this.gl.linkProgram(this.shaderProgram);

		return this.shaderProgram;
	}

	getProgram(){
		return this.shaderProgram;
	}

	useProgram(){
		this.gl.useProgram(this.getProgram());
	}

	getAttributeLocation(attributeString){
		this.gl.useProgram(this.shaderProgram);

		var attr = this.gl.getAttribLocation(this.shaderProgram, attributeString);
		this.gl.enableVertexAttribArray(attr);

		return this.gl.getAttribLocation(this.shaderProgram, attributeString);
	}

	getUniformLocation(uniformString){
		this.gl.useProgram(this.shaderProgram);
		return this.gl.getUniformLocation(this.shaderProgram, uniformString);
	}

	compileFromScript(scriptTag){
		var shaderScript = document.getElementById(scriptTag);
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
          shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
      } else if (shaderScript.type === "x-shader/x-vertex") {
          shader = this.gl.createShader(this.gl.VERTEX_SHADER);
      } else {
          return null;
      }

      this.gl.shaderSource(shader, str);
      this.gl.compileShader(shader);

      if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
          window.alert(this.gl.getShaderInfoLog(shader));
          return null;
      }

      return shader;
	}

}