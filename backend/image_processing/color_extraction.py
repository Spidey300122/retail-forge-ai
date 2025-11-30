from PIL import Image
import numpy as np
from sklearn.cluster import KMeans
from collections import Counter
import colorsys

def rgb_to_hex(rgb):
    """Convert RGB tuple to hex color"""
    return "#{:02x}{:02x}{:02x}".format(int(rgb[0]), int(rgb[1]), int(rgb[2]))

def hex_to_rgb(hex_color):
    """Convert hex to RGB"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def get_color_brightness(rgb):
    """Calculate perceived brightness of a color (0-255)"""
    # Using perceived brightness formula
    return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2])

def is_grayscale(rgb, threshold=15):
    """Check if color is grayscale (low saturation)"""
    r, g, b = rgb
    avg = (r + g + b) / 3
    return all(abs(c - avg) < threshold for c in [r, g, b])

def get_color_name(rgb):
    """Get approximate color name"""
    r, g, b = rgb
    
    # Check if grayscale
    if is_grayscale(rgb):
        brightness = get_color_brightness(rgb)
        if brightness < 50:
            return "Black"
        elif brightness < 100:
            return "Dark Gray"
        elif brightness < 180:
            return "Gray"
        elif brightness < 230:
            return "Light Gray"
        else:
            return "White"
    
    # Convert to HSV for color detection
    h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
    hue = h * 360
    
    # Map hue to color names
    if s < 0.2:
        return "Gray"
    elif v < 0.2:
        return "Black"
    elif hue < 15 or hue >= 345:
        return "Red"
    elif 15 <= hue < 45:
        return "Orange"
    elif 45 <= hue < 75:
        return "Yellow"
    elif 75 <= hue < 150:
        return "Green"
    elif 150 <= hue < 210:
        return "Cyan"
    elif 210 <= hue < 270:
        return "Blue"
    elif 270 <= hue < 330:
        return "Purple"
    else:
        return "Pink"

def determine_color_usage(colors_with_freq):
    """Determine usage type for each color"""
    if not colors_with_freq:
        return []
    
    # Sort by frequency
    sorted_colors = sorted(colors_with_freq, key=lambda x: x['frequency'], reverse=True)
    
    results = []
    total_pixels = sum(c['frequency'] for c in sorted_colors)
    
    for i, color_data in enumerate(sorted_colors):
        percentage = (color_data['frequency'] / total_pixels) * 100
        
        # Determine usage based on position and percentage
        if i == 0 and percentage > 30:
            usage = "dominant"
        elif i < 2 and percentage > 15:
            usage = "primary"
        elif percentage > 10:
            usage = "secondary"
        elif percentage > 5:
            usage = "accent"
        else:
            usage = "minor"
        
        results.append({
            **color_data,
            'usage': usage,
            'percentage': round(percentage, 2)
        })
    
    return results

def extract_colors(image_path, n_colors=5):
    """
    Extract dominant colors from image using KMeans clustering
    
    Args:
        image_path: Path to image file
        n_colors: Number of colors to extract (default 5)
    
    Returns:
        dict with success status and color data
    """
    try:
        print(f"🎨 Extracting {n_colors} colors from {image_path}")
        
        # Load and prepare image
        image = Image.open(image_path)
        image = image.convert('RGB')
        
        # Resize for faster processing
        image.thumbnail((300, 300), Image.Resampling.LANCZOS)
        
        # Convert to numpy array
        pixels = np.array(image).reshape(-1, 3)
        
        # Remove pure white and pure black (often background)
        pixels = pixels[~np.all(pixels == [255, 255, 255], axis=1)]
        pixels = pixels[~np.all(pixels == [0, 0, 0], axis=1)]
        
        if len(pixels) == 0:
            raise ValueError("No valid pixels found in image")
        
        print(f"   Analyzing {len(pixels)} pixels...")
        
        # Apply KMeans clustering
        n_colors_actual = min(n_colors, len(pixels))
        kmeans = KMeans(n_clusters=n_colors_actual, random_state=42, n_init=10)
        kmeans.fit(pixels)
        
        # Get cluster centers (dominant colors)
        colors = kmeans.cluster_centers_.astype(int)
        
        # Get frequency of each cluster
        labels = kmeans.labels_
        label_counts = Counter(labels)
        
        # Build color data with frequency
        colors_with_freq = []
        for i, color in enumerate(colors):
            frequency = label_counts[i]
            rgb = tuple(color)
            
            colors_with_freq.append({
                'hex': rgb_to_hex(rgb),
                'rgb': list(rgb),
                'frequency': int(frequency),
                'name': get_color_name(rgb),
                'brightness': round(get_color_brightness(rgb), 2)
            })
        
        # Determine usage for each color
        colors_with_usage = determine_color_usage(colors_with_freq)
        
        # Sort by frequency (most dominant first)
        colors_with_usage.sort(key=lambda x: x['frequency'], reverse=True)
        
        print(f"✅ Extracted {len(colors_with_usage)} colors")
        for c in colors_with_usage:
            print(f"   {c['hex']} - {c['name']} ({c['usage']}, {c['percentage']}%)")
        
        return {
            "success": True,
            "colors": colors_with_usage[:n_colors],
            "total_pixels": int(len(pixels))
        }
        
    except Exception as e:
        print(f"❌ Color extraction failed: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

def extract_color_palette(image_path, palette_size=5):
    """
    Extract a curated color palette suitable for branding
    Filters out near-whites, near-blacks, and very similar colors
    """
    try:
        # Extract more colors than needed
        result = extract_colors(image_path, n_colors=palette_size * 2)
        
        if not result["success"]:
            return result
        
        colors = result["colors"]
        
        # Filter colors
        filtered = []
        for color in colors:
            rgb = color['rgb']
            brightness = get_color_brightness(rgb)
            
            # Skip near-white and near-black
            if brightness > 240 or brightness < 20:
                continue
            
            # Skip if too similar to existing colors
            is_unique = True
            for existing in filtered:
                existing_rgb = existing['rgb']
                # Calculate color distance
                distance = sum((a - b) ** 2 for a, b in zip(rgb, existing_rgb)) ** 0.5
                if distance < 50:  # Too similar
                    is_unique = False
                    break
            
            if is_unique:
                filtered.append(color)
            
            if len(filtered) >= palette_size:
                break
        
        # If we don't have enough, add back some colors
        if len(filtered) < palette_size:
            filtered = colors[:palette_size]
        
        print(f"🎨 Final palette: {len(filtered)} colors")
        
        return {
            "success": True,
            "colors": filtered,
            "total_pixels": result["total_pixels"]
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# Test function
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        test_path = sys.argv[1]
        print("=" * 60)
        print("Testing Color Extraction")
        print("=" * 60)
        
        result = extract_color_palette(test_path, palette_size=5)
        
        if result["success"]:
            print(f"\n✅ Success! Extracted {len(result['colors'])} colors:")
            for i, color in enumerate(result['colors'], 1):
                print(f"\n{i}. {color['hex']}")
                print(f"   Name: {color['name']}")
                print(f"   RGB: {color['rgb']}")
                print(f"   Usage: {color['usage']}")
                print(f"   Coverage: {color['percentage']}%")
        else:
            print(f"\n❌ Failed: {result['error']}")
    else:
        print("Usage: python color_extraction.py <image_path>")