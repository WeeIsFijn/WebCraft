window.onload = () => {
	var game = new Webcraft.Gameloop( <HTMLCanvasElement> document.getElementById('GLCanvas') );

game.start();
}