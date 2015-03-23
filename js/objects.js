var game;
var sidebar, menu, taxi, platforms, obstacles, guests, frames, exits, staticSatellites, powerUps, googleCars, drones, transmitters;

function initGame(){
	
	game = {
		width:  $("#canvas").width()-150, levelXMax: 32,  blockSize: 25,
		height: $("#canvas").height(),    levelYMax: 24, 
		
		frame: 0,
		FPS: 60,
		
		levelNumber: 1,	targetPlatform: 0,
		roundNumber: 1, state: "running",
        powerUpTimer: 1000,
		
		drawBackground: function(){
			ctx.drawImage(background, 0, 0, background.width, background.height, 0, 0, game.width, game.height);
		},
		
		update: function(){
			if(this.roundNumber != 3){
				this.targetPlatform = guests[this.roundNumber][0].currPlatform;
			}else{
				this.targetPlatform = -1; //Muss noch verbessert werden!
			}
			
			if(taxi.currPlatform != 0){
				//guests delivered ?
				if(taxi.state == "full" && taxi.currPlatform == game.targetPlatform){ 	//wird Funktion von game.update
					console.log("Gaeste abgeliefert!");
					game.roundNumber++;
				}
			}

            if(this.powerUpTimer != 0) {
                this.powerUpTimer -= 1;
            }

            if(this.powerUpTimer == 0) {
                taxi.powerUpState = "none";
            }
		},
		
		reset: function(){
			taxi.x = taxi.xStart;	taxi.state = "free";	taxi.vx = 0; 	taxi.health = 100;
			taxi.y = taxi.yStart;	taxi.passengers = 0;	taxi.vy = 0;	taxi.drawState = "up";	
			
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
		
		beginGameLoop: function() {
		// Begin the game loop
			var gameInterval = setInterval(function() {
				if(game.state == "running") {//		hier darf nicht this verwendet werden gehört das hier rein GORDON!!??!?!?!?
				update();
				}
			draw();
			}, 1000/game.FPS);
		},

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
        }
	}

    sidebar = {
        width: $("#canvas").width() - game.width,
        height: game.height,

        xStart: game.width, xEnd: $("#canvas").width(),
        yStart: 0, yEnd: game.height,

        draw: function(){
            //Draw background of sidebar
            ctx.fillStyle = "#232323";
            ctx.fillRect(this.xStart,this.yStart,this.width,this.height);
			
			ctx.fillStyle = "#000000";
			for(i = 0; i < taxi.lives; i++){
				ctx.fillRect(this.xEnd-115, this.yEnd - 45 - (i*30), 25, 25);
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

    menu = {
        mainMenu: $('#main'),
        gameOverMenu: $('#game-over'),
        gamePausedMenu: $('#game-paused'),
        gameWonMenu: $('#game-won'),

        playButton: $('.play'),
        restartButton: $('.restart'),
		nextLevelButton: $('.nextLevel'),
        continueButton: $('.continue'),

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
				switch(game.levelNumber){
					case 1:
						nextLevel = "level2.txt";
						break;
					
					case 2:
						nextLevel = "level3.txt";
						break;
					
					case 3:
						nextLevel = "none";
						break;
				}
				loadLevel(nextLevel);
				game.levelNumber++;
			})
        },
        
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

function initObjects() {
    var strings = levelDataRaw;
    var levelRows = strings.split("\r\n");
	
    var verticalDronesFinished = new Array();
    for (X = 0; X < game.levelXMax; X++){
        verticalDronesFinished[X] = new Array();
        for(Y = 0; Y < game.levelYMax; Y++){
            verticalDronesFinished[X][Y] = false;
        }
    }

    for (y = 0; y < game.levelYMax; y++) {
        for (x = 0; x < game.levelXMax; x++) {

            switch(levelRows[y][x]){
            /*********************************Initialization platforms*********************************/
                case "<":
				case "#": //Platform
					var tempPlatform = {xStart: 0, xEnd: 0, yStart: 0, yEnd: 0, hasBegin: false, hasEnd: false};

                    tempPlatform.xStart = x * game.blockSize; tempPlatform.xEnd = x * game.blockSize + game.blockSize;
                    tempPlatform.yStart = y * game.blockSize; tempPlatform.yEnd = y * game.blockSize + game.blockSize;
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
                    tempPlatform.xEnd += count * game.blockSize;

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
                                    if(this.id == game.targetPlatform && taxi.state == "full") {
                                        ctx.drawImage(platform_blink_spritesheet, Math.floor(game.frame % 20) * 75, 0, 
                                                      platform_blink_spritesheet.width / 60, platform_blink_spritesheet.height,
                                                      this.xStart + (j * game.blockSize), this.yStart, game.blockSize, game.blockSize);
                                    }
                                    else{
                                        ctx.drawImage(platform_left, 0, 0, platform_left.width, platform_left.height,
                                                      this.xStart + (j * game.blockSize), this.yStart, game.blockSize, game.blockSize);
                                    }
								}else if(j == boxes-1 && this.hasEnd){
                                    if(this.id == game.targetPlatform && taxi.state == "full") {
									    ctx.drawImage(platform_blink_spritesheet, Math.floor(game.frame % 20) * 75 + 50, 0, 
                                                      platform_blink_spritesheet.width / 60, platform_blink_spritesheet.height,
                                                      this.xStart + (j * game.blockSize), this.yStart, game.blockSize, game.blockSize);
                                    }
                                    else {
                                        ctx.drawImage(platform_right, 0, 0, platform_right.width, platform_right.height,
                                                      this.xStart + (j * game.blockSize), this.yStart, game.blockSize, game.blockSize);
                                    }
								}else{
                                    if(this.id == game.targetPlatform && taxi.state == "full") {
                                    ctx.drawImage(platform_blink_spritesheet, Math.floor(game.frame % 20) * 75 + 25, 0, 
                                                  platform_blink_spritesheet.width / 60, platform_blink_spritesheet.height, 
										          this.xStart + (j * game.blockSize), this.yStart, game.blockSize, game.blockSize);
                                    }
                                    else {
                                    ctx.drawImage(platform_mid, 0, 0, platform_mid.width, platform_mid.height, 
                                                  this.xStart + (j * game.blockSize), this.yStart, game.blockSize, game.blockSize);
                                    }
								}
							}
						},
						
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

                case "R": //frame
                    frames.push({
                        xStart: x * game.blockSize, xEnd: x * game.blockSize + game.blockSize,
                        yStart: y * game.blockSize, yEnd: y * game.blockSize + game.blockSize,
                        
						draw: function(){
                            //Left
                            if(this.xStart == 0 && this.yStart > 0 && this.yStart < game.height - game.blockSize) {
                                ctx.drawImage(edge, 0 * edge.width / 8, 0, edge.width / 8, edge.height, this.xStart, this.yStart, game.blockSize, game.blockSize);
                            }
                            //Upper left
                            else if(this.xStart == 0 && this.yStart == 0) {
                                ctx.drawImage(edge, 1 * edge.width / 8, 0, edge.width / 8, edge.height, this.xStart, this.yStart, game.blockSize, game.blockSize);
                            }
                            //Top
                            else if(this.xStart > 0 && this.xStart < game.width - game.blockSize && this.yStart == 0) {
                                ctx.drawImage(edge, 2 * edge.width / 8, 0, edge.width / 8, edge.height, this.xStart, this.yStart, game.blockSize, game.blockSize);
                            }
                            //Upper right
                            else if(this.xStart == game.width - game.blockSize && this.yStart == 0) {
                                ctx.drawImage(edge, 3 * edge.width / 8, 0, edge.width / 8, edge.height, this.xStart, this.yStart, game.blockSize, game.blockSize);
                            }
                            //Right
                            else if(this.xStart == game.width - game.blockSize && this.yStart > 0 && this.yStart < game.height - game.blockSize) {
                                ctx.drawImage(edge, 4 * edge.width / 8, 0, edge.width / 8, edge.height, this.xStart, this.yStart, game.blockSize, game.blockSize);
                            }
                            //Lower right
                            else if(this.xStart == game.width - game.blockSize && this.yStart == game.height - game.blockSize) {
                                ctx.drawImage(edge, 5 * edge.width / 8, 0, edge.width / 8, edge.height, this.xStart, this.yStart, game.blockSize, game.blockSize);
                            }
                            //Bottom
                            else if(this.xStart > 0 && this.xStart < game.width - game.blockSize && this.yStart == game.height - game.blockSize) {
                                ctx.drawImage(edge, 6 * edge.width / 8, 0, edge.width / 8, edge.height, this.xStart, this.yStart, game.blockSize, game.blockSize);
                            }
                            //Lower left
                            else if(this.xStart == 0 && this.yStart == game.height - game.blockSize) {
                                ctx.drawImage(edge, 7 * edge.width / 8, 0, edge.width / 8, edge.height, this.xStart, this.yStart, game.blockSize, game.blockSize);
                            }
						}});
                    break;

                /*********************************Extended Level elements******************************/
                case "X":  //static obstacle
                    staticSatellites.push({
                        xStart: x * game.blockSize, xEnd: x * game.blockSize + game.blockSize,
                        yStart: y * game.blockSize, yEnd: y * game.blockSize + game.blockSize,
						angleToTaxi: 0,
						
						update: function(){
							if (taxi.y < this.yStart){
								var bSeite = this.yStart - taxi.y;
								var aSeite;
								if(this.xStart <= taxi.x){
									aSeite = taxi.x - this.xStart;
								}else{
									aSeite = this.xStart - taxi.x;
								}
								this.angleToTaxi = Math.atan(bSeite/aSeite) * 57.2957795;
							}
						},
						
						draw: function(){
							ctx.drawImage(satelliteImage, 0, 0, satelliteImage.width, satelliteImage.height, this.xStart, this.yStart, game.blockSize, game.blockSize);
						}});
                    break;

                case "M":  //static obstacle
                    transmitters.push({
                        xStart: x * game.blockSize, xEnd: x * game.blockSize + game.blockSize,
                        yStart: y * game.blockSize, yEnd: y * game.blockSize + game.blockSize,
						state: "on",				distanceToTaxi: 101,
						
                        update: function(){
							this.distanceToTaxi = Math.sqrt(Math.pow(taxi.x - this.xStart, 2)+ Math.pow(taxi.y - this.yStart, 2));
						},
						
						draw: function(){
							if(this.state == "on"){
								ctx.drawImage(transmitterRadioImage, 0, 0, transmitterRadioImage.width, transmitterRadioImage.height, 
                                          this.xStart - 83, this.yStart - 90, 200, 200);
							}
                            ctx.drawImage(transmitterImage, 0, 0, transmitterImage.width, transmitterImage.height, this.xStart, this.yStart - game.blockSize, game.blockSize, game.blockSize * 2);
                        }
					});
                    break;

				case "I":
				case "J":
					var type = levelRows[y][x];
					
					powerUps.push({
						xStart: x * game.blockSize, xEnd: x * game.blockSize + game.blockSize,
                        yStart: y * game.blockSize, yEnd: y * game.blockSize + game.blockSize,
						type: type,					state: "open",
						
						draw: function(){
							if(this.type == "I" && this.state == "open"){
								ctx.drawImage(powerUpSnowden, 0, 0, powerUpSnowden.width, powerUpSnowden.height, this.xStart, this.yStart, game.blockSize * 2, game.blockSize);
							}
							if(this.type == "J" && this.state == "open"){
								ctx.drawImage(powerUpBlitz, 0, 0, powerUpBlitz.width, powerUpBlitz.height, this.xStart, this.yStart, game.blockSize * 2, game.blockSize);
							}
						}
					});
					break;
				
				case "E":
					exits.push({
						xStart: x * game.blockSize, xEnd: x * game.blockSize + game.blockSize, state: "visible",
                        yStart: y * game.blockSize, yEnd: y * game.blockSize + game.blockSize,
						
						update: function(){
							if(game.roundNumber == 3 && taxi.state == "full"){
								this.state = "invisible"
							}
						},
						
						draw: function(){
							if(this.state == "visible"){
								ctx.drawImage(edge, 2 * edge.width / 8, 0, edge.width / 8, edge.height, this.xStart, this.yStart, game.blockSize, game.blockSize);
							}
						}
					});
				break;

					/*********************************Dynamic Level elements*******************************/
                // Taxi and guests
                // Diese Elemente mussen an sich dynamisch gezeichnet werden - hier nur für Demozwecke zeichnen

                //Vertical flying drone
                case "K":
                    if(verticalDronesFinished[x][y] == false) {
                        drones.push({
                            xStart: x * game.blockSize, xEnd: x * game.blockSize + game.blockSize,
                            yStart: y * game.blockSize, yEnd: y * game.blockSize + game.blockSize,
                            moveStart: y * game.blockSize, moveEnd: y * game.blockSize,
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

                        y = oldY;
                        drones[drones.length-1].moveEnd += count * game.blockSize + game.blockSize;
                    }

                    break;

                //Horizontal flying drone
                case "L":
                    drones.push({
                        xStart: x * game.blockSize, xEnd: x * game.blockSize + game.blockSize,
                        yStart: y * game.blockSize, yEnd: y * game.blockSize + game.blockSize,
                        moveStart: x * game.blockSize, moveEnd: x * game.blockSize,
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

                    drones[drones.length-1].moveEnd += count * game.blockSize + game.blockSize;
                    break;

                case "Y":
                    googleCars.push({
                        xStart: x * game.blockSize, xEnd: x * game.blockSize + game.blockSize,
                        yStart: y * game.blockSize, yEnd: y * game.blockSize + game.blockSize,
                        moveStart: x * game.blockSize, moveEnd: x * game.blockSize,
                        direction: "right",	angleToTaxi: 0,

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
							if (taxi.y < this.yStart){
								var bSeite = this.yStart - taxi.y;
								var aSeite;
								if(this.xStart <= taxi.x){
									aSeite = taxi.x - this.xStart;
								}else{
									aSeite = this.xStart - taxi.x;
								}
								this.angleToTaxi = Math.atan(bSeite/aSeite) * 57.2957795;
							}
							
                        },

                        draw: function() {
                            if(this.direction == "right"){
                                ctx.drawImage(googleCarImage, Math.floor(game.frame % 4) *  googleCarImage.width / 4, 0, googleCarImage.width / 4, googleCarImage.height / 2,
                                              this.xStart, this.yStart, game.blockSize, game.blockSize);
                            }
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

                    googleCars[googleCars.length-1].moveEnd += count * game.blockSize + game.blockSize;
                    break;

                case "T":
                    taxi = {
                        height: 25, width: 58,
						x: x * game.blockSize,	 xStart: this.x,	vx: 0,
						y: y * game.blockSize,   yStart: this.y,	vy: 0,	
						
						// corners of taxi hitbox
						ru: { x: this.x + this.width, y: this.y }, // -> right upper corner
						rd: { x: this.x + this.width, y: this.y + this.height }, // -> right down corner
						lu: { x: this.x, y: this.y }, // -> left up corner
						ld: { x: this.x, y: this.y + this.height }, // -> left down corner
						
						drawState: "up",	passengers: 0,		collisionBottom: false,	  lives: 3,
						state: "free",		currPlatform:  0,   health: 100,              powerUpState: "none",
						
						update: function() {
							if(this.collisionBottom == false) {
								this.vy -= 3;	
							}
							
							this.drawState = "up";

							if(keydown.w) {
                                if(this.powerUpState != "fast") {
                                    this.vy += 10;
                                }
								else {
                                    this.vy += 20;
                                }
								this.collisionBottom = false;
								this.drawState = "up";
								this.currPlatform = 0;
							}
							if(keydown.s && this.collisionBottom == false) {
                                if(this.powerUpState != "fast") {
								    this.vy -= 10;
                                }
                                else {
                                    this.vy -= 20;
                                }
							}
							if (keydown.a) {
                                if(this.powerUpState != "fast") {
								    this.vx -= 7;
                                }
                                else {
                                    this.vx -= 14;
                                }
								this.drawState = "left";
							}
							if (keydown.d) {
                                if(this.powerUpState != "fast") {
								    this.vx += 7;
                                }
                                else{
                                    this.vx += 14;
                                }
								this.drawState = "right";
							}
							if(keydown.space) {
					           
							    //this.health -= 1;
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
							
							this.x += this.vx / 200;
							this.y -= this.vy / 200;
							
							//                                                                     lu = left-up                     ru = right-up
							//Update of this corner position:                                       //---------------+---------------
								this.ru.x = this.x + this.width; this.ru.y = this.y;                //         ___ /^^[___              
								this.rd.x = this.x + this.width; this.rd.y = this.y + this.height;  //        /|^+----+   |#___________//
								this.lu.x = this.x; this.lu.y = this.y;                             //      ( -+ |____|   _______-----+/
								this.ld.x = this.x; this.ld.y = this.y + this.height;               //       ==_________--'            \
																									//          ~_|___|__
							// 															           ld = left-down                   rd = right-down
							
							for (var i = 0; i < platforms.length; i++) {

							/*Prüfung Landung*/
								if(platforms[i].hasLanded(this.ld.x, this.rd.x, this.ld.y, this.rd.y)){
										this.currPlatform = platforms[i].id;
										break;
								}else{
									this.currPlatform = 0;
									this.collisionBottom = false;
								}
							}
							
							//update taxi attributes according to guests
							this.passengers = 0;
							for (i = 0; i < guests[game.roundNumber-1].length; i++){
								if(guests[game.roundNumber-1][i].state == "onTaxi")
									this.passengers++;
								if(taxi.passengers == guests[game.roundNumber-1].length){
									this.state = "full";
								}else{
									this.state = "free";
								}
							}

                            //action when taxi landed on any platform
                            if(taxi.currPlatform != 0){
                                if(taxi.vy < -300) {
                                    taxi.death();
                                }
                            }
							
							for(i = 0; i < transmitters.length; i++){
								if(transmitters[i].distanceToTaxi < 100 && transmitters[i].state == "on"){
									this.health -= 1;
								}
							}
                            if(this.health < 0) {
                                this.death();
                            }

                            if(this.currPlatform != 0){
                                this.collisionBottom = true;
                                this.vy = 0;
                                this.y = platforms[this.currPlatform-1].yStart - game.blockSize;
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
				
				case "1":
                case "2":
				case "3":
					var value = levelRows[y][x] - 1;

					guests[value].push({
						type: levelRows[y][x], state: "free", 
						currPlatform : 0, targetPlatform: 0,	//muss irgendwann später definiert werden, da dies immer wieder geschieht
						xStart: x * game.blockSize, x: x * game.blockSize,
						yStart: y * game.blockSize, y: y * game.blockSize,
                        direction: "standing",
						enterTaxi: function(taxiX){
							if(taxiX-this.x <0){
								this.x -= 1;
                                this.direction = "movingLeft";
							}else{
								this.x += 1;
                                this.direction = "movingRight";
							}
						},
						update: function(){
							for (var i = 0; i < platforms.length; i++) {
								/*Prüfung Landung*/
								if(platforms[i].hasLanded(this.x, this.x +game.blockSize, this.y + game.blockSize, this.y + game.blockSize)){
										this.currPlatform = platforms[i].id;
								}
							}
						},
						
						draw: function(){
							if(this.state == "free" && (this.type == game.roundNumber)){
                                if(this.direction == "standing") {
                                    ctx.drawImage(guestImage, 0 * guestImage.width / 7, 1 * guestImage.height / 2, 
                                                  guestImage.width / 7, guestImage.height / 2, this.x, this.y - game.blockSize, 
                                                  game.blockSize * 2, game.blockSize * 2);
                                }
                                else if(this.direction == "movingLeft"){
                                    ctx.drawImage(guestImage, Math.floor(game.frame % 7) * guestImage.width / 7, 0, 
                                                  guestImage.width / 7, guestImage.height / 2, this.x, this.y - game.blockSize, 
                                                  game.blockSize * 2, game.blockSize * 2);

                                    //ctx.drawImage(taxiImage, Math.floor(game.frame % 5) *  taxiImage.width / 5, taxiImage.height / 3, taxiImage.width / 5, taxiImage.height / 3,
                                    //      this.x, this.y, taxiImage.width / 5, taxiImage.height / 3);
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
    //guests.changeShownGuests(1);
}