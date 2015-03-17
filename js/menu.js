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

function gameWonMenu() {
    $('#game-won').show();

    $('.restart').click(function() {
        $('#game-won').hide();
        init();
    });
}