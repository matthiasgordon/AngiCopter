function update() {
		taxi.direction = "up";

		if(keydown.up) {
			taxi.vy += 10;
			taxi.collisionBottom = false;
			taxi.direction = "up";
			taxi.currPlatform = 0;
		}
		if(keydown.down && taxi.collisionBottom == false) {
			taxi.vy -= 10;
		}
		if (keydown.left) {
	    	taxi.vx -= 7;
			taxi.direction = "left";
	  	}
	  	if (keydown.right) {
	    	taxi.vx += 7;
			taxi.direction = "right";
	  	}
	  	if(keydown.space) {
	  		// Zeit die Kufen auszufahren!!!

            console.log(platformCollector.length);
	  	}
	  	//console.log("update!");
	  	// Simulating gravity
	  	if(taxi.collisionBottom == false) {
	  		taxi.vy -= 3;	
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
        for (var i = 0; i < platformCollector.length; i++) {

            /*Prüfung Landung*/
			if(checkOnPlatform(platformCollector[i].xStart, platformCollector[i].xEnd,
						   platformCollector[i].yStart, platformCollector[i].yEnd,
						   taxi.ld.x, taxi.rd.x, taxi.ld.y, taxi.rd.y)){

				taxi.currPlatform = platformCollector[i].id;
				if(taxi.state == "full" && taxi.currPlatform == targetPlatform){
					console.log("win!");
				}
				taxi.collisionBottom = true;
				taxi.vy = 0;
				//taxi.vx = 0;
				taxi.y = platformCollector[i].yStart - blockSizeY;
            }
            else{
                if (checkTaxiCollision(platformCollector[i].xStart, platformCollector[i].xEnd,
                                   platformCollector[i].yStart, platformCollector[i].yEnd)) {
                    taxi.x = taxiStartx;
                    taxi.y = taxiStarty;
                    taxi.vy = 0;
                    taxi.vx = 0;
                }
            }
        }

        //Obstacle loop
        for (var i = 0; i < obstacleCollector.length; i++) {
			//console.log(obstacleCollector[i].type);
			switch(obstacleCollector[i].type) {
				case "frame":
					if (checkTaxiCollision(obstacleCollector[i].xStart, obstacleCollector[i].xEnd,
										obstacleCollector[i].yStart, obstacleCollector[i].yEnd)) {
						death();
					}
					break;
				
				case "static_obstacle":
					if (checkTaxiCollision(obstacleCollector[i].xStart, obstacleCollector[i].xEnd,
										obstacleCollector[i].yStart, obstacleCollector[i].yEnd)) {
						death();
					}
					break;
					
				case "platform_edge":
					if (checkTaxiCollision(obstacleCollector[i].xStart, obstacleCollector[i].xEnd,
										obstacleCollector[i].yStart, obstacleCollector[i].yEnd)) {
						death();
					}
					break;
			}
        }
		
		//Guest loop
		var guestCounter = 0;
		var passengerCounter = 0;
		for (var i = 0; i < guestCollector.length; i++) {
			//updateing platform_ID
			for (var j = 0; j < platformCollector.length; j++) {
				if(checkOnPlatform(platformCollector[j].xStart, platformCollector[j].xEnd,
                               platformCollector[j].yStart, platformCollector[j].yEnd,
							   guestCollector[i].x, guestCollector[i].x + blockSizeX, 
							   guestCollector[i].y + blockSizeY, guestCollector[i].y + blockSizeY)){
					guestCollector[i].currPlatform = platformCollector[j].id;
				}
			}
			switch(guestCollector[i].type) {
				case "guest_1":
				if(roundNumber == 1){
					guestCounter++;
					if(guestCollector[i].currPlatform == taxi.currPlatform){
						if(taxi.x-guestCollector[i].x <0){
							guestCollector[i].x -= 1;
						}else{
							guestCollector[i].x += 1;
						}
						console.log("da!")
					}
				}
				if (checkTaxiCollision(guestCollector[i].x, guestCollector[i].x + blockSizeX,
									guestCollector[i].y, guestCollector[i].y + blockSizeY)) {
						if(taxi.vy == 0){
							guestCollector[i].state = "onTaxi";
						}
						else if(guestCollector[i].state == "free"){
							death();
						}
					}
				if(guestCollector[i].state == "onTaxi")		//Idee kann man bestimmt schöner programmieren
					passengerCounter++;
				if(passengerCounter==guestCounter){
					taxi.state = "full";
				}else{
					taxi.state = "free";
				}
					
				break;
				
				/*case "guest_2":
					if (checkTaxiCollision(guestCollector[i].xStart, guestCollector[i].xEnd,
										guestCollector[i].yStart, guestCollector[i].yEnd)) {
						death();
					}
					break;*/
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
        taxi.x = taxiStartx;
		taxi.y = taxiStarty;
		taxi.vy = 0;
		taxi.vx = 0;
	}