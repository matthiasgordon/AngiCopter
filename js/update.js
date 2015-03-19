function update() {

	  	// update objects
	  	taxi.update();
		for (i=0; i < guests.length; i++){
			for(j=0; j < guests[i].length; j++){
				guests[i][j].update();
			}
		}
		//update targetPlatform
		if(roundNumber != 3){
				targetPlatform = guests[roundNumber][0].currPlatform;
		}else{
				targetPlatform = -1; //Muss noch verbessert werden!
			}
		
		if(keydown.esc) {
			gamePaused = true;
			gamePausedMenu();
		}
		
		//Check: gewonnen? 
		if(taxi.y < -50 && targetPlatform < 0){
			document.getElementById("target").innerHTML = "Gewonnen!";
			gameOver = true;
			gameWonMenu();
		}
		
	  	checkObjects();
	}

    function checkObjects() {
        //Platfrom loop
        for (var i = 0; i < platforms.length; i++) {
			// Check collision platform, taxi
            if(taxi.currPlatform == 0){
                if (taxi.collides(platforms[i].xStart, platforms[i].xEnd,
                                   platforms[i].yStart, platforms[i].yEnd)) {
                    taxi.death();
                }
            }
        }
		
		for(var i = 0; i < frames.length; i++){
			if(taxi.collides(frames[i].xStart, frames[i].xEnd,
                                   frames[i].yStart, frames[i].yEnd)){
				taxi.death();
		    }
		}
		
		for(var i = 0; i < staticSatellites.length; i++){
			if(taxi.collides(staticSatellites[i].xStart, staticSatellites[i].xEnd,
                                   staticSatellites[i].yStart, staticSatellites[i].yEnd)){
				taxi.death();
		    }
		}

        //Obstacle loop
        for (var i = 0; i < obstacles.length; i++) {
			// check collision taxi obstacles
			switch(obstacles[i].type) {
				case "frame":
					if (checkTaxiCollision(obstacles[i].xStart, obstacles[i].xEnd,
										obstacles[i].yStart, obstacles[i].yEnd)) {
						taxi.death();
					}
					break;
				
				case "static_obstacle":
					if (checkTaxiCollision(obstacles[i].xStart, obstacles[i].xEnd,
										obstacles[i].yStart, obstacles[i].yEnd)) {
						taxi.death();
					}
					break;
					
				case "platform_edge":
					if (checkTaxiCollision(obstacles[i].xStart, obstacles[i].xEnd,
										obstacles[i].yStart, obstacles[i].yEnd)) {
						taxi.death();
					}
					break;
			}
        }
		
		//Guests loops
		for (i = 0; i < guests[roundNumber-1].length; i++){
			//check if taxi arrived for picking up guest
			if(guests[roundNumber-1][i].currPlatform == taxi.currPlatform){
				guests[roundNumber-1][i].enterTaxi(taxi.x);
			}
			//handle collision taxi, guest
			if (checkTaxiCollision(guests[roundNumber-1][i].x, guests[roundNumber-1][i].x + blockSizeX,
									guests[roundNumber-1][i].y, guests[roundNumber-1][i].y + blockSizeY)) {
				if(taxi.vy == 0){
					guests[roundNumber-1][i].state = "onTaxi";
				}
				else if(guests[roundNumber-1][i].state == "free"){
					taxi.death();
				}
			}
		}
		
		//action when taxi landed on any platform
		if(taxi.currPlatform != 0){
			//guests delivered ?
			if(taxi.state == "full" && taxi.currPlatform == targetPlatform){
				console.log("Gaeste abgeliefert!");
				roundNumber++;
			}
			
			taxi.collisionBottom = true;
			taxi.vy = 0;
			taxi.y = platforms[taxi.currPlatform-1].yStart - blockSizeY;
		}
    }
	
	//check if object is on platform
	function checkOnPlatform (platXstart, platXend, platYstart, platYend, objXstart, objXend, objYstart, objYend){// 
		if(checkCollision(platXstart, platXend, platYstart, platYend, objXstart, objYstart)
                               &&
           checkCollision(platXstart, platXend, platYstart, platYend, objXend, objYend)){
			return true;					   
		} else{
			return false;
		}
	}
	//check if taxi collides with any object
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
	//check collision between two objects
    function checkCollision(xStart, xEnd, yStart, yEnd, xObj, yObj) {
        if ((yObj >= yStart && yObj <= yEnd) && (xObj >= xStart && xObj <= xEnd)) {
            return true;
        }
        else {
            return false;
        }
    }