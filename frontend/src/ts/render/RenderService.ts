
module Webcraft {
	export class RenderService {

		private ctx : GLContext;
		private shaderProgram : any;

		constructor (glCanvas : HTMLCanvasElement) {
			this.ctx = new GLContext(glCanvas);

			this.ctx.get().clearColor(0.2, 1.0, 1.0, 0.5);
			this.ctx.get().enable(this.ctx.get().DEPTH_TEST);
			this.ctx.get().viewport(0, 0, this.ctx.get().viewportWidth, this.ctx.get().viewportHeight);
			this.ctx.get().clear(this.ctx.get().COLOR_BUFFER_BIT || this.ctx.get().DEPTH_BUFFER_BIT);
			
			this.initialize();
		};
		
		/* TODO: Implement some kind of try-catch logic here */
		public initialize () {
			this.initializeShaders();
			this.initializeBuffers();
		};
		
		/* TODO: Remove shader logic from this class */
		private initializeShaders () {
			// compile shaders
			var fragmentShader =	this.readShader('shader-fs');
			var vertexShader = 		this.readShader('shader-vs');
			
			this.shaderProgram = this.ctx.get().createProgram();
			this.ctx.get().attachShader(this.shaderProgram, fragmentShader);
			this.ctx.get().attachShader(this.shaderProgram, vertexShader);
			this.ctx.get().linkProgram();
			
			// load shaders
			this.ctx.get().useProgram(this.shaderProgram);
			
			// create shader attributes
			
		};
		
		/* TODO: Remove Buffer logic from this class */
		private initializeBuffers () {};
		
		private readShader (id) {
			var gl = this.ctx.get();
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
		
			gl.shaderSource(shader, str);
			gl.compileShader(shader);
		
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				alert(gl.getShaderInfoLog(shader));
				return null;
			}
		
			return shader;
		}
	}
}