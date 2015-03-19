// Draw the game
function draw() {
    // Counting up the frame while game is unpaused
    if(gamePaused == false) {
        frame += 0.1;
    }
    //console.log("draw!");
    drawBackground();
    drawLevel();
	taxi.draw();
	for (i=0; i < guests.length; i++){
		for(j=0; j < guests[i].length; j++){
			guests[i][j].draw();
		}
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

                // Platform
                case "#":
                    ctx.drawImage(platform_mid, 0, 0, platform_mid.width, platform_mid.height,
                                        x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;

                // Left edge of platform
                case "<":
                    ctx.drawImage(platform_left, 0, 0, platform_left.width, platform_left.height,
                                        x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;
                
                // Right edge of platform
                case ">":
                    var indexx = 10, indexy = 1;
                    ctx.drawImage(platform_right, 0, 0, platform_right.width, platform_right.height,
                                        x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;

                // Level frame
                case "R":
                    ctx.drawImage(edge, 0, 0, edge.width, edge.height, x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;
				/*********************************Extended Level elements*********************************/
                // "obstacle_stable"                           
                case "X": 
                    ctx.drawImage(obstacle, 0, 0, obstacle.width, obstacle.height, x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;

                // "Hindernis beweglich" moving between first and second X
                case "Y": 
                    
                    break;
				/*********************************Dynamic Level elements*********************************/
                // First passenger spawning position
				case "1":
					for(i = 0; i < guests[0].length; i++){
					   if(roundNumber == 1 && guests[0][i].state == "free"){
							ctx.drawImage(guest, 0, 0, guest.width, guest.height, guests[0][i].x, guests[0][i].y, blockSizeX, blockSizeY);
					   }
					}
					break;

                // Second passenger spawning position
				case "2":
					for(i = 0; i < guests[0].length; i++){
					   if(roundNumber == 2 && guests[1][i].state == "free"){
							ctx.drawImage(guest, 0, 0, guest.width, guest.height, guests[1][i].x, guests[1][i].y, blockSizeX, blockSizeY);
					   }
					}
                    break;
					
                // Third passenger spawning position
                case "3":
					for(i = 0; i < guests[0].length; i++){
					   if(roundNumber == 3 && guests[2][i].state == "free"){
							ctx.drawImage(guest, 0, 0, guest.width, guest.height, guests[0][i].x, guests[0][i].y, blockSizeX, blockSizeY);
						}
					}
                    break;

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