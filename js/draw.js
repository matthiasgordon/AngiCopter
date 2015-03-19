// Draw the game
function draw() {
    // Counting up the frame while game is unpaused
    if(gamePaused == false) {
        frame += 0.1;
    }

    drawBackground();
    drawLevel();
	for (i=0; i < guests.length; i++){
		for(j=0; j < guests[i].length; j++){
			guests[i][j].draw();
		}
	}
	for(i=0; i<frames.length; i++){
		frames[i].draw();
	}
	for(i=0; i<staticSatellites.length; i++){
		staticSatellites[i].draw();
	}
	for(i=0; i<platforms.length; i++){
		platforms[i].draw();
	}
	taxi.draw();

    for(i=0; i < drones.length; i++) {
            drones[i].draw();
        }
    //drawTarget();

    //Only for debugging
    //ctx.fillText("Debugging:", 10, 20);
    //ctx.fillText("velocity Y = " + taxi.vy, 10, 40);
    //ctx.fillText("Lost game: " + gameLost, 10, 60);
    //ctx.fillText("Lost game: " + collisionText, 10, 60);
}

function drawBackground() {
        ctx.drawImage(background, 0, 0, background.width, background.height, 0, 0, w, h);
        //ctx.fillStyle = "#FFFFFF";
        //ctx.fillRect(0, 0, w, h);
    }

// Draw the level depending on the level description file
function drawLevel() {
    var strings = levelDataRaw;
    var levelRows = strings.split("\r\n");

    for (y = 0; y < levelYMax; y++) {
        for (x = 0; x < levelXMax; x++) {

            switch(levelRows[y][x]){

                /*********************************Basic Level elements*********************************/
                case ".": //Nothing
                    break;

                // "Hindernis beweglich" moving between first and second X
                case "Y": 
                    
                    break;
				/*********************************Dynamic Level elements*********************************/
                // Position for level exit
                case "E":

                    break;
                // Reserved symbols for our group: G, H, I, J, K, L, M

                // TODO FÜR SPÄTER!!!!!!
                // Unterscheidung zwischen Groß- und Kleinschreibung

            }//switch
        }//for x
    }//for y

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