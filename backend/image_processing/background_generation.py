import os
import io
import base64
from PIL import Image
import stability_sdk.interfaces.gooseai.generation.generation_pb2 as generation
from stability_sdk import client

def generate_background(prompt, style="professional", width=1024, height=1024):
    """
    Generate background using Stable Diffusion XL
    
    Args:
        prompt: Text description of desired background
        style: Style preset (professional, modern, minimal, vibrant, abstract)
        width: Output width (default 1024)
        height: Output height (default 1024)
    
    Returns:
        dict with success status and image data
    """
    try:
        api_key = os.getenv('STABILITY_API_KEY')
        if not api_key:
            raise ValueError("STABILITY_API_KEY not found in environment")
        
        print(f"🎨 Generating background with prompt: {prompt}")
        print(f"   Style: {style}, Size: {width}x{height}")
        
        # Initialize Stability AI client
        stability_api = client.StabilityInference(
            key=api_key,
            verbose=True,
            engine="stable-diffusion-xl-1024-v1-0"
        )
        
        # Style-specific prompt enhancements
        style_prompts = {
            'professional': 'clean, corporate, professional lighting, high quality, commercial photography',
            'modern': 'contemporary, sleek, minimalist, modern design, clean composition',
            'minimal': 'minimalist, simple, clean background, subtle, elegant, negative space',
            'vibrant': 'vibrant colors, energetic, bold, colorful, dynamic, eye-catching',
            'abstract': 'abstract art, creative, artistic, unique patterns, modern art',
            'gradient': 'smooth gradient, color blend, soft transitions, elegant',
            'textured': 'subtle texture, depth, professional finish, high resolution'
        }
        
        # Enhance prompt with style
        enhanced_prompt = f"{prompt}, {style_prompts.get(style, style_prompts['professional'])}"
        enhanced_prompt += ", 4k, ultra detailed, professional quality, suitable for advertising"
        
        print(f"   Enhanced prompt: {enhanced_prompt[:100]}...")
        
        # Generate image
        answers = stability_api.generate(
            prompt=enhanced_prompt,
            seed=None,  # Random seed for variety
            steps=30,   # Number of inference steps (more = better quality)
            cfg_scale=7.0,  # How strictly to follow prompt (1-35)
            width=width,
            height=height,
            samples=1,  # Number of images to generate
            sampler=generation.SAMPLER_K_DPMPP_2M  # Sampling algorithm
        )
        
        # Extract image from response
        for resp in answers:
            for artifact in resp.artifacts:
                if artifact.finish_reason == generation.FILTER:
                    print("⚠️ Safety filter triggered, trying again with safer prompt")
                    return {
                        "success": False,
                        "error": "Content filtered by safety system. Try a different description."
                    }
                
                if artifact.type == generation.ARTIFACT_IMAGE:
                    # Convert binary image to PIL Image
                    img = Image.open(io.BytesIO(artifact.binary))
                    
                    # Convert to RGB if needed (remove alpha channel)
                    if img.mode == 'RGBA':
                        background = Image.new('RGB', img.size, (255, 255, 255))
                        background.paste(img, mask=img.split()[3])
                        img = background
                    
                    print(f"✅ Background generated successfully!")
                    print(f"   Dimensions: {img.size}")
                    
                    return {
                        "success": True,
                        "image": img,
                        "prompt": prompt,
                        "enhanced_prompt": enhanced_prompt,
                        "style": style,
                        "dimensions": {"width": width, "height": height}
                    }
        
        return {
            "success": False,
            "error": "No image generated"
        }
        
    except Exception as e:
        print(f"❌ Background generation failed: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

def generate_background_variations(base_prompt, style="professional", count=3):
    """
    Generate multiple background variations
    
    Args:
        base_prompt: Base description
        style: Style preset
        count: Number of variations (1-4)
    
    Returns:
        list of generated images
    """
    variations = []
    
    # Variation prompts
    variation_mods = [
        "",  # Original
        ", alternate composition",
        ", different lighting",
        ", unique perspective"
    ]
    
    for i in range(min(count, 4)):
        modified_prompt = base_prompt + variation_mods[i]
        result = generate_background(modified_prompt, style)
        
        if result["success"]:
            variations.append(result)
        else:
            print(f"⚠️ Variation {i+1} failed: {result.get('error')}")
    
    return variations

def save_generated_background(image, output_path, optimize=True, max_size_kb=500):
    """
    Save generated background with optimization
    
    Args:
        image: PIL Image object
        output_path: Path to save image
        optimize: Whether to optimize file size
        max_size_kb: Maximum file size in KB
    """
    try:
        if not optimize:
            image.save(output_path, 'PNG', quality=95)
            return
        
        # Optimize to target size
        quality = 95
        while quality > 60:
            # Save to temporary buffer
            buffer = io.BytesIO()
            image.save(buffer, 'JPEG', quality=quality, optimize=True)
            size_kb = buffer.tell() / 1024
            
            if size_kb <= max_size_kb:
                # Save final image
                with open(output_path, 'wb') as f:
                    f.write(buffer.getvalue())
                print(f"💾 Saved optimized background: {size_kb:.1f}KB (quality: {quality})")
                return
            
            quality -= 5
        
        # If still too large, save at minimum quality
        image.save(output_path, 'JPEG', quality=60, optimize=True)
        print(f"⚠️ Saved at minimum quality (60)")
        
    except Exception as e:
        print(f"❌ Failed to save background: {str(e)}")
        raise

# Test function
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python background_generation.py '<prompt>' [style]")
        print("Example: python background_generation.py 'summer beach sunset' vibrant")
        sys.exit(1)
    
    prompt = sys.argv[1]
    style = sys.argv[2] if len(sys.argv) > 2 else 'professional'
    
    print("=" * 60)
    print("Testing Background Generation")
    print("=" * 60)
    
    result = generate_background(prompt, style)
    
    if result["success"]:
        output_path = "test_background.jpg"
        save_generated_background(result["image"], output_path)
        print(f"\n✅ Success! Background saved to {output_path}")
    else:
        print(f"\n❌ Failed: {result['error']}")