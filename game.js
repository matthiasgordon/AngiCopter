//ctx.fillStyle = "white";
//fillRect(X, Y, width, height);
//ctx.fillRect(0, 0, w, h);
//ctx.strokeStyle = "black";
//ctx.strokeRect(0, 0, w, h);
var canvas;
var ctx;
var w;
var h;
var interval;
var FPS;
var gameLost;
var taxi;

var taxiImage, goal, guest, guest2, edge, obstacle, background, fire, blocks20x10;

         // Level ranges
var levelXMax = 32;
var levelYMax = 24; 
var blockSizeX = 25;
var blockSizeY = 25;
var frame = 0;

function init(){
	canvas = $("#canvas")[0];
	ctx = canvas.getContext("2d");
	w = $("#canvas").width();
	h = $("#canvas").height();


	FPS = 60;

	gameLost = false;


	taxi = {
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
			ctx.drawImage(taxiImage, 0, 0, taxiImage.width, taxiImage.height, this.x, this.y, blockSizeX, blockSizeY);
		}
	};

	



	preloadAssets();

}

	function preloadAssets() {
        var _toPreload = 0;

        var addImage = function (src) {

            var img = new Image();
            img.src = src;
            _toPreload++;

            img.addEventListener('load', function () {
                _toPreload--;
            }, false);
            return img;
        }

        
        taxiImage = addImage("assets/taxi.png");
        goal = addImage("assets/goal.png");
        guest = addImage("assets/guest.png");
        guest2 = addImage("assets/guest2.png");
        edge = addImage("assets/block_r.png");
        obstacle = addImage("assets/block_a.png");
        background = addImage("assets/starfield.png");
        fire = addImage("assets/feuer.png");
        blocks20x10 = addImage("assets/blocks20x10.png");

        var checkResources = function () {
            if (_toPreload == 0)
                loadLevel("level10.txt");
            else
                setTimeout(checkResources, 200);
        }
        checkResources();

    }

    function loadLevel(levelName) {
        var xmlhttp  = new XMLHttpRequest(); // code for IE7+, Firefox, Chrome, Opera, Safari
        
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                levelDataRaw = xmlhttp.responseText;
                document.getElementById("level").innerHTML = xmlhttp.responseText;

                console.log("level loaded");
                setInterval(function() {
 					update();
  					draw();
					}, 1000/FPS);
            }
        }

        xmlhttp.open("GET", "levels/"+levelName, true);
        xmlhttp.send();
    }

	function draw() {
		frame += 0.1;
		//ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
		drawBackground();
		drawLevel();
		taxi.draw();

		//Only for debugging
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
	    	taxi.vx -= 3;
	  	}
	  	if (keydown.right) {
	    	taxi.vx += 3;
	  	}
	  	if(keydown.space) {
	  		//Zeit die Kufen auszufahren!!!
	  	}
	  	
	  	//simulating gravity
	  	if(taxi.collisionBottom == false) {
	  		taxi.vy -= 3;	
	  	}

	  	taxi.x += taxi.vx/20;
	  	taxi.y -= taxi.vy/20;

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

	function drawBackground() {
        //ctx.drawImage(background, 0, 0, background.width, background.height, 0, 0, cwidth, cheight);
        ctx.fillStyle = "#00FF00";
        ctx.fillRect(0, 0, w, h);
    }

    function drawLevel() {
        var strings = levelDataRaw;
        var levelRows = strings.split("\r\n");

        for (y = 0; y < levelYMax; y++) {
            for (x = 0; x < levelXMax; x++) {

                switch(levelRows[y][x]){
                    //Basic Level elements
                    case ".": //Nothing
                        //ctx.fillStyle = "#AAAA00";
                        //ctx.fillRect(x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                        break;
                    case "#": //Platform
                        ctx.fillStyle = "#AAAAAA";
                        ctx.fillRect(x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                        break;
                    case "R": //frame
                        ctx.drawImage(edge, 0, 0, edge.width, edge.height, x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                        break;

                    //Extended Level Elements                             
                    case "A": 
                        ctx.drawImage(obstacle, 0, 0, obstacle.width, obstacle.height, x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                        break;

                    case "F":
                        ctx.drawImage(fire, Math.floor(frame % 7) * fire.width / 7, 0, fire.width / 7, fire.height,
				                             x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                        break;
                    
                    //Jungle platform <===>
                    case "<":
                        ctx.drawImage(blocks20x10, blocks20x10.width / 20 * 5, blocks20x10.height / 10 * 1, blocks20x10.width / 20, blocks20x10.height / 10,
                                            x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                        break;
                    
                    case "=":
                        var indexx = 6, indexy = 1;
                        ctx.drawImage(blocks20x10, blocks20x10.width / 20 * indexx, blocks20x10.height / 10 * indexy, blocks20x10.width / 20, blocks20x10.height / 10,
                                            x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                        break;

                    case ">":
                        var indexx = 10, indexy = 1;
                        ctx.drawImage(blocks20x10, blocks20x10.width / 20 * indexx, blocks20x10.height / 10 * indexy, blocks20x10.width / 20, blocks20x10.height / 10,
                                            x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                        break;

                    // Dynamic level elements
                    // Taxi and guests
                    // Diese Elemente mussen an sich dynamisch gezeichnet werden - hier nur für Demozwecke zeichnen
                   /* case "1":
                        ctx.drawImage(taxi, 0, 0, taxi.width, taxi.height, x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                        break;
*/
                    case "2":
                        ctx.drawImage(guest, 0, 0, guest.width, guest.height, x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                        break;

                    case "3":
                        ctx.drawImage(guest2, Math.floor(frame % 2) * guest2.width / 2, 0, guest2.width / 2, guest2.height,
				                             x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                        break;

                }//switch
            }//for x
        }//for y

    }

	
	


	


document.addEventListener("DOMContentLoaded", init, false);
