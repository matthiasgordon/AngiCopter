$(document).ready(function(){
	//Canvas stuff
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");
	var w = $("#canvas").width();
	var h = $("#canvas").height();

	//ctx.fillStyle = "white";
	//fillRect(X, Y, width, height);
	//ctx.fillRect(0, 0, w, h);
	//ctx.strokeStyle = "black";
	//ctx.strokeRect(0, 0, w, h);

	ctx.fillStyle = "black";
	ctx.fillRect(390,580,20,20);

	var x=0;
	var y=0;

	document.addEventListener("keydown",keyDownHandler, false);

	function keyDownHandler(event) {
		var keyPressed = String.fromCharCode(event.keyCode);

		if(keyPressed == "W") {
			x = x + 5;
			ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
			ctx.fillStyle = "black";
			ctx.fillRect(390-y,580-x,20,20);
		}

		if(keyPressed == "S") {
			x = x - 5;
			ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
			ctx.fillStyle = "black";
			ctx.fillRect(390-y,580-x,20,20);
		}

		if(keyPressed == "A") {
			y = y + 5;
			ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
			ctx.fillStyle = "black";
			ctx.fillRect(390-y,580-x,20,20);
		}

		if(keyPressed == "D") {
			y = y - 5;
			ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
			ctx.fillStyle = "black";
			ctx.fillRect(390-y,580-x,20,20);
		}
	}

})