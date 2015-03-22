var game;
var sidebar, menu, taxi, platforms, obstacles, guests, frames, exits, staticSatellites, googleCars, drones, transmitters;

function initGame(){
	
	game = {
		width:  $("#canvas").width()-150, levelXMax: 32,  blockSize: 25,
		height: $("#canvas").height(),    levelYMax: 24, 
		
		frame: 0,
		FPS: 60,
		
		levelNumber: 1,	targetPlatform: 0,
		roundNumber: 1, state: "running",
		
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
		
		},
		
		reset: function(){
			taxi.x = taxi.xStart;	taxi.state = "free";	taxi.vx = 0; 	this.frame = 0;			game.state = "running";
			taxi.y = taxi.yStart;	taxi.passengers = 0;	taxi.vy = 0;	taxi.drawState = "up";	taxi.health = 100;
			
			for (i=0; i < guests.length; i++){
				for(j=0; j < guests[i].length; j++){
					guests[i][j].x = guests[i][j].xStart;
					guests[i][j].y = guests[i][j].yStart;
					guests[i][j].state = "free";
					guests[i][j].direction = "standing";
				}
			}
			this.roundNumber = 1; this.targetPlatform = 0;
		},
		
		beginGameLoop: function() {
		// Begin the game loop
			var gameInterval = setInterval(function() {
				if(game.state == "running") {//		hier darf nicht this verwendet werden gehört das hier rein GORDON!!??!?!?!?
				update();
			}
			draw();
			}, 1000/game.FPS);
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

            //Draw target platform
            ctx.fillStyle = "#807E00";
            ctx.font="20px Arial";
            
            if(game.roundNumber == 1 && taxi.passengers == 0) {
                ctx.fillText("Collect Angi", this.xStart + 10, this.yStart + 50);
                ctx.fillText("at platform " + guests[game.roundNumber-1][0].currPlatform, this.xStart + 10, this.yStart + 80);
            }
            else if((game.roundNumber == 1 && taxi.passengers == 1) ||
                     game.roundNumber == 2){
                ctx.fillText("Bring her to", this.xStart + 10, this.yStart + 50);
                ctx.fillText("platform " + game.targetPlatform, this.xStart + 10, this.yStart + 80);
            }
            else{
                ctx.fillText("Get Angi", this.xStart + 10, this.yStart + 50);
                ctx.fillText("out of here!", this.xStart + 10, this.yStart + 80);
            }
			
			//Draw lives
			ctx.fillText("Remaining", this.xStart + 10, this.yEnd/2);
			ctx.fillText("lives:", this.xStart + 30, this.yEnd/2 + 30);
            ctx.fillText(taxi.lives, this.xStart + 50, this.yEnd/2 + 60);
			
            //Draw health bar background
            ctx.fillStyle = "#5E5E5E";
            ctx.fillRect(this.xStart + 10, this.yEnd - 80, 130, 30);

            //Draw health bar
            if(taxi.health > 0) {
                ctx.fillStyle = "#807E00";
                ctx.fillRect(this.xStart + 15, this.yEnd - 75, 1.2 * taxi.health, 20);
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
                game.state = "running";
                game.beginGameLoop();
            });

            this.restartButton.click(function() {
                menu.gameOverMenu.hide();
				menu.gameWonMenu.hide();
                game.state = "running";
                game.reset();
				taxi.lives = 3;
            });

            this.continueButton.click(function() {
                menu.gamePausedMenu.hide();
                game.state = "running";
            });
			
			this.nextLevelButton.click(function(){
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
        },

        showGameOverMenu: function() {
            this.gameOverMenu.show();
        },

        showGamePausedMenu: function() {
            this.gamePausedMenu.show();
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
						draw: function(){
							ctx.drawImage(satelliteImage, 0, 0, satelliteImage.width, satelliteImage.height, this.xStart, this.yStart, game.blockSize, game.blockSize);
						}});
                    break;

                case "M":  //static obstacle
                    transmitters.push({
                        xStart: x * game.blockSize, xEnd: x * game.blockSize + game.blockSize,
                        yStart: y * game.blockSize, yEnd: y * game.blockSize + game.blockSize,
						distanceToTaxi: 0,
						
                        update: function(){
							this.distanceToTaxi = Math.sqrt(Math.pow(taxi.x - this.xStart, 2)+ Math.pow(taxi.y - this.yStart, 2));
						},
						
						draw: function(){
                            ctx.drawImage(transmitterRadioImage, 0, 0, transmitterRadioImage.width, transmitterRadioImage.height, 
                                          this.xStart - 83, this.yStart - 90, 200, 200);
                            ctx.drawImage(transmitterImage, 0, 0, transmitterImage.width, transmitterImage.height, this.xStart, this.yStart - game.blockSize, game.blockSize, game.blockSize * 2);

                        }
					});
                    break;
					
				case "E":
					exits.push({
						xStart: x * game.blockSize, xEnd: x * game.blockSize + game.blockSize,
                        yStart: y * game.blockSize, yEnd: y * game.blockSize + game.blockSize,
						
						draw: function(){
							if(game.roundNumber != 3){
								ctx.drawImage(edge, 2 * edge.width / 8, 0, edge.width / 8, edge.height, this.xStart, this.yStart, game.blockSize, game.blockSize);
							}else if(taxi.state != "full"){
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
						x: x * game.blockSize,	xStart: x * game.blockSize,	vx: 0,
						y: y * game.blockSize,	yStart: y * game.blockSize,	vy: 0,
						
						// corners of taxi hitbox
						ru: { x: x * game.blockSize + game.blockSize, y: y * game.blockSize }, // -> right upper corner
						rd: { x: x * game.blockSize + game.blockSize, y: y * game.blockSize + game.blockSize }, // -> right down corner
						lu: { x: x * game.blockSize, y: y * game.blockSize }, // -> left up corner
						ld: { x: x * game.blockSize, y: y * game.blockSize + game.blockSize }, // -> left down corner
						
						drawState: "up",	passengers: 0,		collisionBottom: false,	lives: 3,
						state: "free",		currPlatform:  0,   health: 100,
						
						update: function() {
							if(this.collisionBottom == false) {
								this.vy -= 3;	
							}
							
							this.drawState = "up";

							if(keydown.w) {
								this.vy += 10;
								this.collisionBottom = false;
								this.drawState = "up";
								this.currPlatform = 0;
							}
							if(keydown.s && this.collisionBottom == false) {
								this.vy -= 10;
							}
							if (keydown.a) {
								this.vx -= 7;
								this.drawState = "left";
							}
							if (keydown.d) {
								this.vx += 7;
								this.drawState = "right";
							}
							if(keydown.space) {
					           
							    this.health -= 1;
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
								this.ru.x = this.x + game.blockSize; this.ru.y = this.y;                //         ___ /^^[___              
								this.rd.x = this.x + game.blockSize; this.rd.y = this.y + game.blockSize;   //        /|^+----+   |#___________//
								this.lu.x = this.x; this.lu.y = this.y;                             //      ( -+ |____|   _______-----+/
								this.ld.x = this.x; this.ld.y = this.y + game.blockSize;                //       ==_________--'            \
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
							
							if(this.currPlatform != 0){
								this.collisionBottom = true;			// sollte in taxi.update()
								this.vy = 0;
								this.y = platforms[this.currPlatform-1].yStart - game.blockSize;
							}
							
							for(i = 0; i < transmitters.length; i++){
								if(transmitters[i].distanceToTaxi < 100){
									this.health -= 1;
								}
							}
                            if(this.health < 0) {
                                this.death();
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
									if(game.frame > 48) {
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