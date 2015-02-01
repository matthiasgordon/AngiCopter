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

	var x=0;
	var y=0;

	var taxi = {
		color: "#aa0000",
		x: w/2-10,
		y: h-20,
		width: 20,
		height: 20,
		draw: function() {
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x,this.y,this.width,this.height);
		}
	};



	$(document).bind("keydown", function() {});

	

	function draw() {
		ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
		taxi.draw();
	}

	function update() {
		if(keydown.up) {
			taxi.y -= 5;
		}
		if(keydown.down) {
			taxi.y += 5;
		}
		if (keydown.left) {
	    	taxi.x -= 5;
	  	}
	  	if (keydown.right) {
	    	taxi.x += 5;
	  	}
	  	if(keydown.space) {
	  		//Zeit die Kufen auszufahren!!!
	  	}
	}

	
	setInterval(function() {
 		update();
  		draw();
	}, 1000/FPS);


	



})