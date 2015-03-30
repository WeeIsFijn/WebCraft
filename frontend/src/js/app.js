import {WebGL} from 'frontend/src/js/WebGL.js';
import {VisObject} from 'frontend/src/js/VisObject.js';


window.onload = function(e){
	var webGL = WebGL.getInstance();
	webGL.start(document.getElementById('GLCanvas'));
	var visObj = new VisObject(1,1,1);


};

