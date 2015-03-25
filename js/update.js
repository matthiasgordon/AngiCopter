function update() {

	  	//********************************update objects********************************/
	  	//Call the update method of each object
	  	game.update();
		taxi.update();

	  	for(i=0; i < transmitters.length; i++) {
	  		transmitters[i].update();
	  	}
		
		for(i=0; i < drones.length; i++) {
	  		drones[i].update();
	  	}
		
		for(i=0; i < exits.length; i++) {
	  		exits[i].update();
	  	}
		
	  	for(i=0; i < staticSatellites.length; i++) {
	  		staticSatellites[i].update();
	  	}
		
	  	for(i=0; i < googleCars.length; i++) {
	  		googleCars[i].update();
	  	}

		for (i=0; i < guests.length; i++){
			for(j=0; j < guests[i].length; j++){
				guests[i][j].update();
			}
		}
		
		//Pause the game if the esc key is pressed and show the gamePausedMenu
		if(keydown.esc) {
			game.state = "pause";
			menu.showGamePausedMenu();
		}
		
		//Check: gewonnen? 
		if(taxi.y < -50 && game.targetPlatform < 0){
			game.state = "over";
			game.frame = 0;
			menu.showGameWonMenu();
		}
		
	  	checkObjects();
	}

    function checkObjects() {
    	//In this function we are looping trough the collector arrays

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
		
		//Frame elements loop
		for(var i = 0; i < frames.length; i++){
			if(taxi.collides(frames[i].xStart, frames[i].xEnd,
                                   frames[i].yStart, frames[i].yEnd)){
				taxi.death();
		    }
		}
		
		//Exit loop
		for(var i = 0; i < exits.length; i++){
			if(taxi.collides(exits[i].xStart, exits[i].xEnd,
                                   exits[i].yStart, exits[i].yEnd)){
				if(exits[i].state == "visible"){
					taxi.death();	
				}
		    }
		}
		
		//Satellite loop
		for(var i = 0; i < staticSatellites.length; i++){
			if(taxi.collides(staticSatellites[i].xStart, staticSatellites[i].xEnd,
                                   staticSatellites[i].yStart, staticSatellites[i].yEnd)){
				taxi.death();
		    }
		}
		
		//Powerup loop
		for(var i = 0; i < powerUps.length; i++){
			if(taxi.collides(powerUps[i].xStart, powerUps[i].xEnd,
                                   powerUps[i].yStart, powerUps[i].yEnd)){
				if(powerUps[i].type=="I" && powerUps[i].state == "open"){
					powerUps[i].state = "closed";
					for(i = 0; i < transmitters.length; i++){
						transmitters[i].state = "off";
					}
				}else if(powerUps[i].type=="J" && powerUps[i].state == "open"){
					powerUps[i].state = "closed";
					taxi.powerUpState = "fast";
				}
		    }
		}
		
		//Guests loops
		for (i = 0; i < guests[game.roundNumber-1].length; i++){
			var currGuest = guests[game.roundNumber-1][i];

			//check if taxi arrived for picking up guest
			if(currGuest.state == "free"){
				if (taxi.collides(currGuest.x, currGuest.x + game.blockSize,
									currGuest.y, currGuest.y + game.blockSize)) {
					if(taxi.vy == 0){
						currGuest.state = "onTaxi";
					}else{
						taxi.death();
					}
				}
				
				if(currGuest.currPlatform == taxi.currPlatform){
					currGuest.enterTaxi();
				}else{
					currGuest.direction = "standing";
				}	
			}
			
			if(currGuest.state == "onTaxi"){
				if(game.targetPlatform == taxi.currPlatform && taxi.state == "full"){
					currGuest.exitTaxi();
					currGuest.state = "leaving";
				}
			}
			
			if(currGuest.state == "leaving"){
				if (checkCollision(guests[game.roundNumber][0].x, guests[game.roundNumber][0].x + game.blockSize, 
					guests[game.roundNumber][0].y, guests[game.roundNumber][0].y + game.blockSize, currGuest.x, currGuest.y)){
						currGuest.state = "delivered";
				}else{
					currGuest.leaveTaxi();
				}
			}
		}

		//Drone loop
		for(i=0; i < drones.length; i++) {
	  		if(taxi.collides(drones[i].xStart, drones[i].xEnd, drones[i].yStart, drones[i].yEnd)) {
	  			taxi.death();
	  		}
	  	}

	  	//GoogleCar loop
	  	for(i=0; i < googleCars.length; i++) {
	  		if(taxi.collides(googleCars[i].xStart, googleCars[i].xEnd, googleCars[i].yStart, googleCars[i].yEnd)) {
	  			taxi.death();
	  		}
	  	}

	  	//Transmitter loop
	  	for(i=0; i < transmitters.length; i++) {
	  		if(taxi.collides(transmitters[i].xStart, transmitters[i].xEnd, transmitters[i].yStart, transmitters[i].yEnd)) {
	  			taxi.death();
	  		}
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