var $r = $('.roulette').fortune({
  prices: 24, 
  duration: 5000,
  direction: -1
});

var clickHandler = function() {
  $('.spinner').off('click');
  $('.spinner span').hide();
  $r.spin().done(function(price) {
  	  $('.price').text(price);
      $('.spinner').on('click', clickHandler);
      $('.spinner span').show();
    });
};

var turnLeft = function() {
  $('.turn-left').off('click');
  $('.spinner span').hide();
  $r.spin(11, -1).done(function(price) {
      $('.price').text(price);
      $('.turn-left').on('click', turnLeft);
      $('.spinner span').show();
    });
};

var turnRight = function() {
  $('.turn-left').off('click');
  $('.spinner span').hide();
  $r.spin(11, 1).done(function(price) {
      $('.price').text(price);
      $('.turn-left').on('click', turnRight);
      $('.spinner span').show();
    });
};

$('.spinner').on('click', clickHandler);
$('.turn-left').on('click', turnLeft);
$('.turn-right').on('click', turnRight);