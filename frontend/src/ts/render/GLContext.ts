module Webcraft {
	export class GLContext {

		private originalGlCanvas : HTMLCanvasElement;
		public experimentalGlContext;

		constructor (glcanvas : HTMLCanvasElement) {
			this.originalGlCanvas = glcanvas;
			console.log('got original html canvas');
			console.log(this.originalGlCanvas);

			this.experimentalGlContext = this.originalGlCanvas.getContext('experimental-webgl');
			this.experimentalGlContext.viewportWidth = this.experimentalGlContext.width;
			this.experimentalGlContext.viewportHeight = this.experimentalGlContext.height;
		}
	}
}