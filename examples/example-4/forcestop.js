$(document).bind('touchmove', false);

var options = {
      prices: [{
        name: 'Candance'
      }, {
        name: 'Pherb'
      }, {
        name: 'Perry'
      }, {
        name: 'Isabella'
      }, {
        name: 'Tree'
      }, {
        name: 'Mom'
      }, {
        name: 'Dad'
      }, {
        name: 'Friends'
      }],
      duration: 5000,
      spinner_classname: 'spinner',
      separation: 10,
      separator_thickness: 10
    },
    $r = $('.roulette').fortune(options);

$('.spinner').on('click', onSpinWheel);
$('.force-stop').on('click', onForceEnd);

function onSpinWheel(evt, direction) {
  $('.spinner').off('click');
  $('.spinner span').hide();

  $r.spin()
    .done(function(price) {
      $('.price').text('You have: ' + price.name);
      $('.spinner').on('click', onSpinWheel);
      $('.spinner span').show();
    });
}

function onForceEnd() {
  $r.forceEnd();
}