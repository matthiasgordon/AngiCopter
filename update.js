function update() {
		if(keydown.up) {
			taxi.vy += 6;
			taxi.collisionBottom = false;
		}
		if(keydown.down && taxi.collisionBottom == false) {
			taxi.vy -= 6;
		}
		if (keydown.left) {
	    	taxi.vx -= 3;
	  	}
	  	if (keydown.right) {
	    	taxi.vx += 3;
	  	}
	  	if(keydown.space) {
	  		// Zeit die Kufen auszufahren!!!

            console.log(platformCollector.length);
	  	}
	  	
	  	// Simulating gravity
	  	if(taxi.collisionBottom == false) {
	  		taxi.vy -= 3;	
	  	}
        //Update of X/Y - coordinate of taxi
	  	taxi.x += taxi.vx/200;
	  	taxi.y -= taxi.vy / 200;
    //                                                                     lu = left-up                     ru = right-up
    //Update of taxi corner position:                                       //---------------+---------------
        taxi.ru.x = taxi.x + blockSizeX; taxi.ru.y = taxi.y;                //         ___ /^^[___              
        taxi.rd.x = taxi.x + blockSizeX; taxi.rd.y = taxi.y + blockSizeY;   //        /|^+----+   |#___________//
        taxi.lu.x = taxi.x; taxi.lu.y = taxi.y;                             //      ( -+ |____|   _______-----+/
        taxi.ld.x = taxi.x; taxi.ld.y = taxi.y + blockSizeY;                //       ==_________--'            \
                                                                            //          ~_|___|__
    // After updating the position check if the is a collision             ld = left-down                   rd = right-down
	  	checkObjects();
        deprecatedCheckCollision();
	}

    function checkObjects() {
        for (var i = 0; i < platformCollector.length; i++) {

            /*Prüfung Landung*/
            if (checkCollision(platformCollector[i].xStart, platformCollector[i].xEnd,
                               platformCollector[i].yStart, platformCollector[i].yEnd,
                               taxi.ld.x, taxi.ld.y)
                //taxi.x, taxi.y + blockSizeY)
                               &&
                checkCollision(platformCollector[i].xStart, platformCollector[i].xEnd,
                               platformCollector[i].yStart, platformCollector[i].yEnd,
                               taxi.rd.x, taxi.rd.y)){              
                //taxi.x + blockSizeX, taxi.y + blockSizeY)) {

                gameLost = true;
                taxi.collisionBottom = true;
                taxi.vy = 0;
                taxi.y = platformCollector[i].yStart - blockSizeY;
            }
            else{
                if (checkTaxiCollision(platformCollector[i].xStart, platformCollector[i].xEnd,
                                   platformCollector[i].yStart, platformCollector[i].yEnd)) {
                    taxi.x = w / 2 - 10;
                    taxi.y = h - 20;
                    taxi.vy = 0;
                    taxi.vx = 0;
                }
            }
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

    function checkCollision(xStart, xEnd, yStart, yEnd, xTaxi, yTaxi) {
        if ((yTaxi > yStart && yTaxi < yEnd) && (xTaxi > xStart && xTaxi < xEnd)) {
            return true;
        }
        else {
            return false;
        }
    }

    // Check if there is a collision
	function deprecatedCheckCollision() {
		if(taxi.y > h-taxi.height) {

			if(taxi.vy < -70) {
				gameLost = true;
			}

			taxi.vy = 0;
			taxi.collisionBottom = true;
			taxi.y = h-taxi.height;

		}
		
		    /*else if ((((taxi.y - blockSizeY) > platformCollector[i].yStart && (taxi.y - blockSizeY) < platformCollector[i].yEnd) &&
                (taxi.x > platformCollector[i].xStart && taxi.x < platformCollector[i].xEnd)) ||
                (((taxi.y - blockSizeY) > platformCollector[i].yStart && (taxi.y - blockSizeY) < platformCollector[i].yEnd) &&
                ((taxi.x - blockSizeX) > platformCollector[i].xStart && (taxi.x - blockSizeX) < platformCollector[i].xEnd)) ||
                ((taxi.y > platformCollector[i].yStart && taxi.y < platformCollector[i].yEnd) &&
                (taxi.x > platformCollector[i].xStart && taxi.x < platformCollector[i].xEnd)) ||
                ((taxi.y > platformCollector[i].yStart && taxi.y < platformCollector[i].yEnd) &&
                ((taxi.x - blockSizeX) > platformCollector[i].xStart && (taxi.x - blockSizeX) < platformCollector[i].xEnd))) {
		        gameLost = true;
		        collisionText = "tot";
		        death();
		    }*/
		//}

	}

	function death() {
        taxi.x = w/2-10;
        taxi.y = h - 20;
        taxi.vy = 0;
        taxi.vx= 0;
	}