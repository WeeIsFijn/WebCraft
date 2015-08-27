import {WebGL} from 'frontend/src/js/WebGL.js';
import {Circle} from 'frontend/src/js/Circle.js';
import {Cube} from 'frontend/src/js/Cube.js';
import {Chunk} from 'frontend/src/js/Chunk.js';
import {World} from 'frontend/src/js/World.js';
import {Camera} from 'frontend/src/js/Camera.js';
import {Shader} from 'frontend/src/js/Shader.js';

export function Scene1(){
	console.log('exported function');
}

export function Scene2(){
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
		cam.turn(0.0, fRotate*delta*0.03, 0.0);
		f.position.y = -18 + 0.5 * Math.sin(cDelta/180/5);

	});

	webGL.start(document.getElementById('GLCanvas'));
}
}

// ---- Test cubes with and without predefined shaders ----
// 
export function Scene3(){

window.onload = function(e){
	var webGL = WebGL.getInstance();
	
	var cam;
	

	webGL.onload(function(){
		var shader = new Shader(webGL.gl);
		var fragmentShader = shader.compileFromScript('shader-fs-light');
		var vertexShader = shader.compileFromScript('shader-vs-light');
		shader.generateProgram(shader.compileFromScript('shader-vs-light'), shader.compileFromScript('shader-fs-light'));
		
		//var cube2 = new Cube(webGL, 2.0, 0.0, -1.0, 1.0, shader);
		//var cube = new Cube(webGL, -1.0, 0.0, -1.0, 1.0);
		var size = 5;
		var cubes = [];
		for(var i= -size/2; i< size/2; i++){
			for(var j= -size/2; j< size/2; j++){
				for(var k= -size/2; k< size/2; k++){
					cubes.push(new Cube(webGL, i, j, k - 1.5*size, 1.0, shader));
				}
			}
		}
		

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


	webGL.ontick(function(delta){
		cam.move(0.0, 0.0, fMoveForward*delta*0.05);
		cam.turn(0.0, fRotate*delta*0.003, 0.0);
	});

	webGL.start(document.getElementById('GLCanvas'));
}
}

export function Scene4(){

	window.onload = function(e){
		var webGL = WebGL.getInstance();
		var cam, c;
		webGL.onload(function(){
			var shader = new Shader(webGL.gl);
			var fragmentShader = shader.compileFromScript('shader-fs-light');
			var vertexShader = shader.compileFromScript('shader-vs-light');
			shader.generateProgram(shader.compileFromScript('shader-vs-light'), shader.compileFromScript('shader-fs-light'));
			//var cube2 = new Cube(webGL, 2.0, 0.0, -1.0, 1.0, shader);
			//var cube = new Cube(webGL, -1.0, 0.0, -1.0, 1.0);
			c = new Chunk(webGL);
			cam = new Camera(webGL, 1.0, 1.0, 4.0);
			cam.move(0.0, 0.0, 70.0);
		});

		// handle simple keyboard input
		var fMoveForward = 0.0;
		var fRotate = 0.0;
		document.addEventListener("keydown", function(){
			if( event.keyCode == 38) {
				fMoveForward = -1.0;
			} else if( event.keyCode == 40) {
				fMoveForward = 1.0;
			} else if( event.keyCode == 37) { //left arrow
				fRotate = -1.0;
			} else if( event.keyCode == 39) { //right arrow
				fRotate = 1.0;
			} else {
				fMoveForward = 0.0;
				fRotate = 0.0;
			}
		});

		document.addEventListener("keyup", function(){
			fMoveForward = 0.0;
			fRotate = 0.0;
		});

		var lastPageX, lastPageY;
		var fRotateY = 0;
		var fRotateX = 0;


		/*
		document.addEventListener('mousemove', function(event){
			var e = event || window.event;

			if(!lastPageX){ lastPageX = e.pageX; return; }
			if(!lastPageY){ lastPageY = e.pageY; return; }

			fRotateY = ( lastPageX - e.pageX );
			fRotateX = ( lastPageY - e.pageY );
			lastPageX = e.pageX;
			lastPageY = e.pageY;
			console.log('mouse move! ', fRotateY);
		});
		*/
	
		webGL.ontick(function(delta){
			cam.move(0.0, 0.0, fMoveForward*delta*0.01);
			c.turn(-fRotate*delta*0.000, fRotate*delta*0.001, 0.0);
			fRotateX = 0; fRotateY = 0;
		});

		webGL.start(document.getElementById('GLCanvas'));
	}
	};

export function Scene5(){

	window.onload = function(e){
		var webGL = WebGL.getInstance();
		var cam, c;
		webGL.onload(function(){
			var shader = new Shader(webGL.gl);
			var fragmentShader = shader.compileFromScript('shader-fs-light');
			var vertexShader = shader.compileFromScript('shader-vs-light');
			shader.generateProgram(shader.compileFromScript('shader-vs-light'), shader.compileFromScript('shader-fs-light'));
			//var cube2 = new Cube(webGL, 2.0, 0.0, -1.0, 1.0, shader);
			//var cube = new Cube(webGL, -1.0, 0.0, -1.0, 1.0);
			c = new World(webGL);
			cam = new Camera(webGL, 1.0, 1.0, 4.0);
			cam.move(0.0, 0.0, 70.0);
		});

		// handle simple keyboard input
		var fMoveForward = 0.0;
		var fRotate = 0.0;
		document.addEventListener("keydown", function(){
			if( event.keyCode == 38) {
				fMoveForward = -1.0;
			} else if( event.keyCode == 40) {
				fMoveForward = 1.0;
			} else if( event.keyCode == 37) { //left arrow
				fRotate = -1.0;
			} else if( event.keyCode == 39) { //right arrow
				fRotate = 1.0;
			} else {
				fMoveForward = 0.0;
				fRotate = 0.0;
			}
		});

		document.addEventListener("keyup", function(){
			fMoveForward = 0.0;
			fRotate = 0.0;
		});

		var lastPageX, lastPageY;
		var fRotateY = 0;
		var fRotateX = 0;


		/*
		document.addEventListener('mousemove', function(event){
			var e = event || window.event;

			if(!lastPageX){ lastPageX = e.pageX; return; }
			if(!lastPageY){ lastPageY = e.pageY; return; }

			fRotateY = ( lastPageX - e.pageX );
			fRotateX = ( lastPageY - e.pageY );
			lastPageX = e.pageX;
			lastPageY = e.pageY;
			console.log('mouse move! ', fRotateY);
		});
		*/
	
		webGL.ontick(function(delta){
			cam.move(0.0, 0.0, fMoveForward*delta*0.01);
			//c.turn(-fRotate*delta*0.000, fRotate*delta*0.001, 0.0);
			fRotateX = 0; fRotateY = 0;
		});

		webGL.start(document.getElementById('GLCanvas'));
	}


}