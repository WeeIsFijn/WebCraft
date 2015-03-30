import {WebGL} from 'frontend/src/js/WebGL.js';
import {Circle} from 'frontend/src/js/Circle.js';
import {Cube} from 'frontend/src/js/Cube.js';

window.onload = function(e){
	var webGL = WebGL.getInstance();
	
	
	var circle=undefined;

	webGL.onload(function(){
		console.log("loaded")
		//var circle = new Circle(webGL, 0, 0, -5);
		var circle2 = new Cube(webGL, 1, 0, -5);

	});

	webGL.start(document.getElementById('GLCanvas'));


};

