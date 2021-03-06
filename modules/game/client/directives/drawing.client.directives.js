'use strict';

/*
 * Get the coordinates of a mouse event relative to a canvas element
 *
 * http://stackoverflow.com/questions/10449890/detect-mouse-click-location-within-canvas
 */
function getMouse(e, canvas) {
  var element = canvas[0], offsetX = 0, offsetY = 0, mx, my;

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
  return {x: mx / canvas.scaleX, y: my / canvas.scaleY};
}

angular.module('game').directive('dtDrawing', ['Socket', 'MouseConstants', 'CanvasSettings', '$compile',
  function (Socket, MouseConstants, CanvasSettings, $compile) {
    function clearLayer(context) {
      context.clearRect(0, 0, CanvasSettings.RESOLUTION_WIDTH, CanvasSettings.RESOLUTION_HEIGHT);
    }

    return {
      restrict: 'C',
      link: function (scope, element) {
        var doc = angular.element(document);

        // Generate a layer for the canvas. Higher zIndex indicates in front
        function createLayer(zIndex, width, height) {
          var canvas = document.createElement('canvas');
          canvas.setAttribute('class', 'dt-drawing-layer');
          canvas.setAttribute('ng-style', "{cursor: Game.isDrawer(username) || Game.finished ? 'none' : 'default'}");
          canvas.width = width;
          canvas.height = height;

          canvas.style.zIndex = zIndex;
          return canvas;
        }

        function inCanvas(mouse) {
          // Re-multiply the scale back in to compare against real width and height
          var mouseX = mouse.x * element.scaleX;
          var mouseY = mouse.y * element.scaleY;

          return mouseX >= 0 && mouseX < element[0].offsetWidth && mouseY >= 0 && mouseY < element[0].offsetHeight;
        }

        // Create the drawing (main) layer and the preview (hover) layer
        scope.canvas = element;
        var drawLayer = createLayer(0, 1, 1);
        var previewLayer = createLayer(1, 1, 1);
        element[0].appendChild(drawLayer);
        element[0].appendChild(previewLayer);
        var drawCtx = drawLayer.getContext('2d');
        var previewCtx = previewLayer.getContext('2d');

        // Compile the ng style attributes on child layers
        $compile(element.contents())(scope);

        // This is never resized and keeps track of history
        var hiddenLayer = createLayer(0, CanvasSettings.RESOLUTION_WIDTH, CanvasSettings.RESOLUTION_HEIGHT);
        var hiddenCtx = hiddenLayer.getContext('2d');

        element.rescale = function () {
          // Aspect ratio
          var aspectRatio = CanvasSettings.RESOLUTION_WIDTH / CanvasSettings.RESOLUTION_HEIGHT;
          var width = element[0].offsetWidth;
          var height = width / aspectRatio;
          drawLayer.width = width;
          drawLayer.height = height;
          previewLayer.width = width;
          previewLayer.height = height;

          // Figure out scaling
          element.scaleX = width / CanvasSettings.RESOLUTION_WIDTH;
          element.scaleY = height / CanvasSettings.RESOLUTION_HEIGHT;

          // Scale
          drawCtx.scale(element.scaleX, element.scaleY);
          previewCtx.scale(element.scaleX, element.scaleY);

          // Restore data
          drawCtx.drawImage(hiddenLayer, 0, 0);
        };
        element.rescale();

        // Currently drawing with the left mouse button: i.e. mousedown was in canvas and is still down
        var drawingLeft = false;
        // Last mouse position when dragging
        var lastX;
        var lastY;

        /*
         * Given a mouse event, update the last and cur values attached to
         * this element and perform the draw (as well as notifying the server)
         */
        var drawAndEmit = function(e) {
          if (!scope.Game.isDrawer(scope.username) && !scope.Game.finished) {
            return;
          }

          var mouse = getMouse(e, element);

          if (mouse.x < 0 && mouse.y < 0){
            return;
          }

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
          Socket.emit('canvasMessage', message);
          element.draw(message);

          // set current coordinates to last one

          lastX = mouse.x;
          lastY = mouse.y;

        };

        document.body.addEventListener('mousedown', function (e) {
          var mouse = getMouse(e, element);
          // If the mouseDown event was left click within the canvas
          if (inCanvas(mouse) && (e.which === MouseConstants.MOUSE_LEFT )) {
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

        document.body.addEventListener('touchstart', function (e) {
          // If the touchstart is within the canvas
          if (e.target === previewLayer) {
            // Prevent page scrolling
            e.preventDefault();
            // Convert touch position to mouse position and trigger the mouse event counterpart
            var mouse = getMouse(e, element);
            var touch = e.touches[0];
            var mouseEvent = new MouseEvent("mousedown", {
              clientX: touch.clientX,
              clientY: touch.clientY
            });
            document.body.dispatchEvent(mouseEvent);
          }
        }, {passive: false});

        document.body.addEventListener('mousemove', function (e) {
          var mouse = getMouse(e, element);
          // If we started drawing within the canvas, draw the next part of the line
          if (drawingLeft) {
            drawAndEmit(e);
          }

          // Redraw the preview layer to match the new position
          clearLayer(previewCtx);
          if (inCanvas(mouse)) {
            if (scope.Game.isDrawer(scope.username) || scope.Game.finished) {
              if (scope.mouseMode === 'pen') {
                // Solid circle with the matching pen colour
                previewCtx.beginPath();
                previewCtx.arc(mouse.x, mouse.y, (+scope.drawWidth[scope.mouseMode] + 1) / 2, 0, Math.PI * 2);

                // Add outline of most contrasting colour
                // Get the rgb value from html colour name or hex value
                var d = document.createElement("div");
                d.style.color = scope.penColour;
                document.body.appendChild(d);
                var rgb = window.getComputedStyle(d).color.replace(/[^\d,]/g, '').split(',');
                document.body.removeChild(d);
                var r = rgb[0];
                var g = rgb[1];
                var b = rgb[2];
                var luminance = 0.2126*r + 0.7152*g + 0.0722*b;
                // Choose the more contrasting colour (black/white) according to luminance
                previewCtx.strokeStyle = luminance < 128 ? '#fff' : '#000';
                previewCtx.lineWidth = 1;
                previewCtx.stroke();

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

        document.body.addEventListener('touchmove', function (e) {
          // If the touchmove is within the canvas
          if (e.target === previewLayer) {
            // Prevent page scrolling
            e.preventDefault();
            // Convert touch position to mouse position and trigger the mouse event counterpart
            var touch = e.touches[0];
            var mouseEvent = new MouseEvent("mousemove", {
              clientX: touch.clientX,
              clientY: touch.clientY
            });
            document.body.dispatchEvent(mouseEvent);
          }
        }, {passive: false});

        document.body.addEventListener('mouseup', function (e) {
          // If we released the left mouse button, stop drawing and finish the line
          if (drawingLeft && (e.which === MouseConstants.MOUSE_LEFT)) {
            drawingLeft = false;
            // Final drawAndEmit allows you to make a dot by clicking once and not moving mouse.
            drawAndEmit(e);
          }
        });

        document.body.addEventListener('touchend', function (e) {
          // If the touchstart is within the canvas
          if (e.target === previewLayer) {
            // Prevent page scrolling
            e.preventDefault();
            // Convert touch position to mouse position and trigger the mouse event counterpart
            var mouseEvent = new MouseEvent("mouseup", {});
            document.body.dispatchEvent(mouseEvent);
          }
        }, {passive: false});

        function drawOnCtx(message, ctx) {
          switch(message.type) {
            case 'line':
              var draw = function() {
                ctx.beginPath();
                // If the line is zero-length, draw a circle instead
                if (message.x1 === message.x2 && message.y1 === message.y2) {
                  ctx.arc(message.x1, message.y1, (+message.lineWidth + 1) / 2, 0, 2 * Math.PI);
                  ctx.fillStyle = message.strokeStyle;
                  ctx.fill();
                } else {
                  ctx.lineCap = 'round';
                  ctx.moveTo(message.x1, message.y1);
                  ctx.lineTo(message.x2, message.y2);
                  ctx.lineWidth = message.lineWidth;
                  ctx.strokeStyle = message.strokeStyle;
                  ctx.stroke();
                }
              };
              if (message.lineType === 'pen') {
                draw();
              } else if (message.lineType === 'eraser') {
                var temp = ctx.globalCompositeOperation;
                ctx.globalCompositeOperation = 'destination-out';
                message.strokeStyle = '#000'; // Any colour will do for destination-out erasing
                draw();
                ctx.globalCompositeOperation = temp;
              }
              break;
            case 'text':
              ctx.font = message.font || "300 30px Source Sans Pro";
              ctx.fillStyle = message.colour || 'black';
              ctx.textAlign = message.align || 'left';
              ctx.fillText(message.text, message.x, message.y);
              break;
            case 'rect':
              ctx.fillStyle = message.fillStyle;
              ctx.strokeStyle = message.strokeStyle;
              ctx.fillRect(message.x, message.y, message.width, message.height);
              break;
            case 'clear':
              clearLayer(ctx);
              break;
            default:
              console.log('Draw message type unknown: ' + message.type);
          }
        }

        element.draw = function (message) {
          drawOnCtx(message, drawCtx);
          drawOnCtx(message, hiddenCtx);
        };
      }
    };
  }
]);
