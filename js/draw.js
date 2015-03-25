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

// Draw the game
function draw() {
    // Counting up the frame while game is unpaused
    if(game.state == "running") {
        game.frame += 0.1;
    }
	
    //Call the draw method of each object
    game.drawBackground();
    
	for (i=0; i < guests.length; i++){
		for(j=0; j < guests[i].length; j++){
			guests[i][j].draw();
		}
	}
	for(i=0; i<frames.length; i++){
		frames[i].draw();
	}
	for(i=0; i<exits.length; i++){
		exits[i].draw();
	}
	for(i=0; i<staticSatellites.length; i++){
		staticSatellites[i].draw();
	}
    for(i=0; i < drones.length; i++) {
            drones[i].draw();
        }
    for(i=0; i < googleCars.length; i++) {
        googleCars[i].draw();
    }
	for(i=0; i < powerUps.length; i++) {
        powerUps[i].draw();
    }
	for(i=0; i<platforms.length; i++){
		platforms[i].draw();
	}
	for(i=0; i<transmitters.length; i++){
        transmitters[i].draw();
    }
	taxi.draw();
    sidebar.draw();
}