var $r = $('.roulette').fortune({
	prices: 24, 
	duration: 5000,
	direction: -1
});

var clickHandler = function() {
  $('.spinner').off('click');
  $('.spinner span').hide();
  $r.spin().done(function(price) {
      $('.spinner').on('click', clickHandler);
      $('.spinner span').show();
    });
};

$('.spinner').on('click', clickHandler);
