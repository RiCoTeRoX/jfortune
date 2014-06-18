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
      separator_thickness: 5
    },
    $r = $('.roulette').fortune(options),
    wheel_center = {
      x: $r.offset().left + $r.outerWidth()/2,
      y: $r.offset().top + $r.outerHeight()/2
    },
    bounce_timeout,
    start_drag_position = {},
    start_drag_angle = 0,
    prev_drag_angle = 0,
    drag_angle = 0,
    hammertime = Hammer($r[0], { preventDefault: true })
      .on('dragstart', onDragstartWheel)
      .on('drag', onDragWheel)
      .on('dragend', onDragendWheel)
      .on('swipe', onSwipeWheel);

$('.spinner').on('click', onSpinWheel);

function onSpinWheel(evt, direction) {
  $('.spinner').off('click');
  $('.spinner span').hide();
  hammertime
    .off('dragstart', onDragstartWheel)
    .off('drag', onDragWheel)
    .off('dragend', onDragendWheel)
    .off('swipe', onSwipeWheel);

  $r.spin(3, direction).done(function(price) {
      $('.price').text('You have: ' + price.name);
      $('.spinner').on('click', onSpinWheel);
      $('.spinner span').show();
      hammertime
        .on('dragstart', onDragstartWheel)
        .on('drag', onDragWheel)
        .on('dragend', onDragendWheel)
        .on('swipe', onSwipeWheel);
    });
}

function onDragstartWheel(evt) {
  start_drag_position = {
    x: evt.gesture.center.pageX - wheel_center.x,
    y: evt.gesture.center.pageY - wheel_center.y
  };
}

function onDragWheel(evt) {
  var vec = {
        x: evt.gesture.center.pageX - wheel_center.x,
        y: evt.gesture.center.pageY - wheel_center.y
      },
      angle = getAngleBetween(vec.y, vec.x, start_drag_position.y, start_drag_position.x) * 180 / Math.PI,
      direction;
  
  prev_drag_angle = drag_angle;
  drag_angle = start_drag_angle + angle;
  direction = drag_angle - prev_drag_angle < 0 ? 'counterclockwise' : 'clockwise';
  $r.rotate(drag_angle, direction);
}

function onDragendWheel() {
  start_drag_angle = drag_angle;
}

function onSwipeWheel(evt) {
  var direction = drag_angle - prev_drag_angle < 0 ? 'counterclockwise' : 'clockwise';
  onSpinWheel(evt, direction);
}

function getAngleBetween(y1, x1, y0, x0) {
  var angle_radians = Math.atan2(y1, x1) - Math.atan2(y0, x0);

  return angle_radians < 0 ? 2 * Math.PI + angle_radians : angle_radians;
}