function update() {

	  	//********************************update objects********************************/
	  	game.update();
		taxi.update();

	  	for(i=0; i < transmitters.length; i++) {
	  		transmitters[i].update();
			document.getElementById("target").innerHTML = transmitters[i].distanceToTaxi;
	  	}
		
		for(i=0; i < drones.length; i++) {
	  		drones[i].update();
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
			gamePausedMenu();
		}
		
		//Check: gewonnen? 
		if(taxi.y < -50 && game.targetPlatform < 0){
			document.getElementById("target").innerHTML = "Gewonnen!";
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
		
		for(var i = 0; i < staticSatellites.length; i++){
			if(taxi.collides(staticSatellites[i].xStart, staticSatellites[i].xEnd,
                                   staticSatellites[i].yStart, staticSatellites[i].yEnd)){
				taxi.death();
		    }
		}
		
		//Guests loops
		for (i = 0; i < guests[game.roundNumber-1].length; i++){
			//check if taxi arrived for picking up guest
			if(guests[game.roundNumber-1][i].currPlatform == taxi.currPlatform){
				guests[game.roundNumber-1][i].enterTaxi(taxi.x);
			}else{
				guests[game.roundNumber-1][i].direction = "standing";
			}
			//handle collision taxi, guest
			if (taxi.collides(guests[game.roundNumber-1][i].x, guests[game.roundNumber-1][i].x + game.blockSize,
									guests[game.roundNumber-1][i].y, guests[game.roundNumber-1][i].y + game.blockSize)) {
				if(taxi.vy == 0){
					guests[game.roundNumber-1][i].state = "onTaxi";
				}
				else if(guests[game.roundNumber-1][i].state == "free"){
					taxi.death();
				}
			}
		}
		
		//action when taxi landed on any platform
		if(taxi.currPlatform != 0){
			//guests delivered ?
			if(taxi.state == "full" && taxi.currPlatform == game.targetPlatform){ 	//wird Funktion von game.update
				console.log("Gaeste abgeliefert!");
				game.roundNumber++;
			}
			if(taxi.vy < -300) {
				taxi.death();
			}
			taxi.collisionBottom = true;			// sollte in taxi.update()
			taxi.vy = 0;
			taxi.y = platforms[taxi.currPlatform-1].yStart - game.blockSize;
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