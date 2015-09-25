'use strict';

angular.module('game').directive('dtDrawing', ['Socket',
  function (Socket) {
    return {
      restrict: "A",
      link: function (scope, element) {
        scope.canvas = element;
        element.ctx = element[0].getContext('2d');

        // variable that decides if something should be drawn on mousemove
        element.drawing = false;
        
        element.bind('mousedown', function (event) {
          if (!scope.isDrawer()) {
            return;
          }
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
          if (!scope.isDrawer()) {
            return;
          }
          if (element.drawing) {
            // get current mouse position
            if (event.offsetX !== undefined) {
              element.currentX = event.offsetX;
              element.currentY = event.offsetY;
            } else {
              element.currentX = event.layerX - event.currentTarget.offsetLeft;
              element.currentY = event.layerY - event.currentTarget.offsetTop;
            }

            var message = {
              type: 'line',
              x1: element.lastX,
              y1: element.lastY,
              x2: element.currentX,
              y2: element.currentY,
              fill: undefined,
              stroke: scope.penColour
            };
            element.draw(message);
            Socket.emit('canvasMessage', message);

            // set current coordinates to last one
            element.lastX = element.currentX;
            element.lastY = element.currentY;
          }
        });
        element.bind('mouseup', function (event) {
          if (!scope.isDrawer()) {
            return;
          }
          // stop element.drawing
          element.drawing = false;
        });

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
