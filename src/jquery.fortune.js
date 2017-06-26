import bezier from 'bezier';

export default () => {
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
      total,
      spin_frame;

  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function directionMultiplier(direction) {
    return direction === 'counterclockwise' ? -1 : 1;
  }

  function spin(timestamp) {
    var delta, x, y;

    if (!start_time) {
      start_time = timestamp;
    }

    delta = timestamp - start_time;

    if (delta < opts.duration) {
      x = delta/opts.duration;
      y = Bezier.cubicBezier(opts.bezier.p1x, opts.bezier.p1y, opts.bezier.p2x, opts.bezier.p2y, x);
      angle = y * stop;
      roulette.rotate(angle, direction);
    } else {
      roulette.forceEnd();
    }

    if (Math.abs(angle) < Math.abs(stop)) {
      spin_frame = requestAnimationFrame(spin);
    } else {
      deferred.resolve($.isArray(opts.prices) ? opts.prices[price] : price);
    }
  }

  function needBounce() {
    var mod = Math.abs((gap * 0.5 + angle) % gap),
        diff = Math.abs(angle - prev_angle),
        low = opts.separator_thickness * 0.5,
        high = gap - low;

    if (diff >= gap * 0.5) {
      return 1;
    } else if (mod < low || mod > high) {
      return 2;
    }

    return 0;
  }

  function matrix3dRotateZ(angle) {
    var matrix = [
          [Math.cos(angle), Math.sin(angle), 0, 0],
          [Math.sin(-angle), Math.cos(angle), 0, 0],
          [0, 0, 1, 0],
          [0, 0, 0, 1]
        ],
        matrix3d = '';

    for (var i = 0; i < matrix.length; i++) {
      matrix3d += (i > 0 ? ',' : '') + matrix[i].join(',');
    }

    return matrix3d;
  }

  $.fn.fortune = function(options) {
    if (!options || !options.prices) {
      throw(new Error("You must define the prices."));
    }

    roulette = this;
    opts = $.extend({}, $.fn.fortune.defaults, options);
    total = $.isArray(options.prices) ? opts.prices.length : options.prices;
    gap = 360 / total;

    this.spin = function(fixed_price, fixed_direction, fixed_stop) {
      var position, rand, spins, direction_multiplier;

      deferred = $.Deferred();
      direction = fixed_direction || opts.direction;
      direction_multiplier = directionMultiplier(direction);

      if (!fixed_stop) {
        price = typeof fixed_price === 'number' ? fixed_price : Math.floor(Math.random() * total);
        rand = randomBetween(opts.separation, gap - opts.separation);
        position = gap * ((direction === 'counterclockwise' ? total - price : price) - 0.5) + rand; // gap * price - gap / 2 + rand
        spins = randomBetween(opts.min_spins, opts.max_spins);
        stop = direction_multiplier * (360 * spins + position);
      } else {
        price = fixed_price;
        stop = direction_multiplier * fixed_stop;
      }

      prev_angle = start_time = 0;

      spin_frame = requestAnimationFrame(spin);

      return deferred.promise();
    };

    this.rotate = function(fixed_angle, fixed_direction) {
      var need_bounce = needBounce();

      direction = fixed_direction;
      direction_multiplier = directionMultiplier(direction);
      angle = fixed_angle;

      $.fn.fortune.rotate.call(this, angle);

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

    this.forceEnd = function() {
      if (spin_frame) {
        cancelAnimationFrame(spin_frame);
      }

      roulette.rotate(stop, direction);
      $.fn.fortune.stopSpinnerBounce.call(this);

      if (deferred) {
        deferred.resolve($.isArray(opts.prices) ? opts.prices[price] : price);
      }
    };

    this.destroy = function() {
      if (roulette) {
        roulette.removeData();
        roulette = null;
      }
    };

    return this;
  };

  $.fn.fortune.rotate = function(angle) {
    var matrix3d = matrix3dRotateZ(angle * Math.PI / 180);
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
      p1x: 0.17,
      p1y: 0.67,
      p2x: 0.12,
      p2y: 0.99
    },
    separator_thickness: 7,
    onSpinBounce: function() {}
  };
};
