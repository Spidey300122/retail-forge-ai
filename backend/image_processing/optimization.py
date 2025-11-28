from PIL import Image
import os

def optimize_image(input_path, output_path, target_size_kb=500, format='JPEG'):
    """Optimize image to target file size"""
    try:
        image = Image.open(input_path)
        
        # Convert RGBA to RGB if saving as JPEG
        if format == 'JPEG' and image.mode == 'RGBA':
            rgb_image = Image.new('RGB', image.size, (255, 255, 255))
            rgb_image.paste(image, mask=image.split()[3] if len(image.split()) == 4 else None)
            image = rgb_image
        
        # Try different quality levels
        quality = 95
        while quality > 60:
            image.save(output_path, format=format, quality=quality, optimize=True)
            
            size_kb = os.path.getsize(output_path) / 1024
            
            if size_kb <= target_size_kb:
                return {
                    "success": True,
                    "output_path": output_path,
                    "size_kb": round(size_kb, 2),
                    "quality": quality
                }
            
            quality -= 5
        
        # If still too large, resize image
        scale = 0.9
        while True:
            new_size = (int(image.width * scale), int(image.height * scale))
            resized = image.resize(new_size, Image.Resampling.LANCZOS)
            resized.save(output_path, format=format, quality=85, optimize=True)
            
            size_kb = os.path.getsize(output_path) / 1024
            
            if size_kb <= target_size_kb:
                return {
                    "success": True,
                    "output_path": output_path,
                    "size_kb": round(size_kb, 2),
                    "dimensions": new_size
                }
            
            scale -= 0.1
            if scale < 0.5:
                break
        
        return {
            "success": False,
            "error": "Could not optimize to target size"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }