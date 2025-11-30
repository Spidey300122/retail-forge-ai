# Day 4 Testing Checklist

## Background Removal Tests
- [ ] Upload image and select it
- [ ] Click "Remove Background"
- [ ] Loading indicator shows (Processing... message)
- [ ] Wait 10-30 seconds
- [ ] Background-removed image appears
- [ ] Original position/scale preserved
- [ ] Try with different image sizes (100KB, 1MB, 5MB)
- [ ] Test error: Upload 15MB image (should fail with error)

## Rotation Tests  
- [ ] Select image
- [ ] Click "-90°" button → image rotates counterclockwise
- [ ] Click "90°" button → image rotates clockwise
- [ ] Click "180°" button → image flips upside down
- [ ] Enter "45" in custom angle → click Apply → rotates 45°
- [ ] Rotate multiple times → angles accumulate correctly
- [ ] Undo rotation → returns to previous angle
- [ ] Redo rotation → applies rotation again

## Flip Tests
- [ ] Click "Flip Horizontal" → image flips left-right
- [ ] Click again → returns to normal
- [ ] Click "Flip Vertical" → image flips up-down  
- [ ] Click both → image is upside down and mirrored
- [ ] Undo flip → returns to previous state

## Scale Tests
- [ ] Click "50%" → image shrinks to half size
- [ ] Click "150%" → image grows 1.5x
- [ ] Click "200%" → image doubles in size
- [ ] Scale multiple times → sizes accumulate
- [ ] Manually resize with corner handles → dimensions update in panel

## Dimension Tests
- [ ] Lock aspect ratio checkbox is ON
- [ ] Change width to 500 → height updates proportionally
- [ ] Change height to 600 → width updates proportionally
- [ ] UNCHECK lock aspect ratio
- [ ] Change width to 800 → height stays same (stretches)
- [ ] Change height to 400 → width stays same (squashes)

## Crop Tests
- [ ] Click "Crop Image" button
- [ ] Blue dashed rectangle appears
- [ ] Drag rectangle to new position
- [ ] Resize rectangle by corner handles
- [ ] Click "Confirm Crop" → image crops to selection
- [ ] Cropped image appears in correct position
- [ ] Test "Cancel" button → rectangle disappears, no crop

## Alignment Tests
- [ ] Click "←" (left) → image aligns to left edge
- [ ] Click "↔" (center-h) → image centers horizontally
- [ ] Click "→" (right) → image aligns to right edge
- [ ] Click "↑" (top) → image aligns to top edge
- [ ] Click "↕" (center-v) → image centers vertically
- [ ] Click "↓" (bottom) → image aligns to bottom edge

## Reset Tests
- [ ] Rotate, flip, scale image multiple times
- [ ] Click "Reset All Transformations"
- [ ] Confirm dialog appears
- [ ] Click OK → image returns to original state

## Undo/Redo Tests
- [ ] Perform 5 different operations (rotate, scale, flip, etc.)
- [ ] Press Ctrl+Z (or Cmd+Z) → undoes last operation
- [ ] Press Ctrl+Z again → undoes previous operation
- [ ] Press Ctrl+Shift+Z (or Cmd+Shift+Z) → redoes operation
- [ ] All operations undo/redo correctly

## Layer Panel Tests
- [ ] Upload 3 images
- [ ] All 3 appear in Layers panel
- [ ] Click layer → selects that image
- [ ] Click eye icon → hides/shows image
- [ ] Click lock icon → locks/unlocks image
- [ ] Drag layer up/down → reorders images

## Performance Tests
- [ ] Upload 10 images
- [ ] Canvas still responsive
- [ ] No lag when dragging images
- [ ] Zoom in/out works smoothly
- [ ] Test with 5MB+ image → loads within 3 seconds

## Bugs Found
_List any issues here:_

1. 
2. 
3.