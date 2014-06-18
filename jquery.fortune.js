(function($) {
  var deferred,
      angle,
      direction,
      gap,
      is_bouncing,
      opts,
      prev_angle = 0,
      price,
      start_time,
      stop,
      total,
      wheel;

  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  function directionMultiplier(direction) {
    return direction === 'counterclockwise' ? -1 : 1;
  };

  function spin(timestamp) {
    var x, y;

    if (!start_time) {
      start_time = timestamp;
    }

    x = (timestamp - start_time)/opts.duration;
    y = Bezier.cubicBezier(opts.bezier.p1x, opts.bezier.p1y, opts.bezier.p2x, opts.bezier.p2y, x);
    angle = y * stop;

    wheel.rotate(angle, direction);

    if (Math.abs(angle) < Math.abs(stop)) {
      requestAnimationFrame(spin);
    } else {
      deferred.resolve($.isArray(opts.prices) ? opts.prices[price] : price);
    }
  };

  function needBounce() {
    var mod = Math.abs(Math.round((gap * 0.5 + angle) % gap)),
        diff = Math.abs(angle - prev_angle),
        low = opts.separator_thickness * 0.5,
        high = gap - low;

    return mod < low || mod > high || diff > gap * 0.5;
  };

  function directionMultiplier(direction) {
    return direction === 'counterclockwise' ? -1 : 1;
  };

  $.fn.fortune = function(options) {
    if (!options || !options.prices) {
      throw(new Error("You must define the prices."));
    }

    wheel = this;
    opts = $.extend({}, $.fn.fortune.defaults, options);
    total = $.isArray(options.prices) ? opts.prices.length : options.prices;
    gap = 360 / total;

    this.spin = function(fixed_price, fixed_direction) {
      var position, rand, spins, direction_multiplier;

      deferred = $.Deferred();
      price = fixed_price || Math.floor(Math.random() * total);
      direction = fixed_direction || opts.direction;
      direction_multiplier = directionMultiplier(direction);

      rand = randomBetween(opts.separation, gap - opts.separation)
      position = gap * ((direction === 'counterclockwise' ? total - price : price) - 0.5) + rand; // gap * price - gap / 2 + rand
      spins = randomBetween(opts.min_spins, opts.max_spins);
      stop = direction_multiplier * (360 * spins + position);
      prev_angle = start_time = 0;

      requestAnimationFrame(spin);

      return deferred.promise();
    };

    this.rotate = function(fixed_angle, fixed_direction) {
      $.fn.fortune.rotate(angle);

      direction = fixed_direction;
      direction_multiplier = directionMultiplier(direction);
      angle = fixed_angle;

      if (needBounce()) {
        if (!is_bouncing) {
          $.fn.fortune.spinnerBounce(direction_multiplier);
          opts.onSpinBounce(this);
          is_bouncing = true;
        }
      } else {
        $.fn.fortune.stopSpinnerBounce();
        is_bouncing = false;
      }

      prev_angle = angle;
    };

    return this;
  };

  $.fn.fortune.rotate = function(angle) {
    wheel.css({
      transform: 'rotate(' + angle + 'deg)',
      '-webkit-transform': 'rotate(' + angle + 'deg)'
    });
  };

  $.fn.fortune.spinnerBounce = function(direction_multiplier) {
    wheel.siblings('.' + opts.spinner_classname).css({
      transform: 'rotate(' + 5 * direction_multiplier + 'deg)',
      '-webkit-transform': 'rotate(' + 5 * direction_multiplier + 'deg)'
    });
  };

  $.fn.fortune.stopSpinnerBounce = function() {
    wheel.siblings('.' + opts.spinner_classname).css({
      transform: 'rotate(0)',
      '-webkit-transform': 'rotate(0)'
    });
  };

  $.fn.fortune.defaults = {
    duration: 1000,
    separation: 2,
    min_spins: 10,
    max_spins: 15,
    direction: 'clockwise',
    spinner_classname: 'spinner',
    bezier: {
      p1x: .17,
      p1y: .67,
      p2x: .12,
      p2y: .99
    },
    separator_thickness: 3,
    onSpinBounce: function() {}
  };
}(jQuery));