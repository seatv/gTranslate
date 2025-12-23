from PIL import Image, ImageDraw
import os

# Load the base icon
base_icon = Image.open('Translator.ico')

# Function to add a colored dot overlay to the icon
def create_icon_with_dot(base_img, size, dot_color, filename):
    # Resize base image to target size
    img = base_img.copy()
    img = img.resize((size, size), Image.Resampling.LANCZOS)
    
    # Convert to RGBA if not already
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Create a drawing context
    draw = ImageDraw.Draw(img)
    
    # Calculate dot size and position (bottom-right corner)
    dot_size = size // 4
    dot_x = size - dot_size - 2
    dot_y = size - dot_size - 2
    
    # Draw the colored dot/circle
    draw.ellipse(
        [dot_x, dot_y, dot_x + dot_size, dot_y + dot_size],
        fill=dot_color,
        outline=(255, 255, 255, 255),  # White outline
        width=max(1, size // 32)
    )
    
    # Save the icon
    img.save(filename, 'PNG')
    print(f"Created {filename}")

# Create gray icons (no dot - original state)
def create_gray_icons(base_img, size, filename):
    img = base_img.copy()
    img = img.resize((size, size), Image.Resampling.LANCZOS)
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Convert to grayscale for "inactive" look
    gray_img = img.convert('L').convert('RGBA')
    
    # Blend original with grayscale for subtle effect
    img = Image.blend(img, gray_img, 0.5)
    
    img.save(filename, 'PNG')
    print(f"Created {filename}")

# Gray icons (inactive/installed)
create_gray_icons(base_icon, 16, 'icon-gray-16.png')
create_gray_icons(base_icon, 48, 'icon-gray-48.png')
create_gray_icons(base_icon, 128, 'icon-gray-128.png')

# Red icons (foreign language detected)
red = (220, 50, 50, 255)
create_icon_with_dot(base_icon, 16, red, 'icon-red-16.png')
create_icon_with_dot(base_icon, 48, red, 'icon-red-48.png')
create_icon_with_dot(base_icon, 128, red, 'icon-red-128.png')

# Green icons (translated)
green = (50, 180, 50, 255)
create_icon_with_dot(base_icon, 16, green, 'icon-green-16.png')
create_icon_with_dot(base_icon, 48, green, 'icon-green-48.png')
create_icon_with_dot(base_icon, 128, green, 'icon-green-128.png')

print("\nAll custom icons created successfully!")
print("Gray icons: Original with grayscale effect (inactive)")
print("Red icons: Original with red dot (foreign language detected)")
print("Green icons: Original with green dot (translated)")
