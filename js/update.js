function update() {

	  	//********************************update objects********************************/
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
		
		for(var i = 0; i < exits.length; i++){
			if(taxi.collides(exits[i].xStart, exits[i].xEnd,
                                   exits[i].yStart, exits[i].yEnd)){
				if(exits[i].state == "visible"){
					taxi.death();	
				}
		    }
		}
		
		for(var i = 0; i < staticSatellites.length; i++){
			if(taxi.collides(staticSatellites[i].xStart, staticSatellites[i].xEnd,
                                   staticSatellites[i].yStart, staticSatellites[i].yEnd)){
				taxi.death();
		    }
		}
		
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
			//check if taxi arrived for picking up guest
			if(guests[game.roundNumber-1][i].state != "leaving"){
				if(guests[game.roundNumber-1][i].currPlatform == taxi.currPlatform){
					guests[game.roundNumber-1][i].enterTaxi(taxi.x);
				}else{
					guests[game.roundNumber-1][i].direction = "standing";
				}	
			}
			
			
			//check if taxi arrived at targetPlatform
			if(game.targetPlatform == taxi.currPlatform && taxi.state == "full"){
				if (checkCollision(guests[game.roundNumber][0].x, guests[game.roundNumber][0].x + game.blockSize, 
					guests[game.roundNumber][0].y, guests[game.roundNumber][0].y + game.blockSize, guests[game.roundNumber-1][i].x, guests[game.roundNumber-1][i].y)){
						guests[game.roundNumber-1][i].state = "delivered";
						game.roundNumber++;
				}else{
					guests[game.roundNumber-1][i].leaveTaxi(taxi.x);
					guests[game.roundNumber-1][i].state = "leaving";
				}
			}
			
			//handle collision taxi, guest
			if (taxi.collides(guests[game.roundNumber-1][i].x, guests[game.roundNumber-1][i].x + game.blockSize,
									guests[game.roundNumber-1][i].y, guests[game.roundNumber-1][i].y + game.blockSize)) {
				if(taxi.vy == 0 && guests[game.roundNumber-1][i].state != "leaving"){
					guests[game.roundNumber-1][i].state = "onTaxi";
				}
				else if(guests[game.roundNumber-1][i].state == "free"){
					taxi.death();
				}
			}
		}

		for(i=0; i < drones.length; i++) {
	  		if(taxi.collides(drones[i].xStart, drones[i].xEnd, drones[i].yStart, drones[i].yEnd)) {
	  			taxi.death();
	  		}
	  	}

	  	for(i=0; i < googleCars.length; i++) {
	  		if(taxi.collides(googleCars[i].xStart, googleCars[i].xEnd, googleCars[i].yStart, googleCars[i].yEnd)) {
	  			taxi.death();
	  		}
	  	}

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