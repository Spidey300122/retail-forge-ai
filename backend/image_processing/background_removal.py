"""
Lightweight Background Removal using rembg
Much faster and less resource-intensive than SAM
"""

from rembg import remove
from PIL import Image
import io
import os
import sys

def remove_background(input_path, output_path):
    """
    Remove background from image using rembg (U2-Net model)
    This is much lighter and faster than SAM
    
    Args:
        input_path: Path to input image
        output_path: Path to save output image (PNG with transparency)
    
    Returns:
        dict with success status and metadata
    """
    try:
        print(f"🖼️  Processing: {input_path}")
        
        # Load image
        with open(input_path, 'rb') as input_file:
            input_data = input_file.read()
        
        print("🎯 Removing background with rembg...")
        
        # Remove background using rembg (uses U2-Net model)
        # This automatically downloads a ~176MB model on first use
        # Much lighter than SAM's 2.4GB!
        output_data = remove(input_data)
        
        # Save output
        output_image = Image.open(io.BytesIO(output_data))
        output_image.save(output_path, "PNG")
        
        # Get dimensions
        width, height = output_image.size
        
        print(f"💾 Saved to: {output_path}")
        print(f"📏 Dimensions: {width}x{height}")
        
        return {
            "success": True,
            "output_path": output_path,
            "dimensions": {
                "width": width,
                "height": height
            },
            "method": "rembg"
        }
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

def remove_background_simple(input_path, output_path):
    """
    Alias for remove_background - kept for compatibility
    """
    return remove_background(input_path, output_path)

def remove_background_fast(input_path, output_path):
    """
    Even faster version with reduced quality
    Good for previews or when speed is critical
    """
    try:
        print(f"🖼️  Fast processing: {input_path}")
        
        with open(input_path, 'rb') as input_file:
            input_data = input_file.read()
        
        print("⚡ Quick background removal...")
        
        # Use fast model (less accurate but much faster)
        output_data = remove(
            input_data,
            alpha_matting=False,  # Disable alpha matting for speed
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10
        )
        
        output_image = Image.open(io.BytesIO(output_data))
        output_image.save(output_path, "PNG")
        
        width, height = output_image.size
        
        print(f"💾 Saved to: {output_path}")
        
        return {
            "success": True,
            "output_path": output_path,
            "dimensions": {
                "width": width,
                "height": height
            },
            "method": "rembg-fast"
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
        print("Testing Background Removal (rembg)")
        print("=" * 50)
        
        result = remove_background(test_input, test_output)
        
        if result["success"]:
            print(f"\n✅ Success! Output saved to {test_output}")
            print(f"   Dimensions: {result['dimensions']['width']}x{result['dimensions']['height']}")
            print(f"   Method: {result.get('method', 'rembg')}")
        else:
            print(f"\n❌ Failed: {result['error']}")
    else:
        print("Usage: python background_removal.py <input_image_path>")