from segment_anything import sam_model_registry, SamAutomaticMaskGenerator
from PIL import Image
import numpy as np
import cv2
import os

# Load SAM model
MODEL_TYPE = "vit_h"
CHECKPOINT_PATH = "models/sam_vit_h_4b8939.pth"

sam = None

def load_sam_model():
    global sam
    if sam is None:
        print("Loading SAM model...")
        sam = sam_model_registry[MODEL_TYPE](checkpoint=CHECKPOINT_PATH)
        sam.to(device="cpu")  # or "cuda" if GPU available
        print("✅ SAM model loaded")
    return sam

def remove_background(image_path, output_path):
    """Remove background from image using SAM"""
    try:
        # Load image
        image = cv2.imread(image_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Load SAM model
        sam_model = load_sam_model()
        
        # Generate masks
        mask_generator = SamAutomaticMaskGenerator(sam_model)
        masks = mask_generator.generate(image)
        
        if len(masks) == 0:
            raise Exception("No objects detected in image")
        
        # Get largest mask (likely the main product)
        largest_mask = max(masks, key=lambda x: x['area'])
        
        # Create alpha channel
        mask = largest_mask['segmentation']
        
        # Convert to RGBA
        image_pil = Image.fromarray(image)
        image_rgba = image_pil.convert("RGBA")
        
        # Apply mask
        pixels = image_rgba.load()
        for y in range(image_rgba.height):
            for x in range(image_rgba.width):
                if not mask[y, x]:
                    pixels[x, y] = (0, 0, 0, 0)  # Transparent
        
        # Save
        image_rgba.save(output_path, "PNG")
        
        return {
            "success": True,
            "output_path": output_path,
            "mask_area": largest_mask['area']
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }