'use strict';

/*
 * Get the coordinates of a mouse event relative to a canvas element
 *
 * http://stackoverflow.com/questions/10449890/detect-mouse-click-location-within-canvas
 */
function getMouse(e, canvas) {
  var element = canvas, offsetX = 0, offsetY = 0, mx, my;

  // Compute the total offset. It's possible to cache this if you want
  if (element.offsetParent !== undefined) {
    do {
      offsetX += element.offsetLeft;
      offsetY += element.offsetTop;
    } while ((element = element.offsetParent));
  }

  // Add padding and border style widths to offset
  // Also add the <html> offsets in case there's a position:fixed bar (like the stumbleupon bar)
  // This part is not strictly necessary, it depends on your styling
  // offsetX += stylePaddingLeft + styleBorderLeft + htmlLeft;
  // offsetY += stylePaddingTop + styleBorderTop + htmlTop;

  mx = e.pageX - offsetX;
  my = e.pageY - offsetY;

  // We return a simple javascript object with x and y defined
  return {x: mx, y: my};
}

angular.module('game').directive('dtDrawing', ['Socket',
  function (Socket) {
    return {
      restrict: "A",
      link: function (scope, element) {
        var body = angular.element(document.body);
        scope.canvas = element;
        element.ctx = element[0].getContext('2d');

        // variable that decides if something should be drawn on mousemove
        element.drawing = false;
        
        body.bind('mousedown', function (e) {
          var mouse = getMouse(e, element[0]);

          element.lastX = mouse.x;
          element.lastY = mouse.y;

          // begins new line
          element.ctx.beginPath();

          element.drawing = true;

          // Update mouse state
          scope.mouseState |= (1 << (e.which - 1));
        });

        body.bind('mousemove', function (e) {
          // If the left mouse button is down
          if (scope.mouseState & 1) {
            element.drawSegment(e);
          }
        });

        body.bind('mouseup', function (e) {
          // Update mouse state
          scope.mouseState &= ~(1 << (e.which - 1));

          // Finish drawing the current line if left mouse button was released
          if (!(scope.mouseState & 1)) {
            element.drawSegment(e);
          }
        });

        /*
         * Given a mouse event, update the last and cur values attached to
         * this element and perform the draw (as well as notifying the server)
         */
        element.drawSegment = function(e) {
          if (!scope.isDrawer()) {
            return;
          }

          var mouse = getMouse(e, element[0]);
          element.curX = mouse.x;
          element.curY = mouse.y;

          var message = {
            type: 'line',
            x1: element.lastX,
            y1: element.lastY,
            x2: element.curX,
            y2: element.curY,
            fill: undefined,
            stroke: scope.penColour
          };
          element.draw(message);
          Socket.emit('canvasMessage', message);

          // set current coordinates to last one
          element.lastX = element.curX;
          element.lastY = element.curY;
        };

        element.draw = function (message) {
          switch(message.type) {
            case 'line':
              element.ctx.beginPath();
              // line from
              element.ctx.moveTo(message.x1, message.y1);
              // to
              element.ctx.lineTo(message.x2, message.y2);
              // color
              element.ctx.strokeStyle = message.stroke;
              // draw it
              element.ctx.stroke();
              break;
            case 'rect':
              element.ctx.fillStyle = message.fill;
              element.ctx.strokeStyle = message.stroke;
              element.ctx.fillRect(message.x, message.y, message.width, message.height);
              break;
            case 'clear':
              element.ctx.clearRect(0, 0, element[0].width, element[0].height);
              break;
            default:
              console.log('Draw message type unknown: ' + message.type);
          }
        };
      }
    };
  }
]);
