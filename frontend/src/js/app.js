import {WebGL} from 'frontend/src/js/WebGL.js';
import {Circle} from 'frontend/src/js/Circle.js';
import {Cube} from 'frontend/src/js/Cube.js';
import {Camera} from 'frontend/src/js/Camera.js';

class Chunk{
	constructor(webGL, size){
		this.cubes = [];

		for(var i=-size/2; i< size/2; i++){
			for(var j=-size/2; j< size/2; j++){
				this.cubes.push(new Cube(webGL, j*2, -3.0, i*2, 1));
			}
		}
	}
}

window.onload = function(e){
	var webGL = WebGL.getInstance();
	
	
	var circle=undefined;
	var cam;
	var f;
	webGL.onload(function(){
		console.log("loaded")
		//var circle = new Circle(webGL, 0, 0, -5);
		var c = new Chunk(webGL, 10);
		f = new Cube(webGL, 0, -18, 0, 30)
		
		cam = new Camera(webGL, 1.0, 1.0, 4.0);
		

	});

	// handle simple keyboard input
	var fMoveForward = 0.0;
	var fRotate = 0.0;
	document.addEventListener("keydown", function(){
		if( event.keyCode == 38) {
			fMoveForward = -1.0;
			console.log(event.keyCode)
		} else if( event.keyCode == 40) {
			fMoveForward = 1.0;
			console.log(event.keyCode)
		} else if( event.keyCode == 37) { //left arrow
			fRotate = -1.0;
			console.log(event.keyCode)
		} else if( event.keyCode == 39) { //right arrow
			fRotate = 1.0;
			console.log(event.keyCode)
		} else {
			fMoveForward = 0.0;
			fRotate = 0.0;
		}
	});

	document.addEventListener("keyup", function(){
		fMoveForward = 0.0;
		fRotate = 0.0;
	});

	var cDelta = 0.0;
	webGL.ontick(function(delta){
		//console.log('tick ', delta);
		cDelta += delta;
		cam.move(0.0, 0.0, fMoveForward*delta*0.05);
		cam.turn(0.0, fRotate*delta*0.003, 0.0);
		f.position.y = -18 + 0.5 * Math.sin(cDelta/180/5);

	});

	webGL.start(document.getElementById('GLCanvas'));


};


