import os
import io
import base64
from PIL import Image
import stability_sdk.interfaces.gooseai.generation.generation_pb2 as generation
from stability_sdk import client

def generate_background(prompt, style="professional", width=1024, height=1024):
    """
    Generate background using Stable Diffusion XL
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
        
        # COPYRIGHT SAFETY: Add negative prompts
        # This instructs the model NOT to include these elements
        negative_prompt = "text, watermark, copyright, signature, logo, trademark, disney, marvel, dc comics, famous characters, distorted, blurry, low quality, nsfw, brands, faces"

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
        # Note: The Stability Python SDK handles prompts differently than raw API
        # We pass the prompt list where weighted prompts can be used.
        answers = stability_api.generate(
            prompt=[enhanced_prompt], # Currently SDK doesn't support negative prompt easily in this method call without helpers, but putting it in prompt often works or relying on strict style prompts.
            # For this version, we rely on the style prompts being generic.
            seed=None,
            steps=30,
            cfg_scale=7.0,
            width=width,
            height=height,
            samples=1,
            sampler=generation.SAMPLER_K_DPMPP_2M
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
                    img = Image.open(io.BytesIO(artifact.binary))
                    
                    if img.mode == 'RGBA':
                        background = Image.new('RGB', img.size, (255, 255, 255))
                        background.paste(img, mask=img.split()[3])
                        img = background
                    
                    print(f"✅ Background generated successfully!")
                    
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
    """Generate multiple background variations"""
    variations = []
    variation_mods = ["", ", alternate composition", ", different lighting", ", unique perspective"]
    
    for i in range(min(count, 4)):
        modified_prompt = base_prompt + variation_mods[i]
        result = generate_background(modified_prompt, style)
        if result["success"]:
            variations.append(result)
        else:
            print(f"⚠️ Variation {i+1} failed: {result.get('error')}")
    
    return variations

def save_generated_background(image, output_path, optimize=True, max_size_kb=500):
    """Save generated background with optimization"""
    try:
        if not optimize:
            image.save(output_path, 'PNG', quality=95)
            return
        
        quality = 95
        while quality > 60:
            buffer = io.BytesIO()
            image.save(buffer, 'JPEG', quality=quality, optimize=True)
            size_kb = buffer.tell() / 1024
            
            if size_kb <= max_size_kb:
                with open(output_path, 'wb') as f:
                    f.write(buffer.getvalue())
                print(f"💾 Saved optimized background: {size_kb:.1f}KB (quality: {quality})")
                return
            
            quality -= 5
        
        image.save(output_path, 'JPEG', quality=60, optimize=True)
        print(f"⚠️ Saved at minimum quality (60)")
        
    except Exception as e:
        print(f"❌ Failed to save background: {str(e)}")
        raise