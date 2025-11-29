from segment_anything import sam_model_registry, SamAutomaticMaskGenerator
from PIL import Image
import numpy as np
import cv2
import os
import sys

# Model configuration
MODEL_TYPE = "vit_h"
CHECKPOINT_PATH = os.path.join(os.path.dirname(__file__), "models/sam_vit_h_4b8939.pth")

# Global model instance (loaded once)
sam_model = None

def load_sam_model():
    """Load SAM model (cached)"""
    global sam_model
    
    if sam_model is None:
        print("🔄 Loading SAM model... (this may take 30 seconds)")
        
        if not os.path.exists(CHECKPOINT_PATH):
            raise FileNotFoundError(
                f"SAM checkpoint not found at {CHECKPOINT_PATH}\n"
                f"Please download it from: https://github.com/facebookresearch/segment-anything#model-checkpoints"
            )
        
        sam_model = sam_model_registry[MODEL_TYPE](checkpoint=CHECKPOINT_PATH)
        
        # Use CPU (or "cuda" if GPU available)
        device = "cpu"
        sam_model.to(device=device)
        
        print("✅ SAM model loaded successfully")
    
    return sam_model

def remove_background(input_path, output_path):
    """
    Remove background from image using Segment Anything Model
    
    Args:
        input_path: Path to input image
        output_path: Path to save output image (PNG with transparency)
    
    Returns:
        dict with success status and metadata
    """
    try:
        print(f"🖼️  Processing: {input_path}")
        
        # Load image
        image = cv2.imread(input_path)
        if image is None:
            raise ValueError(f"Could not load image from {input_path}")
        
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Load SAM model
        sam = load_sam_model()
        
        # Generate masks
        print("🎯 Generating masks...")
        mask_generator = SamAutomaticMaskGenerator(
            model=sam,
            points_per_side=32,
            pred_iou_thresh=0.86,
            stability_score_thresh=0.92,
            crop_n_layers=1,
            crop_n_points_downscale_factor=2,
        )
        
        masks = mask_generator.generate(image_rgb)
        
        if len(masks) == 0:
            raise Exception("No objects detected in image")
        
        print(f"✅ Found {len(masks)} potential objects")
        
        # Get largest mask (likely the main subject)
        largest_mask = max(masks, key=lambda x: x['area'])
        
        print(f"📏 Selected mask with area: {largest_mask['area']} pixels")
        
        # Create binary mask
        mask = largest_mask['segmentation']
        
        # Convert to PIL Image
        image_pil = Image.fromarray(image_rgb)
        image_rgba = image_pil.convert("RGBA")
        
        # Apply mask to alpha channel
        pixels = image_rgba.load()
        height, width = mask.shape
        
        for y in range(height):
            for x in range(width):
                if not mask[y, x]:
                    # Set transparent
                    pixels[x, y] = (0, 0, 0, 0)
        
        # Save output
        image_rgba.save(output_path, "PNG")
        
        print(f"💾 Saved to: {output_path}")
        
        return {
            "success": True,
            "output_path": output_path,
            "mask_area": int(largest_mask['area']),
            "total_masks": len(masks),
            "dimensions": {
                "width": width,
                "height": height
            }
        }
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

def remove_background_simple(input_path, output_path):
    """
    Simpler background removal using GrabCut (fallback method)
    Useful if SAM is too slow or memory-intensive
    """
    try:
        print(f"🖼️  Processing with GrabCut: {input_path}")
        
        # Load image
        image = cv2.imread(input_path)
        if image is None:
            raise ValueError(f"Could not load image from {input_path}")
            
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Create mask using GrabCut
        mask = np.zeros(image.shape[:2], np.uint8)
        bgd_model = np.zeros((1, 65), np.float64)
        fgd_model = np.zeros((1, 65), np.float64)
        
        # Define rectangle around object (assume centered)
        height, width = image.shape[:2]
        rect = (
            int(width * 0.1), 
            int(height * 0.1), 
            int(width * 0.8), 
            int(height * 0.8)
        )
        
        # Apply GrabCut
        print("🎯 Running GrabCut algorithm...")
        cv2.grabCut(image, mask, rect, bgd_model, fgd_model, 5, cv2.GC_INIT_WITH_RECT)
        
        # Create binary mask
        mask2 = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8')
        
        # Apply to image
        image_pil = Image.fromarray(image_rgb)
        image_rgba = image_pil.convert("RGBA")
        
        pixels = image_rgba.load()
        for y in range(height):
            for x in range(width):
                if mask2[y, x] == 0:
                    pixels[x, y] = (0, 0, 0, 0)
        
        image_rgba.save(output_path, "PNG")
        
        print(f"💾 Saved to: {output_path}")
        
        return {
            "success": True,
            "output_path": output_path,
            "method": "grabcut",
            "dimensions": {
                "width": width,
                "height": height
            }
        }
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    # Test script
    if len(sys.argv) > 1:
        test_input = sys.argv[1]
        test_output = "test_output_nobg.png"
        
        print("=" * 50)
        print("Testing Background Removal")
        print("=" * 50)
        
        result = remove_background(test_input, test_output)
        
        if result["success"]:
            print(f"\n✅ Success! Output saved to {test_output}")
            print(f"   Mask area: {result.get('mask_area', 'N/A')} pixels")
            print(f"   Total masks found: {result.get('total_masks', 'N/A')}")
        else:
            print(f"\n❌ Failed: {result['error']}")
    else:
        print("Usage: python background_removal.py <input_image_path>")