/**
 * Add snapping guides to canvas
 */
export function enableSnapping(canvas, snapDistance = 10) {
  let verticalLine = null;
  let horizontalLine = null;

  // Create guide lines
  const createGuideLine = (isVertical) => {
    return new fabric.Line(
      isVertical ? [0, 0, 0, canvas.height] : [0, 0, canvas.width, 0],
      {
        stroke: '#2563eb',
        strokeWidth: 1,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        opacity: 0.8,
      }
    );
  };

  canvas.on('object:moving', (e) => {
    const obj = e.target;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const objWidth = obj.width * obj.scaleX;
    const objHeight = obj.height * obj.scaleY;

    // Calculate object bounds
    const objLeft = obj.left - objWidth / 2;
    const objRight = obj.left + objWidth / 2;
    const objTop = obj.top - objHeight / 2;
    const objBottom = obj.top + objHeight / 2;
    const objCenterX = obj.left;
    const objCenterY = obj.top;

    // Canvas snap points
    const canvasCenterX = canvasWidth / 2;
    const canvasCenterY = canvasHeight / 2;

    let snapped = false;

    // Snap to canvas center X
    if (Math.abs(objCenterX - canvasCenterX) < snapDistance) {
      obj.set({ left: canvasCenterX });
      showVerticalGuide(canvasCenterX);
      snapped = true;
    }
    // Snap to canvas left
    else if (Math.abs(objLeft) < snapDistance) {
      obj.set({ left: objWidth / 2 });
      showVerticalGuide(0);
      snapped = true;
    }
    // Snap to canvas right
    else if (Math.abs(objRight - canvasWidth) < snapDistance) {
      obj.set({ left: canvasWidth - objWidth / 2 });
      showVerticalGuide(canvasWidth);
      snapped = true;
    } else {
      hideVerticalGuide();
    }

    // Snap to canvas center Y
    if (Math.abs(objCenterY - canvasCenterY) < snapDistance) {
      obj.set({ top: canvasCenterY });
      showHorizontalGuide(canvasCenterY);
      snapped = true;
    }
    // Snap to canvas top
    else if (Math.abs(objTop) < snapDistance) {
      obj.set({ top: objHeight / 2 });
      showHorizontalGuide(0);
      snapped = true;
    }
    // Snap to canvas bottom
    else if (Math.abs(objBottom - canvasHeight) < snapDistance) {
      obj.set({ top: canvasHeight - objHeight / 2 });
      showHorizontalGuide(canvasHeight);
      snapped = true;
    } else {
      hideHorizontalGuide();
    }

    if (snapped) {
      obj.setCoords();
    }
  });

  canvas.on('object:modified', () => {
    hideVerticalGuide();
    hideHorizontalGuide();
  });

  canvas.on('selection:cleared', () => {
    hideVerticalGuide();
    hideHorizontalGuide();
  });

  function showVerticalGuide(x) {
    if (!verticalLine) {
      verticalLine = createGuideLine(true);
      canvas.add(verticalLine);
    }
    verticalLine.set({ x1: x, x2: x, y1: 0, y2: canvas.height });
    verticalLine.bringToFront();
    canvas.renderAll();
  }

  function showHorizontalGuide(y) {
    if (!horizontalLine) {
      horizontalLine = createGuideLine(false);
      canvas.add(horizontalLine);
    }
    horizontalLine.set({ x1: 0, x2: canvas.width, y1: y, y2: y });
    horizontalLine.bringToFront();
    canvas.renderAll();
  }

  function hideVerticalGuide() {
    if (verticalLine) {
      canvas.remove(verticalLine);
      verticalLine = null;
      canvas.renderAll();
    }
  }

  function hideHorizontalGuide() {
    if (horizontalLine) {
      canvas.remove(horizontalLine);
      horizontalLine = null;
      canvas.renderAll();
    }
  }

  console.log('✅ Snapping guides enabled');
}