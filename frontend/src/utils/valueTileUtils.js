// frontend/src/utils/valueTileUtils.js
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

  switch (tileData.type) {
    case 'new':
      tileGroup = createNewTile(tileData);
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
    // Lock the tile - user cannot move, scale, or rotate it
    selectable: true,
    lockMovementX: true,
    lockMovementY: true,
    lockRotation: true,
    lockScalingX: true,
    lockScalingY: true,
    hasControls: false,
    hasBorders: true,
    borderColor: '#00539F',
    // Custom property to identify value tiles
    isValueTile: true,
    tileType: tileData.type
  });

  canvas.add(tileGroup);
  canvas.bringToFront(tileGroup);
  canvas.renderAll();

  return tileGroup;
}

/**
 * Create NEW tile (predefined, cannot be edited)
 */
function createNewTile(tileData) {
  const width = 100;
  const height = 60;

  const background = new fabric.Rect({
    width: width,
    height: height,
    fill: tileData.color,
    rx: 6,
    ry: 6
  });

  const text = new fabric.Text('NEW', {
    fontSize: 24,
    fontWeight: 'bold',
    fill: tileData.textColor,
    fontFamily: 'Arial, sans-serif',
    originX: 'center',
    originY: 'center',
    left: width / 2,
    top: height / 2
  });

  const group = new fabric.Group([background, text], {
    selectable: true
  });

  return group;
}

/**
 * Create White Value Tile (only price editable)
 */
function createWhiteTile(tileData) {
  const width = 120;
  const height = 80;

  const background = new fabric.Rect({
    width: width,
    height: height,
    fill: tileData.color,
    stroke: tileData.textColor,
    strokeWidth: 3,
    rx: 6,
    ry: 6
  });

  const priceText = new fabric.Text(`£${tileData.price}`, {
    fontSize: 32,
    fontWeight: 'bold',
    fill: tileData.textColor,
    fontFamily: 'Arial, sans-serif',
    originX: 'center',
    originY: 'center',
    left: width / 2,
    top: height / 2
  });

  const group = new fabric.Group([background, priceText], {
    selectable: true
  });

  // Store original data for potential editing
  group.valueTileData = tileData;

  return group;
}

/**
 * Create Clubcard Price Tile (offer and regular price)
 */
function createClubcardTile(tileData) {
  const width = 140;
  const height = 100;

  const background = new fabric.Rect({
    width: width,
    height: height,
    fill: tileData.color,
    rx: 6,
    ry: 6
  });

  // Clubcard logo/text
  const clubcardLabel = new fabric.Text('Clubcard', {
    fontSize: 12,
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
    fontSize: 36,
    fontWeight: 'bold',
    fill: '#fbbf24', // Gold/yellow for Clubcard offers
    fontFamily: 'Arial, sans-serif',
    originX: 'center',
    originY: 'center',
    left: width / 2,
    top: height / 2
  });

  // Regular price (smaller, strikethrough)
  const regularPriceText = new fabric.Text(`Was £${tileData.regularPrice}`, {
    fontSize: 12,
    fill: tileData.textColor,
    fontFamily: 'Arial, sans-serif',
    originX: 'center',
    originY: 'bottom',
    left: width / 2,
    top: height - 10,
    linethrough: true
  });

  const group = new fabric.Group([background, clubcardLabel, offerPriceText, regularPriceText], {
    selectable: true
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

export default {
  addValueTileToCanvas,
  updateValueTile,
  removeValueTile,
  hasValueTile
};