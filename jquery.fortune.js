(function($) {
  var deferred,
      angle,
      direction,
      gap,
      is_bouncing,
      opts,
      prev_angle = 0,
      price,
      roulette,
      start_time,
      stop,
      total;

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

    roulette.rotate(angle, direction);

    if (Math.abs(angle) < Math.abs(stop)) {
      requestAnimationFrame(spin);
    } else {
      deferred.resolve($.isArray(opts.prices) ? opts.prices[price] : price);
    }
  };

  function needBounce() {
    var mod = Math.abs((gap * 0.5 + angle) % gap),
        diff = Math.abs(angle - prev_angle),
        low = opts.separator_thickness * 0.5 * Math.PI / 180,
        high = gap - low;

    if (diff >= gap * 0.5) {
      return 1;
    } else if (mod < low || mod > high) {
      return 2;
    }

    return 0;
  };

  function directionMultiplier(direction) {
    return direction === 'counterclockwise' ? -1 : 1;
  };

  function matrix3dRotateZ(angle) {
    var matrix = [
          [Math.cos(angle), Math.sin(angle), 0, 0],
          [Math.sin(-angle), Math.cos(angle), 0, 0],
          [0, 0, 1, 0],
          [0, 0, 0, 1]
        ],
        matrix3d = '';

    for (var i = 0; i < matrix.length; i++) {
      for (var j = 0; j < matrix[i].length; j++) {
        matrix[i][j] = matrix[i][j].toFixed(10);
      }
      matrix3d += (i > 0 ? ',' : '') + matrix[i].join(',');
    }

    return matrix3d;
  };

  $.fn.fortune = function(options) {
    if (!options || !options.prices) {
      throw(new Error("You must define the prices."));
    }

    roulette = this;
    opts = $.extend({}, $.fn.fortune.defaults, options);
    total = $.isArray(options.prices) ? opts.prices.length : options.prices;
    gap = Math.PI * 2 / total;

    this.spin = function(fixed_price, fixed_direction) {
      var position, rand, spins, direction_multiplier;

      deferred = $.Deferred();
      price = typeof fixed_price === 'number' ? fixed_price : Math.floor(Math.random() * total);
      direction = fixed_direction || opts.direction;
      direction_multiplier = directionMultiplier(direction);

      rand = randomBetween(opts.separation, gap - opts.separation)
      position = gap * ((direction === 'counterclockwise' ? total - price : price) - 0.5) + rand; // gap * price - gap / 2 + rand
      spins = randomBetween(opts.min_spins, opts.max_spins);
      stop = direction_multiplier * (Math.PI * 2 * spins + position);
      prev_angle = start_time = 0;

      requestAnimationFrame(spin);

      return deferred.promise();
    };

    this.rotate = function(fixed_angle, fixed_direction) {
      var need_bounce = needBounce();

      $.fn.fortune.rotate.call(this, angle);

      direction = fixed_direction;
      direction_multiplier = directionMultiplier(direction);
      angle = fixed_angle;

      if (need_bounce) {
        if (need_bounce === 1 || !is_bouncing) {
          opts.onSpinBounce(this);
        }
        $.fn.fortune.spinnerBounce.call(this, direction_multiplier);
        is_bouncing = true;
      } else {
        $.fn.fortune.stopSpinnerBounce.call(this);
        is_bouncing = false;
      }

      prev_angle = angle;
    };

    return this;
  };

  $.fn.fortune.rotate = function(angle) {
    var matrix3d = matrix3dRotateZ(angle);
    $('.' + opts.wheel_classname, this).css({
      transform: 'matrix3d(' + matrix3d + ')',
      '-webkit-transform': 'matrix3d(' + matrix3d + ')'
    });
  };

  $.fn.fortune.spinnerBounce = function(direction_multiplier) {
    var matrix3d = matrix3dRotateZ(5 * direction_multiplier * Math.PI / 180);
    $('.' + opts.spinner_classname, this).css({
      transform: 'matrix3d(' + matrix3d + ')',
      '-webkit-transform': 'matrix3d(' + matrix3d + ')'
    });
  };

  $.fn.fortune.stopSpinnerBounce = function() {
    var matrix3d = matrix3dRotateZ(0);
    $('.' + opts.spinner_classname, this).css({
      transform: 'matrix3d(' + matrix3d + ')',
      '-webkit-transform': 'matrix3d(' + matrix3d + ')'
    });
  };

  $.fn.fortune.defaults = {
    duration: 1000,
    separation: 5,
    min_spins: 10,
    max_spins: 15,
    direction: 'clockwise',
    wheel_classname: 'wheel',
    spinner_classname: 'spinner',
    bezier: {
      p1x: .17,
      p1y: .67,
      p2x: .12,
      p2y: .99
    },
    separator_thickness: 7,
    onSpinBounce: function() {}
  };
}(jQuery));