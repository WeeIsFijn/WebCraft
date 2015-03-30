import {Point3} from 'frontend/src/js/Point3.js';
import 'frontend/src/js/lib/gl-matrix-min.js';

/*
 * Camera class; represents camera position and oriëntation.
 * 	Contains methods for transforming world- to cam- coordinates.
 */

export class Camera{
	constructor(webGL, x =0, y =0, z =0, rx =0.0, ry =0.0, rz =0.0){
		this.position = new Point3(x,y,z);
		this.rotation = new Point3(rx, ry, rz);
		this.webGL = webGL;
		webGL.setCamera(this);
	}

	move( dX, dY, dZ ){
		this.position.x += -dZ*Math.sin(this.rotation.y);
		this.position.y += 0;
		this.position.z += dZ*Math.cos(this.rotation.y);
	}

	turn( drx, dry, drz){
		this.rotation.x += drx;
		this.rotation.y += dry;
		this.rotation.z += drz;
	}

	absToRel(mvMatrix){
		
		mat4.rotate(mvMatrix, mvMatrix, this.rotation.x, [1, 0, 0]);
		mat4.rotate(mvMatrix, mvMatrix, this.rotation.y, [0, 1, 0]);
		//mat4.rotate(mvMatrix, mvMatrix, -this.rotation.z, [0, 0, 1]);
		mat4.translate(mvMatrix, mvMatrix, vec3.fromValues(-this.position.x, -this.position.y, -this.position.z));
		
	}
}