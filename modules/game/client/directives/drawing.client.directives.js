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

angular.module('game').directive('dtDrawing', ['Socket', 'MouseConstants', 'CanvasSettings',
  function (Socket, MouseConstants, CanvasSettings) {
    function clearLayer(context) {
      context.clearRect(0, 0, CanvasSettings.RESOLUTION_WIDTH, CanvasSettings.RESOLUTION_HEIGHT);
    }

    return {
      restrict: 'C',
      link: function (scope, element) {
        var doc = angular.element(document);

        // Generate a layer for the canvas. Higher zIndex indicates in front
        function createLayer(zIndex) {
          var canvas = document.createElement('canvas');
          canvas.setAttribute('class', 'dt-drawing-layer');
          canvas.setAttribute('width', CanvasSettings.RESOLUTION_WIDTH.toString());
          canvas.setAttribute('height', CanvasSettings.RESOLUTION_HEIGHT.toString());

          // Take the dimensions of the surrounding div as the display width and height
          canvas.style.width = element[0].style.width;
          canvas.style.height = element[0].style.height;
          canvas.style.zIndex = zIndex;
          return canvas;
        }

        function inCanvas(mouse) {
          return mouse.x >= 0 && mouse.x < element[0].offsetWidth && mouse.y >= 0 && mouse.y < element[0].offsetHeight;
        }

        // Create the drawing (main) layer and the preview (hover) layer
        scope.canvas = element;
        var draw = createLayer(0);
        var preview = createLayer(1);
        element[0].appendChild(draw);
        element[0].appendChild(preview);
        var drawCtx = draw.getContext('2d');
        var previewCtx = preview.getContext('2d');

        // Currently drawing with the left mouse button: i.e. mousedown was in canvas and is still down
        var drawingLeft = false;
        // Last mouse position when dragging
        var lastX;
        var lastY;
        
        doc.bind('mousedown', function (e) {
          var mouse = getMouse(e, element[0]);

          // If the mouseDown event was left click within the canvas
          if (inCanvas(mouse) && e.which === MouseConstants.MOUSE_LEFT) {

            // Prevent the default action of turning into highlight cursor
            e.preventDefault();
            // Also unhighlight anything that may be highlighted
            if (document.selection) { // IE
              document.selection.empty();
            } else { // Other browsers
              window.getSelection().removeAllRanges();
            }

            // We started dragging from within so we are now drawing
            drawingLeft = true;

            // Begin the new path
            drawCtx.beginPath();
            lastX = mouse.x;
            lastY = mouse.y;
          }

        });

        doc.bind('mousemove', function (e) {
          var mouse = getMouse(e, element[0]);

          // If we started drawing within the canvas, draw the next part of the line
          if (drawingLeft) {
            drawAndEmit(e);
          }

          // Redraw the preview layer to match the new position
          clearLayer(previewCtx);
          if (inCanvas(mouse)) {
            if (scope.Game.isDrawer(scope.username)) {
              if (scope.mouseMode === 'pen') {
                // Solid circle with the matching pen colour
                previewCtx.beginPath();
                previewCtx.arc(mouse.x, mouse.y, (+scope.drawWidth[scope.mouseMode] + 1) / 2, 0, Math.PI * 2);
                previewCtx.fillStyle = scope.penColour;
                previewCtx.fill();
              } else if (scope.mouseMode === 'eraser') {
                // Empty circle with black outline and white fill
                previewCtx.beginPath();
                previewCtx.arc(mouse.x, mouse.y, (+scope.drawWidth[scope.mouseMode] + 1) / 2, 0, Math.PI * 2);
                previewCtx.strokeStyle = '#000';
                previewCtx.lineWidth = 1;
                previewCtx.stroke();
                previewCtx.fillStyle = '#fff';
                previewCtx.fill();
              }
            }
          }
        });

        doc.bind('mouseup', function (e) {
          // If we released the left mouse button, stop drawing and finish the line
          if (e.which === MouseConstants.MOUSE_LEFT && drawingLeft) {
            drawingLeft = false;
            // Final drawAndEmit allows you to make a dot by clicking once and not moving mouse.
            drawAndEmit(e);
          }
        });

        /*
         * Given a mouse event, update the last and cur values attached to
         * this element and perform the draw (as well as notifying the server)
         */
        var drawAndEmit = function(e) {
          if (!scope.Game.isDrawer(scope.username)) {
            return;
          }

          var mouse = getMouse(e, element[0]);

          var message = {
            type: 'line',
            x1: lastX,
            y1: lastY,
            x2: mouse.x,
            y2: mouse.y
          };
          if (scope.mouseMode === 'pen') {
            message.lineType = 'pen';
            message.strokeStyle = scope.penColour;
            message.lineWidth = scope.drawWidth[scope.mouseMode];
          } else if (scope.mouseMode === 'eraser') {
            message.lineType = 'eraser';
            message.lineWidth = scope.drawWidth[scope.mouseMode];
          }
          element.draw(message);
          Socket.emit('canvasMessage', message);

          // set current coordinates to last one
          lastX = mouse.x;
          lastY = mouse.y;
        };

        element.draw = function (message) {
          switch(message.type) {
            case 'line':
              var draw = function() {
                drawCtx.beginPath();
                // If the line is zero-length, draw a circle instead
                if (message.x1 === message.x2 && message.y1 === message.y2) {
                  drawCtx.arc(message.x1, message.y1, (+message.lineWidth + 1) / 2, 0, 2 * Math.PI);
                  drawCtx.fillStyle = message.strokeStyle;
                  drawCtx.fill();
                } else {
                  drawCtx.lineCap = 'round';
                  drawCtx.moveTo(message.x1, message.y1);
                  drawCtx.lineTo(message.x2, message.y2);
                  drawCtx.lineWidth = message.lineWidth;
                  drawCtx.strokeStyle = message.strokeStyle;
                  drawCtx.stroke();
                }
              };
              if (message.lineType === 'pen') {
                draw();
              } else if (message.lineType === 'eraser') {
                var temp = drawCtx.globalCompositeOperation;
                drawCtx.globalCompositeOperation = 'destination-out';
                message.strokeStyle = '#000'; // Any colour will do for destination-out erasing
                draw();
                drawCtx.globalCompositeOperation = temp;
              }
              break;
            case 'rect':
              drawCtx.fillStyle = message.fillStyle;
              drawCtx.strokeStyle = message.strokeStyle;
              drawCtx.fillRect(message.x, message.y, message.width, message.height);
              break;
            case 'clear':
              clearLayer(drawCtx);
              break;
            default:
              console.log('Draw message type unknown: ' + message.type);
          }
        };
      }
    };
  }
]);
