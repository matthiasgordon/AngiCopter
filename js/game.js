var canvas;
var ctx;

//Image variables
var taxiImage , brokenTaxiImage, guestImage, guestImageBack, edge, background, platform_mid, platform_left, platform_right, powerUpSnowden, powerUpBlitz, lifeImage,
    droneImage, googleCarImage, transmitterImage, transmitterRadioImage, satelliteImage;

function init(){
    //Canvas start
    canvas = $("#canvas")[0];
	ctx = canvas.getContext("2d");
	
	//collector initialisation
	platforms = new Array();
	obstacles = new Array();
	exits = new Array();
	staticSatellites = new Array();
	powerUps = new Array();
    googleCars = new Array();
    drones = new Array();
    transmitters = new Array();
	guests = new Array();
	frames = new Array();
	if(game == undefined){
		initGame();
		menu.showMainMenu();
	}
    initObjects();
	menu.initButtons();
}

// Function to preload all images
function preloadAssets() {
    var _toPreload = 0;

    var addImage = function (src) {

        var img = new Image();
        img.src = src;
        _toPreload++;

        img.addEventListener('load', function () { _toPreload--;}, false);
        return img;
    }

    taxiImage = addImage("assets/sprite_sheet_heli.png");
    brokenTaxiImage = addImage("assets/heli_absturz.png");
    guestImage = addImage("assets/merkel_spritesheet.png");
    guestImageBack = addImage("assets/merkel_spritesheet_back.png");
    edge = addImage("assets/rand_spritesheet.png");
    background = addImage("assets/background.png");
    lifeImage = addImage("assets/merkel_leben.png");
	platform_mid = addImage("assets/plattform_mitte.png");
    platform_left = addImage("assets/plattform_links.png");
    platform_right = addImage("assets/plattform_rechts.png");
    platform_blink_spritesheet = addImage("assets/spritesheet_platform_blink.png");
    droneImage = addImage("assets/amazon_drone.png");
    googleCarImage = addImage("assets/google_car.png");
    transmitterImage = addImage("assets/sendemast.png");
    transmitterRadioImage = addImage("assets/strahlung_final.png");
	powerUpSnowden = addImage("assets/power_up_snowden.png");
	powerUpBlitz = addImage("assets/power_up_blitz.png");
    satelliteImage = addImage("assets/antenne_spritesheet.png");

    var checkResources = function () {
        // If everthing is preloaded go on and load the level
        if (_toPreload == 0)
            loadLevel("level1.txt");
        //If not check if they are loaded in 0,2 secounds again
        else
            setTimeout(checkResources, 200);
    }

    checkResources();
}

// Load the level description file and begin the game loop to draw the level
function loadLevel(levelName) {
    var xmlhttp  = new XMLHttpRequest(); // code for IE7+, Firefox, Chrome, Opera, Safari
        
    xmlhttp.onreadystatechange = function () {
        //When the leveldescription is loaded start the init function
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            levelDataRaw = xmlhttp.responseText;
            init();
        }
    }

    // Load level description from the folder "levels" with the name in the variable levelName
    xmlhttp.open("GET", "levels/"+levelName, true);
    xmlhttp.send();
}

// Run the preloadAssets fuction when the document is loaded
document.addEventListener("DOMContentLoaded", preloadAssets, false);
