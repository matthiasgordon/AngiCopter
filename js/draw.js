// Draw the game
function draw() {
    // Counting up the frame while game is unpaused
    if(gamePaused == false) {
        frame += 0.1;
    }
    //console.log("draw!");
    drawBackground();
    drawLevel();
   // guests1.draw();

    switch(taxi.draw) {

        case "up":
            taxi.drawUp();
            break;

        case "left":
            taxi.drawLeft();
            break;
        
        case "right":
            taxi.drawRight();
            break;

        case "broken":
            taxi.vx = 0;
            taxi.vy = 0;
            taxi.drawBroken();
            frame += 0.2;
            if(frame > 48) {
                gameOverMenu();
            }
            break;
    }

    //Only for debugging
    ctx.fillText("Debugging:", 10, 20);
    ctx.fillText("velocity Y = " + taxi.vy, 10, 40);
    //ctx.fillText("Lost game: " + gameLost, 10, 60);
    ctx.fillText("Lost game: " + collisionText, 10, 60);
}

function drawBackground() {
        //ctx.drawImage(background, 0, 0, background.width, background.height, 0, 0, cwidth, cheight);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, w, h);
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
                    ctx.fillStyle = "#AAAAAA";
                    ctx.fillRect(x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;

                // Left edge of platform
                case "<":
                    ctx.drawImage(blocks20x10, blocks20x10.width / 20 * 5, blocks20x10.height / 10 * 1, blocks20x10.width / 20, blocks20x10.height / 10,
                                        x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;
                
                // Right edge of platform
                case ">":
                    var indexx = 10, indexy = 1;
                    ctx.drawImage(blocks20x10, blocks20x10.width / 20 * indexx, blocks20x10.height / 10 * indexy, blocks20x10.width / 20, blocks20x10.height / 10,
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
					for(i = 0; i < guests1.length; i++){
					   if(roundNumber == 1 && guests1[i].type == "guest_1" && guests1[i].state == "free"){
							ctx.drawImage(guest, 0, 0, guest.width, guest.height, guests1[i].x, guests1[i].y, blockSizeX, blockSizeY);
					   }
					}
					break;

                // Second passenger spawning position
				case "2":
					for(i = 0; i < guests2.length; i++){
					   if(roundNumber == 2 && guests2[i].type == "guest_2" && guests2[i].state == "free"){
							ctx.drawImage(guest, 0, 0, guest.width, guest.height, guests2[i].x, guests2[i].y, blockSizeX, blockSizeY);
					   }
					}
                    break;
					
                // Third passenger spawning position
                case "3":
					for(i = 0; i < guests3.length; i++){
						if(roundNumber == 3 && guests3[i].type == "guest_3" && guests3[i].state == "free"){
							ctx.drawImage(guest, 0, 0, guest.width, guest.height, guests3[i].x, guests3[i].y, blockSizeX, blockSizeY);
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