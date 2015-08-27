module Webcraft {
	export class RenderService {

		private ctx : GLContext;

		constructor (glCanvas : HTMLCanvasElement) {
			this.ctx = new GLContext(glCanvas);

			this.ctx.experimentalGlContext.clearColor(0.2, 1.0, 1.0, 0.5);
			this.ctx.experimentalGlContext.enable(this.ctx.experimentalGlContext.DEPTH_TEST);
			this.ctx.experimentalGlContext.viewport(0, 0, this.ctx.experimentalGlContext.viewportWidth, this.ctx.experimentalGlContext.viewportHeight);
			this.ctx.experimentalGlContext.clear(this.ctx.experimentalGlContext.COLOR_BUFFER_BIT || this.ctx.experimentalGlContext.DEPTH_BUFFER_BIT);
		}
	}
}