var canvas;
var ctx;
var w;
var h;
var gameInterval;
var FPS;
var gameOver;
var gamePaused;
var taxi;
//Wird bis jetzt zur Wiedergeburtgebraucht - nötig!?
// Variablen die Ende des Levels bestimmen(Rundennummer, Zielplattform etc...)
var taxiStartx, taxiStarty;
var roundNumber;
var targetPlatform
var collisionText = "frei";

// Collector for 
var platforms, obstacles, guests, frames, staticSatellites, googleCars, drones, transmitter;

var taxiImage, brokenTaxiImage, goal, guest, guest2, edge, obstacle, background, fire, blocks20x10,
    platform_mid, platform_left, platform_right, droneImage, googleCarImage, transmitterImage, transmitterRadioImage,
    satelliteImage; 

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
	gameOver = false;
    gamePaused = false;
	roundNumber = 1;
	targetPlatform = 0;
	
	
	//collector initialisation
	platforms = new Array();
	obstacles = new Array();
	staticSatellites = new Array();
    googleCars = new Array();
    drones = new Array();
    transmitter = new Array();
	guests = new Array();
	for (i=0; i<3; i++){
		guests[i] = new Array;
	}
	frames = new Array();
	
    initObjects();

	//preloadAssets();
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
    brokenTaxiImage = addImage("assets/heli_absturz.png");
    goal = addImage("assets/goal.png");
    guest = addImage("assets/guest.png");
    guest2 = addImage("assets/guest2.png");
    edge = addImage("assets/block_r.png");
    obstacle = addImage("assets/block_a.png");
    background = addImage("assets/background3.png");
    fire = addImage("assets/feuer.png");
    blocks20x10 = addImage("assets/blocks20x10.png");
    platform_mid = addImage("assets/plattform_mitte.png");
    platform_left = addImage("assets/plattform_links.png");
    platform_right = addImage("assets/plattform_rechts.png");
    droneImage = addImage("assets/amazon_drone.png");
    googleCarImage = addImage("assets/google_car.png");
    transmitterImage = addImage("assets/sendemast_final.png");
    transmitterRadioImage = addImage("assets/strahlung_final.png");
    satelliteImage = addImage("assets/antenne_x.png");

    var checkResources = function () {
        // If everthing is preloaded go on and load the level
        if (_toPreload == 0)
            loadLevel("level1.txt");
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
            mainMenu();
        }
    }

    // Load level description from the folder "levels" with the name in the variable levelName
    xmlhttp.open("GET", "levels/"+levelName, true);
    xmlhttp.send();
}

function beginGameLoop() {
    // Begin the game loop
    var gameInterval = setInterval(function() {
        if(gameOver == false && gamePaused == false) {
            update();
        }
        draw();
    }, 1000/FPS);
}

function initObjects() {
    var strings = levelDataRaw;
    var levelRows = strings.split("\r\n");

    var verticalDronesFinished = new Array();
    for (X=0; X<levelXMax; X++){
        verticalDronesFinished[X] = new Array();
        for(Y=0; Y<levelYMax; Y++){
            verticalDronesFinished[X][Y] = false;
        }
    }

    for (y = 0; y < levelYMax; y++) {
        for (x = 0; x < levelXMax; x++) {

            switch(levelRows[y][x]){
            /*********************************Initialization platforms*********************************/
                case "<":
				case "#": //Platform
					var tempPlatform = {xStart: 0, xEnd: 0, yStart: 0, yEnd: 0, hasBegin: false, hasEnd: false};

                    tempPlatform.xStart = x * blockSizeX; tempPlatform.xEnd = x * blockSizeX + blockSizeX;
                    tempPlatform.yStart = y * blockSizeY; tempPlatform.yEnd = y * blockSizeY + blockSizeY;
					//check if platform has a begin-edge
					if(levelRows[y][x] == "<"){
						tempPlatform.hasBegin = true;
					}
                    //check end of platform and is end-edge exists 
                    var count = -1;
                    while(levelRows[y][x] == "#" || levelRows[y][x] == ">" || levelRows[y][x] == "<") {
                        x++;
                        count++;
						if(levelRows[y][x] == ">"){
							tempPlatform.hasEnd = true;
						}
                    }
					x--;
                    tempPlatform.xEnd += count * blockSizeX;

                    //add tempPlatform to platforms
                    platforms.push({
						id: platforms.length + 1,
                        xStart: tempPlatform.xStart, xEnd: tempPlatform.xEnd,
                        yStart: tempPlatform.yStart, yEnd: tempPlatform.yEnd,
						hasBegin: tempPlatform.hasBegin, hasEnd: tempPlatform.hasEnd,
						
						draw: function(){
							var boxes = (this.xEnd - this.xStart)/25;
							for(j=0; j < boxes; j++){
								if(j == 0 && this.hasBegin){
									ctx.drawImage(platform_left, 0, 0, platform_left.width, platform_left.height,
                                        this.xStart + (j * blockSizeX), this.yStart, blockSizeX, blockSizeY);
								}else if(j == boxes-1 && this.hasEnd){
									ctx.drawImage(platform_right, 0, 0, platform_right.width, platform_right.height,
                                        this.xStart + (j * blockSizeX), this.yStart, blockSizeX, blockSizeY);
								}else{
									ctx.drawImage(platform_mid, 0, 0, platform_mid.width, platform_mid.height, 
										this.xStart + (j * blockSizeX), this.yStart, blockSizeX, blockSizeY);
								}
							}
						}
                    });
                    break;

                case "R": //frame
                    frames.push({
                        xStart: x * blockSizeX, xEnd: x * blockSizeX + blockSizeX,
                        yStart: y * blockSizeY, yEnd: y * blockSizeY + blockSizeY,
						draw: function(){
							ctx.drawImage(edge, 0, 0, edge.width, edge.height, this.xStart, this.yStart, blockSizeX, blockSizeY);
						}});
                    break;

                /*********************************Extended Level elements******************************/
                case "X":  //static obstacle
                    staticSatellites.push({
                        xStart: x * blockSizeX, xEnd: x * blockSizeX + blockSizeX,
                        yStart: y * blockSizeY, yEnd: y * blockSizeY + blockSizeY,
						draw: function(){
							ctx.drawImage(satelliteImage, 0, 0, satelliteImage.width, satelliteImage.height, this.xStart, this.yStart, blockSizeX, blockSizeY);
						}});
                    break;

                case "M":  //static obstacle
                    transmitter.push({
                        xStart: x * blockSizeX, xEnd: x * blockSizeX + blockSizeX,
                        yStart: y * blockSizeY, yEnd: y * blockSizeY + blockSizeY,

                        draw: function(){
                            //ctx.drawImage(transmitterRadioImage, 0, 0, transmitterRadioImage.width, transmitterRadioImage.height, this.xStart + blockSizeX / 8, this.yStart - blockSizeY / 2.5, blockSizeX, blockSizeY);
                            ctx.drawImage(transmitterImage, 0, 0, transmitterImage.width, transmitterImage.height, this.xStart, this.yStart, blockSizeX, blockSizeY);

                        }});
                    break;

                /*case "F":
                    ctx.drawImage(fire, Math.floor(frame % 7) * fire.width / 7, 0, fire.width / 7, fire.height,
                                    x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;*/
					
                /*********************************Dynamic Level elements*******************************/
                // Taxi and guests
                // Diese Elemente mussen an sich dynamisch gezeichnet werden - hier nur für Demozwecke zeichnen

                //Vertical flying drone
                case "K":
                    if(verticalDronesFinished[x][y] == false) {
                        drones.push({
                            xStart: x * blockSizeX, xEnd: x * blockSizeX + blockSizeX,
                            yStart: y * blockSizeY, yEnd: y * blockSizeY + blockSizeY,
                            moveStart: y * blockSizeX, moveEnd: y * blockSizeX,
                            direction: "down",

                            update: function (){
                                if(this.direction == "down") {
                                    if(this.yEnd <= this.moveEnd) {
                                        this.yStart += 1; this.yEnd += 1;
                                    }
                                    else{
                                        this.direction = "up";
                                    }
                                }
                                if(this.direction == "up"){
                                    if(this.yStart >= this.moveStart) {
                                        this.yStart -= 1; this.yEnd -= 1;
                                    }
                                    else{
                                        this.direction = "down";
                                        //this.update();
                                    }
                                }
                            },

                            draw: function() {
                                ctx.drawImage(droneImage, Math.floor(frame % 16) *  droneImage.width / 16, 0, droneImage.width / 16, droneImage.height,
                                              this.xStart, this.yStart, blockSizeX, blockSizeY);
                            }
                        });

                        var count = 0;
                        var oldY = y;
                        y++;
                        while(levelRows[y][x] != "K") {
                            y++;
                            count++;
                        }

                        verticalDronesFinished[x][y] = true;

                        y = oldY;
                        drones[drones.length-1].moveEnd += count * blockSizeY + blockSizeY;
                    }

                    break;

                //Horizontal flying drone
                case "L":
                    drones.push({
                        xStart: x * blockSizeX, xEnd: x * blockSizeX + blockSizeX,
                        yStart: y * blockSizeY, yEnd: y * blockSizeY + blockSizeY,
                        moveStart: x * blockSizeX, moveEnd: x * blockSizeX,
                        direction: "right",

                        update: function (){
                            if(this.direction == "right") {
                                if(this.xEnd <= this.moveEnd) {
                                    this.xStart += 1; this.xEnd += 1;
                                }
                                else{
                                    this.direction = "left";
                                }
                            }
                            if(this.direction == "left"){
                                if(this.xStart >= this.moveStart) {
                                    this.xStart -= 1; this.xEnd -= 1;
                                }
                                else{
                                    this.direction = "right";
                                    //this.update();
                                }
                            }
                        },

                        draw: function() {
                            ctx.drawImage(droneImage, Math.floor(frame % 16) *  droneImage.width / 16, 0, droneImage.width / 16, droneImage.height,
                                          this.xStart, this.yStart, blockSizeX, blockSizeY);
                        }
                    });

                    var count = 1;
                    x++;
                    while(levelRows[y][x] != "L") {
                        x++;
                        count++;
                    }

                    drones[drones.length-1].moveEnd += count * blockSizeX + blockSizeX;
                    break;

                case "Y":
                    googleCars.push({
                        xStart: x * blockSizeX, xEnd: x * blockSizeX + blockSizeX,
                        yStart: y * blockSizeY, yEnd: y * blockSizeY + blockSizeY,
                        moveStart: x * blockSizeX, moveEnd: x * blockSizeX,
                        direction: "right",

                        update: function (){
                            if(this.direction == "right") {
                                if(this.xEnd <= this.moveEnd) {
                                    this.xStart += 1; this.xEnd += 1;
                                }
                                else{
                                    this.direction = "left";
                                }
                            }
                            if(this.direction == "left"){
                                if(this.xStart >= this.moveStart) {
                                    this.xStart -= 1; this.xEnd -= 1;
                                }
                                else{
                                    this.direction = "right";
                                    //this.update();
                                }
                            }
                        },

                        draw: function() {
                            if(this.direction == "right"){
                                ctx.drawImage(googleCarImage, Math.floor(frame % 4) *  googleCarImage.width / 4, 0, googleCarImage.width / 4, googleCarImage.height / 2,
                                              this.xStart, this.yStart, blockSizeX, blockSizeY);
                            }
                            else{
                                ctx.drawImage(googleCarImage, Math.floor(frame % 4) *  googleCarImage.width / 4, googleCarImage.height / 2, googleCarImage.width / 4, googleCarImage.height / 2,
                                              this.xStart, this.yStart, blockSizeX, blockSizeY);
                            }
                        }
                    });

                    var count = 1;
                    x++;
                    while(levelRows[y][x] != "Y") {
                        x++;
                        count++;
                    }

                    googleCars[googleCars.length-1].moveEnd += count * blockSizeX + blockSizeX;
                    break;

                case "T":
                    taxi = {
						x: x * blockSizeX,
						y: y * blockSizeY,

						//velocity towards x (vx) and y (vy)
						vx: 0,
						vy: 0,
						
						drawState: "up",

						// corners of taxi hitbox
						ru: { x: x * blockSizeX + blockSizeX, y: y * blockSizeY }, // -> right upper corner
						rd: { x: x * blockSizeX + blockSizeX, y: y * blockSizeY + blockSizeY }, // -> right down corner
						lu: { x: x * blockSizeX, y: y * blockSizeY }, // -> left up corner
						ld: { x: x * blockSizeX, y: y * blockSizeY + blockSizeY }, // -> left down corner

						
						collisionBottom: false,
						currPlatform:  0,
						
						passengers: 0,
						state: "free",
						
						update: function() {
							if(this.collisionBottom == false) {
								this.vy -= 3;	
							}
							
							this.drawState = "up";

							if(keydown.up) {
								this.vy += 10;
								this.collisionBottom = false;
								this.drawState = "up";
								this.currPlatform = 0;
							}
							if(keydown.down && this.collisionBottom == false) {
								this.vy -= 10;
							}
							if (keydown.left) {
								this.vx -= 7;
								this.drawState = "left";
							}
							if (keydown.right) {
								this.vx += 7;
								this.drawState = "right";
							}
							if(keydown.space) {
								// Zeit die Kufen auszufahren!!!

								console.log(platforms.length);
							}
						
							if(this.collisionBottom == true) {
								if(this.vx < -5) {
									this.vx += 5;
								}
								else {
									if(this.vx > 5) {
										this.vx -= 5;
									}
									else {
										this.vx = 0;
									}
								}
							}
							
							this.x += this.vx/200;
							this.y -= this.vy / 200;
							
							//                                                                     lu = left-up                     ru = right-up
							//Update of this corner position:                                       //---------------+---------------
								this.ru.x = this.x + blockSizeX; this.ru.y = this.y;                //         ___ /^^[___              
								this.rd.x = this.x + blockSizeX; this.rd.y = this.y + blockSizeY;   //        /|^+----+   |#___________//
								this.lu.x = this.x; this.lu.y = this.y;                             //      ( -+ |____|   _______-----+/
								this.ld.x = this.x; this.ld.y = this.y + blockSizeY;                //       ==_________--'            \
																									//          ~_|___|__
							// 															           ld = left-down                   rd = right-down
							
							for (var i = 0; i < platforms.length; i++) {

							/*Prüfung Landung*/
								if(checkOnPlatform(platforms[i].xStart, platforms[i].xEnd,
									platforms[i].yStart, platforms[i].yEnd,
									this.ld.x, this.rd.x, this.ld.y, this.rd.y)){
										this.currPlatform = platforms[i].id;
										break;
								}else{
									this.currPlatform = 0;
									this.collisionBottom = false;
								}
							}
							
							//update taxi attributes according to guests
							this.passengers = 0;
							for (i = 0; i < guests[roundNumber-1].length; i++){
								if(guests[roundNumber-1][i].state == "onTaxi")
									this.passengers++;
								if(taxi.passengers == guests[roundNumber-1].length){
									this.state = "full";
								}else{
									this.state = "free";
								}
							}
						},
						
						collides: function(obstXstart, obstXend, obstYstart, obstYend){
							if (checkCollision(obstXstart, obstXend, obstYstart, obstYend, this.lu.x, this.lu.y)||
								checkCollision(obstXstart, obstXend, obstYstart, obstYend, this.ld.x, this.ld.y)||
								checkCollision(obstXstart, obstXend, obstYstart, obstYend, this.ru.x, this.ru.y)||
								checkCollision(obstXstart, obstXend, obstYstart, obstYend, this.rd.x, this.rd.y)) {
								return true;
							}
							else {
								return false;
							}
						},
						
						//Heli going straight up
						draw: function(){
							switch(this.drawState){
								case "up":
									ctx.drawImage(taxiImage, Math.floor(frame % 5) *  taxiImage.width / 5, 0, taxiImage.width / 5, taxiImage.height / 3,
										  this.x, this.y, taxiImage.width / 5 / 2, taxiImage.height / 3 / 2);
									break;

								case "left":
									ctx.drawImage(taxiImage, Math.floor(frame % 5) *  taxiImage.width / 5, taxiImage.height / 3, taxiImage.width / 5, taxiImage.height / 3,
										  this.x, this.y, taxiImage.width / 5 / 2, taxiImage.height / 3 / 2);
									break;
        
								case "right":
									ctx.drawImage(taxiImage, Math.floor(frame % 5) *  taxiImage.width / 5, 2 * taxiImage.height / 3, taxiImage.width / 5, taxiImage.height / 3,
										  this.x, this.y, taxiImage.width / 5 / 2, taxiImage.height / 3 / 2);
									break;
									
								case "broken":
									taxi.vx = 0;
									taxi.vy = 0;
									ctx.drawImage(brokenTaxiImage, Math.floor(frame % 8) * brokenTaxiImage.width / 8, Math.floor(frame / 8) * brokenTaxiImage.height / 6,
										  brokenTaxiImage.width / 8, brokenTaxiImage.height / 6, this.x - 42, this.y - 47, brokenTaxiImage.width / 8 / 2, brokenTaxiImage.height / 6 / 2);
									frame += 0.2;
									if(frame > 48) {
										gameOverMenu();
									}
									break;
							}
						},
						
						death: function(){
							this.drawState = "broken";
							frame = 0;
							gameOver = true;
						}
					};
					break;
				
				case "1":
                case "2":
				case "3":
					var value = levelRows[y][x] - 1;

					guests[value].push({
						type: levelRows[y][x], state: "free", 
						currPlatform : 0, targetPlatform: 0,	//muss irgendwann später definiert werden, da dies immer wieder geschieht
						xStart: x * blockSizeX, x: x * blockSizeX,
						yStart: y * blockSizeY, y: y * blockSizeY,
						enterTaxi: function(taxiX){
							if(taxiX-this.x <0){
								this.x -= 1;
							}else{
								this.x += 1;
							}
						},
						update: function(){
							for (var i = 0; i < platforms.length; i++) {
								/*Prüfung Landung*/
								if(checkOnPlatform(platforms[i].xStart, platforms[i].xEnd,
									platforms[i].yStart, platforms[i].yEnd,
									this.x, this.x +blockSizeX, this.y + blockSizeY, this.y + blockSizeY)){
										this.currPlatform = platforms[i].id;
								}
							}
						},
						
						draw: function(){
										if(this.state == "free" && (this.type == roundNumber)){
											ctx.drawImage(guest, 0, 0, guest.width, guest.height, this.x, this.y, blockSizeX, blockSizeY);
										}
						}		
					});

					break;
            }//switch
        }//for x
    }//for y
    //guests.changeShownGuests(1);
}

// Run the init method when the document is loaded
document.addEventListener("DOMContentLoaded", preloadAssets, false);
