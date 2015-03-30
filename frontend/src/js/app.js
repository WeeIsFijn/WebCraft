import {WebGL} from 'frontend/src/js/WebGL.js';
import {Circle} from 'frontend/src/js/Circle.js';
import {Cube} from 'frontend/src/js/Cube.js';
import {Camera} from 'frontend/src/js/Camera.js';

window.onload = function(e){
	var webGL = WebGL.getInstance();
	
	
	var circle=undefined;
	var cam;

	webGL.onload(function(){
		console.log("loaded")
		//var circle = new Circle(webGL, 0, 0, -5);
		var circle2 = new Cube(webGL, 1, 0, -5);
		cam = new Camera(webGL, 1.0, 1.0, 4.0);
		

	});

	// handle simple keyboard input
	var fMoveForward = 0.0;
	var fRotate = 0.0
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

	webGL.ontick(function(delta){
		//console.log('tick ', delta);
		cam.move(0.0, 0.0, fMoveForward*delta*0.005);
		cam.turn(0.0, fRotate*delta*0.001, 0.0)

	});

	webGL.start(document.getElementById('GLCanvas'));


};


