// frontend/src/utils/valueTileUtils.js - UPDATED VERSION
import { fabric } from 'fabric';

/**
 * Add a value tile to the canvas (top-right, locked position)
 * @param {fabric.Canvas} canvas - Fabric.js canvas instance
 * @param {Object} tileData - Tile configuration
 */
export function addValueTileToCanvas(canvas, tileData) {
  if (!canvas) {
    console.error('Canvas not provided');
    return null;
  }

  // Remove existing value tile if any
  const existingTile = canvas.getObjects().find(obj => obj.isValueTile);
  if (existingTile) {
    canvas.remove(existingTile);
  }

  let tileGroup;
  const canvasBackgroundColor = canvas.backgroundColor || '#ffffff';

  switch (tileData.type) {
    case 'new':
      tileGroup = createNewTile(tileData, canvasBackgroundColor);
      break;
    case 'white':
      tileGroup = createWhiteTile(tileData);
      break;
    case 'clubcard':
      tileGroup = createClubcardTile(tileData);
      break;
    default:
      console.error('Unknown tile type:', tileData.type);
      return null;
  }

  if (!tileGroup) return null;

  // Position at top-right (with margin)
  const margin = 20;
  tileGroup.set({
    left: canvas.width - tileGroup.width - margin,
    top: margin,
    originX: 'left',
    originY: 'top',
    // STRICT LOCK - Cannot be moved, scaled, rotated, or modified in any way
    selectable: false,  // Changed to false - cannot be selected at all
    evented: false,     // No events fire on this object
    lockMovementX: true,
    lockMovementY: true,
    lockRotation: true,
    lockScalingX: true,
    lockScalingY: true,
    lockScalingFlip: true,
    lockSkewingX: true,
    lockSkewingY: true,
    hasControls: false,
    hasBorders: false,
    hoverCursor: 'default',
    // Custom property to identify value tiles
    isValueTile: true,
    tileType: tileData.type,
    // Exclude from layers panel interactions
    excludeFromLayers: true
  });

  canvas.add(tileGroup);
  canvas.bringToFront(tileGroup);
  canvas.renderAll();

  return tileGroup;
}

/**
 * Create NEW tile - Shows "Tesco" in Tesco blue with canvas background
 * Size increased by 30%
 */
function createNewTile(tileData, canvasBackgroundColor = '#ffffff') {
  const width = 130;  // 100 * 1.3
  const height = 78;  // 60 * 1.3

  const background = new fabric.Rect({
    width: width,
    height: height,
    fill: canvasBackgroundColor, // Use canvas background color
    rx: 6,
    ry: 6,
    stroke: '#00539F', // Tesco blue border
    strokeWidth: 3
  });

  const text = new fabric.Text('Tesco', {
    fontSize: 32, // Increased by 30% (24 * 1.33)
    fontWeight: 'bold',
    fill: '#00539F', // Tesco blue
    fontFamily: 'Arial Black, Arial, sans-serif', // Closest to Tesco font
    originX: 'center',
    originY: 'center',
    left: width / 2,
    top: height / 2
  });

  const group = new fabric.Group([background, text], {
    selectable: false,
    evented: false
  });

  return group;
}

/**
 * Create White Value Tile (only price editable)
 * Size increased by 30%
 */
function createWhiteTile(tileData) {
  const width = 156;   // 120 * 1.3
  const height = 104;  // 80 * 1.3

  const background = new fabric.Rect({
    width: width,
    height: height,
    fill: tileData.color,
    stroke: tileData.textColor,
    strokeWidth: 4,  // Increased by 30%
    rx: 6,
    ry: 6
  });

  const priceText = new fabric.Text(`£${tileData.price}`, {
    fontSize: 42, // 32 * 1.3
    fontWeight: 'bold',
    fill: tileData.textColor,
    fontFamily: 'Arial, sans-serif',
    originX: 'center',
    originY: 'center',
    left: width / 2,
    top: height / 2
  });

  const group = new fabric.Group([background, priceText], {
    selectable: false,
    evented: false
  });

  // Store original data for potential editing
  group.valueTileData = tileData;

  return group;
}

/**
 * Create Clubcard Price Tile (offer and regular price)
 * Size increased by 30%
 * NOW WITH END DATE INPUT (DD/MM format)
 */
function createClubcardTile(tileData) {
  const width = 182;   // 140 * 1.3
  const height = 130;  // 100 * 1.3

  const background = new fabric.Rect({
    width: width,
    height: height,
    fill: tileData.color,
    rx: 6,
    ry: 6
  });

  // Clubcard logo/text
  const clubcardLabel = new fabric.Text('Clubcard', {
    fontSize: 16, // 12 * 1.3
    fontWeight: 'bold',
    fill: tileData.textColor,
    fontFamily: 'Arial, sans-serif',
    originX: 'center',
    originY: 'top',
    left: width / 2,
    top: 10
  });

  // Offer price (large)
  const offerPriceText = new fabric.Text(`£${tileData.offerPrice}`, {
    fontSize: 47, // 36 * 1.3
    fontWeight: 'bold',
    fill: '#fbbf24', // Gold/yellow for Clubcard offers
    fontFamily: 'Arial, sans-serif',
    originX: 'center',
    originY: 'center',
    left: width / 2,
    top: height / 2 - 5
  });

  // Regular price (smaller, strikethrough)
  const regularPriceText = new fabric.Text(`Was £${tileData.regularPrice}`, {
    fontSize: 14, // 12 * 1.17
    fill: tileData.textColor,
    fontFamily: 'Arial, sans-serif',
    originX: 'center',
    originY: 'bottom',
    left: width / 2,
    top: height - 25,
    linethrough: true
  });

  // End date (DD/MM format) - REQUIRED for Clubcard tiles
  const endDateText = new fabric.Text(
    tileData.endDate ? `Ends ${tileData.endDate}` : 'Ends --/--',
    {
      fontSize: 11,
      fill: tileData.textColor,
      fontFamily: 'Arial, sans-serif',
      originX: 'center',
      originY: 'bottom',
      left: width / 2,
      top: height - 8
    }
  );

  const group = new fabric.Group([
    background, 
    clubcardLabel, 
    offerPriceText, 
    regularPriceText,
    endDateText
  ], {
    selectable: false,
    evented: false
  });

  // Store original data
  group.valueTileData = tileData;

  return group;
}

/**
 * Update existing value tile with new data
 */
export function updateValueTile(canvas, newData) {
  const existingTile = canvas.getObjects().find(obj => obj.isValueTile);
  
  if (!existingTile) {
    console.warn('No value tile found to update');
    return;
  }

  // Remove old tile
  canvas.remove(existingTile);
  
  // Add new tile with updated data
  addValueTileToCanvas(canvas, newData);
}

/**
 * Remove value tile from canvas
 */
export function removeValueTile(canvas) {
  const existingTile = canvas.getObjects().find(obj => obj.isValueTile);
  
  if (existingTile) {
    canvas.remove(existingTile);
    canvas.renderAll();
    return true;
  }
  
  return false;
}

/**
 * Check if canvas has a value tile
 */
export function hasValueTile(canvas) {
  return canvas.getObjects().some(obj => obj.isValueTile);
}

/**
 * Validate DD/MM format
 */
export function validateDateFormat(dateString) {
  if (!dateString) return false;
  
  const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])$/;
  return regex.test(dateString);
}

export default {
  addValueTileToCanvas,
  updateValueTile,
  removeValueTile,
  hasValueTile,
  validateDateFormat
};