from PIL import Image
import numpy as np
from sklearn.cluster import KMeans

def extract_colors(image_path, n_colors=5):
    """Extract dominant colors from image"""
    try:
        # Load image
        image = Image.open(image_path)
        image = image.convert('RGB')
        image = image.resize((150, 150))  # Reduce size for speed
        
        # Convert to array
        pixels = np.array(image).reshape(-1, 3)
        
        # Use KMeans to find dominant colors
        kmeans = KMeans(n_clusters=n_colors, random_state=42, n_init=10)
        kmeans.fit(pixels)
        
        colors = kmeans.cluster_centers_.astype(int)
        
        # Convert to hex
        result = []
        for color in colors:
            hex_color = "#{:02x}{:02x}{:02x}".format(*color)
            result.append({
                "hex": hex_color,
                "rgb": color.tolist()
            })
        
        return {
            "success": True,
            "colors": result
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }