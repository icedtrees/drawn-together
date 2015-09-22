'use strict';

angular.module('game').directive("dtDrawing", ['Socket',
  function (Socket) {
    return {
      restrict: "A",
      link: function (scope, element) {
        scope.canvas = element;
        element.ctx = element[0].getContext('2d');

        // variable that decides if something should be drawn on mousemove
        element.drawing = false;
        
        element.bind('mousedown', function (event) {
          if (event.offsetX !== undefined) {
            element.lastX = event.offsetX;
            element.lastY = event.offsetY;
          } else { // Firefox compatibility
            element.lastX = event.layerX - event.currentTarget.offsetLeft;
            element.lastY = event.layerY - event.currentTarget.offsetTop;
          }

          // begins new line
          element.ctx.beginPath();

          element.drawing = true;

        });
        element.bind('mousemove', function (event) {
          if (element.drawing) {
            // get current mouse position
            if (event.offsetX !== undefined) {
              element.currentX = event.offsetX;
              element.currentY = event.offsetY;
            } else {
              element.currentX = event.layerX - event.currentTarget.offsetLeft;
              element.currentY = event.layerY - event.currentTarget.offsetTop;
            }

            element.draw(element.lastX, element.lastY, element.currentX, element.currentY);

            var message = {
              lastX: element.lastX,
              lastY: element.lastY,
              currentX: element.currentX,
              currentY: element.currentY,
              text: element.currentX
            };

            Socket.emit('canvasMessage', message);

            // set current coordinates to last one
            element.lastX = element.currentX;
            element.lastY = element.currentY;

          }

        });
        element.bind('mouseup', function (event) {
          // stop element.drawing
          element.drawing = false;
        });

        element.draw = function (lX, lY, cX, cY) {
          // line from
          element.ctx.moveTo(lX, lY);
          // to
          element.ctx.lineTo(cX, cY);
          // color
          element.ctx.strokeStyle = "#4bf";
          // draw it
          element.ctx.stroke();
        };

        element.clear = function () {
          element.ctx.clearRect(0, 0, element.width, element.height);
        };
      }
    };
  }
]);
