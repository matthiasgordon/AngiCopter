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
var collisionText = "frei";

// Collector for 
var obstructionCollector;

var taxiImage, goal, guest, guest2, edge, obstacle, background, fire, blocks20x10;

// Level ranges
var levelXMax;
var levelYMax;

// Size of a block
var blockSizeX;
var blockSizeY;

var frame;

function init(){
	canvas = $("#canvas")[0];
	ctx = canvas.getContext("2d");
	w = $("#canvas").width();
	h = $("#canvas").height();

    levelXMax = 32;
    levelYMax = 24; 
    blockSizeX = 25;
    blockSizeY = 25;

    frame = 0;

	FPS = 60;

	gameLost = false;

    obstructionCollector = new Array();

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

    // Function to preload all images and sounds
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
            // If everthing is preloaded go on and load the level
            if (_toPreload == 0)
                loadLevel("level10.txt");
            else
                setTimeout(checkResources, 200);
        }
        checkResources();

    }

    // Load the level description file and begin the game loop to draw the level
    function loadLevel(levelName) {
        var xmlhttp  = new XMLHttpRequest(); // code for IE7+, Firefox, Chrome, Opera, Safari
        
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                levelDataRaw = xmlhttp.responseText;
                //document.getElementById("level").innerHTML = xmlhttp.responseText;

                // Debugging message
                console.log("level loaded");

                // Begin the game loop
                setInterval(function() {
 					update();
  					draw();
					}, 1000/FPS);
            }
        }

        // Load level description from the folder "levels" with the name in the variable levelName
        xmlhttp.open("GET", "levels/"+levelName, true);
        xmlhttp.send();
    }

    // Draw the game
	function draw() {
        // Counting up the frame
		frame += 0.1;

		//ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );


		drawBackground();
		drawLevel();
		taxi.draw();

		//Only for debugging
		ctx.fillText("Debugging:",10,20);
		ctx.fillText("velocity Y = " + taxi.vy,10,40);
		//ctx.fillText("Lost game: " + gameLost, 10, 60);
		ctx.fillText("Lost game: " + collisionText, 10, 60);
	}

    // Update the position of the taxi
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
	  		// Zeit die Kufen auszufahren!!!
	  	}
	  	
	  	// Simulating gravity
	  	if(taxi.collisionBottom == false) {
	  		taxi.vy -= 3;	
	  	}

	  	taxi.x += taxi.vx/200;
	  	taxi.y -= taxi.vy/200;

        // After updating the position check if the is a collision
	  	checkCollision();
	}

    // Check if the is a collision
	function checkCollision() {
		if(taxi.y > h-taxi.height) {

			if(taxi.vy < -70) {
				gameLost = true;
			}

			taxi.vy = 0;
			taxi.collisionBottom = true;
			taxi.y = h-taxi.height;

		}

		for (var i = 0; i < obstructionCollector.length; i++) {
		    if (((taxi.y > obstructionCollector[i].yStart && taxi.y < obstructionCollector[i].yEnd) &&
                (taxi.x > obstructionCollector[i].xStart && taxi.x < obstructionCollector[i].xEnd)) ||
                ((taxi.y > obstructionCollector[i].yStart && taxi.y < obstructionCollector[i].yEnd) &&
                ((taxi.x - blockSizeX) > obstructionCollector[i].xStart && (taxi.x - blockSizeX) < obstructionCollector[i].xEnd))) {
		        gameLost = true;
		        collisionText = "bottom";
		        taxi.collisionBottom = true;
		        taxi.vy = 0;
		        taxi.y = obstructionCollector[i].yStart;
		    }
		    else if ((((taxi.y - blockSizeY) > obstructionCollector[i].yStart && (taxi.y - blockSizeY) < obstructionCollector[i].yEnd) &&
                (taxi.x > obstructionCollector[i].xStart && taxi.x < obstructionCollector[i].xEnd)) ||
                (((taxi.y - blockSizeY) > obstructionCollector[i].yStart && (taxi.y - blockSizeY) < obstructionCollector[i].yEnd) &&
                ((taxi.x - blockSizeX) > obstructionCollector[i].xStart && (taxi.x - blockSizeX) < obstructionCollector[i].xEnd)) ||
                ((taxi.y > obstructionCollector[i].yStart && taxi.y < obstructionCollector[i].yEnd) &&
                (taxi.x > obstructionCollector[i].xStart && taxi.x < obstructionCollector[i].xEnd)) ||
                ((taxi.y > obstructionCollector[i].yStart && taxi.y < obstructionCollector[i].yEnd) &&
                ((taxi.x - blockSizeX) > obstructionCollector[i].xStart && (taxi.x - blockSizeX) < obstructionCollector[i].xEnd))) {
		        gameLost = true;
		        collisionText = "tot";
		        death();
		    }
		}

	}

	function death() {
        taxi.x = w/2-10;
        taxi.y = h - 20;
        taxi.vy = 0;
        taxi.vx= 0;
	}

	function drawBackground() {
        //ctx.drawImage(background, 0, 0, background.width, background.height, 0, 0, cwidth, cheight);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, w, h);
    }

    // Draw the level depending on the level description file
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
                        obstructionCollector.push({type: "platform", xStart: x*blockSizeX-blockSizeX, xEnd: x*blockSizeX, 
                                                                     yStart: y*blockSizeY-blockSizeY, yEnd: y*blockSizeY});
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

// Run the init method when the document is loaded
document.addEventListener("DOMContentLoaded", init, false);