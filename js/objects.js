/*
* Copyright 2015 Matthias Gordon, Marc Niedermeier and Matthias Wiegand
* 
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* 
*     http://www.apache.org/licenses/LICENSE-2.0
* 
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

var game;
var sidebar, menu, taxi, platforms, obstacles, guests, frames, exits, staticSatellites, powerUps, googleCars, drones, transmitters;

/*********************************Initialization of general game objects*************************************************/
/************************************************************************************************************************/
function initGame(){
    /*********************Initialization of game object*********************/
	game = {
		width:  $("#canvas").width()-150, levelXMax: 32,  blockSize: 25,
		height: $("#canvas").height(),    levelYMax: 24, 
		
		frame: 0,
		FPS: 60,
		
		levelNumber: 1,	targetPlatform: 0,
		roundNumber: 1, state: "running",
        powerUpTimer: 1000,
        soundEnabled: true,
		
		drawBackground: function(){
			ctx.drawImage(background, 0, 0, background.width, background.height, 0, 0, game.width, game.height);
		},
		
		update: function(){
			//updating roundNumber if all previous guests have been delivered
			var counter = 0;
			for (i = 0; i < guests[this.roundNumber-1].length; i++){
				if (guests[this.roundNumber-1][i].state == "delivered"){
					counter++;
				}
			}
			if(counter == guests[this.roundNumber-1].length){
				this.roundNumber++;	
			}
			//updating targetPlatform
			if(taxi.state == "full"){
				if(this.roundNumber < guests.length){
					this.targetPlatform = guests[this.roundNumber][0].currPlatform;
				}else{
					this.targetPlatform = -1;
				}
			}
			
            //Counting down the powerup timer
            if(this.powerUpTimer != 0) {
                this.powerUpTimer -= 1;
            }

            //If powerup timer is 0, disable the powerupstate
            if(this.powerUpTimer == 0) {
                taxi.powerUpState = "none";
            }
		},
		
        //Function to reset the level if the game is lost or the next level initialized
		reset: function(){
			taxi.x = taxi.xBegin;	taxi.state = "free";	taxi.vx = 0; 	taxi.health = 100;
			taxi.y = taxi.yBegin;	taxi.passengers = 0;	taxi.vy = 0;	taxi.drawState = "up";	
			
			game.state = "running";	this.roundNumber = 1; 	this.targetPlatform = 0;	this.frame = 0;			
			
			for (i=0; i < guests.length; i++){
				for(j=0; j < guests[i].length; j++){
					guests[i][j].x = guests[i][j].xStart;
					guests[i][j].y = guests[i][j].yStart;
					guests[i][j].state = "free";
					guests[i][j].direction = "standing";
				}
			}
			
			for(i=0; i < exits.length; i++){
				exits[i].state = "visible";
			}
			
            this.playSoundLoop(backgroundsong);
            this.playSoundLoop(helicopter);

            taxi.powerUpTimer = "none";
		},

		//Begin the game loop
		beginGameLoop: function() {
			var gameInterval = setInterval(function() {
                //Update the game if the gamestate is "running" and not "paused" or "over" 
				if(game.state == "running") {
                    //Update all objects
				    update();
				}
                //Draw all objects
			    draw();
                //1000/game FPS regulates how often the gameloop is called every second
			}, 1000/game.FPS);
		},

        //Functions to control the sound files
        playSoundLoop: function(soundID) {
            soundID.pause();
            soundID.currentTime = 0;
            soundID.loop = true;
            soundID.play();
        },

        playSound: function(soundID) {
            soundID.pause();
            soundID.currentTime = 0;
            soundID.play();
        },

        stopSound: function(soundID) {
            soundID.pause();
        },

        muteSounds: function() {
            backgroundsong.muted = true;
            intro.muted = true;
            explosion.muted = true;
            helicopter.muted = true;
            neuland.muted = true;
        },

        unmuteSounds: function() {
            backgroundsong.muted = false;
            intro.muted = false;
            explosion.muted = false;
            helicopter.muted = false;
            neuland.muted = false;
        }
	}
    /*********************Initialization of sidebar object*********************/
    sidebar = {
        width: $("#canvas").width() - game.width,
        height: game.height,

        xStart: game.width, xEnd: $("#canvas").width(),
        yStart: 0, yEnd: game.height,

        draw: function(){
            //Draw background of sidebar
            ctx.fillStyle = "#232323";
            ctx.fillRect(this.xStart,this.yStart,this.width,this.height);
			
            //Draw remaining lifes
			for(i = 0; i < taxi.lives; i++){
				ctx.drawImage(lifeImage, 0, 0, lifeImage.width, lifeImage.height, this.xEnd-115, this.yEnd - 45 - (i*30), game.blockSize, game.blockSize);
			}
			
            //Draw health bar background
            ctx.fillStyle = "#FFFFFF";
			ctx.fillRect(this.xEnd - 70, this.yEnd - 230, 50, 210);

            //Draw health bar
            if(taxi.health > 0) {
				var grd = ctx.createLinearGradient(0,650,0,0);
				grd.addColorStop(0,"#FF0000");
				grd.addColorStop(1,"#FFFF00");
                ctx.fillStyle = grd;
                ctx.fillRect(this.xEnd - 65, this.yEnd - 25, 40, -(2 * taxi.health));
            }
        }
    }
    /*********************Initialization of menu object*********************/
    menu = {
        //Initialization of menu elements
        mainMenu: $('#main'),
        gameOverMenu: $('#game-over'),
        gamePausedMenu: $('#game-paused'),
        gameWonMenu: $('#game-won'),

        //Initialization of buttons
        playButton: $('.play'),
        restartButton: $('.restart'),
		nextLevelButton: $('.nextLevel'),
        continueButton: $('.continue'),
        muteButton: $('.muteButton'),

        //Function to give the buttons a click listener
        initButtons: function() {
            this.playButton.click(function() {
                menu.mainMenu.hide();
                game.stopSound(intro);
                game.state = "running";
                game.beginGameLoop();
                game.playSoundLoop(backgroundsong);
                game.playSoundLoop(helicopter);
            });

            this.restartButton.click(function() {
                game.stopSound(neuland);
                menu.gameOverMenu.hide();
				menu.gameWonMenu.hide();
                game.state = "running";
                game.reset();
				loadLevel("level1.txt");
				game.levelNumber = 1;
				taxi.lives = 3;
            });

            this.continueButton.click(function() {
                menu.gamePausedMenu.hide();
                game.state = "running";
                game.playSound(helicopter);
            });
			
			this.nextLevelButton.unbind('click').click(function(){
				menu.gameWonMenu.hide();
				game.reset();
				var nextLevel;
				if (game.levelNumber < 5){
					nextLevel = "level" + (game.levelNumber + 1) + ".txt";
				}else{
					nextLevel = "level1.txt";
				}
				loadLevel(nextLevel);
				game.levelNumber++;
			});

            this.muteButton.unbind('click').click(function(){
                if(game.soundEnabled == true) {
                    game.muteSounds();
                    game.soundEnabled = false;
                    muteButton.src="assets/sound_aus.png";
                }
                else{
                    game.unmuteSounds();
                    game.soundEnabled = true;
                    muteButton.src="assets/sound_an.png";
                }
            });
        },
        
        //Menus are hidden as default
        //These functions are able to show them one at a time
        showMainMenu: function() {
            this.mainMenu.show();
            game.playSoundLoop(intro);
        },

        showGameOverMenu: function() {
            this.gameOverMenu.show();
            game.playSound(neuland);
        },

        showGamePausedMenu: function() {
            this.gamePausedMenu.show();
            game.stopSound(helicopter);
        },

        showGameWonMenu: function() {
            this.gameWonMenu.show();
        }
    }
}
/*********************************Initialization of level objects*************************************************/
/*****************************************************************************************************************/
function initObjects() {
    var strings = levelDataRaw;
    var levelRows = strings.split("\r\n");
	
    //Keeps track of which drone elements already have been used
    //Three dimensional array with fields for each block in the level
    var verticalDronesFinished = new Array();
    for (X = 0; X < game.levelXMax; X++){
        verticalDronesFinished[X] = new Array();
        for(Y = 0; Y < game.levelYMax; Y++){
            verticalDronesFinished[X][Y] = false;
        }
    }

    //Loop through every block in the level description
    for (y = 0; y < game.levelYMax; y++) {
        for (x = 0; x < game.levelXMax; x++) {

            switch(levelRows[y][x]){
                //Finding new platforms to add to the platform collector

                case "<": //Platform beginning tile
				case "#": //Platform mid tile
					var tempPlatform = {xStart: 0, xEnd: 0, yStart: 0, yEnd: 0, hasBegin: false, hasEnd: false};

                    tempPlatform.xStart = x * game.blockSize; tempPlatform.xEnd = x * game.blockSize + game.blockSize;
                    tempPlatform.yStart = y * game.blockSize; tempPlatform.yEnd = y * game.blockSize + game.blockSize;

					//check if platform has a begin-edge
					if(levelRows[y][x] == "<"){
						tempPlatform.hasBegin = true;
					}
                    //check end of platform and if end-edge exists 
                    var count = -1;
                    while(levelRows[y][x] == "#" || levelRows[y][x] == ">" || levelRows[y][x] == "<") {
                        x++;
                        count++;
						if(levelRows[y][x] == ">"){
							tempPlatform.hasEnd = true;
						}
                    }
					x--;

                    //Update platform end to get the whole size of the platform
                    tempPlatform.xEnd += count * game.blockSize;

                    //add tempPlatform to platforms
                    /*********************************Initialization of platforms*************************************************/
                    platforms.push({
						id: platforms.length + 1,
                        xStart: tempPlatform.xStart, xEnd: tempPlatform.xEnd,	xDraw: tempPlatform.xStart,
                        yStart: tempPlatform.yStart, yEnd: tempPlatform.yEnd,	yDraw: tempPlatform.yStart,
						hasBegin: tempPlatform.hasBegin, hasEnd: tempPlatform.hasEnd,
						
						draw: function(){
							var boxes = (this.xEnd - this.xStart)/25;
							for(j=0; j < boxes; j++){
                                //Drawing the different variations of platforms
                                //Also checking if the platform is the target platfrom at the moment and then letting it blink
                                //with the help of a spritesheet
								if(j == 0 && this.hasBegin){
                                    if(this.id == game.targetPlatform && taxi.state == "full") {
                                        ctx.drawImage(platform_blink_spritesheet, Math.floor(game.frame % 20) * 75, 0, 
                                                      platform_blink_spritesheet.width / 60, platform_blink_spritesheet.height,
                                                      this.xDraw + (j * game.blockSize), this.yDraw, game.blockSize, game.blockSize);
                                    }
                                    else{
                                        ctx.drawImage(platform_left, 0, 0, platform_left.width, platform_left.height,
                                                      this.xDraw + (j * game.blockSize), this.yDraw, game.blockSize, game.blockSize);
                                    }
								}else if(j == boxes-1 && this.hasEnd){
                                    if(this.id == game.targetPlatform && taxi.state == "full") {
									    ctx.drawImage(platform_blink_spritesheet, Math.floor(game.frame % 20) * 75 + 50, 0, 
                                                      platform_blink_spritesheet.width / 60, platform_blink_spritesheet.height,
                                                      this.xDraw + (j * game.blockSize), this.yDraw, game.blockSize, game.blockSize);
                                    }
                                    else {
                                        ctx.drawImage(platform_right, 0, 0, platform_right.width, platform_right.height,
                                                      this.xDraw + (j * game.blockSize), this.yDraw, game.blockSize, game.blockSize);
                                    }
								}else{
                                    if(this.id == game.targetPlatform && taxi.state == "full") {
                                    ctx.drawImage(platform_blink_spritesheet, Math.floor(game.frame % 20) * 75 + 25, 0, 
                                                  platform_blink_spritesheet.width / 60, platform_blink_spritesheet.height, 
										          this.xDraw + (j * game.blockSize), this.yDraw, game.blockSize, game.blockSize);
                                    }
                                    else {
                                    ctx.drawImage(platform_mid, 0, 0, platform_mid.width, platform_mid.height, 
                                                  this.xDraw + (j * game.blockSize), this.yDraw, game.blockSize, game.blockSize);
                                    }
								}
							}
						},
						
                        //Function to check if samething landed on a platform
						hasLanded: function(objXstart, objXend, objYstart, objYend){
							if(checkCollision(this.xStart, this.xEnd, this.yStart, this.yEnd, objXstart, objYstart)&&
								checkCollision(this.xStart, this.xEnd, this.yStart, this.yEnd, objXend, objYend)){
								return true;
							} else{
								return false;
							}
						}
                    });
                    break;
				
                case "R": //frame element
                    /*********************************Initialization of frame**************************************************************/
                    frames.push({
                        xStart: x * game.blockSize, xEnd: x * game.blockSize + game.blockSize,	xDraw: x * game.blockSize,
                        yStart: y * game.blockSize, yEnd: y * game.blockSize + game.blockSize,	yDraw: y * game.blockSize,
                        
						draw: function(){
                            //Draw the different variations of the frame elements with help of the spritesheet

                            //Left
                            if(this.xStart == 0 && this.yStart > 0 && this.yStart < game.height - game.blockSize) {
                                ctx.drawImage(edge, 0 * edge.width / 8, 0, edge.width / 8, edge.height, this.xDraw, this.yDraw, game.blockSize, game.blockSize);
                            }
                            //Upper left
                            else if(this.xStart == 0 && this.yStart == 0) {
                                ctx.drawImage(edge, 1 * edge.width / 8, 0, edge.width / 8, edge.height, this.xDraw, this.yDraw, game.blockSize, game.blockSize);
                            }
                            //Top
                            else if(this.xStart > 0 && this.xStart < game.width - game.blockSize && this.yStart == 0) {
                                ctx.drawImage(edge, 2 * edge.width / 8, 0, edge.width / 8, edge.height, this.xDraw, this.yDraw, game.blockSize, game.blockSize);
                            }
                            //Upper right
                            else if(this.xStart == game.width - game.blockSize && this.yStart == 0) {
                                ctx.drawImage(edge, 3 * edge.width / 8, 0, edge.width / 8, edge.height, this.xDraw, this.yDraw, game.blockSize, game.blockSize);
                            }
                            //Right
                            else if(this.xStart == game.width - game.blockSize && this.yStart > 0 && this.yStart < game.height - game.blockSize) {
                                ctx.drawImage(edge, 4 * edge.width / 8, 0, edge.width / 8, edge.height, this.xDraw, this.yDraw, game.blockSize, game.blockSize);
                            }
                            //Lower right
                            else if(this.xStart == game.width - game.blockSize && this.yStart == game.height - game.blockSize) {
                                ctx.drawImage(edge, 5 * edge.width / 8, 0, edge.width / 8, edge.height, this.xDraw, this.yDraw, game.blockSize, game.blockSize);
                            }
                            //Bottom
                            else if(this.xStart > 0 && this.xStart < game.width - game.blockSize && this.yStart == game.height - game.blockSize) {
                                ctx.drawImage(edge, 6 * edge.width / 8, 0, edge.width / 8, edge.height, this.xDraw, this.yDraw, game.blockSize, game.blockSize);
                            }
                            //Lower left
                            else if(this.xStart == 0 && this.yStart == game.height - game.blockSize) {
                                ctx.drawImage(edge, 7 * edge.width / 8, 0, edge.width / 8, edge.height, this.xDraw, this.yDraw, game.blockSize, game.blockSize);
                            }
						}});
                    break;
				
				/*********************************Initialization of exit elements***********************************************/
				case "E":
					exits.push({
						xStart: x * game.blockSize, xEnd: x * game.blockSize + game.blockSize, 	xDraw: x * game.blockSize,
                        yStart: y * game.blockSize, yEnd: y * game.blockSize + game.blockSize,	yDraw: y * game.blockSize,
						state: "visible",
						
						update: function(){
                            //If all guests have been collected and the last round has been reached the exit gets invisible
                            //and the taxi can pass it
							if(game.targetPlatform < 0 && taxi.state == "full"){
								this.state = "invisible"
							}
						},
						
						draw: function(){
                            //Only draw the exit if its visible
							if(this.state == "visible"){
								ctx.drawImage(edge, 2 * edge.width / 8, 0, edge.width / 8, edge.height, this.xDraw, this.yDraw, game.blockSize, game.blockSize);
							}
						}
					});
				break;
				
                case "X":  //static obstacle
                    /*********************************Initialization of static obstacles/satellites*************************************************/
                    staticSatellites.push({
                        xStart: x * game.blockSize, xEnd: x * game.blockSize + game.blockSize,	xDraw: x * game.blockSize,
                        yStart: y * game.blockSize, yEnd: y * game.blockSize + game.blockSize,	yDraw: y * game.blockSize,
						angleToTaxi: 0,
						
						update: function(){
                            //Calculating the angle that the satellite aims to
							if (taxi.y < this.yStart){
								var bSeite = this.yStart - taxi.y;
								var aSeite;
								if(this.xStart <= taxi.x){
									aSeite = (taxi.x - this.xStart) * (-1);
								}else{
									aSeite = this.xStart - taxi.x;
								}
								this.angleToTaxi = Math.atan(bSeite/aSeite) * 57.2957795;
							}
						},
						
						draw: function(){
                            //Drawing the satellite regarding the angle it aims to
							switch(true){
								// right from taxi and angle 0-20°
								case (this.angleToTaxi > 0 && this.angleToTaxi < 20):
									ctx.drawImage(satelliteImage, 8 * satelliteImage.width / 9, 0, satelliteImage.width / 9, satelliteImage.height, this.xDraw, this.yDraw, game.blockSize, game.blockSize);
									break;
								// right from taxi and angle 20-40°
								case (this.angleToTaxi > 20 && this.angleToTaxi < 40):
									ctx.drawImage(satelliteImage, 7 * satelliteImage.width / 9, 0, satelliteImage.width / 9, satelliteImage.height, this.xDraw, this.yDraw, game.blockSize, game.blockSize);
									break;
								// right from taxi and angle 40-60°	
								case (this.angleToTaxi > 40 && this.angleToTaxi < 60):
									ctx.drawImage(satelliteImage, 6 * satelliteImage.width / 9, 0, satelliteImage.width / 9, satelliteImage.height, this.xDraw, this.yDraw, game.blockSize, game.blockSize);
									break;
								// right from taxi and angle 60-80°
								case (this.angleToTaxi > 60 && this.angleToTaxi < 80):
									ctx.drawImage(satelliteImage, 5 * satelliteImage.width / 9, 0, satelliteImage.width / 9, satelliteImage.height, this.xDraw, this.yDraw, game.blockSize, game.blockSize);
									break;
								// right from taxi and angle 80-90°; left from taxi and angle 80-90°; if no possible angle
								case (this.angleToTaxi > -90 && this.angleToTaxi < -80):
								case (this.angleToTaxi > 80 && this.angleToTaxi <90):
								case (this.angleToTaxi == 0):
									ctx.drawImage(satelliteImage, 4 * satelliteImage.width / 9, 0, satelliteImage.width / 9, satelliteImage.height, this.xDraw, this.yDraw, game.blockSize, game.blockSize);
									break;
								// left from taxi and angle 0-20°
								case (this.angleToTaxi > -20 && this.angleToTaxi < 0):
									ctx.drawImage(satelliteImage, 0 * satelliteImage.width / 9, 0, satelliteImage.width / 9, satelliteImage.height, this.xDraw, this.yDraw, game.blockSize, game.blockSize);
									break;
								// left from taxi and angle 20-40°
								case (this.angleToTaxi > -40 && this.angleToTaxi < -20):
									ctx.drawImage(satelliteImage, 1 * satelliteImage.width / 9, 0, satelliteImage.width / 9, satelliteImage.height, this.xDraw, this.yDraw, game.blockSize, game.blockSize);
									break;
								// left from taxi and angle 40-60°
								case (this.angleToTaxi > -60 && this.angleToTaxi < -40):
									ctx.drawImage(satelliteImage, 2 * satelliteImage.width / 9, 0, satelliteImage.width / 9, satelliteImage.height, this.xDraw, this.yDraw, game.blockSize, game.blockSize);
									break;
								// left from taxi and angle 60-80°
								case (this.angleToTaxi > -80 && this.angleToTaxi < -60):
									ctx.drawImage(satelliteImage, 3 * satelliteImage.width / 9, 0, satelliteImage.width / 9, satelliteImage.height, this.xDraw, this.yDraw, game.blockSize, game.blockSize);
									break;
							}
						}});
                    break;

                case "M":  
                    /*********************Initialization of transmitter object*********************/
                    transmitters.push({
                        xStart: x * game.blockSize, 					xEnd: x * game.blockSize + game.blockSize,	xDraw: x * game.blockSize,
                        yStart: y * game.blockSize - game.blockSize, 	yEnd: y * game.blockSize + game.blockSize,	yDraw: y * game.blockSize,
						
						state: "on",				distanceToTaxi: 101,
						
                        update: function(){
                            //Calulating the distance to the taxi
							this.distanceToTaxi = Math.sqrt(Math.pow(taxi.x - this.xStart, 2)+ Math.pow(taxi.y - this.yStart, 2));
						},
						
						draw: function(){
                            //If transmitter is on draw the radio radius of the transmitter
							if(this.state == "on"){
								ctx.drawImage(transmitterRadioImage, 0, 0, transmitterRadioImage.width, transmitterRadioImage.height, 
                                          this.xDraw - 83, (this.yDraw - game.blockSize) - 90, 200, 200);
							}
                            ctx.drawImage(transmitterImage, 0, 0, transmitterImage.width, transmitterImage.height, this.xDraw, this.yDraw - game.blockSize, game.blockSize, game.blockSize * 2);
                        }
					});
                    break;
				
				case "I":
				case "J":
                    /*********************************Initialization of power ups*******************+++******************************/
					var type = levelRows[y][x];
					
					powerUps.push({
						xStart: x * game.blockSize, xEnd: x * game.blockSize + (2 * game.blockSize),	xDraw: x * game.blockSize,
                        yStart: y * game.blockSize, yEnd: y * game.blockSize + game.blockSize,			yDraw: y * game.blockSize,
						type: type,					state: "open",
						
						draw: function(){
							if(this.type == "I" && this.state == "open"){
								ctx.drawImage(powerUpSnowden, 0, 0, powerUpSnowden.width, powerUpSnowden.height, this.xDraw, this.yDraw, game.blockSize * 2, game.blockSize);
							}
							if(this.type == "J" && this.state == "open"){
								ctx.drawImage(powerUpBlitz, 0, 0, powerUpBlitz.width, powerUpBlitz.height, this.xDraw, this.yDraw, game.blockSize * 2, game.blockSize);
							}
						}
					});
					break;
				
					/*********************************Initialization of Dynamic Level elements*******************************/
                
                case "K":
                    /*********************Initialization of drone object*********************/
                    /****************************vertical flying*****************************/

                    //Check if drone element has already been used
                    if(verticalDronesFinished[x][y] == false) {
                        drones.push({
                            xStart: x * game.blockSize, xEnd: x * game.blockSize + game.blockSize,
                            yStart: y * game.blockSize, yEnd: y * game.blockSize + game.blockSize,
                            moveStart: y * game.blockSize, moveEnd: y * game.blockSize,
                            direction: "down",

                            update: function (){
                                //moving the drone up and down
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
                                    }
                                }
                            },

                            draw: function() {
                                ctx.drawImage(droneImage, Math.floor(game.frame % 16) *  droneImage.width / 16, 0, droneImage.width / 16, droneImage.height,
                                              this.xStart, this.yStart, game.blockSize * 2, game.blockSize);
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

                        //Update drones flying target to the full length
                        y = oldY;
                        drones[drones.length-1].moveEnd += count * game.blockSize + game.blockSize;
                    }

                    break;
                /*********************Initialization of drone object*********************/
                /***************************horizontal flying****************************/
                case "L":
                    drones.push({
                        xStart: x * game.blockSize, xEnd: x * game.blockSize + game.blockSize,
                        yStart: y * game.blockSize, yEnd: y * game.blockSize + game.blockSize,
                        moveStart: x * game.blockSize, moveEnd: x * game.blockSize,
                        direction: "right",

                        update: function (){
                            //moving the drone back and forth
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
                            ctx.drawImage(droneImage, Math.floor(game.frame % 16) *  droneImage.width / 16, 0, droneImage.width / 16, droneImage.height,
                                          this.xStart, this.yStart, game.blockSize * 2, game.blockSize);
                        }
                    });

                    var count = 1;
                    x++;
                    while(levelRows[y][x] != "L") {
                        x++;
                        count++;
                    }

                    //Update drones flying target to the full length
                    drones[drones.length-1].moveEnd += count * game.blockSize + game.blockSize;
                    break;

                /*********************Initialization of googleCar object*********************/
                case "Y":
                    googleCars.push({
                        xStart: x * game.blockSize, xEnd: x * game.blockSize + game.blockSize,
                        yStart: y * game.blockSize, yEnd: y * game.blockSize + game.blockSize,
                        moveStart: x * game.blockSize, moveEnd: x * game.blockSize,
                        direction: "right",	angleToTaxi: 0,

                        update: function (){
                            //moving the car back and forth
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
                                }
                            }
							
                        },

                        draw: function() {
                            //Draw car driving in right direction
                            if(this.direction == "right"){
                                ctx.drawImage(googleCarImage, Math.floor(game.frame % 4) *  googleCarImage.width / 4, 0, googleCarImage.width / 4, googleCarImage.height / 2,
                                              this.xStart, this.yStart, game.blockSize, game.blockSize);
                            }
                            //Draw car driving in left direction
                            else{
                                ctx.drawImage(googleCarImage, Math.floor(game.frame % 4) *  googleCarImage.width / 4, googleCarImage.height / 2, googleCarImage.width / 4, googleCarImage.height / 2,
                                              this.xStart, this.yStart, game.blockSize, game.blockSize);
                            }
                        }
                    });

                    var count = 1;
                    x++;
                    while(levelRows[y][x] != "Y") {
                        x++;
                        count++;
                    }

                    //Update cars moving target to the full length
                    googleCars[googleCars.length-1].moveEnd += count * game.blockSize + game.blockSize;
                    break;
					
                case "T":
                    /*********************************Initialization of taxi**************************************************/
                    taxi = {
                        height: 25, width: 58,
						x: x * game.blockSize,	 xBegin: x * game.blockSize,	xStart: x * game.blockSize,	xEnd: x * game.blockSize + this.width,	vx: 0,
						y: y * game.blockSize,   yBegin: y * game.blockSize,	yStart: y * game.blockSize,	yEnd: y * game.blockSize + this.height, vy: 0,	
						
						drawState: "up",	passengers: 0,		collisionBottom: false,	  lives: 3,
						state: "free",		currPlatform:  0,   health: 100,              powerUpState: "none",
						
						update: function() {
                            //Simulating gravity if taxi is not on a platform
							if(this.collisionBottom == false) {
								this.vy -= 3;	
							}
							
                            //Default drawstate if no key is pressed
							this.drawState = "up";

                            //If key W is pressed the taxi has to move up
							if(keydown.w) {
                                //Update velocity of taxi 
                                //If powerupstate "fast" is active, acceleration is faster
                                if(this.powerUpState != "fast") {
                                    this.vy += 10;
                                }
								else {
                                    this.vy += 20;
                                }
                                //When taxi is moving up it is not colliding with a platform any more
                                //Drawstate is up
                                //and it is not longer on a platform
								this.collisionBottom = false;
								this.drawState = "up";
								this.currPlatform = 0;
							}
                            //If key S is pressed and collision bottom is false the taxi can move down
                            //if it is true it is standing an a platform and isn't able to move down
							if(keydown.s && this.collisionBottom == false) {
                                //If powerupstate "fast" is active, acceleration is faster
                                if(this.powerUpState != "fast") {
								    this.vy -= 10;
                                }
                                else {
                                    this.vy -= 20;
                                }
							}
                            //If key A is pressed the taxi has to move left
							if (keydown.a) {
                                //If powerupstate "fast" is active, acceleration is faster
                                if(this.powerUpState != "fast") {
								    this.vx -= 7;
                                }
                                else {
                                    this.vx -= 14;
                                }
                                //The drawstate is changed to left
								this.drawState = "left";
							}
                            //If key D is pressed the taxi has to move left
							if (keydown.d) {
                                //If powerupstate "fast" is active, acceleration is faster
                                if(this.powerUpState != "fast") {
								    this.vx += 7;
                                }
                                else{
                                    this.vx += 14;
                                }
                                //The drawstate is changed to right
								this.drawState = "right";
							}
						
                            //if taxi lands on platform it slows down
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
							
                            //Update taxi position depending on the velocity
							this.x += this.vx / 200;
							this.y -= this.vy / 200;
							

							//Update of this corner position:                                       
							this.xStart = this.x; this.xEnd = this.x + this.width;                
							this.yStart = this.y; this.yEnd = this.y + this.height;  
								
							for (var i = 0; i < platforms.length; i++) {

							     //Check if taxi has landed and set the platform it landed on as the current platform of the taxi
								if(platforms[i].hasLanded(this.xStart, this.xEnd, this.yEnd, this.yEnd)){
										this.currPlatform = platforms[i].id;
										break;
                                //If not the curren platform stays 0
								}else{
									this.currPlatform = 0;
									this.collisionBottom = false;
								}
							}
							
							//update taxi attributes according to guests
							this.passengers = 0;
							for (i = 0; i < guests[game.roundNumber-1].length; i++){
								if(guests[game.roundNumber-1][i].state == "onTaxi" || guests[game.roundNumber-1][i].state == "leaving")
									this.passengers++;
								if(taxi.passengers == guests[game.roundNumber-1].length){
									this.state = "full";
								}else{
									this.state = "free";
								}
							}

                            //action when taxi landed on a platform
                            if(this.currPlatform != 0){
                                //If taxi is landing with a velocity over 300 --> taxi is dead
                                if(this.vy < -300) {
                                    this.death();
                                }
                                //If taxi is not landing straight --> taxi is dead
                                if(this.drawState != "up" && this.vy != 0) {
                                    this.death();
                                }
                            }
							
                            //Reduce the taxis health if it is too close to a transmitter depending on the distance
							for(i = 0; i < transmitters.length; i++){
								if(transmitters[i].distanceToTaxi < 70 && transmitters[i].state == "on"){
									this.health -= 1;
								}
                                else if(transmitters[i].distanceToTaxi < 100 && transmitters[i].state == "on"){
                                        this.health -= 0.5;
                                }
							}

                            //If taxis health is 0 --> taxi is dead
                            if(this.health < 0) {
                                this.death();
                            }

                            //Update taxis attributes if it landed safely
                            if(this.currPlatform != 0){
                                this.collisionBottom = true;
                                this.vy = 0;
                                this.y = platforms[this.currPlatform-1].yStart - game.blockSize;
                            }
						},
						
                        //Function to check a collision from the taxi and an other object
						collides: function(obstXstart, obstXend, obstYstart, obstYend){
							if (checkCollision(obstXstart, obstXend, obstYstart, obstYend, this.xStart, this.yStart)||	//left-up
								checkCollision(obstXstart, obstXend, obstYstart, obstYend, this.xStart, this.yEnd)||	//left-down
								checkCollision(obstXstart, obstXend, obstYstart, obstYend, this.xEnd, this.yStart)||	//right-up
								checkCollision(obstXstart, obstXend, obstYstart, obstYend, this.xEnd, this.yEnd)) {		//right-down
								return true;
							}
							else {
								return false;
							}
						},
						
						draw: function(){
                            //Drawing the taxi depending on its drawstate
							switch(this.drawState){
								case "up":
									ctx.drawImage(taxiImage, Math.floor(game.frame % 5) *  taxiImage.width / 5, 0, taxiImage.width / 5, taxiImage.height / 3,
										  this.x, this.y, taxiImage.width / 5, taxiImage.height / 3);
									break;

								case "left":
									ctx.drawImage(taxiImage, Math.floor(game.frame % 5) *  taxiImage.width / 5, taxiImage.height / 3, taxiImage.width / 5, taxiImage.height / 3,
										  this.x, this.y, taxiImage.width / 5, taxiImage.height / 3);
									break;
        
								case "right":
									ctx.drawImage(taxiImage, Math.floor(game.frame % 5) *  taxiImage.width / 5, 2 * taxiImage.height / 3, taxiImage.width / 5, taxiImage.height / 3,
										  this.x, this.y, taxiImage.width / 5, taxiImage.height / 3);
									break;
									
								case "broken":
									taxi.vx = 0;
									taxi.vy = 0;
									ctx.drawImage(brokenTaxiImage, Math.floor(game.frame % 8) * brokenTaxiImage.width / 8, Math.floor(game.frame / 8) * brokenTaxiImage.height / 6,
										  brokenTaxiImage.width / 8, brokenTaxiImage.height / 6, this.x - 42, this.y - 47, brokenTaxiImage.width / 8, brokenTaxiImage.height / 6);
									game.frame += 0.2;

                                    //Call actions after the dying animation has been finished
									if(Math.floor(game.frame) == 48) {
										if(this.lives >= 1){
											game.reset();
										}else{
											menu.showGameOverMenu();
										}
									}
									break;
							}
						},
						
                        //Function that is called when the taxi is dies
						death: function(){
							this.drawState = "broken";
                            game.stopSound(backgroundsong);
                            game.stopSound(helicopter);
                            game.playSound(explosion);
							game.frame = 0;
							game.state = "over";
							if(taxi.state != "dead"){
								this.lives--;
							}
							taxi.state = "dead";
						}
					};
					break;
				
				case "1": //guest type 1
                case "2": //guest type 2
				case "3": //guest type 3
					var value = levelRows[y][x] - 1;
					
					if(guests.length < value + 1){
						for(i = guests.length; i <= value; i++){
							guests[i] = new Array();
						}
					}

                    /*********************************Initialization of guests***************************************************/
					guests[value].push({
						type: levelRows[y][x], state: "free", 
						currPlatform : 0,
						xStart: x * game.blockSize, x: x * game.blockSize,
						yStart: y * game.blockSize, y: y * game.blockSize,
                        direction: "standing",

                        //Guest entering the taxi
                        //either moving left or moving right
						enterTaxi: function(){
							if(taxi.x-this.x <0){
								this.x -= 1;
                                this.direction = "movingLeft";
							}else{
								this.x += 1;
                                this.direction = "movingRight";
							}
						},
						
                        //Guest getting out of the taxi
						exitTaxi:function(){
							if(this.state != "leaving"){
								this.x = taxi.x;
								this.y = taxi.y;
							}
						},
						
                        //After exiting the taxi the guest is going to his target position on the platform
                        //Either moving left or moving right
						leaveTaxi: function(){
							if(guests[game.roundNumber][0].x - this.x < 0){
								this.x -= 1;
								this.direction = "movingLeft";
							}else if(guests[game.roundNumber][0].x - this.x > 0){
								this.x += 1;
								this.direction = "movingRight";
							}
						},
						
						update: function(){
							for (var i = 0; i < platforms.length; i++) {
								//Assign every guest the platform he is currently on
								if(platforms[i].hasLanded(this.x, this.x +game.blockSize, this.y + game.blockSize, this.y + game.blockSize)){
										this.currPlatform = platforms[i].id;
								}
							}
						},

						draw: function(){
                            //Draw a guest depending on his state
							if((this.state == "free" || this.state == "leaving") && (this.type == game.roundNumber)){
                                if(this.direction == "standing") {
                                    ctx.drawImage(guestImage, 0 * guestImage.width / 7, 1 * guestImage.height / 2, 
                                                  guestImage.width / 7, guestImage.height / 2, this.x, this.y - game.blockSize, 
                                                  game.blockSize * 2, game.blockSize * 2);
                                }
                                else if(this.direction == "movingLeft"){
                                    ctx.drawImage(guestImage, Math.floor(game.frame % 7) * guestImage.width / 7, 0, 
                                                  guestImage.width / 7, guestImage.height / 2, this.x, this.y - game.blockSize, 
                                                  game.blockSize * 2, game.blockSize * 2);
                                }
                                else if(this.direction == "movingRight") {
                                    ctx.drawImage(guestImageBack, Math.floor(game.frame % 7) * guestImageBack.width / 7, 0, 
                                                  guestImageBack.width / 7, guestImageBack.height / 2, this.x, this.y - game.blockSize, 
                                                  game.blockSize * 2, game.blockSize * 2);
                                }
								
							}
						}		
					});

					break;
            }//switch
        }//for x
    }//for y
}