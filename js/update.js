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
			// Check collision platform, taxi / if it collides --> taxi is dead
            if(taxi.currPlatform == 0){
                if (taxi.collides(platforms[i].xStart, platforms[i].xEnd,
                                   platforms[i].yStart, platforms[i].yEnd)) {
                    taxi.death();
                }
            }
        }
		
		//Frame elements loop
		for(var i = 0; i < frames.length; i++){
			//If taxi collides with frame --> taxi is dead
			if(taxi.collides(frames[i].xStart, frames[i].xEnd,
                                   frames[i].yStart, frames[i].yEnd)){
				taxi.death();
		    }
		}
		
		//Exit loop
		for(var i = 0; i < exits.length; i++){
			//if taxi collides with exit
			if(taxi.collides(exits[i].xStart, exits[i].xEnd,
                                   exits[i].yStart, exits[i].yEnd)){
				//and exit is visible --> taxi is dead
				if(exits[i].state == "visible"){
					taxi.death();	
				}
		    }
		}
		
		//Satellite loop
		for(var i = 0; i < staticSatellites.length; i++){
			//If taxi collides with satellite --> taxi dead
			if(taxi.collides(staticSatellites[i].xStart, staticSatellites[i].xEnd,
                                   staticSatellites[i].yStart, staticSatellites[i].yEnd)){
				taxi.death();
		    }
		}
		
		//Powerup loop
		for(var i = 0; i < powerUps.length; i++){
			//If taxi collides with powerup
			if(taxi.collides(powerUps[i].xStart, powerUps[i].xEnd,
                                   powerUps[i].yStart, powerUps[i].yEnd)){
				//Check if powerup type is Snowden
				if(powerUps[i].type=="I" && powerUps[i].state == "open"){
					//Then close the powerup and shut of the transmitter
					powerUps[i].state = "closed";
					for(i = 0; i < transmitters.length; i++){
						transmitters[i].state = "off";
					}
				//If the powerup is Lightning
				}else if(powerUps[i].type=="J" && powerUps[i].state == "open"){
					//Close the powerup auf set the taxi powerupstate to fast
					powerUps[i].state = "closed";
					taxi.powerUpState = "fast";
				}
		    }
		}
		
		//Guests loops
		for (i = 0; i < guests[game.roundNumber-1].length; i++){
			var currGuest = guests[game.roundNumber-1][i];

			//If the state of the guest is free, the taxi collides with the guest and the taxi does not move in y direction
			//collect the guest
			if(currGuest.state == "free"){
				if (taxi.collides(currGuest.x, currGuest.x + game.blockSize,
									currGuest.y, currGuest.y + game.blockSize)) {
					if(taxi.vy == 0){
						currGuest.state = "onTaxi";
					//If taxi is faster --> taxi is dead
					}else{
						taxi.death();
					}
				}
				
				//If the current guests platform is equal to the taxis current platform
				if(currGuest.currPlatform == taxi.currPlatform){
					//Guest enters the taxi
					currGuest.enterTaxi();
				//If they are not on the same platform the guest freezes
				}else{
					currGuest.direction = "standing";
				}	
			}

			//If the current guest is on the taxi and the taxi lands on the target platform, the guest exits the taxi
			//and gets the state leaving
			if(currGuest.state == "onTaxi"){
				if(game.targetPlatform == taxi.currPlatform && taxi.state == "full"){
					currGuest.exitTaxi();
					currGuest.state = "leaving";
				}
			}
			
			//If the guest is leaving out of the taxi and arrives to his target position on the platform he is "delivered"
			if(currGuest.state == "leaving"){
				if (checkCollision(guests[game.roundNumber][0].x, guests[game.roundNumber][0].x + game.blockSize, 
					guests[game.roundNumber][0].y, guests[game.roundNumber][0].y + game.blockSize, currGuest.x, currGuest.y)){
						currGuest.state = "delivered";
				//If he does not arrive he goes to get there
				}else{
					currGuest.leaveTaxi();
				}
			}
		}

		//Drone loop
		for(i=0; i < drones.length; i++) {
			//If taxi collides with a drone --> taxi is dead
	  		if(taxi.collides(drones[i].xStart, drones[i].xEnd, drones[i].yStart, drones[i].yEnd)) {
	  			taxi.death();
	  		}
	  	}

	  	//GoogleCar loop
	  	for(i=0; i < googleCars.length; i++) {
	  		//If taxi collides with a googleCar --> taxi is dead
	  		if(taxi.collides(googleCars[i].xStart, googleCars[i].xEnd, googleCars[i].yStart, googleCars[i].yEnd)) {
	  			taxi.death();
	  		}
	  	}

	  	//Transmitter loop
	  	for(i=0; i < transmitters.length; i++) {
	  		//If taxi collides with a transmitter --> taxi is dead
	  		if(taxi.collides(transmitters[i].xStart, transmitters[i].xEnd, transmitters[i].yStart, transmitters[i].yEnd)) {
	  			taxi.death();
	  		}
	  	}
    }

	//check collision between two given objects
    function checkCollision(xStart, xEnd, yStart, yEnd, xObj, yObj) {
        if ((yObj >= yStart && yObj <= yEnd) && (xObj >= xStart && xObj <= xEnd)) {
            return true;
        }
        else {
            return false;
        }
    }