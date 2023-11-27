'use strict';
import * as React from 'react'
import {CanvasSettings, MouseConstants} from './config/game.client.config';
import {currentSocket, useAddSocketListener} from "../core/services/socket.io.client.service";

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
  return {x: mx / scaleX.current, y: my / scaleY.current};
}

function clearLayer(context) {
  context.clearRect(0, 0, CanvasSettings.RESOLUTION_WIDTH, CanvasSettings.RESOLUTION_HEIGHT);
}

const scaleX = {
  current: null,
}
const scaleY = {
  current: null,
}
const mouseLeftIsDown = {
  current: false,
}

export const CanvasElement = (props: {canDraw: boolean, mouseMode: string, penColour: string, drawWidth: string}) => {
  function inCanvas(mouse) {
    // Re-multiply the scale back in to compare against real width and height
    var mouseX = mouse.x * scaleX.current;
    var mouseY = mouse.y * scaleY.current;

    return mouseX >= 0 && mouseX < parentRef.current.offsetWidth && mouseY >= 0 && mouseY < parentRef.current.offsetHeight;
  }

  const parentRef = React.createRef(null)
  const drawLayerRef = React.createRef(null)
  const previewLayerRef = React.createRef(null)
  const hiddenLayerRef = React.createRef(null)

  React.useEffect(() => {
    const windowResize = () => {
      console.log("window resize event")
      const drawCtx = drawLayerRef.current.getContext('2d');
      const previewCtx = previewLayerRef.current.getContext('2d');
      // Aspect ratio
      var aspectRatio = CanvasSettings.RESOLUTION_WIDTH / CanvasSettings.RESOLUTION_HEIGHT;
      var width = parentRef.current.offsetWidth;
      var height = width / aspectRatio;
      drawLayerRef.current.width = width;
      drawLayerRef.current.height = height;
      previewLayerRef.current.width = width;
      previewLayerRef.current.height = height;

      // Figure out scaling
      scaleX.current = width / CanvasSettings.RESOLUTION_WIDTH;
      scaleY.current = height / CanvasSettings.RESOLUTION_HEIGHT;

      // Scale
      drawCtx.scale(scaleX.current, scaleY.current);
      previewCtx.scale(scaleX.current, scaleY.current);

      // Restore data
      drawCtx.drawImage(hiddenLayerRef.current, 0, 0);

    }
    window.addEventListener('resize', windowResize);
    windowResize() // Trigger initial resize after render
    return () => {window.removeEventListener('resize', windowResize)}
  }, [drawLayerRef, previewLayerRef])

  // Last mouse position when dragging
  const lastX = React.useRef(null);
  const lastY = React.useRef(null);

  /*
   * Given a mouse event, update the last and cur values attached to
   * this element and perform the draw (as well as notifying the server)
   */
  const drawAndEmit = function(e) {
    if (!props.canDraw) {
      return;
    }

    var mouse = getMouse(e, parentRef.current);

    if (mouse.x < 0 && mouse.y < 0){
      return;
    }

    const message = {
      type: 'line',
      x1: lastX.current,
      y1: lastY.current,
      x2: mouse.x,
      y2: mouse.y
    };
    if (props.mouseMode === 'pen') {
      message.lineType = 'pen';
      message.strokeStyle = props.penColour;
      message.lineWidth = props.drawWidth[props.mouseMode];
    } else if (props.mouseMode === 'eraser') {
      message.lineType = 'eraser';
      message.lineWidth = props.drawWidth[props.mouseMode];
    }
    currentSocket.socket.emit('canvasMessage', message);
    draw(message);

    // set current coordinates to last one

    lastX.current = mouse.x;
    lastY.current = mouse.y;

  };

  useDocumentBodyListener('mousedown', (e: MouseEvent) => {
    const drawCtx = drawLayerRef.current.getContext('2d');
    var mouse = getMouse(e, parentRef.current);
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
      mouseLeftIsDown.current = true;

      // Begin the new path
      drawCtx.beginPath();
      lastX.current = mouse.x;
      lastY.current = mouse.y;
    }

  }, [drawLayerRef])

  useDocumentBodyListener('touchstart', (e: TouchEvent) => {
    // If the touchstart is within the canvas
    if (e.target === previewLayerRef.current) {
      // Prevent page scrolling
      e.preventDefault();
      // Convert touch position to mouse position and trigger the mouse event counterpart
      var touch = e.touches[0];
      var mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      document.body.dispatchEvent(mouseEvent);
    }
  }, [previewLayerRef], {passive: false})

  useDocumentBodyListener('mousemove', (e: MouseEvent) => {
    const previewCtx = previewLayerRef.current.getContext('2d');
    var mouse = getMouse(e, parentRef.current);
    // If we started drawing within the canvas, draw the next part of the line
    if (mouseLeftIsDown.current) {
      drawAndEmit(e);
    }

    // Redraw the preview layer to match the new position
    clearLayer(previewCtx);
    if (inCanvas(mouse)) {
      if (props.canDraw) {
        if (props.mouseMode === 'pen') {
          // Solid circle with the matching pen colour
          previewCtx.beginPath();
          previewCtx.arc(mouse.x, mouse.y, (+props.drawWidth[props.mouseMode] + 1) / 2, 0, Math.PI * 2);

          // Add outline of most contrasting colour
          // Get the rgb value from html colour name or hex value
          var d = document.createElement("div");
          d.style.color = props.penColour;
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

          previewCtx.fillStyle = props.penColour;
          previewCtx.fill();
        } else if (props.mouseMode === 'eraser') {
          // Empty circle with black outline and white fill
          previewCtx.beginPath();
          previewCtx.arc(mouse.x, mouse.y, (+props.drawWidth[props.mouseMode] + 1) / 2, 0, Math.PI * 2);
          previewCtx.strokeStyle = '#000';
          previewCtx.lineWidth = 1;
          previewCtx.stroke();
          previewCtx.fillStyle = '#fff';
          previewCtx.fill();
        }
      }
    }
  }, [previewLayerRef, parentRef])

  useDocumentBodyListener('touchmove', function (e) {
    // If the touchmove is within the canvas
    if (e.target === previewLayerRef.current) {
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
  }, [previewLayerRef], {passive: false});

  useDocumentBodyListener('mouseup', function (e) {
    // If we released the left mouse button, stop drawing and finish the line
    if (mouseLeftIsDown.current && (e.which === MouseConstants.MOUSE_LEFT)) {
      mouseLeftIsDown.current = false;
      // Final drawAndEmit allows you to make a dot by clicking once and not moving mouse.
      drawAndEmit(e);
    }
  }, [drawAndEmit]);

  useDocumentBodyListener('touchend', function (e) {
    // If the touchstart is within the canvas
    if (e.target === previewLayerRef.current) {
      // Prevent page scrolling
      e.preventDefault();
      // Convert touch position to mouse position and trigger the mouse event counterpart
      var mouseEvent = new MouseEvent("mouseup", {});
      document.body.dispatchEvent(mouseEvent);
    }
  }, [previewLayerRef], {passive: false});

  const draw = function (message) {
    const drawCtx = drawLayerRef.current.getContext('2d');
    const hiddenCtx = hiddenLayerRef.current.getContext('2d');
    drawOnCtx(message, drawCtx);
    drawOnCtx(message, hiddenCtx);
  }

  useAddSocketListener('canvasMessage', (message) => {
    if (Array.isArray(message)) {
      message.forEach(function (m) {
        draw(m);
      });
    } else {
      draw(message);
    }
  }, [draw])



  return (
    <div ref={parentRef} className="dt-drawing">
      <canvas className={"dt-drawing-layer"} ref={drawLayerRef} style={{cursor: (props.canDraw ? 'none' : 'default'), zIndex: 1}}/>
      <canvas className={"dt-drawing-layer"} ref={previewLayerRef} style={{cursor: (props.canDraw ? 'none' : 'default'), zIndex: 0}}/>
      <div style={{visibility: 'hidden'}}>
        <canvas className={"dt-drawing-layer"} ref={hiddenLayerRef} style={{
          cursor: (props.canDraw ? 'none' : 'default'),
          zIndex: 0,
          width: CanvasSettings.RESOLUTION_WIDTH,
          height: CanvasSettings.RESOLUTION_HEIGHT,
        }}/>
      </div>
    </div>
  )
}

// Generate a layer for the canvas. Higher zIndex indicates in front
const LayerElement = React.forwardRef(({zIndex, width, height, canDraw}, ref) => {
  return (
    <canvas className="dt-drawing-layer" ref={ref} style={{
      cursor: canDraw ? 'none' : 'default',
      height: height,
      width: width,
      zIndex: zIndex,
    }}/>
  )
})


const useDocumentBodyListener = (event: string, callback: (e) => void, deps: any[], options={}) => {
  React.useEffect(() => {
    document.body.addEventListener(event, callback, options)
    return (() => {document.body.removeEventListener(event, callback)})
  }, deps)
}

const drawOnCtx = (message, ctx) => {
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

