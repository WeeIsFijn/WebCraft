module Webcraft {
	
	export enum GlContextType {
		Experimental
	}
	
	export class GLContext {

		private originalGlCanvas : HTMLCanvasElement;
		private contextType : GlContextType;
		
		public experimentalGlContext;

		constructor (glcanvas : HTMLCanvasElement) {
			this.originalGlCanvas = glcanvas;

			this.experimentalGlContext = this.originalGlCanvas.getContext('experimental-webgl');
			this.experimentalGlContext.viewportWidth = this.experimentalGlContext.width;
			this.experimentalGlContext.viewportHeight = this.experimentalGlContext.height;
			
			this.contextType = GlContextType.Experimental;
		}
		
		public setGlContextType (contextType : GlContextType) {
			this.contextType = contextType;
		}
		
		public get() {
			switch (this.contextType) {
				case GlContextType.Experimental:
					return this.experimentalGlContext;
					break;
				default:
					throw "No contextType associated with this instace of GlContext";
			}
		}
		
	}
}