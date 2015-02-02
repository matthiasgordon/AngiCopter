//ctx.fillStyle = "white";
//fillRect(X, Y, width, height);
//ctx.fillRect(0, 0, w, h);
//ctx.strokeStyle = "black";
//ctx.strokeRect(0, 0, w, h);

$(document).ready(function(){
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");
	var w = $("#canvas").width();
	var h = $("#canvas").height();

	var interval;
	var FPS = 30;

	var gameLost = false;


	var taxi = {
		color: "#aa0000",
		x: w/2-10,
		y: h-20,

		//velocity towards x (vx) and y (vy)
		vx: 0,
		vy: 0,

		collisionBottom: false,

		width: 20,
		height: 20,
		draw: function() {
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x,this.y,this.width,this.height);
		}
	};



	function draw() {
		ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
		taxi.draw();
		ctx.fillText("Debugging:",10,20);
		ctx.fillText("velocity Y = " + taxi.vy,10,40);
		ctx.fillText("Lost game: " + gameLost,10,60);
	}

	function update() {
		if(keydown.up) {
			taxi.vy += 6;
			taxi.collisionBottom = false;
		}
		if(keydown.down && taxi.collisionBottom == false) {
			taxi.vy -= 6;
		}
		if (keydown.left) {
	    	taxi.vx -= 6;
	  	}
	  	if (keydown.right) {
	    	taxi.vx += 6;
	  	}
	  	if(keydown.space) {
	  		//Zeit die Kufen auszufahren!!!
	  	}
	  	
	  	//simulating gravity
	  	if(taxi.collisionBottom == false) {
	  		taxi.vy -= 3;	
	  	}

	  	taxi.x += taxi.vx/10;
	  	taxi.y -= taxi.vy/10;

	  	checkCollision();
	}

	function checkCollision() {
		if(taxi.y > h-taxi.height) {

			if(taxi.vy < -70) {
				gameLost = true;
			}

			taxi.vy = 0;
			taxi.collisionBottom = true;
			taxi.y = h-taxi.height;

			
		}
	}

	
	setInterval(function() {
 		update();
  		draw();
	}, 1000/FPS);


	



})