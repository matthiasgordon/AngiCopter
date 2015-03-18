function update() {

	  	//console.log("update!");
	  	// Simulating gravity
	  	taxi.update();

		if(keydown.esc) {
			gamePaused = true;
			gamePausedMenu();
		}
		
		//Check: gewonnen?
		if(taxi.y < -50){
			document.getElementById("target").innerHTML = "Gewonnen!";
			gameOver = true;
			gameWonMenu();
		}
		
	  	checkObjects();
	}

    function checkObjects() {
        //Platfrom loop
        for (var i = 0; i < platforms.length; i++) {
			// Check collision platform, taxi
            if(taxi.currPlatform == 0){
                if (checkTaxiCollision(platforms[i].xStart, platforms[i].xEnd,
                                   platforms[i].yStart, platforms[i].yEnd)) {
                    death();
                }
            }
        }

        //Obstacle loop
        for (var i = 0; i < obstacles.length; i++) {
			// check collision taxi obstacles
			switch(obstacles[i].type) {
				case "frame":
					if (checkTaxiCollision(obstacles[i].xStart, obstacles[i].xEnd,
										obstacles[i].yStart, obstacles[i].yEnd)) {
						death();
					}
					break;
				
				case "static_obstacle":
					if (checkTaxiCollision(obstacles[i].xStart, obstacles[i].xEnd,
										obstacles[i].yStart, obstacles[i].yEnd)) {
						death();
					}
					break;
					
				case "platform_edge":
					if (checkTaxiCollision(obstacles[i].xStart, obstacles[i].xEnd,
										obstacles[i].yStart, obstacles[i].yEnd)) {
						death();
					}
					break;
			}
        }
		
		//Guests loops
		taxi.passengers = 0;
		for (i = 0; i < guests[roundNumber-1].length; i++){
			
			if(roundNumber != 3){
				targetPlatform = guests[roundNumber][0].currPlatform;
			}else{
				targetPlatform = 11; //Muss noch verbessert werden!
			}
			
			if(guests[roundNumber-1][i].currPlatform == taxi.currPlatform){
				guests[roundNumber-1][i].enterTaxi(taxi.x);
			}
			
			if (checkTaxiCollision(guests[roundNumber-1][i].x, guests[roundNumber-1][i].x + blockSizeX,
									guests[roundNumber-1][i].y, guests[roundNumber-1][i].y + blockSizeY)) {
				if(taxi.vy == 0){
					guests[roundNumber-1][i].state = "onTaxi";
				}
				else if(guests[roundNumber-1][i].state == "free"){
					death();
				}
			}
			
			//update taxi attributes
			if(guests[roundNumber-1][i].state == "onTaxi")		//Idee kann man bestimmt schöner programmieren
				taxi.passengers++;
			if(taxi.passengers == guests[roundNumber-1].length){
				taxi.state = "full";
			}else{
				taxi.state = "free";
			}
		}
		
		if(taxi.currPlatform != 0){
			//guests delivered
			if(taxi.state == "full" && taxi.currPlatform == targetPlatform){
				console.log("Gaeste abgeliefert!");
				roundNumber++;
			}
			
			taxi.collisionBottom = true;
			taxi.vy = 0;
			taxi.y = platforms[taxi.currPlatform-1].yStart - blockSizeY;
		}
		
    }
	
	function checkOnPlatform (platXstart, platXend, platYstart, platYend, objXstart, objXend, objYstart, objYend){// 
		if(checkCollision(platXstart, platXend, platYstart, platYend, objXstart, objYstart)
                               &&
           checkCollision(platXstart, platXend, platYstart, platYend, objXend, objYend)){
			return true;					   
		} else{
			return false;
		}
	}

    function checkTaxiCollision(obstXstart, obstXend, obstYstart, obstYend) {
        if (checkCollision(obstXstart, obstXend, obstYstart, obstYend, taxi.lu.x, taxi.lu.y)||
            checkCollision(obstXstart, obstXend, obstYstart, obstYend, taxi.ld.x, taxi.ld.y)||
            checkCollision(obstXstart, obstXend, obstYstart, obstYend, taxi.ru.x, taxi.ru.y)||
            checkCollision(obstXstart, obstXend, obstYstart, obstYend, taxi.rd.x, taxi.rd.y)) {
            return true;
        }
        else {
            return false;
        }
    }

    function checkCollision(xStart, xEnd, yStart, yEnd, xObj, yObj) {
        if ((yObj >= yStart && yObj <= yEnd) && (xObj >= xStart && xObj <= xEnd)) {
            return true;
        }
        else {
            return false;
        }
    }

	function death() {
		taxi.draw = "broken";
		frame = 0;
		gameOver = true;

		/*
		var endFrame = 0;
		var endFrameLimit = 48;
		while(endFrame < endFrameLimit) {
			setTimeout(function() {
				taxi.drawBroken(endFrame);
			}, 500);
			endFrame++;
		}

		*/
		
		//gameOverMenu();
	}