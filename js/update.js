function update() {
		taxi.draw = "up";

		if(keydown.up) {
			taxi.vy += 10;
			taxi.collisionBottom = false;
			taxi.draw = "up";
			taxi.currPlatform = 0;
		}
		if(keydown.down && taxi.collisionBottom == false) {
			taxi.vy -= 10;
		}
		if (keydown.left) {
	    	taxi.vx -= 7;
			taxi.draw = "left";
	  	}
	  	if (keydown.right) {
	    	taxi.vx += 7;
			taxi.draw = "right";
	  	}
	  	if(keydown.space) {
	  		// Zeit die Kufen auszufahren!!!

            console.log(platforms.length);
	  	}
	  	//console.log("update!");
	  	// Simulating gravity
	  	if(taxi.collisionBottom == false) {
	  		taxi.vy -= 3;	
		}

		if(keydown.esc) {
			gamePaused = true;
			gamePausedMenu();
		}
		
		//Check: gewonnen?
		if(taxi.y < -50){
			document.getElementById("target").innerHTML = "Gewonnen!";
			gameOver = true;
			gameWonMenu();
		}
		
		if(taxi.collisionBottom == true) {
			if(taxi.vx < -5) {
				taxi.vx += 5;
			}
			else {
				if(taxi.vx > 5) {
					taxi.vx -= 5;
				}
				else {
					taxi.vx = 0;
				}
			}

		}

        //Update of X/Y - coordinate of taxi
	  	taxi.x += taxi.vx/200;
	  	taxi.y -= taxi.vy / 200;
    //                                                                     lu = left-up                     ru = right-up
    //Update of taxi corner position:                                       //---------------+---------------
        taxi.ru.x = taxi.x + blockSizeX; taxi.ru.y = taxi.y;                //         ___ /^^[___              
        taxi.rd.x = taxi.x + blockSizeX; taxi.rd.y = taxi.y + blockSizeY;   //        /|^+----+   |#___________//
        taxi.lu.x = taxi.x; taxi.lu.y = taxi.y;                             //      ( -+ |____|   _______-----+/
        taxi.ld.x = taxi.x; taxi.ld.y = taxi.y + blockSizeY;                //       ==_________--'            \
                                                                            //          ~_|___|__
    // After updating the position check if the is a collision             ld = left-down                   rd = right-down
	  	checkObjects();
	}

    function checkObjects() {
        //Platfrom loop
        for (var i = 0; i < platforms.length; i++) {

            /*Prüfung Landung*/
			if(checkOnPlatform(platforms[i].xStart, platforms[i].xEnd,
						   platforms[i].yStart, platforms[i].yEnd,
						   taxi.ld.x, taxi.rd.x, taxi.ld.y, taxi.rd.y)){
				taxi.currPlatform = platforms[i].id;
				//gewonnen
				if(taxi.state == "full" && taxi.currPlatform == targetPlatform){
					console.log("win!");
					roundNumber++;
				}
				
				taxi.collisionBottom = true;
				taxi.vy = 0;
				//taxi.vx = 0;
				taxi.y = platforms[i].yStart - blockSizeY;
            }
            else{
                if (checkTaxiCollision(platforms[i].xStart, platforms[i].xEnd,
                                   platforms[i].yStart, platforms[i].yEnd)) {
                    /*taxi.x = taxiStartx;
                    taxi.y = taxiStarty;
                    taxi.vy = 0;
                    taxi.vx = 0;*/
                    death();
                }
            }
        }

        //Obstacle loop
        for (var i = 0; i < obstacles.length; i++) {
			//console.log(obstacles[i].type);
			switch(obstacles[i].type) {
				case "frame":
					if (checkTaxiCollision(obstacles[i].xStart, obstacles[i].xEnd,
										obstacles[i].yStart, obstacles[i].yEnd)) {
						death();
					}
					break;
				
				case "static_obstacle":
					if (checkTaxiCollision(obstacles[i].xStart, obstacles[i].xEnd,
										obstacles[i].yStart, obstacles[i].yEnd)) {
						death();
					}
					break;
					
				case "platform_edge":
					if (checkTaxiCollision(obstacles[i].xStart, obstacles[i].xEnd,
										obstacles[i].yStart, obstacles[i].yEnd)) {
						death();
					}
					break;
			}
        }
		
		//Guests loops
		taxi.passengers = 0;
		switch(roundNumber){
			case 1:
				for (var i = 0; i < guests1.length; i++) {
					//updateing platform_ID
					for (var j = 0; j < platforms.length; j++) {
						if(checkOnPlatform(platforms[j].xStart, platforms[j].xEnd,
									   platforms[j].yStart, platforms[j].yEnd,
									   guests1[i].x, guests1[i].x + blockSizeX, 
									   guests1[i].y + blockSizeY, guests1[i].y + blockSizeY)){
							guests1[i].currPlatform = platforms[j].id;
						}
					}
					// setting up target platform
					targetPlatform = guests2[0].currPlatform;
					document.getElementById("target").innerHTML ="Zielplattform:" + targetPlatform;
					//do loading process
					if(guests1[i].currPlatform == taxi.currPlatform){
							guests1[i].enterTaxi(taxi.x);
					}
					//Check collision or loading?
					if (checkTaxiCollision(guests1[i].x, guests1[i].x + blockSizeX,
										guests1[i].y, guests1[i].y + blockSizeY)) {
							if(taxi.vy == 0){
								guests1[i].state = "onTaxi";
							}
							else if(guests1[i].state == "free"){
								death();
							}
					}
					//update taxi attributes
					if(guests1[i].state == "onTaxi")		//Idee kann man bestimmt schöner programmieren
						taxi.passengers++;
					if(taxi.passengers == guests1.length){
						taxi.state = "full";
					}else{
						taxi.state = "free";
					}
				}			
				break;
			case 2:
				for (var i = 0; i < guests2.length; i++) {
					//updateing platform_ID
					for (var j = 0; j < platforms.length; j++) {
						if(checkOnPlatform(platforms[j].xStart, platforms[j].xEnd,
									   platforms[j].yStart, platforms[j].yEnd,
									   guests2[i].x, guests2[i].x + blockSizeX, 
									   guests2[i].y + blockSizeY, guests2[i].y + blockSizeY)){
							guests2[i].currPlatform = platforms[j].id;
						}
					}
					// setting up target platform
					targetPlatform = guests3[0].currPlatform;
					document.getElementById("target").innerHTML ="Zielplattform:" + targetPlatform;
					//do loading process
					if(guests2[i].currPlatform == taxi.currPlatform){
						guests2[i].enterTaxi(taxi.x);
					}
					//Check collision or loading?
					if (checkTaxiCollision(guests2[i].x, guests2[i].x + blockSizeX,
									guests2[i].y, guests2[i].y + blockSizeY)) {
						if(taxi.vy == 0){
							guests2[i].state = "onTaxi";
						}
						else if(guests2[i].state == "free"){
							death();
						}
					}
					//update taxi attributes
					if(guests2[i].state == "onTaxi")		//Idee kann man bestimmt schöner programmieren
						taxi.passengers++;
					if(taxi.passengers == guests2.length){
						taxi.state = "full";
					}else{
						taxi.state = "free";
					}
				}
			break;
			case 3:
				for (var i = 0; i < guests3.length; i++) {
				//updateing platform_ID
					for (var j = 0; j < platforms.length; j++) {
						if(checkOnPlatform(platforms[j].xStart, platforms[j].xEnd,
									   platforms[j].yStart, platforms[j].yEnd,
									   guests3[i].x, guests3[i].x + blockSizeX, 
									   guests3[i].y + blockSizeY, guests3[i].y + blockSizeY)){
							guests3[i].currPlatform = platforms[j].id;
						}
					}
				// setting up target platform
				//targetPlatform = guests3[0].currPlatform;
				document.getElementById("target").innerHTML ="Zielplattform: Bring Angi raus hier!!";
				//do loading process
				if(guests3[i].currPlatform == taxi.currPlatform){
						guests3[i].enterTaxi(taxi.x);
				}
				//Check collision or loading?
				if (checkTaxiCollision(guests3[i].x, guests3[i].x + blockSizeX,
									guests3[i].y, guests3[i].y + blockSizeY)) {
						if(taxi.vy == 0){
							guests3[i].state = "onTaxi";
						}
						else if(guests3[i].state == "free"){
							death();
						}
				}
				//update taxi attributes
				if(guests3[i].state == "onTaxi")		//Idee kann man bestimmt schöner programmieren
					taxi.passengers++;
				if(taxi.passengers == guests3.length){
					taxi.state = "full";
				}else{
					taxi.state = "free";
				}
			}			
	}
		
    }
	
	function checkOnPlatform (platXstart, platXend, platYstart, platYend, objXstart, objXend, objYstart, objYend){// 
		if(checkCollision(platXstart, platXend, platYstart, platYend, objXstart, objYstart)
                               &&
           checkCollision(platXstart, platXend, platYstart, platYend, objXend, objYend)){
			return true;					   
		} else{
			return false;
		}
	}

    function checkTaxiCollision(obstXstart, obstXend, obstYstart, obstYend) {
        if (checkCollision(obstXstart, obstXend, obstYstart, obstYend, taxi.lu.x, taxi.lu.y)||
            checkCollision(obstXstart, obstXend, obstYstart, obstYend, taxi.ld.x, taxi.ld.y)||
            checkCollision(obstXstart, obstXend, obstYstart, obstYend, taxi.ru.x, taxi.ru.y)||
            checkCollision(obstXstart, obstXend, obstYstart, obstYend, taxi.rd.x, taxi.rd.y)) {
            return true;
        }
        else {
            return false;
        }
    }

    function checkCollision(xStart, xEnd, yStart, yEnd, xObj, yObj) {
        if ((yObj >= yStart && yObj <= yEnd) && (xObj >= xStart && xObj <= xEnd)) {
            return true;
        }
        else {
            return false;
        }
    }

	function death() {
		taxi.draw = "broken";
		frame = 0;
		gameOver = true;

		/*
		var endFrame = 0;
		var endFrameLimit = 48;
		while(endFrame < endFrameLimit) {
			setTimeout(function() {
				taxi.drawBroken(endFrame);
			}, 500);
			endFrame++;
		}

		*/
		
		//gameOverMenu();
	}