import {Chunk} from 'frontend/src/js/Chunk.js';

export class World{

	constructor(gl) {
		this.chunkSize = 1;
		this.chunk = new Chunk(gl, 0, 0, -2);
		this.chunk2 = new Chunk(gl, 20, 0, -2);
		this.chunk3 = new Chunk(gl, 40, 0, -2);
		this.chunk4 = new Chunk(gl, 60, 0, -2);
	}


}