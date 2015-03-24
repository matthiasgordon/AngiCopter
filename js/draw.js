// Draw the game
function draw() {
    // Counting up the frame while game is unpaused
    if(game.state == "running") {
        game.frame += 0.1;
    }
	
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