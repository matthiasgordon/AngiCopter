function mainMenu() {
    $('#main').show();
    console.log("Klappt!");

    $('.play').click(function() {
        console.log("Klappt auch!");
        $('#main').hide();
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