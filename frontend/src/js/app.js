import {WebGL} from 'frontend/src/js/WebGL.js';


window.onload = function(e){
	var webGL = new WebGL(document.getElementById('GLCanvas'));
	webGL.start();
};

