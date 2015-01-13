(function ($) {
  $.fn.timeLine = function (options) {
    var opts = $.extend({}, $.fn.timeLine.defaults, options);
    return this.each(function () {
      var $container = $(this);
      if (!$container.data('timeline-enabled')) {
        $container.data('timeline-enabled', true);
        initialize();
      }

      function initialize() {
        var event = mouseEnterEvent();
        $container.on(event + '.timeLine', function () {
          prepareTimeLine();
          $container.off(event + '.timeLine');
        });
      }

      function prepareTimeLine() {
        if ($container.data() && $container.data().src) {
          var $preloader = $container.find('.' + opts.preloader).show();
          $container.children('a').wrap(createWrapper(opts.thumbnail));
          var $markup = prepareMarkup();
          $markup.find('img').load(function () {
            $preloader.hide();
            setupEventHandlers();
            $container.mousemove();
          });
          $container.append($markup);
        }
      }

      function createWrapper(klass, overrideCss) {
        overrideCss = overrideCss || {};
        return $('<div></div>')
          .addClass(klass)
          .css({
            width: '100%',
            height: '100%'
          })
          .css(overrideCss);
      }

      function prepareMarkup() {
        var height = $container.children('.' + opts.thumbnail).height();
        return createWrapper(opts.timeline, {display: 'none', height: height})
          .append(linkMarkup())
          .append(lineMarkup());
      }

      function linkMarkup() {
        var href = $container.find('a').attr('href') || '';
        return $('<a></a>')
          .attr('href', href)
          .css({
            display: 'block',
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden'
          })
          .append(imageMarkup());
      }

      function imageMarkup() {
        var src = $container.data('src') || '';
        return $('<img>')
          .attr('src', src)
          .css({
            display: 'inline',
            position: 'absolute',
            top: 0
          });
      }

      function lineMarkup() {
        return $('<div></div>')
          .css(opts.line.css)
          .css({
            width: '100%',
            position: 'absolute'
          });
      }

      function setupEventHandlers() {
        var $timeline = $container.find('.' + opts.timeline);
        var $thumbnail = $container.find('.' + opts.thumbnail);
        $container.on(mouseEnterEvent(), function () {
          $timeline.show();
          $thumbnail.hide();
        });
        $container.on(mouseMoveEvent(), function (event) {
          if ($timeline.css('display') === 'none') {
            $timeline.show();
            $thumbnail.hide();
          }
          showFrame($timeline, event);
        });
        $container.on(mouseLeaveEvent(), function () {
          $timeline.hide();
          $thumbnail.show();
        });
        $(window).resize(function () {
          $timeline.height($thumbnail.height());
        });
      }

      function showFrame($timeLine, event) {
        var frames = $container.data('frames');
        var frameNumber = getFrameNumber($timeLine, event.pageX, frames.length);
        var frameHeight = $timeLine.find('img').height() / frames.length;
        var top = -(frameNumber * frameHeight);
        $timeLine.find('img').css('top', top);
        renderFramePosition($timeLine, frameNumber, frames.length);
        renderFrameTime($timeLine, frameNumber, frames);
      }

      function getFrameNumber($timeLineContainer, absoluteX, framesCount) {
        var relativeX = absoluteX - $timeLineContainer.offset().left;
        if (relativeX < 0) return 0;
        if (relativeX >= $timeLineContainer.width()) return framesCount - 1;
        var frameWidth = $timeLineContainer.width() / framesCount;
        for (var i = 0; i < framesCount; i++) {
          if (relativeX >= i * frameWidth && relativeX <= (i + 1) * frameWidth) {
            return i;
          }
        }
        return 0;
      }

      function renderFramePosition($timeLine, frameNumber, framesCount) {
        var width = $timeLine.width() / framesCount;
        var left = width * frameNumber;
        var $framePosition = $container.find('.' + opts.frame.klass);
        if ($framePosition.length) {
          $framePosition.css({width: width, left: left});
        } else {
          $timeLine.append(framePositionMarkup(width, left));
        }
      }

      function framePositionMarkup(width, left) {
        return $('<div></div>')
          .addClass(opts.frame.klass)
          .css(opts.frame.css)
          .css({
            width: width,
            position: 'absolute',
            left: left
          });
      }

      function renderFrameTime($timeLine, frameNumber, frames) {
        var time = formatTime(frames[frameNumber]);
        var left = getTimeLeftOffset($timeLine, frameNumber, frames.length);
        var $frameTime = $timeLine.find('.' + opts.time.klass);
        if ($frameTime.length) {
          $frameTime.css('left', left).text(time);
        } else {
          $timeLine.append(frameTimeMarkup(left, time));
        }
      }

      function getTimeLeftOffset($timeLine, frameNumber, framesCount) {
        var frameWidth = $timeLine.width() / framesCount;
        var labelWidth = parseInt(opts.time.css.width, 10);
        var left = frameWidth * frameNumber + frameWidth / 2 - labelWidth / 2;
        if (left < 0) {
          return 0;
        } else if (left + labelWidth > $timeLine.width()) {
          return $timeLine.width() - labelWidth;
        } else {
          return left;
        }
      }

      function formatTime(time) {
        var hours = Math.floor(time / 3600);
        var minutes = Math.floor((time - 3600 * hours) / 60);
        var seconds = Math.floor(time - 3600 * hours - 60 * minutes);
        seconds = seconds >= 10 ? seconds : "0" + seconds;
        minutes = minutes >= 10 ? minutes : "0" + minutes;
        return (hours ? hours + ":" : "") + minutes + ":" + seconds;
      }

      function frameTimeMarkup(left, text) {
        return $('<div></div>')
          .addClass(opts.time.klass)
          .css(opts.time.css)
          .css({
            position: 'absolute',
            left: left
          })
          .text(text);
      }
    });
  };

  $.fn.timeLine.defaults = {
    preloader: 'preloader',
    thumbnail: 'thumbnail-wrapper',
    timeline: 'timeline-wrapper',
    line: {
      css: {
        height: '3px',
        bottom: '3px',
        'background-color': '#931C26'
      }
    },
    frame: {
      klass: 'frame-position',
      css: {
        height: '3px',
        bottom: '3px',
        'background-color': '#FFDB00'
      }
    },
    time: {
      klass: 'frame-time',
      css: {
        width: '37px',
        height: '16px',
        bottom: '8px',
        border: '1px solid #931C26',
        'border-radius': '2px',
        color: '#FFF',
        'background-color': '#000',
        'font-size': '9px',
        'font-weight': 'bold',
        'text-align': 'center'
      }
    }
  };

  function mouseEnterEvent() {
    if ($.vmouse && $.browser && $.browser.mobile) {
      return 'vmousedown';
    } else {
      return 'mouseenter';
    }
  }

  function mouseMoveEvent() {
    if ($.vmouse && $.browser && $.browser.mobile) {
      return 'vmousemove';
    } else {
      return 'mousemove';
    }
  }

  function mouseLeaveEvent() {
    if ($.vmouse && $.browser && $.browser.mobile) {
      return 'vmouseup';
    } else {
      return 'mouseleave';
    }
  }
})(jQuery);
