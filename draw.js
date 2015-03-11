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
                //Basic Level elements
                case ".": //Nothing
                    //ctx.fillStyle = "#AAAA00";
                    //ctx.fillRect(x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;
                case "#": //Platform
                    ctx.fillStyle = "#AAAAAA";
                    ctx.fillRect(x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;
                case "R": //frame
                    ctx.drawImage(edge, 0, 0, edge.width, edge.height, x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;

                //Extended Level Elements                             
                case "A": 
                    ctx.drawImage(obstacle, 0, 0, obstacle.width, obstacle.height, x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;

                case "F":
                    ctx.drawImage(fire, Math.floor(frame % 7) * fire.width / 7, 0, fire.width / 7, fire.height,
			                             x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;
                
                //Jungle platform <===>
                case "<":
                    ctx.drawImage(blocks20x10, blocks20x10.width / 20 * 5, blocks20x10.height / 10 * 1, blocks20x10.width / 20, blocks20x10.height / 10,
                                        x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;
                
                case "=":
                    var indexx = 6, indexy = 1;
                    ctx.drawImage(blocks20x10, blocks20x10.width / 20 * indexx, blocks20x10.height / 10 * indexy, blocks20x10.width / 20, blocks20x10.height / 10,
                                        x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;

                case ">":
                    var indexx = 10, indexy = 1;
                    ctx.drawImage(blocks20x10, blocks20x10.width / 20 * indexx, blocks20x10.height / 10 * indexy, blocks20x10.width / 20, blocks20x10.height / 10,
                                        x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;

                // Dynamic level elements
                // Taxi and guests
                // Diese Elemente mussen an sich dynamisch gezeichnet werden - hier nur für Demozwecke zeichnen
                /* case "1":
                    ctx.drawImage(taxi, 0, 0, taxi.width, taxi.height, x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;
                */
                case "2":
                    ctx.drawImage(guest, 0, 0, guest.width, guest.height, x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;

                case "3":
                    ctx.drawImage(guest2, Math.floor(frame % 2) * guest2.width / 2, 0, guest2.width / 2, guest2.height,
			                             x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;

            }//switch
        }//for x
    }//for y

}