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
    for(i=0; i<transmitter.length; i++){
        transmitter[i].draw();
    }
	for(i=0; i<frames.length; i++){
		frames[i].draw();
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
	for(i=0; i<platforms.length; i++){
		platforms[i].draw();
	}
	taxi.draw();
/*++ Kann der Schrott hier raus!? ++*/
    //drawTarget();

    //Only for debugging
    //ctx.fillText("Debugging:", 10, 20);
    //ctx.fillText("velocity Y = " + taxi.vy, 10, 40);
    //ctx.fillText("Lost game: " + gameLost, 10, 60);
    //ctx.fillText("Lost game: " + collisionText, 10, 60);
}


/*function drawTarget() {
    var target;
    switch(roundNumber){
        case 1:
            target = String(guests2[0].currPlatform);
            break;

        case 2:
            target = String(guests3[0].currPlatform);
            break;

        case 3:
            target = "Bring Angi raus hier!!";
            break;
    }
    ctx.fillStyle = "white";
    ctx.fillText("Zielplattform: " + target, 50, 50);
}*/