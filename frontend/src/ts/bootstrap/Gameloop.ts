
module Webcraft {
	export class Gameloop {

		private glCanvas : HTMLCanvasElement;
		private renderer : RenderService;

		constructor (glCanvas :HTMLCanvasElement) {
			this.glCanvas = glCanvas;
            this.renderer = new RenderService(glCanvas);
		}

		public start() {
			var renderer = this.renderer;
			var doTick = function () {
				renderer.draw();
				requestAnimationFrame( doTick );
			}
			doTick();
		}
	}
}