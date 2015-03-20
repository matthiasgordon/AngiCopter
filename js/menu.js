function mainMenu() {
    $('#main').show();

    $('.play').click(function() {
        $('#main').hide();
        game.state = "running";
		console.log(game.state);
        game.beginGameLoop();
    });
}

function gameOverMenu() {
	$('#game-over').show();

	$('.restart').click(function() {
  		$('#game-over').hide();
		game.state = "running";
        game.reset();
	});
}

function gamePausedMenu() {
    $('#game-paused').show();

    $('.continue').click(function() {
        $('#game-paused').hide();
        game.state = "running";
		//gamePaused = false;
    });
}

function gameWonMenu() {
    $('#game-won').show();

    $('.restart').click(function() {
        $('#game-won').hide();
		game.state = "running";
        game.reset();
    });
}