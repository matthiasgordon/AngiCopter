var canvas;
var ctx;
var w;
var h;
var interval;
var FPS;
var gameLost;
var taxi;
//Wird bis jetzt zur Wiedergeburtgebraucht - nötig!?
// Variablen die Ende des Levels bestimmen(Rundennummer, Zielplattform etc...)
var taxiStartx, taxiStarty;
var roundNumber;
var targetPlatform
var collisionText = "frei";

// Collector for 
var platformCollector;
var obstacleCollector;
var guestCollector;

var taxiImage, goal, guest, guest2, edge, obstacle, background, fire, blocks20x10;

// Level ranges
var levelXMax;
var levelYMax;

// Size of a block
var blockSizeX;
var blockSizeY;

var frame;

function init(){
    //Canvas start
    canvas = $("#canvas")[0];
	ctx = canvas.getContext("2d");
	w = $("#canvas").width();
	h = $("#canvas").height();

    // settings of level
    levelXMax = 32;
    levelYMax = 24; 
    blockSizeX = 25;
    blockSizeY = 25;

    // settings for frame-rate
    frame = 0;
	FPS = 60;

    //variable
	gameLost = false;
	roundNumber = 1;
	targetPlatform = Math.floor((Math.random() * 3) + 1);
	document.getElementById("target").innerHTML ="Zielplattform:" + targetPlatform;
	

	platformCollector = new Array();
	obstacleCollector = new Array();
	guestCollector = new Array();

    // taxi-object
	taxi = {
		x: w/2-10,
		y: h-20,

		//velocity towards x (vx) and y (vy)
		vx: 0,
		vy: 0,
		
		direction: "up",

	    // corners of taxi hitbox
		ru: { x: w/2-10 + blockSizeX, y: h-20 }, // -> right upper corner
		rd: { x: w/2-10 + blockSizeX, y: h - 20 + blockSizeY }, // -> right down corner
		lu: { x: w / 2 - 10, y: h - 20 }, // -> left up corner
		ld: { x: w / 2 - 10, y: h - 20 + blockSizeY }, // -> left down corner

		collisionBottom: false,
		currPlatform: 0,
		state: "free",

		//Heli going straight up
        drawUp: function() {
            ctx.drawImage(taxiImage, Math.floor(frame % 5) *  taxiImage.width / 5, 0, taxiImage.width / 5, taxiImage.height / 3,
                          this.x, this.y, taxiImage.width / 5 / 2, taxiImage.height / 3 / 2);
        },

        //Heli going left
        drawLeft: function() {
            ctx.drawImage(taxiImage, Math.floor(frame % 5) *  taxiImage.width / 5, taxiImage.height / 3, taxiImage.width / 5, taxiImage.height / 3,
                          this.x, this.y, taxiImage.width / 5 / 2, taxiImage.height / 3 / 2);
        },

        //Heli going right
        drawRight: function() {
            ctx.drawImage(taxiImage, Math.floor(frame % 5) *  taxiImage.width / 5, 2 * taxiImage.height / 3, taxiImage.width / 5, taxiImage.height / 3,
                          this.x, this.y, taxiImage.width / 5 / 2, taxiImage.height / 3 / 2);
        }
	};
	
    //Guests object
/*	guests = {
		position: {},
		currPlatform: {},

		draw: function() {
            for(i = 0; i < this.position.length; i++) {
                 ctx.drawImage(guest, 0, 0, guest.width, guest.height,
                               this.position[i].xStart, this.position[i].yStart, blockSizeX, blockSizeY);
            }
		},

        changeShownGuests: function(guestNumber) {
            this.position = [];
            for(i = 0; i < guestCollector.length; i++) {
                if(guestCollector[i].type == "guest_"+guestNumber) {
                    this.position.push({xStart: guestCollector[i].xStart, xEnd: guestCollector[i].xEnd,
                                        yStart: guestCollector[i].yStart, yEnd: guestCollector[i].yEnd});
                }
            }
        }
	}*/

	preloadAssets();
}

// Function to preload all images and sounds
function preloadAssets() {
    var _toPreload = 0;

    var addImage = function (src) {

        var img = new Image();
        img.src = src;
        _toPreload++;

        img.addEventListener('load', function () { _toPreload--;}, false);
        return img;
    }

    taxiImage = addImage("assets/sprite_sheet_heli.png");
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
            loadLevel("level4.txt");
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

            initObjects();
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

function initObjects() {
    var strings = levelDataRaw;
    var levelRows = strings.split("\r\n");
    var tempPlatform = {
        xStart: 0,
        xEnd: 0,
        yStart: 0,
        yEnd: 0
    };

    for (y = 0; y < levelYMax; y++) {
        for (x = 0; x < levelXMax; x++) {

            switch(levelRows[y][x]){
            /*********************************Basic Level elements*********************************/
                case "#": //Platform
                    tempPlatform.xStart = x * blockSizeX; tempPlatform.xEnd = x * blockSizeX + blockSizeX;
                    tempPlatform.yStart = y * blockSizeY; tempPlatform.yEnd = y * blockSizeY + blockSizeY;

                    //check end of platform and save in tempPlatform
                    var count = -1;
                    while(levelRows[y][x] == "#") {
                        x++;
                        count++;
                    }
                    tempPlatform.xEnd += count * blockSizeX;

                    //add tempPlatform to platformCollector
                    platformCollector.push({
						id: platformCollector.length + 1,
                        xStart: tempPlatform.xStart, xEnd: tempPlatform.xEnd,
                        yStart: tempPlatform.yStart, yEnd: tempPlatform.yEnd
                    });
                    break;

                case "R": //frame
                    obstacleCollector.push({
						type: "frame",
                        xStart: x * blockSizeX, xEnd: x * blockSizeX + blockSizeX,
                        yStart: y * blockSizeY, yEnd: y * blockSizeY + blockSizeY});
                    break;

                /*********************************Extended Level elements******************************/
                case "X":  //static obstacle
                    obstacleCollector.push({
						type: "static_obstacle",
                        xStart: x * blockSizeX, xEnd: x * blockSizeX + blockSizeX,
                        yStart: y * blockSizeY, yEnd: y * blockSizeY + blockSizeY});
                    break;

                /*case "F":
                    ctx.drawImage(fire, Math.floor(frame % 7) * fire.width / 7, 0, fire.width / 7, fire.height,
                                    x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;*/
                    
                //Jungle platform <===>
                case "<":
                    obstacleCollector.push({
						type: "platform_edge",
                        xStart: x * blockSizeX, xEnd: x * blockSizeX + blockSizeX,
                        yStart: y * blockSizeY, yEnd: y * blockSizeY + blockSizeY});
                    break;
                    
                /*case "=":
                    var indexx = 6, indexy = 1;
                    ctx.drawImage(blocks20x10, blocks20x10.width / 20 * indexx, blocks20x10.height / 10 * indexy, blocks20x10.width / 20, blocks20x10.height / 10,
                                        x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;*/

                case ">":
                    obstacleCollector.push({
						type: "platform_edge",
                        xStart: x * blockSizeX, xEnd: x * blockSizeX + blockSizeX,
                        yStart: y * blockSizeY, yEnd: y * blockSizeY + blockSizeY});
                    break;

                /*********************************Dynamic Level elements*******************************/
                // Taxi and guests
                // Diese Elemente mussen an sich dynamisch gezeichnet werden - hier nur für Demozwecke zeichnen
                case "T":
                    taxi.x = x * blockSizeX; taxiStartx = x * blockSizeX;
                    taxi.y = y * blockSizeY; taxiStarty = y * blockSizeY;
                    //ctx.drawImage(taxi, 0, 0, taxi.width, taxi.height, x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;
                    
                case "1":
					guestCollector.push({
							type: "guest_1", state: "free", currPlatform : 0, //muss irgendwann später definiert werden, da dies immer wieder geschieht
							xStart: x * blockSizeX, x: x * blockSizeX,
							yStart: y * blockSizeY, y: y * blockSizeY});
						break;

               /* case "2":
                    guestCollector.push({
                            type: "guest_2",
                            xStart: x * blockSizeX, xEnd: x * blockSizeX + blockSizeX,
                            yStart: y * blockSizeY, yEnd: y * blockSizeY + blockSizeY});
                        break;
						
                case "3":
                    guestCollector.push({
							type: "guest_3",
							xStart: x * blockSizeX, xEnd: x * blockSizeX + blockSizeX,
							yStart: y * blockSizeY, yEnd: y * blockSizeY + blockSizeY});
						break; */
            }//switch
        }//for x
    }//for y
    //guests.changeShownGuests(1);
}

// Run the init method when the document is loaded
document.addEventListener("DOMContentLoaded", init, false);