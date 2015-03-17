function mainMenu() {
    $('#main').show();

    $('.play').click(function() {
        $('#main').hide();
        init();
        beginGameLoop();
    });
}

function gameOverMenu() {
	$('#game-over').show();

	$('.restart').click(function() {
  		$('#game-over').hide();
        gameLost = false;
        init();
	});
}

function gamePausedMenu() {
    $('#game-paused').show();

    $('.continue').click(function() {
        $('#game-paused').hide();
        gamePaused = false;
    });
}